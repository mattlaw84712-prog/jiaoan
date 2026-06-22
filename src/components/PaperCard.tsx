import type { ReactNode } from 'react';

interface PaperCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export default function PaperCard({ children, className = '', title, subtitle }: PaperCardProps) {
  return (
    <div className={`paper-texture rounded-xl border border-primary/20 shadow-card p-6 md:p-8 ${className}`}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}