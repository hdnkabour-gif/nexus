<?php
// Stored in NEXUS as evidence; COPY into Pneumatiques-MOUHIM/zz_race/ and run against a disposable DB. See RUNBOOK.md.
// NEXUS diagnostic racer: waits for a shared start time, then confirms one draft fully on credit.
[$_, $saleId, $sellerId, $startAt] = $argv;
require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
use App\Actions\Sales\ConfirmSaleAction; use App\Models\{Sale, User};
$sale = Sale::query()->findOrFail($saleId); $seller = User::query()->findOrFail($sellerId);
while (microtime(true) < (float) $startAt) { usleep(200); }
try { $s = app(ConfirmSaleAction::class)->execute($sale, [], $seller); echo json_encode(['sale' => $saleId, 'result' => 'CONFIRMED', 'credit' => $s->credit_cents]); }
catch (Throwable $e) { echo json_encode(['sale' => $saleId, 'result' => 'REFUSED', 'error' => class_basename($e)]); }
