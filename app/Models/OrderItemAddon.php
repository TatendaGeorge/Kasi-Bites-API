<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItemAddon extends Model
{
    protected $fillable = [
        'order_item_id',
        'addon_id',
        'addon_name',
        'addon_price',
        'quantity',
    ];

    protected $casts = [
        'addon_price' => 'decimal:2',
        'quantity' => 'integer',
    ];

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function addon(): BelongsTo
    {
        return $this->belongsTo(Addon::class);
    }

    public function getTotalPriceAttribute(): float
    {
        return $this->addon_price * $this->quantity;
    }
}
