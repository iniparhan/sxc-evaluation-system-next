"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { getCurrentUser, UserSession } from "@/services/authService";

interface Member {
  id: number;
  name: string;
  email: string;
  role_id: number | null;
  role_name: string | null;
  division_id: number | null;
  division_name: string | null;
  sub_division_id: number | null;
  sub_division_name: string | null;
}

const adminLinks = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
  { label: "Manage Members", href: "/admin/members", icon: "👥" },
  { label: "Divisions", href: "/admin/divisions", icon: "🏢" },
  { label: "KPIs", href: "/admin/kpis", icon: "📈" },
  { label: "Evaluation Results", href: "/admin/evaluation_results", icon: "✅" },
  { label: "Policies", href: "/admin/policies", icon: "⚙️" },
  { label: "Periods", href: "/admin/periods", icon: "📅" },
];

export default function MembersPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push("/login");
          return;
        }

        if (!currentUser.role_id || currentUser.role_id > 2) {
          router.push("/user_page/officer_list");
          return;
        }

        setUser(currentUser);

        const res = await fetch("/api/admin/members");
        if (res.ok) {
          const data = await res.json();
          setMembers(data);
        }
      } catch (error) {
        console.error("Error loading members:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [router]);

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.role_name && m.role_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#cdcdcd] flex items-center justify-center">
        <p className="text-xl text-[#0b2f63]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#cdcdcd]">
      <Header title="Manage Members" />

      <div className="flex flex-1">
        <Sidebar links={adminLinks} />

        <main className="flex-1 max-w-7xl mx-auto px-6 md:px-10 py-10 w-full">
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-[#0b2f63]">
              Members List
            </h2>

            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-[#083577]"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-bold text-[#0b2f63]">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-[#0b2f63]">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-[#0b2f63]">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-[#0b2f63]">
                    Division
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-bold text-[#0b2f63]">
                    Sub-Division
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-[#0b2f63]">
                      {member.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {member.email}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {member.role_name || "-"}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {member.division_name || "-"}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {member.sub_division_name || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredMembers.length === 0 && (
              <p className="text-center py-8 text-gray-500">
                No members found.
              </p>
            )}
          </div>

          <button
            onClick={() => router.push("/admin/dashboard")}
            className="mt-6 px-6 py-3 rounded-xl border-2 border-[#083577] text-[#083577] font-bold hover:bg-[#083577]/10 transition"
          >
            Back to Dashboard
          </button>
        </div>
        </main>
      </div>
    </div>
  );
}
