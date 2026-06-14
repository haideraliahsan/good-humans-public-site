import { services } from "@/lib/services";

const items = services.map((s) => s.title);

function Track() {
  return (
    <div className="marquee-track">
      {items.concat(items).map((t, i) => (
        <span key={i} className="display-text text-3xl md:text-5xl lg:text-6xl text-[var(--color-muted)]">
          {t} <span className="text-[var(--color-line)] mx-6">/</span>
        </span>
      ))}
    </div>
  );
}

export default function Marquee() {
  return (
    <div className="py-10 md:py-14 border-y border-[var(--color-line)] bg-[var(--color-paper)]">
      <div className="marquee">
        <Track />
        <Track />
      </div>
    </div>
  );
}
