TITLE: PostgreSQL Accounting Core (Transaction & Isolation)

LABELS:
CORE FOUNDATION | DATABASE | MULTI TENANT | WEEK 1

DESCRIPTION:
تصميم الـ Core الخاص بالمحاسبة يعتمد بالكامل على PostgreSQL كـ Source of Truth وحيد. 
واستبدال أي Simulation أو Firestore Batches بـ ACID Transactions حقيقية في قاعدة البيانات الدائمة، بالإضافة لضمان Multi-Tenant Isolation بشكل صارم في كل Queries.

TASKS:
- هيكلة جداول tenants, chart_of_accounts, journal_entries, journal_lines
- تحويل UUID ليكون بالكامل متوافق مع V7
- إنشاء نظام Transactions في الـ Express JS (Begin, Commit, Rollback) الحقيقي مش Firestore Batches
- تطبيق الـ Tenant Context على مستوى كل Query

ACCEPTANCE CRITERIA:
- Database Transactions حقيقية بتتعمل في الـ Backend
- مفيش أي بيانات بتختلط بين tenants (RLS أو Tenant ID شرط في كل Query)
- مفيش UUID متولد بشكل غلط زي tx-123123
- Audit Logs تتكتب بعد הـ Commit من الـ Backend
