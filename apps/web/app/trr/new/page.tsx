'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { usePOVs } from '@/lib/hooks/use-api';
import { apiClient } from '@/lib/api-client';
import {
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle2,
  FileText,
  Calendar,
  Users,
  Link as LinkIcon,
} from 'lucide-react';

/**
 * TRR Creation Form
 * Create a new Technical Readiness Review with optional POV linkage
 */
export default function NewTRRPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <TRRCreationForm />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function TRRCreationForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: povs } = usePOVs(); // Fetch POVs for linking

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    description: '',
    projectName: '',
    projectId: '',

    // Link to POV (optional)
    linkedPOVId: '',

    // Timeline
    dueDate: '',

    // Assignment
    assignedTo: user?.displayName || user?.email || '',

    // Status & Priority
    status: 'pending',
    priority: 'medium',

    // Review Details
    scope: [''],
    technicalRequirements: [''],

    // Completion
    completionPercentage: 0,
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'scope' | 'technicalRequirements', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field: 'scope' | 'technicalRequirements') => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (field: 'scope' | 'technicalRequirements', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Clean up data
      const cleanedData = {
        ...formData,
        scope: formData.scope.filter(s => s.trim() !== ''),
        technicalRequirements: formData.technicalRequirements.filter(t => t.trim() !== ''),
        // Add user context
        createdBy: user?.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Create TRR
      await apiClient.createData('trrs', cleanedData);

      // Redirect to TRR list
      router.push('/trr');
    } catch (err: any) {
      console.error('Failed to create TRR:', err);
      setError(err.message || 'Failed to create TRR. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return formData.name.trim() !== '' && formData.dueDate !== '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/trr">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New TRR</h1>
            <p className="text-gray-600 mt-1">Technical Readiness Review</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-500" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TRR Title *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Security Architecture Review - Phase 1"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe the technical readiness review scope and objectives..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => handleChange('projectName', e.target.value)}
                  placeholder="e.g., Cloud Migration Project"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project ID
                </label>
                <input
                  type="text"
                  value={formData.projectId}
                  onChange={(e) => handleChange('projectId', e.target.value)}
                  placeholder="e.g., PROJ-2025-001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Link to POV */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-orange-500" />
              Link to POV (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Associated POV Project
              </label>
              <select
                value={formData.linkedPOVId}
                onChange={(e) => handleChange('linkedPOVId', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">No POV linked</option>
                {povs.map((pov: any) => (
                  <option key={pov.id} value={pov.id}>
                    {pov.name || pov.title} ({pov.customer})
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Link this TRR to an existing POV project for context
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Timeline & Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              Timeline & Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned To
                </label>
                <input
                  type="text"
                  value={formData.assignedTo}
                  onChange={(e) => handleChange('assignedTo', e.target.value)}
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in-review">In Review</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Scope */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-orange-500" />
              Review Scope
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scope Items
              </label>
              {formData.scope.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleArrayChange('scope', idx, e.target.value)}
                    placeholder="e.g., Review security architecture documentation"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  {formData.scope.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('scope', idx)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('scope')}
                className="mt-2"
              >
                + Add Scope Item
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Technical Requirements
              </label>
              {formData.technicalRequirements.map((req, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => handleArrayChange('technicalRequirements', idx, e.target.value)}
                    placeholder="e.g., All systems must meet NIST 800-53 controls"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  {formData.technicalRequirements.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('technicalRequirements', idx)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('technicalRequirements')}
                className="mt-2"
              >
                + Add Requirement
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex items-center justify-between">
          <Link href="/trr">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>

          <Button
            type="submit"
            disabled={!isFormValid() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create TRR
              </>
            )}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-sm text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
