import type { Capability } from './components/CapabilitySidebar';

export const capabilities: Capability[] = [
  {
    id: 'trr-management',
    title: 'TRR Management',
    description:
      'Align threat readiness reviews, calibrate automation coverage, and stage the next set of resilience drills across teams.',
    icon: 'shieldCheck',
    journey: 'Assess → Prioritize → Operationalize',
    metrics: [
      { label: 'Readiness score', value: '92%' },
      { label: 'Critical gaps', value: '3 open' },
      { label: 'Exercise cadence', value: 'Weekly' },
    ],
    actions: [
      { label: 'Schedule readiness review', icon: 'workflow', href: '/workspaces/trr-management#dashboard-blueprints' },
      { label: 'Sync with response leadership', icon: 'sparkle', href: '/workspaces/trr-management#ai-insights' },
    ],
    playbooks: [
      'Threat readiness overview dashboard',
      'Incident rehearsal scoreboard',
      'Responder staffing forecast',
    ],
    resources: [
      {
        label: 'Data & Analytics workspace',
        description: 'Monitor readiness metrics and curated timelines.',
        href: '/workspaces/trr-management#data-analytics-panel',
        icon: 'chartLine',
      },
      {
        label: 'Dashboard blueprints',
        description: 'Guide readiness conversations with preset layouts.',
        href: '/workspaces/trr-management#dashboard-blueprints',
        icon: 'layoutDashboard',
      },
      {
        label: 'Project management timeline',
        description: 'Sequence TRR drills and automation uplift.',
        href: '/workspaces/trr-management#project-portfolio',
        icon: 'kanban',
      },
    ],
    route: '/workspaces/trr-management',
  },
  {
    id: 'pov-management',
    title: 'POV Management',
    description:
      'Track proof-of-value engagements, quantify detections validated by customers, and package findings for executive review.',
    icon: 'flag',
    journey: 'Discover → Validate → Document',
    metrics: [
      { label: 'Active POVs', value: '8 accounts' },
      { label: 'Win likelihood', value: '74%' },
      { label: 'Use cases shipped', value: '21 demos' },
    ],
    actions: [
      { label: 'Launch POV dashboard', icon: 'layoutDashboard', href: '/workspaces/pov-management#dashboard-blueprints' },
      { label: 'Capture POV outcomes', icon: 'pencil', href: '/workspaces/pov-management#notes-workbench' },
    ],
    playbooks: [
      'Executive POV performance summary',
      'Detection validation wallboard',
      'Customer journey health tracker',
    ],
    resources: [
      {
        label: 'POV timeline',
        description: 'Replay milestones and link supporting assets.',
        href: '/workspaces/pov-management#pov-timeline',
        icon: 'flag',
      },
      {
        label: 'Notes workspace',
        description: 'Capture field insights and evidence highlights.',
        href: '/workspaces/pov-management#notes-workbench',
        icon: 'notebook',
      },
      {
        label: 'Operational controls',
        description: 'Manage POV deliverables and export packages.',
        href: '/workspaces/pov-management#record-operations',
        icon: 'table',
      },
    ],
    route: '/workspaces/pov-management',
  },
  {
    id: 'integration-hub',
    title: 'Integration Hub',
    description:
      'Monitor connector health, map enrichment latency, and orchestrate deployment waves across the Cortex ecosystem.',
    icon: 'plug',
    journey: 'Discover → Deploy → Optimize',
    metrics: [
      { label: 'Connectors online', value: '34 / 36' },
      { label: 'Latency budget', value: '420 ms avg' },
      { label: 'Change backlog', value: '5 pending' },
    ],
    actions: [
      { label: 'Open integration catalog', icon: 'compass', href: '/workspaces/integration-hub#workflow-launchpads' },
      { label: 'Review deployment timeline', icon: 'radar', href: '/workspaces/integration-hub#project-portfolio' },
    ],
    playbooks: [
      'Connector reliability cockpit',
      'Enrichment latency slicer',
      'Integration deployment tracker',
    ],
    resources: [
      {
        label: 'Data Connect terminal',
        description: 'Run connector operations and inspect pipelines.',
        href: '/workspaces/integration-hub#data-connect-terminal',
        icon: 'terminal',
      },
      {
        label: 'Workflow launchpads',
        description: 'Jump to orchestrated integration tooling.',
        href: '/workspaces/integration-hub#workflow-launchpads',
        icon: 'compass',
      },
      {
        label: 'Project portfolio',
        description: 'Track deployment waves and dependency owners.',
        href: '/workspaces/integration-hub#project-portfolio',
        icon: 'kanban',
      },
    ],
    route: '/workspaces/integration-hub',
  },
  {
    id: 'scenario-engine',
    title: 'Scenario Engine',
    description:
      'Design tabletop scenarios, simulate kill chains, and align automation packs with orchestrated response checkpoints.',
    icon: 'workflow',
    journey: 'Ideate → Simulate → Tune',
    metrics: [
      { label: 'Scenario backlog', value: '14 blueprints' },
      { label: 'Automation coverage', value: '87%' },
      { label: 'Lessons logged', value: '32 insights' },
    ],
    actions: [
      { label: 'Launch scenario canvas', icon: 'layers', href: '/workspaces/scenario-engine#visualization-workbench' },
      { label: 'Publish automation updates', icon: 'wrench', href: '/workspaces/scenario-engine#record-designer' },
    ],
    playbooks: [
      'Attack path rehearsal timeline',
      'Automation validation heatmap',
      'Scenario scoring matrix',
    ],
    resources: [
      {
        label: 'Visualization workbench',
        description: 'Build composable charts for scenario playback.',
        href: '/workspaces/scenario-engine#visualization-workbench',
        icon: 'gitBranch',
      },
      {
        label: 'Record designer',
        description: 'Author automation artifacts and follow-up tasks.',
        href: '/workspaces/scenario-engine#record-designer',
        icon: 'workflow',
      },
      {
        label: 'Scenario SOP',
        description: 'Coordinate execution steps and assignments.',
        href: '/workspaces/scenario-engine#standard-operating-procedure',
        icon: 'listChecks',
      },
    ],
    route: '/workspaces/scenario-engine',
  },
  {
    id: 'content-library',
    title: 'Content Library',
    description:
      'Curate Cortex analytic content, recommend coverage expansions, and manage lifecycle approvals with rich metadata.',
    icon: 'library',
    journey: 'Author → Review → Release',
    metrics: [
      { label: 'Analytics published', value: '412 live' },
      { label: 'Pending review', value: '9 drafts' },
      { label: 'Coverage uplift', value: '+18% QoQ' },
    ],
    actions: [
      { label: 'Open content backlog', icon: 'bookCheck', href: '/workspaces/content-library#record-operations' },
      { label: 'Export release package', icon: 'download', href: '/workspaces/content-library#record-operations' },
    ],
    playbooks: [
      'Detection lifecycle board',
      'Content freshness indicators',
      'Release governance dashboard',
    ],
    resources: [
      {
        label: 'Operational controls',
        description: 'Edit, delete, and export Cortex content.',
        href: '/workspaces/content-library#record-operations',
        icon: 'table',
      },
      {
        label: 'Content SOP',
        description: 'Enforce review and release guardrails.',
        href: '/workspaces/content-library#standard-operating-procedure',
        icon: 'bookCheck',
      },
      {
        label: 'Workflow launchpads',
        description: 'Distribute packs through integration tooling.',
        href: '/workspaces/content-library#workflow-launchpads',
        icon: 'compass',
      },
    ],
    route: '/workspaces/content-library',
  },
  {
    id: 'cortex-kb',
    title: 'Cortex KB',
    description:
      'Surface curated Cortex knowledge, AI-authored summaries, and responder playbooks for rapid enablement.',
    icon: 'bookOpen',
    journey: 'Search → Synthesize → Share',
    metrics: [
      { label: 'Knowledge articles', value: '286 entries' },
      { label: 'AI briefs this week', value: '42 generated' },
      { label: 'Responder satisfaction', value: '4.8 / 5' },
    ],
    actions: [
      { label: 'Launch Genkit brief', icon: 'sparkle', href: '/workspaces/cortex-kb#ai-insights' },
      { label: 'Browse SOP catalog', icon: 'bookCheck', href: '/workspaces/cortex-kb#standard-operating-procedure' },
    ],
    playbooks: [
      'Knowledge search trends',
      'AI enablement pulse',
      'Playbook adoption dashboard',
    ],
    resources: [
      {
        label: 'Genkit AI suite',
        description: 'Review AI narratives and realtime copilots.',
        href: '/workspaces/cortex-kb#ai-insights',
        icon: 'sparkle',
      },
      {
        label: 'Knowledge notes',
        description: 'Capture enablement snippets for teams.',
        href: '/workspaces/cortex-kb#notes-workbench',
        icon: 'notebook',
      },
      {
        label: 'Dashboard blueprints',
        description: 'Tailor Cortex KB storytelling dashboards.',
        href: '/workspaces/cortex-kb#dashboard-blueprints',
        icon: 'layoutDashboard',
      },
    ],
    route: '/workspaces/cortex-kb',
  },
];
