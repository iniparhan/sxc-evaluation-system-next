"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getCurrentUser, UserSession } from "@/services/authService";

interface Role {
  id: number;
  name: string;
}

interface Division {
  id: number;
  name: string;
}

interface SubDivision {
  id: number;
  name: string;
  division_id: number;
}

export default function AddUserPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [subDivisions, setSubDivisions] = useState<SubDivision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState<number | null>(null);
  const [divisionId, setDivisionId] = useState<number | null>(null);
  const [subDivisionId, setSubDivisionId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/login");
        return;
      }

      // Check if user is Super Admin (role_id: 1)
      if (currentUser.role_id !== 1) {
        router.push("/admin/dashboard");
        return;
      }

      setUser(currentUser);

      // Fetch roles, divisions, sub_divisions
      const [rolesRes, divisionsRes, subDivisionsRes] = await Promise.all([
        fetch("/api/roles"),
        fetch("/api/divisions"),
        fetch("/api/sub_divisions"),
      ]);

      if (rolesRes.ok) setRoles(await rolesRes.json());
      if (divisionsRes.ok) setDivisions(await divisionsRes.json());
      if (subDivisionsRes.ok) setSubDivisions(await subDivisionsRes.json());
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/super_admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role_id: roleId,
          division_id: divisionId || null,
          sub_division_id: subDivisionId || null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create user");
      }

      alert("User created successfully!");
      router.push("/super_admin/dashboard");
    } catch (error: any) {
      alert(error.message || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSubDivisions = subDivisions.filter(
    (sd) => !divisionId || sd.division_id === divisionId
  );

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
            Performance Appraisal - Add User
          </h1>
        </div>

        <button
          onClick={() => router.push("/super_admin/dashboard")}
          className="text-white text-2xl"
          title="Back"
        >
          ←
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
            <p className="cursor-pointer hover:bg-gray-100 px-4 py-2 rounded-lg" onClick={() => router.push("/super_admin/dashboard")}>
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
          </nav>
        </aside>

        {/* MAIN */}
        <main className="flex-1 p-6 md:p-10">
          <div className="bg-white rounded-xl shadow-md p-8 max-w-3xl">
            <h2 className="text-2xl font-bold text-[#0b2f63] mb-6">
              Create New Member
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-[#0b2f63] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#083577]"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0b2f63] mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#083577]"
                  placeholder="user@sxcej.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0b2f63] mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#083577]"
                  placeholder="Minimum 6 characters"
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0b2f63] mb-1">
                  Role *
                </label>
                <select
                  value={roleId || ""}
                  onChange={(e) => setRoleId(parseInt(e.target.value) || null)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#083577]"
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0b2f63] mb-1">
                  Division
                </label>
                <select
                  value={divisionId || ""}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value) : null;
                    setDivisionId(val);
                    setSubDivisionId(null);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#083577]"
                >
                  <option value="">Select Division (optional)</option>
                  {divisions.map((div) => (
                    <option key={div.id} value={div.id}>
                      {div.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0b2f63] mb-1">
                  Sub-Division
                </label>
                <select
                  value={subDivisionId || ""}
                  onChange={(e) =>
                    setSubDivisionId(parseInt(e.target.value) || null)
                  }
                  disabled={!divisionId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#083577] disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select Sub-Division (optional)</option>
                  {filteredSubDivisions.map((sd) => (
                    <option key={sd.id} value={sd.id}>
                      {sd.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => router.push("/super_admin/dashboard")}
                  className="flex-1 py-3 rounded-xl border-2 border-[#083577] text-[#083577] font-bold hover:bg-[#083577]/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-[#083577] text-white font-bold hover:bg-[#062a5e] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
