# 01 — Vision, scope and operating model

## ما هو NEXUS؟
NEXUS هو **مركز معرفة وتشخيص وتحكم مضبوط** لمشروعاتنا البرمجية. يستطيع المشرف أن يسأل: ما التطبيقات الموجودة؟ كيف بُنيت؟ ما المسارات والعلاقات؟ هل تعمل؟ هل النسخ الاحتياطية سليمة؟ ما سبب هذا الخطأ؟ ماذا حدث بعد آخر نشر؟ كيف نصلح المشكلة بأمان؟ ثم يرى الأدلة وخطوات الحل ونتيجتها.

**الهدف ليس معرفة كل المعلومات الشخصية الموجودة داخل التطبيقات.** المعرفة المقصودة: البنية، الخدمات، الاعتماديات، الكود والإصدارات، حالة التشغيل، حوادث الأمان، نتائج سلامة الأعمال (كمؤشرات مجهولة الهوية)، العمليات المصرح بها وسجلها.

## Personas
- Platform Owner: يحدد المشاريع وسياساتها وأهدافها ويوافق على العمليات عالية الأثر.
- Platform Security Admin: يدير اتصالات الموردين والمفاتيح والمخاطر دون صلاحية أعمال تلقائية.
- Operator / SRE: يراقب الأعطال والمؤشرات ويشغل فحوصاً غير مدمّرة.
- App Maintainer: يرى التطبيق المحدد وما يخصه من السجلات والإصدارات.
- Support Agent: يدير طلبات دعم المستخدمين عبر تفويض محدد للعمليات منخفضة الأثر.
- Auditor: عرض أدلة وسجلات غير قابلة للتغيير، دون تعديل أو تنفيذ.
- Business Owner: يرى مؤشرات سلامة التطبيق والموافقات الموجهة له فقط.
- Viewer: لوحة متابعة محدودة.

## Use cases
1. اكتشاف تطبيق جديد وتوثيق مصدره وفرعه وبيئاته واتصالاته واعتمادياته.
2. ربط تغيّر أداء التطبيق بـ deployment أو migration أو change متزامن، مع إثبات العلاقة لا افتراضها.
3. رصد تعارض المخزون، اختلاف أرصدة الصندوق، فشل الفواتير، فشل التكامل، تأخر OCR، وخطأ صلاحيات.
4. مساعدة مدير التطبيق في فتح حساب مقفل أو بدء إعادة تعيين كلمة المرور، دون كشف الأسرار.
5. ربط تقرير فشل backup مع اختبار restore ومعرفة RPO/RTO وحالة النسخة خارج الاستضافة.
6. إظهار المسارات والأجهزة والخدمات والاعتماديات بواجهة interactive map.
7. التحليل المعتمد على الأدلة عبر ملفات المصدر والـrunbooks والسجلات المنقحة ونتائج الفحوص.
8. إدارة الاشتراكات/التكلفة واستهلاك الحوسبة وتوقع مشاكل السعة.
9. دعم تطبيقات جديدة بنفس البروتوكول دون إعادة كتابة المركز.

## Product limits
- لا يسحب بيانات الزبناء أو المرضى أو الصور أو العقود ولا ينشئ نسخة منها.
- لا يضمن عدم فقدان البيانات: يخفف المخاطر بالنسخ، والتحقق من الاسترجاع، والاختبارات.
- لا يمتلك وصولاً مطلقاً إلى كود أو بيئات خاصة دون اتصالات وصلاحيات.
- لا يقرر الذكاء الاصطناعي تنفيذ تغييرات إنتاجية، ولا ينفذها عبر أوامر حرة.
- يجب أن يظل التطبيق الأصلي مستقلاً حتى لو توقف NEXUS؛ مع إمكانية تعطيل الربط (kill switch).

## Supported product families
| Application | Domain-specific probes (proposal) | Restricted boundaries |
|---|---|---|
| PNEU MOUHIM | stock ledger, invoice sequencing, cash, transfer, oil drum, backup | no customer names, raw invoices or transaction exports |
| AMANZINE | order state, shipping retries, merchant isolation, payments | no merchant cross-visibility, no order customer payload |
| RENT CAR | reservation consistency, contract numbering, document OCR health | no raw CIN, licenses, photos or contracts |
| ALLOSERVIX | lead workflow, publishing, auth, visitor journey aggregates | no visitor identities, recordings or contact content |
| NEXORA | deployment, infrastructure, security and service integrity | no patient files; healthcare control plane requires separate approval/compliance |
| TECH PLATFORM | equipment check and ticket metadata if approved | isolate intranet, employer authorization and outbound-only gateway |
