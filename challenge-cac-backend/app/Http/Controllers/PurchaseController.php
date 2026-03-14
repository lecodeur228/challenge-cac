<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Purchase;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    public function index(): JsonResponse
    {
        $purchases = Purchase::with(['supplier', 'items.product'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($purchases);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'supplier_id'           => 'required|exists:suppliers,id',
            'purchase_date'         => 'required|date',
            'items'                 => 'required|array|min:1',
            'items.*.product_id'    => 'required|exists:products,id',
            'items.*.quantity'      => 'required|integer|min:1',
            'items.*.unit_price'    => 'required|numeric|min:0',
        ]);

        $purchase = DB::transaction(function () use ($data) {
            $totalAmount = 0;

            foreach ($data['items'] as $item) {
                $totalAmount += $item['quantity'] * $item['unit_price'];
            }

            $purchase = Purchase::create([
                'supplier_id'   => $data['supplier_id'],
                'purchase_date' => $data['purchase_date'],
                'total_amount'  => $totalAmount,
            ]);

            foreach ($data['items'] as $item) {
                $product     = Product::lockForUpdate()->findOrFail($item['product_id']);
                $stockBefore = $product->stock_quantity;
                $stockAfter  = $stockBefore + $item['quantity'];

                $purchase->items()->create([
                    'product_id'  => $item['product_id'],
                    'quantity'    => $item['quantity'],
                    'unit_price'  => $item['unit_price'],
                    'total_price' => $item['quantity'] * $item['unit_price'],
                ]);

                $product->update(['stock_quantity' => $stockAfter]);

                StockMovement::create([
                    'product_id'   => $item['product_id'],
                    'type'         => 'purchase',
                    'quantity'     => $item['quantity'],
                    'stock_before' => $stockBefore,
                    'stock_after'  => $stockAfter,
                    'reference_id' => $purchase->id,
                ]);
            }

            return $purchase;
        });

        return response()->json($purchase->load(['supplier', 'items.product']), 201);
    }

    public function show(int $id): JsonResponse
    {
        $purchase = Purchase::with(['supplier', 'items.product'])->findOrFail($id);

        return response()->json($purchase);
    }
}
