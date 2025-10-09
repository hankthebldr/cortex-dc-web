import type { GenkitInsight, MultiModalChannel, RealtimeAgent } from './components/AIGenerativeOps';
import type { TerminalCommand, TerminalOperation, DataPipeline } from './components/DataConnectTerminal';
import type { VisualizationModule, VisualizationScenario } from './components/VisualizationWorkbench';
import type { DashboardOption } from './components/GuidedDashboards';
import type { POVTimelineMilestone } from './components/POVTimeline';
import type { IconName } from './components/iconography';

export type Metric = {
  label: string;
  value: string;
  trend: string;
};

export type TimelineEvent = {
  time: string;
  title: string;
  description: string;
  tags: string[];
};

export type WorkflowLink = {
  title: string;
  description: string;
  icon: IconName;
  href: string;
};

export type ActivityCard = {
  title: string;
  detail: string;
  badge: string;
};

export const metrics: Metric[] = [
  {
    label: 'Ingest Volume',
    value: '12.4 TB',
    trend: '+8.6% vs last 24h',
  },
  {
    label: 'Analytics Coverage',
    value: '94%',
    trend: '12 models active',
  },
  {
    label: 'Signals Promoted',
    value: '68',
    trend: '+14 triaged',
  },
  {
    label: 'Response SLA',
    value: '12m',
    trend: 'Median handle time',
  },
  {
    label: 'Genkit Copilot Usage',
    value: '86 sessions',
    trend: 'Realtime copilots engaged',
  },
];

export const timelineEvents: TimelineEvent[] = [
  {
    time: '08:42',
    title: 'Playbook: Lateral Movement Hunt',
    description:
      'Automated analytics detected potential credential misuse across east region workloads. Validation script enriched the entity graph with new nodes.',
    tags: ['Analytics', 'Automation', 'Priority 1'],
  },
  {
    time: '09:15',
    title: 'Detection Engineering Sync',
    description:
      'Detection squad aligned on upcoming detections for insider risk. Two new hypotheses were added to the analytics backlog with supporting datasets.',
    tags: ['Collaboration', 'Planning'],
  },
  {
    time: '10:27',
    title: 'Incident #349 Escalation',
    description:
      'Escalated to crisis workflow after timeline review exposed cross-tenant beaconing patterns. Response team engaged to prepare containment guidance.',
    tags: ['Incident', 'Escalation', 'Timeline Review'],
  },
  {
    time: '10:56',
    title: 'Genkit multi-modal verdict',
    description:
      'AI copilot blended chat transcripts, process lineage, and screenshot OCR to confirm the intrusion path. Insights pushed to the investigation notebook.',
    tags: ['Genkit', 'Multi-modal', 'AI'],
  },
];

export const povAnalyticsMetrics: Metric[] = [
  {
    label: 'Detections validated',
    value: '63',
    trend: '+9 this sprint',
  },
  {
    label: 'Automation coverage',
    value: '78%',
    trend: '+12 playbooks promoted',
  },
  {
    label: 'Executive sentiment',
    value: '+32 NPS',
    trend: '3 champions logged',
  },
  {
    label: 'Use cases delivered',
    value: '14',
    trend: '3 in final review',
  },
];

export const povAnalyticsTimeline: TimelineEvent[] = [
  {
    time: 'Mon 09:00',
    title: 'Kickoff success workshop',
    description:
      'Outlined value hypotheses, confirmed scope, and mapped customer telemetry feeds for Cortex POV execution.',
    tags: ['Customer', 'Alignment'],
  },
  {
    time: 'Tue 14:30',
    title: 'Detection validation sprint',
    description:
      'Ran detection pack against customer data lake, captured 17 validated detections, and flagged 3 tuning requests.',
    tags: ['Validation', 'Analytics'],
  },
  {
    time: 'Wed 11:15',
    title: 'Executive sync draft',
    description:
      'Compiled ROI storyline with automation savings and risk reduction metrics for CIO preview.',
    tags: ['Executive', 'Story'],
  },
  {
    time: 'Thu 16:20',
    title: 'Enablement artifact export',
    description:
      'Published final evidence package and Genkit AI narrative into the Cortex content library.',
    tags: ['Enablement', 'Export'],
  },
];

