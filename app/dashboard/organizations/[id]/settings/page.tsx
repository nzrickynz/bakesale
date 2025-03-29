import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Settings, Users } from "lucide-react";
import { InviteForm } from "@/components/organization/invite-form";

interface PageProps {
  params: {
    id: string;
  };
}

interface UserOrganization {
  id: string;
  userId: string;
  organizationId: string;
  role: "ADMIN" | "VOLUNTEER";
  organization: {
    id: string;
    name: string;
    description: string | null;
    websiteUrl: string | null;
  };
}

interface Member {
  id: string;
  userId: string;
  role: "ADMIN" | "VOLUNTEER";
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export default async function OrganizationSettingsPage({
  params,
}: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    notFound();
  }

  const userOrganization = await prisma.userOrganization.findFirst({
    where: {
      userId: user.id,
      organizationId: params.id,
    },
    include: {
      organization: true,
    },
  }) as UserOrganization | null;

  if (!userOrganization || userOrganization.role !== "ADMIN") {
    notFound();
  }

  const members = await prisma.userOrganization.findMany({
    where: {
      organizationId: params.id,
    },
    include: {
      user: true,
    },
  }) as Member[];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your organization&apos;s information and members
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="mr-2 h-4 w-4" />
            Members
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                action={async (formData: FormData) => {
                  "use server";
                  const name = formData.get("name") as string;
                  const description = formData.get("description") as string;
                  const websiteUrl = formData.get("website") as string;

                  try {
                    await prisma.organization.update({
                      where: { id: params.id },
                      data: {
                        name,
                        description,
                        websiteUrl,
                      },
                    });

                    toast.success("Organization updated successfully");
                  } catch (err) {
                    console.error("Failed to update organization:", err);
                    toast.error("Failed to update organization");
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={userOrganization.organization.name}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={userOrganization.organization.description || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    defaultValue={userOrganization.organization.websiteUrl || ""}
                  />
                </div>
                <Button type="submit">Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {member.user.name || member.user.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.user.email}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {member.role.toLowerCase()}
                      </span>
                      {member.userId !== user.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            "use server";
                            try {
                              await prisma.userOrganization.delete({
                                where: { id: member.id },
                              });
                              toast.success("Member removed successfully");
                            } catch (err) {
                              console.error("Failed to remove member:", err);
                              toast.error("Failed to remove member");
                            }
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invite Members</CardTitle>
            </CardHeader>
            <CardContent>
              <InviteForm organizationId={params.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 