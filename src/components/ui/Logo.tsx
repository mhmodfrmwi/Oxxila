import { Link } from "react-router-dom";
import logoIcon from "../../assets/oxxila-logo-mark.svg";
import logoWordmark from "../../assets/Oxxila.svg";

interface LogoProps {
  className?: string;
  linkTo?: string;
  /** Icon mark only */
  variant?: "full" | "icon";
  /** "header" matches the Figma header lockup (32×33 mark, 6px gap, 26px wordmark) from md up. */
  size?: "default" | "header";
}

export function Logo({
  className = "",
  linkTo = "/home",
  variant = "full",
  size = "default",
}: LogoProps) {
  const isHeader = size === "header";

  if (variant === "icon") {
    const icon = (
      <img
        src={logoIcon}
        alt="Oxxila"
        className={["object-contain", className || "h-10 w-10"]
          .filter(Boolean)
          .join(" ")}
      />
    );

    if (linkTo) {
      return (
        <Link
          to={linkTo}
          className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
          aria-label="Oxxila home"
        >
          {icon}
        </Link>
      );
    }

    return icon;
  }

  const content = (
    <span
      className={[
        "inline-flex items-center gap-1.5 min-[400px]:gap-2.5",
        isHeader && "md:gap-1.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <img
        src={logoIcon}
        alt=""
        className={[
          "h-7 w-7 shrink-0 object-contain min-[400px]:h-8 min-[400px]:w-8",
          isHeader && "md:h-[33px]",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden
      />
      <img
        src={logoWordmark}
        alt="Oxxila"
        className={[
          "h-5 w-auto object-contain min-[400px]:h-6 sm:h-7",
          isHeader && "md:h-[26px]",
        ]
          .filter(Boolean)
          .join(" ")}
      />
    </span>
  );

  if (linkTo) {
    return (
      <Link
        to={linkTo}
        className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
        aria-label="Oxxila home"
      >
        {content}
      </Link>
    );
  }

  return content;
}
