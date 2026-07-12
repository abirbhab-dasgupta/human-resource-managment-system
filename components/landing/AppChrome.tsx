export default function AppChrome({
    url,
    children,
    className = "",
  }: {
    url: string;
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <div className={`landing-app-chrome ${className}`}>
        <div className="landing-chrome-bar">
          <span className="landing-chrome-dot bg-[#e3877a]" />
          <span className="landing-chrome-dot bg-amber" />
          <span className="landing-chrome-dot bg-[var(--color-primary)]" />
          <span className="landing-chrome-url">{url}</span>
        </div>
        {children}
      </div>
    );
  }