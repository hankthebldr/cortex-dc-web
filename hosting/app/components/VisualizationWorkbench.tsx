import type { IconName } from './iconography';
import { Icon } from './iconography';

export interface VisualizationModule {
  title: string;
  description: string;
  icon: IconName;
  capabilities: string[];
}

export interface VisualizationScenario {
  title: string;
  summary: string;
  kpis: string[];
  visualization: string;
}

interface VisualizationWorkbenchProps {
  modules: VisualizationModule[];
  scenarios: VisualizationScenario[];
}

export function VisualizationWorkbench({
  modules,
  scenarios,
}: VisualizationWorkbenchProps) {
  return (
    <section
      id="detection"
      className="panel visualization"
      aria-labelledby="visualization-title"
    >
      <header className="panel__header">
        <h2 id="visualization-title">
          <span>DX</span>
          Visualization Workbench
        </h2>
        <p>
          Spin up extensible graphing canvases, composable plots, and interactive dashboards that
          adapt to analyst, responder, or executive storytelling needs.
        </p>
      </header>

      <div className="visualization__layout">
        <div className="visualization__modules">
          <h3>Composable modules</h3>
          <div className="visualization__grid">
            {modules.map((module) => (
              <article key={module.title} className="visualization__card">
                <Icon name={module.icon} aria-hidden />
                <h4>{module.title}</h4>
                <p>{module.description}</p>
                <ul>
                  {module.capabilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>

        <div className="visualization__scenarios">
          <h3>Guided scenarios</h3>
          <ul>
            {scenarios.map((scenario) => (
              <li key={scenario.title}>
                <div className="scenario-card">
                  <header>
                    <p className="scenario-card__label">{scenario.visualization}</p>
                    <h4>{scenario.title}</h4>
                  </header>
                  <p>{scenario.summary}</p>
                  <div className="scenario-card__kpis">
                    {scenario.kpis.map((kpi) => (
                      <span key={kpi}>{kpi}</span>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
