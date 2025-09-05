import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const STORAGE_KEY = "@i18n_language";

export async function detectLanguage(): Promise<string> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
  } catch {}
  const tag = Localization.getLocales()?.[0]?.languageTag || "en";
  const [lang] = tag.split("-");
  return lang || "en";
}

export async function setLanguage(lang: string) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, lang);
  } catch {}
  await i18n.changeLanguage(lang);
}

export async function initI18n() {
  const lng = await detectLanguage();

  if (!i18n.isInitialized) {
    await i18n
      .use(initReactI18next)
      .init({
        lng,
        fallbackLng: "en",
        interpolation: { escapeValue: false },
        defaultNS: "common",
        resources: {
          en: {
            common: require("../locales/en/common.json"),
            components: require("../locales/en/components.json"),
            onboarding: require("../locales/en/onboarding.json"),
            tabs: require("../locales/en/tabs.json"),
            utils: require("../locales/en/utils.json"),
          },
          // Add basic non-English namespace files as needed
          es: {
            common: require("../locales/es/common.json"),
            components: require("../locales/es/components.json"),
            onboarding: require("../locales/es/onboarding.json"),
            tabs: require("../locales/es/tabs.json"),
            utils: require("../locales/es/utils.json"),
          },
        },
        returnNull: false,
      });
  }

  return i18n;
}

export default i18n;


