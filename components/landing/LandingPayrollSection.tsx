import AppChrome from "./AppChrome";

const lines = [
  { label: "Basic", value: "₹32,500.00" },
  { label: "HRA", value: "₹16,250.00" },
  { label: "Standard Allowance", value: "₹5,416.67" },
  { label: "Performance Bonus", value: "₹5,414.50" },
  { label: "Leave Travel Allowance", value: "₹5,414.50" },
  { label: "PF (Employee)", value: "−₹3,900.00" },
  { label: "Professional Tax", value: "−₹200.00" },
];

export default function LandingPayrollSection() {
  return (
    <section id="payroll" className="border-t border-border px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
          Salary, broken down
        </span>
        <h2 className="mt-3.5 font-sans text-[26px] font-semibold tracking-tight text-ink sm:text-3xl">
          Real payroll math, not a black box.
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
          Basic, HRA, PF, professional tax, and net pay — computed the same way, every month, for
          every employee.
        </p>
      </div>

      <AppChrome className="mx-auto mt-10 max-w-md">
        <div className="p-5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
            Salary Breakdown — Aditi Sharma
          </p>
          <p className="mt-1 mb-3.5 text-xs text-muted">Monthly wage ₹65,000</p>
          {lines.map((line) => (
            <div
              key={line.label}
              className="flex items-center justify-between border-b border-border py-2 text-[13px]"
            >
              <span className="text-muted">{line.label}</span>
              <span className="text-ink">{line.value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-3.5 text-base font-semibold text-primary">
            <span>Net Monthly</span>
            <span>₹60,900.00</span>
          </div>
        </div>
      </AppChrome>

      <div className="mx-auto mt-10 grid max-w-4xl gap-8 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 font-sans text-[15px] font-semibold text-ink">No manual math</h3>
          <p className="text-[13.5px] leading-relaxed text-muted">
            Enter the monthly wage once. WorkForcee computes the full breakdown — basic,
            allowances, PF, tax — instantly.
          </p>
        </div>
        <div>
          <h3 className="mb-2 font-sans text-[15px] font-semibold text-ink">
            Consistent across the team
          </h3>
          <p className="text-[13.5px] leading-relaxed text-muted">
            The same formula runs for every employee, every month, so nobody&apos;s payslip is a
            one-off calculation.
          </p>
        </div>
      </div>
    </section>
  );
}