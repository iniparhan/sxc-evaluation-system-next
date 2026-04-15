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
 * Get list of evaluatees for the current evaluator
 */
export async function getEvaluatees(evaluatorId: number): Promise<Evaluatee[]> {
  const res = await fetch(`/api/evaluatees?evaluator_id=${evaluatorId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch evaluatees");
  }

  const data = await res.json();
  return data.evaluatees;
}

/**
 * Get or create an evaluation record
 */
export async function getOrCreateEvaluation(
  evaluatorId: number,
  evaluateeId: number,
  periodId?: number
): Promise<Evaluation> {
  const res = await fetch("/api/evaluations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ evaluator_id: evaluatorId, evaluatee_id: evaluateeId, period_id: periodId }),
  });

  if (!res.ok) {
    throw new Error("Failed to get/create evaluation");
  }

  const data = await res.json();
  return data.evaluation;
}

/**
 * Get evaluation detail with scores and KPIs
 */
export async function getEvaluationDetail(
  evaluationId: number,
  evaluateeId: number
): Promise<EvaluationDetail> {
  const res = await fetch(`/api/evaluations/${evaluationId}?evaluatee_id=${evaluateeId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch evaluation detail");
  }

  return res.json();
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
    body: JSON.stringify({ scores }),
  });

  if (!res.ok) {
    throw new Error("Failed to save scores");
  }
}

/**
 * Submit evaluation (set submitted_at)
 */
export async function submitEvaluation(evaluationId: number): Promise<void> {
  const res = await fetch(`/api/evaluations/${evaluationId}/submit`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Failed to submit evaluation");
  }
}

/**
 * Check completion status for all evaluatees
 */
export async function getCompletionStatus(evaluatorId: number): Promise<CompletionStatus> {
  const res = await fetch(`/api/evaluations/status?evaluator_id=${evaluatorId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch completion status");
  }

  return res.json();
}
