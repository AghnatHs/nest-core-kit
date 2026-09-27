import { config as dotenvConfig } from 'dotenv';

let loaded: boolean = false;

/**
 * Loads environment variables from the single `.env` file.
 * Safe to call multiple times; the file is read at most once per process.
 * always prefer existing process environment variables
 */
export function loadEnv(): void {
  if (loaded) {
    return;
  }
  loaded = true;

  dotenvConfig({
    path: '.env',
    quiet: true,
  });
}
