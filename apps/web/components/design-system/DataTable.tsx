/**
 * DataTable Component - Advanced table with sorting, filtering, and pagination
 *
 * Built with @tanstack/react-table
 */

'use client';

import React, { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
} from '@tanstack/react-table';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/design-system/utils';
import { Button, Input, Select } from '../design-system';

export interface DataTableProps<TData> {
  /**
   * Table columns definition
   */
  columns: ColumnDef<TData>[];
  /**
   * Table data
   */
  data: TData[];
  /**
   * Enable global search
   */
  searchable?: boolean;
  /**
   * Search placeholder text
   */
  searchPlaceholder?: string;
  /**
   * Enable pagination
   */
  paginated?: boolean;
  /**
   * Page size options
   */
  pageSizeOptions?: number[];
  /**
   * Default page size
   */
  defaultPageSize?: number;
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Enable row selection
   */
  selectable?: boolean;
  /**
   * Callback when rows are selected
   */
  onRowSelectionChange?: (selectedRows: TData[]) => void;
  /**
   * Enable export
   */
  exportable?: boolean;
  /**
   * Export filename
   */
  exportFilename?: string;
  /**
   * Empty state message
   */
  emptyMessage?: string;
  /**
   * Additional className
   */
  className?: string;
}

export function DataTable<TData>({
  columns,
  data,
  searchable = true,
  searchPlaceholder = 'Search...',
  paginated = true,
  pageSizeOptions = [10, 20, 50, 100],
  defaultPageSize = 10,
  loading = false,
  selectable = false,
  onRowSelectionChange,
  exportable = false,
  exportFilename = 'data.csv',
  emptyMessage = 'No data available',
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: paginated ? getPaginationRowModel() : undefined,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
      pagination,
    },
    enableRowSelection: selectable,
  });

  // Handle row selection callback
  React.useEffect(() => {
    if (onRowSelectionChange) {
      const selectedRows = table
        .getSelectedRowModel()
        .rows.map((row) => row.original);
      onRowSelectionChange(selectedRows);
    }
  }, [rowSelection, onRowSelectionChange, table]);

  // Export to CSV
  const handleExport = () => {
    const headers = columns
      .map((col: any) => col.header)
      .filter(Boolean)
      .join(',');
    const rows = data.map((row: any) =>
      columns
        .map((col: any) => {
          const value = row[col.accessorKey as keyof typeof row];
          return typeof value === 'string' && value.includes(',')
            ? `"${value}"`
            : value;
        })
        .join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportFilename;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={cn('w-full space-y-4', className)}>
        {/* Search skeleton */}
        {searchable && (
          <div className="h-10 w-full max-w-sm bg-gray-200 rounded-lg animate-pulse" />
        )}
        {/* Table skeleton */}
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <div className="h-12 bg-gray-100 border-b border-gray-200" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 border-b border-gray-200 bg-white animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Toolbar */}
      {(searchable || exportable) && (
        <div className="flex items-center justify-between gap-4">
          {searchable && (
            <div className="flex-1 max-w-sm">
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                startIcon={<Search className="h-4 w-4" />}
              />
            </div>
          )}
          {exportable && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              startIcon={<Download className="h-4 w-4" />}
            >
              Export
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                        header.column.getCanSort() && 'cursor-pointer select-none'
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {header.column.getCanSort() && (
                          <span className="text-gray-400">
                            {header.column.getIsSorted() === 'asc' ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronsUpDown className="h-4 w-4" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      'hover:bg-gray-50 transition-colors',
                      row.getIsSelected() && 'bg-primary-50'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {paginated && table.getPageCount() > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}
              </span>{' '}
              of{' '}
              <span className="font-medium">
                {table.getFilteredRowModel().rows.length}
              </span>{' '}
              results
            </p>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              options={pageSizeOptions.map((size) => ({
                value: size.toString(),
                label: `${size} per page`,
              }))}
              wrapperClassName="w-40"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              startIcon={<ChevronsLeft className="h-4 w-4" />}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              startIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-700">
              Page{' '}
              <span className="font-medium">
                {table.getState().pagination.pageIndex + 1}
              </span>{' '}
              of <span className="font-medium">{table.getPageCount()}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              endIcon={<ChevronRight className="h-4 w-4" />}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              endIcon={<ChevronsRight className="h-4 w-4" />}
            >
              Last
            </Button>
          </div>
        </div>
      )}

      {/* Selection info */}
      {selectable && Object.keys(rowSelection).length > 0 && (
        <div className="flex items-center justify-between px-2 py-2 bg-primary-50 rounded-lg border border-primary-200">
          <p className="text-sm text-primary-700">
            <span className="font-medium">
              {Object.keys(rowSelection).length}
            </span>{' '}
            row(s) selected
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetRowSelection()}
          >
            Clear selection
          </Button>
        </div>
      )}
    </div>
  );
}
