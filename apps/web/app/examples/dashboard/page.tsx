/**
 * Example Dashboard Page
 *
 * Demonstrates all the modernized design system components
 */

'use client';

import React, { useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Progress,
  Stepper,
  DataTable,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Skeleton,
  SkeletonCard,
} from '@/components/design-system';
import { MetricCard, ActivityFeed, DashboardGrid } from '@/components/widgets';
import { LineChart, BarChart, AreaChart, PieChart, DonutChart } from '@/components/charts';
import type {
  MetricData,
  Activity,
  DashboardWidget,
  ChartData,
  ChartConfig,
  PieDataItem
} from '@/lib/design-system/types';
import { TrendingUp, TrendingDown, Users, DollarSign, Activity as ActivityIcon, Package, MoreVertical, Download, Share2, Settings } from 'lucide-react';

export default function ExampleDashboardPage() {
  const [isLoading, setIsLoading] = useState(false);

  // Sample metric data
  const metrics: MetricData[] = [
    {
      label: 'Total Revenue',
      value: '$45,231.89',
      previousValue: '$42,000.00',
      change: 7.7,
      trend: 'up',
      format: 'currency',
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      label: 'Active Users',
      value: 2350,
      previousValue: 2100,
      change: 11.9,
      trend: 'up',
      format: 'number',
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: 'Conversion Rate',
      value: '3.2%',
      previousValue: '3.5%',
      change: -8.6,
      trend: 'down',
      format: 'percentage',
      icon: <TrendingDown className="h-5 w-5" />,
    },
    {
      label: 'Projects',
      value: 12,
      previousValue: 10,
      change: 20.0,
      trend: 'up',
      format: 'number',
      icon: <Package className="h-5 w-5" />,
    },
  ];

  // Sample activity data
  const activities: Activity[] = [
    {
      id: '1',
      type: 'create',
      actor: { id: 'user1', name: 'John Doe', avatar: '/avatars/john.jpg' },
      action: 'created',
      target: { type: 'pov', id: 'pov1', name: 'Enterprise Security Assessment' },
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      metadata: { documentTitle: 'Enterprise Security Assessment' },
    },
    {
      id: '2',
      type: 'update',
      actor: { id: 'user2', name: 'Jane Smith', avatar: '/avatars/jane.jpg' },
      action: 'updated',
      target: { type: 'trr', id: 'trr1', name: 'Q4 Risk Review' },
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      metadata: { findingsCount: 3 },
    },
    {
      id: '3',
      type: 'comment',
      actor: { id: 'user3', name: 'Bob Johnson', avatar: '/avatars/bob.jpg' },
      action: 'commented on',
      target: { type: 'finding', id: 'finding1', name: 'Critical Security Gap' },
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      metadata: { comment: 'We should prioritize these findings' },
    },
    {
      id: '4',
      type: 'status_change',
      actor: { id: 'user4', name: 'Alice Williams', avatar: '/avatars/alice.jpg' },
      action: 'changed status of',
      target: { type: 'project', id: 'proj1', name: 'Cloud Migration' },
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      metadata: { from: 'Draft', to: 'In Review' },
    },
  ];

  // Sample chart data for line/bar/area charts
  const chartData: ChartData[] = [
    { month: 'Jan', revenue: 4000, expenses: 2400, profit: 1600 },
    { month: 'Feb', revenue: 3000, expenses: 1398, profit: 1602 },
    { month: 'Mar', revenue: 2000, expenses: 9800, profit: -7800 },
    { month: 'Apr', revenue: 2780, expenses: 3908, profit: -1128 },
    { month: 'May', revenue: 1890, expenses: 4800, profit: -2910 },
    { month: 'Jun', revenue: 2390, expenses: 3800, profit: -1410 },
    { month: 'Jul', revenue: 3490, expenses: 4300, profit: -810 },
  ];

  const chartConfig: ChartConfig = {
    xAxisKey: 'month',
    series: [
      { key: 'revenue', name: 'Revenue', color: 'primary' },
      { key: 'expenses', name: 'Expenses', color: 'danger' },
      { key: 'profit', name: 'Profit', color: 'success' },
    ],
  };

  // Sample pie chart data
  const pieData: PieDataItem[] = [
    { name: 'Enterprise', value: 45, color: 'rgb(249, 115, 22)' },
    { name: 'Mid-Market', value: 30, color: 'rgb(59, 130, 246)' },
    { name: 'SMB', value: 15, color: 'rgb(34, 197, 94)' },
    { name: 'Startup', value: 10, color: 'rgb(251, 191, 36)' },
  ];

  // Sample table data
  const tableData = [
    { id: 1, name: 'Project Alpha', status: 'Active', priority: 'High', progress: 75 },
    { id: 2, name: 'Project Beta', status: 'In Review', priority: 'Medium', progress: 50 },
    { id: 3, name: 'Project Gamma', status: 'Completed', priority: 'Low', progress: 100 },
    { id: 4, name: 'Project Delta', status: 'Active', priority: 'High', progress: 30 },
    { id: 5, name: 'Project Epsilon', status: 'On Hold', priority: 'Medium', progress: 60 },
  ];

  const tableColumns: any[] = [
    {
      accessorKey: 'name',
      header: 'Project Name',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const value = row.getValue('status') as string;
        if (value === 'Active') return <Badge color="success">{value}</Badge>;
        if (value === 'Completed') return <Badge color="info">{value}</Badge>;
        return <Badge color="warning">{value}</Badge>;
      },
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }: any) => {
        const value = row.getValue('priority') as string;
        if (value === 'High') return <Badge color="danger">{value}</Badge>;
        if (value === 'Medium') return <Badge color="warning">{value}</Badge>;
        return <Badge color="gray">{value}</Badge>;
      },
    },
    {
      accessorKey: 'progress',
      header: 'Progress',
      cell: ({ row }: any) => {
        const value = row.getValue('progress') as number;
        return (
          <div className="flex items-center gap-2">
            <Progress
              value={value}
              max={100}
              color={value === 100 ? 'success' : 'primary'}
              className="h-1"
            />
            <span className="text-sm text-gray-600">{value}%</span>
          </div>
        );
      },
    },
  ];

  // Stepper example
  const steps = [
    { label: 'Planning', description: 'Define project scope' },
    { label: 'Design', description: 'Create mockups' },
    { label: 'Development', description: 'Build features' },
    { label: 'Review', description: 'Quality assurance' },
    { label: 'Deploy', description: 'Release to production' },
  ];

  const [currentStep, setCurrentStep] = useState(2);

  // Dashboard widget example
  const [widgets, setWidgets] = useState<DashboardWidget[]>([
    {
      id: 'widget-1',
      type: 'metric',
      title: 'Active Users',
      position: { x: 0, y: 0, width: 3, height: 1 },
      config: { value: '2,350', label: 'Total Active Users' },
    },
    {
      id: 'widget-2',
      type: 'chart',
      title: 'Revenue Trend',
      position: { x: 3, y: 0, width: 6, height: 2 },
      config: {},
    },
    {
      id: 'widget-3',
      type: 'activity',
      title: 'Recent Activity',
      position: { x: 9, y: 0, width: 3, height: 2 },
      config: {},
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Examples
            </h1>
            <p className="text-gray-600 mt-1">
              Showcasing the modernized design system components
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button startIcon={<Download className="h-4 w-4" />}>
              Export
            </Button>
            <Button startIcon={<Share2 className="h-4 w-4" />}>
              Share
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Refresh Data</DropdownMenuItem>
                <DropdownMenuItem>Clear Cache</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Monthly revenue, expenses, and profit</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart data={chartData} config={chartConfig} height={300} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Quarterly performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <AreaChart data={chartData} config={chartConfig} height={300} stacked />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Comparison</CardTitle>
              <CardDescription>Revenue vs Expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                data={chartData}
                config={{
                  xAxisKey: 'month',
                  series: [
                    { key: 'revenue', name: 'Revenue', color: 'primary' },
                    { key: 'expenses', name: 'Expenses', color: 'danger' },
                  ],
                }}
                height={300}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Segments</CardTitle>
              <CardDescription>Distribution by company size</CardDescription>
            </CardHeader>
            <CardContent>
              <DonutChart data={pieData} height={300} showLabels />
            </CardContent>
          </Card>
        </div>

        {/* Stepper Example */}
        <Card>
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
            <CardDescription>Track your project through each phase</CardDescription>
          </CardHeader>
          <CardContent>
            <Stepper
              steps={steps}
              currentStep={currentStep}
              clickable
              onStepClick={setCurrentStep}
            />
            <div className="flex gap-3 mt-6">
              <Button
                disabled={currentStep === 0}
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              >
                Previous
              </Button>
              <Button
                disabled={currentStep === steps.length - 1}
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Table Example */}
        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
            <CardDescription>Manage and track all your projects</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={tableColumns}
              data={tableData}
              searchable
              paginated
              selectable
            />
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Customizable Dashboard</CardTitle>
                <CardDescription>Drag and drop to rearrange widgets</CardDescription>
              </CardHeader>
              <CardContent>
                <DashboardGrid
                  widgets={widgets}
                  onWidgetsChange={setWidgets}
                  editable
                  columns={12}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityFeed activities={activities} limit={5} />
            </CardContent>
          </Card>
        </div>

        {/* Dialog Example */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Components</CardTitle>
            <CardDescription>Dialogs, modals, and more</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                  </DialogHeader>
                  <DialogBody>
                    <p className="text-gray-600">
                      This is an example dialog. You can put any content here,
                      including forms, images, or complex layouts.
                    </p>
                  </DialogBody>
                  <DialogFooter>
                    <Button>Cancel</Button>
                    <Button>Create Project</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                loading={isLoading}
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => setIsLoading(false), 2000);
                }}
              >
                Test Loading State
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading States */}
        <Card>
          <CardHeader>
            <CardTitle>Loading States</CardTitle>
            <CardDescription>Skeleton placeholders for better UX</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
