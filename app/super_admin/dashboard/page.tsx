"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getCurrentUser, UserSession } from "@/services/authService";

interface Stats {
  totalMembers: number;
  totalRoles: number;
  totalDivisions: number;
  totalEvaluations: number;
  submittedEvaluations: number;
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/login");
        return;
      }

      // Check if user is Super Admin (role_id: 1)
      if (currentUser.role_id !== 1) {
        // If admin, redirect to admin dashboard
        if (currentUser.role_id === 2) {
          router.push("/admin/dashboard");
        } else {
          router.push("/user_page/officer_list");
        }
        return;
      }

      setUser(currentUser);

      // Fetch dashboard stats
      const res = await fetch("/api/super_admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#cdcdcd] flex items-center justify-center">
        <p className="text-xl text-[#0b2f63]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#cdcdcd] flex flex-col">
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
            Performance Appraisal Super Admin
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

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* SIDEBAR */}
        <aside className="hidden lg:flex w-72 bg-white shadow-md p-6 flex-col gap-6">
          <div>
            <h2 className="font-bold text-[#0b2f63] text-xl">
              StudentxCEOs <br /> East Java
            </h2>
            <p className="text-sm text-[#0b2f63] mt-1">Batch 7</p>
          </div>

          <button
            onClick={() => router.push("/super_admin/add_user")}
            className="bg-[#051f46] text-white py-2 rounded-lg font-semibold"
          >
            Add User
          </button>

          <nav className="flex flex-col gap-4 text-[#0b2f63]">
            <p
              className="cursor-pointer font-bold bg-[#083577] text-white px-4 py-2 rounded-lg"
              onClick={() => router.push("/super_admin/dashboard")}
            >
              Dashboard
            </p>
            <p className="cursor-pointer hover:bg-gray-100 px-4 py-2 rounded-lg" onClick={() => router.push("/super_admin/edit_user")}>
              Edit Users
            </p>
            <p className="cursor-pointer hover:bg-gray-100 px-4 py-2 rounded-lg" onClick={() => router.push("/admin/members")}>
              All Members
            </p>
            <p className="cursor-pointer hover:bg-gray-100 px-4 py-2 rounded-lg">Divisions</p>
            <p className="cursor-pointer hover:bg-gray-100 px-4 py-2 rounded-lg">KPIs</p>
            <p className="cursor-pointer hover:bg-gray-100 px-4 py-2 rounded-lg">Policies</p>
            <p className="cursor-pointer hover:bg-gray-100 px-4 py-2 rounded-lg">Results</p>
            <p className="cursor-pointer hover:bg-gray-100 px-4 py-2 rounded-lg">Periods</p>
            <p className="cursor-pointer hover:bg-gray-100 px-4 py-2 rounded-lg">Audit Logs</p>
          </nav>
        </aside>

        {/* MAIN */}
        <main className="flex-1 p-6 md:p-10 space-y-10">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Total Members</p>
              <p className="text-4xl font-bold text-[#083577]">
                {stats?.totalMembers || 0}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Roles</p>
              <p className="text-4xl font-bold text-[#083577]">
                {stats?.totalRoles || 0}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Divisions</p>
              <p className="text-4xl font-bold text-[#083577]">
                {stats?.totalDivisions || 0}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Evaluations</p>
              <p className="text-4xl font-bold text-[#083577]">
                {stats?.totalEvaluations || 0}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Submitted</p>
              <p className="text-4xl font-bold text-green-600">
                {stats?.submittedEvaluations || 0}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-[#0b2f63] mb-6">
              Management Panel
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => router.push("/super_admin/add_user")}
                className="p-6 border-2 border-[#083577]/20 rounded-xl hover:border-[#083577] hover:bg-[#083577]/5 transition text-left"
              >
                <p className="text-lg font-bold text-[#0b2f63] mb-1">
                  ➕ Add User
                </p>
                <p className="text-sm text-gray-600">
                  Create new member accounts
                </p>
              </button>

              <button
                onClick={() => router.push("/super_admin/edit_user")}
                className="p-6 border-2 border-[#083577]/20 rounded-xl hover:border-[#083577] hover:bg-[#083577]/5 transition text-left"
              >
                <p className="text-lg font-bold text-[#0b2f63] mb-1">
                  ✏️ Edit Users
                </p>
                <p className="text-sm text-gray-600">
                  Update user information
                </p>
              </button>

              <button
                onClick={() => router.push("/admin/members")}
                className="p-6 border-2 border-[#083577]/20 rounded-xl hover:border-[#083577] hover:bg-[#083577]/5 transition text-left"
              >
                <p className="text-lg font-bold text-[#0b2f63] mb-1">
                  👥 View All Members
                </p>
                <p className="text-sm text-gray-600">
                  Browse member directory
                </p>
              </button>

              <button
                className="p-6 border-2 border-[#083577]/20 rounded-xl hover:border-[#083577] hover:bg-[#083577]/5 transition text-left"
              >
                <p className="text-lg font-bold text-[#0b2f63] mb-1">
                  🏢 Divisions
                </p>
                <p className="text-sm text-gray-600">
                  Manage organizational structure
                </p>
              </button>

              <button
                className="p-6 border-2 border-[#083577]/20 rounded-xl hover:border-[#083577] hover:bg-[#083577]/5 transition text-left"
              >
                <p className="text-lg font-bold text-[#0b2f63] mb-1">
                  📊 KPIs
                </p>
                <p className="text-sm text-gray-600">
                  Configure evaluation metrics
                </p>
              </button>

              <button
                className="p-6 border-2 border-[#083577]/20 rounded-xl hover:border-[#083577] hover:bg-[#083577]/5 transition text-left"
              >
                <p className="text-lg font-bold text-[#0b2f63] mb-1">
                  ⚙️ Policies
                </p>
                <p className="text-sm text-gray-600">
                  Set evaluation rules
                </p>
              </button>

              <button
                className="p-6 border-2 border-[#083577]/20 rounded-xl hover:border-[#083577] hover:bg-[#083577]/5 transition text-left"
              >
                <p className="text-lg font-bold text-[#0b2f63] mb-1">
                  📈 Results
                </p>
                <p className="text-sm text-gray-600">
                  View evaluation outcomes
                </p>
              </button>

              <button
                className="p-6 border-2 border-[#083577]/20 rounded-xl hover:border-[#083577] hover:bg-[#083577]/5 transition text-left"
              >
                <p className="text-lg font-bold text-[#0b2f63] mb-1">
                  📅 Periods
                </p>
                <p className="text-sm text-gray-600">
                  Manage evaluation cycles
                </p>
              </button>

              <button
                className="p-6 border-2 border-[#083577]/20 rounded-xl hover:border-[#083577] hover:bg-[#083577]/5 transition text-left"
              >
                <p className="text-lg font-bold text-[#0b2f63] mb-1">
                  📝 Audit Logs
                </p>
                <p className="text-sm text-gray-600">
                  Track system changes
                </p>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
