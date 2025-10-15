'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

/**
 * AI Content Disclaimer Modal
 * Displays before user can access AI-generated content
 *
 * Features:
 * - Clear warning about AI content limitations
 * - User acknowledgment required
 * - Per-content-type consent tracking
 * - Option to dismiss for session or permanently
 */

export interface AIContentDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  contentType: 'blueprint' | 'terraform' | 'risk_analysis' | 'recommendations' | 'general';
  aiConfidence?: number;
  generatedDate?: Date;
  title?: string;
}

export function AIContentDisclaimerModal({
  isOpen,
  onClose,
  onAccept,
  contentType,
  aiConfidence,
  generatedDate,
  title
}: AIContentDisclaimerModalProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [rememberChoice, setRememberChoice] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setAcknowledged(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getContentTypeInfo = () => {
    switch (contentType) {
      case 'blueprint':
        return {
          title: 'AI-Generated Blueprint',
          icon: <AlertTriangle className="w-12 h-12 text-amber-500" />,
          description: 'This blueprint has been generated using AI assistance',
          risks: [
            'May contain inaccuracies or incomplete information',
            'Should be reviewed by qualified personnel before use',
            'May not comply with all organizational policies',
            'Technical specifications should be verified'
          ]
        };
      case 'terraform':
        return {
          title: 'AI-Generated Terraform Configuration',
          icon: <AlertCircle className="w-12 h-12 text-orange-500" />,
          description: 'This Terraform configuration has been generated using AI',
          risks: [
            'May contain security vulnerabilities',
            'Should be tested in non-production environment first',
            'Resource configurations should be validated',
            'Cost implications should be reviewed'
          ]
        };
      case 'risk_analysis':
        return {
          title: 'AI-Assisted Risk Analysis',
          icon: <AlertTriangle className="w-12 h-12 text-red-500" />,
          description: 'This risk analysis has been generated with AI assistance',
          risks: [
            'May not identify all potential risks',
            'Should be reviewed by risk management team',
            'Severity assessments should be validated',
            'Human expertise is recommended'
          ]
        };
      case 'recommendations':
        return {
          title: 'AI-Generated Recommendations',
          icon: <AlertCircle className="w-12 h-12 text-blue-500" />,
          description: 'These recommendations have been generated using AI',
          risks: [
            'May not be applicable to all scenarios',
            'Should be evaluated for organizational fit',
            'Alternative approaches should be considered',
            'Subject matter expert review recommended'
          ]
        };
      default:
        return {
          title: 'AI-Generated Content',
          icon: <AlertTriangle className="w-12 h-12 text-gray-500" />,
          description: 'This content has been generated using AI',
          risks: [
            'May contain inaccuracies',
            'Should be reviewed before use',
            'Human validation recommended'
          ]
        };
    }
  };

  const contentInfo = getContentTypeInfo();

  const handleAccept = () => {
    if (rememberChoice) {
      // Store in localStorage
      const key = `ai-disclaimer-accepted-${contentType}`;
      localStorage.setItem(key, JSON.stringify({
        accepted: true,
        timestamp: new Date().toISOString()
      }));
    }

    onAccept();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            {contentInfo.icon}
            <div>
              <h2 className="text-2xl font-bold">{contentInfo.title}</h2>
              {title && (
                <p className="text-sm opacity-90 mt-1">{title}</p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* AI Confidence Badge */}
          {aiConfidence !== undefined && (
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm font-semibold text-gray-700">AI Confidence Level</p>
                <p className="text-xs text-gray-500">
                  Higher confidence = More reliable, but still requires review
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {Math.round(aiConfidence * 100)}%
                </div>
                <div className="text-xs text-gray-500">
                  {aiConfidence >= 0.8 ? 'High' : aiConfidence >= 0.6 ? 'Medium' : 'Low'}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <p className="text-gray-700 leading-relaxed">
              {contentInfo.description}. While AI can provide valuable assistance,
              it is not infallible and should not be used without proper human review and validation.
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">
                  Important: Review Required
                </h3>
                <p className="text-sm text-amber-800">
                  This content must be thoroughly reviewed by qualified personnel before
                  being used in any production environment or critical decision-making process.
                </p>
              </div>
            </div>
          </div>

          {/* Specific Risks/Limitations */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Known Limitations
            </h3>
            <ul className="space-y-2">
              {contentInfo.risks.map((risk, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-red-500 font-bold">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Best Practices */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Recommended Actions
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-500 font-bold">✓</span>
                <span>Review all generated content for accuracy and completeness</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-500 font-bold">✓</span>
                <span>Verify technical specifications against requirements</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-500 font-bold">✓</span>
                <span>Test in non-production environment before deployment</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-500 font-bold">✓</span>
                <span>Consult with subject matter experts when in doubt</span>
              </li>
            </ul>
          </div>

          {/* Generation Metadata */}
          {generatedDate && (
            <div className="text-xs text-gray-500 border-t pt-4">
              <p>Generated: {generatedDate.toLocaleString()}</p>
              <p className="mt-1">
                AI models and training data are continuously updated. More recent generations
                may produce different results.
              </p>
            </div>
          )}

          {/* Acknowledgment Checkbox */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-900">
                I understand that this content was generated by AI and acknowledge that I must:
                <ul className="list-disc ml-5 mt-2 space-y-1 font-normal text-gray-700">
                  <li>Review all content for accuracy and completeness</li>
                  <li>Validate technical specifications and configurations</li>
                  <li>Test in appropriate environments before production use</li>
                  <li>Not rely solely on AI-generated content for critical decisions</li>
                </ul>
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
              <input
                type="checkbox"
                checked={rememberChoice}
                onChange={(e) => setRememberChoice(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
              <span>Don't show this warning again for this type of content</span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between gap-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAccept}
              disabled={!acknowledged}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                acknowledged
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {acknowledged ? 'I Acknowledge - Continue' : 'Please Acknowledge Above'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to check if disclaimer has been shown/accepted
 */
export function useAIDisclaimerCheck(contentType: string): boolean {
  const [hasAccepted, setHasAccepted] = useState(false);

  useEffect(() => {
    const key = `ai-disclaimer-accepted-${contentType}`;
    const stored = localStorage.getItem(key);

    if (stored) {
      try {
        const data = JSON.parse(stored);
        // Check if acceptance is still valid (e.g., within 30 days)
        const acceptedDate = new Date(data.timestamp);
        const daysSince = (Date.now() - acceptedDate.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSince < 30) {
          setHasAccepted(true);
        }
      } catch (error) {
        console.error('Error checking disclaimer status:', error);
      }
    }
  }, [contentType]);

  return hasAccepted;
}

/**
 * Clear all stored disclaimer acceptances
 */
export function clearAIDisclaimerPreferences(): void {
  const keys = Object.keys(localStorage).filter(key => key.startsWith('ai-disclaimer-accepted-'));
  keys.forEach(key => localStorage.removeItem(key));
}
