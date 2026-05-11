"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin/characters", label: "캐릭터" },
    { href: "/admin/enemies", label: "적" },
  ];

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="w-48 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="px-4 h-16 border-b border-gray-200 dark:border-gray-700 flex items-center">
          <h2 className="text-lg font-bold">데이터베이스 관리</h2>
        </div>
        <nav className="flex flex-col">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 h-12 border-b border-gray-100 dark:border-gray-800 transition-colors no-underline text-black dark:text-white ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/40 border-l-4 border-l-blue-500 font-bold"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50 font-medium"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
