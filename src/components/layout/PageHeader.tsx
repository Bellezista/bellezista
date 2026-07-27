interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

// Shared editorial page header (gold uppercase eyebrow + serif display title +
// muted subtitle), so every inner screen speaks the same visual language as
// the catalog and ficha (client design direction, Phase 1 review).
export function PageHeader({ eyebrow, title, subtitle }: PageHeaderProps) {
  return (
    <div>
      {eyebrow && (
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
          {eyebrow}
        </span>
      )}
      <h1 className="mt-2 font-serif text-3xl leading-tight text-foreground md:text-4xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
