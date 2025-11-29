// app/dashboard/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "../utils/useAuth";
import api from "../utils/api";
import { User, Profile } from "../types/user";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        router.push("/");
        return;
      }

      api.get("/profile")
        .then(res => {
          setProfile(res.data);
          setLoading(false);
        })
        .catch(() => {
          logout();
          router.push("/");
        });

      if (user?.role === "admin") {
        setUsersLoading(true);
        api.get("/users")
          .then(res => {
            setUsers(res.data);
            setUsersLoading(false);
          })
          .catch(() => {
            setUsers([]);
            setUsersLoading(false);
          });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Welcome, {profile?.name || user?.name}!
        </h1>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Profile</h2>
          {profile ? (
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-24">Name:</span>
                <span className="text-gray-900">{profile.name}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-24">Email:</span>
                <span className="text-gray-900">{profile.email}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-24">Role:</span>
                <span className={`px-3 py-1 rounded text-sm font-medium ${profile.role === "admin"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-blue-700"
                  }`}>
                  {profile.role}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Loading profile...</p>
          )}
        </div>

        {/* Admin Panel */}
        {user?.role === "admin" && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
              <p className="text-sm text-gray-600 mt-1">All registered users in the system</p>
            </div>

            <div className="p-6">
              {usersLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                  <p className="text-gray-600 text-sm">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <p className="text-center text-gray-600 py-8">No users found</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-gray-900">{u.name}</td>
                            <td className="py-3 px-4 text-gray-600">{u.email}</td>
                            <td className="py-3 px-4">
                              <span className={`px-3 py-1 rounded text-sm font-medium ${u.role === "admin"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-blue-100 text-blue-700"
                                }`}>
                                {u.role}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Stats */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Admins</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {users.filter(u => u.role === "admin").length}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Regular Users</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {users.filter(u => u.role === "user").length}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
