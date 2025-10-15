'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePOV } from '@/lib/hooks/use-api';
import { TerraformDownloadPanel } from '@/components/scenarios/TerraformDownloadButton';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Save,
  X,
  Loader2,
  AlertCircle,
  Target,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  TrendingUp,
  Building,
  Mail,
  Phone,
} from 'lucide-react';

/**
 * POV Detail Page
 * Displays comprehensive information about a single POV project
 */
export default function POVDetailPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <POVDetailContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function POVDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'team' | 'deliverables' | 'deployment'>('overview');

  // Fetch POV data using SWR
  const { data: pov, isLoading, isError, error, mutate } = usePOV(id);

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
    if (confirm('Are you sure you want to delete this POV project?')) {
      // TODO: Implement delete functionality
      router.push('/pov');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (isError || !pov) {
    return (
      <div className="space-y-6">
        <Link href="/pov">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to POVs
          </Button>
        </Link>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">
                {error?.message || 'POV project not found'}
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
          <Link href="/pov">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {pov.name || pov.title || 'Untitled POV'}
              </h1>
              <Badge className={`${getStatusColor(pov.status)} border`}>
                {pov.status}
              </Badge>
            </div>
            <p className="text-gray-600">ID: {pov.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
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
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {pov.progress || 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {pov.startDate ? new Date(pov.startDate).toLocaleDateString() : 'Not set'}
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
                <p className="text-sm text-gray-600">End Date</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {pov.endDate ? new Date(pov.endDate).toLocaleDateString() : 'Not set'}
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
                <p className="text-sm text-gray-600">Team Lead</p>
                <p className="text-lg font-semibold text-gray-900 mt-1 truncate">
                  {pov.assignedTo || 'Unassigned'}
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
            {(['overview', 'timeline', 'team', 'deliverables', 'deployment'] as const).map((tab) => (
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
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Customer Information */}
              {pov.customer && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Building className="w-5 h-5 text-orange-500" />
                    Customer Information
                  </h3>
                  <Card className="bg-gray-50">
                    <CardContent className="pt-6">
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-600">Customer Name</dt>
                          <dd className="text-base text-gray-900 mt-1">{pov.customer}</dd>
                        </div>
                        {pov.industry && (
                          <div>
                            <dt className="text-sm font-medium text-gray-600">Industry</dt>
                            <dd className="text-base text-gray-900 mt-1">{pov.industry}</dd>
                          </div>
                        )}
                      </dl>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Description */}
              {pov.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <Card className="bg-gray-50">
                    <CardContent className="pt-6">
                      <p className="text-gray-700 whitespace-pre-wrap">{pov.description}</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Objectives */}
              {pov.objectives && pov.objectives.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-500" />
                    Objectives
                  </h3>
                  <Card className="bg-gray-50">
                    <CardContent className="pt-6">
                      <ul className="space-y-2">
                        {pov.objectives.map((objective: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Success Criteria */}
              {pov.successCriteria && pov.successCriteria.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Success Criteria</h3>
                  <Card className="bg-gray-50">
                    <CardContent className="pt-6">
                      <ul className="space-y-2">
                        {pov.successCriteria.map((criteria: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{criteria}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Timeline</h3>
              {pov.milestones && pov.milestones.length > 0 ? (
                <div className="space-y-4">
                  {pov.milestones.map((milestone: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className={`w-3 h-3 rounded-full mt-2 ${
                        milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{milestone.name || milestone.title}</h4>
                          {milestone.completed && (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {milestone.date ? new Date(milestone.date).toLocaleDateString() : 'Date not set'}
                        </p>
                        {milestone.description && (
                          <p className="text-sm text-gray-700 mt-2">{milestone.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No milestones defined</p>
              )}
            </div>
          )}

          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
              {pov.teamMembers && pov.teamMembers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pov.teamMembers.map((member: any, idx: number) => (
                    <Card key={idx} className="bg-gray-50">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-lg">
                              {member.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{member.name || 'Unknown'}</p>
                            <p className="text-sm text-gray-600">{member.role || 'Team Member'}</p>
                            {member.email && (
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <Mail className="w-3 h-3" />
                                {member.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No team members assigned</p>
              )}
            </div>
          )}

          {/* Deliverables Tab */}
          {activeTab === 'deliverables' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Deliverables</h3>
              {pov.deliverables && pov.deliverables.length > 0 ? (
                <div className="space-y-3">
                  {pov.deliverables.map((deliverable: any, idx: number) => (
                    <Card key={idx} className="bg-gray-50">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-gray-900">{deliverable.name || deliverable.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Due: {deliverable.dueDate ? new Date(deliverable.dueDate).toLocaleDateString() : 'Not set'}
                              </p>
                              {deliverable.description && (
                                <p className="text-sm text-gray-700 mt-2">{deliverable.description}</p>
                              )}
                            </div>
                          </div>
                          <Badge className={deliverable.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                            {deliverable.status || 'pending'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No deliverables defined</p>
              )}
            </div>
          )}

          {/* Deployment Tab */}
          {activeTab === 'deployment' && (
            <div className="space-y-4">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Infrastructure Deployment</h3>
                <p className="text-sm text-gray-600">
                  Generate Terraform configurations for deploying this POV's infrastructure automatically.
                </p>
              </div>

              {/* Terraform Download Panel */}
              <TerraformDownloadPanel
                scenarioId={pov.id}
                scenarioTitle={pov.name || pov.title || 'POV Project'}
              />

              {/* Deployment Instructions */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <h4 className="font-medium text-blue-900 mb-3">Quick Deployment Guide</h4>
                  <ol className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                      <span className="font-semibold min-w-[1.5rem]">1.</span>
                      <span>Select your preferred format (HCL or JSON) and cloud provider</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold min-w-[1.5rem]">2.</span>
                      <span>Click "Preview" to review the configuration or "Download Terraform" to get the file</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold min-w-[1.5rem]">3.</span>
                      <span>Run <code className="px-1 py-0.5 bg-blue-100 rounded">terraform init</code> in the directory</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold min-w-[1.5rem]">4.</span>
                      <span>Review with <code className="px-1 py-0.5 bg-blue-100 rounded">terraform plan</code></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold min-w-[1.5rem]">5.</span>
                      <span>Deploy with <code className="px-1 py-0.5 bg-blue-100 rounded">terraform apply</code></span>
                    </li>
                  </ol>
                </CardContent>
              </Card>

              {/* Related Scenarios */}
              {pov.scenarios && pov.scenarios.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Demo Scenarios</h4>
                  <div className="space-y-2">
                    {pov.scenarios.map((scenario: any, idx: number) => (
                      <Card key={idx} className="bg-gray-50">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{scenario.title || scenario.name}</p>
                              <p className="text-sm text-gray-600">{scenario.description}</p>
                            </div>
                            <Link href={`/scenarios/${scenario.id}`}>
                              <Button variant="outline" size="sm">View</Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
