import { Icon, type IconName } from './iconography';

export type DashboardOption = {
  id: string;
  title: string;
  persona: string;
  description: string;
  focus: string;
  icon: IconName;
  widgets: string[];
  nextBestActions: { label: string; icon: IconName }[];
};

type GuidedDashboardsProps = {
  options: DashboardOption[];
};

export function GuidedDashboards({ options }: GuidedDashboardsProps) {
  return (
    <section
      className="guided-dashboards"
      aria-labelledby="guided-dashboards-heading"
      id="dashboard-blueprints"
    >
      <header className="guided-dashboards__header">
        <div>
          <p className="workspace-grid__eyebrow">Guided experiences</p>
          <h3 id="guided-dashboards-heading">Dashboard blueprints for every mission</h3>
          <p>
            Assemble Cortex dashboards tailored to the persona in focus. Each blueprint curates widgets, automation hooks, and
            next-best actions so teams can accelerate their investigations.
          </p>
        </div>
        <a className="btn-ghost" href="#capabilities">Browse full library</a>
      </header>
      <div className="guided-dashboards__grid">
        {options.map((option) => (
          <article key={option.id} className="guided-dashboards__card">
            <header>
              <div className="guided-dashboards__icon" aria-hidden="true">
                <Icon name={option.icon} size={26} />
              </div>
              <div>
                <p>{option.persona}</p>
                <h4>{option.title}</h4>
              </div>
            </header>
            <p className="guided-dashboards__description">{option.description}</p>
            <dl className="guided-dashboards__focus">
              <div>
                <dt>Mission focus</dt>
                <dd>{option.focus}</dd>
              </div>
            </dl>
            <section aria-label="Recommended widgets" className="guided-dashboards__widgets">
              <h5>Core widgets</h5>
              <ul>
                {option.widgets.map((widget) => (
                  <li key={widget}>
                    <Icon name="target" aria-hidden="true" />
                    <span>{widget}</span>
                  </li>
                ))}
              </ul>
            </section>
            <footer className="guided-dashboards__actions" aria-label="Next best actions">
              {option.nextBestActions.map((action) => (
                <button key={action.label} type="button">
                  <Icon name={action.icon} aria-hidden="true" />
                  <span>{action.label}</span>
                </button>
              ))}
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}
