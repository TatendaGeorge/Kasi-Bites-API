<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\AdminOrderResource;
use App\Models\Order;
use App\Enums\OrderStatus;
use App\Events\OrderStatusUpdated;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class AdminOrderController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Order::with(['user', 'items']);

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search by order number or customer name
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        // Date range filter
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $orders = $query->latest()->paginate($request->per_page ?? 15);

        return AdminOrderResource::collection($orders);
    }

    /**
     * Get today's active orders (not delivered or cancelled) for Kanban board
     */
    public function active(): JsonResponse
    {
        $orders = Order::with(['user', 'items'])
            ->whereDate('created_at', today())
            ->whereNotIn('status', [OrderStatus::DELIVERED, OrderStatus::CANCELLED])
            ->latest()
            ->get();

        return response()->json([
            'orders' => AdminOrderResource::collection($orders),
        ]);
    }

    public function show(Order $order): AdminOrderResource
    {
        $order->load(['user', 'items', 'statusHistories']);

        return new AdminOrderResource($order);
    }

    public function update(Request $request, Order $order): AdminOrderResource
    {
        $validated = $request->validate([
            'customer_name' => 'sometimes|string|max:255',
            'customer_phone' => 'sometimes|string|max:20',
            'delivery_address' => 'sometimes|string|max:500',
            'notes' => 'nullable|string|max:1000',
        ]);

        $order->update($validated);

        return new AdminOrderResource($order->fresh(['user', 'items']));
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::enum(OrderStatus::class)],
            'notes' => 'nullable|string|max:500',
        ]);

        $newStatus = OrderStatus::from($validated['status']);
        $oldStatus = $order->status;

        // Check if transition is valid (admins can force any transition)
        $order->update(['status' => $newStatus]);

        // Record status history
        $order->statusHistories()->create([
            'status' => $newStatus,
            'notes' => $validated['notes'] ?? null,
        ]);

        // Dispatch event for notifications
        event(new OrderStatusUpdated($order, $oldStatus, $newStatus));

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => new AdminOrderResource($order->fresh(['user', 'items', 'statusHistories'])),
        ]);
    }
}
