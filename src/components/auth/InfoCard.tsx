import { type LucideIcon } from "lucide-react";

interface InfoCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function InfoCard({
  icon: Icon,
  title,
  description,
  className = "",
}: InfoCardProps) {
  return (
    <article
      className={[
        "flex h-[100px] items-center gap-3 rounded-full border border-white/15 bg-white/35 px-4 py-3 backdrop-blur-md",
        className,
      ].join(" ")}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white"
        aria-hidden
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="mt-0.5 line-clamp-3 text-xs leading-relaxed text-white/75">
          {description}
        </p>
      </div>
    </article>
  )
}
