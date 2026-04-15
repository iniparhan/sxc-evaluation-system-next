"use client";

import { useRouter } from "next/navigation";
import Header from "@/components/Header";

export default function ThankYouPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#cdcdcd]">
      <Header title="Thank You" />

      <main className="max-w-4xl mx-auto px-6 md:px-10 py-10">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          {/* Thank You Icon */}
          <div className="mb-6">
            <svg
              className="mx-auto w-24 h-24 text-[#083577]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="text-4xl font-bold text-[#0b2f63] mb-4">
            Thanks for giving your response. 🙏
          </h2>

          <p className="text-xl text-[#0b2f63] mb-8">
            Your evaluations have been successfully submitted.
          </p>

          <button
            onClick={() => router.push("/user_page/officer_list")}
            className="px-8 py-4 rounded-xl bg-[#083577] text-white text-lg font-bold hover:bg-[#062a5e] transition"
          >
            Edit Evaluations
          </button>
        </div>
      </main>
    </div>
  );
}
