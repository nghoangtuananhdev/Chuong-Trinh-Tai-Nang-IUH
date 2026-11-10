import { useEffect, useState, useRef } from "react";
export function parseRoute(hash = "#/") {
  const [raw, search = ""] = hash.replace(/^#/, "").split("?");
  const path = raw.startsWith("/") ? raw.replace(/\/$/, "") || "/" : "/";
  const decode = (value) => {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };
  return {
    path,
    segments: path.split("/").filter(Boolean).map(decode),
    query: Object.fromEntries(new URLSearchParams(search)),
  };
}
export const buildHref = (path) => `#${path.startsWith("/") ? path : "/"}`;
export const navigate = (path) => {
  window.location.hash = buildHref(path);
};
export function useHashRoute(initialHash = "#/") {
  const currentHash = useRef(
    typeof window === "undefined" ? initialHash : window.location.hash || "#/",
  );
  const [route, setRoute] = useState(() =>
    parseRoute(
      typeof window === "undefined" ? initialHash : window.location.hash,
    ),
  );
  useEffect(() => {
    const update = () => {
      // Fragment anchors (skip links and public sections) must not change routes.
      if (!window.location.hash.startsWith("#/")) return;
      const nextHash = window.location.hash;
      if (nextHash === currentHash.current) return;
      const before = new CustomEvent("prototype:before-navigate", {
        cancelable: true,
        detail: nextHash.slice(1),
      });
      if (!window.dispatchEvent(before)) {
        window.history.replaceState(null, "", currentHash.current);
        return;
      }
      currentHash.current = nextHash;
      setRoute(parseRoute(nextHash));
    };
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  return route;
}
