// Shared types for the evaluation system

export type DivisionScope = "GLOBAL" | "SAME_DIVISION" | "SAME_SUBDIVISION";

export interface Member {
  id: number;
  name: string;
  email: string;
  division_id: number | null;
  sub_division_id: number | null;
}

export interface Role {
  id: number;
  name: string;
}

export interface Division {
  id: number;
  name: string;
}

export interface SubDivision {
  id: number;
  name: string;
  division_id: number;
}

export interface EvaluationPolicy {
  id: number;
  evaluator_role_id: number;
  evaluatee_role_id: number;
  division_scope: DivisionScope;
  priority: number;
  is_active: boolean;
}

export interface KPI {
  id: number;
  name: string;
  code: string;
  description: string;
  division_id: number | null;
  weight: number;
  max_score: number;
  is_active: boolean;
}

export interface EvaluationPeriod {
  id: number;
  name: string;
  quartal: number;
  is_active: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
