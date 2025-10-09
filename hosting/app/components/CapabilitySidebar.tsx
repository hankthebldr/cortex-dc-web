'use client';

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Icon, type IconName } from './iconography';
import { ActionButton } from './ActionButton';
import { ActionLink } from './ActionLink';

export type Capability = {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  journey: string;
  metrics: { label: string; value: string }[];
  actions: { label: string; icon: IconName; href: string }[];
  playbooks: string[];
  resources: { label: string; description: string; href: string; icon: IconName }[];
  route: string;
};

type CapabilitySidebarProps = {
  capabilities: Capability[];
  defaultCapabilityId?: string;
};

export function CapabilitySidebar({ capabilities, defaultCapabilityId }: CapabilitySidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const activeCapability = useMemo(() => {
    const matchedCapability = capabilities.find((capability) => pathname?.startsWith(capability.route));
    if (matchedCapability) {
      return matchedCapability;
    }

    if (defaultCapabilityId) {
      return capabilities.find((capability) => capability.id === defaultCapabilityId) ?? capabilities[0];
    }

    return capabilities[0];
  }, [capabilities, pathname, defaultCapabilityId]);

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
                <ActionButton
                  type="button"
                  className={`capability-nav__button${isActive ? ' capability-nav__button--active' : ''}`}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => router.push(capability.route)}
                  eventName="capability:navigate"
                  eventData={{ capabilityId: capability.id, route: capability.route }}
                >
                  <Icon name={capability.icon} aria-hidden="true" />
                  <div>
                    <strong>{capability.title}</strong>
                    <p>{capability.description}</p>
                  </div>
                </ActionButton>
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
              <ActionLink
                key={action.label}
                className="capability-panel__action"
                href={action.href}
                eventName="capability:action"
                eventData={{ capabilityId: activeCapability.id, action: action.label }}
              >
                <Icon name={action.icon} className="capability-panel__action-icon" aria-hidden="true" />
                <span>{action.label}</span>
              </ActionLink>
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

          <section className="capability-panel__resources" aria-label="Aligned app resources">
            <h4>App resources</h4>
            <ul className="capability-panel__resources-list">
              {activeCapability.resources.map((resource) => (
                <li key={resource.label}>
                  <ActionLink
                    className="capability-panel__resource"
                    href={resource.href}
                    eventName="capability:resource"
                    eventData={{ capabilityId: activeCapability.id, resource: resource.label }}
                  >
                    <Icon name={resource.icon} aria-hidden="true" />
                    <div>
                      <span>{resource.label}</span>
                      <p>{resource.description}</p>
                    </div>
                  </ActionLink>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </section>
  );
}
