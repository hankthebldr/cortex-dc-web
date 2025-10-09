'use client';

import { useMemo, useState } from 'react';
import { ActionButton } from './ActionButton';

interface Metric {
  label: string;
  value: string;
  trend: string;
}

interface TimelineEvent {
  time: string;
  title: string;
  description: string;
  tags: string[];
}

interface DataAnalyticsPanelProps {
  metrics: Metric[];
  timeline: TimelineEvent[];
}

export function DataAnalyticsPanel({ metrics, timeline }: DataAnalyticsPanelProps) {
  const [activeTab, setActiveTab] = useState<'data' | 'analytics' | 'timeline'>('data');

  const analyticsInsights = useMemo(
    () =>
      metrics.map((metric) => ({
        title: metric.label,
        highlight: metric.value,
        context: metric.trend,
      })),
    [metrics],
  );

  return (
    <article className="panel" aria-labelledby="data-analytics-title" id="data-analytics-panel">
      <h2 id="data-analytics-title" className="panel__title">
        <span>DX</span>
        Data &amp; Analytics Workspace
      </h2>

      <div className="data-tabs" role="tablist" aria-label="Data views">
        <ActionButton
          type="button"
          className={activeTab === 'data' ? 'active' : undefined}
          role="tab"
          aria-selected={activeTab === 'data'}
          onClick={() => setActiveTab('data')}
          eventName="analytics:view"
          eventData={{ tab: 'data' }}
        >
          Data
        </ActionButton>
        <ActionButton
          type="button"
          role="tab"
          className={activeTab === 'analytics' ? 'active' : undefined}
          aria-selected={activeTab === 'analytics'}
          onClick={() => setActiveTab('analytics')}
          eventName="analytics:view"
          eventData={{ tab: 'analytics' }}
        >
          Analytics
        </ActionButton>
        <ActionButton
          type="button"
          role="tab"
          className={activeTab === 'timeline' ? 'active' : undefined}
          aria-selected={activeTab === 'timeline'}
          id="timeline"
          onClick={() => setActiveTab('timeline')}
          eventName="analytics:view"
          eventData={{ tab: 'timeline' }}
        >
          Timeline
        </ActionButton>
      </div>

      {activeTab !== 'timeline' && (
        <div className="data-grid">
          {metrics.map((metric) => (
            <div key={metric.label} className="metric-card">
              <span className="metric-card__label">{metric.label}</span>
              <span className="metric-card__value">{metric.value}</span>
              <span className="metric-card__trend">{metric.trend}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="analytics-insights" role="region" aria-live="polite">
          {analyticsInsights.map((insight) => (
            <div key={insight.title} className="analytics-insights__item">
              <h4>{insight.title}</h4>
              <p>{insight.context}</p>
              <strong>{insight.highlight}</strong>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="timeline" aria-live="polite">
          {timeline.map((event) => (
            <div key={`${event.time}-${event.title}`} className="timeline-item">
              <span className="timeline-item__time">{event.time}</span>
              <div className="timeline-item__body">
                <h4>{event.title}</h4>
                <p>{event.description}</p>
                <div className="timeline-item__tags">
                  {event.tags.map((tag) => (
                    <span key={tag} className="timeline-item__tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
