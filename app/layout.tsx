import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Playbook Registry — AI Workflow Library',
  description: 'A centralised, searchable registry for AI workflow playbooks. Browse, discover, and download playbooks as installable .skill files for Claude.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
