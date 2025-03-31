import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireOrganizationAccess } from "@/lib/auth";
import { UserRole } from "@prisma/client";

interface PageProps {
  params: {
    id: string;
    causeId: string;
  };
}

export default async function EditCausePage({ params }: PageProps) {
  const userRole = await requireOrganizationAccess(params.id);
  
  // Only allow ORG_ADMIN to edit causes
  if (userRole !== UserRole.ORG_ADMIN) {
    notFound();
  }

  const cause = await prisma.cause.findUnique({
    where: {
      id: params.causeId,
      organizationId: params.id,
    },
  });

  if (!cause) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Edit Cause</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cause Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                defaultValue={cause.title}
                placeholder="Enter cause title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                defaultValue={cause.description || ""}
                placeholder="Enter cause description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal">Fundraising Goal</Label>
              <Input
                id="goal"
                type="number"
                defaultValue={cause.targetGoal || ""}
                placeholder="Enter fundraising goal"
              />
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 