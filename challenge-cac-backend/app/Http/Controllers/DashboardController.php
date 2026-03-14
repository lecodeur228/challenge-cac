<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $totalProducts    = Product::count();
        $outOfStock       = Product::where('stock_quantity', '<=', 0)->count();
        $lowStock         = Product::whereColumn('stock_quantity', '<=', 'minimum_stock')
                                   ->where('stock_quantity', '>', 0)
                                   ->count();

        $todaySalesCount  = Sale::whereDate('sale_date', today())->count();
        $monthSalesTotal  = Sale::whereYear('sale_date', now()->year)
                                ->whereMonth('sale_date', now()->month)
                                ->sum('total_amount');

        $recentSales      = Sale::with('items.product')
                                ->orderByDesc('created_at')
                                ->limit(5)
                                ->get();

        $recentPurchases  = Purchase::with(['supplier', 'items.product'])
                                    ->orderByDesc('created_at')
                                    ->limit(5)
                                    ->get();

        $lowStockProducts = Product::with('supplier')
                                   ->whereColumn('stock_quantity', '<=', 'minimum_stock')
                                   ->orderBy('stock_quantity')
                                   ->limit(10)
                                   ->get()
                                   ->map(fn(Product $p) => array_merge($p->toArray(), ['stock_status' => $p->stock_status]));

        return response()->json([
            'total_products'     => $totalProducts,
            'out_of_stock'       => $outOfStock,
            'low_stock'          => $lowStock,
            'today_sales_count'  => $todaySalesCount,
            'month_sales_total'  => (float) $monthSalesTotal,
            'recent_sales'       => $recentSales,
            'recent_purchases'   => $recentPurchases,
            'low_stock_products' => $lowStockProducts,
        ]);
    }
}
