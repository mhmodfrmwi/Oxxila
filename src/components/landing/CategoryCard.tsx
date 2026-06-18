import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

interface CategoryCardProps {
  name: string;
  image: string;
  href?: string;
}

export function CategoryCard({ name, image, href }: CategoryCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-2 p-3 sm:p-4 sm:pb-0">
        <h3 className="min-w-0 font-serif text-sm font-medium text-[#2D2A4A] sm:text-base dark:text-white">
          {name}
        </h3>
        <span
          className={[
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
            "bg-[#C0B5DE]/40 text-oxxila-accent",
            "dark:bg-[#9886FF]/30 dark:text-[#C4B8FF]",
            "transition-colors duration-[400ms] ease-out",
            "group-hover:bg-oxxila-accent group-hover:text-white",
            "dark:group-hover:bg-[#9886FF]",
          ].join(" ")}
        >
          <ArrowUpRight size={16} aria-hidden />
        </span>
      </div>
      <div className="mt-2 px-3 pb-3 sm:mt-3 sm:px-4 sm:pb-4">
        <img
          src={image}
          alt={name}
          className="aspect-[168/156] w-full rounded-2xl object-cover"
          loading="lazy"
        />
      </div>
    </>
  );

  const className = [
    "group relative z-0 flex w-[min(200px,78vw)] shrink-0 snap-center flex-col overflow-hidden rounded-3xl",
    "bg-white shadow-md shadow-black/5",
    "dark:bg-[#2D2B3D] dark:shadow-md dark:shadow-black/10",
    "transition-[transform,box-shadow] duration-[400ms] ease-out",
    "motion-reduce:transition-none",
    "min-[481px]:w-auto min-[481px]:min-w-0 min-[481px]:shrink",
    "[@media(hover:hover)]:hover:z-20 [@media(hover:hover)]:hover:-translate-y-2.5",
    "[@media(hover:hover)]:hover:scale-[1.02] [@media(hover:hover)]:hover:-rotate-[4deg]",
    "[@media(hover:hover)]:hover:shadow-xl [@media(hover:hover)]:hover:shadow-black/10",
    "dark:[@media(hover:hover)]:hover:shadow-2xl dark:[@media(hover:hover)]:hover:shadow-black/35",
  ].join(" ");

  if (href) {
    return (
      <Link to={href} className={className}>
        {content}
      </Link>
    );
  }

  return <article className={className}>{content}</article>;
}
