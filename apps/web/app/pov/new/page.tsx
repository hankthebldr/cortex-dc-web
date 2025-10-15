'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCreatePOV } from '@/lib/hooks/use-api';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Loader2,
  Target,
  Building,
  Calendar,
  Users,
  FileText,
  CheckCircle2,
} from 'lucide-react';

/**
 * POV Creation Wizard
 * Multi-step form for creating a new POV project
 */
export default function NewPOVPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <POVCreationWizard />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function POVCreationWizard() {
  const router = useRouter();
  const { create, isCreating, error } = useCreatePOV();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    customer: '',
    industry: '',
    description: '',
    status: 'pending',

    // Timeline
    startDate: '',
    endDate: '',

    // Team
    assignedTo: '',
    teamMembers: [] as string[],

    // Objectives
    objectives: [''],
    successCriteria: [''],

    // Additional
    priority: 'medium',
  });

  const steps = [
    { number: 1, name: 'Basic Info', icon: Target },
    { number: 2, name: 'Timeline', icon: Calendar },
    { number: 3, name: 'Team', icon: Users },
    { number: 4, name: 'Objectives', icon: CheckCircle2 },
  ];

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'objectives' | 'successCriteria', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field: 'objectives' | 'successCriteria') => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (field: 'objectives' | 'successCriteria', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Filter out empty objectives and criteria
      const cleanedData = {
        ...formData,
        objectives: formData.objectives.filter(o => o.trim() !== ''),
        successCriteria: formData.successCriteria.filter(c => c.trim() !== ''),
      };

      const result = await create(cleanedData);
      router.push('/pov');
    } catch (err) {
      console.error('Failed to create POV:', err);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() !== '' && formData.customer.trim() !== '';
      case 2:
        return formData.startDate !== '';
      case 3:
        return formData.assignedTo.trim() !== '';
      case 4:
        return formData.objectives.some(o => o.trim() !== '');
      default:
        return true;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/pov">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New POV</h1>
            <p className="text-gray-600 mt-1">Follow the steps to set up your Proof of Value project</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;

          return (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isCompleted
                      ? 'bg-green-500 border-green-500'
                      : isActive
                      ? 'bg-orange-500 border-orange-500'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  ) : (
                    <Icon
                      className={`w-6 h-6 ${
                        isActive ? 'text-white' : 'text-gray-400'
                      }`}
                    />
                  )}
                </div>
                <p
                  className={`text-sm mt-2 font-medium ${
                    isActive ? 'text-orange-600' : 'text-gray-600'
                  }`}
                >
                  {step.name}
                </p>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Step {currentStep}: {steps[currentStep - 1].name}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Global Financial Services - Multi-Cloud Security"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={formData.customer}
                  onChange={(e) => handleChange('customer', e.target.value)}
                  placeholder="e.g., Acme Corporation"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => handleChange('industry', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select Industry</option>
                  <option value="Financial Services">Financial Services</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Technology">Technology</option>
                  <option value="Retail">Retail</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Government">Government</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe the POV project scope and goals..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
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
          )}

          {/* Step 2: Timeline */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  min={formData.startDate}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

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
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Team */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Lead *
                </label>
                <input
                  type="text"
                  value={formData.assignedTo}
                  onChange={(e) => handleChange('assignedTo', e.target.value)}
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Members (Optional)
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  You can add team members after creating the POV
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Objectives */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objectives *
                </label>
                {formData.objectives.map((objective, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={objective}
                      onChange={(e) => handleArrayChange('objectives', idx, e.target.value)}
                      placeholder="e.g., Validate threat detection capabilities"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {formData.objectives.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('objectives', idx)}
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
                  onClick={() => addArrayItem('objectives')}
                  className="mt-2"
                >
                  + Add Objective
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Success Criteria
                </label>
                {formData.successCriteria.map((criteria, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={criteria}
                      onChange={(e) => handleArrayChange('successCriteria', idx, e.target.value)}
                      placeholder="e.g., 95% threat detection coverage"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {formData.successCriteria.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('successCriteria', idx)}
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
                  onClick={() => addArrayItem('successCriteria')}
                  className="mt-2"
                >
                  + Add Criteria
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid() || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create POV
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-600">
              {error.message || 'Failed to create POV. Please try again.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
