<?php
// Synthetic books for the transfer acceptance and the backup/restore drill (NEXUS #24).
use App\Actions\Money\CustomerAccountActions;
use App\Actions\Sales\{ConfirmSaleAction, CreateCreditNoteAction, SaveSaleDraftAction};
use App\Actions\Transfers\{ReceiveTransferAction, SendTransferAction};
use App\Enums\{CustomerType, PriceLevel, ProductKind, RefundMethod, RoleName, StockMovementType, Unit};
use App\Models\{Category, Customer, Product, Site, User};
use App\Services\Money\CashRegister;
use App\Services\Stock\StockService;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\{Hash, Storage};
use Illuminate\Support\Str;
require '/app/vendor/autoload.php';
$app = require '/app/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
if (config('database.connections.pgsql.host') !== 'pneu-rc-db' || config('database.connections.pgsql.database') !== 'mouhim_rc') { fwrite(STDERR, "REFUSED\n"); exit(2); }
[$dep, $m01, $m02] = [Site::query()->where('code', 'DEP')->firstOrFail(), Site::query()->where('code', 'M01')->firstOrFail(), Site::query()->where('code', 'M02')->firstOrFail()];
$mk = function (string $email, RoleName $role, Site ...$sites) {
    $u = User::query()->create(['name' => 'TEST '.$role->value, 'email' => $email, 'password' => Hash::make(Str::random(32)), 'is_active' => true, 'default_site_id' => $sites[0]->id]);
    $u->assignRole($role->value); $u->sites()->sync(array_map(fn ($s) => $s->id, $sites)); return $u;
};
$store = $mk('store.rc@example.test', RoleName::Storekeeper, $dep);
$seller = $mk('seller.rc@example.test', RoleName::Seller, $m01);
$manager = $mk('manager.rc@example.test', RoleName::SiteManager, $m01);
$owner = User::query()->where('email', 'owner.rc@example.test')->firstOrFail();
$tyre = Product::query()->create(['kind' => ProductKind::Goods, 'category_id' => Category::query()->where('name', 'Tourisme')->value('id'),
    'name' => 'TEST Pneu 205/55 R16', 'unit' => Unit::Piece, 'price_retail_cents' => 12000, 'price_pro_cents' => 12000, 'is_active' => true]);
app(StockService::class)->receive($tyre, $dep, 30, 6000, StockMovementType::PurchaseReceipt, $store, 'TEST réception dépôt');
// Transfers: DEP → M01 10 received in full; DEP → M02 5 sent, 4 received (1 missing, with a reason).
$t1 = app(SendTransferAction::class)->execute($dep, $m01, [$tyre->id => 10], $store);
app(ReceiveTransferAction::class)->execute($t1, $owner);
$t2 = app(SendTransferAction::class)->execute($dep, $m02, [$tyre->id => 5], $store);
$line = $t2->lines()->firstOrFail();
app(ReceiveTransferAction::class)->execute($t2, $owner, [$line->id => 4], [$line->id => 'TEST un pneu manquant à la réception']);
// Sale at M01, refund on account, keyed receipt, expense with a photo (an uploaded file to restore).
$c = Customer::query()->create(['type' => CustomerType::Company, 'name' => 'TEST Garage Synthétique', 'phone' => '0600000099',
    'ice' => '000000000000099', 'price_level' => PriceLevel::Pro, 'credit_limit_cents' => 1000000, 'is_active' => true]);
app(CashRegister::class)->setFloat($m01, 5000, $manager);
$d = app(SaveSaleDraftAction::class)->execute(['site_id' => $m01->id, 'customer_id' => $c->id, 'lines' => [['product_id' => $tyre->id, 'quantity' => 2]]], $seller);
$inv = app(ConfirmSaleAction::class)->execute($d, [['method' => 'cash', 'amount_cents' => 10000]], $seller)->fresh('lines');
app(CreateCreditNoteAction::class)->request($inv, [$inv->lines->first()->id => ['quantity' => 1, 'restock' => true]], RefundMethod::Account, 'TEST retour', $owner);
app(CustomerAccountActions::class)->receive($c, $m01, ['method' => 'cash', 'amount_cents' => 1000, 'idempotency_key' => 'rc-drill-'.Str::random(10)], $seller);
$img = imagecreatetruecolor(32, 32); imagefill($img, 0, 0, imagecolorallocate($img, 200, 30, 30)); ob_start(); imagejpeg($img); $jpg = ob_get_clean();
// Since the private-receipts fix the cash desk stores receipts on the private "documents" disk.
$receiptDisk = config('filesystems.disks.documents') ? 'documents' : 'public';
Storage::disk($receiptDisk)->put('expenses/test-rc-ticket.jpg', $jpg);
app(CashRegister::class)->addExpense($m01, ['category' => 'other', 'amount_cents' => 500, 'description' => 'TEST dépense', 'photo' => 'expenses/test-rc-ticket.jpg'], $seller);
echo "books written\n";
