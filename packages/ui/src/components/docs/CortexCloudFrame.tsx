'use client';

/**
 * Cortex Cloud Frame Component
 * Migrated from henryreed.ai/hosting/components/CortexCloudFrame.tsx
 *
 * Features:
 * - Embedded iframe for Cortex documentation
 * - Quick navigation to common doc sections
 * - Accessibility controls (font size, contrast)
 * - Error handling for CORS/network issues
 * - Loading states
 * - Responsive design
 */

import React, { useState } from 'react';

export interface CortexDocsSection {
  id: string;
  label: string;
  url: string;
  color?: string;
}

export interface CortexCloudFrameProps {
  /** Initial URL to load */
  url?: string;
  /** Frame title */
  title?: string;
  /** Frame height */
  height?: string;
  /** Custom documentation sections */
  customSections?: CortexDocsSection[];
  /** Additional CSS classes */
  className?: string;
}

const defaultCortexDocs: Record<string, string> = {
  'xdr-overview': 'https://docs.paloaltonetworks.com/cortex/cortex-xdr',
  'xsiam-overview': 'https://docs.paloaltonetworks.com/cortex/cortex-xsiam',
  'data-lake': 'https://docs.paloaltonetworks.com/cortex/cortex-data-lake',
  'xpanse': 'https://docs.paloaltonetworks.com/cortex/cortex-xpanse',
  'api-reference': 'https://docs.paloaltonetworks.com/cortex/cortex-xdr/cortex-xdr-api',
  'integrations': 'https://docs.paloaltonetworks.com/cortex/cortex-xdr/cortex-xdr-pro-admin/cortex-xdr-integrations',
  'incident-response': 'https://docs.paloaltonetworks.com/cortex/cortex-xdr/cortex-xdr-pro-admin/investigation-and-response',
  'threat-hunting': 'https://docs.paloaltonetworks.com/cortex/cortex-xdr/cortex-xdr-pro-admin/investigation-and-response/advanced-threat-hunting',
  'analytics': 'https://docs.paloaltonetworks.com/cortex/cortex-xdr/cortex-xdr-pro-admin/cortex-xdr-analytics'
};

export const CortexCloudFrame: React.FC<CortexCloudFrameProps> = ({
  url = 'https://docs.paloaltonetworks.com/cortex/cortex-xdr',
  title = 'Cortex Cloud Documentation',
  height = '600px',
  customSections,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState(url);

  const handleFrameLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleFrameError = () => {
    setIsLoading(false);
    setError('Failed to load documentation. This may be due to CORS restrictions or network issues.');
  };

  const navigateToSection = (sectionUrl: string) => {
    setIsLoading(true);
    setCurrentUrl(sectionUrl);
  };

  const increaseFontSize = () => {
    const frame = document.querySelector('#cortex-docs-frame') as HTMLIFrameElement;
    if (frame?.contentDocument) {
      frame.contentDocument.body.style.fontSize = '18px';
      frame.contentDocument.body.style.lineHeight = '1.6';
    }
  };

  const enableHighContrast = () => {
    const frame = document.querySelector('#cortex-docs-frame') as HTMLIFrameElement;
    if (frame?.contentDocument) {
      frame.contentDocument.body.style.filter = 'contrast(1.2) brightness(1.1)';
    }
  };

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-700 ${className}`}>
      {/* Header with navigation */}
      <div className="bg-gray-800 rounded-t-lg border-b border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">📚</div>
            <div>
              <h3 className="text-lg font-bold text-blue-400">{title}</h3>
              <p className="text-sm text-gray-400">Interactive Cortex Cloud Documentation</p>
            </div>
          </div>

          {/* Accessibility Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={increaseFontSize}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs transition-colors"
              title="Increase font size for better readability"
            >
              A+
            </button>

            <button
              onClick={enableHighContrast}
              className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-white text-xs transition-colors"
              title="High contrast mode for better visibility"
            >
              🔆
            </button>

            <button
              onClick={() => window.open(currentUrl, '_blank')}
              className="px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-white text-xs transition-colors"
              title="Open in new tab"
            >
              ↗️
            </button>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => navigateToSection(defaultCortexDocs['xdr-overview'])}
            className="px-3 py-1 bg-blue-700 hover:bg-blue-600 rounded text-white text-xs transition-colors"
          >
            XDR Overview
          </button>
          <button
            onClick={() => navigateToSection(defaultCortexDocs['xsiam-overview'])}
            className="px-3 py-1 bg-green-700 hover:bg-green-600 rounded text-white text-xs transition-colors"
          >
            XSIAM
          </button>
          <button
            onClick={() => navigateToSection(defaultCortexDocs['threat-hunting'])}
            className="px-3 py-1 bg-purple-700 hover:bg-purple-600 rounded text-white text-xs transition-colors"
          >
            Threat Hunting
          </button>
          <button
            onClick={() => navigateToSection(defaultCortexDocs['incident-response'])}
            className="px-3 py-1 bg-red-700 hover:bg-red-600 rounded text-white text-xs transition-colors"
          >
            Incident Response
          </button>
          <button
            onClick={() => navigateToSection(defaultCortexDocs['api-reference'])}
            className="px-3 py-1 bg-orange-700 hover:bg-orange-600 rounded text-white text-xs transition-colors"
          >
            API Reference
          </button>
          <button
            onClick={() => navigateToSection(defaultCortexDocs['integrations'])}
            className="px-3 py-1 bg-cyan-700 hover:bg-cyan-600 rounded text-white text-xs transition-colors"
          >
            Integrations
          </button>
        </div>

        {/* Current URL Display */}
        <div className="text-xs text-gray-400 truncate font-mono">
          📍 {currentUrl}
        </div>
      </div>

      {/* Content Frame */}
      <div className="relative" style={{ height }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="text-4xl mb-4">⏳</div>
              <div className="text-blue-400 font-semibold">Loading Documentation...</div>
              <div className="text-sm text-gray-400 mt-2">Please wait while we fetch the content</div>
            </div>
          </div>
        )}

        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 p-6">
            <div className="text-center max-w-md">
              <div className="text-4xl mb-4">⚠️</div>
              <div className="text-red-400 font-semibold mb-2">Documentation Access Issue</div>
              <div className="text-sm text-gray-400 mb-4">{error}</div>

              <div className="bg-gray-800 p-4 rounded border border-gray-600">
                <div className="text-yellow-400 font-bold mb-2">💡 Alternative Access</div>
                <div className="text-sm text-gray-300 space-y-2">
                  <div>• Use the "↗️" button to open in a new tab</div>
                  <div>• Access documentation directly at:</div>
                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline font-mono text-xs block mt-2"
                  >
                    {currentUrl}
                  </a>
                </div>
              </div>

              <button
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                  setCurrentUrl(currentUrl + '?reload=' + Date.now());
                }}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm transition-colors"
              >
                🔄 Retry Loading
              </button>
            </div>
          </div>
        ) : (
          <iframe
            id="cortex-docs-frame"
            src={currentUrl}
            title={title}
            className="w-full h-full border-0 rounded-b-lg"
            onLoad={handleFrameLoad}
            onError={handleFrameError}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            referrerPolicy="no-referrer-when-downgrade"
            loading="lazy"
            style={{
              background: '#1f2937'
            }}
          />
        )}
      </div>

      {/* Footer with accessibility info */}
      <div className="bg-gray-800 rounded-b-lg border-t border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>🎯 Accessibility: High contrast and text scaling available</span>
            <span>⌨️ Keyboard navigation supported</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>📱 Responsive design</span>
            <span>🔄 Auto-refresh capable</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CortexCloudFrame;
