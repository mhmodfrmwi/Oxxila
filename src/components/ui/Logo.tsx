import { Link } from "react-router-dom";
import logoIcon from "../../assets/oxilla logo 1 (Traced).svg";
import logoWordmark from "../../assets/Oxxila.svg";

interface LogoProps {
  className?: string;
  linkTo?: string;
  /** Icon mark only */
  variant?: "full" | "icon";
}

export function Logo({
  className = "",
  linkTo = "/home",
  variant = "full",
}: LogoProps) {
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
      className={["inline-flex items-center gap-2.5", className]
        .filter(Boolean)
        .join(" ")}
    >
      <img
        src={logoIcon}
        alt=""
        className="h-8 w-8 shrink-0 object-contain"
        aria-hidden
      />
      <img
        src={logoWordmark}
        alt="Oxxila"
        className="h-6 w-auto object-contain sm:h-7"
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
