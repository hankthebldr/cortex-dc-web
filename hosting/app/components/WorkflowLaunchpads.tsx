import { Icon, type IconName } from './iconography';

interface WorkflowLink {
  title: string;
  description: string;
  icon: IconName;
  href: string;
}

interface WorkflowLaunchpadsProps {
  links: WorkflowLink[];
}

export function WorkflowLaunchpads({ links }: WorkflowLaunchpadsProps) {
  return (
    <section id="workflow-launchpads">
      <h3 className="section-heading">Workflow Launchpads</h3>
      <p className="section-subtitle">
        Navigate directly into specialized Cortex XSIAM tooling. Each launchpad opens a focused workspace without
        losing context from this console.
      </p>
      <div className="quick-links">
        {links.map((link) => (
          <a key={link.title} href={link.href} className="quick-link-card">
            <Icon name={link.icon} className="quick-link-card__icon" aria-hidden="true" />
            <h4>{link.title}</h4>
            <p>{link.description}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
