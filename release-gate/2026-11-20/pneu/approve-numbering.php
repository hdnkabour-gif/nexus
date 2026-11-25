<?php
// Synthetic rehearsal only: the owner step "approve the exact first invoice number" (#20).
// Prints the approved number. Never run against a company database.
use Illuminate\Contracts\Console\Kernel;
require '/app/vendor/autoload.php';
$app = require '/app/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
echo app(\App\Services\InvoiceNumberingApproval::class)->approve(null), "\n";
