import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F3] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600">
            Last updated: March 5, 2024
          </p>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle>1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Welcome to Bake Sale. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully.
              </p>
              <p className="text-gray-600">
                Bake Sale is a community fundraising platform that connects organizations with volunteers and buyers to facilitate charitable bake sales and similar fundraising activities.
              </p>
            </CardContent>
          </Card>

          {/* Definitions */}
          <Card>
            <CardHeader>
              <CardTitle>2. Definitions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li><strong>Platform:</strong> The Bake Sale website and services</li>
                <li><strong>Organization:</strong> A registered charitable or non-profit entity using the platform</li>
                <li><strong>Volunteer:</strong> An individual assigned to manage specific listings</li>
                <li><strong>Listing:</strong> An item or service offered for sale through the platform</li>
                <li><strong>Cause:</strong> A fundraising campaign created by an organization</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Roles and Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle>3. User Roles and Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Organizations</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Must provide accurate organization information</li>
                  <li>Are responsible for managing their causes and listings</li>
                  <li>Must maintain appropriate payment processing integration</li>
                  <li>Are responsible for volunteer management and oversight</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Volunteers</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Must fulfill orders according to agreed terms</li>
                  <li>Are responsible for updating order statuses</li>
                  <li>Must maintain appropriate communication with buyers</li>
                  <li>Should report any issues to their organization</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Buyers</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Must provide accurate contact information</li>
                  <li>Are responsible for payment processing</li>
                  <li>Should communicate with volunteers as needed</li>
                  <li>Must follow any specific instructions for item pickup/delivery</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Payment Processing */}
          <Card>
            <CardHeader>
              <CardTitle>4. Payment Processing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Bake Sale processes payments securely. By using our platform, you agree to our Terms of Service and Privacy Policy.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>All payments are processed securely</li>
                <li>Organizations receive funds directly to their connected account</li>
                <li>Refunds are handled by the organization</li>
              </ul>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card>
            <CardHeader>
              <CardTitle>5. Disclaimers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Bake Sale provides a platform for connecting organizations, volunteers, and buyers. We are not responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>The quality or safety of items sold through the platform</li>
                <li>Disputes between organizations, volunteers, and buyers</li>
                <li>Payment processing issues beyond our control</li>
                <li>Any injuries or damages resulting from the use of our platform</li>
              </ul>
            </CardContent>
          </Card>

          {/* Privacy and Data */}
          <Card>
            <CardHeader>
              <CardTitle>6. Privacy and Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                We collect and process personal data as described in our Privacy Policy. By using Bake Sale, you consent to our data practices.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>We share necessary information with payment processors for payment processing</li>
                <li>Organizations receive buyer information needed for order fulfillment</li>
                <li>We may use your data to improve our platform and services</li>
                <li>You can request deletion of your data as described in our Privacy Policy</li>
              </ul>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle>7. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We reserve the right to modify these terms at any time. We will notify users of significant changes through the platform or via email. Continued use of Bake Sale after changes constitutes acceptance of the new terms.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>8. Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                For questions about these terms, please contact us at{' '}
                <a href="mailto:legal@bakesale.org" className="text-[#E55937] hover:underline">
                  legal@bakesale.org
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 