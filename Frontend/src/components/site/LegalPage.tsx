export interface Section {
  heading: string;
  body: string;
}

export function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: Section[];
}) {
  return (
    <div className="container-x py-10">
      <div className="max-w-3xl">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{updated}</p>
        <div className="mt-8 space-y-7">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-display text-lg font-bold">{s.heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </section>
          ))}
        </div>
        <p className="mt-10 rounded-xl bg-cream p-5 text-sm text-muted-foreground">
          Questions about this policy? Write to{" "}
          <span className="font-semibold text-foreground">care@flowersforever.in</span> or call
          +91 98000 12345, 9 AM to 9 PM, all days.
        </p>
      </div>
    </div>
  );
}
