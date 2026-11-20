<?php
// Business figures, readable by both versions (ea55329 and 162fe24).
use App\Models\{Customer, Product, Site, StockLevel};
use App\Services\Money\CashRegister;
use Illuminate\Contracts\Console\Kernel;
require '/app/vendor/autoload.php';
$app = require '/app/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
$m01 = Site::query()->where('code', 'M01')->firstOrFail();
$c = Customer::query()->where('name', 'TEST Garage Synthétique')->firstOrFail();
$p = Product::query()->where('name', 'TEST Pneu 205/55 R16')->firstOrFail();
echo json_encode(['revision' => trim((string) @file_get_contents('/app/REVISION')), 'summary' => app(CashRegister::class)->summary($m01),
    'debt' => $c->outstandingCents(), 'stock' => (int) StockLevel::query()->where(['product_id' => $p->id, 'site_id' => $m01->id])->value('quantity')]), "\n";
