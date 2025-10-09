import { Icon } from './iconography';

interface ProcedureStep {
  id: number;
  title: string;
  description: string;
  owner: string;
  status: 'Not started' | 'In progress' | 'Complete';
  duration: string;
}

interface StandardOperatingProcedureProps {
  name: string;
  version: string;
  steps: ProcedureStep[];
}

export function StandardOperatingProcedure({ name, version, steps }: StandardOperatingProcedureProps) {
  return (
    <section className="workspace-grid" aria-labelledby="sop-title" id="standard-operating-procedure">
      <header className="workspace-grid__header">
        <div>
          <p className="workspace-grid__eyebrow">SOP</p>
          <h3 id="sop-title">{name}</h3>
          <p className="section-subtitle">Version {version}. Align every responder on an auditable, step-driven playbook.</p>
        </div>
        <div className="workspace-grid__cta-group" role="group" aria-label="SOP actions">
          <button type="button" className="btn-ghost">
            <Icon name="download" className="btn-icon" aria-hidden="true" /> Export PDF
          </button>
          <button type="button" className="btn-primary">
            <Icon name="pencil" className="btn-icon" aria-hidden="true" /> Edit SOP
          </button>
        </div>
      </header>
      <ol className="sop-list">
        {steps.map((step) => (
          <li key={step.id} className={`sop-card sop-card--${step.status.replace(/\s+/g, '-').toLowerCase()}`}>
            <div className="sop-card__index">{step.id}</div>
            <div className="sop-card__body">
              <h4>{step.title}</h4>
              <p>{step.description}</p>
              <div className="sop-card__meta">
                <span>{step.owner}</span>
                <span>{step.duration}</span>
                <span className="sop-card__status">{step.status}</span>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
