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
import { Plus } from "lucide-react";

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
  name: string;
  email: string;
  role: "ORG_ADMIN" | "VOLUNTEER";
  assignments: {
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

  const fetchTeamMembers = useCallback(async () => {
    try {
      const response = await fetch(`/api/team-members?organizationId=${organizationId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch team members");
      }
      const data = await response.json();
      setTeamMembers(data || []);
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
          assignments: selectedAssignments,
          organizationId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add team member");
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
      toast.error("Failed to add team member");
    }
  };

  const assignments = role === "ORG_ADMIN" ? organizations : listings;

  return (
    <Card className="col-span-4 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-gray-900">Team Members</CardTitle>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#F15A2B] text-white hover:bg-[#F15A2B]/90">
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
                    assignments.map((assignment: Organization | Listing) => (
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
                          {role === "ORG_ADMIN" 
                            ? (assignment as Organization).name 
                            : `${(assignment as Listing).title} (${(assignment as Listing).cause.title})`}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#F15A2B] text-white hover:bg-[#F15A2B]/90">
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
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Assignments</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : teamMembers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-center text-sm text-gray-500">
                    No team members found
                  </td>
                </tr>
              ) : (
                teamMembers.map((member: TeamMember) => (
                  <tr key={member.id} className="border-b">
                    <td className="px-4 py-2 text-sm text-gray-900">{member.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{member.email}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 capitalize">
                      {member.role.toLowerCase().replace("_", " ")}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {((member.assignments || [])).map((assignment) => assignment.name).join(", ") || "None"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
} 