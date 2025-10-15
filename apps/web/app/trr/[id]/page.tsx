'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTRR } from '@/lib/hooks/use-api';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Save,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Calendar,
  Users,
  AlertTriangle,
  Download,
  Share2,
} from 'lucide-react';

/**
 * TRR Detail Page
 * Displays comprehensive information about a single Technical Readiness Review
 */
export default function TRRDetailPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <TRRDetailContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function TRRDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'findings' | 'recommendations' | 'approvals'>('details');

  // Fetch TRR data using SWR
  const { data: trr, isLoading, isError, error, mutate } = useTRR(id);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    // TODO: Implement save functionality
    setIsEditing(false);
    mutate(); // Revalidate data
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this TRR?')) {
      // TODO: Implement delete functionality
      router.push('/trr');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'in-review':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate: string) => {
    return dueDate && new Date(dueDate) < new Date();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (isError || !trr) {
    return (
      <div className="space-y-6">
        <Link href="/trr">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to TRRs
          </Button>
        </Link>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">
                {error?.message || 'TRR not found'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/trr">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-3xl font-bold text-gray-900">
                {trr.name || trr.title || 'Untitled TRR'}
              </h1>
              <Badge className={`${getStatusColor(trr.status)} border`}>
                {trr.status}
              </Badge>
              {trr.priority && (
                <Badge className={getPriorityColor(trr.priority)}>
                  {trr.priority} priority
                </Badge>
              )}
              {trr.dueDate && isOverdue(trr.dueDate) && trr.status !== 'completed' && (
                <Badge className="bg-red-100 text-red-800 border-red-300">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>
            <p className="text-gray-600">ID: {trr.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2 text-red-600" />
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {trr.completionPercentage || 0}%
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {trr.createdAt ? new Date(trr.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {trr.dueDate ? new Date(trr.dueDate).toLocaleDateString() : 'Not set'}
                </p>
              </div>
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Assigned To</p>
                <p className="text-lg font-semibold text-gray-900 mt-1 truncate">
                  {trr.assignedTo || 'Unassigned'}
                </p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <div className="flex space-x-1 border-b border-gray-200">
            {(['details', 'findings', 'recommendations', 'approvals'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                  activeTab === tab
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Project Information */}
              {trr.projectName && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Information</h3>
                  <Card className="bg-gray-50">
                    <CardContent className="pt-6">
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-600">Project Name</dt>
                          <dd className="text-base text-gray-900 mt-1">{trr.projectName}</dd>
                        </div>
                        {trr.projectId && (
                          <div>
                            <dt className="text-sm font-medium text-gray-600">Project ID</dt>
                            <dd className="text-base text-gray-900 mt-1">{trr.projectId}</dd>
                          </div>
                        )}
                      </dl>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Description */}
              {trr.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <Card className="bg-gray-50">
                    <CardContent className="pt-6">
                      <p className="text-gray-700 whitespace-pre-wrap">{trr.description}</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Scope */}
              {trr.scope && trr.scope.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Review Scope</h3>
                  <Card className="bg-gray-50">
                    <CardContent className="pt-6">
                      <ul className="space-y-2">
                        {trr.scope.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Technical Requirements */}
              {trr.technicalRequirements && trr.technicalRequirements.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Technical Requirements</h3>
                  <Card className="bg-gray-50">
                    <CardContent className="pt-6">
                      <ul className="space-y-2">
                        {trr.technicalRequirements.map((req: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Findings Tab */}
          {activeTab === 'findings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Review Findings</h3>
                {isEditing && (
                  <Button size="sm">
                    Add Finding
                  </Button>
                )}
              </div>
              {trr.findings && trr.findings.length > 0 ? (
                <div className="space-y-4">
                  {trr.findings.map((finding: any, idx: number) => (
                    <Card key={idx} className={`border-l-4 ${
                      finding.severity === 'critical' ? 'border-l-red-500 bg-red-50' :
                      finding.severity === 'high' ? 'border-l-orange-500 bg-orange-50' :
                      finding.severity === 'medium' ? 'border-l-yellow-500 bg-yellow-50' :
                      'border-l-blue-500 bg-blue-50'
                    }`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{finding.title || `Finding ${idx + 1}`}</h4>
                          <Badge className={
                            finding.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            finding.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            finding.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {finding.severity || 'info'}
                          </Badge>
                        </div>
                        <p className="text-gray-700 text-sm">{finding.description || finding.content}</p>
                        {finding.impact && (
                          <div className="mt-3 p-3 bg-white rounded border">
                            <p className="text-xs font-medium text-gray-600 mb-1">Impact:</p>
                            <p className="text-sm text-gray-700">{finding.impact}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">No findings recorded yet</p>
                </div>
              )}
            </div>
          )}

          {/* Recommendations Tab */}
          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
                {isEditing && (
                  <Button size="sm">
                    Add Recommendation
                  </Button>
                )}
              </div>
              {trr.recommendations && trr.recommendations.length > 0 ? (
                <div className="space-y-3">
                  {trr.recommendations.map((rec: any, idx: number) => (
                    <Card key={idx} className="bg-gray-50">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            rec.priority === 'high' ? 'bg-red-100 text-red-600' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">
                              {rec.title || `Recommendation ${idx + 1}`}
                            </h4>
                            <p className="text-sm text-gray-700">{rec.description || rec.content}</p>
                            {rec.actionItems && rec.actionItems.length > 0 && (
                              <div className="mt-3">
                                <p className="text-xs font-medium text-gray-600 mb-2">Action Items:</p>
                                <ul className="space-y-1">
                                  {rec.actionItems.map((item: string, i: number) => (
                                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                      <span className="text-orange-500">→</span>
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">No recommendations yet</p>
                </div>
              )}
            </div>
          )}

          {/* Approvals Tab */}
          {activeTab === 'approvals' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Status</h3>
              {trr.approvals && trr.approvals.length > 0 ? (
                <div className="space-y-3">
                  {trr.approvals.map((approval: any, idx: number) => (
                    <Card key={idx} className="bg-gray-50">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {approval.approver?.charAt(0).toUpperCase() || 'A'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{approval.approver || 'Unknown Approver'}</p>
                              <p className="text-sm text-gray-600">{approval.role || 'Approver'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={
                              approval.status === 'approved' ? 'bg-green-100 text-green-800' :
                              approval.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>
                              {approval.status || 'pending'}
                            </Badge>
                            {approval.date && (
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(approval.date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        {approval.comments && (
                          <div className="mt-3 p-3 bg-white rounded border">
                            <p className="text-sm text-gray-700">{approval.comments}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">No approvals requested yet</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
