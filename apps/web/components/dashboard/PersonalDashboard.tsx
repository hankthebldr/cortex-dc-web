'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserProfile } from '@cortex/db';
import { Target, CheckCircle2, Clock, TrendingUp, Plus, Loader2, AlertCircle } from 'lucide-react';
import { useDashboardMetrics, usePOVs, useTRRs, useRecentActivity } from '@/lib/hooks/use-api';

interface PersonalDashboardProps {
  user: UserProfile;
}

interface DashboardMetrics {
  activePOVs: number;
  pendingTRRs: number;
  completedProjects: number;
  successRate: number;
}

const COLORS = {
  primary: '#f97316', // orange-500
  success: '#22c55e', // green-500
  warning: '#f59e0b', // amber-500
  danger: '#ef4444', // red-500
  info: '#3b82f6', // blue-500
  secondary: '#6b7280' // gray-500
};

export const PersonalDashboard: React.FC<PersonalDashboardProps> = ({ user }) => {
  // Fetch dashboard metrics
  const { metrics, isLoading: isLoadingMetrics, isError: metricsError } = useDashboardMetrics(user.uid);

  // Fetch POVs
  const { data: povs, isLoading: isLoadingPOVs } = usePOVs(user.uid);

  // Fetch TRRs
  const { data: trrs, isLoading: isLoadingTRRs } = useTRRs(user.uid);

  // Fetch recent activity
  const { activities, isLoading: isLoadingActivity } = useRecentActivity(user.uid, 5);

  // Calculate metrics from data if API doesn't provide them
  const displayMetrics: DashboardMetrics = metrics || {
    activePOVs: povs.filter((p: any) => p.status === 'active').length,
    pendingTRRs: trrs.filter((t: any) => t.status === 'pending').length,
    completedProjects: povs.filter((p: any) => p.status === 'completed').length,
    successRate: 85, // Would need calculation logic
  };

  const isLoading = isLoadingMetrics || isLoadingPOVs || isLoadingTRRs;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.displayName || 'User'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your domain consulting activities.
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Metrics Cards */}
      {metricsError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">Failed to load metrics. Using fallback data.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active POVs</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              <>
                <div className="text-2xl font-bold">{displayMetrics.activePOVs}</div>
                <p className="text-xs text-muted-foreground">
                  {povs.length} total projects
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending TRRs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              <>
                <div className="text-2xl font-bold">{displayMetrics.pendingTRRs}</div>
                <p className="text-xs text-muted-foreground">
                  Needs attention
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              <>
                <div className="text-2xl font-bold">{displayMetrics.completedProjects}</div>
                <p className="text-xs text-muted-foreground">
                  This quarter
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              <>
                <div className="text-2xl font-bold">{displayMetrics.successRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Overall performance
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingPOVs ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : povs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No projects yet</p>
                <Link href="/pov/new">
                  <Button variant="outline" size="sm" className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Project
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {povs.slice(0, 5).map((pov: any) => (
                  <Link key={pov.id} href={`/pov/${pov.id}`}>
                    <div className="flex items-center space-x-4 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer">
                      <div className={`w-2 h-2 rounded-full ${
                        pov.status === 'active' ? 'bg-blue-500' :
                        pov.status === 'completed' ? 'bg-green-500' :
                        'bg-gray-400'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{pov.title || pov.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(pov.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={pov.status === 'active' ? 'default' : 'secondary'}>
                        {pov.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending TRRs</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTRRs ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : trrs.filter((t: any) => t.status === 'pending').length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm">All caught up!</p>
                <p className="text-xs mt-1">No pending TRRs</p>
              </div>
            ) : (
              <div className="space-y-4">
                {trrs
                  .filter((t: any) => t.status === 'pending')
                  .slice(0, 5)
                  .map((trr: any) => (
                    <Link key={trr.id} href={`/trr/${trr.id}`}>
                      <div className="flex items-center space-x-4 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer">
                        <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{trr.title || trr.name}</p>
                          <p className="text-xs text-gray-500">
                            Due: {trr.dueDate ? new Date(trr.dueDate).toLocaleDateString() : 'No due date'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
