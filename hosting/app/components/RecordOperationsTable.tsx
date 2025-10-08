import { Icon } from './iconography';

interface RecordEntry {
  id: string;
  name: string;
  owner: string;
  priority: string;
  status: string;
  updated: string;
}

interface RecordOperationsTableProps {
  records: RecordEntry[];
}

export function RecordOperationsTable({ records }: RecordOperationsTableProps) {
  return (
    <section className="workspace-grid" aria-labelledby="record-ops-title" id="record-operations">
      <header className="workspace-grid__header">
        <div>
          <p className="workspace-grid__eyebrow">Records</p>
          <h3 id="record-ops-title">Operational controls</h3>
          <p className="section-subtitle">
            Govern add, edit, delete, and export flows from a single surface. Actions stay auditable and role-aware.
          </p>
        </div>
        <div className="workspace-grid__cta-group" role="group" aria-label="Record actions">
          <button type="button" className="btn-primary">
            <Icon name="circlePlus" className="btn-icon" aria-hidden="true" /> Add record
          </button>
          <button type="button" className="btn-ghost">
            <Icon name="download" className="btn-icon" aria-hidden="true" /> Export CSV
          </button>
        </div>
      </header>
      <div className="record-table" role="region" aria-live="polite">
        <table>
          <caption className="sr-only">Record operations</caption>
          <thead>
            <tr>
              <th scope="col">Record</th>
              <th scope="col">Owner</th>
              <th scope="col">Priority</th>
              <th scope="col">Status</th>
              <th scope="col">Updated</th>
              <th scope="col" className="record-table__actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <th scope="row">{record.name}</th>
                <td>{record.owner}</td>
                <td>
                  <span className={`priority priority--${record.priority.toLowerCase()}`}>{record.priority}</span>
                </td>
                <td>{record.status}</td>
                <td>{record.updated}</td>
                <td className="record-table__actions">
                  <button type="button" className="icon-button" aria-label={`Edit ${record.name}`}>
                    <Icon name="pencil" aria-hidden="true" />
                  </button>
                  <button type="button" className="icon-button" aria-label={`Delete ${record.name}`}>
                    <Icon name="trash" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
