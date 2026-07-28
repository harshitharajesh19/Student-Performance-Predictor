// backend/src/utils/indicatorStore.js
import fs from "fs/promises";
import path from "path";

const STORE_PATH = path.join(process.cwd(), "backend", "src", "utils", "indicator_settings.json");

// Default configuration returned when file not present
const DEFAULT_CONFIG = {
  study_hours: { active: true, weight: 1.0 },
  extracurricular_hours: { active: true, weight: 1.0 },
  sleep_hours: { active: true, weight: 1.0 },
  social_hours: { active: true, weight: 1.0 },
  physical_activity_hours: { active: true, weight: 1.0 },
  stress_level: { active: true, weight: 1.0 },
  attendance: { active: true, weight: 1.0 }
};

export async function readIndicators() {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    // if file not found, return default
    return DEFAULT_CONFIG;
  }
}

export async function writeIndicators(obj) {
  // ensure folder exists
  const dir = path.dirname(STORE_PATH);
  await fs.mkdir(dir, { recursive: true });
  // normalize values: ensure keys present
  const merged = { ...DEFAULT_CONFIG, ...obj };
  await fs.writeFile(STORE_PATH, JSON.stringify(merged, null, 2), "utf8");
  return merged;
}
