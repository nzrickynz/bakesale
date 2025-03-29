"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, Heart, DollarSign, ArrowRight } from "lucide-react";
import { UserRole, Cause as PrismaCause, UserOrganization as PrismaUserOrg, PaymentStatus } from "@prisma/client";

type UserOrganization = PrismaUserOrg & {
  organization: {
    id: string;
    name: string;
  };
};

type Cause = PrismaCause & {
  organization: {
    id: string;
    name: string;
  };
  currentAmount?: number;
};

export default function DashboardPage() {
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/auth/login");
    },
  });
  const router = useRouter();
  const [userOrganizations, setUserOrganizations] = useState<UserOrganization[]>([]);
  const [causes, setCauses] = useState<Cause[]>([]);
  const [totalDonations, setTotalDonations] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [orgsResponse, causesResponse] = await Promise.all([
          fetch("/api/organizations"),
          fetch("/api/causes"),
        ]);

        if (!orgsResponse.ok || !causesResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const orgsData = await orgsResponse.json();
        const causesData = await causesResponse.json();

        setUserOrganizations(orgsData.organizations);
        setCauses(causesData.causes);

        // Calculate total donations
        const donations = causesData.causes.reduce((acc: number, cause: Cause) => {
          return acc + (cause.currentAmount || 0);
        }, 0);
        setTotalDonations(donations);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-900">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
        <div className="flex items-center space-x-4">
          <Button asChild>
            <Link href="/dashboard/organizations/new">
              New Organization
            </Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">
              Organizations
            </CardTitle>
            <Users className="h-4 w-4 text-gray-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {userOrganizations.length}
            </div>
            <p className="text-xs text-gray-700">
              You are a member of {userOrganizations.length} organization
              {userOrganizations.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">
              Active Causes
            </CardTitle>
            <Heart className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {causes.filter((cause) => cause.status === "ACTIVE").length}
            </div>
            <p className="text-xs text-gray-600">
              {causes.filter((cause) => cause.status === "ACTIVE").length} active
              cause
              {causes.filter((cause) => cause.status === "ACTIVE").length !== 1
                ? "s"
                : ""}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">
              Total Donations
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ${totalDonations.toFixed(2)}
            </div>
            <p className="text-xs text-gray-600">
              Total amount raised across all causes
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-900">Recent Causes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {causes.slice(0, 5).map((cause) => (
                <div
                  key={cause.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium leading-none text-gray-900">
                      {cause.title}
                    </p>
                    <p className="text-sm text-gray-700">
                      {cause.organization.name}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/causes/${cause.id}`}>
                      <ArrowRight className="h-4 w-4 text-gray-700" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-900">Your Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userOrganizations.slice(0, 5).map((uo) => (
                <div
                  key={uo.organization.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium leading-none text-gray-900">
                      {uo.organization.name}
                    </p>
                    <p className="text-sm text-gray-700">
                      {uo.role.toLowerCase()}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/organizations/${uo.organization.id}`}>
                      <ArrowRight className="h-4 w-4 text-gray-700" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 