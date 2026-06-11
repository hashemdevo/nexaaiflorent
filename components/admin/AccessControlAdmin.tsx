import React, { useState, useEffect } from "react";
import {
  Shield,
  Key,
  FileText,
  CheckCircle,
  XCircle,
  Search,
  Save,
  User,
  Building,
  Users,
} from "lucide-react";

// ==================== TYPES ====================
type Role = { id: string; code: string; name: string };
type OrgNode = { id: string; path: string; name: string; type: string };
type UserItem = {
  user_id: string;
  email: string;
  full_name: string;
  primary_org_id: string;
  status: string;
};
type AuditLog = {
  id: string;
  actor_id: string;
  action: string;
  decision: string;
  target_scope: string;
  created_at: string;
};

export const AccessControlAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"matrix" | "users" | "audit">(
    "matrix",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [orgNodes, setOrgNodes] = useState<OrgNode[]>([]);

  useEffect(() => {
    setRoles([
      { id: "1", code: "EXECUTIVE", name: "القيادة العليا" },
      { id: "2", code: "CFO", name: "المدير المالي" },
      { id: "3", code: "BRANCH_MANAGER", name: "مدير فرع" },
      { id: "4", code: "DEPT_HEAD", name: "رئيس قسم" },
    ]);
    setOrgNodes([
      {
        id: "r1",
        path: "root",
        name: "المجموعة الرئيسية",
        type: "headquarters",
      },
      { id: "h1", path: "root.hq", name: "المقر الرئيسي", type: "branch" },
      {
        id: "d1",
        path: "root.hq.finance",
        name: "الإدارة المالية",
        type: "department",
      },
      { id: "c1", path: "root.cairo", name: "فرع القاهرة", type: "branch" },
      { id: "c2", path: "root.alex", name: "فرع الإسكندرية", type: "branch" },
    ]);
  }, []);

  // ==================== TAB 1: ROLE-SCOPE MATRIX ====================
  const MatrixView = () => (
    <div className="overflow-x-auto bg-surface border border-border rounded-xl shadow-xl animate-fade-in p-6">
      <h3 className="text-lg font-bold text-on-surface mb-2 flex items-center gap-2">
        <Shield className="h-5 w-5 text-emerald-500" />
        مصفوفة الصلاحيات الهرمية (Role × Organizational Scope)
      </h3>
      <p className="text-sm text-on-surface-muted mb-6">
        تحديد نطاق الوصول لكل دور وظيفي بناءً على الشجرة التنظيمية. الصلاحيات
        الموروثة تُطبق تلقائياً على المستويات الأدنى (Materialized Paths).
      </p>
      <div className="border border-border/50 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-right">
          <thead className="bg-surface-highlight/40 text-on-surface-muted border-b border-border/50">
            <tr>
              <th className="p-4 text-right font-bold w-48">الدور / Role</th>
              {orgNodes?.map((n) => (
                <th
                  key={n.id}
                  className="p-4 text-center font-mono text-[10px] uppercase font-bold tracking-wider"
                >
                  {n.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {roles?.map((role) => (
              <tr
                key={role.id}
                className="hover:bg-surface-highlight/30 transition"
              >
                <td className="p-4 font-bold text-primary">
                  {role.name}
                  <div className="text-[10px] text-on-surface-muted font-mono mt-0.5">
                    {role.code}
                  </div>
                </td>
                {orgNodes?.map((org) => {
                  const isAutoChecked =
                    role.code === "EXECUTIVE" ||
                    (role.code === "CFO" && org.path.includes("hq"));
                  return (
                    <td key={org.id} className="p-4 text-center">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          defaultChecked={isAutoChecked}
                        />
                        <div className="w-9 h-5 bg-background border border-border/80 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                      </label>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 flex justify-end">
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2">
          <Save className="h-4 w-4" /> حفظ مصفوفة الصلاحيات
        </button>
      </div>
    </div>
  );

  // ==================== TAB 2: USER ASSIGNMENT ====================
  const UserAssignmentView = () => {
    const mockUsers: UserItem[] = [
      {
        user_id: "u1",
        email: "ahmed.finance@corp.com",
        full_name: "أحمد السيد",
        primary_org_id: "d1",
        status: "active",
      },
      {
        user_id: "u2",
        email: "sara.cairo@corp.com",
        full_name: "سارة محمود",
        primary_org_id: "c1",
        status: "active",
      },
      {
        user_id: "u3",
        email: "director@corp.com",
        full_name: "خالد المدير",
        primary_org_id: "h1",
        status: "active",
      },
    ];

    return (
      <div className="bg-surface border border-border rounded-xl shadow-xl p-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> تعيين الأدوار
              للمستخدمين
            </h3>
            <p className="text-xs text-on-surface-muted mt-1">
              تخصيص الأدوار لكل موظف ضمن نطاقه التنظيمي المحدد.
            </p>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 بحث بالاسم أو البريد..."
              className="bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-sm w-64 focus:border-primary outline-none transition"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-on-surface-muted" />
          </div>
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
          {mockUsers
            .filter(
              (u) =>
                u.full_name.includes(searchTerm) ||
                u.email.includes(searchTerm),
            )
            .map((user) => (
              <div
                key={user.user_id}
                className="flex flex-col sm:flex-row items-center justify-between bg-surface-highlight/30 p-4 rounded-xl border border-border/50"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto mb-4 sm:mb-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                    {user.full_name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-on-surface text-sm">
                      {user.full_name}
                    </div>
                    <div className="text-[11px] text-on-surface-muted mt-0.5">
                      {user.email} •{" "}
                      {
                        orgNodes?.find((o) => o.id === user.primary_org_id)
                          ?.name
                      }
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select className="bg-background border border-border rounded-lg px-3 py-2 text-xs font-bold text-on-surface outline-none focus:border-primary w-full sm:w-48">
                    <option>اختر دور...</option>
                    {roles?.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition">
                    تطبيق
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  };

  // ==================== TAB 3: AUDIT LOG ====================
  const AuditView = () => {
    const mockLogs: AuditLog[] = [
      {
        id: "1",
        actor_id: "ahmed.finance",
        action: "ROLE_BINDING",
        decision: "ALLOW",
        target_scope: "root.hq.finance",
        created_at: "2026-05-20T14:30:00Z",
      },
      {
        id: "2",
        actor_id: "sara.cairo",
        action: "DOC_ACCESS",
        decision: "DENY",
        target_scope: "root.hq.hr",
        created_at: "2026-05-20T13:15:00Z",
      },
      {
        id: "3",
        actor_id: "director",
        action: "REPORT_EXPORT",
        decision: "ALLOW",
        target_scope: "root.cairo.sales",
        created_at: "2026-05-21T09:00:00Z",
      },
    ];

    return (
      <div className="bg-surface border border-border rounded-xl shadow-xl p-6 overflow-hidden animate-fade-in">
        <h3 className="text-lg font-bold text-on-surface mb-2 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" /> سجل تدقيق الصلاحيات
          (Audit Trail)
        </h3>
        <p className="text-xs text-on-surface-muted mb-6">
          سجل غير قابل للتعديل يوثق جميع سياسات الوصول وقرارات القبول أو الرفض.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-surface-highlight/30 text-on-surface-muted border-b border-border/50 text-xs">
              <tr>
                <th className="p-3 font-bold">الوقت (UTC)</th>
                <th className="p-3 font-bold">الفاعل / الهوية</th>
                <th className="p-3 font-bold">الإجراء المطلق</th>
                <th className="p-3 font-bold">النطاق المطلوب</th>
                <th className="p-3 font-bold text-center">القرار النهائي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-xs">
              {mockLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-surface-highlight/20 transition"
                >
                  <td className="p-3 font-mono text-[10px] text-on-surface-muted">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="p-3 font-bold text-on-surface">
                    {log.actor_id}
                  </td>
                  <td className="p-3 font-mono text-[10px] text-primary bg-primary/5 px-2 py-1 rounded inline-block mt-2 border border-primary/10">
                    {log.action}
                  </td>
                  <td className="p-3 font-mono text-[10px] text-on-surface-muted">
                    {log.target_scope}
                  </td>
                  <td className="p-3 text-center">
                    {log.decision === "DENY" ? (
                      <span className="bg-red-500/10 border border-red-500/20 text-red-500 px-2 py-1 rounded-md text-[10px] font-bold flex items-center justify-center gap-1 w-max mx-auto">
                        <XCircle className="h-3 w-3" /> تم الرفض (DENY)
                      </span>
                    ) : (
                      <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-2 py-1 rounded-md text-[10px] font-bold flex items-center justify-center gap-1 w-max mx-auto">
                        <CheckCircle className="h-3 w-3" /> تم القبول (ALLOW)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div
      className="space-y-6 max-w-[1600px] mx-auto p-4 sm:p-6 text-right"
      dir="rtl"
    >
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-on-surface flex items-center gap-3 mb-2">
          <Key className="h-7 w-7 text-primary" /> مركز الصلاحيات الإستراتيجية
          (Access Control)
        </h1>
        <p className="text-sm text-on-surface-muted max-w-3xl">
          إدارة صلاحيات الوصول بناءً على القواعد والأدوار الوظيفية (RBAC) مقترنة
          بالشجرة التنظيمية الديناميكية (ABAC). يوفر عزل بيانات صارم (Row-Level
          Security) على مستوى الخدمات.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-border/50 pb-3 custom-scrollbar">
        {[
          { id: "matrix", label: "مصفوفة الصلاحيات (RBAC+ABAC)", icon: Shield },
          { id: "users", label: "إدارة وتعيين المستخدمين", icon: Users },
          { id: "audit", label: "سجل التدقيق الأمني", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? "bg-primary border border-primary text-white shadow-md"
                  : "bg-surface border border-border text-on-surface hover:bg-surface-highlight"
              }`}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Container */}
      <div className="pt-2">
        {activeTab === "matrix" && <MatrixView />}
        {activeTab === "users" && <UserAssignmentView />}
        {activeTab === "audit" && <AuditView />}
      </div>
    </div>
  );
};
