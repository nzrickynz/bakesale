import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrganizationSettingsPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F3] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Organization Settings</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Organization Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Organization settings page coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 