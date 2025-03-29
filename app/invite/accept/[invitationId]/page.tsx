"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  organization: {
    id: string;
    name: string;
  };
  invitedBy: {
    name: string | null;
  };
  expiresAt: string;
}

export default function AcceptInvitationPage({
  params,
}: {
  params: { invitationId: string };
}) {
  const router = useRouter();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function fetchInvitation() {
      try {
        const response = await fetch(`/api/invitations/${params.invitationId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch invitation");
        }
        const data = await response.json();
        setInvitation(data.invitation);
      } catch (error) {
        console.error("Error fetching invitation:", error);
        setError("Failed to load invitation");
      } finally {
        setIsLoading(false);
      }
    }

    fetchInvitation();
  }, [params.invitationId]);

  async function handleAccept() {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/invitations/${params.invitationId}/accept`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to accept invitation");
      }

      router.push("/auth/login?message=invitation_accepted");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsProcessing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Invitation not found</p>
        </div>
      </div>
    );
  }

  if (invitation.status !== "PENDING") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">
            This invitation has already been{" "}
            {invitation.status.toLowerCase()}.
          </p>
        </div>
      </div>
    );
  }

  const expiresAt = new Date(invitation.expiresAt);
  if (expiresAt < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">This invitation has expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Accept Invitation
            </h1>
            <p className="mt-2 text-gray-600">
              You've been invited to join {invitation.organization.name} as a{" "}
              {invitation.role.toLowerCase()}.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Invited by {invitation.invitedBy.name || "Organization Admin"}
            </p>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={handleAccept}
              disabled={isProcessing}
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Processing..." : "Accept Invitation"}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link
              href={`/invite/decline/${params.invitationId}`}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Decline Invitation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 