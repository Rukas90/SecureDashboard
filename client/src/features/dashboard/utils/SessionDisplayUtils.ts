import type { SessionLocation } from "@project/shared"

type DateFormat = "default" | "minified"

const DATE_FORMATS: Record<DateFormat, Intl.DateTimeFormatOptions> = {
  default: {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "numeric",
    minute: "numeric",
  },
  minified: {
    year: "2-digit",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  },
}

export const formatDate = (date: Date, format: DateFormat = "default") => {
  return date.toLocaleDateString("en-US", DATE_FORMATS[format])
}
export const getLocationDisplay = (location: SessionLocation | null) => {
  if (!location) {
    return { city: "Unknown location", country: "Unknown location" }
  }
  if (location === "localhost") {
    return { city: "Localhost", country: "Localhost" }
  }
  return {
    city: location.city,
    country: location.country,
  }
}
