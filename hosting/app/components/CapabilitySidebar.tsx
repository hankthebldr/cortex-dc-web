'use client';

import { useMemo, useState } from 'react';
import { Icon, type IconName } from './iconography';

export type Capability = {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  journey: string;
  metrics: { label: string; value: string }[];
  actions: { label: string; icon: IconName; href: string }[];
  playbooks: string[];
};

type CapabilitySidebarProps = {
  capabilities: Capability[];
};

export function CapabilitySidebar({ capabilities }: CapabilitySidebarProps) {
  const [activeId, setActiveId] = useState(() => capabilities[0]?.id ?? '');

  const activeCapability = useMemo(
    () => capabilities.find((capability) => capability.id === activeId) ?? capabilities[0],
    [capabilities, activeId],
  );

  return (
    <section className="capability-shell" aria-labelledby="capability-heading" id="capabilities">
      <aside className="capability-nav" aria-label="Workspace capabilities">
        <header className="capability-nav__header">
          <p className="workspace-grid__eyebrow">Workspace Modes</p>
          <h3 id="capability-heading">Choose a Cortex capability</h3>
          <p>
            Toggle between specialized workspaces tailored for readiness, evaluations, integrations, scenario testing, content
            operations, and Cortex knowledge.
          </p>
        </header>
        <ul className="capability-nav__list">
          {capabilities.map((capability) => {
            const isActive = capability.id === activeCapability?.id;
            return (
              <li key={capability.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(capability.id)}
                  className={`capability-nav__button${isActive ? ' capability-nav__button--active' : ''}`}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <Icon name={capability.icon} aria-hidden="true" />
                  <div>
                    <strong>{capability.title}</strong>
                    <p>{capability.description}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {activeCapability && (
        <div className="capability-panel" role="region" aria-live="polite">
          <header className="capability-panel__header">
            <div>
              <p className="workspace-grid__eyebrow">Guided mission</p>
              <h3>{activeCapability.title}</h3>
            </div>
            <span className="capability-panel__journey">{activeCapability.journey}</span>
          </header>

          <p className="capability-panel__summary">{activeCapability.description}</p>

          <dl className="capability-panel__metrics" aria-label="Capability health metrics">
            {activeCapability.metrics.map((metric) => (
              <div key={metric.label}>
                <dt>{metric.label}</dt>
                <dd>{metric.value}</dd>
              </div>
            ))}
          </dl>

          <div className="capability-panel__actions" role="group" aria-label="Capability actions">
            {activeCapability.actions.map((action) => (
              <a key={action.label} className="capability-panel__action" href={action.href}>
                <Icon name={action.icon} className="capability-panel__action-icon" aria-hidden="true" />
                <span>{action.label}</span>
              </a>
            ))}
          </div>

          <section className="capability-panel__playbooks" aria-label="Recommended playbooks">
            <h4>Guided dashboards</h4>
            <ul>
              {activeCapability.playbooks.map((playbook) => (
                <li key={playbook}>
                  <Icon name="layoutDashboard" aria-hidden="true" />
                  <span>{playbook}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </section>
  );
}
