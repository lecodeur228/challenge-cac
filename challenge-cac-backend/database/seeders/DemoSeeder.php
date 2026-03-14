<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockMovement;
use Carbon\Carbon;

class DemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Fournisseurs
        $supplier1 = Supplier::create([
            'name' => 'Tech Imports CI',
            'phone' => '+225 0700000000',
            'email' => 'contact@techimports.ci',
            'address' => 'Abidjan, Marcory',
        ]);

        $supplier2 = Supplier::create([
            'name' => 'Bureau & Co.',
            'phone' => '+225 0500000000',
            'email' => 'info@bureau-co.com',
            'address' => 'Abidjan, Plateau',
        ]);

        // 2. Produits
        $product1 = Product::create([
            'name' => 'Ordinateur Portable HP Core i7',
            'sku' => 'LAP-HP-001',
            'description' => 'HP Envy 15 pouces, 16Go RAM, 512Go SSD',
            'purchase_price' => 350000,
            'selling_price' => 450000,
            'stock_quantity' => 0,
            'minimum_stock' => 5,
            'supplier_id' => $supplier1->id,
        ]);

        $product2 = Product::create([
            'name' => 'Souris Sans Fil Logitech',
            'sku' => 'MOU-LOG-001',
            'description' => 'Souris ergonomique Bluetooth',
            'purchase_price' => 8000,
            'selling_price' => 15000,
            'stock_quantity' => 0,
            'minimum_stock' => 20,
            'supplier_id' => $supplier1->id,
        ]);

        $product3 = Product::create([
            'name' => 'Ramette Papier A4',
            'sku' => 'PAP-A4-001',
            'description' => 'Carton de 5 ramettes (500 feuilles/ramette)',
            'purchase_price' => 15000,
            'selling_price' => 22000,
            'stock_quantity' => 0,
            'minimum_stock' => 10,
            'supplier_id' => $supplier2->id,
        ]);

        $product4 = Product::create([
            'name' => 'Clé USB 64Go SanDisk',
            'sku' => 'USB-SAN-64',
            'description' => 'Clé USB 3.0 ultra rapide',
            'purchase_price' => 4000,
            'selling_price' => 8000,
            'stock_quantity' => 0,
            'minimum_stock' => 15,
            'supplier_id' => $supplier1->id,
        ]);

        // 3. Achats (Générer du stock)
        
        // Achat 1 (il y a 10 jours)
        $purchase1 = Purchase::create([
            'supplier_id' => $supplier1->id,
            'purchase_date' => Carbon::now()->subDays(10),
            'total_amount' => (10 * 350000) + (50 * 8000) + (100 * 4000), 
        ]);

        $this->createPurchaseItem($purchase1, $product1, 10, 350000);
        $this->createPurchaseItem($purchase1, $product2, 50, 8000);
        $this->createPurchaseItem($purchase1, $product4, 100, 4000);

        // Achat 2 (il y a 5 jours)
        $purchase2 = Purchase::create([
            'supplier_id' => $supplier2->id,
            'purchase_date' => Carbon::now()->subDays(5),
            'total_amount' => 20 * 15000, 
        ]);

        $this->createPurchaseItem($purchase2, $product3, 20, 15000);

        // 4. Ventes (Diminuer le stock)
        
        // Vente 1 (il y a 2 jours)
        $sale1 = Sale::create([
            'sale_date' => Carbon::now()->subDays(2),
            'total_amount' => (2 * 450000) + (5 * 15000), 
        ]);

        $this->createSaleItem($sale1, $product1, 2, 450000);
        $this->createSaleItem($sale1, $product2, 5, 15000);

        // Vente 2 (Hier)
        $sale2 = Sale::create([
            'sale_date' => Carbon::now()->subDays(1),
            'total_amount' => (1 * 450000) + (10 * 8000) + (5 * 22000),
        ]);

        $this->createSaleItem($sale2, $product1, 1, 450000);
        $this->createSaleItem($sale2, $product4, 10, 8000);
        $this->createSaleItem($sale2, $product3, 5, 22000);
        
        // Vente 3 (Aujourd'hui)
        $sale3 = Sale::create([
            'sale_date' => Carbon::now(),
            'total_amount' => 2 * 15000,
        ]);
        
        $this->createSaleItem($sale3, $product2, 2, 15000);
        
        // Générer une "Rupture de stock" sur le produit 1
        // Stock actuel produit 1 = 10 - 2 - 1 = 7. Produit mis en rupture:
        $sale4 = Sale::create([
            'sale_date' => Carbon::now(),
            'total_amount' => (7 * 450000),
        ]);
        $this->createSaleItem($sale4, $product1, 7, 450000);
        
        // Générer un "Stock faible" sur le produit 3
        // Stock actuel produit 3 = 20 - 5 = 15. Minimum = 10.
        // Vente de 10 -> reste 5, ce qui est sous le minimum.
        $sale5 = Sale::create([
            'sale_date' => Carbon::now(),
            'total_amount' => (10 * 22000),
        ]);
        $this->createSaleItem($sale5, $product3, 10, 22000);
    }

    private function createPurchaseItem($purchase, $product, $quantity, $unitPrice)
    {
        $product->refresh();
        $stockBefore = $product->stock_quantity;
        
        PurchaseItem::create([
            'purchase_id' => $purchase->id,
            'product_id' => $product->id,
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'total_price' => $quantity * $unitPrice,
        ]);

        $product->increment('stock_quantity', $quantity);

        StockMovement::create([
            'product_id' => $product->id,
            'type' => 'purchase',
            'quantity' => $quantity,
            'stock_before' => $stockBefore,
            'stock_after' => $stockBefore + $quantity,
            'reference_id' => $purchase->id,
            'created_at' => clone $purchase->purchase_date,
        ]);
    }

    private function createSaleItem($sale, $product, $quantity, $unitPrice)
    {
        $product->refresh();
        $stockBefore = $product->stock_quantity;
        
        SaleItem::create([
            'sale_id' => $sale->id,
            'product_id' => $product->id,
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'total_price' => $quantity * $unitPrice,
        ]);

        $product->decrement('stock_quantity', $quantity);

        StockMovement::create([
            'product_id' => $product->id,
            'type' => 'sale',
            'quantity' => $quantity,
            'stock_before' => $stockBefore,
            'stock_after' => $stockBefore - $quantity,
            'reference_id' => $sale->id,
            'created_at' => clone $sale->sale_date,
        ]);
    }
}
