"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Cause {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  startDate: string;
  endDate: string | null;
  createdAt: string;
}

export default function CausesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [causes, setCauses] = useState<Cause[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchCauses() {
      try {
        const response = await fetch("/api/org/causes");
        if (!response.ok) {
          throw new Error("Failed to fetch causes");
        }
        const data = await response.json();
        setCauses(data.causes);
      } catch (error) {
        console.error("Error fetching causes:", error);
        setError("Failed to load causes");
      } finally {
        setIsLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchCauses();
    }
  }, [status]);

  const handleDeleteCause = async (causeId: string) => {
    if (!confirm("Are you sure you want to delete this cause?")) {
      return;
    }

    try {
      const response = await fetch(`/api/org/causes/${causeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete cause");
      }

      setCauses(causes.filter((cause) => cause.id !== causeId));
    } catch (error) {
      console.error("Error deleting cause:", error);
      setError("Failed to delete cause");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Causes</h1>
          <Link
            href="/org/causes/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Cause
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {causes.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No causes</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new cause.
            </p>
            <div className="mt-6">
              <Link
                href="/org/causes/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Cause
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {causes.map((cause) => (
              <div
                key={cause.id}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-gray-900">
                      {cause.title}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        cause.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : cause.status === "DRAFT"
                          ? "bg-gray-100 text-gray-800"
                          : cause.status === "COMPLETED"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {cause.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                    {cause.description}
                  </p>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Progress</span>
                      <span>
                        ${cause.currentAmount.toLocaleString()} / $
                        {cause.goalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (cause.currentAmount / cause.goalAmount) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {new Date(cause.startDate).toLocaleDateString()}
                      {cause.endDate &&
                        ` - ${new Date(cause.endDate).toLocaleDateString()}`}
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        href={`/org/causes/${cause.id}/edit`}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <Pencil className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteCause(cause.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 