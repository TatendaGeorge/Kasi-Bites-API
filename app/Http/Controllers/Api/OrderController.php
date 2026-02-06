<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class OrderController extends Controller
{
    public function __construct(
        private OrderService $orderService
    ) {}

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Manually check for authentication since this is a public route
        // that also supports authenticated users
        $userId = null;
        $bearerToken = $request->bearerToken();

        if ($bearerToken) {
            $token = PersonalAccessToken::findToken($bearerToken);
            if ($token) {
                $userId = $token->tokenable_id;
            }
        }

        $data['user_id'] = $userId;

        $order = $this->orderService->createOrder($data);

        return response()->json([
            'message' => 'Order placed successfully',
            'order' => new OrderResource($order),
        ], 201);
    }

    public function show(string $orderNumber): JsonResponse
    {
        $order = Order::with(['items.addons', 'statusHistories'])
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        return response()->json([
            'order' => new OrderResource($order),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = min($request->input('per_page', 10), 100); // Max 100 per page

        $orders = $request->user()
            ->orders()
            ->with(['items.addons', 'statusHistories'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'orders' => OrderResource::collection($orders),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): JsonResponse
    {
        try {
            $newStatus = OrderStatus::from($request->status);
            $order = $this->orderService->updateStatus($order, $newStatus, $request->notes);

            return response()->json([
                'message' => 'Order status updated',
                'order' => new OrderResource($order),
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
