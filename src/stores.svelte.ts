import { browser } from "$app/environment";

export function createPersistedStore(key: string, startValue: any) {
  let value = startValue;

  if (browser) {
    const storedValue = localStorage.getItem(key);
    value = storedValue ? JSON.parse(storedValue) : startValue;
  }
  
  const store = $state(value);

  if (browser) {
    localStorage.setItem(key, JSON.stringify(store));
  }

  return store;
}

export const userLanguage = createPersistedStore("userLanguage", "en");

export function createSessionStore(key: string, startValue: any) {
  let value = startValue;

  if (browser) {
    const storedValue = sessionStorage.getItem(key);
    value = storedValue ? JSON.parse(storedValue) : startValue;
  }
  
  const store = $state(value);

  if (browser) {
    sessionStorage.setItem(key, JSON.stringify(store));
  }

  return store;
}

// Location構造体で保存可
export const userLocationX = createSessionStore("userLocationX", 0);
export const userLocationY = createSessionStore("userLocationY", 0);
// export const userLocation = $derived([userLocationX, userLocationY]);
