"use client";

import { AuthView, AuthViewPaths } from "@neondatabase/auth/react";
import { use } from "react";

export default function AuthPage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const resolvedParams = use(params);
  const path = resolvedParams.path?.[0] || "sign-in";
  const view = path.replace(/-/g, "_").toUpperCase() as keyof AuthViewPaths;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white border border-gray-200 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Admin Login
        </h2>
        <AuthView view={view} />
      </div>
    </main>
  );
}
