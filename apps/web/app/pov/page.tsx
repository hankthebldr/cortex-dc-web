'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePOVs } from '@/lib/hooks/use-api';
import {
  Plus,
  Loader2,
  Target,
  Calendar,
  Users,
  TrendingUp,
  Filter,
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';

/**
 * POV List Page
 * Displays all POV projects with filtering and search capabilities
 */
export default function POVListPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <POVListContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function POVListContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch POVs using SWR
  const { data: povs, isLoading, isError, error, mutate } = usePOVs();

  // Filter POVs
  const filteredPOVs = povs.filter((pov: any) => {
    const matchesSearch =
      pov.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pov.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pov.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pov.id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || pov.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Status counts
  const statusCounts = povs.reduce((acc: any, pov: any) => {
    acc[pov.status] = (acc[pov.status] || 0) + 1;
    return acc;
  }, {});

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <TrendingUp className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Target className="w-8 h-8 text-orange-500" />
            POV Projects
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your Proof of Value projects and track their progress.
          </p>
        </div>
        <Link href="/pov/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New POV
          </Button>
        </Link>
      </div>

      {/* Error Alert */}
      {isError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">Failed to load POV projects. {error?.message || 'Please try again.'}</p>
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
                <p className="text-sm font-medium text-gray-600">Total POVs</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{povs.length}</p>
              </div>
              <Target className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">{statusCounts.active || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
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
                placeholder="Search POVs by name, customer, or ID..."
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
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* POV List */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredPOVs.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || statusFilter !== 'all' ? 'No POVs found' : 'No POVs yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by creating your first POV project.'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Link href="/pov/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First POV
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPOVs.map((pov: any) => (
                <Link key={pov.id} href={`/pov/${pov.id}`}>
                  <div className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50/50 transition-all cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {pov.name || pov.title || 'Untitled POV'}
                          </h3>
                          <Badge
                            variant="outline"
                            className={`flex items-center gap-1 ${getStatusColor(pov.status)}`}
                          >
                            {getStatusIcon(pov.status)}
                            {pov.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          {pov.customer && (
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span>{pov.customer}</span>
                            </div>
                          )}

                          {pov.startDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>
                                {new Date(pov.startDate).toLocaleDateString()}
                                {pov.endDate && ` - ${new Date(pov.endDate).toLocaleDateString()}`}
                              </span>
                            </div>
                          )}

                          {pov.assignedTo && (
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span>Lead: {pov.assignedTo}</span>
                            </div>
                          )}
                        </div>

                        {pov.description && (
                          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                            {pov.description}
                          </p>
                        )}

                        {pov.objectives && pov.objectives.length > 0 && (
                          <div className="flex items-center gap-2 mt-3">
                            <div className="flex flex-wrap gap-2">
                              {pov.objectives.slice(0, 3).map((obj: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {obj.length > 30 ? `${obj.substring(0, 30)}...` : obj}
                                </Badge>
                              ))}
                              {pov.objectives.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{pov.objectives.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Progress Indicator */}
                      {pov.progress !== undefined && (
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
                                strokeDashoffset={`${2 * Math.PI * 28 * (1 - pov.progress / 100)}`}
                                className="text-orange-500"
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-bold text-gray-900">
                                {pov.progress}%
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
