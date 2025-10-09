import type { JSX } from 'react';
import { notFound } from 'next/navigation';
import { CapabilitySidebar } from '../../components/CapabilitySidebar';
import { DataAnalyticsPanel } from '../../components/DataAnalyticsPanel';
import { GuidedDashboards } from '../../components/GuidedDashboards';
import { LiveOpsFeed } from '../../components/LiveOpsFeed';
import { ProjectPortfolio } from '../../components/ProjectPortfolio';
import { NotesWorkbench } from '../../components/NotesWorkbench';
import { RecordDesigner } from '../../components/RecordDesigner';
import { RecordOperationsTable } from '../../components/RecordOperationsTable';
import { StandardOperatingProcedure } from '../../components/StandardOperatingProcedure';
import { WorkflowLaunchpads } from '../../components/WorkflowLaunchpads';
import { DataConnectTerminal } from '../../components/DataConnectTerminal';
import { VisualizationWorkbench } from '../../components/VisualizationWorkbench';
import { AIGenerativeOps } from '../../components/AIGenerativeOps';
import { POVTimeline } from '../../components/POVTimeline';
import { capabilities } from '../../capabilities';
import {
  metrics,
  timelineEvents,
  dashboardOptions,
  activityCards,
  projectLanes,
  notesData,
  recordRows,
  sopSteps,
  quickLinks,
  terminalCommands,
  terminalOperations,
  dataPipelines,
  visualizationModules,
  visualizationScenarios,
  genkitInsights,
  multiModalChannels,
  realtimeAgents,
  povTimeline,
  povAnalyticsMetrics,
  povAnalyticsTimeline,
} from '../../data';

const workspaceMap: Record<string, () => JSX.Element> = {
  'trr-management': () => (
    <>
      <DataAnalyticsPanel metrics={metrics} timeline={timelineEvents} />
      <GuidedDashboards options={dashboardOptions} />
      <LiveOpsFeed cards={activityCards} />
    </>
  ),
  'pov-management': () => (
    <>
      <DataAnalyticsPanel metrics={povAnalyticsMetrics} timeline={povAnalyticsTimeline} />
      <POVTimeline milestones={povTimeline} />
      <ProjectPortfolio lanes={projectLanes} />
      <NotesWorkbench recordName="POV outcomes" notes={notesData} />
      <RecordOperationsTable records={recordRows} />
    </>
  ),
  'integration-hub': () => (
    <>
      <DataConnectTerminal
        commands={terminalCommands}
        operations={terminalOperations}
        pipelines={dataPipelines}
      />
      <WorkflowLaunchpads links={quickLinks} />
      <LiveOpsFeed cards={activityCards} />
    </>
  ),
  'scenario-engine': () => (
    <>
      <VisualizationWorkbench modules={visualizationModules} scenarios={visualizationScenarios} />
      <RecordDesigner />
      <StandardOperatingProcedure name="Incident Response SOP" version="7.4" steps={sopSteps} />
    </>
  ),
  'content-library': () => (
    <>
      <RecordOperationsTable records={recordRows} />
      <StandardOperatingProcedure name="Content Release SOP" version="3.1" steps={sopSteps} />
      <WorkflowLaunchpads links={quickLinks} />
    </>
  ),
  'cortex-kb': () => (
    <>
      <AIGenerativeOps insights={genkitInsights} channels={multiModalChannels} agents={realtimeAgents} />
      <NotesWorkbench recordName="Cortex Knowledge" notes={notesData} />
      <GuidedDashboards options={dashboardOptions} />
    </>
  ),
};

export function generateStaticParams() {
  return capabilities.map((capability) => ({ slug: capability.id }));
}

export default async function WorkspacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const renderWorkspace = workspaceMap[slug];
  const activeCapability = capabilities.find((capability) => capability.id === slug);

  if (!renderWorkspace || !activeCapability) {
    notFound();
  }

  return (
    <main className="workspace-page">
      <CapabilitySidebar capabilities={capabilities} defaultCapabilityId={activeCapability.id} />
      <section className="workspace-page__content" aria-labelledby="workspace-page-title">
        <header className="workspace-page__header">
          <p className="workspace-grid__eyebrow">{activeCapability.title}</p>
          <h1 id="workspace-page-title">{activeCapability.description}</h1>
          <p className="section-subtitle">{activeCapability.journey}</p>
        </header>
        {renderWorkspace()}
      </section>
    </main>
  );
}
