"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import StarRating from "@/components/StarRating";
import { getCurrentUser } from "@/services/authService";
import { 
  getOrCreateEvaluation, 
  getEvaluationDetail, 
  saveScores, 
  submitEvaluation,
  KPIIndicator, 
  EvaluationScore 
} from "@/services/evaluationService";

export default function UpToBottomForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const evaluateeId = parseInt(searchParams.get("evaluatee_id") || "0");
  const evaluationIdFromUrl = searchParams.get("evaluation_id");

  const [evaluationId, setEvaluationId] = useState<number | null>(null);
  const [kpis, setKpis] = useState<KPIIndicator[]>([]);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadEvaluation = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/login");
        return;
      }

      let evaluation;

      // If we have evaluation_id from URL (edit mode)
      if (evaluationIdFromUrl && evaluationIdFromUrl !== "null" && evaluationIdFromUrl !== "undefined") {
        const existingEvalId = parseInt(evaluationIdFromUrl);
        if (!isNaN(existingEvalId)) {
          evaluation = await getOrCreateEvaluation(
            currentUser.id,
            evaluateeId
          );
          setEvaluationId(evaluation.id);

          // Load evaluation detail with KPIs
          const detail = await getEvaluationDetail(evaluation.id, evaluateeId);
          setKpis(detail.kpis);
          
          // Load existing scores
          const scoresMap: Record<number, number> = {};
          detail.scores.forEach((score: EvaluationScore) => {
            scoresMap[score.kpi_id] = score.score;
          });
          setScores(scoresMap);
          const existingFeedback =
            (detail as unknown as { global_feedback?: string | null }).global_feedback ||
            detail.scores.find((score) => score.notes?.trim())?.notes ||
            "";
          setFeedback(existingFeedback);
          return;
        }
      }

      // No evaluation_id - create new
      evaluation = await getOrCreateEvaluation(
        currentUser.id,
        evaluateeId
      );
      setEvaluationId(evaluation.id);

      // Load evaluation detail with KPIs
      const detail = await getEvaluationDetail(evaluation.id, evaluateeId);
      setKpis(detail.kpis);
      
      // Initialize empty scores
      setScores({});
      setFeedback("");
    } catch (error) {
      console.error("Error loading evaluation:", error);
      router.push("/user_page/officer_list");
    } finally {
      setIsLoading(false);
    }
  }, [evaluateeId, evaluationIdFromUrl, router]);

  useEffect(() => {
    loadEvaluation();
  }, [loadEvaluation]);

  const handleScoreChange = (kpiId: number, score: number) => {
    setScores((prev) => ({ ...prev, [kpiId]: score }));
  };

  const handleSave = async () => {
    if (!evaluationId) return;

    setIsSaving(true);
    try {
      const scoresArray = kpis.map((kpi) => ({
        kpi_id: kpi.id,
        score: scores[kpi.id] || 0,
        notes: feedback.trim() || undefined,
      }));

      await saveScores(evaluationId, scoresArray);
    } catch (error) {
      console.error("Error saving scores:", error);
      alert("Failed to save evaluation");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!evaluationId) return;

    // Validate all KPIs have scores
    const allFilled = kpis.every((kpi) => scores[kpi.id] && scores[kpi.id] > 0);
    if (!allFilled) {
      alert("Please fill in all KPI scores before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      await handleSave();
      await submitEvaluation(evaluationId);
      router.push("/user_page/officer_list");
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      alert("Failed to submit evaluation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const allFilled = kpis.every((kpi) => scores[kpi.id] && scores[kpi.id] > 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#cdcdcd] flex items-center justify-center">
        <p className="text-xl text-[#0b2f63]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#cdcdcd]">
      {/* HEADER */}
      <header className="bg-gradient-to-b from-[#031b3e] to-[#0c326a] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="/sxc_logo.png"
            alt="logo"
            width={120}
            height={60}
            className="loading-eager"
          />
          <h1 className="text-white font-bold text-lg md:text-2xl">
            Performance Appraisal - Subordinate Assessment
          </h1>
        </div>

        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
          }}
          className="text-white text-2xl"
          title="Logout"
        >
          ⎋
        </button>
      </header>

      {/* MAIN */}
      <main className="max-w-4xl mx-auto px-6 md:px-10 py-10">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-[#0b2f63] mb-6">
            Evaluation Form
          </h2>

          <div className="flex flex-col gap-6">
            {kpis.map((kpi) => (
              <div key={kpi.id} className="border-b pb-6 last:border-b-0">
                <p className="font-semibold text-[#0b2f63] mb-2">
                  {kpi.indicator_name || kpi.name || "KPI"}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  {kpi.definition || kpi.indicator || "-"}
                </p>
                {(kpi.descriptions?.length || 0) > 0 && (
                  <div className="mb-4 rounded-md bg-gray-50 px-3 py-2">
                    {kpi.descriptions?.map((description, index) => (
                      <p key={`${kpi.id}-${index}`} className="text-sm text-gray-700">
                        {index + 1}. {description}
                      </p>
                    ))}
                  </div>
                )}
                
                <StarRating
                  value={scores[kpi.id] || 0}
                  onChange={(score) => handleScoreChange(kpi.id, score)}
                  maxRating={kpi.max_score || 6}
                />
              </div>
            ))}
          </div>

          <div className="mt-8">
            <label
              htmlFor="global-feedback-up-to-bottom"
              className="block font-semibold text-[#0b2f63] mb-2"
            >
              Feedback / Notes (Overall)
            </label>
            <textarea
              id="global-feedback-up-to-bottom"
              placeholder="Write overall feedback for this officer (optional)"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md resize-none h-28 focus:outline-none focus:ring-2 focus:ring-[#083577]"
            />
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => router.push("/user_page/officer_list")}
              className="flex-1 py-3 rounded-xl border-2 border-[#083577] text-[#083577] font-bold hover:bg-[#083577]/10 transition"
            >
              Back
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 py-3 rounded-xl border-2 border-[#083577] bg-[#083577]/10 text-[#083577] font-bold hover:bg-[#083577]/20 transition disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!allFilled || isSubmitting}
              className="flex-1 py-3 rounded-xl bg-[#083577] text-white font-bold hover:bg-[#062a5e] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
