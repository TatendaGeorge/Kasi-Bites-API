<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Events\NewOrderPlaced;
use App\Events\OrderStatusUpdated;
use App\Models\Addon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductSize;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(
        private DeliveryTimeCalculator $deliveryTimeCalculator,
    ) {}

    public function createOrder(array $data): Order
    {
        return DB::transaction(function () use ($data) {
            $subtotal = 0;
            $items = [];

            foreach ($data['items'] as $item) {
                $productSize = ProductSize::with('product')->findOrFail($item['product_size_id']);

                // Check if product is available
                if (!$productSize->product->is_available) {
                    throw new \InvalidArgumentException(
                        "Sorry, {$productSize->product->name} is currently unavailable. Please remove it from your cart and try again."
                    );
                }

                // Calculate addon prices
                $addonIds = $item['addon_ids'] ?? [];
                $addonsTotal = 0;
                $addonDetails = [];

                if (!empty($addonIds)) {
                    $addons = Addon::whereIn('id', $addonIds)->where('is_available', true)->get();
                    $addonsTotal = $addons->sum('price');
                    $addonDetails = $addons->map(fn($a) => [
                        'addon_id' => $a->id,
                        'addon_name' => $a->name,
                        'addon_price' => $a->price,
                        'quantity' => 1,
                    ])->toArray();
                }

                $unitPrice = $productSize->price + $addonsTotal;
                $totalPrice = $unitPrice * $item['quantity'];
                $subtotal += $totalPrice;

                $items[] = [
                    'product_id' => $productSize->product_id,
                    'product_size_id' => $productSize->id,
                    'product_name' => $productSize->product->name,
                    'size' => $productSize->size,
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                    'addons' => $addonDetails,
                ];
            }

            // No delivery fee for collection orders
            $orderType = $data['order_type'] ?? 'delivery';
            $deliveryFee = $orderType === 'collection' ? 0 : config('app.delivery_fee', 30.00);
            $total = $subtotal + $deliveryFee;

            $order = Order::create([
                'user_id' => $data['user_id'] ?? null,
                'order_number' => Order::generateOrderNumber(),
                'customer_name' => $data['customer_name'],
                'customer_phone' => $data['customer_phone'],
                'delivery_address' => $data['delivery_address'],
                'delivery_latitude' => $data['delivery_latitude'] ?? null,
                'delivery_longitude' => $data['delivery_longitude'] ?? null,
                'subtotal' => $subtotal,
                'delivery_fee' => $deliveryFee,
                'total' => $total,
                'status' => OrderStatus::PENDING,
                'order_type' => $orderType,
                'payment_method' => $data['payment_method'] ?? 'cash',
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($items as $itemData) {
                $addons = $itemData['addons'] ?? [];
                unset($itemData['addons']);

                $orderItem = $order->items()->create($itemData);

                // Create order item addons
                foreach ($addons as $addonData) {
                    $orderItem->addons()->create($addonData);
                }
            }

            $order->statusHistories()->create([
                'status' => OrderStatus::PENDING,
                'notes' => 'Order placed',
            ]);

            $order->update([
                'estimated_delivery_at' => $this->deliveryTimeCalculator->calculate($order),
            ]);

            $order->load(['items.addons', 'statusHistories']);

            // Broadcast new order to admin dashboard
            event(new NewOrderPlaced($order));

            return $order;
        });
    }

    public function updateStatus(Order $order, OrderStatus $newStatus, ?string $notes = null): Order
    {
        $oldStatus = $order->status;

        if (!$oldStatus->canTransitionTo($newStatus)) {
            throw new \InvalidArgumentException(
                "Cannot transition from {$oldStatus->value} to {$newStatus->value}"
            );
        }

        $order->update(['status' => $newStatus]);

        $order->statusHistories()->create([
            'status' => $newStatus,
            'notes' => $notes,
        ]);

        event(new OrderStatusUpdated($order, $oldStatus, $newStatus));

        return $order->fresh(['items.addons', 'statusHistories']);
    }
}
