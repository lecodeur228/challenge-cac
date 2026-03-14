<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Sale;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SaleController extends Controller
{
    public function index(): JsonResponse
    {
        $sales = Sale::with('items.product')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($sales);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'sale_date'          => 'required|date',
            'items'              => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        $sale = DB::transaction(function () use ($data) {
            $totalAmount = 0;
            $errors      = [];

            // Pre-check stock for all items
            foreach ($data['items'] as $item) {
                $product = Product::find($item['product_id']);
                if ($product->stock_quantity < $item['quantity']) {
                    $errors[] = "Stock insuffisant pour « {$product->name} » (disponible : {$product->stock_quantity}).";
                }
            }

            if (!empty($errors)) {
                throw ValidationException::withMessages(['items' => $errors]);
            }

            foreach ($data['items'] as $item) {
                $totalAmount += $item['quantity'] * $item['unit_price'];
            }

            $sale = Sale::create([
                'sale_date'    => $data['sale_date'],
                'total_amount' => $totalAmount,
            ]);

            foreach ($data['items'] as $item) {
                $product     = Product::lockForUpdate()->findOrFail($item['product_id']);
                $stockBefore = $product->stock_quantity;
                $stockAfter  = $stockBefore - $item['quantity'];

                $sale->items()->create([
                    'product_id'  => $item['product_id'],
                    'quantity'    => $item['quantity'],
                    'unit_price'  => $item['unit_price'],
                    'total_price' => $item['quantity'] * $item['unit_price'],
                ]);

                $product->update(['stock_quantity' => $stockAfter]);

                StockMovement::create([
                    'product_id'   => $item['product_id'],
                    'type'         => 'sale',
                    'quantity'     => $item['quantity'],
                    'stock_before' => $stockBefore,
                    'stock_after'  => $stockAfter,
                    'reference_id' => $sale->id,
                ]);
            }

            return $sale;
        });

        return response()->json($sale->load('items.product'), 201);
    }

    public function show(int $id): JsonResponse
    {
        $sale = Sale::with('items.product')->findOrFail($id);

        return response()->json($sale);
    }
}
