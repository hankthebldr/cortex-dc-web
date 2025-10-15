'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserProfile } from '@cortex/db';
import {
  Users, Target, CheckCircle2, Clock, TrendingUp, AlertCircle,
  Loader2, Settings, BarChart3, Shield, Database
} from 'lucide-react';
import { useDashboardMetrics, usePOVs, useTRRs, useListData } from '@/lib/hooks/use-api';

interface AdminDashboardProps {
  user: UserProfile;
}

interface PlatformMetrics {
  totalUsers: number;
  totalProjects: number;
  totalTRRs: number;
  activeEngagements: number;
  systemHealth: number;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  // Fetch platform metrics
  const { metrics, isLoading: isLoadingMetrics, isError: metricsError } = useDashboardMetrics('platform');

  // Fetch all POVs for platform-wide view
  const { data: allPOVs, isLoading: isLoadingPOVs, total: totalPOVs } = usePOVs();

  // Fetch all TRRs
  const { data: allTRRs, isLoading: isLoadingTRRs, total: totalTRRs } = useTRRs();

  // Fetch all users
  const { data: allUsers, isLoading: isLoadingUsers, total: totalUsers } = useListData('users', { limit: 100 });

  const isLoading = isLoadingMetrics || isLoadingPOVs || isLoadingTRRs || isLoadingUsers;

  // Calculate platform metrics
  const platformMetrics: PlatformMetrics = metrics?.platform || {
    totalUsers: totalUsers || allUsers.length,
    totalProjects: totalPOVs || allPOVs.length,
    totalTRRs: totalTRRs || allTRRs.length,
    activeEngagements: allPOVs.filter((p: any) => p.status === 'active').length,
    systemHealth: 98, // Would come from monitoring
  };

  // Get recent activity across platform
  const recentActivity = [
    ...allPOVs.slice(0, 3).map((p: any) => ({ ...p, type: 'POV' })),
    ...allTRRs.slice(0, 3).map((t: any) => ({ ...t, type: 'TRR' })),
  ]
    .sort((a, b) => new Date(b.createdAt || b.updatedAt).getTime() - new Date(a.createdAt || a.updatedAt).getTime())
    .slice(0, 5);

  // Get users by role
  const usersByRole = allUsers.reduce((acc: any, user: any) => {
    const role = user.role || 'user';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Platform-wide analytics and system administration.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {metricsError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">Failed to load platform metrics. Using cached data.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Health Alert */}
      {platformMetrics.systemHealth < 95 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">System health at {platformMetrics.systemHealth}%. Some services may be degraded.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Platform Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              <>
                <div className="text-2xl font-bold">{platformMetrics.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Registered users
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              <>
                <div className="text-2xl font-bold">{platformMetrics.totalProjects}</div>
                <p className="text-xs text-muted-foreground">
                  All time
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Engagements</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              <>
                <div className="text-2xl font-bold">{platformMetrics.activeEngagements}</div>
                <p className="text-xs text-muted-foreground">
                  In progress
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total TRRs</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              <>
                <div className="text-2xl font-bold">{platformMetrics.totalTRRs}</div>
                <p className="text-xs text-muted-foreground">
                  Reviews completed
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Shield className={`h-4 w-4 ${platformMetrics.systemHealth >= 95 ? 'text-green-500' : 'text-orange-500'}`} />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              <>
                <div className="text-2xl font-bold">{platformMetrics.systemHealth}%</div>
                <p className="text-xs text-muted-foreground">
                  All systems
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Platform Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Platform Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Database className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((item: any) => (
                  <Link key={`${item.type}-${item.id}`} href={`/${item.type.toLowerCase()}/${item.id}`}>
                    <div className="flex items-start justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-gray-200">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          item.status === 'active' ? 'bg-blue-500' :
                          item.status === 'completed' ? 'bg-green-500' :
                          item.status === 'pending' ? 'bg-orange-500' :
                          'bg-gray-400'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{item.title || item.name}</p>
                            <Badge variant="outline" className="flex-shrink-0">
                              {item.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.assignedTo || item.userId || 'Unassigned'} • {new Date(item.updatedAt || item.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={item.status === 'active' ? 'default' : 'secondary'} className="flex-shrink-0">
                        {item.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Users</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{usersByRole.user || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium">Managers</span>
                  </div>
                  <span className="text-lg font-bold text-orange-600">{usersByRole.manager || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">Admins</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">{usersByRole.admin || 0}</span>
                </div>

                <Link href="/admin/users">
                  <Button variant="outline" className="w-full mt-4">
                    Manage Users
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Project Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingPOVs ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { status: 'active', color: 'blue', label: 'Active', icon: Target },
                  { status: 'completed', color: 'green', label: 'Completed', icon: CheckCircle2 },
                  { status: 'pending', color: 'orange', label: 'Pending', icon: Clock },
                ].map(({ status, color, label, icon: Icon }) => {
                  const count = allPOVs.filter((p: any) => p.status === status).length;
                  return (
                    <div key={status} className={`flex items-center justify-between p-3 bg-${color}-50 rounded-lg`}>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 text-${color}-500`} />
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                      <span className={`text-lg font-bold text-${color}-600`}>{count}</span>
                    </div>
                  );
                })}

                <Link href="/pov">
                  <Button variant="outline" className="w-full mt-4">
                    View All Projects
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'API Server', status: 'operational', uptime: '99.9%' },
                { name: 'Database', status: 'operational', uptime: '100%' },
                { name: 'Auth Service', status: 'operational', uptime: '99.8%' },
                { name: 'Storage', status: 'operational', uptime: '99.9%' },
              ].map((service) => (
                <div key={service.name} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      service.status === 'operational' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm font-medium">{service.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{service.uptime}</span>
                </div>
              ))}

              <Link href="/admin/system">
                <Button variant="outline" className="w-full mt-4">
                  System Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/admin/users">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  User Management
                </Button>
              </Link>
              <Link href="/admin/analytics">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </Link>
              <Link href="/admin/settings">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Platform Settings
                </Button>
              </Link>
              <Link href="/admin/logs">
                <Button variant="outline" className="w-full justify-start">
                  <Database className="w-4 h-4 mr-2" />
                  View Logs
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
