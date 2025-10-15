'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserProfile } from '@cortex/db';
import { Users, Target, CheckCircle2, Clock, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { useDashboardMetrics, usePOVs, useTRRs, useListData } from '@/lib/hooks/use-api';

interface TeamDashboardProps {
  user: UserProfile;
}

interface TeamMetrics {
  totalTeamMembers: number;
  activeProjects: number;
  pendingReviews: number;
  completionRate: number;
}

export function TeamDashboard({ user }: TeamDashboardProps) {
  // Fetch team metrics
  const { metrics, isLoading: isLoadingMetrics, isError: metricsError } = useDashboardMetrics(user.uid);

  // Fetch all POVs for team oversight
  const { data: allPOVs, isLoading: isLoadingPOVs } = usePOVs();

  // Fetch all TRRs for team oversight
  const { data: allTRRs, isLoading: isLoadingTRRs } = useTRRs();

  // Fetch team members (if teams collection exists)
  const { data: teamMembers, isLoading: isLoadingTeam } = useListData('users', {
    filters: { role: 'user' },
    limit: 10,
  });

  const isLoading = isLoadingMetrics || isLoadingPOVs || isLoadingTRRs || isLoadingTeam;

  // Calculate team metrics
  const teamMetrics: TeamMetrics = metrics?.team || {
    totalTeamMembers: teamMembers.length,
    activeProjects: allPOVs.filter((p: any) => p.status === 'active').length,
    pendingReviews: allTRRs.filter((t: any) => t.status === 'pending').length,
    completionRate: 75, // Would need proper calculation
  };

  // Get projects requiring attention (high priority or overdue)
  const projectsNeedingAttention = allPOVs
    .filter((p: any) => p.status === 'active' && (p.priority === 'high' || p.isOverdue))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Team Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your team's domain consulting activities and performance.
          </p>
        </div>
        <Button>
          <Users className="w-4 h-4 mr-2" />
          Manage Team
        </Button>
      </div>

      {/* Error Alert */}
      {metricsError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">Failed to load team metrics. Using cached data.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              <>
                <div className="text-2xl font-bold">{teamMetrics.totalTeamMembers}</div>
                <p className="text-xs text-muted-foreground">
                  Active contributors
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              <>
                <div className="text-2xl font-bold">{teamMetrics.activeProjects}</div>
                <p className="text-xs text-muted-foreground">
                  Across team
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              <>
                <div className="text-2xl font-bold">{teamMetrics.pendingReviews}</div>
                <p className="text-xs text-muted-foreground">
                  Require attention
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              <>
                <div className="text-2xl font-bold">{teamMetrics.completionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Team average
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects Needing Attention */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Projects Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingPOVs ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : projectsNeedingAttention.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm">All projects on track!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {projectsNeedingAttention.map((pov: any) => (
                  <Link key={pov.id} href={`/pov/${pov.id}`}>
                    <div className="flex items-start justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-gray-200">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{pov.title || pov.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Assigned to: {pov.assignedTo || 'Unassigned'}
                        </p>
                      </div>
                      <Badge variant="destructive" className="ml-2 flex-shrink-0">
                        {pov.priority || 'High'}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Team Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingPOVs ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-4">
                {allPOVs.slice(0, 5).map((pov: any) => (
                  <div key={pov.id} className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${
                      pov.status === 'active' ? 'bg-blue-500' :
                      pov.status === 'completed' ? 'bg-green-500' :
                      'bg-gray-400'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{pov.title || pov.name}</p>
                      <p className="text-xs text-gray-500">
                        {pov.assignedTo || 'Team'} • {new Date(pov.updatedAt || pov.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={pov.status === 'active' ? 'default' : 'secondary'}>
                      {pov.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTeam ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No team members yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {teamMembers.map((member: any) => (
                  <div key={member.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-medium">
                      {member.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{member.name || member.email}</p>
                      <p className="text-xs text-gray-500">{member.role || 'User'}</p>
                    </div>
                    <Badge variant="outline">
                      {member.status || 'Active'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending TRRs */}
        <Card>
          <CardHeader>
            <CardTitle>Pending TRR Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTRRs ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : allTRRs.filter((t: any) => t.status === 'pending').length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm">All TRRs reviewed!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allTRRs
                  .filter((t: any) => t.status === 'pending')
                  .slice(0, 5)
                  .map((trr: any) => (
                    <Link key={trr.id} href={`/trr/${trr.id}`}>
                      <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-gray-200">
                        <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{trr.title || trr.name}</p>
                          <p className="text-xs text-gray-500">
                            Submitted: {new Date(trr.createdAt).toLocaleDateString()}
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
}
