import { AIGenerativeOps } from './components/AIGenerativeOps';
import { DataAnalyticsPanel } from './components/DataAnalyticsPanel';
import { CapabilitySidebar } from './components/CapabilitySidebar';
import { GuidedDashboards } from './components/GuidedDashboards';
import { LiveOpsFeed } from './components/LiveOpsFeed';
import { NotesWorkbench } from './components/NotesWorkbench';
import { ProjectPortfolio } from './components/ProjectPortfolio';
import { RecordDesigner } from './components/RecordDesigner';
import { RecordOperationsTable } from './components/RecordOperationsTable';
import { StandardOperatingProcedure } from './components/StandardOperatingProcedure';
import { WorkflowLaunchpads } from './components/WorkflowLaunchpads';
import { DataConnectTerminal } from './components/DataConnectTerminal';
import { VisualizationWorkbench } from './components/VisualizationWorkbench';
import { POVTimeline } from './components/POVTimeline';
import { ActionLink } from './components/ActionLink';
import { capabilities } from './capabilities';
import {
  metrics,
  timelineEvents,
  quickLinks,
  activityCards,
  terminalCommands,
  terminalOperations,
  dataPipelines,
  visualizationModules,
  visualizationScenarios,
  dashboardOptions,
  genkitInsights,
  multiModalChannels,
  realtimeAgents,
  notesData,
  projectLanes,
  sopSteps,
  recordRows,
  povTimeline,
} from './data';

export default function Page() {
  return (
    <main>
      <header className="hero">
        <span className="hero__eyebrow">Cortex XSIAM Operations</span>
        <h1 className="hero__title">Command the entire detection-to-response lifecycle</h1>
        <p className="hero__subtitle">
          Monitor live analytics, curate investigation timelines, and launch the right workflow in seconds. The
          Cortex-inspired interface harmonizes data, automation, and collaboration for modern security teams.
        </p>
        <div className="hero__actions">
          <ActionLink className="btn-primary" href="/workspaces/trr-management" eventName="hero:navigate">
            Explore capability modes
          </ActionLink>
          <ActionLink
            className="btn-ghost"
            href="/workspaces/trr-management#dashboard-blueprints"
            eventName="hero:dashboards"
          >
            Design guided dashboards
          </ActionLink>
          <ActionLink className="btn-ghost" href="/workspaces/content-library#record-designer" eventName="hero:record">
            Launch new record
          </ActionLink>
        </div>
      </header>

      <section className="route-overview" aria-labelledby="route-overview-title">
        <header className="route-overview__header">
          <p className="workspace-grid__eyebrow">Workspace transitions</p>
          <h2 id="route-overview-title">Routes &amp; page transitions across the Cortex portfolio</h2>
          <p>
            Each capability opens its own responsive workspace route. Selections in the sidebar drive navigation to the
            corresponding <code>/workspaces/&lt;capability&gt;</code> page so the entire console stays context-aware.
          </p>
        </header>
        <div className="route-overview__grid">
          {capabilities.map((capability) => (
            <article key={capability.id} className="route-overview__card">
              <h3>{capability.title}</h3>
              <p>{capability.description}</p>
              <dl>
                <div>
                  <dt>Route</dt>
                  <dd>{capability.route}</dd>
                </div>
                <div>
                  <dt>Journey</dt>
                  <dd>{capability.journey}</dd>
                </div>
              </dl>
              <ActionLink
                className="btn-secondary"
                href={capability.route}
                eventName="routes:open"
                eventData={{ capabilityId: capability.id }}
              >
                Open {capability.title}
              </ActionLink>
            </article>
          ))}
        </div>
      </section>

      <CapabilitySidebar capabilities={capabilities} />
      <GuidedDashboards options={dashboardOptions} />

      <section className="dashboard">
        <DataAnalyticsPanel metrics={metrics} timeline={timelineEvents} />
        <RecordDesigner />
      </section>

      <DataConnectTerminal
        commands={terminalCommands}
        operations={terminalOperations}
        pipelines={dataPipelines}
      />

      <VisualizationWorkbench modules={visualizationModules} scenarios={visualizationScenarios} />

      <WorkflowLaunchpads links={quickLinks} />
      <AIGenerativeOps insights={genkitInsights} channels={multiModalChannels} agents={realtimeAgents} />
      <LiveOpsFeed cards={activityCards} />

      <POVTimeline milestones={povTimeline} />
      <NotesWorkbench recordName="Record: Identity Misuse" notes={notesData} />
      <ProjectPortfolio lanes={projectLanes} />
      <StandardOperatingProcedure name="High-Sensitivity Identity Intrusion" version="2.4" steps={sopSteps} />
      <RecordOperationsTable records={recordRows} />
    </main>
  );
}
