import { Icon, type IconName } from './iconography';

interface ProjectSwimlane {
  id: string;
  title: string;
  stage: string;
  icon: IconName;
  tasks: number;
  owners: string[];
  eta: string;
  focus: string;
}

interface ProjectPortfolioProps {
  lanes: ProjectSwimlane[];
}

export function ProjectPortfolio({ lanes }: ProjectPortfolioProps) {
  return (
    <section className="workspace-grid" aria-labelledby="project-portfolio-title" id="project-portfolio">
      <header className="workspace-grid__header">
        <div>
          <p className="workspace-grid__eyebrow">Programs</p>
          <h3 id="project-portfolio-title">Project management timeline</h3>
          <p className="section-subtitle">
            Visualize Cortex initiatives across detection engineering, automation, and readiness. Each swimlane carries
            workload focus, owners, and target completion.
          </p>
        </div>
      </header>
      <div className="portfolio-board">
        {lanes.map((lane) => (
          <article key={lane.id} className="portfolio-card">
            <header className="portfolio-card__header">
              <Icon name={lane.icon} className="portfolio-card__icon" aria-hidden="true" />
              <div>
                <h4>{lane.title}</h4>
                <p className="portfolio-card__stage">{lane.stage}</p>
              </div>
              <span className="portfolio-card__tasks" aria-label={`${lane.tasks} work items`}>
                {lane.tasks} open
              </span>
            </header>
            <p className="portfolio-card__focus">{lane.focus}</p>
            <footer className="portfolio-card__footer">
              <span className="portfolio-card__owners">{lane.owners.join(' • ')}</span>
              <span className="portfolio-card__eta">ETA {lane.eta}</span>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}
