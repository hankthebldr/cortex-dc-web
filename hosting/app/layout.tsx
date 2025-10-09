import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cortex Operations Console',
  description:
    'A modern Cortex XSIAM themed workspace that unifies data, analytics, timeline narratives, and workflow shortcuts.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
