"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import EvaluateeCard from "@/components/EvaluateeCard";
import { getCurrentUser, UserSession } from "@/services/authService";
import { getEvaluatees, getCompletionStatus } from "@/services/evaluationService";
import { Evaluatee, CompletionStatus } from "@/services/evaluationService";

export default function OfficerListPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [evaluatees, setEvaluatees] = useState<Evaluatee[]>([]);
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);

      const [data, status] = await Promise.all([
        getEvaluatees(currentUser.id),
        getCompletionStatus(currentUser.id),
      ]);

      setEvaluatees(data);
      setCompletionStatus(status);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    router.prefetch("/user_page/form_penilaian/up_to_bottom");
    router.prefetch("/user_page/form_penilaian/bottom_to_up");
    router.prefetch("/user_page/all_officer_done");
  }, [router]);

  const handleEvaluate = (evaluateeId: number, evaluationId: number | null) => {
    // Determine if evaluating superior or subordinate
    const evaluatee = evaluatees.find((e) => e.id === evaluateeId);
    if (!evaluatee) return;

    const evaluatorRoleId = user?.role_id || 0;
    const evaluateeRoleId = evaluatee.role_id || 0;

    // Lower role_id = higher position (1=Super Admin, 6=Officer)
    const isEvaluatingSuperior = evaluatorRoleId > evaluateeRoleId;

    const formPath = isEvaluatingSuperior
      ? "/user_page/form_penilaian/bottom_to_up"
      : "/user_page/form_penilaian/up_to_bottom";

    // If already submitted (edit mode), pass evaluation_id
    if (evaluationId) {
      router.push(`${formPath}?evaluatee_id=${evaluateeId}&evaluation_id=${evaluationId}`);
    } else {
      // New evaluation - no evaluation_id needed, will be created
      router.push(`${formPath}?evaluatee_id=${evaluateeId}`);
    }
  };

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
            Performance Appraisal
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
            Evaluation List
          </h2>

          {/* Completion Status */}
          {completionStatus && (
            <div className="bg-[#f0f4f8] rounded-xl p-4 mb-6">
              <p className="text-lg font-bold text-[#083577]">
                Progress: {completionStatus.completed} / {completionStatus.total_evaluatees} completed
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                <div
                  className="bg-[#083577] h-3 rounded-full transition-all"
                  style={{
                    width: `${
                      (completionStatus.completed / completionStatus.total_evaluatees) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Evaluatee List */}
          {evaluatees.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No evaluatees found.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {evaluatees.map((evaluatee) => (
                <EvaluateeCard
                  key={evaluatee.id}
                  id={evaluatee.id}
                  name={evaluatee.name}
                  role={evaluatee.role_name || "No Role"}
                  division={evaluatee.division_name || "No Division"}
                  subDivision={evaluatee.sub_division_name || "-"}
                  isSubmitted={evaluatee.is_submitted}
                  evaluationId={evaluatee.evaluation_id}
                  onEvaluate={handleEvaluate}
                />
              ))}
            </div>
          )}

          {/* Submit Final Button */}
          {completionStatus?.is_all_complete && (
            <button
              onClick={() => router.push("/user_page/all_officer_done")}
              className="w-full mt-6 py-4 rounded-xl bg-[#083577] text-white text-lg font-bold hover:bg-[#062a5e] transition"
            >
              Submit Final
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
