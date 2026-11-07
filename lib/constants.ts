export const SITE_NAME = "Repwise";

export const SPECIALTIES = [
  "strength",
  "hypertrophy",
  "weight-loss",
  "mobility",
  "yoga",
  "pilates",
  "running",
  "cycling",
  "sports-performance",
  "pre-postnatal",
  "rehab",
  "seniors",
  "nutrition",
  "powerlifting",
  "crossfit",
] as const;

export type Specialty = (typeof SPECIALTIES)[number];

export const SPECIALTY_LABELS: Record<Specialty, string> = {
  strength: "Strength",
  hypertrophy: "Hypertrophy",
  "weight-loss": "Weight loss",
  mobility: "Mobility",
  yoga: "Yoga",
  pilates: "Pilates",
  running: "Running",
  cycling: "Cycling",
  "sports-performance": "Sports performance",
  "pre-postnatal": "Pre/postnatal",
  rehab: "Injury rehab",
  seniors: "Older adults",
  nutrition: "Nutrition coaching",
  powerlifting: "Powerlifting",
  crossfit: "CrossFit",
};

export const PROVINCES = {
  AB: "Alberta",
  BC: "British Columbia",
  MB: "Manitoba",
  NB: "New Brunswick",
  NL: "Newfoundland and Labrador",
  NS: "Nova Scotia",
  NT: "Northwest Territories",
  NU: "Nunavut",
  ON: "Ontario",
  PE: "Prince Edward Island",
  QC: "Quebec",
  SK: "Saskatchewan",
  YT: "Yukon",
} as const;

export type Province = keyof typeof PROVINCES;

export const PROVINCE_CODES = Object.keys(PROVINCES) as [
  Province,
  ...Province[],
];

/** Slugs that would collide with routes or look official. */
export const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "apply",
  "auth",
  "dashboard",
  "new",
  "repwise",
  "settings",
  "studio",
  "support",
  "trainers",
]);
