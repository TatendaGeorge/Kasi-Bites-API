<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_number',
        'customer_name',
        'customer_phone',
        'delivery_address',
        'delivery_latitude',
        'delivery_longitude',
        'subtotal',
        'delivery_fee',
        'total',
        'status',
        'order_type',
        'payment_method',
        'notes',
        'estimated_delivery_at',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'delivery_fee' => 'decimal:2',
        'total' => 'decimal:2',
        'delivery_latitude' => 'float',
        'delivery_longitude' => 'float',
        'status' => OrderStatus::class,
        'payment_method' => PaymentMethod::class,
        'estimated_delivery_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)->orderBy('created_at', 'desc');
    }

    public static function generateOrderNumber(): string
    {
        do {
            $number = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        } while (self::where('order_number', $number)->exists());

        return $number;
    }
}
