"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard, Users, Package, Settings } from "lucide-react";
import Image from "next/image";

// Mock data - replace with actual data fetching
const mockCauses = [
  {
    id: "1",
    title: "Summer Fundraiser",
    description: "Annual summer fundraising event",
    imageUrl: "/placeholder.svg?height=200&width=300",
    totalListings: 12,
    totalOrders: 45,
  },
  {
    id: "2",
    title: "Holiday Bazaar",
    description: "Winter holiday fundraising event",
    imageUrl: "/placeholder.svg?height=200&width=300",
    totalListings: 8,
    totalOrders: 32,
  },
];

const mockListings = [
  {
    id: "1",
    title: "Homemade Apple Pie",
    price: 25,
    imageUrl: "/placeholder.svg?height=150&width=150",
    volunteer: {
      name: "Sarah Johnson",
      imageUrl: "/placeholder.svg?height=40&width=40",
    },
    orders: {
      total: 15,
      pending: 5,
    },
  },
  {
    id: "2",
    title: "Artisanal Bread Basket",
    price: 35,
    imageUrl: "/placeholder.svg?height=150&width=150",
    volunteer: {
      name: "Mike Chen",
      imageUrl: "/placeholder.svg?height=40&width=40",
    },
    orders: {
      total: 8,
      pending: 3,
    },
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F3] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Organization Dashboard</h1>
            <p className="text-gray-700">Manage your causes and listings</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button className="bg-[#E55937] hover:bg-[#E55937]/90">
              <Plus className="w-4 h-4 mr-2" />
              New Cause
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Total Causes</p>
                  <p className="text-2xl font-bold text-gray-900">2</p>
                </div>
                <Package className="w-8 h-8 text-[#E55937]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Active Listings</p>
                  <p className="text-2xl font-bold text-gray-900">20</p>
                </div>
                <Package className="w-8 h-8 text-[#E55937]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Total Volunteers</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
                <Users className="w-8 h-8 text-[#E55937]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Causes */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Causes</h2>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              New Cause
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockCauses.map((cause) => (
              <Card key={cause.id}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                      <Image
                        src={cause.imageUrl}
                        alt={cause.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{cause.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{cause.description}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>{cause.totalListings} listings</span>
                        <span>{cause.totalOrders} orders</span>
                      </div>
                    </div>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Listings */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Listings</h2>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              New Listing
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockListings.map((listing) => (
              <Card key={listing.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="relative w-full h-40 rounded-lg overflow-hidden">
                      <Image
                        src={listing.imageUrl}
                        alt={listing.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                      <p className="text-lg font-semibold text-[#E55937]">${listing.price}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden">
                          <Image
                            src={listing.volunteer.imageUrl}
                            alt={listing.volunteer.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="text-sm text-gray-600">{listing.volunteer.name}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {listing.orders.pending} pending
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      Manage Orders
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 