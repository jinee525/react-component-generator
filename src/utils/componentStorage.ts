import type { GeneratedComponent } from '../types';

const STORAGE_KEY = 'componentHistory';
const MAX_HISTORY = 50;

export function saveComponentHistory(component: GeneratedComponent): void {
  try {
    const history = loadComponentHistory();
    const updated = [component, ...history].slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save component history:', err);
  }
}

export function loadComponentHistory(): GeneratedComponent[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const parsed = JSON.parse(data);
    return Array.isArray(parsed)
      ? parsed.map((item) => ({
          ...item,
          createdAt: new Date(item.createdAt),
        }))
      : [];
  } catch (err) {
    console.error('Failed to load component history:', err);
    return [];
  }
}

export function clearComponentHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear component history:', err);
  }
}
