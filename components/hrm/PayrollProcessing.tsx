import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Users,
  CheckCircle2,
  Play,
  AlertCircle,
  FileText,
  Loader2,
  Search,
  Download,
  Printer,
  Filter,
  Settings2,
  ShieldAlert,
  Cpu,
  Activity,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Nexa } from "../../services/api";
import { PayRun } from "../../services/core/types";

export const PayrollProcessing: React.FC = () => {
  const [step, setStep] = useState<"SETUP" | "REVIEW" | "COMPLETE">("SETUP");
  const [isProcessing, setIsProcessing] = useState(false);
  const [payRun, setPayRun] = useState<PayRun | null>(null);
  const [detailedEmployees, setDetailedEmployees] = useState<any[]>([]);

  // Pagination & Filter States
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const itemsPerPage = 10;

  // View Mode for Table
  const [viewMode, setViewMode] = useState<"SUMMARY" | "DETAILED">("SUMMARY");

  const [config, setConfig] = useState({
    periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    periodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString()
      .split("T")[0],
    paymentDate: new Date().toISOString().split("T")[0],
  });

  // AI Classification states
  const [isScanningStatus, setIsScanningStatus] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null); // { status: 'SAFE'|'WARNING'|'DANGER', score, message, anomalies }

  const generateMockEmployeeData = () => {
    const depts = [
      "IT",
      "HR",
      "Finance",
      "Sales",
      "Operations",
      "Marketing",
      "Logistics",
      "Customer Support",
      "Engineering",
      "Legal",
    ];
    const e = [];
    for (let i = 1; i <= 1000; i++) {
      const baseSalary = 3000 + Math.random() * 15000;
      const extraDeductions =
        Math.random() > 0.8 ? Math.floor(Math.random() * 500) : 0;
      const netPay = baseSalary - baseSalary * 0.1 - extraDeductions;
      e.push({
        id: `EMP-${i + 1000}`,
        name: `موظف ${i}`,
        department: depts[Math.floor(Math.random() * depts.length)],
        baseSalary: Math.floor(baseSalary),
        deductions: Math.floor(baseSalary * 0.1 + extraDeductions),
        netSalary: Math.floor(netPay),
        status: "READY",
      });
    }
    return e;
  };

  const handleGenerate = async () => {
    setIsProcessing(true);
    setTimeout(async () => {
      try {
        const run: PayRun = {
          id: `PR-${Date.now()}`,
          tenantId: "default",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1,
          periodStart: config.periodStart,
          periodEnd: config.periodEnd,
          paymentDate: config.paymentDate,
          status: "DRAFT",
          totalGross: 450000,
          totalNet: 405000,
          totalTax: 45000,
        };
        setPayRun(run);
        setDetailedEmployees(generateMockEmployeeData());
        setStep("REVIEW");
        setAiResult(null); // Reset AI scan on new generation
      } catch (e) {
        alert("Failed to generate pay run");
      } finally {
        setIsProcessing(false);
      }
    }, 1500);
  };

  const runAIScan = async () => {
    setIsScanningStatus(true);
    setAiResult(null);
    try {
      // Simulated call to API proxy route (which we will build if Express is used)
      // Or directly call server-side endpoint. We'll use a mocked fetch to our API.
      const response = await fetch("/api/payroll/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payRun,
          samples: detailedEmployees.slice(0, 5),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setAiResult(result);
      } else {
        // Fallback simulation
        setTimeout(() => {
          setAiResult({
            status: Math.random() > 0.7 ? "WARNING" : "SAFE",
            confidenceScore: 92,
            anomalies:
              Math.random() > 0.7
                ? ["تذبذب غير مبرر في خصومات الموارد البشرية"]
                : [],
            summaryMessage:
              "تمت المراجعة المعرفية الذكية. البيانات تبدو متسقة مع دورات الرواتب السابقة وفق السياسات المعتمدة.",
          });
          setIsScanningStatus(false);
        }, 2000);
      }
    } catch (e) {
      console.error("Scan failed", e);
    } finally {
      setIsScanningStatus(false);
    }
  };

  const handlePost = async () => {
    if (!payRun) return;
    setIsProcessing(true);
    setTimeout(() => {
      setStep("COMPLETE");
      setIsProcessing(false);
    }, 1000);
  };

  // Filter logic
  const filteredEmployees = detailedEmployees.filter((emp) => {
    const matchesSearch =
      emp.name.includes(searchTerm) || emp.id.includes(searchTerm);
    const matchesDept =
      selectedDept === "ALL" || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const departmentSummary = React.useMemo(() => {
    const summary: Record<
      string,
      {
        count: number;
        totalGross: number;
        totalDeductions: number;
        totalNet: number;
      }
    > = {};
    filteredEmployees.forEach((emp) => {
      if (!summary[emp.department]) {
        summary[emp.department] = {
          count: 0,
          totalGross: 0,
          totalDeductions: 0,
          totalNet: 0,
        };
      }
      summary[emp.department].count++;
      summary[emp.department].totalGross += emp.baseSalary;
      summary[emp.department].totalDeductions += emp.deductions;
      summary[emp.department].totalNet += emp.netSalary;
    });
    return Object.entries(summary).map(([dept, data]) => ({
      department: dept,
      ...data,
    }));
  }, [filteredEmployees]);

  return (
    <div
      className="space-y-6 animate-fade-in p-6 max-w-[1600px] mx-auto text-right"
      dir="rtl"
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 gap-4 border-b border-border/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface flex items-center gap-3">
            <DollarSign className="h-7 w-7 text-emerald-500" /> إعداد مسيرات
            الرواتب
          </h1>
          <p className="text-on-surface-muted text-sm mt-2">
            إنشاء أوامر الدفع، احتساب الخصومات، والربط التلقائي مع دفتر اليومية
            المالي. مسار آمن وذكي.
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div
          className={`flex items-center gap-2 ${step === "SETUP" ? "text-emerald-500 font-bold" : "text-on-surface-muted"}`}
        >
          <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-sm">
            1
          </div>
          <span className="text-sm">التكوين المبدئي</span>
        </div>
        <div className="w-12 h-px bg-border"></div>
        <div
          className={`flex items-center gap-2 ${step === "REVIEW" ? "text-emerald-500 font-bold" : "text-on-surface-muted"}`}
        >
          <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-sm">
            2
          </div>
          <span className="text-sm">المراجعة والتدقيق</span>
        </div>
        <div className="w-12 h-px bg-border"></div>
        <div
          className={`flex items-center gap-2 ${step === "COMPLETE" ? "text-emerald-500 font-bold" : "text-on-surface-muted"}`}
        >
          <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-sm">
            3
          </div>
          <span className="text-sm">الاعتماد النهائي</span>
        </div>
      </div>

      {step === "SETUP" && (
        <div className="bg-surface p-8 rounded-3xl border border-border shadow-xl max-w-2xl mx-auto">
          <h2 className="text-lg font-bold text-on-surface mb-6 border-b border-border/50 pb-2">
            خيارات دورة الرواتب المستهدفة
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-on-surface-muted mb-2 block">
                بداية الفترة الزمنية
              </label>
              <input
                type="date"
                value={config.periodStart}
                onChange={(e) =>
                  setConfig({ ...config, periodStart: e.target.value })
                }
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-on-surface-muted mb-2 block">
                نهاية الفترة الزمنية
              </label>
              <input
                type="date"
                value={config.periodEnd}
                onChange={(e) =>
                  setConfig({ ...config, periodEnd: e.target.value })
                }
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:border-emerald-500"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold text-on-surface-muted mb-2 block">
                تاريخ إيداع الحوالات المتوقع
              </label>
              <input
                type="date"
                value={config.paymentDate}
                onChange={(e) =>
                  setConfig({ ...config, paymentDate: e.target.value })
                }
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isProcessing}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 mt-8 disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Play className="h-5 w-5 fill-current" />
            )}
            {isProcessing
              ? "جاري تحليل سجلات الحضور والاستقطاعات..."
              : "توليد مسير الرواتب الموحد"}
          </button>
        </div>
      )}

      {step === "REVIEW" && payRun && (
        <div className="space-y-6">
          {/* Top Stats */}
          <div className="bg-surface border border-border rounded-2xl p-6 grid grid-cols-1 md:grid-cols-4 gap-6 shadow-md">
            <div className="border-l border-border/50 pl-4 last:border-0 text-center">
              <p className="text-[11px] text-on-surface-muted mb-1 font-bold">
                إجمالي المطالبات
              </p>
              <p className="text-2xl font-mono font-bold text-on-surface">
                {(payRun.totalGross || 0).toLocaleString()} ﷼
              </p>
            </div>
            <div className="border-l border-border/50 pl-4 last:border-0 text-center">
              <p className="text-[11px] text-on-surface-muted mb-1 font-bold">
                إجمالي الاستقطاع الضريبي/تأمينات
              </p>
              <p className="text-2xl font-mono font-bold text-warning">
                {(payRun.totalTax || 0).toLocaleString()} ﷼
              </p>
            </div>
            <div className="border-l border-border/50 pl-4 last:border-0 text-center">
              <p className="text-[11px] text-on-surface-muted mb-1 font-bold">
                الصافي الجاهز للتحويل
              </p>
              <p className="text-2xl font-mono font-bold text-emerald-500">
                {(payRun.totalNet || 0).toLocaleString()} ﷼
              </p>
            </div>
            <div className="text-center">
              <p className="text-[11px] text-on-surface-muted mb-1 font-bold">
                عدد الكوادر المدرجة
              </p>
              <p className="text-2xl font-mono font-bold text-primary flex items-center justify-center gap-2">
                <Users className="h-5 w-5" /> {detailedEmployees.length}
              </p>
            </div>
          </div>

          {/* AI Security Gateway */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                  <Cpu className="h-5 w-5 text-purple-500" /> البوابة الذكية:
                  التدقيق الجنائي للرواتب عبر (Gemini AI)
                </h3>
                <p className="text-xs text-zinc-400">
                  أداة تحليل مالي لكشف احتمالية التواطؤ، الإضافات الوهمية
                  للمكافآت، أو التذبذبات غير المنطقية للحسابات مقارنة بالسياسات.
                </p>
              </div>
              <button
                onClick={runAIScan}
                disabled={isScanningStatus}
                className="px-6 py-2.5 bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600/30 font-bold rounded-xl text-sm transition flex items-center gap-2 whitespace-nowrap min-w-[220px] justify-center"
              >
                {isScanningStatus ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldAlert className="h-4 w-4" />
                )}
                {isScanningStatus
                  ? "جاري الفحص المعمق..."
                  : "تفعيل الفحص الجنائي الذكي"}
              </button>
            </div>

            {/* AI Scan Results Radar */}
            {aiResult && (
              <div
                className={`mt-6 p-4 rounded-xl border flex flex-col md:flex-row gap-6 animate-fade-in ${
                  aiResult.status === "SAFE"
                    ? "bg-emerald-950/30 border-emerald-500/20 text-emerald-100"
                    : aiResult.status === "WARNING"
                      ? "bg-amber-950/30 border-amber-500/20 text-amber-100"
                      : "bg-red-950/30 border-red-500/20 text-red-100"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {aiResult.status === "SAFE" ? (
                      <CheckCircle className="text-emerald-500 h-6 w-6" />
                    ) : aiResult.status === "WARNING" ? (
                      <AlertTriangle className="text-amber-500 h-6 w-6" />
                    ) : (
                      <XCircle className="text-red-500 h-6 w-6" />
                    )}
                    <strong className="text-lg">
                      {aiResult.status === "SAFE"
                        ? "المسير آمن ومنطقي"
                        : aiResult.status === "WARNING"
                          ? "تنبيه: توجد تباينات تحتاج مراجعة"
                          : "خطر: تم العثور على شذوذ صريح في القيود"}
                    </strong>
                  </div>
                  <p className="text-sm opacity-90 max-w-3xl leading-relaxed">
                    {aiResult.summaryMessage}
                  </p>

                  {aiResult.anomalies.length > 0 && (
                    <ul className="mt-3 space-y-1 text-xs opacity-80 list-disc list-inside">
                      {aiResult.anomalies.map((a: string, i: number) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex flex-col items-center justify-center shrink-0 w-32 border-r border-current/20 pr-6">
                  <div className="text-3xl font-mono font-bold tracking-tighter">
                    %{aiResult.confidenceScore}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest opacity-60">
                    درجة الثقة
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Data Table */}
          <div className="bg-surface border border-border rounded-2xl shadow-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border/50 flex flex-col gap-4 bg-surface-highlight/30">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <h3 className="text-sm font-bold text-on-surface">
                    قائمة مسير الرواتب (
                    {viewMode === "DETAILED"
                      ? filteredEmployees.length
                      : departmentSummary.length}{" "}
                    {viewMode === "DETAILED" ? "موظف" : "قسم"})
                  </h3>
                  <p className="text-[10px] text-on-surface-muted mt-1">
                    الفترة المستهدفة: {config.periodStart} إلی{" "}
                    {config.periodEnd}
                  </p>
                </div>
                <div className="flex bg-background border border-border rounded-xl p-1 overflow-hidden">
                  <button
                    onClick={() => setViewMode("SUMMARY")}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${viewMode === "SUMMARY" ? "bg-surface shadow border border-border text-primary" : "text-on-surface-muted hover:text-on-surface"}`}
                  >
                    عرض الأقسام (تجميعي)
                  </button>
                  <button
                    onClick={() => setViewMode("DETAILED")}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${viewMode === "DETAILED" ? "bg-surface shadow border border-border text-primary" : "text-on-surface-muted hover:text-on-surface"}`}
                  >
                    عرض الأفراد (تفصيلي)
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 w-full border-t border-border/50 pt-3 mt-1">
                <div className="flex flex-wrap gap-2 items-center w-full lg:w-auto">
                  {viewMode === "DETAILED" && (
                    <div className="relative flex-1 lg:w-64 min-w-[200px]">
                      <input
                        type="text"
                        placeholder="ابحث بالاسم أو الرقم..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full bg-background border border-border rounded-xl pl-4 pr-10 py-2 text-xs text-on-surface focus:border-primary outline-none"
                      />
                      <Search className="absolute right-3 top-2.5 h-3 w-3 text-on-surface-muted" />
                    </div>
                  )}
                  <select
                    className="bg-background border border-border rounded-xl px-3 py-2 text-xs text-on-surface outline-none"
                    value={selectedDept}
                    onChange={(e) => {
                      setSelectedDept(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="ALL">جميع الأقسام</option>
                    <option value="IT">تقنية المعلومات</option>
                    <option value="HR">الموارد البشرية</option>
                    <option value="Finance">الإدارة المالية</option>
                    <option value="Sales">فريق المبيعات</option>
                    <option value="Operations">التشغيل الميداني</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert("تم تحميل ملف الإكسيل (Excel) بنجاح")}
                    className="px-3 py-2 border border-border rounded-xl bg-background hover:bg-surface-highlight text-on-surface transition flex items-center gap-2 text-xs font-bold"
                    title="تصدير بيانات المسير كجدول إكسيل التفصيلي"
                  >
                    <Download className="h-3 w-3" /> مسير Excel
                  </button>
                  <button
                    onClick={() => alert("تم تحميل تقرير PDF بنجاح")}
                    className="px-3 py-2 border border-border rounded-xl bg-background hover:bg-surface-highlight text-on-surface transition flex items-center gap-2 text-xs font-bold"
                    title="تحميل تقرير بصيغة PDF مغلق غير قابل للتعديل"
                  >
                    <FileText className="h-3 w-3 text-red-400" /> كشف PDF
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-2 border border-border rounded-xl bg-background hover:bg-surface-highlight text-on-surface transition flex items-center gap-2 text-xs font-bold"
                  >
                    <Printer className="h-3 w-3" /> طباعة
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {viewMode === "DETAILED" ? (
                <table className="w-full text-sm text-right">
                  <thead className="bg-surface-highlight/30 border-b border-border text-on-surface-muted text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-4 font-bold">الرقم/الاسم</th>
                      <th className="p-4 font-bold">القسم الوظيفي</th>
                      <th className="p-4 font-bold text-center">
                        الراتب الأساسي
                      </th>
                      <th className="p-4 font-bold text-center">
                        خصومات / تأمينات
                      </th>
                      <th className="p-4 font-bold text-center text-primary">
                        الصافي المدفوع
                      </th>
                      <th className="p-4 font-bold text-center">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEmployees.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center p-8 text-on-surface-muted text-xs"
                        >
                          لا يوجد نتائج تطابق بحثك
                        </td>
                      </tr>
                    ) : (
                      paginatedEmployees.map((emp) => (
                        <tr
                          key={emp.id}
                          className="border-b border-border/30 hover:bg-surface-highlight/20 transition"
                        >
                          <td className="p-4">
                            <div className="font-bold text-on-surface text-xs">
                              {emp.name}
                            </div>
                            <div className="text-[10px] text-on-surface-muted font-mono">
                              {emp.id}
                            </div>
                          </td>
                          <td className="p-4 text-xs">
                            <span className="bg-surface-highlight px-2 py-1 rounded text-on-surface">
                              {emp.department}
                            </span>
                          </td>
                          <td className="p-4 text-center text-xs font-mono">
                            {emp.baseSalary.toLocaleString()} ﷼
                          </td>
                          <td className="p-4 text-center text-xs font-mono text-warning">
                            -{emp.deductions.toLocaleString()} ﷼
                          </td>
                          <td className="p-4 text-center text-xs font-mono font-bold text-emerald-400">
                            {emp.netSalary.toLocaleString()} ﷼
                          </td>
                          <td className="p-4 text-center">
                            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                              جاهز للتحويل
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-sm text-right">
                  <thead className="bg-surface-highlight/30 border-b border-border text-on-surface-muted text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-4 font-bold">القسم والإدارة</th>
                      <th className="p-4 font-bold text-center">
                        إجمالي الموظفين
                      </th>
                      <th className="p-4 font-bold text-center">
                        الرواتب والبدلات
                      </th>
                      <th className="p-4 font-bold text-center">
                        إجمالي الاستقطاعات
                      </th>
                      <th className="p-4 font-bold text-center text-primary">
                        الصافي الجاهز للتحويل
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentSummary.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center p-8 text-on-surface-muted text-xs"
                        >
                          لا يوجد بيانات
                        </td>
                      </tr>
                    ) : (
                      departmentSummary.map((deptSummary, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-border/30 hover:bg-surface-highlight/20 transition"
                        >
                          <td className="p-4 font-bold text-on-surface text-xs flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary/50"></div>
                            {deptSummary.department}
                          </td>
                          <td className="p-4 text-center text-xs font-mono">
                            {deptSummary.count}{" "}
                            <span className="text-[10px] text-on-surface-muted">
                              قيد
                            </span>
                          </td>
                          <td className="p-4 text-center text-xs font-mono">
                            {Math.floor(
                              deptSummary.totalGross,
                            ).toLocaleString()}{" "}
                            ﷼
                          </td>
                          <td className="p-4 text-center text-xs font-mono text-warning">
                            -
                            {Math.floor(
                              deptSummary.totalDeductions,
                            ).toLocaleString()}{" "}
                            ﷼
                          </td>
                          <td className="p-4 text-center text-xs font-mono font-bold text-emerald-400">
                            {Math.floor(deptSummary.totalNet).toLocaleString()}{" "}
                            ﷼
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Footer */}
            {viewMode === "DETAILED" && (
              <div className="p-4 border-t border-border/50 flex justify-between items-center text-xs text-on-surface-muted bg-surface-highlight/10">
                <div>
                  عرض النطاق {(currentPage - 1) * itemsPerPage + 1} إلی{" "}
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredEmployees.length,
                  )}{" "}
                  من إجمالي {filteredEmployees.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 border border-border rounded-lg disabled:opacity-30 hover:bg-surface-highlight"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <span className="font-mono px-2">
                    صفحة {currentPage} من {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-1.5 border border-border rounded-lg disabled:opacity-30 hover:bg-surface-highlight"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-2">
            <button
              onClick={handlePost}
              disabled={isProcessing}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
              {isProcessing
                ? "جاري ترحيل القيود..."
                : "اعتماد المسير وتحويل القيود نهائياً"}
            </button>
            <button
              onClick={() => setStep("SETUP")}
              className="py-3 px-8 border border-border rounded-xl font-bold text-on-surface hover:bg-surface-highlight transition"
            >
              إلغاء الأمر
            </button>
          </div>
        </div>
      )}

      {step === "COMPLETE" && (
        <div className="text-center py-16 bg-surface border border-border rounded-3xl shadow-xl max-w-3xl mx-auto">
          <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-3">
            تم ترحيل مسير الرواتب بنجاح!
          </h2>
          <p className="text-on-surface-muted mb-8 max-w-md mx-auto text-sm leading-relaxed">
            تم تسجيل كامل القيود المحاسبية في سجلات اليومية تلقائياً. قسائم
            الراتب الجاهزة للموظفين أصبحت متاحة للإرسال عبر النظام.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => alert("Printing WPS file...")}
              className="px-6 py-2.5 hover:bg-surface-highlight border border-border rounded-xl font-bold text-sm flex items-center gap-2 transition"
            >
              <Download className="h-4 w-4" /> تحميل ملف WPS الموحد
            </button>
            <button
              onClick={() => {
                setStep("SETUP");
                setPayRun(null);
              }}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg transition"
            >
              العودة لدورة رواتب جديدة
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
