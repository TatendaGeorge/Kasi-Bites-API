<?php

namespace App\Enums;

enum OrderStatus: string
{
    case PENDING = 'pending';
    case CONFIRMED = 'confirmed';
    case PREPARING = 'preparing';
    case READY = 'ready';
    case OUT_FOR_DELIVERY = 'out_for_delivery';
    case DELIVERED = 'delivered';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::CONFIRMED => 'Confirmed',
            self::PREPARING => 'Preparing',
            self::READY => 'Ready for Pickup',
            self::OUT_FOR_DELIVERY => 'Out for Delivery',
            self::DELIVERED => 'Delivered',
            self::CANCELLED => 'Cancelled',
        };
    }

    public function canTransitionTo(OrderStatus $status): bool
    {
        return match ($this) {
            self::PENDING => in_array($status, [self::CONFIRMED, self::CANCELLED]),
            self::CONFIRMED => in_array($status, [self::PREPARING, self::CANCELLED]),
            self::PREPARING => in_array($status, [self::READY, self::CANCELLED]),
            self::READY => in_array($status, [self::OUT_FOR_DELIVERY, self::CANCELLED]),
            self::OUT_FOR_DELIVERY => in_array($status, [self::DELIVERED, self::CANCELLED]),
            self::DELIVERED, self::CANCELLED => false,
        };
    }
}
