"use client";

import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

function GoToButton({
  children,
  route,
}: {
  children?: React.ReactNode;
  route: string;
}) {
  const router = useRouter();

  return (
    <button 
      type="button" 
      onClick={() => router.push(route)}
    >
      {children || "Click it!"}
    </button>
  );
}

export default function NavigationButtons() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.refresh();
  };

  const isAdmin = session?.user?.role === "admin";

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 mb-6 border-b border-gray-200 bg-white">
      <div className="flex gap-3">
        {pathname !== "/" && <GoToButton route="/">Go to Home</GoToButton>}
        {pathname !== "/parseTimeline" && (
          <GoToButton route="/parseTimeline">Go to parser</GoToButton>
        )}
        {pathname !== "/tacticEditor" && (
          <GoToButton route="/tacticEditor">Go to timeline editor</GoToButton>
        )}
        {pathname !== "/admin" && isAdmin && (
          <GoToButton route="/admin">Go to admin</GoToButton>
        )}
      </div>

      <div className="ml-auto flex items-center gap-4">
        {session?.user ? (
          <>
            <span className="text-gray-700 font-medium">
              Hello, {session.user.name || session.user.email}!
            </span>
            <button onClick={handleLogout} className="px-4 py-2 font-medium rounded-md border transition-colors shadow-sm bg-red-50 text-red-600 border-red-200 hover:bg-red-100">
              Logout
            </button>
          </>
        ) : (
          <GoToButton route="/auth/sign-in">Login</GoToButton>
        )}
      </div>
    </div>
  );
}
