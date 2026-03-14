<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with('supplier');

        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        $products = $query->orderBy('name')->get()->map(function (Product $p) {
            return array_merge($p->toArray(), ['stock_status' => $p->stock_status]);
        });

        return response()->json($products);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'description'    => 'nullable|string',
            'sku'            => 'required|string|max:100|unique:products,sku',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price'  => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'minimum_stock'  => 'required|integer|min:0',
            'supplier_id'    => 'nullable|exists:suppliers,id',
        ]);

        $product = Product::create($data);
        $product->load('supplier');

        return response()->json(
            array_merge($product->toArray(), ['stock_status' => $product->stock_status]),
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $product = Product::with('supplier')->findOrFail($id);
        return response()->json(
            array_merge($product->toArray(), ['stock_status' => $product->stock_status])
        );
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $data = $request->validate([
            'name'           => 'sometimes|required|string|max:255',
            'description'    => 'nullable|string',
            'sku'            => "sometimes|required|string|max:100|unique:products,sku,{$product->id}",
            'purchase_price' => 'sometimes|required|numeric|min:0',
            'selling_price'  => 'sometimes|required|numeric|min:0',
            'stock_quantity' => 'sometimes|required|integer|min:0',
            'minimum_stock'  => 'sometimes|required|integer|min:0',
            'supplier_id'    => 'nullable|exists:suppliers,id',
        ]);

        $product->update($data);
        $product->load('supplier');

        return response()->json(
            array_merge($product->toArray(), ['stock_status' => $product->stock_status])
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Produit supprimé.']);
    }
}
