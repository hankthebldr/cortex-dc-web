'use client';

import type { FormEvent } from 'react';
import { Icon } from './iconography';
import { ActionButton } from './ActionButton';
import { useActionTelemetry } from '../hooks/useActionTelemetry';

interface NoteEntry {
  id: string;
  author: string;
  time: string;
  excerpt: string;
  sentiment: 'positive' | 'neutral' | 'warning';
}

interface NotesWorkbenchProps {
  recordName: string;
  notes: NoteEntry[];
}

export function NotesWorkbench({ recordName, notes }: NotesWorkbenchProps) {
  const logEvent = useActionTelemetry();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const summary = formData.get('note-context');
    await logEvent('notes:publish', { recordName, summary });
    event.currentTarget.reset();
  };

  return (
    <section className="workspace-grid" aria-labelledby="notes-workbench-title" id="notes-workbench">
      <header className="workspace-grid__header">
        <div>
          <p className="workspace-grid__eyebrow">{recordName}</p>
          <h3 id="notes-workbench-title">Responder Notes &amp; Annotations</h3>
          <p className="section-subtitle">
            Capture high-signal observations, pivot highlights, and responder intent. Notes stay tethered to the active
            record for rapid review.
          </p>
        </div>
        <ActionButton
          type="button"
          className="btn-primary workspace-grid__cta"
          eventName="notes:create"
          eventData={{ recordName }}
        >
          <Icon name="circlePlus" className="btn-icon" aria-hidden="true" />
          New note
        </ActionButton>
      </header>
      <div className="notes-grid">
        <form className="notes-composer" aria-label="Create a note" onSubmit={handleSubmit}>
          <label htmlFor="note-context" className="notes-composer__label">
            Context summary
          </label>
          <textarea
            id="note-context"
            name="note-context"
            rows={6}
            placeholder="What changed in the investigation? What should the next responder know?"
          />
          <div className="notes-composer__actions">
            <ActionButton type="button" className="btn-ghost" eventName="notes:save-draft" eventData={{ recordName }}>
              Save draft
            </ActionButton>
            <ActionButton type="submit" className="btn-primary" eventName="notes:publish" eventData={{ recordName }}>
              Publish note
            </ActionButton>
          </div>
        </form>
        <ul className="notes-list" aria-label="Existing notes">
          {notes.map((note) => (
            <li key={note.id} className={`note-card note-card--${note.sentiment}`}>
              <div className="note-card__meta">
                <span className="note-card__author">{note.author}</span>
                <span className="note-card__time">{note.time}</span>
              </div>
              <p>{note.excerpt}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
