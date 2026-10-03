import { API_BASE_URL, DEX_IDS } from "./config.js";

export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatId(id) {
  return `#${String(id).padStart(3, "0")}`;
}

let dexEntriesPromise = null;

export function getDexEntries() {
  if (!dexEntriesPromise) {
    dexEntriesPromise = fetch(`${API_BASE_URL}/pokemon?limit=25&offset=0`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load dex list.");
        return res.json();
      })
      .then((data) =>
        data.results
          .map((entry) => ({
            name: entry.name,
            id: Number(entry.url.match(/\/(\d+)\/$/)[1]),
          }))
          .filter((entry) => DEX_IDS.includes(entry.id))
          .sort((a, b) => a.id - b.id)
      )
      .catch(() => {
        dexEntriesPromise = null;
        return [];
      });
  }
  return dexEntriesPromise;
}
