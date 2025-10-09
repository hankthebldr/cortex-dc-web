import type { IconName } from './iconography';
import { Icon } from './iconography';

export interface TerminalCommand {
  prompt: string;
  response: string;
  status: 'success' | 'running' | 'error';
}

export interface TerminalOperation {
  name: string;
  command: string;
  description: string;
  category: string;
  icon: IconName;
}

export interface DataPipeline {
  id: string;
  label: string;
  status: 'streaming' | 'paused' | 'draft';
  lastSync: string;
}

interface DataConnectTerminalProps {
  commands: TerminalCommand[];
  operations: TerminalOperation[];
  pipelines: DataPipeline[];
}

const statusLabels: Record<TerminalCommand['status'], string> = {
  success: 'Completed',
  running: 'In progress',
  error: 'Attention required',
};

const pipelineStatusLabels: Record<DataPipeline['status'], string> = {
  streaming: 'Streaming',
  paused: 'Paused',
  draft: 'Draft',
};

export function DataConnectTerminal({
  commands,
  operations,
  pipelines,
}: DataConnectTerminalProps) {
  return (
    <section className="panel terminal" aria-labelledby="terminal-title">
      <header className="panel__header">
        <h2 id="terminal-title">
          <span>DX</span>
          Interactive Data Connect Terminal
        </h2>
        <p>
          Issue Cortex Data Connect commands, automate ingestion workflows, and monitor
          live sync health from a guided terminal canvas.
        </p>
      </header>

      <div className="terminal__body">
        <div className="terminal__screen">
          <div className="terminal__toolbar" role="presentation" aria-hidden="true">
            <div className="terminal__lights">
              <span className="terminal__light is-red" />
              <span className="terminal__light is-amber" />
              <span className="terminal__light is-green" />
            </div>
            <div className="terminal__toolbar-meta">
              <span className="terminal__meta-context">workspace cortex/xsiam</span>
              <span className="terminal__toolbar-divider" />
              <span className="terminal__meta-context">profile prod</span>
            </div>
            <div className="terminal__toolbar-connection">
              <span className="terminal__connection-dot" aria-hidden />
              <span>Secure channel</span>
            </div>
          </div>

          <div className="terminal__log" role="log" aria-live="polite">
            {commands.map((entry) => (
              <div key={entry.prompt} className={`terminal__line is-${entry.status}`}>
                <div className="terminal__prompt">
                  <span className="terminal__caret">cortex@xsiam</span>
                  <span className="terminal__command">{entry.prompt}</span>
                </div>
                <pre className="terminal__response">{entry.response}</pre>
                <span className="terminal__status">{statusLabels[entry.status]}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="terminal__sidebar" aria-label="Data Connect operations">
          <div className="terminal__group">
            <h3>Core operations</h3>
            <ul>
              {operations.map((operation) => (
                <li key={operation.name}>
                  <div className="terminal__operation">
                    <Icon name={operation.icon} aria-hidden />
                    <div>
                      <p className="terminal__operation-name">{operation.name}</p>
                      <p className="terminal__operation-description">{operation.description}</p>
                      <code>{operation.command}</code>
                    </div>
                    <span className="terminal__operation-category">{operation.category}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="terminal__group">
            <h3>Active pipelines</h3>
            <ul>
              {pipelines.map((pipeline) => (
                <li key={pipeline.id} className={`pipeline is-${pipeline.status}`}>
                  <div className="pipeline__meta">
                    <p className="pipeline__label">{pipeline.label}</p>
                    <span className="pipeline__status">
                      <span className="pipeline__status-dot" aria-hidden />
                      {pipelineStatusLabels[pipeline.status]}
                    </span>
                  </div>
                  <p className="pipeline__sync">Last sync {pipeline.lastSync}</p>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
