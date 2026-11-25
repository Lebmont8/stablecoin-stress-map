import type { ReactNode } from 'react';

export function Page({ children }: { children: ReactNode }) {
  return <main>
    <header className="masthead">
      <h1>Stablecoin Stress Map</h1>
      <p>Compare synthetic depeg paths and see how severity and recovery change with your threshold.</p>
    </header>
    {children}
  </main>;
}

export function Metric({ label, children }: { label: string; children: ReactNode }) {
  return <div><dt>{label}</dt><dd>{children}</dd></div>;
}
