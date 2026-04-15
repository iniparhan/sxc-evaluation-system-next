"use client";

import { useRouter, usePathname } from "next/navigation";

interface SidebarProps {
  links: {
    label: string;
    href: string;
    icon?: string;
  }[];
}

export default function Sidebar({ links }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-72 bg-white shadow-md flex-col p-6 gap-6">
      <div>
        <h2 className="text-xl font-bold text-[#0b2f63] leading-tight">
          StudentsxCEOs <br /> East Java
        </h2>
        <p className="text-[#0b2f63] mt-1">Batch 7</p>
      </div>

      <nav className="flex flex-col gap-2">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          
          return (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className={`text-left px-4 py-3 rounded-lg transition font-medium ${
                isActive
                  ? "bg-[#083577] text-white"
                  : "text-[#0b2f63] hover:bg-[#083577]/10"
              }`}
            >
              {link.icon && <span className="mr-2">{link.icon}</span>}
              {link.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
