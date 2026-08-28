const STORAGE_KEY = "merch-product-legacy-drafts";
const RESUME_KEY  = "merch-product-legacy-draft-resume";

export interface StoredDraft {
  id: string;
  label: string;
  category: string;
  buyer: string;
  vendor: string;
  completedSteps: number;
  totalSteps: number;
  savedAt: string;
  savedAtDisplay: string;
  state: Record<string, any>;
  completedStepNumbers: number[];
}

function formatDisplay(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = now.toDateString() === d.toDateString();
  const yesterday = new Date(now.getTime() - 86400000).toDateString() === d.toDateString();
  const time = d.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" });
  if (today)     return `Today at ${time}`;
  if (yesterday) return `Yesterday at ${time}`;
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short" }) + ` at ${time}`;
}

export function loadDrafts(): StoredDraft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function upsertDraft(
  state: Record<string, any>,
  completedStepNumbers: Set<number>,
  existingId?: string,
): StoredDraft {
  const drafts = loadDrafts();
  const iso = new Date().toISOString();
  const id = existingId ?? `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const draft: StoredDraft = {
    id,
    label: (state.longDescription || state.shortDescription || "Untitled Draft").slice(0, 60),
    category: state.category ?? "",
    buyer: state.buyer ?? "",
    vendor: state.vendor ?? "",
    completedSteps: completedStepNumbers.size,
    totalSteps: 6,
    savedAt: iso,
    savedAtDisplay: formatDisplay(iso),
    state,
    completedStepNumbers: [...completedStepNumbers],
  };

  const idx = drafts.findIndex(d => d.id === id);
  if (idx >= 0) {
    drafts[idx] = draft;
  } else {
    drafts.unshift(draft);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts.slice(0, 50)));
  } catch { }
  return draft;
}

export function deleteDraft(id: string): void {
  const drafts = loadDrafts().filter(d => d.id !== id);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts)); } catch { }
}

export function deleteAllDrafts(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch { }
}

export function setResumedDraftId(id: string): void {
  try { localStorage.setItem(RESUME_KEY, id); } catch { }
}

export function getAndClearResumedDraftId(): string | null {
  try {
    const id = localStorage.getItem(RESUME_KEY);
    if (id) localStorage.removeItem(RESUME_KEY);
    return id;
  } catch { return null; }
}