export const quickLinks: WorkflowLink[] = [
  {
    title: 'Investigation Workbench',
    description: 'Dive into entity graphs, pivot across signals, and retrace responder actions in real time.',
    icon: 'compass',
    href: '/workspaces/trr-management#timeline',
  },
  {
    title: 'Genkit AI Analyst',
    description: 'Delegate summarization, evidence fusion, and response drafting to Cortex Genkit copilots.',
    icon: 'sparkle',
    href: '/workspaces/cortex-kb#ai-insights',
  },
  {
    title: 'Automation Designer',
    description: 'Author new playbooks, connect enrichment services, and publish Cortex XSIAM automations.',
    icon: 'wrench',
    href: '/workspaces/scenario-engine#record-designer',
  },
  {
    title: 'Detection Catalog',
    description: 'Review existing detections, evaluate coverage, and request new analytic content.',
    icon: 'dna',
    href: '/workspaces/content-library#record-operations',
  },
  {
    title: 'Intel Research Hub',
    description: 'Correlate sightings, manage watchlists, and operationalize external intel packages.',
    icon: 'satellite',
    href: '/workspaces/integration-hub#live-ops',
  },
];

export const activityCards: ActivityCard[] = [
  {
    title: 'Streaming pipeline healthy',
    detail: 'Last anomaly occurred 17h ago',
    badge: 'DataOps',
  },
  {
    title: 'Responder briefing ready',
    detail: 'Timeline curated with 12 high-confidence events',
    badge: 'Response',
  },
  {
    title: 'Analytics retraining window',
    detail: '3 models awaiting labelled feedback from shift alpha',
    badge: 'ML Ops',
  },
  {
    title: 'Genkit copilots online',
    detail: 'Vision + text summarization streaming at 210ms latency',
    badge: 'AI Ops',
  },
];

export const terminalCommands: TerminalCommand[] = [
  {
    prompt: 'connectors list --format table',
    response:
      '┌─────────────┬───────────┬───────────────┐\n│ Connector   │ Status    │ Last Sync      │\n├─────────────┼───────────┼───────────────┤\n│ snowflake   │ streaming │ 2m ago (green) │\n│ gcs-threats │ paused    │ 42m ago        │\n│ m365        │ streaming │ 5m ago (green) │\n└─────────────┴───────────┴───────────────┘',
    status: 'success',
  },
  {
    prompt: 'pipeline deploy data-lake --profile prod --watch',
    response:
      'Staging assets…\nRunning schema diff against prod…\nPublishing pipeline data-lake (v42)\nLive telemetry: ingest latency 182ms (target 250ms)',
    status: 'running',
  },
  {
    prompt: 'notebook export rec-349 --artifact timeline --format parquet',
    response:
      'Export prepared: s3://cortex/exports/rec-349/timeline.parquet\nNext action: share with Genkit summary channel',
    status: 'success',
  },
  {
    prompt: 'connector diagnostics gcs-threats --auto-remediate',
    response:
      'Diagnosing service account permissions…\nQueue backlog detected: 1.2M events\nAuto remediation triggered: rotating credentials + replay backlog',
    status: 'error',
  },
];

export const terminalOperations: TerminalOperation[] = [
  {
    name: 'Bootstrap Snowflake feed',
    command: 'connectors bootstrap snowflake --account acme-prod',
    description: 'Provision secure secrets, validate IP allow lists, and hydrate default schemas.',
    category: 'Ingestion',
    icon: 'database',
  },
  {
    name: 'Streaming replay',
    command: 'pipelines resume --id backlog-replay --window 24h',
    description: 'Catch up delayed sources with dynamic throttling and dedupe on ingest.',
    category: 'Recovery',
    icon: 'terminal',
  },
  {
    name: 'Entity graph merge',
    command: 'graph merge --source threat-intel --destination cortex-entities',
    description: 'Union cross-tenant observables into Cortex entity graph with lineage tracking.',
    category: 'Fusion',
    icon: 'gitBranch',
  },
  {
    name: 'Genkit enrichment publish',
    command: 'genkit publish --channel ai-response --inputs timeline,evidence',
    description: 'Broadcast new AI-ready datasets for realtime copilots and multi-modal analysis.',
    category: 'AI Ops',
    icon: 'sparkle',
  },
];

export const dataPipelines: DataPipeline[] = [
  {
    id: 'pipe-1',
    label: 'Snowflake telemetry backbone',
    status: 'streaming',
    lastSync: 'synced 2m ago',
  },
  {
    id: 'pipe-2',
    label: 'Threat intel replay queue',
    status: 'paused',
    lastSync: 'paused 42m ago',
  },
  {
    id: 'pipe-3',
    label: 'Endpoint forensics drop',
    status: 'draft',
    lastSync: 'ready for QA',
  },
];

