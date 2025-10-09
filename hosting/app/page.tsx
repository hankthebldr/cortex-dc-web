import {
  AIGenerativeOps,
  type GenkitInsight,
  type MultiModalChannel,
  type RealtimeAgent,
} from './components/AIGenerativeOps';
import { DataAnalyticsPanel } from './components/DataAnalyticsPanel';
import { CapabilitySidebar, type Capability } from './components/CapabilitySidebar';
import { GuidedDashboards, type DashboardOption } from './components/GuidedDashboards';
import { LiveOpsFeed } from './components/LiveOpsFeed';
import { NotesWorkbench } from './components/NotesWorkbench';
import { ProjectPortfolio } from './components/ProjectPortfolio';
import { RecordDesigner } from './components/RecordDesigner';
import { RecordOperationsTable } from './components/RecordOperationsTable';
import { StandardOperatingProcedure } from './components/StandardOperatingProcedure';
import { WorkflowLaunchpads } from './components/WorkflowLaunchpads';
import {
  DataConnectTerminal,
  type DataPipeline,
  type TerminalCommand,
  type TerminalOperation,
} from './components/DataConnectTerminal';
import {
  VisualizationWorkbench,
  type VisualizationModule,
  type VisualizationScenario,
} from './components/VisualizationWorkbench';
import type { IconName } from './components/iconography';

type Metric = {
  label: string;
  value: string;
  trend: string;
};

type TimelineEvent = {
  time: string;
  title: string;
  description: string;
  tags: string[];
};

type WorkflowLink = {
  title: string;
  description: string;
  icon: IconName;
  href: string;
};

type ActivityCard = {
  title: string;
  detail: string;
  badge: string;
};

type FlowStage = {
  id: string;
  label: string;
  description: string;
};

