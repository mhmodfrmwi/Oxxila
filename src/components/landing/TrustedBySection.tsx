import { useEffect, useState } from "react";
import { Marquee } from "../ui/Marquee";
import { TrustedLogoItem } from "./TrustedLogo";
import { trustedLogos } from "./trustedLogos";

export function TrustedBySection() {
  const [duration, setDuration] = useState(40);

  useEffect(() => {
    const updateDuration = () => {
      setDuration(window.innerWidth < 769 ? 28 : 40);
    };
    updateDuration();
    window.addEventListener("resize", updateDuration);
    return () => window.removeEventListener("resize", updateDuration);
  }, []);

  const logoTrack = (
    <div className="flex items-center gap-8 pr-8 sm:gap-12 sm:pr-12 md:gap-16 md:pr-16 lg:gap-20 lg:pr-20 xl:gap-24 xl:pr-24">
      {trustedLogos.map((logo) => (
        <TrustedLogoItem key={logo.id} logo={logo} />
      ))}
    </div>
  );

  return (
    <section
      className="bg-background py-8 sm:py-10 lg:py-14"
      aria-label="Trusted by leading companies"
    >
      <div className="relative w-full [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] sm:[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <Marquee duration={duration} pauseOnHover className="py-1">
          {logoTrack}
        </Marquee>
      </div>
    </section>
  );
}
