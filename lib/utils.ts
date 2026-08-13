import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  const locale = typeof document !== "undefined" && document.documentElement.lang === "en" ? "en-IE" : "fr-FR";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export function formatDate(value?: string | Date) {
  if (!value) {
    return "N/A";
  }

  const locale = typeof document !== "undefined" && document.documentElement.lang === "en" ? "en-GB" : "fr-FR";
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTPUBLICBASEURL || "http://localhost:5001/api/v1";
}

export function getAssetUrl(path?: unknown) {
  let value: string | undefined;
  if (typeof path === "string") {
    value = path;
  } else if (path && typeof path === "object") {
    const obj = path as Record<string, unknown>;
    const candidate = obj.url ?? obj.path ?? obj.src ?? obj.location;
    if (typeof candidate === "string") {
      value = candidate;
    }
  }
  if (!value) {
    return null;
  }
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  const base = getBaseUrl().replace(/\/api\/v\d+\/?$/i, "").replace(/\/$/, "");
  const normalized = value.startsWith("/") ? value : `/${value}`;
  return `${base}${normalized}`;
}
