import { Icon } from './iconography';

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
  return (
    <section className="workspace-grid" aria-labelledby="notes-workbench-title">
      <header className="workspace-grid__header">
        <div>
          <p className="workspace-grid__eyebrow">{recordName}</p>
          <h3 id="notes-workbench-title">Responder Notes &amp; Annotations</h3>
          <p className="section-subtitle">
            Capture high-signal observations, pivot highlights, and responder intent. Notes stay tethered to the active
            record for rapid review.
          </p>
        </div>
        <button type="button" className="btn-primary workspace-grid__cta">
          <Icon name="circlePlus" className="btn-icon" aria-hidden="true" />
          New note
        </button>
      </header>
      <div className="notes-grid">
        <form className="notes-composer" aria-label="Create a note">
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
            <button type="button" className="btn-ghost">
              Save draft
            </button>
            <button type="submit" className="btn-primary">
              Publish note
            </button>
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
