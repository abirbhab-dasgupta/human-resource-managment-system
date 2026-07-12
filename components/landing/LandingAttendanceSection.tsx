import AppChrome from "./AppChrome";

const team = [
  { initials: "AS", name: "Aditi Sharma", role: "Frontend", status: "present" as const },
  { initials: "RK", name: "Rohan Kapoor", role: "HR", status: "leave" as const },
  { initials: "MI", name: "Meera Iyer", role: "Backend", status: "present" as const },
];

const attendance = [
  { name: "Aditi Sharma", checkIn: "09:58 AM", checkOut: "—", status: "present" as const },
  { name: "Rohan Kapoor", checkIn: "—", checkOut: "—", status: "leave" as const },
  { name: "Meera Iyer", checkIn: "10:04 AM", checkOut: "—", status: "present" as const },
  { name: "Sahil Verma", checkIn: "—", checkOut: "—", status: "absent" as const },
];

const pillClass: Record<string, string> = {
  present: "pill-approved",
  leave: "pill-pending",
  absent: "pill-rejected",
};

const pillLabel: Record<string, string> = {
  present: "Present",
  leave: "Leave",
  absent: "Absent",
};

export default function LandingAttendanceSection() {
  return (
    <section id="attendance" className="border-t border-border px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
          Clock-in to payday
        </span>
        <h2 className="mt-3.5 font-sans text-[26px] font-semibold tracking-tight text-ink sm:text-3xl">
          From daily attendance to salary, without spreadsheets.
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
          Attendance feeds directly into each employee&apos;s record. Admins see the whole team;
          employees see their own history.
        </p>
      </div>

      <AppChrome url="workforcee.app/dashboard/admin/attendance" className="mx-auto mt-10 max-w-4xl">
        <div className="grid sm:grid-cols-[1fr_1.3fr]">
          <div className="p-4 sm:border-r sm:border-border">
            <p className="mb-2.5 font-mono text-[10px] uppercase tracking-wider text-muted">Team</p>
            {team.map((member) => (
              <div
                key={member.initials}
                className="flex items-center gap-3 border-t border-border py-2.5 first:border-t-0"
              >
                <div className="emp-avatar h-[30px] w-[30px] text-[10px]">{member.initials}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-ink">{member.name}</p>
                  <p className="truncate text-[10px] text-muted">{member.role}</p>
                </div>
                <span className={`status-dot status-dot-${member.status}`} />
              </div>
            ))}
          </div>

          <div className="border-t border-border p-4 sm:border-t-0">
            <p className="mb-2.5 font-mono text-[10px] uppercase tracking-wider text-muted">
              Attendance — Today
            </p>
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((row) => (
                    <tr key={row.name}>
                      <td>{row.name}</td>
                      <td>{row.checkIn}</td>
                      <td>{row.checkOut}</td>
                      <td>
                        <span className={`pill ${pillClass[row.status]}`}>
                          {pillLabel[row.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AppChrome>

      <div className="mx-auto mt-10 grid max-w-4xl gap-8 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 font-sans text-[15px] font-semibold text-ink">
            Role-based from the start
          </h3>
          <p className="text-[13.5px] leading-relaxed text-muted">
            Admins and HR manage the whole team. Employees only ever see their own attendance and
            leave — never anyone else&apos;s.
          </p>
        </div>
        <div>
          <h3 className="mb-2 font-sans text-[15px] font-semibold text-ink">
            Simple status, not guesswork
          </h3>
          <p className="text-[13.5px] leading-relaxed text-muted">
            Every day is present, on leave, or absent. No ambiguous states to reconcile at the end
            of the month.
          </p>
        </div>
      </div>
    </section>
  );
}