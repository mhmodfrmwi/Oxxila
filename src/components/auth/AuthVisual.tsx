import { Truck, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import authHeroImage from "../../assets/Auth-Pages-Image.svg";
import { Logo } from "../ui/Logo";
import { typeSmallClasses } from "../ui/typography";
import { InfoCard } from "./InfoCard";

interface AuthVisualProps {
  activeTab: "login" | "signup";
  className?: string;
  flipImage?: boolean;
}

export function AuthVisual({
  activeTab,
  className = "",
  flipImage = false,
}: AuthVisualProps) {
  const { t } = useTranslation();

  return (
    <aside
      className={[
        "relative w-full max-lg:px-4 max-lg:pb-5 sm:max-lg:px-5 lg:flex-[1.15] lg:p-0",
        className,
      ].join(" ")}
      aria-label={t("auth.visual.ariaLabel")}
    >
      <div
        className={[
          "relative overflow-hidden rounded-2xl",
          "min-h-[380px] sm:min-h-[420px] lg:min-h-[780px] lg:rounded-none",
        ].join(" ")}
      >
        <div
          className={[
            "absolute inset-0 flex items-center justify-center overflow-hidden",
            flipImage ? "-scale-x-100" : "",
          ].join(" ")}
        >
          <img
            src={authHeroImage}
            alt=""
            className="h-[95%] w-[95%] rounded-2xl object-cover object-center scale-[140%] lg:scale-[100%]"
          />
        </div>

        <div className="relative flex min-h-[320px] flex-col justify-between p-5 sm:min-h-[420px] sm:p-8 lg:min-h-[780px] lg:p-12 xl:p-18">
          <div className="flex items-start justify-between gap-4">
            <nav aria-label={t("auth.visual.navAria")} className="flex gap-4">
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  [
                    typeSmallClasses,
                    "text-white/80 hover:text-white",
                    isActive || activeTab === "signup"
                      ? "text-white underline underline-offset-4"
                      : "",
                  ].join(" ")
                }
              >
                {t("auth.visual.signUp")}
              </NavLink>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  [
                    typeSmallClasses,
                    "text-white/80 hover:text-white",
                    isActive || activeTab === "login"
                      ? "text-white underline underline-offset-4"
                      : "",
                  ].join(" ")
                }
              >
                {t("auth.visual.login")}
              </NavLink>
            </nav>
            <Logo linkTo="/home" variant="icon" className=" h-15 w-15" />
          </div>

          <div className="my-auto flex w-full flex-col gap-4">
            <InfoCard
              icon={Zap}
              title={t("auth.visual.fasterCheckout")}
              description={t("auth.visual.fasterCheckoutDesc")}
              className="w-[300px] max-w-full"
            />
            <InfoCard
              icon={Truck}
              title={t("auth.visual.trackOrders")}
              description={t("auth.visual.trackOrdersDesc")}
              className="w-[300px] max-w-full self-end"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
