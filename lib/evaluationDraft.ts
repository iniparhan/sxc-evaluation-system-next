export interface EvaluationDraft {
  scores: Record<number, number>;
  feedback: string;
  updatedAt: number;
}

const DRAFT_PREFIX = "sxc-evaluation-draft";

export function getEvaluationDraftKey(
  formType: "up_to_bottom" | "bottom_to_up",
  evaluateeId: number,
  evaluationId: number
): string {
  return `${DRAFT_PREFIX}:${formType}:${evaluateeId}:${evaluationId}`;
}

export function readEvaluationDraft(key: string): EvaluationDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as EvaluationDraft;
    if (!parsed || typeof parsed.updatedAt !== "number") return null;

    return {
      scores: parsed.scores || {},
      feedback: parsed.feedback || "",
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
}

export function writeEvaluationDraft(
  key: string,
  value: Omit<EvaluationDraft, "updatedAt">
): void {
  if (typeof window === "undefined") return;

  const payload: EvaluationDraft = {
    ...value,
    updatedAt: Date.now(),
  };

  window.localStorage.setItem(key, JSON.stringify(payload));
}

export function clearEvaluationDraft(key: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}