export const visualizationModules: VisualizationModule[] = [
  {
    title: 'Adaptive time-series canvas',
    description: 'Layer anomaly bands, overlays, and AI annotations atop streaming metrics.',
    icon: 'chartLine',
    capabilities: ['Dynamic baselines', 'Forecast overlays', 'Narrative markers'],
  },
  {
    title: 'Topology & entity graph',
    description: 'Correlate identities, assets, and signals with force-directed exploration.',
    icon: 'gitBranch',
    capabilities: ['Pivot by relationship', 'Highlight critical paths', 'Surface orphan nodes'],
  },
  {
    title: 'Scenario heatmap composer',
    description: 'Compare rehearsals, POVs, and TRR outcomes with automated scoring.',
    icon: 'chartArea',
    capabilities: ['Matrix templates', 'Drill-down filters', 'Genkit insight overlays'],
  },
  {
    title: 'Multi-modal evidence board',
    description: 'Blend screenshots, transcripts, and metrics into a unified storytelling deck.',
    icon: 'chartScatter',
    capabilities: ['Drag-and-drop layout', 'AI summarization', 'Export to Cortex KB'],
  },
];

export const visualizationScenarios: VisualizationScenario[] = [
  {
    title: 'Threat readiness posture',
    summary: 'Reveal resilience KPIs by business unit with confidence intervals and TRR drill-downs.',
    visualization: 'Scenario: TRR management',
    kpis: ['Resilience index 92', 'Automation coverage 87%', 'Drill adoption 14/16'],
  },
  {
    title: 'POV momentum tracker',
    summary: 'Blend conversion velocity, validated detections, and executive sentiment for POVs.',
    visualization: 'Scenario: POV management',
    kpis: ['Win likelihood 74%', 'Validated detections 63', 'Stakeholder NPS +32'],
  },
  {
    title: 'Integration reliability pulse',
    summary: 'Expose latency waterfalls, backlog hotspots, and SLA adherence across connectors.',
    visualization: 'Scenario: Integration Hub',
    kpis: ['Latency budget 420ms', 'Connectors healthy 34', 'Error budget burn 9%'],
  },
  {
    title: 'Genkit AI coverage',
    summary: 'Monitor realtime AI usage, multi-modal adoption, and copilot ROI for leadership.',
    visualization: 'Scenario: Cortex KB',
    kpis: ['Sessions 86', 'Evidence fused 312', 'Copilot satisfaction 4.8'],
  },
];

export const dashboardOptions: DashboardOption[] = [
  {
    id: 'incident-command',
    title: 'Threat Response Command Center',
    persona: 'Incident commander',
    description:
      'Blend live incident metrics, analyst workloads, and AI triage to direct high-severity investigations.',
    focus: 'Maintain SLA compliance while orchestrating cross-team response.',
    icon: 'shieldCheck',
    widgets: [
      'Incident queue by severity and SLA drift',
      'Responder workload saturation',
      'Genkit AI triage synopsis',
    ],
    nextBestActions: [
      { label: 'Assign lead investigator', icon: 'workflow' },
      { label: 'Trigger Genkit briefing', icon: 'sparkle' },
    ],
  },
  {
    id: 'pov-insights',
    title: 'POV Outcomes Studio',
    persona: 'Value engineer',
    description:
      'Instrument POV milestones, evidence, and ROI impact by customer to accelerate close rates.',
    focus: 'Highlight validated detections and articulate quantified value.',
    icon: 'flag',
    widgets: [
      'POV milestone burn-up chart',
      'Detection validation evidence board',
      'Executive summary narrative',
    ],
    nextBestActions: [
      { label: 'Share executive digest', icon: 'download' },
      { label: 'Log customer feedback', icon: 'pencil' },
    ],
  },
  {
    id: 'integration-command',
    title: 'Integration Health Navigator',
    persona: 'Integration architect',
    description:
      'Expose connector uptime, data latency, and dependency risk across the Cortex ecosystem.',
    focus: 'Keep enrichment pathways resilient and compliant with SLAs.',
    icon: 'plug',
    widgets: [
      'Connector uptime heatmap',
      'Ingest latency waterfall',
      'Change calendar with risk scoring',
    ],
    nextBestActions: [
      { label: 'Open deployment runbook', icon: 'wrench' },
      { label: 'Notify integration owners', icon: 'satellite' },
    ],
  },
  {
    id: 'scenario-lab',
    title: 'Scenario Simulation Lab',
    persona: 'Exercise planner',
    description:
      'Model tabletop narratives, automation checkpoints, and lessons learned across rehearsal cycles.',
    focus: 'Evolve response maturity with data-backed rehearsal insights.',
    icon: 'workflow',
    widgets: [
      'Scenario readiness scorecard',
      'Automation checkpoint coverage',
      'Lessons learned log with owners',
    ],
    nextBestActions: [
      { label: 'Clone scenario template', icon: 'layers' },
      { label: 'Publish follow-up tasks', icon: 'listChecks' },
    ],
  },
];

