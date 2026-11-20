<?php
// TEMPORARY race setup (synthetic). Prints JSON ids.
require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
use App\Actions\Sales\SaveSaleDraftAction; use App\Enums\RoleName; use App\Enums\StockMovementType;
use App\Models\{Customer, Product, Site, User}; use App\Services\Stock\StockService;
$m01 = Site::query()->where('code', 'M01')->firstOrFail();
$seller = User::factory()->role(RoleName::Seller)->forSites($m01)->create();
$p = Product::factory()->tyre()->create(['price_retail_cents' => 70000, 'price_pro_cents' => 70000]);
app(StockService::class)->receive($p, $m01, 10, 30000, StockMovementType::PurchaseReceipt);
$c = Customer::factory()->company(100000)->create(); // ceiling 1,000.00 MAD
$d = fn () => app(SaveSaleDraftAction::class)->execute(['site_id' => $m01->id, 'customer_id' => $c->id, 'lines' => [['product_id' => $p->id, 'quantity' => 1]]], $seller)->id;
echo json_encode(['seller' => $seller->id, 'customer' => $c->id, 'a' => $d(), 'b' => $d()]);
