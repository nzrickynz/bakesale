"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { Donation } from "@prisma/client";

export const columns: ColumnDef<Donation>[] = [
  {
    accessorKey: "cause.title",
    header: "Cause",
  },
  {
    accessorKey: "cause.organization.name",
    header: "Organization",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return formatted;
    },
  },
  {
    accessorKey: "donorEmail",
    header: "Donor",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "PENDING"
              ? "warning"
              : status === "COMPLETED"
              ? "success"
              : "destructive"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      return format(new Date(row.getValue("createdAt")), "PPP");
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const donation = row.original;
      const status = donation.status;

      return (
        <div className="flex gap-2">
          {status === "PENDING" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/donations/${donation.id}`, {
                      method: "PATCH",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ status: "COMPLETED" }),
                    });
                    if (!response.ok) throw new Error("Failed to update status");
                    window.location.reload();
                  } catch (err) {
                    console.error("Failed to update donation status:", err);
                  }
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/donations/${donation.id}`, {
                      method: "PATCH",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ status: "CANCELLED" }),
                    });
                    if (!response.ok) throw new Error("Failed to update status");
                    window.location.reload();
                  } catch (err) {
                    console.error("Failed to cancel donation:", err);
                  }
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          )}
        </div>
      );
    },
  },
]; 