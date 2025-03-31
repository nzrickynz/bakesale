"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

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

export default function DeclineInvitationPage({
  params,
}: {
  params: { invitationId: string };
}) {
  const router = useRouter();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    async function fetchInvitation() {
      try {
        const response = await fetch(`/api/invitations/${params.invitationId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch invitation");
        }

        setInvitation(data.data);
      } catch (error) {
        console.error("Error fetching invitation:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to load invitation";
        setError(errorMessage);

        // Handle token expiration with retry logic
        if (errorMessage.includes("expired") && retryCount < MAX_RETRIES) {
          toast.error("Your invitation link has expired. Refreshing...");
          setRetryCount(prev => prev + 1);
          setTimeout(fetchInvitation, 2000); // Retry after 2 seconds
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchInvitation();
  }, [params.invitationId, retryCount]);

  async function handleDecline() {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/invitations/${params.invitationId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "decline" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to decline invitation");
      }

      toast.success("Invitation declined successfully");
      router.push("/?message=invitation_declined");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {retryCount > 0 ? "Refreshing invitation..." : "Loading invitation..."}
          </p>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Invitation not found</p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm text-primary hover:text-primary-dark"
          >
            Return to Home
          </Link>
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
          <Link
            href="/"
            className="mt-4 inline-block text-sm text-primary hover:text-primary-dark"
          >
            Return to Home
          </Link>
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
          <Link
            href="/"
            className="mt-4 inline-block text-sm text-primary hover:text-primary-dark"
          >
            Return to Home
          </Link>
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
              Decline Invitation
            </h1>
            <p className="mt-2 text-gray-600">
              Are you sure you want to decline the invitation to join{" "}
              {invitation.organization.name} as a {invitation.role.toLowerCase()}?
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
              onClick={handleDecline}
              disabled={isProcessing}
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                "Decline Invitation"
              )}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link
              href={`/invite/accept/${params.invitationId}`}
              className="text-sm text-primary hover:text-primary-dark"
            >
              Accept Invitation Instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 