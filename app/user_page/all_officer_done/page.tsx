"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { getCurrentUser, UserSession } from "@/services/authService";
import { getCompletionStatus } from "@/services/evaluationService";

export default function AllOfficerDonePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
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

        // Verify all evaluations are complete
        const completionStatus = await getCompletionStatus(currentUser.id);
        if (!completionStatus.is_all_complete) {
          router.push("/user_page/officer_list");
        }
      } catch (error) {
        console.error("Error loading status:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleFinalSubmit = () => {
    // Navigate to thank you page
    router.push("/user_page/thank_you_page");
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
      <Header title="Evaluation Complete" />

      <main className="max-w-4xl mx-auto px-6 md:px-10 py-10">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <svg
              className="mx-auto w-24 h-24 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="text-4xl font-bold text-[#0b2f63] mb-4">
            All Evaluations Complete! 🎉
          </h2>

          <p className="text-xl text-[#0b2f63] mb-8">
            You have successfully completed all your evaluations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/user_page/officer_list")}
              className="px-8 py-4 rounded-xl border-2 border-[#083577] text-[#083577] text-lg font-bold hover:bg-[#083577]/10 transition"
            >
              Edit Evaluations
            </button>

            <button
              onClick={handleFinalSubmit}
              className="px-8 py-4 rounded-xl bg-[#083577] text-white text-lg font-bold hover:bg-[#062a5e] transition"
            >
              Submit Final
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
