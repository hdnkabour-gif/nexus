<?php
// TEMPORARY diagnostic for NEXUS docs/33 (AQ-PM-01, PM-S09, PM-S10). Synthetic data only; not committed.
use App\Actions\Money\CustomerAccountActions;
use App\Actions\Sales\ConfirmSaleAction;
use App\Actions\Sales\CreateCreditNoteAction;
use App\Actions\Sales\SaveSaleDraftAction;
use App\Enums\RefundMethod;
use App\Enums\RoleName;
use App\Enums\StockMovementType;
use App\Exceptions\BusinessRuleException;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Sale;
use App\Models\StockLevel;
use App\Services\Stock\StockService;

beforeEach(function () {
    $this->seller = userWithRole(RoleName::Seller, 'M01');
    $this->p = Product::factory()->tyre()->create(['price_retail_cents' => 12000, 'price_pro_cents' => 12000]);
    app(StockService::class)->receive($this->p, site('M01'), 10, 6000, StockMovementType::PurchaseReceipt);
    $this->level = fn () => StockLevel::query()->where(['product_id' => $this->p->id, 'site_id' => site('M01')->id])->value('quantity');
    $this->c = Customer::factory()->company()->create();
    $this->sell = function (int $qty, array $payments) {
        $draft = app(SaveSaleDraftAction::class)->execute(['site_id' => site('M01')->id, 'customer_id' => $this->c->id, 'lines' => [['product_id' => $this->p->id, 'quantity' => $qty]]], $this->seller);
        return app(ConfirmSaleAction::class)->execute($draft, $payments, $this->seller);
    };
});

it('AQ-PM-01: 2 x 120, pay 100 cash, return 1 to account => net 120, cash 100, debt 20, one piece out', function () {
    $inv = ($this->sell)(2, [['method' => 'cash', 'amount_cents' => 10000]]);
    $note = app(CreateCreditNoteAction::class)->request($inv, [$inv->lines->first()->id => ['quantity' => 1, 'restock' => true]], RefundMethod::Account, 'TEST retour', owner());
    $obs = ['invoice_ttc' => $inv->fresh()->total_ttc_cents, 'paid' => $inv->fresh()->paid_cents, 'note_ttc' => $note?->total_ttc_cents, 'outstanding' => $this->c->fresh()->outstandingCents(), 'stock' => ($this->level)(), 'cash_payments' => Payment::query()->where('method', 'cash')->sum('amount_cents')];
    fwrite(STDERR, 'AQ-PM-01 OBSERVED '.json_encode($obs).PHP_EOL);
    expect($obs['invoice_ttc'])->toBe(24000)->and($obs['note_ttc'])->toBe(12000)->and($obs['outstanding'])->toBe(2000)
        ->and($obs['stock'])->toBe(9)->and((int) $obs['cash_payments'])->toBe(10000);
});

it('PM-S09 4a: cumulative over-return 1 + 2 + 2 > 4 is refused at the third request', function () {
    $inv = ($this->sell)(4, [['method' => 'card', 'amount_cents' => 48000]]);
    $line = $inv->lines->first()->id;
    $cn = app(CreateCreditNoteAction::class);
    $cn->request($inv, [$line => ['quantity' => 1, 'restock' => true]], RefundMethod::Account, 'TEST r1', owner());
    $cn->request($inv->fresh(), [$line => ['quantity' => 2, 'restock' => true]], RefundMethod::Account, 'TEST r2', owner());
    $third = null; try { $cn->request($inv->fresh(), [$line => ['quantity' => 2, 'restock' => true]], RefundMethod::Account, 'TEST r3', owner()); $third = 'ACCEPTED'; } catch (BusinessRuleException $e) { $third = 'REFUSED'; }
    $returned = Sale::query()->with('lines')->where('kind', 'credit_note')->where('original_sale_id', $inv->id)->get()->sum(fn ($n) => $n->lines->sum('quantity'));
    fwrite(STDERR, 'PM-S09-4a OBSERVED '.json_encode(['third' => $third, 'returned_qty' => $returned, 'stock' => ($this->level)()]).PHP_EOL);
    expect($third)->toBe('REFUSED')->and((int) $returned)->toBe(3)->and(($this->level)())->toBe(9);
});

it('PM-S10 4/5: overpayment and negative/zero payment are refused', function () {
    ($this->sell)(1, [['method' => 'card', 'amount_cents' => 2000]]); // debt 100.00
    $acc = app(CustomerAccountActions::class);
    $res = [];
    foreach (['over' => 20000, 'negative' => -5000, 'zero' => 0] as $k => $amt) {
        try { $acc->receive($this->c, site('M01'), ['method' => 'card', 'amount_cents' => $amt], $this->seller); $res[$k] = 'ACCEPTED'; } catch (BusinessRuleException $e) { $res[$k] = 'REFUSED'; }
    }
    $res['outstanding'] = $this->c->fresh()->outstandingCents();
    fwrite(STDERR, 'PM-S10-4-5 OBSERVED '.json_encode($res).PHP_EOL);
    expect($res['over'])->toBe('REFUSED')->and($res['negative'])->toBe('REFUSED')->and($res['zero'])->toBe('REFUSED')->and($res['outstanding'])->toBe(10000);
});

it('PM-S10 6: the same payment submitted twice (replay) is recorded once', function () {
    ($this->sell)(1, [['method' => 'card', 'amount_cents' => 2000]]); // debt 100.00
    $acc = app(CustomerAccountActions::class);
    $acc->receive($this->c, site('M01'), ['method' => 'card', 'amount_cents' => 3000], $this->seller);
    $second = 'ACCEPTED'; try { $acc->receive($this->c, site('M01'), ['method' => 'card', 'amount_cents' => 3000], $this->seller); } catch (BusinessRuleException $e) { $second = 'REFUSED'; }
    $obs = ['second' => $second, 'payments' => Payment::query()->where('customer_id', $this->c->id)->where('amount_cents', 3000)->count(), 'outstanding' => $this->c->fresh()->outstandingCents()];
    fwrite(STDERR, 'PM-S10-6 OBSERVED '.json_encode($obs).PHP_EOL);
    expect($obs['payments'])->toBe(1); // acceptance target; no idempotency key exists in receive()
});
