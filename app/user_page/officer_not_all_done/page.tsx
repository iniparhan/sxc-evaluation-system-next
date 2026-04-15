"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { getCurrentUser, UserSession } from "@/services/authService";
import { getCompletionStatus } from "@/services/evaluationService";

export default function OfficerNotAllDonePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [status, setStatus] = useState<{
    total: number;
    completed: number;
    pending: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push("/login");
          return;
        }
        setUser(currentUser);

        const completionStatus = await getCompletionStatus(currentUser.id);
        setStatus({
          total: completionStatus.total_evaluatees,
          completed: completionStatus.completed,
          pending: completionStatus.pending,
        });
      } catch (error) {
        console.error("Error loading status:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#cdcdcd] flex items-center justify-center">
        <p className="text-xl text-[#0b2f63]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#cdcdcd]">
      <Header title="Evaluation Progress" />

      <main className="max-w-4xl mx-auto px-6 md:px-10 py-10">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <h2 className="text-3xl font-bold text-[#0b2f63] mb-4">
            Evaluation In Progress
          </h2>

          {status && (
            <div className="mb-8">
              <div className="bg-[#f0f4f8] rounded-xl p-6 mb-6">
                <p className="text-5xl font-bold text-[#083577] mb-2">
                  {status.completed} / {status.total}
                </p>
                <p className="text-xl text-[#0b2f63]">
                  Evaluations Completed
                </p>
              </div>

              <div className="flex justify-center gap-8 text-lg">
                <div>
                  <p className="font-bold text-green-600">{status.completed}</p>
                  <p className="text-gray-600">Completed</p>
                </div>
                <div>
                  <p className="font-bold text-orange-600">{status.pending}</p>
                  <p className="text-gray-600">Pending</p>
                </div>
              </div>
            </div>
          )}

          <p className="text-lg text-[#0b2f63] mb-8">
            You still have evaluations to complete.
          </p>

          <button
            onClick={() => router.push("/user_page/officer_list")}
            className="px-8 py-4 rounded-xl bg-[#083577] text-white text-lg font-bold hover:bg-[#062a5e] transition"
          >
            Continue Evaluations
          </button>
        </div>
      </main>
    </div>
  );
}
