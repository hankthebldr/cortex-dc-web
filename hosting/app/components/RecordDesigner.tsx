export function RecordDesigner() {
  return (
    <article className="panel" id="record-designer" aria-labelledby="record-designer-title">
      <h2 id="record-designer-title" className="panel__title">
        <span>RX</span>
        Record Designer
      </h2>
      <form className="form">
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
            <button type="button">Attach evidence</button>
            <button type="button">Assign responders</button>
          </div>
          <button type="submit" className="btn-primary">
            Save record
          </button>
        </div>
      </form>
    </article>
  );
}
