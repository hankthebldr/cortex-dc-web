interface ActivityCard {
  title: string;
  detail: string;
  badge: string;
}

interface LiveOpsFeedProps {
  cards: ActivityCard[];
}

export function LiveOpsFeed({ cards }: LiveOpsFeedProps) {
  return (
    <section id="live-ops-feed">
      <h3 className="section-heading">Live Ops Feed</h3>
      <p className="section-subtitle">
        Surface the latest signals, automation updates, and responder milestones to keep the entire crew aligned.
      </p>
      <div className="activity-stream">
        {cards.map((card) => (
          <article key={card.title} className="activity-card">
            <span className="badge">{card.badge}</span>
            <strong>{card.title}</strong>
            <span>{card.detail}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
