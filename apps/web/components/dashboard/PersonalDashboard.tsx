'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectCard } from '@cortex-dc/ui/components/project/ProjectCard';
import { ProjectTimeline } from '@cortex-dc/ui/components/project/ProjectTimeline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import {
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Calendar,
  Plus,
  FileText,
  Users,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserProfile } from '@cortex/db/types/auth';
import { Project, POV, TRR, TimelineEvent, POVStatus, TRRStatus } from '@cortex/db/types/projects';

interface PersonalDashboardProps {
  user: UserProfile;
}

interface DashboardMetrics {
  activePOVs: number;
  pendingTRRs: number;
  completedProjects: number;
  successRate: number;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [povs, setPOVs] = useState<POV[]>([]);
  const [trrs, setTRRs] = useState<TRR[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activePOVs: 0,
    pendingTRRs: 0,
    completedProjects: 0,
    successRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user.uid]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API calls
      // const [projectsData, povsData, trrsData, timelineData] = await Promise.all([
      //   fetchUserProjects(user.uid),
      //   fetchUserPOVs(user.uid),
      //   fetchUserTRRs(user.uid),
      //   fetchUserTimeline(user.uid)
      // ]);
      
      // Mock data for demonstration
      const mockProjects: Project[] = [
        {
          id: '1',
          title: 'ACME Corp Security Assessment',
          description: 'Comprehensive security evaluation for Fortune 500 company',
          customer: {
            name: 'ACME Corporation',
            industry: 'Technology',
            size: 'enterprise',
            region: 'North America'
          },
          status: 'active' as const,
          priority: 'high' as const,
          owner: user.uid,
          team: [user.uid, 'user2', 'user3'],
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-03-15'),
          estimatedValue: 150000,
          povIds: ['1', '2'],
          trrIds: ['1'],
          scenarioIds: ['1', '2', '3'],
          tags: ['security', 'enterprise', 'priority'],
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date(),
          createdBy: user.uid,
          lastModifiedBy: user.uid
        }
      ];

      const mockPOVs: POV[] = [
        {
          id: '1',
          projectId: '1',
          title: 'Network Security POV',
          description: 'Prove network security capabilities',
          status: POVStatus.IN_PROGRESS,
          priority: 'high' as const,
          objectives: [
            {
              id: '1',
              description: 'Demonstrate threat detection',
              success_criteria: 'Detect 95% of threats in test environment',
              status: 'completed',
              weight: 40
            },
            {
              id: '2',
              description: 'Response time validation',
              success_criteria: 'Average response time < 5 minutes',
              status: 'in_progress',
              weight: 35
            }
          ],
          phases: [
            {
              id: '1',
              name: 'Planning',
              startDate: new Date('2024-01-15'),
              endDate: new Date('2024-01-20'),
              status: 'done' as const,
              tasks: ['task1', 'task2']
            },
            {
              id: '2',
              name: 'Implementation',
              startDate: new Date('2024-01-21'),
              status: 'in_progress' as const,
              tasks: ['task3', 'task4']
            }
          ],
          owner: user.uid,
          team: [user.uid],
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date(),
          createdBy: user.uid,
          lastModifiedBy: user.uid
        }
      ];

      const mockTRRs: TRR[] = [
        {
          id: '1',
          projectId: '1',
          povId: '1',
          title: 'Security Assessment TRR',
          description: 'Technical risk review for security implementation',
          status: TRRStatus.PENDING_VALIDATION,
          priority: 'medium' as const,
          riskAssessment: {
            overall_score: 7.5,
            categories: [
              {
                category: 'Security',
                score: 8,
                description: 'Strong security implementation'
              }
            ]
          },
          findings: [
            {
              id: '1',
              title: 'Authentication Configuration',
              description: 'MFA not enabled for all users',
              severity: 'medium' as const,
              category: 'Authentication',
              status: 'open' as const
            }
          ],
          owner: user.uid,
          reviewers: ['reviewer1'],
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date(),
          createdBy: user.uid,
          lastModifiedBy: user.uid
        }
      ];

      setProjects(mockProjects);
      setPOVs(mockPOVs);
      setTRRs(mockTRRs);
      
      // Calculate metrics
      const activePOVsCount = mockPOVs.filter(pov => 
        pov.status === POVStatus.IN_PROGRESS || pov.status === POVStatus.TESTING
      ).length;
      
      const pendingTRRsCount = mockTRRs.filter(trr =>
        trr.status === TRRStatus.PENDING_VALIDATION || trr.status === TRRStatus.IN_REVIEW
      ).length;

      const completedProjectsCount = mockProjects.filter(project => 
        project.status === 'completed'
      ).length;

      setMetrics({
        activePOVs: activePOVsCount,
        pendingTRRs: pendingTRRsCount,
        completedProjects: completedProjectsCount,
        successRate: 89
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const povStatusData: ChartData[] = [
    { name: 'In Progress', value: 7, color: COLORS.info },
    { name: 'At Risk', value: 3, color: COLORS.danger },
    { name: 'Completed', value: 2, color: COLORS.success },
    { name: 'Planning', value: 1, color: COLORS.secondary }
  ];

  const monthlyProgressData = [
    { month: 'Jan', povs: 4, trrs: 2 },
    { month: 'Feb', povs: 7, trrs: 5 },
    { month: 'Mar', povs: 6, trrs: 3 },
    { month: 'Apr', povs: 9, trrs: 7 },
    { month: 'May', povs: 8, trrs: 4 },
    { month: 'Jun', povs: 12, trrs: 8 }
  ];

  if (isLoading) {
    return <div className="animate-pulse">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.displayName}
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your projects today
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active POVs</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.activePOVs}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +15% from last month
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <Target className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending TRRs</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.pendingTRRs}</p>
                <p className="text-xs text-orange-600">
                  5 high priority
                </p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.successRate}%</p>
                <p className="text-xs text-gray-500">
                  Goal: 85%
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Platform Health</p>
                <p className="text-2xl font-bold text-gray-900">99.9%</p>
                <p className="text-xs text-green-600">
                  All systems operational
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="povs">POVs</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* POV Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  POV Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={povStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {povStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="w-5 h-5" />
                  Monthly Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyProgressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="povs" fill={COLORS.primary} name="POVs" />
                    <Bar dataKey="trrs" fill={COLORS.info} name="TRRs" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="bg-blue-500 p-2 rounded-full">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">POV phase completed</p>
                    <p className="text-xs text-gray-600">Network Security POV - Planning phase</p>
                  </div>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <div className="bg-orange-500 p-2 rounded-full">
                    <AlertTriangle className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">TRR validation required</p>
                    <p className="text-xs text-gray-600">Security Assessment TRR needs review</p>
                  </div>
                  <span className="text-xs text-gray-500">1 day ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">My Projects</h2>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project}
                progress={65}
                health="good"
                povCount={2}
                trrCount={1}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="povs" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">My POVs</h2>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              New POV
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {povs.map((pov) => (
              <Card key={pov.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{pov.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{pov.description}</p>
                    </div>
                    <Badge variant={pov.status === POVStatus.COMPLETED ? 'default' : 'secondary'}>
                      {pov.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>65%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '65%' }} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{pov.phases.length} phases</span>
                      <span>{pov.objectives.length} objectives</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <ProjectTimeline events={timelineEvents} />
        </TabsContent>
      </Tabs>
    </div>
  );
};