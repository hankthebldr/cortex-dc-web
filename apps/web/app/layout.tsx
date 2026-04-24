import './globals.css';
import { Providers } from '@/components/providers';

export const metadata = {
  title: 'Cortex DC Portal',
  description: 'Domain Consultant engagement tracking and management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
