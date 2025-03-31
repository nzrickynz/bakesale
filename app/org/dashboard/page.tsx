"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Organization {
  id: string;
  name: string;
  description: string;
  logoURL: string | null;
  facebookURL: string | null;
  instagramURL: string | null;
  websiteURL: string | null;
}

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchOrganization() {
      try {
        const response = await fetch("/api/org");
        if (!response.ok) {
          throw new Error("Failed to fetch organization");
        }
        const data = await response.json();
        setOrganization(data.organization);
      } catch (error) {
        console.error("Error fetching organization:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchOrganization();
    }
  }, [status]);

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

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Organization not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {organization.name}
            </h1>
            <Link
              href="/org/settings"
              className="text-primary hover:text-primary-dark"
            >
              Edit Profile
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                About
              </h2>
              <p className="text-gray-600">{organization.description}</p>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Social Links
              </h2>
              <div className="space-y-2">
                {organization.facebookURL && (
                  <a
                    href={organization.facebookURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-primary hover:text-primary-dark"
                  >
                    Facebook
                  </a>
                )}
                {organization.instagramURL && (
                  <a
                    href={organization.instagramURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-primary hover:text-primary-dark"
                  >
                    Instagram
                  </a>
                )}
                {organization.websiteURL && (
                  <a
                    href={organization.websiteURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-primary hover:text-primary-dark"
                  >
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/org/causes/new"
                className="bg-primary text-white px-4 py-2 rounded-lg text-center hover:bg-primary-dark transition-colors"
              >
                Create New Cause
              </Link>
              <Link
                href="/org/causes"
                className="bg-white border border-primary text-primary px-4 py-2 rounded-lg text-center hover:bg-primary/5 transition-colors"
              >
                View All Causes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 