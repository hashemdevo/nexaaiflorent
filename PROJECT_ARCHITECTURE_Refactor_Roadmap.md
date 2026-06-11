# 🗺️ NexaLedger ERP - Enterprise Refactoring Roadmap

تضع هذه الخطة خارطة طريق متسلسلة لحل جميع المشاكل المعمارية، الأمنية، ومشاكل البيانات في النظام الحالي، للوصول إلى تصميم Enterprise-Grade حقيقي.

---

## 🛡️ المرحلة الأولى: تأمين الهوية والصلاحيات (Security & Identity Hardening)
**الهدف:** التخلص من الاعتماد على `localStorage` كمصدر للصلاحيات، وتطبيق حماية حقيقية على مستوى قاعدة البيانات.

1. **توحيد مصدر الهوية (Single Source of Identity):**
   - بناء `SessionManager` أو الاعتماد بشكل حصري على `auth.currentUser.getIdTokenResult()` لتضمين الـ `tenantId` و `role` في الـ Claims.
   - إزالة أي قراءة لـ `localStorage` من داخل طبقات الخدمات (`DbEngine`, `WorkflowEngine`).

2. **تفعيل Firebase Security Rules:**
   - كتابة قوانين أمان صارمة (`firestore.rules`) تمنع قراءة أو كتابة أي مستند لا يطابق `tenantId` الخاص بالمستخدم.
   - تطبيق قوانين RLS (Row-Level Security) مثل `branchId` داخل الـ Rules، بحيث يرفض الخادم أي عملية تجاوز، بدلًا من فلترتها في الواجهة.

3. **إزالة القيم الثابتة (Hardcoded Fallbacks):**
   - منع استخدام `tenant-nexa-001` كقيمة افتراضية عند فشل قراءة التينانت. يجب أن يفشل الطلب (Fail Fast) لمنع تسريب البيانات.

---

## 🗄️ المرحلة الثانية: تنظيف طبقة البيانات (Data Layer Purification)
**الهدف:** تحويل `DbEngine` إلى مجرد Adapter وتطبيق CQRS بشكل صحيح.

1. **تحسين استعلامات قاعدة البيانات (Query Optimization):**
   - استبدال `getDocs(query(where('id', '==', id)))` بـ `getDoc(doc(db, table, id))` لضمان قراءة سريعة ومباشرة وبأقل تكلفة.
   - نقل فلترة `isDeleted === false` و `branchId` إلى مستوى استعلام Firestore `.where()` وعدم تصفيتها في الذاكرة (Memory).

2. **تأمين التزامن (Concurrency & Transactions):**
   - استخدام `runTransaction` بدلاً من `writeBatch` عند الحاجة لقراءة وتحديث بيانات تعتمد على بعضها (Read-Modify-Write) لضمان ACID compliance.
   - تطبيق Optimistic Concurrency Control حقيقي بمقارنة رقم الإصدار (Version) القادم من المُرسل وليس الموجود في الذاكرة.

3. **فصل سجلات المراجعة (Asynchronous Audit Trails):**
   - إخراج `logForensicTrail` من العمليات المتزامنة في `DbEngine`.
   - استخدام نمط Outbox أو إرسال حدث (Event) غير متزامن لتسجيل الـ Audit، حتى لا يبطئ أو يفشل العمليات الأساسية.

---

## ⚙️ المرحلة الثالثة: تجريد مسارات العمل (Workflow & Domain Decoupling)
**الهدف:** إخراج المنطق التجاري (Business Logic) من الـ Services وتحويله إلى Policy Engine.

1. **فصل قواعد مسارات العمل (Policy Engine Extraction):**
   - إزالة الأرقام والأدوار الثابتة (مثل `< 5000` و `v-cfo`) من داخل `WorkflowEngine`.
   - الاعتماد على جدول `approval_policies` لجلب قواعد الموافقة بشكل ديناميكي (Dynamic Rules).

2. **تطبيق هندسة الأحداث (Event-Driven Architecture):**
   - فك الارتباط (Decoupling) بين التحديثات والإشعارات. عند الموافقة على PO، يُصدر النظام حدث `PO_APPROVED`، وتستمع خدمة الإشعارات (`NotificationService`) لهذا الحدث بمعزل عن المعاملة الأساسية.

3. **التحقق من صحة البيانات (Schema Validation):**
   - إدخال مكتبة مثل `Zod` للتحقق من هيكل البيانات قبل وصولها لـ `DbEngine` لضمان عدم تمرير قيم `undefined` أو اختلاف صياغة التواريخ (`Date` vs `ISO String`).

---

## 🎨 المرحلة الرابعة: تفريغ الواجهات (UI/UX Layer Cleanup)
**الهدف:** تحويل واجهات React إلى "Dumb Components" تعرض وتستقبل الأوامر فقط.

1. **منع حقن البيانات من الواجهة (Remove UI Seeding):**
   - إزالة أي كود يقوم بإنشاء بيانات وهمية أو مبدئية إذا كانت المصفوفة فارغة (مثل ما يحدث في `PurchaseOrderList` و `InventoryList`).
   - نقل هذا المنطق إلى سكريبتات إعداد (Seed Scripts) أو وظائف خاصة بالمسؤولين فقط (Admin Bootstrap).

2. **منع اتخاذ القرارات في الواجهة:**
   - الواجهة يجب أن تعرض الأزرار بناءً على رد قادم من الخادم `InvoicePolicy.canApprove()` بدلًا من التحقق المباشر من `role == 'SALES_REP'`.

3. **الاعتماد على الخدمات بدلاً من محرك قاعدة البيانات المباشر:**
   - منع مناداة `DbEngine.insert` مباشرة من المكونات (Components).
   - توجيه الطلبات إلى خدمات النطاق (مثل `PurchaseOrderService.create`) لضمان مرور العملية بكل قواعد التحقق (Validation) وسياق العمل (Workflow).

---

## 🚀 خطة التنفيذ المقترحة (Execution Plan)
سيتم تنفيذ هذه الخطة تدريجياً لضمان عدم توقف النظام الحالي:
1. **أسبوع 1:** إصلاح `DbEngine` لتنفيذ Query Optimization وتفعيل Security Rules.
2. **أسبوع 2:** بناء `Policy Engine` وفك ارتباط الـ `WorkflowEngine`.
3. **أسبوع 3:** تنظيف مكونات React ونقل (Business Rules) منها إلى (Domain Services).
4. **أسبوع 4:** ربط النظام ككل بمنطق (Event-Driven) والتحقق من صحة البيانات (Schema Validation).
