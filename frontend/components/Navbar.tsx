// components/Navbar.tsx
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useAuth from "../app/utils/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href={user ? "/dashboard" : "/"} className="text-xl font-bold text-gray-900">
            Auth RBAC App
          </Link>

          <div className="flex items-center gap-4">
            {!user ? (
              <>
                <Link
                  href="/"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 px-3 py-2"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 px-3 py-2"
                >
                  Dashboard
                </Link>

                <span className="text-sm text-gray-700 px-3 py-2 border-l border-gray-200">
                  {user.name}
                </span>

                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
