<?php

namespace App\Services;

use App\Models\Order;

class DeliveryTimeCalculator
{
    private const BASE_PREPARATION_MINUTES = 15;
    private const MINUTES_PER_ITEM = 2;
    private const DELIVERY_MINUTES = 15;
    private const MAX_PREPARATION_MINUTES = 30;

    public function calculate(Order $order): \DateTime
    {
        $totalItems = $order->items->sum('quantity');

        $preparationMinutes = min(
            self::BASE_PREPARATION_MINUTES + ($totalItems * self::MINUTES_PER_ITEM),
            self::MAX_PREPARATION_MINUTES
        );

        $totalMinutes = $preparationMinutes + self::DELIVERY_MINUTES;

        return now()->addMinutes($totalMinutes);
    }
}
