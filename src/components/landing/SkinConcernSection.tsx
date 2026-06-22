import { CategoryCard } from "./CategoryCard";
import { useLandingCatalogContext } from "../../hooks/useLandingCatalogContext";
import { SectionHeader } from "./SectionHeader";

function ConcernSkeleton() {
  return (
    <div
      className="h-[220px] w-[min(200px,78vw)] shrink-0 animate-pulse rounded-3xl bg-white/70 dark:bg-white/5 min-[481px]:w-auto"
      aria-hidden
    />
  );
}

export function SkinConcernSection() {
  const { skinConcerns, loading } = useLandingCatalogContext();

  return (
    <section className="bg-background py-10 sm:py-14 lg:py-20">
      <div className="mx-auto max-w-[1340px] px-4 sm:px-5 lg:px-6">
        <SectionHeader
          align="center"
          title="Shop by skin concern"
          subtitle="Find clinically-proven solutions tailored to your skin"
          className="mx-auto [&_p]:mx-auto [&_p]:text-secondary-text"
        />

        <div
          className={[
            "mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 pt-2",
            "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            "min-[481px]:grid min-[481px]:grid-cols-2 min-[481px]:gap-4 min-[481px]:overflow-visible min-[481px]:pb-0 min-[481px]:pt-4",
            "min-[769px]:grid-cols-3 min-[769px]:gap-5",
            "min-[1025px]:grid-cols-6 min-[1025px]:pt-6",
          ].join(" ")}
        >
          {loading
            ? Array.from({ length: 6 }).map((_, index) => <ConcernSkeleton key={index} />)
            : skinConcerns.map((concern) => (
                <CategoryCard
                  key={concern.id}
                  name={concern.name}
                  image={concern.image}
                  href={concern.href}
                />
              ))}
        </div>
      </div>
    </section>
  );
}
