/**
 * CommandPalette Component - CMD+K quick actions and search
 *
 * Built with cmdk
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { Search, File, Loader2 } from 'lucide-react';
import { Dialog, DialogContent } from './Dialog';
import { cn } from '@/lib/design-system/utils';
import type { Command, CommandGroup } from '@/lib/design-system/types';

export interface CommandPaletteProps {
  /**
   * Command groups
   */
  commands?: CommandGroup[];
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Empty state message
   */
  emptyMessage?: string;
  /**
   * Custom trigger (if not using default CMD+K)
   */
  trigger?: React.ReactNode;
  /**
   * Callback when command is selected
   */
  onSelect?: (command: Command) => void;
}

export function CommandPalette({
  commands = [],
  loading = false,
  placeholder = 'Type a command or search...',
  emptyMessage = 'No results found.',
  trigger,
  onSelect,
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // CMD+K to open
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = useCallback(
    (command: Command) => {
      setOpen(false);
      setSearch('');
      if (onSelect) {
        onSelect(command);
      }
      command.action();
    },
    [onSelect]
  );

  return (
    <>
      {/* Trigger button */}
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Search className="h-4 w-4" />
          <span>Search...</span>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-gray-200 bg-gray-100 px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      )}

      {/* Command palette dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          size="lg"
          className="overflow-hidden p-0 shadow-2xl [&>button]:hidden"
        >
          <CommandPrimitive
            className="h-full w-full"
            value={search}
            onValueChange={setSearch}
          >
            <div className="flex items-center border-b border-gray-200 px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandPrimitive.Input
                placeholder={placeholder}
                className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            <CommandPrimitive.List className="max-h-[400px] overflow-y-auto overflow-x-hidden p-2">
              <CommandPrimitive.Empty className="py-6 text-center text-sm text-gray-500">
                {emptyMessage}
              </CommandPrimitive.Empty>
              {commands.map((group) => (
                <CommandPrimitive.Group
                  key={group.label}
                  heading={group.label}
                  className="overflow-hidden p-1 text-gray-900 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-500"
                >
                  {group.commands.map((command) => (
                    <CommandPrimitive.Item
                      key={command.id}
                      value={command.label}
                      onSelect={() => handleSelect(command)}
                      className={cn(
                        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
                        'aria-selected:bg-primary-50 aria-selected:text-primary-900',
                        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
                      )}
                    >
                      {command.icon && (
                        <div className="mr-2 h-4 w-4">{command.icon}</div>
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{command.label}</div>
                        {command.description && (
                          <div className="text-xs text-gray-500">
                            {command.description}
                          </div>
                        )}
                      </div>
                      {command.shortcut && (
                        <div className="ml-auto flex gap-1">
                          {command.shortcut.map((key, i) => (
                            <kbd
                              key={i}
                              className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 bg-gray-100 px-1.5 font-mono text-xs font-medium"
                            >
                              {key}
                            </kbd>
                          ))}
                        </div>
                      )}
                    </CommandPrimitive.Item>
                  ))}
                </CommandPrimitive.Group>
              ))}
            </CommandPrimitive.List>
          </CommandPrimitive>
        </DialogContent>
      </Dialog>
    </>
  );
}
