import { browser } from "$app/environment";
import { _, init, locale, register } from "svelte-i18n";
import { get } from "svelte/store";

["ja"].forEach(locale => {
  register(locale, () => import(`$lib/locales/${locale}.json`));
});

type Language = "ja" | "ko" | "zh-TW" | "en-US";

const defaultLocale: Language = "ja";

init({
  fallbackLocale: "ja",
  initialLocale: browser ? window.navigator.language : defaultLocale,
})

const translate = $derived.by(() => {
  locale;
  return (namespace: String, moduleName: string) => (nodeName: string, values?: any) => {
    return get(_)(`${namespace}.${moduleName}.${nodeName}`, {values});
  }
})

export const createTranslator = (namespace: String, moduleName: string) => translate(namespace, moduleName);
