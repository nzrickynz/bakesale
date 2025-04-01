"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CauseStatus } from "@prisma/client";

export default function CreateCausePage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F3] py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/org/[orgId]/dashboard"
            className="inline-flex items-center text-gray-700 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Cause</h1>
          <p className="text-gray-700">Set up a new fundraising cause for your organization</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cause Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-8">
              {/* Cause Image */}
              <div className="space-y-4">
                <Label htmlFor="image">Cause Image</Label>
                <div className="flex items-center gap-4">
                  <div className="relative w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Cause image"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("image")?.click()}
                      className="w-full"
                    >
                      Upload Image
                    </Button>
                    <p className="mt-2 text-sm text-gray-500">
                      Recommended size: 1200x630 pixels
                    </p>
                  </div>
                </div>
              </div>

              {/* Cause Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Cause Title</Label>
                <Input
                  id="title"
                  placeholder="Enter a clear, engaging title for your cause"
                  required
                />
              </div>

              {/* Cause Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your cause, its goals, and how the funds will be used..."
                  className="min-h-[150px]"
                  required
                />
              </div>

              {/* Target Goal (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="targetGoal">Target Goal (Optional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="targetGoal"
                    type="number"
                    placeholder="0.00"
                    className="pl-8"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Set a fundraising goal to track progress
                </p>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  required
                />
              </div>

              {/* End Date (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                />
                <p className="text-sm text-gray-500">
                  Leave empty for ongoing causes
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                >
                  Save as Draft
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#E55937] hover:bg-[#E55937]/90"
                >
                  Create Cause
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 