export const povTimeline: POVTimelineMilestone[] = [
  {
    id: 'pov-kickoff',
    date: 'Week 1',
    title: 'Executive alignment & success criteria',
    description:
      'Secure stakeholder goals, define POV win themes, and capture telemetry requirements for Cortex instrumentation.',
    owner: 'Value engineering lead',
    highlight: 'Goals signed off by CSO & CIO',
    status: 'Complete',
    resources: [
      {
        label: 'Dashboard blueprint',
        description: 'Map agreed KPIs inside the POV Outcomes Studio.',
        href: '/workspaces/pov-management#dashboard-blueprints',
        icon: 'layoutDashboard',
      },
      {
        label: 'Evidence notebook',
        description: 'Seed the notes workspace with kickoff artifacts.',
        href: '/workspaces/pov-management#notes-workbench',
        icon: 'notebook',
      },
    ],
  },
  {
    id: 'pov-validation',
    date: 'Week 2',
    title: 'Detection validation & enrichment',
    description:
      'Run Cortex analytics against live telemetry, document validated detections, and sync results with customer analysts.',
    owner: 'Detection engineering pod',
    highlight: '9 detections validated with evidence',
    status: 'In progress',
    resources: [
      {
        label: 'Data & Analytics workspace',
        description: 'Review validation metrics and curated timeline.',
        href: '/workspaces/pov-management#data-analytics-panel',
        icon: 'chartLine',
      },
      {
        label: 'Operational controls',
        description: 'Track backlog items and executive deliverables.',
        href: '/workspaces/pov-management#record-operations',
        icon: 'table',
      },
    ],
  },
  {
    id: 'pov-story',
    date: 'Week 3',
    title: 'Story crafting & executive readout',
    description:
      'Fuse qualitative wins, quantitative impact, and automation stories into a shareable Cortex POV narrative.',
    owner: 'Customer success partner',
    highlight: 'Executive preview scheduled',
    status: 'In progress',
    resources: [
      {
        label: 'POV timeline canvas',
        description: 'Refine the journey before presenting externally.',
        href: '/workspaces/pov-management#pov-timeline',
        icon: 'flag',
      },
      {
        label: 'Genkit AI insights',
        description: 'Blend AI summaries into the executive briefing.',
        href: '/workspaces/pov-management#ai-insights',
        icon: 'sparkle',
      },
    ],
  },
  {
    id: 'pov-closeout',
    date: 'Week 4',
    title: 'Closeout & content hand-off',
    description:
      'Finalize deliverables, export validated artifacts, and transition POV learnings into the Cortex content library.',
    owner: 'Engagement manager',
    highlight: 'Closeout deck ready for signature',
    status: 'Planned',
    resources: [
      {
        label: 'Record designer',
        description: 'Package follow-up automation and tasks.',
        href: '/workspaces/pov-management#record-designer',
        icon: 'workflow',
      },
      {
        label: 'Content library export',
        description: 'Publish approved analytics for reuse.',
        href: '/workspaces/content-library#record-operations',
        icon: 'bookCheck',
      },
    ],
  },
];

export const genkitInsights: GenkitInsight[] = [
  {
    id: 'gx-1',
    title: 'Privilege escalation narrative',
    summary:
      'Genkit traced credential misuse from contractor VPN to privileged Azure role assignment using process lineage and IAM logs.',
    confidence: '0.94',
    mode: 'Text + Vision',
    recommendedAction: 'Share incident summary with leadership',
  },
  {
    id: 'gx-2',
    title: 'Insider risk anomaly',
    summary:
      'Genkit compared HR attrition data with unusual download spikes to flag a potential insider download siphon.',
    confidence: '0.88',
    mode: 'Structured + Chat',
    recommendedAction: 'Launch insider review workflow',
  },
  {
    id: 'gx-3',
    title: 'Automation regression',
    summary:
      'Realtime copilot flagged automation drift after replaying last 7 days of containment scripts with new telemetry.',
    confidence: '0.73',
    mode: 'Log playback',
    recommendedAction: 'Open automation QA board',
  },
];

