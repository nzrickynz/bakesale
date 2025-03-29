import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { TeamMembers } from "@/components/team-members";

interface Cause {
  id: string;
  title: string;
}

interface Organization {
  id: string;
  name: string;
}

interface Listing {
  id: string;
  title: string;
  cause: {
    title: string;
  };
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      adminOf: true,
    },
  });

  if (!user) {
    return null;
  }

  console.log("User role:", user.role);
  console.log("User adminOf:", user.adminOf);

  // Get causes for the organization if user is an admin
  let causes: Cause[] = [];
  let organizations: Organization[] = [];
  
  if (user.role === "ORG_ADMIN" && user.adminOf.length > 0) {
    // Get all organization IDs the user has access to
    const organizationIds = user.adminOf.map(org => org.id);

    // Get all causes from all organizations the user has access to
    causes = await prisma.cause.findMany({
      where: {
        organizationId: {
          in: organizationIds,
        },
      },
      select: {
        id: true,
        title: true,
      },
    });
    console.log("Causes:", causes);

    // Get all organizations for the dropdown
    organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    console.log("Organizations:", organizations);
  }

  // Get all listings for the organization if user is an admin
  let listings: Listing[] = [];
  if (user.role === "ORG_ADMIN" && user.adminOf.length > 0) {
    console.log("Fetching listings for organization:", user.adminOf[0].id);
    listings = await prisma.listing.findMany({
      where: {
        cause: {
          organizationId: user.adminOf[0].id,
        },
      },
      include: {
        cause: {
          select: {
            title: true,
          },
        },
      },
    });
    console.log("Fetched listings:", listings);
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Profile Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={async (formData: FormData) => {
                "use server";
                const email = formData.get("email") as string;

                try {
                  await prisma.user.update({
                    where: { id: user.id },
                    data: {
                      email,
                    },
                  });

                  toast.success("Profile updated successfully");
                } catch (error) {
                  console.error("Failed to update profile:", error);
                  toast.error("Failed to update profile");
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-900">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={user.email}
                  className="w-full text-gray-900"
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto bg-[#F15A2B] text-white hover:bg-[#F15A2B]/90">
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card className="col-span-3 bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-900">Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Role</h4>
                <p className="text-sm text-gray-600 capitalize">
                  {user.role.toLowerCase()}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Member Since</h4>
                <p className="text-sm text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Last Updated</h4>
                <p className="text-sm text-gray-600">
                  {new Date(user.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Section for Admins */}
      {user.role === "ORG_ADMIN" && user.adminOf.length > 0 && (
        <div className="mt-8">
          <TeamMembers
            organizationId={user.adminOf[0].id}
            listings={listings}
            organizations={user.adminOf}
          />
        </div>
      )}
    </div>
  );
} 