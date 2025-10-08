import * as React from 'react';
import { cn } from '../../lib/utils';

interface AppShellProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const AppShell = React.forwardRef<HTMLDivElement, AppShellProps>(
  ({ children, sidebar, header, footer, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'min-h-screen bg-background text-foreground',
          className
        )}
      >
        {header && (
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {header}
          </header>
        )}
        
        <div className="flex flex-1">
          {sidebar && (
            <aside className="fixed left-0 top-[var(--header-height,0)] z-30 h-[calc(100vh-var(--header-height,0))] w-64 shrink-0 border-r bg-background transition-all duration-300">
              <div className="h-full overflow-y-auto scrollbar-thin">
                {sidebar}
              </div>
            </aside>
          )}
          
          <main 
            className={cn(
              'flex-1 overflow-x-hidden',
              sidebar && 'ml-64'
            )}
          >
            <div className="container mx-auto p-6">
              {children}
            </div>
          </main>
        </div>
        
        {footer && (
          <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {footer}
          </footer>
        )}
      </div>
    );
  }
);

AppShell.displayName = 'AppShell';

export { AppShell };