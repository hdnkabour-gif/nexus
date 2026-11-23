<?php
// Synthetic books written by the CURRENTLY DEPLOYED version (ea55329), before the upgrade rehearsal.
use App\Actions\Money\CustomerAccountActions;
use App\Actions\Sales\ConfirmSaleAction;
use App\Actions\Sales\CreateCreditNoteAction;
use App\Actions\Sales\SaveSaleDraftAction;
use App\Enums\{CustomerType, PriceLevel, ProductKind, RefundMethod, RoleName, StockMovementType, Unit};
use App\Models\{Category, Customer, Product, Site, User};
use App\Services\Money\CashRegister;
use App\Services\Stock\StockService;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
require '/app/vendor/autoload.php';
$app = require '/app/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
if (config('database.connections.pgsql.host') !== 'pneu-rc-db') { fwrite(STDERR, "REFUSED\n"); exit(2); }
$m01 = Site::query()->where('code', 'M01')->firstOrFail();
$mk = function (string $email, RoleName $role) use ($m01) {
    $u = User::query()->create(['name' => 'TEST '.$role->value, 'email' => $email, 'password' => Hash::make(Str::random(32)), 'is_active' => true, 'default_site_id' => $m01->id]);
    $u->assignRole($role->value); $u->sites()->sync([$m01->id]); return $u;
};
$seller = $mk('seller.rc@example.test', RoleName::Seller);
$manager = $mk('manager.rc@example.test', RoleName::SiteManager);
$owner = User::query()->where('email', 'owner.rc@example.test')->firstOrFail();
$tyre = Product::query()->create(['kind' => ProductKind::Goods, 'category_id' => Category::query()->where('name', 'Tourisme')->value('id'),
    'name' => 'TEST Pneu 205/55 R16', 'unit' => Unit::Piece, 'price_retail_cents' => 12000, 'price_pro_cents' => 12000, 'is_active' => true]);
app(StockService::class)->receive($tyre, $m01, 4, 6000, StockMovementType::PurchaseReceipt, $manager, 'TEST réception');
$c = Customer::query()->create(['type' => CustomerType::Company, 'name' => 'TEST Garage Synthétique', 'phone' => '0600000099',
    'ice' => '000000000000099', 'price_level' => PriceLevel::Pro, 'credit_limit_cents' => 1000000, 'is_active' => true]);
app(CashRegister::class)->setFloat($m01, 5000, $manager);
$d = app(SaveSaleDraftAction::class)->execute(['site_id' => $m01->id, 'customer_id' => $c->id, 'lines' => [['product_id' => $tyre->id, 'quantity' => 2]]], $seller);
$inv = app(ConfirmSaleAction::class)->execute($d, [['method' => 'cash', 'amount_cents' => 10000]], $seller)->fresh('lines');
app(CreateCreditNoteAction::class)->request($inv, [$inv->lines->first()->id => ['quantity' => 1, 'restock' => true]], RefundMethod::Account, 'TEST retour', $owner);
app(CustomerAccountActions::class)->receive($c, $m01, ['method' => 'cash', 'amount_cents' => 1000], $seller);   // pre-#23 receipt, no key
// A receipt exactly as the deployed version stores it: on the PUBLIC disk (the exposure the release removes).
Illuminate\Support\Facades\Storage::disk('public')->put('expenses/test-old-receipt.jpg', 'TEST-RECEIPT-'.str_repeat('x', 64));
app(CashRegister::class)->addExpense($m01, ['category' => 'other', 'amount_cents' => 500, 'description' => 'TEST dépense', 'photo' => 'expenses/test-old-receipt.jpg'], $seller);
echo "populated\n";
