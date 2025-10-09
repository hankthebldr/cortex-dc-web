interface DashboardContentProps {
  children: React.ReactNode;
}

export function DashboardContent({ children }: DashboardContentProps) {
  return (
    <main className=\"flex-1 p-4 bg-gray-100 dark:bg-gray-900\">
      {children}
    </main>
  );
}
