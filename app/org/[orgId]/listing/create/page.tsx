"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, ArrowLeft, UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Mock data - replace with actual data fetching
const mockCauses = [
  { id: "1", title: "Summer Fundraiser" },
  { id: "2", title: "Holiday Bazaar" },
];

const mockVolunteers = [
  { id: "1", name: "Sarah Johnson", email: "sarah@example.com" },
  { id: "2", name: "Mike Chen", email: "mike@example.com" },
];

export default function CreateListingPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedCause, setSelectedCause] = useState<string>("");
  const [selectedVolunteer, setSelectedVolunteer] = useState<string>("");
  const [newVolunteerEmail, setNewVolunteerEmail] = useState<string>("");

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
            className="inline-flex items-center text-gray-800 hover:text-orange-500 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Listing</h1>
          <p className="text-gray-800">Add a new item to your cause</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Listing Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-8">
              {/* Cause Selection */}
              <div className="space-y-2">
                <Label htmlFor="cause" className="text-gray-800">Select Cause</Label>
                <select
                  id="cause"
                  value={selectedCause}
                  onChange={(e) => setSelectedCause(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-800"
                  required
                >
                  <option value="">Choose a cause</option>
                  {mockCauses.map((cause) => (
                    <option key={cause.id} value={cause.id}>
                      {cause.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Listing Image */}
              <div className="space-y-4">
                <Label htmlFor="image" className="text-gray-800">Listing Image</Label>
                <div className="flex items-center gap-4">
                  <div className="relative w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Listing image"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Upload className="w-8 h-8 text-gray-500" />
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
                      className="w-full text-gray-800 hover:text-orange-500"
                    >
                      Upload Image
                    </Button>
                    <p className="mt-2 text-sm text-gray-600">
                      Recommended size: 800x800 pixels
                    </p>
                  </div>
                </div>
              </div>

              {/* Listing Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-800">Listing Title</Label>
                <Input
                  id="title"
                  placeholder="Enter a clear, descriptive title for your item"
                  required
                  className="text-gray-800 placeholder-gray-400"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-800">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your item, including any special details or customization options..."
                  className="min-h-[150px] text-gray-800 placeholder-gray-400"
                  required
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price" className="text-gray-800">Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">$</span>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    className="pl-8 text-gray-800 placeholder-gray-400"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Quantity (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-gray-800">Quantity Available (Optional)</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Leave empty for unlimited"
                  min="0"
                  className="text-gray-800 placeholder-gray-400"
                />
                <p className="text-sm text-gray-600">
                  Specify the number of items available, or leave empty for unlimited
                </p>
              </div>

              {/* Volunteer Assignment */}
              <div className="space-y-4">
                <Label className="text-gray-800">Volunteer Assignment</Label>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedVolunteer}
                      onChange={(e) => setSelectedVolunteer(e.target.value)}
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-800"
                    >
                      <option value="">Select existing volunteer</option>
                      {mockVolunteers.map((volunteer) => (
                        <option key={volunteer.id} value={volunteer.id}>
                          {volunteer.name} ({volunteer.email})
                        </option>
                      ))}
                    </select>
                    <span className="text-gray-600">or</span>
                    <div className="flex-1 flex gap-2">
                      <Input
                        type="email"
                        placeholder="Invite new volunteer by email"
                        value={newVolunteerEmail}
                        onChange={(e) => setNewVolunteerEmail(e.target.value)}
                        className="text-gray-800 placeholder-gray-400"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="whitespace-nowrap text-gray-800 hover:text-orange-500"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 text-gray-800 hover:text-orange-500"
                >
                  Save as Draft
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Create Listing
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 