GOAL:
إرساء قواعد الـ Security والـ Core Engine للمحاسبة قبل بناء أي شاشات جديدة لتفادي انهيار النظام واستغلال الثغرات وتأكيد ACID Transactions.

ISSUES:
- 001-master-role-matrix
- 002-postgresql-accounting-core

DAILY FLOW:
Day 1: Role Matrix Design & Middleware Implementation
Day 2: Tenant Security & Authorization cleanup
Day 3: PostgreSQL Database strict schema for Accounting
Day 4: Implement robust Server-side ACID Transaction Engine
Day 5: Move Audit Logs strictly to Server-side Events

ACCEPTANCE:
- 100% Backend Auth Validation (No localStorage overrides)
- 100% Strict Tenant Isolation
- UUIDv7 standardization applied
- Audit logs generated purely server-side
