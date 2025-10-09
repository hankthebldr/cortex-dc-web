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
  return (
    <article
      id="investigation"
      className="panel"
      aria-labelledby="data-analytics-title"
    >
      <h2 id="data-analytics-title" className="panel__title">
        <span>DX</span>
        Data &amp; Analytics Workspace
      </h2>

      <div className="data-tabs" role="tablist" aria-label="Data views">
        <button type="button" className="active" role="tab" aria-selected="true">
          Data
        </button>
        <button type="button" role="tab" aria-selected="false">
          Analytics
        </button>
        <button type="button" role="tab" aria-selected="false" id="timeline">
          Timeline
        </button>
      </div>

      <div className="data-grid">
        {metrics.map((metric) => (
          <div key={metric.label} className="metric-card">
            <span className="metric-card__label">{metric.label}</span>
            <span className="metric-card__value">{metric.value}</span>
            <span className="metric-card__trend">{metric.trend}</span>
          </div>
        ))}
      </div>

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
    </article>
  );
}
