module.exports = {
  ci: {
    collect: {
      // Start dev server for testing
      startServerCommand: 'pnpm dev',
      startServerReadyPattern: 'Ready in',
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/login',
        'http://localhost:3000/pov',
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        // Categories to audit
        onlyCategories: [
          'performance',
          'accessibility',
          'best-practices',
          'seo',
        ],
        // Skip certain audits that might fail in dev
        skipAudits: [
          'is-on-https', // Dev server is HTTP
          'uses-http2',  // Dev server doesn't use HTTP/2
        ],
      },
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        // Performance thresholds
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.8 }],

        // Specific metrics
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'interactive': ['warn', { maxNumericValue: 3500 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],

        // Resource optimization
        'total-byte-weight': ['warn', { maxNumericValue: 1000000 }], // 1MB
        'dom-size': ['warn', { maxNumericValue: 1500 }],
        'bootup-time': ['warn', { maxNumericValue: 3000 }],
        'mainthread-work-breakdown': ['warn', { maxNumericValue: 4000 }],

        // Accessibility
        'color-contrast': 'error',
        'image-alt': 'error',
        'link-name': 'error',
        'button-name': 'error',
        'document-title': 'error',
        'html-has-lang': 'error',
        'meta-viewport': 'error',

        // Best practices
        'no-vulnerable-libraries': 'warn',
        'errors-in-console': 'warn',
        'uses-passive-event-listeners': 'warn',
        'no-document-write': 'error',

        // SEO
        'meta-description': 'warn',
        'http-status-code': 'error',
        'font-size': 'error',
        'crawlable-anchors': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
      // For production, use LHCI server
      // target: 'lhci',
      // serverBaseUrl: process.env.LHCI_SERVER_URL,
      // token: process.env.LHCI_TOKEN,
    },
  },
};
