"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

export default function EditCausePage({
  params,
}: {
  params: { causeId: string };
}) {
  const { status } = useSession();
  const router = useRouter();
  const [cause, setCause] = useState<Cause | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchCause() {
      try {
        const response = await fetch(`/api/org/causes/${params.causeId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch cause");
        }
        const data = await response.json();
        setCause(data.cause);
      } catch (error) {
        console.error("Error fetching cause:", error);
        setError("Failed to load cause");
      } finally {
        setIsLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchCause();
    }
  }, [status, params.causeId]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      goalAmount: parseFloat(formData.get("goalAmount") as string),
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string || null,
      status: formData.get("status") as "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED",
    };

    try {
      const response = await fetch(`/api/org/causes/${params.causeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update cause");
      }

      router.push("/org/causes");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

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

  if (!cause) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Cause not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Edit Cause</h1>
            <Link
              href="/org/causes"
              className="text-primary hover:text-primary-dark"
            >
              Back to Causes
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                defaultValue={cause.title}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={4}
                defaultValue={cause.description}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="goalAmount" className="block text-sm font-medium text-gray-700">
                Goal Amount ($)
              </label>
              <input
                type="number"
                name="goalAmount"
                id="goalAmount"
                min="0"
                step="0.01"
                defaultValue={cause.goalAmount}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                id="startDate"
                defaultValue={cause.startDate.split("T")[0]}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date (Optional)
              </label>
              <input
                type="date"
                name="endDate"
                id="endDate"
                defaultValue={cause.endDate ? cause.endDate.split("T")[0] : ""}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                name="status"
                id="status"
                defaultValue={cause.status}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 