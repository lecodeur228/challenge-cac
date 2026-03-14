<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'name', 'description', 'sku', 'purchase_price',
        'selling_price', 'stock_quantity', 'minimum_stock', 'supplier_id',
    ];

    protected $casts = [
        'purchase_price' => 'decimal:2',
        'selling_price'  => 'decimal:2',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function getStockStatusAttribute(): string
    {
        if ($this->stock_quantity <= 0) return 'out_of_stock';
        if ($this->stock_quantity <= $this->minimum_stock) return 'low_stock';
        return 'in_stock';
    }
}
