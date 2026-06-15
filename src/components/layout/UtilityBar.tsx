import { Moon, Search, Truck } from "lucide-react";
import langIcon from "../../assets/Lang-image.png";
import { useTheme } from "../../context/ThemeContext";

export function UtilityBar() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section
      className={[
        "border-b",
        isDark
          ? "border-border-dark bg-page-dark"
          : "border-border-light bg-page-light",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-3 py-2.5 sm:px-4 sm:py-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-input-light text-oxxila-accent dark:bg-input-dark">
            <Truck size={18} />
          </div>
          <div>
            <p className="text-sm font-medium">Free shipping over $50 orders</p>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              Limited-time offer
            </p>
          </div>
        </div>

        <div className="relative w-full lg:max-w-sm">
          <label htmlFor="site-search" className="sr-only">
            Search
          </label>
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark"
          />
          <input
            id="site-search"
            type="search"
            placeholder="Search for..."
            className="w-full rounded-full py-2.5 pl-10 pr-4 text-sm bg-input-light dark:bg-input-dark focus:outline-none focus:ring-2 focus:ring-oxxila-accent/50"
          />
        </div>

        <div className="flex w-full items-center justify-around gap-4 text-sm lg:w-auto lg:min-w-[300px]">
          <button type="button" className="flex items-start gap-2.5 text-left">
            <img
              src={langIcon}
              alt=""
              className="h-7 w-9 shrink-0 rounded-full object-cover"
              aria-hidden
            />
            <span className="flex flex-col items-start">
              <span>Language</span>
              <strong className="text-typography-secondary-text">English</strong>
            </span>
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-start gap-2.5 text-left"
          >
            <Moon size={30} strokeWidth={1.75} className="text-typography-secondary-text" aria-hidden />
            <span className="flex flex-col items-start">
              <span>Change Theme</span>
              <strong className="capitalize text-typography-secondary-text">{theme}</strong>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
