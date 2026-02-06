<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case CASH = 'cash';
    case CARD = 'card';

    public function label(): string
    {
        return match ($this) {
            self::CASH => 'Cash on Delivery',
            self::CARD => 'Card Payment',
        };
    }
}
