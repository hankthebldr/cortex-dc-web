'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Calendar as CalendarIcon,
  Target,
  Users,
  FileText,
  Clock,
  Trash2,
  Edit3,
  Save,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { POVStatus, Priority, Project } from '@cortex/db/types/projects';

interface POVCreationWizardProps {
  projects: Project[];
  onSubmit: (povData: POVFormData) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
  className?: string;
}

interface POVObjective {
  id: string;
  description: string;
  success_criteria: string;
  weight: number;
}

interface POVPhase {
  id: string;
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  tasks: string[];
}

interface POVFormData {
  projectId: string;
  title: string;
  description: string;
  priority: Priority;
  objectives: POVObjective[];
  phases: POVPhase[];
  testPlan: {
    environment?: string;
    timeline: {
      start: Date;
      end: Date;
    };
    resources: Array<{
      type: 'personnel' | 'equipment' | 'software' | 'budget';
      description: string;
      quantity?: number;
      cost?: number;
    }>;
  };
  team: string[];
}

const WIZARD_STEPS = [
  { id: 'basic', title: 'Basic Information', description: 'Project details and objectives' },
  { id: 'objectives', title: 'Success Objectives', description: 'Define measurable goals' },
  { id: 'phases', title: 'Execution Phases', description: 'Break down into phases' },
  { id: 'test-plan', title: 'Test Plan', description: 'Environment and resources' },
  { id: 'review', title: 'Review & Submit', description: 'Confirm all details' }
];

const DEFAULT_PHASES = [
  { name: 'Planning', description: 'Initial planning and setup' },
  { name: 'Implementation', description: 'Deploy and configure solution' },
  { name: 'Testing', description: 'Execute test scenarios' },
  { name: 'Validation', description: 'Validate success criteria' }
];

