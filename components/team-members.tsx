"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

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

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  role: "ORG_ADMIN" | "VOLUNTEER";
  status: "ACTIVE" | "PENDING";
  invitationId?: string;
  assignments?: {
    id: string;
    name: string;
    type: "organization" | "listing";
  }[];
}

interface TeamMembersProps {
  organizationId: string;
  listings: Listing[];
  organizations: Organization[];
}

export function TeamMembers({ organizationId, listings = [], organizations = [] }: TeamMembersProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ORG_ADMIN" | "VOLUNTEER">("VOLUNTEER");
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchTeamMembers = useCallback(async () => {
    try {
      const response = await fetch(`/api/team-members?organizationId=${organizationId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch team members");
      }
      const data = await response.json();
      setTeamMembers(data.teamMembers || []);
    } catch (error) {
      console.error("Failed to fetch team members:", error);
      toast.error("Failed to fetch team members");
      setTeamMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  // Reset selected assignments when role changes
  useEffect(() => {
    setSelectedAssignments([]);
  }, [role]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/team-members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          role,
          organizationId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to add team member");
      }

      toast.success("Team member added successfully");
      setIsModalOpen(false);
      setName("");
      setEmail("");
      setRole("VOLUNTEER");
      setSelectedAssignments([]);
      fetchTeamMembers(); // Refresh the list
    } catch (error) {
      console.error("Failed to add team member:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add team member");
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      const response = await fetch("/api/team-members", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invitationId,
          organizationId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to resend invitation");
      }

      toast.success("Invitation resent successfully");
    } catch (error) {
      console.error("Failed to resend invitation:", error);
      toast.error(error instanceof Error ? error.message : "Failed to resend invitation");
    }
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setSelectedAssignments(member.assignments?.map(a => a.id) || []);
    setIsEditModalOpen(true);
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    try {
      const response = await fetch(`/api/team-members/${editingMember.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationId,
          assignments: selectedAssignments.map(id => ({
            id,
            type: editingMember.role === "ORG_ADMIN" ? "organization" : "listing",
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update team member");
      }

      toast.success("Team member updated successfully");
      setIsEditModalOpen(false);
      fetchTeamMembers();
    } catch (error) {
      console.error("Failed to update team member:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update team member");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;

    try {
      const response = await fetch(`/api/team-members/${memberId}?organizationId=${organizationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove team member");
      }

      toast.success("Team member removed successfully");
      fetchTeamMembers();
    } catch (error) {
      console.error("Failed to remove team member:", error);
      toast.error(error instanceof Error ? error.message : "Failed to remove team member");
    }
  };

  const assignments = role === "ORG_ADMIN" 
    ? organizations.map(org => ({
        id: org.id,
        name: org.name,
        type: "organization"
      }))
    : listings.map(listing => ({
        id: listing.id,
        name: `${listing.title} (${listing.cause.title})`,
        type: "listing"
      }));

  return (
    <Card className="col-span-4 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-gray-900">Team Members</CardTitle>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 text-white hover:bg-orange-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Add Team Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-900">
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter member's name"
                  className="w-full text-gray-900"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-900">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter member's email"
                  className="w-full text-gray-900"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-gray-900">
                  Role
                </Label>
                <Select value={role} onValueChange={(value: "ORG_ADMIN" | "VOLUNTEER") => setRole(value)}>
                  <SelectTrigger className="w-full bg-white text-gray-900">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="ORG_ADMIN" className="text-gray-900">Organization Admin</SelectItem>
                    <SelectItem value="VOLUNTEER" className="text-gray-900">Volunteer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900">
                  Assignments
                </Label>
                <div className="max-h-[200px] overflow-y-auto space-y-2 border rounded-md p-2 bg-white">
                  {assignments.length === 0 ? (
                    <p className="text-sm text-gray-900">No {role === "ORG_ADMIN" ? "organizations" : "listings"} available</p>
                  ) : (
                    assignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={assignment.id}
                          checked={selectedAssignments.includes(assignment.id)}
                          onCheckedChange={(checked: boolean) => {
                            if (checked) {
                              setSelectedAssignments([...selectedAssignments, assignment.id]);
                            } else {
                              setSelectedAssignments(selectedAssignments.filter(id => id !== assignment.id));
                            }
                          }}
                        />
                        <Label htmlFor={assignment.id} className="text-sm text-gray-900">
                          {assignment.name}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <Button type="submit" className="w-full bg-orange-600 text-white hover:bg-orange-700">
                Add Member
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Email</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Role</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Status</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Assignments</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-2 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : teamMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-2 text-center text-sm text-gray-500">
                    No team members found
                  </td>
                </tr>
              ) : (
                teamMembers.map((member) => (
                  <tr key={member.id} className="border-b">
                    <td className="px-4 py-2 text-sm text-gray-900">{member.name || "N/A"}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{member.email}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 capitalize">
                      {member.role.toLowerCase().replace("_", " ")}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.status === "ACTIVE" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {member.assignments?.map((assignment) => assignment.name).join(", ") || "None"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        {member.status === "PENDING" && member.invitationId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResendInvitation(member.invitationId!)}
                            className="text-orange-600 border-orange-600 hover:bg-orange-50"
                          >
                            Resend Invitation
                          </Button>
                        )}
                        {member.status === "ACTIVE" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditMember(member)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* Edit Member Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Edit Team Member</DialogTitle>
          </DialogHeader>
          {editingMember && (
            <form onSubmit={handleUpdateMember} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900">
                  Assignments
                </Label>
                <div className="max-h-[200px] overflow-y-auto space-y-2 border rounded-md p-2 bg-white">
                  {assignments.length === 0 ? (
                    <p className="text-sm text-gray-900">No {editingMember.role === "ORG_ADMIN" ? "organizations" : "listings"} available</p>
                  ) : (
                    assignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={assignment.id}
                          checked={selectedAssignments.includes(assignment.id)}
                          onCheckedChange={(checked: boolean) => {
                            if (checked) {
                              setSelectedAssignments([...selectedAssignments, assignment.id]);
                            } else {
                              setSelectedAssignments(selectedAssignments.filter(id => id !== assignment.id));
                            }
                          }}
                        />
                        <Label htmlFor={assignment.id} className="text-sm text-gray-900">
                          {assignment.name}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <Button type="submit" className="w-full bg-orange-600 text-white hover:bg-orange-700">
                Update Assignments
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
} 