const metrics: Metric[] = [
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

const timelineEvents: TimelineEvent[] = [
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

const quickLinks: WorkflowLink[] = [
  {
    title: 'Investigation Workbench',
    description: 'Dive into entity graphs, pivot across signals, and retrace responder actions in real time.',
    icon: 'compass',
    href: '#investigation',
  },
  {
    title: 'Genkit AI Analyst',
    description: 'Delegate summarization, evidence fusion, and response drafting to Cortex Genkit copilots.',
    icon: 'sparkle',
    href: '#ai-insights',
  },
  {
    title: 'Automation Designer',
    description: 'Author new playbooks, connect enrichment services, and publish Cortex XSIAM automations.',
    icon: 'wrench',
    href: '#automation',
  },
  {
    title: 'Detection Catalog',
    description: 'Review existing detections, evaluate coverage, and request new analytic content.',
    icon: 'dna',
    href: '#detection',
  },
  {
    title: 'Intel Research Hub',
    description: 'Correlate sightings, manage watchlists, and operationalize external intel packages.',
    icon: 'satellite',
    href: '#intel',
  },
];

const activityCards: ActivityCard[] = [
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

const flowStages: FlowStage[] = [
  {
    id: 'plan',
    label: 'Plan programs',
    description: 'Align capabilities, dashboards, and missions before execution.',
  },
  {
    id: 'activate',
    label: 'Activate analytics',
    description: 'Operationalize data pipelines, record designers, and live telemetry.',
  },
  {
    id: 'orchestrate',
    label: 'Orchestrate workflows',
    description: 'Blend AI copilots, visualization, and automation launchpads.',
  },
  {
    id: 'collaborate',
    label: 'Collaborate & learn',
    description: 'Capture context, share updates, and support responsive handoffs.',
  },
  {
    id: 'govern',
    label: 'Govern outcomes',
    description: 'Track project lanes, SOP progress, and record health.',
  },
];

const terminalCommands: TerminalCommand[] = [
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

const terminalOperations: TerminalOperation[] = [
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

const dataPipelines: DataPipeline[] = [
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

const visualizationModules: VisualizationModule[] = [
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

const visualizationScenarios: VisualizationScenario[] = [
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

const capabilities: Capability[] = [
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
      { label: 'Schedule readiness review', icon: 'workflow', href: '#dashboard-blueprints' },
      { label: 'Sync with response leadership', icon: 'sparkle', href: '#ai-insights' },
    ],
    playbooks: [
      'Threat readiness overview dashboard',
      'Incident rehearsal scoreboard',
      'Responder staffing forecast',
    ],
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
      { label: 'Launch POV dashboard', icon: 'layoutDashboard', href: '#dashboard-blueprints' },
      { label: 'Capture POV outcomes', icon: 'pencil', href: '#notes-workbench-title' },
    ],
    playbooks: [
      'Executive POV performance summary',
      'Detection validation wallboard',
      'Customer journey health tracker',
    ],
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
      { label: 'Open integration catalog', icon: 'compass', href: '#workflow-launchpads' },
      { label: 'Review deployment timeline', icon: 'radar', href: '#project-portfolio-title' },
    ],
    playbooks: [
      'Connector reliability cockpit',
      'Enrichment latency slicer',
      'Integration deployment tracker',
    ],
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
      { label: 'Launch scenario canvas', icon: 'layers', href: '#dashboard-blueprints' },
      { label: 'Publish automation updates', icon: 'wrench', href: '#record-designer' },
    ],
    playbooks: [
      'Attack path rehearsal timeline',
      'Automation validation heatmap',
      'Scenario scoring matrix',
    ],
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
      { label: 'Open content backlog', icon: 'bookCheck', href: '#record-operations' },
      { label: 'Export release package', icon: 'download', href: '#record-operations' },
    ],
    playbooks: [
      'Detection lifecycle board',
      'Content freshness indicators',
      'Release governance dashboard',
    ],
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
      { label: 'Launch Genkit brief', icon: 'sparkle', href: '#ai-insights' },
      { label: 'Browse SOP catalog', icon: 'bookCheck', href: '#standard-operating-procedure' },
    ],
    playbooks: [
      'Knowledge search trends',
      'AI enablement pulse',
      'Playbook adoption dashboard',
    ],
  },
];

const dashboardOptions: DashboardOption[] = [
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

const genkitInsights: GenkitInsight[] = [
  {
    id: 'gx-1',
    title: 'Privilege escalation narrative',
    summary:
      'Genkit traced credential misuse from contractor VPN to privileged Azure role assignment using process lineage and IAM logs.',
    confidence: '0.94',
    mode: 'Graph reasoning',
    recommendedAction: 'Publish to timeline',
  },
  {
    id: 'gx-2',
    title: 'Malware detonation synthesis',
    summary:
      'Dynamic sandbox, memory strings, and analyst annotations fused into a unified artifact report with countermeasure guidance.',
    confidence: '0.88',
    mode: 'Multi-modal summary',
    recommendedAction: 'Push to SOP',
  },
  {
    id: 'gx-3',
    title: 'Containment readiness',
    summary:
      'AI copilot validated rollback automation and identified two hosts lacking EDR coverage for immediate remediation.',
    confidence: '0.91',
    mode: 'Action planning',
    recommendedAction: 'Assign to Response',
  },
];

const multiModalChannels: MultiModalChannel[] = [
  {
    id: 'mm-1',
    channel: 'Network vision stream',
    description: 'Fusion of NetFlow, packet captures, and screenshot OCR from remote sessions.',
    coverage: 'Vision + Text',
    lastUpdated: 'Streamed 2m ago',
  },
  {
    id: 'mm-2',
    channel: 'Endpoint runtime blend',
    description: 'Kernel telemetry, process lineage, and command transcript embeddings normalized for AI search.',
    coverage: 'Telemetry + Audio',
    lastUpdated: 'Updated 4m ago',
  },
  {
    id: 'mm-3',
    channel: 'Responder comms digest',
    description: 'Shift handoffs, voice-to-text pagers, and Slack transcripts summarized for leadership briefs.',
    coverage: 'Chat + Voice',
    lastUpdated: 'Synced 7m ago',
  },
];

const realtimeAgents: RealtimeAgent[] = [
  {
    id: 'rt-1',
    name: 'Realtime MITRE copilot',
    status: 'Mapping events to ATT&CK in live stream',
    latency: '180 ms',
    throughput: '2.3 KB/s',
    icon: 'radar' as IconName,
  },
  {
    id: 'rt-2',
    name: 'Response command bot',
    status: 'Drafting containment commands with human-in-the-loop approvals',
    latency: '240 ms',
    throughput: '1.1 KB/s',
    icon: 'sparkle' as IconName,
  },
  {
    id: 'rt-3',
    name: 'Multi-modal evidence streamer',
    status: 'Ingesting screenshots + audio notes for cross-shift review',
    latency: '320 ms',
    throughput: '3.6 KB/s',
    icon: 'waveform' as IconName,
  },
];

const noteEntries = [
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

const projectLanes = [
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

const sopSteps = [
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

const recordRows = [
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

export default function Page() {
  return (
    <main>
      <header className="hero">
        <span className="hero__eyebrow">Cortex XSIAM Operations</span>
        <h1 className="hero__title">Orchestrate analytics programs from discovery to scale</h1>
        <p className="hero__subtitle">
          Coordinate planning, activation, orchestration, and governance with a console built for modern security analytics
          delivery.
        </p>
        <div className="hero__actions">
          <a className="btn-primary" href="#plan">
            Start with the flow
          </a>
          <a className="btn-ghost" href="#capabilities">
            Explore capability modes
          </a>
          <a className="btn-ghost" href="#record-designer">
            Launch new record
          </a>
        </div>
        <nav className="flow-nav" aria-label="Analytics project flow">
          {flowStages.map((stage) => (
            <a key={stage.id} className="flow-nav__item" href={`#${stage.id}`}>
              <span className="flow-nav__label">{stage.label}</span>
              <span className="flow-nav__description">{stage.description}</span>
            </a>
          ))}
        </nav>
      </header>

      <section className="flow-section" id="plan">
        <div className="flow-section__header">
          <p className="flow-section__eyebrow">Plan</p>
          <h2 className="flow-section__title">Design the mission and choose the right workspace</h2>
          <p className="flow-section__subtitle">
            Capture the operating mode and align prebuilt dashboard blueprints so every squad understands the mission ahead.
          </p>
        </div>
        <div className="flow-grid flow-grid--dual">
          <CapabilitySidebar capabilities={capabilities} />
          <GuidedDashboards options={dashboardOptions} />
        </div>
      </section>

      <section className="flow-section" id="activate">
        <div className="flow-section__header">
          <p className="flow-section__eyebrow">Activate</p>
          <h2 className="flow-section__title">Stand up analytics pipelines and operational records</h2>
          <p className="flow-section__subtitle">
            Monitor key metrics, sketch records, and use Cortex Data Connect to push new telemetry into production faster.
          </p>
        </div>
        <div className="flow-stack">
          <div className="flow-grid flow-grid--analytics">
            <DataAnalyticsPanel metrics={metrics} timeline={timelineEvents} />
            <RecordDesigner />
          </div>
          <DataConnectTerminal
            commands={terminalCommands}
            operations={terminalOperations}
            pipelines={dataPipelines}
          />
        </div>
      </section>

      <section className="flow-section" id="orchestrate">
        <div className="flow-section__header">
          <p className="flow-section__eyebrow">Orchestrate</p>
          <h2 className="flow-section__title">Visualize scenarios and launch the right automations</h2>
          <p className="flow-section__subtitle">
            Move seamlessly from hypothesis to action with interactive workbenches, curated launchpads, and Genkit copilots.
          </p>
        </div>
        <div className="flow-stack">
          <VisualizationWorkbench modules={visualizationModules} scenarios={visualizationScenarios} />
          <div className="flow-grid flow-grid--balanced">
            <WorkflowLaunchpads links={quickLinks} />
            <AIGenerativeOps
              insights={genkitInsights}
              channels={multiModalChannels}
              agents={realtimeAgents}
            />
          </div>
        </div>
      </section>

      <section className="flow-section" id="collaborate">
        <div className="flow-section__header">
          <p className="flow-section__eyebrow">Collaborate</p>
          <h2 className="flow-section__title">Keep operators aligned with live updates and context</h2>
          <p className="flow-section__subtitle">
            Review automation signals, share key findings, and keep notes anchored to every high-value record.
          </p>
        </div>
        <div className="flow-grid flow-grid--balanced">
          <LiveOpsFeed cards={activityCards} />
          <NotesWorkbench recordName="Record: Identity Misuse" notes={noteEntries} />
        </div>
      </section>

      <section className="flow-section" id="govern">
        <div className="flow-section__header">
          <p className="flow-section__eyebrow">Govern</p>
          <h2 className="flow-section__title">Track progress and codify the path to readiness</h2>
          <p className="flow-section__subtitle">
            Manage program swimlanes, reinforce standard operating procedures, and audit active Cortex records.
          </p>
        </div>
        <div className="flow-stack">
          <ProjectPortfolio lanes={projectLanes} />
          <div className="flow-grid flow-grid--dual">
            <StandardOperatingProcedure
              name="High-Sensitivity Identity Intrusion"
              version="2.4"
              steps={sopSteps}
            />
            <RecordOperationsTable records={recordRows} />
          </div>
        </div>
      </section>
    </main>
  );
}
