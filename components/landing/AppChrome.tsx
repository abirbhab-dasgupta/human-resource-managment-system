export default function AppChrome({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`landing-app-chrome ${className}`}>
      <div className="landing-chrome-bar">
        <span className="landing-chrome-dot bg-[#e3877a]" />
        <span className="landing-chrome-dot bg-amber" />
        <span className="landing-chrome-dot bg-[var(--color-primary)]" />
      </div>
      {children}
    </div>
  );
}