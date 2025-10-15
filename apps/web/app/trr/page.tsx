'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTRRs } from '@/lib/hooks/use-api';
import {
  Plus,
  Loader2,
  CheckCircle2,
  Calendar,
  Users,
  Clock,
  Filter,
  Search,
  AlertCircle,
  FileText,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

/**
 * TRR List Page
 * Displays all Technical Readiness Review (TRR) documents with filtering and search
 */
export default function TRRListPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <TRRListContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function TRRListContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch TRRs using SWR
  const { data: trrs, isLoading, isError, error, mutate } = useTRRs();

  // Filter TRRs
  const filteredTRRs = trrs.filter((trr: any) => {
    const matchesSearch =
      trr.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trr.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trr.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trr.id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || trr.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Status counts
  const statusCounts = trrs.reduce((acc: any, trr: any) => {
    acc[trr.status] = (acc[trr.status] || 0) + 1;
    return acc;
  }, {});

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'in-review':
        return <AlertTriangle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'in-review':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const isOverdue = (dueDate: string) => {
    return dueDate && new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-orange-500" />
            Technical Readiness Reviews
          </h1>
          <p className="text-gray-600 mt-2">
            Manage and track technical readiness reviews for your projects.
          </p>
        </div>
        <Link href="/trr/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New TRR
          </Button>
        </Link>
      </div>

      {/* Error Alert */}
      {isError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">Failed to load TRR documents. {error?.message || 'Please try again.'}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total TRRs</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{trrs.length}</p>
              </div>
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600 mt-2">{statusCounts.pending || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Review</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">{statusCounts['in-review'] || 0}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600 mt-2">{statusCounts.completed || 0}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search TRRs by title, project, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-review">In Review</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TRR List */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredTRRs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || statusFilter !== 'all' ? 'No TRRs found' : 'No TRRs yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by creating your first Technical Readiness Review.'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Link href="/trr/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First TRR
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTRRs.map((trr: any) => (
                <Link key={trr.id} href={`/trr/${trr.id}`}>
                  <div className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50/50 transition-all cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {trr.name || trr.title || 'Untitled TRR'}
                          </h3>
                          <Badge
                            variant="outline"
                            className={`flex items-center gap-1 ${getStatusColor(trr.status)}`}
                          >
                            {getStatusIcon(trr.status)}
                            {trr.status}
                          </Badge>
                          {trr.priority && (
                            <Badge className={getPriorityColor(trr.priority)}>
                              {trr.priority}
                            </Badge>
                          )}
                          {trr.dueDate && isOverdue(trr.dueDate) && trr.status !== 'completed' && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Overdue
                            </Badge>
                          )}
                        </div>

                        {trr.projectName && (
                          <p className="text-sm text-gray-600 mb-2">
                            Project: <span className="font-medium">{trr.projectName}</span>
                          </p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          {trr.createdAt && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>Created: {new Date(trr.createdAt).toLocaleDateString()}</span>
                            </div>
                          )}

                          {trr.dueDate && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span>
                                Due: {new Date(trr.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}

                          {trr.assignedTo && (
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span>Assigned: {trr.assignedTo}</span>
                            </div>
                          )}
                        </div>

                        {trr.description && (
                          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                            {trr.description}
                          </p>
                        )}

                        {trr.tags && trr.tags.length > 0 && (
                          <div className="flex items-center gap-2 mt-3">
                            <div className="flex flex-wrap gap-2">
                              {trr.tags.slice(0, 5).map((tag: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {trr.tags.length > 5 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{trr.tags.length - 5} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Completion Percentage */}
                      {trr.completionPercentage !== undefined && (
                        <div className="ml-4 text-center">
                          <div className="relative w-16 h-16">
                            <svg className="transform -rotate-90 w-16 h-16">
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                                className="text-gray-200"
                              />
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 28}`}
                                strokeDashoffset={`${2 * Math.PI * 28 * (1 - trr.completionPercentage / 100)}`}
                                className={trr.completionPercentage === 100 ? 'text-green-500' : 'text-orange-500'}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-bold text-gray-900">
                                {trr.completionPercentage}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