export const multiModalChannels: MultiModalChannel[] = [
  {
    id: 'channel-1',
    channel: 'Incident timeline synthesis',
    description: 'Aggregates timeline evidence, chat transcripts, and attachments into AI-ready narratives.',
    coverage: '92% of P1 incidents',
    lastUpdated: '13 minutes ago',
  },
  {
    id: 'channel-2',
    channel: 'SaaS telemetry fusion',
    description: 'Bridges third-party SaaS audit logs with Cortex correlation models.',
    coverage: '78% of connected tenants',
    lastUpdated: '34 minutes ago',
  },
  {
    id: 'channel-3',
    channel: 'Responder coaching stream',
    description: 'Pushes Genkit step-by-step recommendations to analysts inside tickets.',
    coverage: 'All response pods',
    lastUpdated: '5 minutes ago',
  },
];

export const realtimeAgents: RealtimeAgent[] = [
  {
    id: 'agent-1',
    name: 'Response Copilot',
    status: 'Monitoring 14 incidents',
    latency: '210 ms',
    throughput: '32 events/min',
    icon: 'sparkle',
  },
  {
    id: 'agent-2',
    name: 'Intel Scout',
    status: 'Triaging 18 intel packages',
    latency: '320 ms',
    throughput: '21 events/min',
    icon: 'satellite',
  },
  {
    id: 'agent-3',
    name: 'Automation QA',
    status: 'Validating 6 playbooks',
    latency: '145 ms',
    throughput: '12 events/min',
    icon: 'workflow',
  },
];

export const notesData = [
  {
    id: 'n1',
    author: 'Shift Alpha',
    time: '12:04 UTC',
    excerpt: 'Validated beaconing with sandbox detonation. Requesting IR to prep host isolation script.',
    sentiment: 'warning' as const,
  },
  {
    id: 'n2',
    author: 'Intel Fusion',
    time: '11:36 UTC',
    excerpt: 'Mapped indicators to UNC2914. Added new YARA hits to supporting evidence.',
    sentiment: 'neutral' as const,
  },
  {
    id: 'n3',
    author: 'Automation',
    time: '10:58 UTC',
    excerpt: 'Playbook updated to enrich lateral movement path with privileged identity graph.',
    sentiment: 'positive' as const,
  },
];

export const projectLanes = [
  {
    id: 'lane-1',
    title: 'Credential Hardening',
    stage: 'Pilot validation',
    icon: 'kanban' as IconName,
    tasks: 6,
    owners: ['Identity Ops', 'Zero Trust'],
    eta: 'Apr 28',
    focus: 'Enforce step-up auth for privileged accounts across hybrid identities.',
  },
  {
    id: 'lane-2',
    title: 'Analytics Modernization',
    stage: 'Build sprint',
    icon: 'dna' as IconName,
    tasks: 9,
    owners: ['Detection Eng'],
    eta: 'May 3',
    focus: 'Ship entity behavior detections for SaaS lateral traversal.',
  },
  {
    id: 'lane-3',
    title: 'Response Playbooks',
    stage: 'QA & launch',
    icon: 'wrench' as IconName,
    tasks: 4,
    owners: ['Automation Guild'],
    eta: 'Apr 21',
    focus: 'Automate containment for unmanaged endpoint outbreaks with rollback.',
  },
];

export const sopSteps = [
  {
    id: 1,
    title: 'Triage & Verification',
    description: 'Validate signal fidelity, confirm asset scope, and label the investigation severity.',
    owner: 'Detection Lead',
    status: 'Complete' as const,
    duration: '15 min median',
  },
  {
    id: 2,
    title: 'Evidence Enrichment',
    description: 'Run automation pack to collect process lineage, user activity, and network trails.',
    owner: 'Automation Desk',
    status: 'In progress' as const,
    duration: '22 min median',
  },
  {
    id: 3,
    title: 'Containment & Comms',
    description: 'Engage responders, align communication plan, and enforce containment scripts.',
    owner: 'Response Duty Officer',
    status: 'Not started' as const,
    duration: '30 min target',
  },
];

export const recordRows = [
  {
    id: 'rec-1',
    name: 'Identity Misuse Campaign',
    owner: 'Shift Alpha',
    priority: 'Critical',
    status: 'Escalated',
    updated: '12:18 UTC',
  },
  {
    id: 'rec-2',
    name: 'Beaconing Cluster 21',
    owner: 'Intel Fusion',
    priority: 'High',
    status: 'Investigating',
    updated: '11:47 UTC',
  },
  {
    id: 'rec-3',
    name: 'Playbook QA Rollout',
    owner: 'Automation Guild',
    priority: 'Medium',
    status: 'Change review',
    updated: '09:32 UTC',
  },
];
