'use client';

import { useState } from 'react';
import { Download, FileCode, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface TerraformDownloadButtonProps {
  scenarioId: string;
  scenarioTitle: string;
  format?: 'hcl' | 'json';
  provider?: 'gcp' | 'aws' | 'azure';
  className?: string;
}

export function TerraformDownloadButton({
  scenarioId,
  scenarioTitle,
  format = 'hcl',
  provider = 'gcp',
  className = '',
}: TerraformDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const downloadTerraform = async () => {
    setDownloading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const url = `/api/scenarios/${scenarioId}/terraform?format=${format}&provider=${provider}`;
      const response = await fetch(url);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate Terraform configuration');
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `${scenarioId}-deployment.tf`;

      // Download file
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error('Error downloading Terraform configuration:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={className}>
      <button
        onClick={downloadTerraform}
        disabled={downloading}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium
          transition-all duration-200
          ${
            status === 'success'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : status === 'error'
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        `}
      >
        {downloading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generating...</span>
          </>
        ) : status === 'success' ? (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>Downloaded!</span>
          </>
        ) : status === 'error' ? (
          <>
            <AlertCircle className="w-4 h-4" />
            <span>Error</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>Download Terraform</span>
          </>
        )}
      </button>

      {status === 'error' && errorMessage && (
        <div className="mt-2 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        Format: {format.toUpperCase()} | Provider: {provider.toUpperCase()}
      </div>
    </div>
  );
}

/**
 * Advanced Terraform download component with format and provider selection
 */
export function TerraformDownloadPanel({
  scenarioId,
  scenarioTitle,
  className = '',
}: {
  scenarioId: string;
  scenarioTitle: string;
  className?: string;
}) {
  const [format, setFormat] = useState<'hcl' | 'json'>('hcl');
  const [provider, setProvider] = useState<'gcp' | 'aws' | 'azure'>('gcp');
  const [preview, setPreview] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadPreview = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/scenarios/${scenarioId}/terraform`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, provider }),
      });

      const result = await response.json();
      if (result.success) {
        setPreview(result.data.content);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Error loading preview:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileCode className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Terraform Deployment
            </h3>
            <p className="text-sm text-gray-600">
              Generate infrastructure-as-code for this scenario
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Format selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as 'hcl' | 'json')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="hcl">HCL (.tf)</option>
              <option value="json">JSON (.tf.json)</option>
            </select>
          </div>

          {/* Provider selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Provider
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as 'gcp' | 'aws' | 'azure')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="gcp">Google Cloud Platform</option>
              <option value="aws">Amazon Web Services</option>
              <option value="azure">Microsoft Azure</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <TerraformDownloadButton
            scenarioId={scenarioId}
            scenarioTitle={scenarioTitle}
            format={format}
            provider={provider}
            className="flex-1"
          />

          <button
            onClick={loadPreview}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Preview'}
          </button>
        </div>
      </div>

      {/* Preview panel */}
      {showPreview && preview && (
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-300">Preview</span>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          <pre className="text-xs text-gray-300 overflow-x-auto max-h-96 overflow-y-auto">
            {preview}
          </pre>
        </div>
      )}
    </div>
  );
}
