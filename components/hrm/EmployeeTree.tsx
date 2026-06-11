import React, { useState, useEffect } from "react";
import { Building, Users, MapPin, Search } from "lucide-react";

interface OrgNode {
  id: string;
  name: string;
  type: "branch" | "department" | "team";
  employee_count: number;
  children?: OrgNode[];
  employees?: Employee[];
}

interface Employee {
  id: string;
  full_name: string;
  role: string;
  email: string;
}

export const EmployeeTree: React.FC<{ scopePath: string }> = ({
  scopePath,
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(["root", "root.hq"]),
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Fallback Mock Data instead of API fetch for instant UI feedback
  const mockOrgData = {
    nodes: [
      {
        id: "root",
        name: "المجموعة الرئيسية",
        type: "branch",
        employee_count: 1420,
      },
      {
        id: "root.hq",
        name: "المقر الرئيسي (HQ)",
        type: "branch",
        employee_count: 340,
      },
      {
        id: "root.hq.finance",
        name: "لجنة الإدارة المالية",
        type: "department",
        employee_count: 45,
        employees: [
          {
            id: "emp-1",
            full_name: "أحمد السيد",
            role: "CFO",
            email: "ahmed@corp.com",
          },
          {
            id: "emp-2",
            full_name: "محمد عبدالله",
            role: "Accountant",
            email: "mohamed@corp.com",
          },
        ],
      },
      {
        id: "root.cairo",
        name: "فرع القاهرة الكبرى",
        type: "branch",
        employee_count: 600,
      },
      {
        id: "root.cairo.sales",
        name: "قسم المبيعات الإقليمي",
        type: "department",
        employee_count: 210,
        employees: [
          {
            id: "emp-3",
            full_name: "سارة خالد",
            role: "Sales Manager",
            email: "sara@corp.com",
          },
          {
            id: "emp-4",
            full_name: "أسامة فؤاد",
            role: "Sales Rep",
            email: "osama@corp.com",
          },
          {
            id: "emp-5",
            full_name: "نور أحمد",
            role: "Sales Rep",
            email: "nour@corp.com",
          },
        ],
      },
    ],
  };

  const toggle = (id: string) => {
    const next = new Set(expanded);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpanded(next);
  };

  return (
    <div
      className="bg-surface border border-border rounded-xl p-4 md:p-6 shadow-xl animate-fade-in"
      dir="rtl"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-border/50 pb-4">
        <div>
          <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" /> الهيكلية التنظيمية
            للموظفين (Org Tree)
          </h3>
          <p className="text-xs text-on-surface-muted mt-1">
            عرض شجري كسول (Lazy) يتحمل آلاف السجلات مع احترام نطاق (Scope) كل
            مدير.
          </p>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="ابحث عن موظف..."
            className="bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs w-64 focus:border-primary outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-on-surface-muted" />
        </div>
      </div>

      <div className="bg-background/50 border border-border rounded-xl p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
        {mockOrgData.nodes.map((node) => (
          <div
            key={node.id}
            className="pr-4 border-r border-border/60 mr-2 relative before:content-[''] before:absolute before:w-4 before:h-px before:bg-border/60 before:right-0 before:top-5"
          >
            <button
              onClick={() => toggle(node.id)}
              className="flex justify-between items-center py-2.5 hover:bg-surface-highlight/40 rounded-lg px-3 w-full text-right transition group"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full shadow-sm ${node.type === "branch" ? "bg-cyan-500" : "bg-amber-500"}`}
                />
                <span className="font-bold text-on-surface text-sm group-hover:text-primary transition">
                  {node.name}
                </span>
                <span className="bg-surface-highlight text-on-surface-muted text-[10px] font-bold px-2 py-0.5 rounded-md border border-border/50">
                  {node.employee_count}
                </span>
              </div>
              <span className="text-on-surface-muted transition-transform duration-200">
                {expanded.has(node.id) ? "▾" : "▸"}
              </span>
            </button>

            {expanded.has(node.id) && node.employees && (
              <div className="mr-6 pr-2 mt-2 space-y-2 border-r border-border/30">
                {node.employees.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center gap-3 px-4 py-2.5 bg-surface rounded-xl border border-border/40 hover:border-primary/30 transition shadow-sm relative before:content-[''] before:absolute before:w-4 before:h-px before:bg-border/30 before:-right-4 before:top-1/2"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                      {emp.full_name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm text-on-surface">
                        {emp.full_name}
                      </div>
                      <div className="text-[11px] text-on-surface-muted mt-0.5">
                        {emp.role} • {emp.email}
                      </div>
                    </div>
                    <button className="px-3 py-1.5 bg-surface-highlight hover:bg-primary/20 hover:text-primary text-on-surface-muted text-[10px] font-bold rounded-lg transition">
                      عرض التفاصيل
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
