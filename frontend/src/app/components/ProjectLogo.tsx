type ProjectLogoProps = {
  compact?: boolean;
  className?: string;
  iconClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  title?: string;
  subtitle?: string;
};

export function ProjectLogo({
  compact = false,
  className = "",
  iconClassName = "h-12 w-12",
  titleClassName = "text-sm font-semibold uppercase tracking-[0.22em] text-slate-400",
  subtitleClassName = "text-sm font-bold text-slate-900",
  title = "SAP Script AI",
  subtitle = "Scripts automáticos para dados",
}: ProjectLogoProps) {
  if (compact) {
    return (
      <img
        src="/project-logo.svg"
        alt={title}
        className={`${iconClassName} shrink-0 ${className}`.trim()}
      />
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-3 min-w-0 ${className}`.trim()}
    >
      <img
        src="/project-logo.svg"
        alt={title}
        className={`${iconClassName} shrink-0`.trim()}
      />
      <div className="min-w-0">
        <p className={`${titleClassName} truncate`}>{title}</p>
        <p className={`${subtitleClassName} truncate`}>{subtitle}</p>
      </div>
    </div>
  );
}
