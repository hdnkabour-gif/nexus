<?php
// #29 topology proof: real HTTP kernel requests to the receipt route, as guest / other-site / same-site user.
use App\Enums\RoleName;
use App\Models\{Expense, Site, User};
use Illuminate\Contracts\Http\Kernel as HttpKernel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, Hash};
use Illuminate\Support\Str;
require '/app/vendor/autoload.php';
$app = require '/app/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
if (config('database.connections.pgsql.host') !== 'pneu-rc-db') { fwrite(STDERR, "REFUSED\n"); exit(2); }
$expense = Expense::query()->whereNotNull('photo')->firstOrFail();
$other = User::query()->firstOrCreate(['email' => 'seller.m02.rc@example.test'], ['name' => 'TEST M02', 'password' => Hash::make(Str::random(32)), 'is_active' => true, 'default_site_id' => Site::query()->where('code', 'M02')->value('id')]);
$other->assignRole(RoleName::Seller->value); $other->sites()->sync([Site::query()->where('code', 'M02')->value('id')]);
$same = User::query()->where('email', 'seller.rc@example.test')->firstOrFail();
$kernel = $app->make(HttpKernel::class);
$hit = function (?User $u) use ($kernel, $expense, $app) {
    Auth::forgetGuards(); if ($u) { Auth::guard('web')->setUser($u); }
    $res = $kernel->handle(Request::create('/admin/expenses/'.$expense->id.'/photo'));
    $body = method_exists($res, 'getFile') ? file_get_contents($res->getFile()->getPathname()) : (function () use ($res) { ob_start(); $res->sendContent(); return ob_get_clean(); })();
    return ['status' => $res->getStatusCode(), 'sha256' => $res->getStatusCode() === 200 ? hash('sha256', $body) : null, 'cache' => $res->headers->get('Cache-Control')];
};
echo json_encode(['path' => $expense->photo, 'guest' => $hit(null), 'other_site' => $hit($other), 'same_site' => $hit($same)]), "\n";
