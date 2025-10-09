'use client';

import { Icon, type IconName } from './iconography';
import { ActionButton } from './ActionButton';

export type GenkitInsight = {
  id: string;
  title: string;
  summary: string;
  confidence: string;
  mode: string;
  recommendedAction: string;
};

export type MultiModalChannel = {
  id: string;
  channel: string;
  description: string;
  coverage: string;
  lastUpdated: string;
};

export type RealtimeAgent = {
  id: string;
  name: string;
  status: string;
  latency: string;
  throughput: string;
  icon: IconName;
};

type AIGenerativeOpsProps = {
  insights: GenkitInsight[];
  channels: MultiModalChannel[];
  agents: RealtimeAgent[];
};

export function AIGenerativeOps({ insights, channels, agents }: AIGenerativeOpsProps) {
  return (
    <section className="ai-suite" id="ai-insights" aria-labelledby="ai-suite-heading">
      <header className="ai-suite__header">
        <div>
          <p className="workspace-grid__eyebrow">Genkit Intelligence</p>
          <h3 id="ai-suite-heading">AI Copilot &amp; Multi-Modal Operations</h3>
          <p className="section-subtitle">
            Operationalize Cortex Genkit AI to synthesize insights, orchestrate multi-modal evidence, and stream real-time
            guidance into the active investigation.
          </p>
        </div>
        <ActionButton type="button" className="btn-primary ai-suite__cta" eventName="ai:launch-analysis">
          <Icon name="sparkle" className="btn-icon" aria-hidden="true" />
          Launch Genkit analysis
        </ActionButton>
      </header>

      <div className="ai-suite__grid">
        <article className="ai-suite__card" aria-labelledby="ai-insights-title">
          <header className="ai-suite__card-header">
            <Icon name="radar" aria-hidden="true" />
            <div>
              <p className="workspace-grid__eyebrow">Insight Queue</p>
              <h4 id="ai-insights-title">Latest Genkit reasoning</h4>
            </div>
          </header>
          <ul className="ai-suite__list" aria-label="Genkit insights">
            {insights.map((insight) => (
              <li key={insight.id} className="ai-suite__list-item">
                <div className="ai-suite__list-main">
                  <strong>{insight.title}</strong>
                  <p>{insight.summary}</p>
                </div>
                <dl className="ai-suite__list-meta">
                  <div>
                    <dt>Confidence</dt>
                    <dd>{insight.confidence}</dd>
                  </div>
                  <div>
                    <dt>Mode</dt>
                    <dd>{insight.mode}</dd>
                  </div>
                  <div>
                    <dt>Action</dt>
                    <dd>{insight.recommendedAction}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </article>

        <article className="ai-suite__card" aria-labelledby="ai-modal-title">
          <header className="ai-suite__card-header">
            <Icon name="layers" aria-hidden="true" />
            <div>
              <p className="workspace-grid__eyebrow">Signals fusion</p>
              <h4 id="ai-modal-title">Multi-modal analysis map</h4>
            </div>
          </header>
          <ul className="ai-suite__list" aria-label="Multi-modal channels">
            {channels.map((channel) => (
              <li key={channel.id} className="ai-suite__list-item">
                <div className="ai-suite__list-main">
                  <strong>{channel.channel}</strong>
                  <p>{channel.description}</p>
                </div>
                <dl className="ai-suite__list-meta">
                  <div>
                    <dt>Coverage</dt>
                    <dd>{channel.coverage}</dd>
                  </div>
                  <div>
                    <dt>Updated</dt>
                    <dd>{channel.lastUpdated}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </article>

        <aside className="ai-suite__rail" aria-labelledby="ai-realtime-title">
          <header className="ai-suite__card-header">
            <Icon name="waveform" aria-hidden="true" />
            <div>
              <p className="workspace-grid__eyebrow">Realtime agents</p>
              <h4 id="ai-realtime-title">Streaming copilots</h4>
            </div>
          </header>
          <ul className="ai-suite__rail-list" aria-label="Realtime AI agents">
            {agents.map((agent) => (
              <li key={agent.id} className="ai-suite__rail-item">
                <div className="ai-suite__rail-icon" aria-hidden="true">
                  <Icon name={agent.icon} />
                </div>
                <div className="ai-suite__rail-main">
                  <strong>{agent.name}</strong>
                  <p>{agent.status}</p>
                </div>
                <dl className="ai-suite__rail-meta">
                  <div>
                    <dt>Latency</dt>
                    <dd>{agent.latency}</dd>
                  </div>
                  <div>
                    <dt>Throughput</dt>
                    <dd>{agent.throughput}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
