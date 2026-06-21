TITLE: Event Bus + Outbox Pattern

LABELS:
CORE FOUNDATION | OUTBOX EVENTS | WEEK 3

DESCRIPTION:
استبدال الاستدعاء المباشر للمزامنات والتنبيهات (مثل Notifications) بنظام يعتمد على الـ Events. لضمان Event Delivery Consistency.

TASKS:
- إنشاء جداول الـ Outbox.
- ربط الـ Core Engine لإرسال الاحداث لـ Outbox Table بداخل نفس الـ Transaction (Transaction safety).
- إنشاء Notification Consumer منفصل يقرأ من الـ Outbox أو الـ Event Bus ويرسل اشعارات.

ACCEPTANCE CRITERIA:
- Notification Services لا تستدعى من داخل Workflow Engine بشكل مباشر.
