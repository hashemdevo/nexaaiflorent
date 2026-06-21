TITLE: Workflow & Approval Engine

LABELS:
CORE FOUNDATION | HR DOMAIN | WEEK 2

DESCRIPTION:
تصميم Workflow State Machine للتعامل مع دورة الموافقات بشكل ديناميكي (Policy Driven) من قواعد البيانات، بعيدا عن الـ hardcoded if statements.

TASKS:
- بناء Approval Matrix في قاعدة البيانات.
- تصميم State Machine engine لإدارة مراحل (Draft, Submitted, Approval_1, Approval_2, Final, Rejected, Posted).
- ربط القيود والشاشات مع المحرك.

ACCEPTANCE CRITERIA:
- مفيش if conditions داخل الـ Components تعتمد على ارقام الصرف (amount > 5000).
- Policies driven by Database.
