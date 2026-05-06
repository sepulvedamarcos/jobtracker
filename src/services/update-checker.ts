import { getVersion } from './version.js';

export interface UpdateInfo {
  current: string;
  latest: string;
  hasUpdate: boolean;
}

export async function checkForUpdate(timeoutMs = 3000): Promise<UpdateInfo | null> {
  const current = getVersion();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch('https://registry.npmjs.org/jobtracker/latest', {
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return null;
    }

    const data = await response.json() as { version: string };
    const latest = data.version;

    return {
      current,
      latest,
      hasUpdate: latest !== current
    };
  } catch {
    return null;
  }
}