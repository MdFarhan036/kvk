import { useTranslation } from "react-i18next";
import "./LanguageSwitcher.css";

export default function LanguageSwitcher({ className = "" }) {
  const { i18n, t } = useTranslation();

  const changeLanguage = (language) => {
    if (i18n.language !== language) i18n.changeLanguage(language);
  };

  return (
    <div className={`kvk-language-switcher ${className}`} role="group" aria-label={t("language")}>
      <span className="kvk-language-label">{t("language")}:</span>
      <button
        type="button"
        className={i18n.language?.startsWith("en") ? "active" : ""}
        aria-pressed={i18n.language?.startsWith("en")}
        onClick={() => changeLanguage("en")}
      >
        English
      </button>
      <span className="kvk-language-divider" aria-hidden="true">|</span>
      <button
        type="button"
        className={i18n.language?.startsWith("hi") ? "active" : ""}
        aria-pressed={i18n.language?.startsWith("hi")}
        onClick={() => changeLanguage("hi")}
      >
        हिन्दी
      </button>
    </div>
  );
}
