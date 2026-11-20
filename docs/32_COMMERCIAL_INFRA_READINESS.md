# 32 — Commercial & Infrastructure Readiness (V1, 2026-11-20)

> مبني على Portfolio Baseline V1 ([27](27_PORTFOLIO_BASELINE_V1.md)، PR #18). **وثيقة فقط**: لا تغيير في أي نشر أو بيانات أو إعدادات Railway أو مستودع تطبيق.
> بيانات: [registry/commercial-status.v1.json](../registry/commercial-status.v1.json) · [registry/infra-cost-runrate.v1.json](../registry/infra-cost-runrate.v1.json)

## 0. مستوى الثقة في كل معلومة
| النوع | المعنى في هذه الوثيقة |
|---|---|
| **EVIDENCE** | مقروء مباشرة من Railway/GitHub/الكود في 2026-11-20 (مرجع في docs/31 أو هنا) |
| **OWNER_STATED** | قاله صاحب المشروع في المحادثة، لم يُتحقق منه بشكل مستقل (الوضع التجاري للعملاء) |
| **ESTIMATE** | حساب من بيانات EVIDENCE بفرضيات مذكورة |
| **HYPOTHESIS** | اقتراح تجاري لم يُعتمد (التسعير، الباقات) |

---

## 1. الوضع التجاري لكل تطبيق (OWNER_STATED)
المرحلة التجارية حقل **منفصل** عن الحالة التقنية في docs/27. سلم المراحل:
`IDEA → PROSPECT_INTEREST → TRIAL_LINK_SENT → ACTIVE_TRIAL → TRIAL_RESULT_DOCUMENTED → AGREEMENT → PAID_SUBSCRIPTION` (+ `PAUSED / CHURNED / REJECTED / UNKNOWN`).
قاعدة: إرسال الرابط ليس تجربة نشطة، والتجربة ليست قبولاً، والاتفاق ليس دفعاً.

| التطبيق | المرحلة | معرّف التجربة (مستعار) | الحالة التقنية (docs/27) | ما يمنع البيانات الحقيقية الآن (EVIDENCE) |
|---|---|---|---|---|
| PNEU MOUHIM | **ACTIVE_TRIAL** · OWNER_STATED · SYNTHETIC_ONLY | PILOT-PM-01 | DEPLOYED (pilot `mouhim`) | لا استرجاع مثبت من خارج Railway (R2) ولا مطابقة أرصدة (R-003؛ استرجاع داخل Railway مذكور في #13)؛ بيانات العرض ما زالت موجودة (#14)؛ بوابة P0 ‏#20؛ P1 ‏#17–#19 |
| RENT CAR | **ACTIVE_TRIAL** · OWNER_STATED · SYNTHETIC_ONLY | PILOT-RC-01 | DEPLOYED (demo) | Railway مخصص لبيانات وهمية فقط (D-030)، والإنتاج الحقيقي مقرر على جهاز الشركة (D-012)؛ صور CIN/الرخص تحتاج مراجعة CNDP؛ #14، #22 |
| TIJARA OS | PROSPECT_INTEREST ×3 | PILOT-TJ-01 ميكانيك · TJ-02 جزارة/مشوي · TJ-03 إنذار وحريق | DEPLOYED (staging، بلا بيانات حقيقية) | شروط البيانات الحقيقية 1–6 في `docs/DEPLOYMENT.md` غير مستوفاة |
| AMANZINE | IDEA (تجربة ملابس مقترحة) | PILOT-AM-01 | DEPLOYED (pre-launch) | انظر §5.4 |
| ALLOSERVIX | — (الواجهة التجارية) | — | DEPLOYED (محتوى مقيد، robots `Disallow`) | الهوية القانونية، الصفحات القانونية، موافقة الإطلاق (D-REQ-06) |
| NEXUS | — (أداة داخلية) | — | DEPLOYED | #10 MFA، #13 نسخ NEXUS |
| NEXORA / SCANFLOW / School | IDEA / UNKNOWN / IDEA | — | — | لا عميل تجريبي |
| FleetDocs AI | IDEA | — | لا كود ولا مستودع (docs/27) | يتداخل مع وثائق RENT CAR وSCANFLOW؛ لا عميل تجريبي |
| TECH PLATFORM 2M | **مستبعد** من نشاط ALLOSERVIX | — | DEPLOYED | ملك جهة العمل |

**قرار المالك 2026-11-20 (تعليق PR #19، 05:05Z):** PNEU وRENT CAR في `ACTIVE_TRIAL` لأن المالك صرّح بأن صاحبي النشاطين **يتصفحان ويجربان** التطبيقين ببيانات تجريبية فقط. هذا القرار يحل محل التعليق الأسبق الذي أبقى `TRIAL_LINK_SENT`. **لا يعني** ذلك: جلسة دخول مثبتة، ولا نجاح أي سيناريو، ولا قبولاً موقعاً، ولا استعمالاً إنتاجياً، ولا عميلاً يدفع.

**غير معروف (UNKNOWN) ويُسجل في السجل الخاص لا هنا:** الرابط الفعلي الذي أُرسل لكل عميل (لا يُستنتج من خريطة Railway)، وهل أُدخلت بيانات حقيقية، والأسعار التي ذُكرت سابقاً.

> ⚠️ **تنبيه (EVIDENCE + OWNER_STATED):** صرّح المالك في 2026-11-20 أن البيانات تجريبية فقط. يبقى هذا التنبيه سارياً إن تغيّر ذلك: إذا كان صاحب شركة الكراء أو محل العجلات قد بدأ يُدخل **بيانات زبائن حقيقية** في الروابط المرسلة، فهذا يحدث على بيئات قابليتها للاسترجاع غير مثبتة للبيانات الحقيقية: 0 نسخ لأقراص Railway، ولا استرجاع من R2. PNEU سجّل استرجاعاً واحداً ناجحاً من نسخة داخل Railway (#13). وفي حالة RENT CAR على بيئة قرر المشروع نفسه أنها للبيانات الوهمية فقط (D-030). التوصية: إبلاغ الطرفين كتابياً أن التجربة ببيانات تجريبية فقط حتى إغلاق R-003.

## 2. تكلفة التشغيل الفعلية على Railway (ESTIMATE من EVIDENCE)
**ما هذه الأرقام:** معدل استهلاك موارد Railway، مقيس على 7 أيام لخدمات تجريبية خفيفة في بيئات محددة، ومُسقط على شهر. **ليست** تكلفة إنتاج لكل عميل، **ولا** حداً أعلى مضموناً، **ولا** فاتورة. الخدمات التي أُنشئت داخل النافذة محسوبة بأقل من حقيقتها.

المصدر: `usage` لكل خدمة (snapshot S3، 03:23Z)، 7 أيام (13→20 نونبر) × 30/7، بأسعار Railway الرسمية (RAM ‏10$/GB/شهر، vCPU ‏20$/شهر، أقراص 0.15$/GB/شهر، خروج 0.05$/GB). **ليست فاتورة**؛ الخطة الحالية (Hobby/Pro) غير معروفة لهذه الجلسة. تحويل تقريبي للتخطيط فقط: **1 USD ≈ 10 MAD** (يُراجع).

| التطبيق | خدمات محسوبة | USD/شهر | ≈ MAD/شهر | ملاحظة |
|---|---|---|---|---|
| PNEU MOUHIM | pilot app + worker + Postgres-ekYj، staging app + worker + Postgres | 5.77 | ~58 | تطبيق Laravel وحده 3.12$ (أعلى خدمة في المحفظة) |
| TECH PLATFORM 2M | overflowing-vision (app+PG) + `AMANZINE` + `amanzine2` + Postgres-E8M4 | **4.46** | ~45 | ربع الإنفاق تقريباً لمشروع جهة العمل، منه نشر قديم (R-006) وخدمتان بأسماء AMANZINE |
| AMANZINE | balanced-growth + PG، amanzine-staging + PG | 3.54 | ~35 | |
| RENT CAR | demo app + Postgres، OCR staging app + PG | 2.76 | ~28 | |
| NEXUS | web + cron + PG | 0.51 | ~5 | أُنشئ 17 نونبر: مقدَّر بأقل من الحقيقي |
| NEXORA | web demo | 0.46 | ~5 | بلا قاعدة بيانات |
| ALLOSERVIX | web + SQLite volume | 0.14 | ~1 | |
| TIJARA OS | app + PG | 0.01 | ~0 | أُنشئ 19 نونبر: مقدَّر بأقل كثيراً من الحقيقي |
| **المجموع** | 26 خدمة حية + 3 خدمات محذوفة (استهلاك أقراص متبقٍ ≈0$) | **17.65** | **~175** | تقدير Railway للدورة الحالية `estimatedUsage` ≈ 14.6$ (نفس الرتبة) |

**مطابقة العدد مع docs/27:** لقطة S1 (02:48Z) فيها 27 خدمة حية. في نافذة الاستهلاك تظهر 26 منها، لأن `tijara-migrate` مهمة تُنفَّذ مرة ثم تنتهي ولم يُسجَّل لها استهلاك داخل النافذة. وتظهر 3 خدمات محذوفة غير منسوبة لأي تطبيق (2 في lucid-playfulness و1 في spectacular-victory). نسبة قواعد البيانات للتطبيقات **استنتاج** (نفس المشروع والبيئة)، ولم يُقرأ ربط `DATABASE_URL`.

قراءة الأرقام:
- **البنية التحتية ليست المشكلة الاقتصادية في هذه المرحلة التجريبية.** بحمل تجريبي شبه معدوم، استهلاك كل تطبيق بين 0 و6 دولارات شهرياً.
- **رسوم الخطة منفصلة عن الاستهلاك ولا تُجمع معه مرتين:** خطة Hobby (5$) تشمل 5$ استهلاك، وPro (20$) تشمل 20$. الفاتورة ≈ max(رسوم الخطة، الاستهلاك) مع تفاصيل Railway. لذلك لا تُضاف رسوم الخطة كاملة إلى الاستهلاك المشمول فيها. الخطة الفعلية والرصيد والفواتير غير معروفة لهذه الجلسة.
- هذه الأرقام **حد أدنى**: الاستعمال الحقيقي، OCR، الصور، النسخ الاحتياطية، وAI/WhatsApp/Cloudinary (خارج Railway) غير محسوبة.
- أسرع توفير ممكن بلا أي مخاطرة تجارية: مراجعة خدمات TECH PLATFORM الثلاث داخل حسابك (R-004/R-006)، وهي قرار للمالك وجهة العمل.
- **غير معروف:** ما إذا كانت خطة Hobby تسمح بالاستعمال التجاري لعملاء يدفعون، وما الخطة المطلوبة للنسخ المجدولة للأقراص (وثيقة TIJARA تقول Pro). يجب التحقق من شروط Railway قبل أول عقد.

## 3. مقارنة التكلفة بنموذج التسعير المقترح (HYPOTHESIS)
النموذج المقترح: **5,000 MAD تهيئة + 500–600 MAD شهرياً** — **فرضية** حتى يُحدَّد: هل السعر HT أم TTC، وحد ساعات الدعم المشمولة، والمحاسبة الكاملة للتكاليف (رسوم الخطة، الخدمات الخارجية، النطاقات، الدعم، الضرائب).

### 3.1 تكلفة البنية لكل عميل (ESTIMATE)
> الأرقام أدناه **استهلاك موارد مقيس لخدمات تجريبية خفيفة** (≈13.4 و≈42.2 MAD)، لا تكلفة إنتاج لعميل. لا تشمل رسوم الخطة ولا الخدمات الخارجية ولا الدعم، وقد ترتفع مع الاستعمال الحقيقي.

| نوع النشر | مثال مقيس | USD/شهر | MAD/شهر | % من 550 MAD TTC |
|---|---|---|---|---|
| نشر مخصص لعميل (app + worker + PG) | PNEU pilot (بيئة `mouhim`) | 4.22 | ~42.2 | ~7.7% |
| نشر مخصص خفيف (app + PG) | RENT CAR demo (`production`) | 1.34 | ~13.4 | ~2.4% |
| مستأجر داخل SaaS مشترك | TIJARA (RLS) | ~0 هامشي (+ حصة من نواة ~1–3$) | ~0–30 | <6% |
| نسخ احتياطية مشفرة خارجية | R2 (مستوى مجاني حتى 10GB-شهر حسب صفحة Cloudflare) | ~0 | ~0 | — |
| حصة من رسوم الخطة | Pro 20$ ÷ عدد العملاء | 20/N | 200/N | — |

### 3.2 ما يبقى لتغطية الوقت البشري
الإيراد السنوي لعميل واحد بالسعر المتوسط: 5,000 + 12×550 = **11,600 MAD**؛ البنية ≈ 12×(15–60) = **180–720 MAD**. الباقي يجب أن يغطي: التهيئة، التكوين، الدعم، الإصلاحات، التحديثات، المراقبة، والضرائب.

| ساعات دعم شهرية لكل عميل | قيمة الساعة الضمنية من 500 MAD صافية |
|---|---|
| 2 ساعة | 250 MAD/ساعة |
| 4 ساعات | 125 MAD/ساعة |
| 8 ساعات | 62 MAD/ساعة |

**مثال توضيحي من مراجعة Astra (منقول عن المالك، فرضيات تخطيط فقط):** اشتراك 550 MAD **TTC** يساوي 458.33 MAD HT (ضريبة 20%). نطرح كلفة شهرية ثابتة مفترضة 130 MAD، وساعتي دعم بـ120 MAD للساعة (240). يبقى هامش مساهمة **88.33 MAD** فقط (458.33 − 130 − 240 = 88.33).

**الخلاصة:** الربحية تتحدد بساعات الدعم وبالتمييز بين HT وTTC، لا بـRailway. لذلك يجب قياس وقت الدعم لكل عميل (§6، IDEA-043) قبل تعميم السعر.

### 3.3 نطاق مقترح للباقة (للنقاش، لا عقد)
| البند | داخل 5,000 MAD | داخل 500–600 MAD/شهر | خارج الباقة (Devis) |
|---|---|---|---|
| إعداد المؤسسة، الفروع، المستخدمين، الهوية | ✓ (حد يتفق عليه) | | فروع إضافية |
| استيراد البيانات | حتى حجم محدد (مثلاً ملف Excel واحد منظم) | | بيانات معقدة/تنظيف |
| التكوين | جلستان | | تدريب إضافي |
| الاستضافة، تحديثات الأمان، المراقبة | | ✓ | |
| نسخ احتياطية + **استرجاع تجريبي دوري مثبت** | | ✓ (شرط قبل البيع) | |
| دعم | | حد ساعات/قناة/وقت استجابة | ما يتجاوز الحد |
| ميزات جديدة خاصة بعميل | | ✗ | Devis مستقل |
| OCR/AI كثيف | | حصة محددة | استهلاك يفوتر |
| صيانة ميدانية/شبكات/كاميرات | | | خدمة ALLOSERVIX مستقلة |

### 3.4 شروط قبل أول فاتورة (ليست تقنية فقط)
1. **كيان قانوني للفوترة** (README ‏ALLOSERVIX يمنع وصفها كشركة مسجلة قبل وجودها). يحدد نوعه محاسب/مستشار.
2. عقد خدمة يحدد: المسؤول عن المعالجة (العميل) ومقدم الخدمة، مكان الاستضافة، مدة الاحتفاظ، الإنهاء وإرجاع البيانات.
3. مراجعة CNDP لكل تطبيق يعالج معطيات شخصية: CIN/رخص (RENT CAR)، زبائن وديون (PNEU، TIJARA)، طلبات وعناوين (AMANZINE)، والصحة (NEXORA، أشد). هذه نقطة تحتاج مختصاً؛ هذه الوثيقة لا تقدم رأياً قانونياً.
4. نسخة احتياطية خارجية + استرجاع مثبت من النسخة المخزنة (R-003).
5. احترام أي سعر أو شرط سبق ذكره لعميل محدد (غير مسجل هنا).

## 4. سجل العملاء المحتملين وملاحظات التجارب (Pilot Feedback) — تصميم
**المبدأ:** المعلومات الشخصية والتجارية للعميل لا تدخل GitHub ولا قاعدة NEXUS.

| الطبقة | ماذا تخزن | أين | لماذا هناك |
|---|---|---|---|
| سجل العميل (Customer record) — **مقترح، غير مبني** | الاسم، الهاتف، النشاط، العرض، المرحلة، الاتفاق | **ALLOSERVIX admin** (مقترح). الموجود فعلاً أساس تقني فقط: `staff_accounts` + TOTP، و`inquiries.enc` مشفر بمفتاح مشتق HKDF مع AAD، و`audit`. وجود تخزين مشفر للاستفسارات **لا يعني** أن سجل العملاء أو نظام الملاحظات مبني | الواجهة التجارية هي المالكة الطبيعية لعلاقة العميل |
| ملاحظات التجربة | ما لا يعمل، مشكلة يومية، اقتراح، صورة/صوت، تقييم سهولة (1–5)، أهم الميزات | نموذج داخل كل تطبيق أو رابط خاص بمعرّف التجربة، **يُخزن في التطبيق نفسه أو في ALLOSERVIX** | الصور قد تحتوي بيانات زبائن العميل: تبقى عند صاحبها |
| تحويل إلى عمل | Issue مجهول الهوية: `PILOT-RC-01: …` بلا أسماء ولا لقطات حساسة | GitHub Issues للمستودع | سجل تطوير قابل للتتبع |
| المتابعة التشغيلية | أعداد فقط: ملاحظات مفتوحة/مغلقة، عمر أقدم ملاحظة، تقييم متوسط، المرحلة | NEXUS (metadata) | يرى المالك الصورة دون نسخ بيانات |

حقول الملاحظة الدنيا: `pilot_id, app_id, app_version(SHA), category(bug|daily_problem|suggestion|usability), severity_by_client, text, attachment_ref?, rating?, created_at, status, linked_issue`.
قواعد: لا رسائل صوتية/صور تُرسل لمزود AI خارجي دون موافقة ومراجعة (نفس منطق D-038 و`AI_INTENT_ONLY.md`). مدة احتفاظ للمرفقات. العميل يرى حالة ملاحظته.
**ما هو موجود الآن:** لا شيء من هذا مبني في أي تطبيق: سجل العملاء (IDEA-042) ونظام الملاحظات (IDEA-041) كلاهما `IDEA`. أقرب أساس: `inquiries`/`service_requests`/`request_events` في ALLOSERVIX.

## 5. جاهزية كل تجربة (EVIDENCE من الكود)
### 5.1 PNEU MOUHIM (PILOT-PM-01)
جاهز وظيفياً لسيناريو البيع والتحويل والمرتجعات (Phases 2–4 TESTED). قبل بيانات حقيقية: #14 (إزالة بيانات العرض بإجراء مدقق)، #20، #17–#19، النسخ R2 (#13) + استرجاع مثبت. **staging app وworker بإصدارين مختلفين** (R-008): لا يُستعمل staging كمرجع للتجربة قبل توحيدهما.

### 5.2 RENT CAR (PILOT-RC-01)
جاهز وظيفياً لسيناريو العقد/الاستلام/الإرجاع/المبالغ (TESTED، demo). قبل بيانات حقيقية: قرار مكان الإنتاج (D-012 جهاز الشركة + VPN مقابل سحابة: يتطلب قراراً جديداً يلغي/يعدل D-012 وD-030)، CNDP لوثائق الهوية، #14، #22، RC-03 (#26).

### 5.3 TIJARA OS — ثلاث أنشطة
| التجربة | قالب نشاط موجود (`src/templates.ts`) | الناقص الحاسم (docs/TEST_STATUS.md) | الجاهزية النسبية |
|---|---|---|---|
| TJ-02 جزارة/مشوي | `butcher`, `grill` (وزن، وصفات، فاقد T1–T6) | جلسات صندوق/إقفال (O21)، مرتجع جزئي | **الأعلى** |
| TJ-01 ميكانيك | `mechanic` (قطع، خدمات، يد عاملة) | **أوامر الإصلاح T25 غير موجودة**، لا سيارات/عملاء-مركبات | متوسطة-ضعيفة |
| TJ-03 إنذار وحريق | `security_systems` (أرقام تسلسلية، ضمان T20) | **أوامر التركيب/الصيانة T25**، عقود وزيارات دورية غير موجودة | متوسطة-ضعيفة |
اقتراح: نواة واحدة + وحدات نشاط (موجود فعلاً كقوالب). ابدأ التجربة بـTJ-02 ببيانات اصطناعية؛ اجمع متطلبات TJ-01/TJ-03 عبر نموذج الملاحظات قبل بناء T25. ملاحظة إعادة استعمال: PNEU لديه `work_orders` و`vehicle_*` (RU-04)، وRENT CAR لديه كتالوج مركبات؛ تُستعمل **كمواصفات واختبارات**، لا نسخ قاعدة.
مقارنة ERPNext/Odoo على نفس السيناريو: مهمة Astra (لا تُنفذ هنا).

### 5.4 AMANZINE — تجربة ملابس محدودة (PILOT-AM-01)
| المطلوب لدورة كاملة | موجود؟ | دليل |
|---|---|---|
| كتالوج + صور | نعم | `products.images` JSONB، Cloudinary |
| مقاسات/ألوان | قائمة قيم فقط | `products.sizes` JSONB؛ **المخزون رقم واحد `stock` لكل منتج، لا مخزون لكل مقاس/لون** |
| سلة/طلب/تأكيد مع idempotency | نعم | `server/routes/orders.js` (مفتاح المحاولة، 409 عند التعارض) |
| شحن/تتبع | موصلات Amana/Promo Livraison في الكود | عملها في الإنتاج غير مثبت (CONSOLIDATION_STATUS) |
| مرتجعات/استبدال | **غير مثبت**: لم يُعثر على جدول أو مسار باسم returns. غياب الاسم ليس دليلاً شاملاً، والمؤكد أن مساراً كاملاً للإرجاع وعكس المخزون والمبلغ **غير مثبت** | قائمة الجداول في docs/27؛ `orders.js:345-353` (الرفض لا يعيد المخزون، قراءة كود) |
| تسوية مالية | `payments`, `wallets` | المبالغ `NUMERIC` لا سنتيمات؛ CMI غير مثبت |
القرار المقترح قبل التجربة: إما إضافة مخزون لكل متغير + مسار مرتجع صغير في AMANZINE، أو تجربة مؤقتة بحل جاهز (مهمة مقارنة Astra) دون حذف AMANZINE. وفي الحالتين: بيانات زبائن حقيقية فقط بعد R-003 وموافقة الزبائن.

## 6. دور ALLOSERVIX وNEXUS دون توحيد البنية
```
ALLOSERVIX (عام + admin)          التطبيقات (كل واحد مستقل ببياناته)          NEXUS (داخلي)
- عرض الحلول وطلب تجربة/Devis  →   PNEU · RENT CAR · TIJARA · AMANZINE    ←  - إصدار منشور vs main
- سجل العميل والمرحلة (مشفر)        - تشغيل النشاط وبيانات الزبائن               - توفر HTTP، نسخ، استرجاع مثبت
- نموذج ملاحظات التجارب              - نموذج الملاحظات داخل التطبيق               - تكلفة الموارد لكل تطبيق/عميل
          └──── أعداد/مراحل فقط ───────────────────────────────────────────▶   - ساعات الدعم والتدخلات (تُدخل يدوياً أولاً)
```
- لا يُفرض على أي تطبيق تغيير لغته أو استضافته. العقد المشترك الوحيد المقترح: `/ready` يعرض الإصدار (IDEA-039) + تقرير نسخ احتياطي موحد الشكل (IDEA-040).
- NEXUS لا يخزن أسعار العملاء ولا فواتيرهم ولا بياناتهم؛ يخزن **تكلفة البنية** (من Railway) و**ساعات الدعم** (إدخال المالك) لكل `app_id/pilot_id` ليحسب "هل التطبيق يكلف وقتاً أكثر من دخله" (IDEA-043).
- ALLOSERVIX قسم "Business Solutions": عرض حالات الاستعمال لا قائمة أسعار عامة؛ طلب تجربة يذهب إلى سجل العميل (IDEA-042). موقع ALLOSERVIX ما زال `noindex` وبإذن إطلاق غير محسوم (D-REQ-06).

## 7. خريطة المستودع ← Railway ← قاعدة البيانات ← التخزين
| app | repo @ deployed SHA | Railway project / env / service | قاعدة البيانات (حسب الطوبولوجيا) | تخزين ملفات | نسخ Railway |
|---|---|---|---|---|---|
| pneu-mouhim | Pneumatiques-MOUHIM @`ea55329f` | lucid-playfulness / `mouhim ` / Pneumatiques-MOUHIM + PNEU-MOUHIM-Worker | Postgres-ekYj (INFERRED) | volume `/app/storage/app/public` | 0 |
| pneu-mouhim | @`a2691d7d` / @`6a811897` | PNEU MOUHIM - STAGING / staging / App / Worker | Postgres (INFERRED) | volume `/app/storage/app/public` | 0 |
| rent-car | rent-car-app @`781ab813` | lucid-playfulness / production / rent-car-app | Postgres (INFERRED) | volume `/data` | 0 |
| rent-car | @`3a2b28b4` | Fleetora OCR Staging / staging / fleetora-ocr-app | Postgres (INFERRED) | volume `/data` | 0 |
| amanzine | amanzine2 @`4ff08a99` | spectacular-victory / Amanzine / balanced-growth | Postgres (INFERRED) | Cloudinary (code) | 0 |
| amanzine | @`4ff08a99` | spectacular-victory / staging / amanzine-staging | Postgres-rqCO (INFERRED) | volume `/data` + Cloudinary | 0 |
| tech-platform | Tech-Platform- @`924aa502` | spectacular-victory / production / **AMANZINE** ; TECH PLATFORM / **amanzine2** | Postgres-E8M4 (INFERRED) | — | 0 |
| tech-platform | @`04e70ae8` | overflowing-vision / production / Tech-Platform- | Postgres (INFERRED) | — | 0 |
| alloservix | Alloservix @`781c982f` | ALLOSERVIX Website / production / alloservix-web | SQLite على volume | volume `/data` | 0 |
| nexus | nexus @`bc8e6d13` | NEXUS Control Center / production / nexus-web + nexus-public-probes | Postgres (INFERRED) | — | 0 |
| nexora | Nexora @`aed95a38` | NEXORA Demo / demo / nexora-web-demo | لا يوجد | — | — |
| tijara-os | tijara-os @`e5e2b26d` | tijara-os-staging / staging / tijara-os + tijara-migrate | Postgres (INFERRED) | — | 0 |
`INFERRED` = نفس المشروع والبيئة؛ **ربط `DATABASE_URL` الفعلي لم يُقرأ** (قيم المتغيرات لا تُقرأ عمداً). تحقق المالك في دقيقة: Railway ← الخدمة ← Variables ← انظر هل `DATABASE_URL` مرجع مثل `${{Postgres-ekYj.DATABASE_URL}}` (اسم المرجع فقط، دون نسخ القيمة).
حجم خارج الخريطة: volume يتيم `/tmp` في spectacular-victory؛ 3 خدمات محذوفة ما زالت تسجل استهلاك أقراص ضئيلاً (lucid-playfulness ×2، spectacular-victory ×1).

## 8. خطة آمنة لمعالجة P0 وP1 (لا شيء منها نُفذ — كل خطوة قرار/فعل للمالك)
| # | المخاطرة | الخطوات بالترتيب | التحقق بعد التنفيذ | التراجع/الأثر |
|---|---|---|---|---|
| 1 | R-001 كود جهة العمل علني (`sahar2026`) | (أ) لا تنشر/تشارك الرابط ولا تفتح Issue علني عنه. (ب) الحساب `abdellatifhadana-byte`: Settings → Change visibility → Private. (ج) أبلغ المسؤول المختص لدى جهة العمل حسب قواعدها. (د) فحص التاريخ الكامل محلياً بأداة مثل gitleaks (الفحص الحالي على آخر نسخة فقط لم يجد أنماط أسرار). (هـ) إن وُجد سر: إلغاؤه وإصداره من جديد — جعل المستودع خاصاً لا يمحو ما نُسخ سابقاً | `git ls-remote` مجهول الهوية يفشل؛ الصفحة 404 بدون تسجيل دخول | قابل للتراجع؛ لا يحذف شيئاً |
| 2 | R-002 ملفات PDF في `scan-Flow-pro` العلني | (أ) اجعله Private فوراً. (ب) افحص الملفات محلياً على جهازك (لا ترفعها لأي خدمة/AI). (ج) إن كانت وثائق حقيقية: قرر حذفها من التاريخ (إعادة كتابة تاريخ = عملية لا رجعة فيها، بعد نسخة محلية مشفرة) وقيّم التزامات الإخطار مع مختص | مستودع خاص؛ قائمة بأنواع الملفات بلا محتوى | الخطوة (أ) قابلة للتراجع، (ج) لا |
| 3 | R-003 الاسترجاع غير مثبت للبيانات الحقيقية (0 نسخ لأقراص Railway؛ PNEU نجح في استرجاع واحد من نسخة داخل Railway حسب #13؛ لا استرجاع من R2؛ لا مطابقة أرصدة) | (أ) قرر الخطة (Pro إن كانت مطلوبة للنسخ المجدولة — تحقق). (ب) فعّل نسخ Railway لأقراص Postgres في pilot/demo: `Postgres-ekYj`، `lucid-playfulness/Postgres`، `Postgres-rqCO`، Amanzine Postgres، والأقراص `/app/storage/app/public` و`/data`. (ج) فعّل النسخ الخارجية الموجودة في الكود (PNEU spatie→R2 ‏#13، RENT CAR backup.js ‏#14، TIJARA backup-job). (د) **استرجاع تجريبي** لكل تطبيق إلى قاعدة/خدمة جديدة معزولة، مقارنة أعداد الصفوف وhash الملفات، دون لمس الإنتاج. (هـ) سجّل التاريخ والنتيجة في المستودع | `volumeInstanceBackupList` غير فارغ؛ تقرير drill بتاريخ وأعداد | التفعيل قابل للتراجع؛ الاسترجاع إلى هدف جديد فقط |
| 4 | R-008 PNEU staging بإصدارين | أعد نشر App وWorker في staging من نفس SHA (`ea55329f` أو الإصدار المرشح) | Railway: نفس `commitHash` للخدمتين | إعادة نشر سابق متاحة في Railway |
| 5 | R-004 / R-006 / R-005 خدمات TECH داخل مشروع AMANZINE + نشر قديم | (أ) قرار مع جهة العمل: هل يجب أن تبقى هذه النشرات أصلاً في حسابك الشخصي؟ (ب) إن بقيت: انقلها لمشروع باسم واضح، أو أعد تسمية الخدمات (`tech-platform-prod`…). (ج) أوقف `overflowing-vision` القديم بعد التأكد أن لا أحد يستعمل نطاقه. **لا تحذف قواعد Postgres المرتبطة قبل نسخة مثبتة (خطوة 3)** | خريطة §7 بلا أسماء مضللة | إعادة التسمية آمنة؛ الحذف لا رجعة فيه |
| 6 | R-007 نطاق alloservix.ma | قرار D-REQ-06: إما إزالة النطاق مؤقتاً، أو اعتماد الإطلاق بعد الصفحات القانونية والاتصال المتحقق؛ ثم رفع `Disallow` | `robots.txt` و README متسقان مع القرار | قابل للتراجع |
| 7 | R-009 منتجان في مشروع Railway واحد | بعد خطوة 3: قرر الفصل (مشروع لكل منتج) في نافذة صيانة؛ يتطلب نقل متغيرات وأقراص — خطة منفصلة | خريطة §7 | عملية حساسة: لا تتم أثناء تجربة عميل |
| 8 | تجارب العملاء على بيئات غير جاهزة | رسالة مكتوبة لكل عميل تجريبي: بيانات تجريبية فقط حتى إشعار؛ تحديد الرابط الرسمي لكل تجربة | سجل العميل (ALLOSERVIX) يحمل التاريخ | — |

## 9. ما أحتاجه منك لإكمال الأرقام (بدون بيانات دفع)
1. خطة Railway الحالية (Hobby/Pro) والمجموع الشهري من صفحة Usage/Invoices لآخر 3 أشهر (الرقم فقط).
2. الفواتير الأخرى: النطاقات (alloservix.ma…)، Cloudinary، OpenAI/Anthropic، WhatsApp، GitHub (الرقم والمدة فقط).
3. تقدير ساعاتك الأسبوعية لكل تطبيق الآن.
4. لكل تجربة: أي رابط أُرسل، هل استُعمل، وهل أُدخلت بيانات حقيقية (نعم/لا فقط).
5. أي سعر سبق ذكره لعميل محدد.

## CHECKPOINT
- **Branch:** `docs/commercial-infra-readiness-20261120`، مبني فوق `docs/portfolio-baseline-v1-20261120` (PR #18، غير مدمج).
- **Files:** `docs/32_COMMERCIAL_INFRA_READINESS.md`، `registry/commercial-status.v1.json`، `registry/infra-cost-runrate.v1.json`؛ إضافة IDEA-041…044 في `docs/17`، وسطر في `README.md`.
- **Data sources:** Railway `usage`/`estimatedUsage` (قراءة فقط)، صفحة أسعار Railway الرسمية (2026-11-20)، الكود عند SHAs في docs/31، أقوال المالك (OWNER_STATED).
- **Secret scan:** أنماط فقط على آخر نسخة من 10 مستودعات علنية: لا أسرار حقيقية (نتيجة واحدة = مثال توثيقي). التاريخ الكامل **غير مفحوص**.
- **Not done:** أي تغيير في Railway/GitHub visibility/تطبيقات؛ لا مقارنة ERPNext/Odoo/WooCommerce (مهمة Astra)؛ لا رأي قانوني.
- **Next:** إجابات §9، قرارات D-REQ-02/05/06/07، ثم تحديث التكلفة بالفاتورة الفعلية.

### Revision 2 — 2026-11-20 (owner decision + owner-relayed review, PR #19 comment 05:05Z)
Applied on this stacked branch after merging the corrected #18 branch (`2d40a65`) with a merge commit; no history rewritten.
1. PNEU and RENT CAR → `ACTIVE_TRIAL · OWNER_STATED · SYNTHETIC_ONLY`; exact trial URLs `UNKNOWN`.
2. The 13.4–42.2 MAD figures are relabelled as a 7-day lightweight resource-consumption run-rate for specific environments, not a per-customer production cost or upper bound. Plan fee vs included usage credit is made explicit (no double counting).
3. Backup wording separated: zero Railway volume backups vs PNEU's in-Railway stored-copy restore (#13); R2 and balance reconciliation unproven.
4. Snapshot reconciliation: S1 27 live vs S3 26 live + 3 deleted (`tijara-migrate` had no usage in the window).
5. AMANZINE returns: "complete return/stock/payment reversal unverified" (absence of a table name is not proof).
6. FleetDocs AI recorded as `IDEA`; ALLOSERVIX customer record and feedback are `PROPOSED / IDEA`, not implemented.
7. Price stays a hypothesis until HT/TTC, support-hour limits and full cost accounting are defined; Astra's 88.33 MAD contribution example added as an illustration.

