import AppChrome from "./AppChrome";

export default function LandingLeaveSection() {
  return (
    <section id="leave" className="border-t border-border px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
          Time off, without the back-and-forth
        </span>
        <h2 className="mt-3.5 font-sans text-[26px] font-semibold tracking-tight text-ink sm:text-3xl">
          Employees ask. Admins decide. Everyone sees where it stands.
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
          Leave requests move through pending, approved, or rejected — visible to both sides the
          moment it changes.
        </p>
      </div>

      <AppChrome className="mx-auto mt-10 max-w-2xl">
        <div className="p-4">
          <p className="mb-2.5 font-mono text-[10px] uppercase tracking-wider text-muted">
            Time Off — Requests
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border py-3">
            <div>
              <p className="text-[13px] font-medium text-ink">Rohan Kapoor</p>
              <p className="text-[11.5px] text-muted">Sick Leave · Jul 8 – Jul 9</p>
            </div>
            <div className="flex gap-2">
              <button className="landing-mini-btn landing-mini-btn-approve" type="button">
                Approve
              </button>
              <button className="landing-mini-btn landing-mini-btn-reject" type="button">
                Reject
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border py-3">
            <div>
              <p className="text-[13px] font-medium text-ink">Sahil Verma</p>
              <p className="text-[11.5px] text-muted">Casual Leave · Jul 14</p>
            </div>
            <span className="pill pill-approved">Approved</span>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border py-3">
            <div>
              <p className="text-[13px] font-medium text-ink">Meera Iyer</p>
              <p className="text-[11.5px] text-muted">Earned Leave · Jul 20 – Jul 22</p>
            </div>
            <span className="pill pill-rejected">Rejected</span>
          </div>
        </div>
      </AppChrome>

      <div className="mx-auto mt-10 grid max-w-4xl gap-8 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 font-sans text-[15px] font-semibold text-ink">One click to decide</h3>
          <p className="text-[13.5px] leading-relaxed text-muted">
            Admins approve or reject a request straight from the list — no separate email thread
            to keep track of.
          </p>
        </div>
        <div>
          <h3 className="mb-2 font-sans text-[15px] font-semibold text-ink">Always visible</h3>
          <p className="text-[13.5px] leading-relaxed text-muted">
            Employees can check the status of a request any time, from their own dashboard.
          </p>
        </div>
      </div>
    </section>
  );
}