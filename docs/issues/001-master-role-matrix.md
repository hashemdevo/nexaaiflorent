TITLE: Master Role Permission Matrix

LABELS:
CORE FOUNDATION | AUTH SECURITY | WEEK 1

DESCRIPTION:
تصميم وتطبيق نظام صلاحيات كامل ومحكم (RBAC) يمنع تماماً الاعتماد على الـ Frontend (مثل localStorage) 
لتحديد أدوار المستخدمين وصلاحياتهم. يتم التحقق من الصلاحيات والـ Roles حصرياً في طبقة الـ Backend (API Services/Middleware).

TASKS:
- إنشاء جداول roles و permissions في الـ Database
- تصميم RoleMatrix يربط بين كل دور والصلاحيات المسموحة
- ربط الـ User/Employee بالدور الخاص به في جدول المستخدمين
- إنشاء Middleware في الـ Express Server للتحقق من أي طلب وارد
- إزالة أي الاعتماد على currentUniversalRole من የ Frontend

ACCEPTANCE CRITERIA:
- مستحيل أي مستخدم ينفذ API action بدون الصلاحية المحددة في الـ Backend
- مفيش تعديل Role من הـ DevTools يقدر يأثر على الـ Backend
- الـ Roles واضحة في ملف RoleMatrix.ts أو DB.
