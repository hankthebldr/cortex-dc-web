import { AIGenerativeOps } from '../components/AIGenerativeOps';
import { CapabilitySidebar } from '../components/CapabilitySidebar';
import { DataAnalyticsPanel } from '../components/DataAnalyticsPanel';
import { DataConnectTerminal } from '../components/DataConnectTerminal';
import { GuidedDashboards } from '../components/GuidedDashboards';
import { LiveOpsFeed } from '../components/LiveOpsFeed';
import { NotesWorkbench } from '../components/NotesWorkbench';
import { POVTimeline } from '../components/POVTimeline';
import { ProjectPortfolio } from '../components/ProjectPortfolio';
import { RecordDesigner } from '../components/RecordDesigner';
import { RecordOperationsTable } from '../components/RecordOperationsTable';
import { StandardOperatingProcedure } from '../components/StandardOperatingProcedure';
import { VisualizationWorkbench } from '../components/VisualizationWorkbench';
import { WorkflowLaunchpads } from '../components/WorkflowLaunchpads';
import { ActionButton } from '../components/ActionButton';
import { ActionLink } from '../components/ActionLink';
import { capabilities } from '../capabilities';
import {
  activityCards,
  dashboardOptions,
  dataPipelines,
  genkitInsights,
  metrics,
  multiModalChannels,
  notesData,
  povTimeline,
  projectLanes,
  quickLinks,
  realtimeAgents,
  recordRows,
  sopSteps,
  terminalCommands,
  terminalOperations,
  timelineEvents,
  visualizationModules,
  visualizationScenarios,
} from '../data';

const showcaseSections = [
  {
    id: 'capability-sidebar',
    title: 'Capability Sidebar',
    description:
      'Toggle Cortex mission workspaces with contextual metrics, journeys, and quick actions. Links map directly into the /workspaces routes.',
    render: () => <CapabilitySidebar capabilities={capabilities} />,
  },
  {
    id: 'guided-dashboards',
    title: 'Guided Dashboards',
    description:
      'Blueprint out personas, widgets, and outcomes for each workspace to accelerate dashboard assembly and navigation cues.',
    render: () => <GuidedDashboards options={dashboardOptions} />,
  },
  {
    id: 'data-analytics',
    title: 'Data Analytics Panel',
    description:
      'Fuse detection metrics with incident timelines, next best actions, and Cortex color language for a quick situational readout.',
    render: () => <DataAnalyticsPanel metrics={metrics} timeline={timelineEvents} />,
  },
  {
    id: 'record-designer',
    title: 'Record Designer',
    description:
      'Create or update Cortex records with schema-aware forms, AI assists, and validation states that post telemetry to Firebase.',
    render: () => <RecordDesigner />,
  },
  {
    id: 'terminal',
    title: 'Data Connect Terminal',
    description:
      'Simulate an interactive terminal with scripted commands, curated operations, and pipeline observability for Data Connect analysts.',
    render: () => (
      <DataConnectTerminal
        commands={terminalCommands}
        operations={terminalOperations}
        pipelines={dataPipelines}
      />
    ),
  },
  {
    id: 'visualization',
    title: 'Visualization Workbench',
    description:
      'Compose reusable chart modules and scenario playbooks to power Cortex dashboarding and analytics investigations.',
    render: () => (
      <VisualizationWorkbench modules={visualizationModules} scenarios={visualizationScenarios} />
    ),
  },
  {
    id: 'launchpads',
    title: 'Workflow Launchpads',
    description:
      'Provide curated entry points into investigation, automation, and reporting tooling with telemetry-enabled quick links.',
    render: () => <WorkflowLaunchpads links={quickLinks} />,
  },
  {
    id: 'ai-generative',
    title: 'AI Generative Operations',
    description:
      'Embed Genkit AI analysis, multi-modal channels, and real-time copilot monitoring inside the Cortex operations suite.',
    render: () => (
      <AIGenerativeOps insights={genkitInsights} channels={multiModalChannels} agents={realtimeAgents} />
    ),
  },
  {
    id: 'live-ops',
    title: 'Live Ops Feed',
    description:
      'Surface real-time activity cards across the portfolio to drive rapid follow-up actions and route transitions.',
    render: () => <LiveOpsFeed cards={activityCards} />,
  },
  {
    id: 'pov-timeline',
    title: 'POV Momentum Timeline',
    description:
      'Tell the POV adoption story with milestones, owners, and resource call-outs that sync with capability links.',
    render: () => <POVTimeline milestones={povTimeline} />,
  },
  {
    id: 'notes',
    title: 'Notes Workbench',
    description:
      'Capture analyst notes against a Cortex record with sentiment, attachments, and Firebase-backed save events.',
    render: () => <NotesWorkbench recordName="Record: Identity Misuse" notes={notesData} />,
  },
  {
    id: 'project-portfolio',
    title: 'Project Portfolio',
    description:
      'Visualize program delivery with swimlanes, sprints, and owners that align to Cortex mission objectives.',
    render: () => <ProjectPortfolio lanes={projectLanes} />,
  },
  {
    id: 'sop',
    title: 'Standard Operating Procedure',
    description:
      'Provide guided, auditable steps for analysts to triage and resolve threats with Cortex-aligned automation triggers.',
    render: () => (
      <StandardOperatingProcedure name="High-Sensitivity Identity Intrusion" version="2.4" steps={sopSteps} />
    ),
  },
  {
    id: 'records-table',
    title: 'Record Operations Table',
    description:
      'Manage records with add, edit, delete, and export actions that fire Firebase Cloud Functions via ActionButtons.',
    render: () => <RecordOperationsTable records={recordRows} />,
  },
];

export default function ReferenceShowcasePage() {
  return (
    <main className="reference-showcase">
      <header className="reference-showcase__hero">
        <span className="reference-showcase__eyebrow">Cortex XSIAM UI Library</span>
        <h1>All-in-one mission control showcase</h1>
        <p>
          This single page assembles every core component from the Cortex operations console so product and design
          partners can reference structure, data contracts, and Firebase-integrated interactions when implementing in
          external applications.
        </p>
        <div className="reference-showcase__actions">
          <ActionLink className="btn-primary" href="/" eventName="reference:return-home">
            Return to portfolio overview
          </ActionLink>
          <ActionButton
            className="btn-secondary"
            eventName="reference:clone"
            eventData={{ source: 'reference-showcase' }}
          >
            Log reference clone intent
          </ActionButton>
        </div>
      </header>

      <nav className="reference-showcase__toc" aria-label="Component navigation">
        <h2>Component index</h2>
        <ul>
          {showcaseSections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`}>{section.title}</a>
            </li>
          ))}
        </ul>
      </nav>

      {showcaseSections.map((section) => (
        <section key={section.id} id={section.id} className="reference-showcase__section">
          <header>
            <p className="reference-showcase__section-eyebrow">{section.id.replace(/-/g, ' ')}</p>
            <h2>{section.title}</h2>
            <p>{section.description}</p>
          </header>
          <div className="reference-showcase__component">{section.render()}</div>
        </section>
      ))}
    </main>
  );
}