export const POVCreationWizard: React.FC<POVCreationWizardProps> = ({
  projects,
  onSubmit,
  onCancel,
  isOpen,
  className
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<POVFormData>({
    projectId: '',
    title: '',
    description: '',
    priority: Priority.MEDIUM,
    objectives: [],
    phases: [],
    testPlan: {
      timeline: {
        start: new Date(),
        end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      },
      resources: []
    },
    team: []
  });

  const currentStepData = WIZARD_STEPS[currentStep];
  const isLastStep = currentStep === WIZARD_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form and close
      setFormData({
        projectId: '',
        title: '',
        description: '',
        priority: Priority.MEDIUM,
        objectives: [],
        phases: [],
        testPlan: {
          timeline: {
            start: new Date(),
            end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          },
          resources: []
        },
        team: []
      });
      setCurrentStep(0);
    } catch (error) {
      console.error('Error creating POV:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addObjective = () => {
    const newObjective: POVObjective = {
      id: Date.now().toString(),
      description: '',
      success_criteria: '',
      weight: 100
    };
    setFormData(prev => ({
      ...prev,
      objectives: [...prev.objectives, newObjective]
    }));
  };

  const updateObjective = (id: string, updates: Partial<POVObjective>) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.map(obj => 
        obj.id === id ? { ...obj, ...updates } : obj
      )
    }));
  };

  const removeObjective = (id: string) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter(obj => obj.id !== id)
    }));
  };

  const addPhase = () => {
    const newPhase: POVPhase = {
      id: Date.now().toString(),
      name: '',
      description: '',
      tasks: []
    };
    setFormData(prev => ({
      ...prev,
      phases: [...prev.phases, newPhase]
    }));
  };

  const updatePhase = (id: string, updates: Partial<POVPhase>) => {
    setFormData(prev => ({
      ...prev,
      phases: prev.phases.map(phase => 
        phase.id === id ? { ...phase, ...updates } : phase
      )
    }));
  };

  const removePhase = (id: string) => {
    setFormData(prev => ({
      ...prev,
      phases: prev.phases.filter(phase => phase.id !== id)
    }));
  };

  const loadDefaultPhases = () => {
    const defaultPhases = DEFAULT_PHASES.map((phase, index) => ({
      id: Date.now().toString() + index,
      name: phase.name,
      description: phase.description,
      tasks: []
    }));
    setFormData(prev => ({
      ...prev,
      phases: defaultPhases
    }));
  };

  const selectedProject = projects.find(p => p.id === formData.projectId);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onCancel()}>
      <DialogContent className={cn("max-w-4xl max-h-[90vh] overflow-y-auto", className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-500" />
            Create New POV
          </DialogTitle>
          <DialogDescription>
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {WIZARD_STEPS.map((step, index) => (
            <div 
              key={step.id}
              className={cn(
                'flex items-center',
                index < WIZARD_STEPS.length - 1 && 'flex-1'
              )}
            >
              <div className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium',
                index <= currentStep 
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : 'border-gray-300 text-gray-300'
              )}>
                {index < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span className={cn(
                'ml-2 text-sm font-medium',
                index <= currentStep ? 'text-gray-900' : 'text-gray-400'
              )}>
                {step.title}
              </span>
              {index < WIZARD_STEPS.length - 1 && (
                <div className={cn(
                  'flex-1 h-px mx-4',
                  index < currentStep ? 'bg-orange-500' : 'bg-gray-300'
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="project">Project</Label>
                <Select 
                  value={formData.projectId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          {project.title} - {project.customer.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProject && (
                  <p className="text-xs text-gray-600 mt-1">
                    Customer: {selectedProject.customer.name} • Industry: {selectedProject.customer.industry}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="title">POV Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Network Security Assessment POV"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the goals and scope of this POV..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value: Priority) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Priority.LOW}>Low</SelectItem>
                    <SelectItem value={Priority.MEDIUM}>Medium</SelectItem>
                    <SelectItem value={Priority.HIGH}>High</SelectItem>
                    <SelectItem value={Priority.CRITICAL}>Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Success Objectives</h3>
                <Button onClick={addObjective} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Objective
                </Button>
              </div>
              
              {formData.objectives.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No objectives defined yet</p>
                  <p className="text-sm">Add objectives to measure POV success</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.objectives.map((objective) => (
                    <Card key={objective.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <div>
                              <Label htmlFor={`obj-desc-${objective.id}`}>Objective Description</Label>
                              <Input
                                id={`obj-desc-${objective.id}`}
                                value={objective.description}
                                onChange={(e) => updateObjective(objective.id, { description: e.target.value })}
                                placeholder="What do you want to demonstrate?"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`obj-criteria-${objective.id}`}>Success Criteria</Label>
                              <Input
                                id={`obj-criteria-${objective.id}`}
                                value={objective.success_criteria}
                                onChange={(e) => updateObjective(objective.id, { success_criteria: e.target.value })}
                                placeholder="How will you measure success?"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`obj-weight-${objective.id}`}>Weight (%)</Label>
                              <Input
                                id={`obj-weight-${objective.id}`}
                                type="number"
                                min="0"
                                max="100"
                                value={objective.weight}
                                onChange={(e) => updateObjective(objective.id, { weight: parseInt(e.target.value) })}
                              />
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeObjective(objective.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Execution Phases</h3>
                <div className="flex gap-2">
                  <Button onClick={loadDefaultPhases} variant="outline" size="sm">
                    Load Default Phases
                  </Button>
                  <Button onClick={addPhase} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Phase
                  </Button>
                </div>
              </div>

              {formData.phases.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No phases defined yet</p>
                  <p className="text-sm">Break down your POV into manageable phases</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.phases.map((phase, index) => (
                    <Card key={phase.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">Phase {index + 1}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePhase(phase.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`phase-name-${phase.id}`}>Phase Name</Label>
                            <Input
                              id={`phase-name-${phase.id}`}
                              value={phase.name}
                              onChange={(e) => updatePhase(phase.id, { name: e.target.value })}
                              placeholder="e.g., Planning"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor={`phase-desc-${phase.id}`}>Description</Label>
                          <Textarea
                            id={`phase-desc-${phase.id}`}
                            value={phase.description || ''}
                            onChange={(e) => updatePhase(phase.id, { description: e.target.value })}
                            placeholder="What happens in this phase?"
                            rows={2}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Test Plan Configuration</h3>
              
              <div>
                <Label htmlFor="environment">Test Environment</Label>
                <Input
                  id="environment"
                  value={formData.testPlan.environment || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    testPlan: { 
                      ...prev.testPlan, 
                      environment: e.target.value 
                    } 
                  }))}
                  placeholder="e.g., Customer lab environment"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.testPlan.timeline.start ? format(formData.testPlan.timeline.start, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.testPlan.timeline.start}
                        onSelect={(date) => {
                          if (date) {
                            setFormData(prev => ({
                              ...prev,
                              testPlan: {
                                ...prev.testPlan,
                                timeline: {
                                  ...prev.testPlan.timeline,
                                  start: date
                                }
                              }
                            }));
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.testPlan.timeline.end ? format(formData.testPlan.timeline.end, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.testPlan.timeline.end}
                        onSelect={(date) => {
                          if (date) {
                            setFormData(prev => ({
                              ...prev,
                              testPlan: {
                                ...prev.testPlan,
                                timeline: {
                                  ...prev.testPlan.timeline,
                                  end: date
                                }
                              }
                            }));
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Review & Confirm</h3>
              
              <div className="space-y-4">
                <Card className="p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Project:</span> {selectedProject?.title}</p>
                    <p><span className="font-medium">Title:</span> {formData.title}</p>
                    <p><span className="font-medium">Priority:</span> {formData.priority.toUpperCase()}</p>
                    <p><span className="font-medium">Description:</span> {formData.description}</p>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Objectives ({formData.objectives.length})</h4>
                  <div className="space-y-2">
                    {formData.objectives.map((obj, index) => (
                      <div key={obj.id} className="text-sm">
                        <span className="font-medium">{index + 1}.</span> {obj.description}
                        <div className="text-gray-600 ml-4">Success: {obj.success_criteria}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Phases ({formData.phases.length})</h4>
                  <div className="space-y-2">
                    {formData.phases.map((phase, index) => (
                      <div key={phase.id} className="text-sm">
                        <span className="font-medium">{index + 1}. {phase.name}</span>
                        {phase.description && (
                          <div className="text-gray-600 ml-4">{phase.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Timeline</h4>
                  <div className="text-sm text-gray-600">
                    <p><span className="font-medium">Start:</span> {format(formData.testPlan.timeline.start, "PPP")}</p>
                    <p><span className="font-medium">End:</span> {format(formData.testPlan.timeline.end, "PPP")}</p>
                    {formData.testPlan.environment && (
                      <p><span className="font-medium">Environment:</span> {formData.testPlan.environment}</p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstStep}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            
            {isLastStep ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create POV
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};