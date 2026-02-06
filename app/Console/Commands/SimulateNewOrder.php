<?php

namespace App\Console\Commands;

use App\Events\NewOrderPlaced;
use App\Models\Order;
use App\Models\Product;
use App\Services\OrderService;
use Illuminate\Console\Command;

class SimulateNewOrder extends Command
{
    protected $signature = 'order:simulate {--broadcast-only : Only broadcast event without creating order}';

    protected $description = 'Simulate a new order for testing real-time notifications';

    public function handle(OrderService $orderService): int
    {
        if ($this->option('broadcast-only')) {
            // Just broadcast a fake order event
            $fakeOrder = new Order();
            $fakeOrder->id = 99999;
            $fakeOrder->order_number = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            $fakeOrder->customer_name = 'Test Customer';
            $fakeOrder->customer_phone = '0123456789';
            $fakeOrder->delivery_address = '123 Test Street';
            $fakeOrder->subtotal = 100.00;
            $fakeOrder->delivery_fee = 30.00;
            $fakeOrder->total = 130.00;
            $fakeOrder->status = \App\Enums\OrderStatus::PENDING;
            $fakeOrder->created_at = now();

            // Manually set items count for broadcast
            $fakeOrder->setRelation('items', collect([
                (object)['id' => 1],
                (object)['id' => 2],
            ]));

            event(new NewOrderPlaced($fakeOrder));

            $this->info("Broadcasted fake order event: #{$fakeOrder->order_number}");
            return self::SUCCESS;
        }

        // Create a real test order
        $product = Product::with('sizes')->first();

        if (!$product || $product->sizes->isEmpty()) {
            $this->error('No products with sizes found. Please seed the database first.');
            return self::FAILURE;
        }

        $testNames = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'David Brown'];
        $testAddresses = [
            '123 Main Street, Sandton',
            '456 Oak Avenue, Rosebank',
            '789 Pine Road, Bryanston',
            '321 Maple Lane, Fourways',
        ];

        $data = [
            'customer_name' => $testNames[array_rand($testNames)],
            'customer_phone' => '0' . rand(71, 84) . rand(1000000, 9999999),
            'delivery_address' => $testAddresses[array_rand($testAddresses)],
            'payment_method' => 'cash',
            'notes' => 'Test order - please ignore',
            'items' => [
                [
                    'product_size_id' => $product->sizes->first()->id,
                    'quantity' => rand(1, 3),
                ],
            ],
        ];

        $order = $orderService->createOrder($data);

        $this->info("Created test order: #{$order->order_number}");
        $this->info("Total: R{$order->total}");
        $this->info("Customer: {$order->customer_name}");

        return self::SUCCESS;
    }
}
