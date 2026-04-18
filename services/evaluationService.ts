// Types for evaluation system

export interface Evaluatee {
  id: number;
  name: string;
  email: string;
  role_id: number | null;
  role_name: string | null;
  division_id: number | null;
  division_name: string | null;
  sub_division_id: number | null;
  sub_division_name: string | null;
  evaluation_id: number | null;
  is_submitted: boolean;
}

export interface Evaluation {
  id: number;
  evaluator_id: number;
  evaluatee_id: number;
  period_id: number | null;
  submitted_at: string | null;
  created_at: string;
}

export interface EvaluationCreate {
  evaluator_id: number;
  evaluatee_id: number;
  period_id?: number;
}

export interface ScoreInput {
  kpi_id: number;
  score: number;
  notes?: string;
}

export interface KPIIndicator {
  id: number;
  name?: string;
  indicator?: string;
  indicator_name?: string;
  definition?: string;
  descriptions?: string[];
  type?: "UPWARD" | "DOWNWARD_GENERAL" | "DOWNWARD_DEPARTMENT";
  division_id: number | null;
  weight: number | null;
  max_score: number | null;
  is_active?: boolean | null;
}

export interface EvaluationScore {
  id: number;
  evaluation_id: number;
  kpi_id: number;
  score: number;
  notes: string | null;
  kpi: {
    id: number;
    name: string;
    code: string;
    indicator: string;
  };
}

export interface EvaluationDetail {
  evaluation: Evaluation;
  scores: EvaluationScore[];
  kpis: KPIIndicator[];
}

export interface CompletionStatus {
  total_evaluatees: number;
  completed: number;
  pending: number;
  is_all_complete: boolean;
}

/**
 * 🔥 Helper untuk handle response (BIAR GAK BLIND ERROR)
 */
async function handleResponse(res: Response) {
  const text = await res.text();

  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!res.ok) {
    console.error("API ERROR:", res.status, data);
    throw new Error(data.message || `Error ${res.status}`);
  }

  return data;
}

/**
 * Get list of evaluatees for the current evaluator
 */
export async function getEvaluatees(evaluatorId: number): Promise<Evaluatee[]> {
  const res = await fetch(`/api/evaluatees?evaluator_id=${evaluatorId}`, {
    credentials: "include",
  });

  const data = await handleResponse(res);
  return data.evaluatees;
}

/**
 * Get or create an evaluation record
 */
export async function getOrCreateEvaluation(
  evaluateeId: number,
  periodId?: number
): Promise<Evaluation> {
  const res = await fetch("/api/evaluations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // 🔥 FIX AUTH
    body: JSON.stringify({
      evaluatee_id: evaluateeId,
      period_id: periodId,
    }),
  });

  const data = await handleResponse(res);
  return data.evaluation;
}

/**
 * Get evaluation detail with scores and KPIs
 */
export async function getEvaluationDetail(
  evaluationId: number,
  evaluateeId: number
): Promise<EvaluationDetail> {
  const res = await fetch(
    `/api/evaluations/${evaluationId}?evaluatee_id=${evaluateeId}`,
    {
      credentials: "include",
    }
  );

  return handleResponse(res);
}

/**
 * Save/update evaluation scores
 */
export async function saveScores(
  evaluationId: number,
  scores: ScoreInput[]
): Promise<void> {
  const res = await fetch(`/api/evaluations/${evaluationId}/scores`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ scores }),
  });

  await handleResponse(res);
}

/**
 * Submit evaluation (set submitted_at)
 */
export async function submitEvaluation(evaluationId: number): Promise<void> {
  const res = await fetch(`/api/evaluations/${evaluationId}/submit`, {
    method: "POST",
    credentials: "include",
  });

  await handleResponse(res);
}

/**
 * Check completion status for all evaluatees
 */
export async function getCompletionStatus(
  evaluatorId: number
): Promise<CompletionStatus> {
  const res = await fetch(
    `/api/evaluations/status?evaluator_id=${evaluatorId}`,
    {
      credentials: "include",
    }
  );

  return handleResponse(res);
}