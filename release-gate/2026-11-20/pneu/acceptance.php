<?php

// PNEU release-candidate acceptance (NEXUS #24, gate "PNEU operational acceptance").
// Runs INSIDE the release-candidate image against its own isolated, freshly migrated database.
// Synthetic data only (example.test); no mail, payment, carrier or backup leaves the container.

use App\Actions\Money\CustomerAccountActions;
use App\Actions\Sales\ConfirmSaleAction;
use App\Actions\Sales\CreateCreditNoteAction;
use App\Actions\Sales\SaveSaleDraftAction;
use App\Enums\CustomerType;
use App\Enums\PriceLevel;
use App\Enums\ProductKind;
use App\Enums\RefundMethod;
use App\Enums\RoleName;
use App\Enums\StockMovementType;
use App\Enums\Unit;
use App\Exceptions\BusinessRuleException;
use App\Models\Activity;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Site;
use App\Models\StockLevel;
use App\Models\User;
use App\Services\Money\CashRegister;
use App\Services\Stock\StockService;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

require '/app/vendor/autoload.php';
$app = require '/app/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$checks = [];
$ok = true;
$check = function (string $name, $actual, $expected) use (&$checks, &$ok) {
    $pass = $actual === $expected;
    $ok = $ok && $pass;
    $checks[] = ['check' => $name, 'expected' => $expected, 'actual' => $actual, 'pass' => $pass];
};

// Isolation guard: never run against anything but the disposable acceptance database.
if (config('database.connections.pgsql.host') !== 'pneu-rc-db' || config('database.connections.pgsql.database') !== 'mouhim_rc') {
    fwrite(STDERR, "REFUSED: not the isolated acceptance database\n");
    exit(2);
}

$revision = trim((string) @file_get_contents('/app/REVISION'));
$m01 = Site::query()->where('code', 'M01')->firstOrFail();
$mkUser = function (string $email, RoleName $role, Site ...$sites) {
    $u = User::query()->create(['name' => 'TEST '.$role->value, 'email' => $email, 'password' => Hash::make(Str::random(32)),
        'is_active' => true, 'default_site_id' => $sites[0]->id]);
    $u->assignRole($role->value);
    $u->sites()->sync(array_map(fn (Site $s) => $s->id, $sites));

    return $u;
};
$seller = $mkUser('seller.rc@example.test', RoleName::Seller, $m01);
$manager = $mkUser('manager.rc@example.test', RoleName::SiteManager, $m01);
$owner = User::query()->where('email', 'owner.rc@example.test')->firstOrFail(); // created by the entrypoint from OWNER_*

$tyre = Product::query()->create(['kind' => ProductKind::Goods, 'category_id' => Category::query()->where('name', 'Tourisme')->value('id'),
    'name' => 'TEST Pneu 205/55 R16', 'unit' => Unit::Piece, 'price_retail_cents' => 12000, 'price_pro_cents' => 12000, 'is_active' => true]);
app(StockService::class)->receive($tyre, $m01, 4, 6000, StockMovementType::PurchaseReceipt, $manager, 'TEST réception');
$stock = fn () => (int) StockLevel::query()->where(['product_id' => $tyre->id, 'site_id' => $m01->id])->value('quantity');
$customer = Customer::query()->create(['type' => CustomerType::Company, 'name' => 'TEST Garage Synthétique', 'phone' => '0600000099',
    'ice' => '000000000000099', 'price_level' => PriceLevel::Pro, 'credit_limit_cents' => 1000000, 'is_active' => true]);

// Scenario: sale 240, paid 100 cash, credit note 120 on account ⇒ cash 100 / debt 20 / one tyre net deducted.
$draft = app(SaveSaleDraftAction::class)->execute(['site_id' => $m01->id, 'customer_id' => $customer->id,
    'lines' => [['product_id' => $tyre->id, 'quantity' => 2]]], $seller);
$check('sale total TTC (2 tyres)', $draft->total_ttc_cents, 24000);
$invoice = app(ConfirmSaleAction::class)->execute($draft, [['method' => 'cash', 'amount_cents' => 10000]], $seller)->fresh('lines');
$check('stock after sale', $stock(), 2);
app(CreateCreditNoteAction::class)->request($invoice, [$invoice->lines->first()->id => ['quantity' => 1, 'restock' => true]],
    RefundMethod::Account, 'TEST retour un pneu', $owner);
$cash = app(CashRegister::class);
$check('cash of the day', $cash->summary($m01)['cash_in'], 10000);
$check('customer debt', $customer->fresh()->outstandingCents(), 2000);
$check('one tyre net deducted (4 − 2 + 1)', $stock(), 3);

// Idempotent receipt: the same submission twice posts once.
$key = 'rc-accept-'.Str::random(12);
$p1 = app(CustomerAccountActions::class)->receive($customer, $m01, ['method' => 'cash', 'amount_cents' => 2000, 'idempotency_key' => $key], $seller);
$p2 = app(CustomerAccountActions::class)->receive($customer, $m01, ['method' => 'cash', 'amount_cents' => 2000, 'idempotency_key' => $key], $seller);
$check('retried receipt returns the same payment', $p2->id, $p1->id);
$check('payments with that key', Payment::query()->where('idempotency_key', $key)->count(), 1);
$check('debt after receipt', $customer->fresh()->outstandingCents(), 0);

// Close the day; a new cash operation afterwards is refused; the close is audited.
$day = $cash->close($m01, 12000, null, $manager);
$check('expected at close (100 + 20)', $day->expected_cents, 12000);
$check('difference at close', $day->difference_cents, 0);
$refused = false;
try {
    $cash->addExpense($m01, ['category' => 'other', 'amount_cents' => 500, 'description' => 'TEST après clôture'], $seller);
} catch (BusinessRuleException) {
    $refused = true;
}
$check('cash expense after close refused', $refused, true);
$check('close audited', Activity::query()->where('event', 'cash_closed')->count(), 1);

// The worker (separate container, same image) consumes the queue.
dispatch(function () {
    DB::table('cache')->insert(['key' => 'rc-worker-ok', 'value' => 'ok', 'expiration' => time() + 600]);
});
$deadline = time() + 60;
while (time() < $deadline && ! DB::table('cache')->where('key', 'rc-worker-ok')->exists()) {
    usleep(500000);
}
$check('queued job handled by the worker container', DB::table('cache')->where('key', 'rc-worker-ok')->exists(), true);
$check('failed jobs', DB::table('failed_jobs')->count(), 0);

echo json_encode(['revision' => $revision, 'ok' => $ok, 'checks' => $checks], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), "\n";
exit($ok ? 0 : 1);
