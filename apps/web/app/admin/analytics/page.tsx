'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { eventTrackingService } from '@cortex/db';
import {
  Users, LogIn, Activity, TrendingUp, AlertCircle,
  Calendar, Clock, Monitor, Smartphone, Tablet, Loader2
} from 'lucide-react';

interface LoginAnalytics {
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  uniqueUsers: number;
  loginsByMethod: Record<string, number>;
  loginsByDay: Array<{ date: string; count: number }>;
  recentLogins: any[];
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [analytics, setAnalytics] = useState<LoginAnalytics | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();

      switch (period) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
      }

      const [loginData, activityData] = await Promise.all([
        eventTrackingService.getLoginAnalytics(startDate, endDate),
        eventTrackingService.getRecentActivity(100),
      ]);

      setAnalytics(loginData);
      setRecentActivity(activityData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getLoginMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      email: 'bg-blue-100 text-blue-800',
      google: 'bg-red-100 text-red-800',
      okta_saml: 'bg-purple-100 text-purple-800',
      okta_oauth: 'bg-purple-100 text-purple-800',
    };

    return (
      <Badge className={colors[method] || 'bg-gray-100 text-gray-800'}>
        {method.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">
            User authentication and activity analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={period === 'week' ? 'default' : 'outline'}
            onClick={() => setPeriod('week')}
          >
            Week
          </Button>
          <Button
            variant={period === 'month' ? 'default' : 'outline'}
            onClick={() => setPeriod('month')}
          >
            Month
          </Button>
          <Button
            variant={period === 'quarter' ? 'default' : 'outline'}
            onClick={() => setPeriod('quarter')}
          >
            Quarter
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logins</CardTitle>
            <LogIn className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalLogins || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.uniqueUsers || 0} unique users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics?.totalLogins
                ? Math.round(
                    (analytics.successfulLogins / analytics.totalLogins) * 100
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics?.successfulLogins || 0} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {analytics?.failedLogins || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics?.totalLogins
                ? Math.round((analytics.failedLogins / analytics.totalLogins) * 100)
                : 0}
              % failure rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.uniqueUsers || 0}</div>
            <p className="text-xs text-muted-foreground">This {period}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Login Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Login Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics?.loginsByMethod || {}).map(([method, count]) => (
                <div key={method} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getLoginMethodBadge(method)}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {Math.round(
                        ((count as number) / (analytics?.totalLogins || 1)) * 100
                      )}
                      %
                    </span>
                    <span className="text-lg font-bold">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Login Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Login Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {analytics?.loginsByDay.slice(-14).map((day) => (
                <div key={day.date} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{day.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 bg-blue-500 rounded"
                      style={{
                        width: `${
                          (day.count / Math.max(...(analytics?.loginsByDay.map((d) => d.count) || [1]))) * 100
                        }px`,
                        minWidth: '4px',
                      }}
                    />
                    <span className="text-sm font-medium w-12 text-right">
                      {day.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Logins */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Login Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 text-sm font-medium text-gray-600">
                    Time
                  </th>
                  <th className="text-left p-2 text-sm font-medium text-gray-600">
                    Email
                  </th>
                  <th className="text-left p-2 text-sm font-medium text-gray-600">
                    Method
                  </th>
                  <th className="text-left p-2 text-sm font-medium text-gray-600">
                    Device
                  </th>
                  <th className="text-left p-2 text-sm font-medium text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {analytics?.recentLogins.slice(0, 20).map((login: any, index: number) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {new Date(login.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="p-2 text-sm">{login.email}</td>
                    <td className="p-2">{getLoginMethodBadge(login.loginMethod)}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(login.deviceType)}
                        <span className="text-sm">{login.deviceType || 'unknown'}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      {login.success ? (
                        <Badge className="bg-green-100 text-green-800">Success</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">Failed</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent User Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentActivity.slice(0, 50).map((activity: any, index: number) => (
              <div
                key={index}
                className="flex items-start justify-between p-3 hover:bg-gray-50 rounded-lg border"
              >
                <div className="flex items-start gap-3">
                  <Activity className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-500">
                      {activity.entityType && `${activity.entityType}: ${activity.entityTitle || activity.entityId}`}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">{activity.userId?.substring(0, 8)}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
