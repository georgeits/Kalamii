/* eslint-disable @next/next/no-img-element */
type AuthorPortraitProps = {
  name: string;
  imageUrl?: string | null;
  className?: string;
  large?: boolean;
};

export function AuthorPortrait({ name, imageUrl, className = "", large = false }: AuthorPortraitProps) {
  if (imageUrl) {
    return (
      <div className={`overflow-hidden rounded-[24px] border border-[color:var(--line)] bg-white/[0.045] ${className}`}>
        <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`grid place-items-center rounded-[24px] border border-[color:var(--line)] bg-[radial-gradient(circle_at_30%_20%,_rgba(255,225,183,0.18),_rgba(255,255,255,0.04)_56%,_rgba(8,14,28,0.92))] font-serif text-[color:var(--gold-soft)] ${large ? "text-7xl" : "text-2xl"} ${className}`}
    >
      {name.slice(0, 1)}
    </div>
  );
}
