import { Icon, type IconName } from './iconography';
import { ActionLink } from './ActionLink';

export interface POVTimelineResource {
  label: string;
  description: string;
  href: string;
  icon: IconName;
}

export interface POVTimelineMilestone {
  id: string;
  date: string;
  title: string;
  description: string;
  owner: string;
  highlight: string;
  status: 'Complete' | 'In progress' | 'Planned';
  resources: POVTimelineResource[];
}

interface POVTimelineProps {
  milestones: POVTimelineMilestone[];
}

export function POVTimeline({ milestones }: POVTimelineProps) {
  return (
    <section
      className="workspace-grid pov-timeline"
      aria-labelledby="pov-timeline-title"
      id="pov-timeline"
    >
      <header className="workspace-grid__header">
        <div>
          <p className="workspace-grid__eyebrow">POV journey</p>
          <h3 id="pov-timeline-title">Proof-of-value momentum timeline</h3>
          <p className="section-subtitle">
            Re-create the guided POV story arc with Cortex context boxes. Each milestone aligns recommended app resources so
            value engineers can pivot from updates straight into action.
          </p>
        </div>
      </header>

      <ol className="pov-timeline__list">
        {milestones.map((milestone) => (
          <li key={milestone.id} className="pov-timeline__item">
            <div className="pov-timeline__meta">
              <span className="pov-timeline__date">{milestone.date}</span>
              <span
                className={`pov-timeline__status pov-timeline__status--${milestone.status
                  .toLowerCase()
                  .replace(/\s+/g, '-')}`}
              >
                {milestone.status}
              </span>
            </div>

            <div className="pov-timeline__content">
              <h4>{milestone.title}</h4>
              <p>{milestone.description}</p>
              <dl className="pov-timeline__details">
                <div>
                  <dt>Owner</dt>
                  <dd>{milestone.owner}</dd>
                </div>
                <div>
                  <dt>Highlight</dt>
                  <dd>{milestone.highlight}</dd>
                </div>
              </dl>
            </div>

            <div className="pov-timeline__resources" aria-label="Aligned Cortex resources">
              <h5>Align app resources</h5>
              <ul className="pov-timeline__resources-list">
                {milestone.resources.map((resource) => (
                  <li key={`${milestone.id}-${resource.label}`} className="pov-timeline__resource-item">
                    <ActionLink
                      href={resource.href}
                      className="pov-timeline__resource-link"
                      eventName="pov:resource-navigate"
                      eventData={{ milestoneId: milestone.id, resource: resource.label }}
                    >
                      <span className="pov-timeline__resource-icon" aria-hidden="true">
                        <Icon name={resource.icon} />
                      </span>
                      <div>
                        <span className="pov-timeline__resource-label">{resource.label}</span>
                        <p className="pov-timeline__resource-description">{resource.description}</p>
                      </div>
                    </ActionLink>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
