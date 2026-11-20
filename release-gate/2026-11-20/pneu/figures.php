<?php
// Business figures of whatever database the container points at (source or restored copy).
use App\Models\{Customer, Expense, Product, Site, StockLevel, Transfer};
use App\Services\Money\CashRegister;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Storage;
require '/app/vendor/autoload.php';
$app = require '/app/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
$p = Product::query()->where('name', 'TEST Pneu 205/55 R16')->firstOrFail();
$stock = []; foreach (['DEP', 'M01', 'M02'] as $code) { $s = Site::query()->where('code', $code)->firstOrFail();
    $stock[$code] = (int) StockLevel::query()->where(['product_id' => $p->id, 'site_id' => $s->id])->value('quantity'); }
$photo = Expense::query()->whereNotNull('photo')->value('photo');
echo json_encode(['database' => config('database.connections.pgsql.database'), 'stock' => $stock,
    'transfers' => Transfer::query()->orderBy('id')->get(['status'])->pluck('status')->map(fn ($s) => is_object($s) ? $s->value : $s)->all(),
    'm01_cash' => app(CashRegister::class)->summary(Site::query()->where('code', 'M01')->firstOrFail()),
    'debt' => Customer::query()->where('name', 'TEST Garage Synthétique')->firstOrFail()->outstandingCents(),
    'photo_sha256' => $photo && Storage::disk('public')->exists($photo) ? hash('sha256', Storage::disk('public')->get($photo)) : null], JSON_UNESCAPED_UNICODE), "\n";
