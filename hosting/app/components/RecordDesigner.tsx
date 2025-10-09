'use client';

import type { FormEvent } from 'react';
import { ActionButton } from './ActionButton';
import { useActionTelemetry } from '../hooks/useActionTelemetry';

export function RecordDesigner() {
  const logEvent = useActionTelemetry();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = formData.get('record-name');
    const owner = formData.get('record-owner');
    const priority = formData.get('record-priority');

    await logEvent('records:save', {
      name,
      owner,
      priority,
    });
  };

  return (
    <article className="panel" id="record-designer" aria-labelledby="record-designer-title">
      <h2 id="record-designer-title" className="panel__title">
        <span>RX</span>
        Record Designer
      </h2>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="record-name">Record name</label>
          <input
            id="record-name"
            name="record-name"
            placeholder="e.g. Critical identity misuse"
            autoComplete="off"
          />
        </div>
        <div className="form-group">
          <label htmlFor="record-owner">Owner squad</label>
          <select id="record-owner" name="record-owner" defaultValue="">
            <option value="" disabled>
              Select a squad
            </option>
            <option value="detect">Detect squad</option>
            <option value="respond">Respond squad</option>
            <option value="intel">Intel fusion</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="record-summary">Synopsis</label>
          <textarea
            id="record-summary"
            name="record-summary"
            rows={4}
            placeholder="Summarize observed behaviors, hypotheses, and required next steps."
          />
        </div>
        <div className="form-group">
          <label htmlFor="record-priority">Priority</label>
          <select id="record-priority" name="record-priority" defaultValue="high">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div className="form-footer">
          <div className="secondary-actions">
            <ActionButton type="button" eventName="records:attach-evidence">
              Attach evidence
            </ActionButton>
            <ActionButton type="button" eventName="records:assign-responders">
              Assign responders
            </ActionButton>
          </div>
          <ActionButton type="submit" className="btn-primary" eventName="records:save" eventData={{ source: 'form' }}>
            Save record
          </ActionButton>
        </div>
      </form>
    </article>
  );
}
