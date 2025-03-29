import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F3] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
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
                At Bake Sale, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
              <p className="text-gray-600">
                Please read this privacy policy carefully. By using Bake Sale, you consent to the practices described in this policy.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle>2. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Name and contact information (email, phone)</li>
                  <li>Account credentials</li>
                  <li>Profile information and photos</li>
                  <li>Payment information (processed securely by Stripe)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Organization Information</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Organization name and details</li>
                  <li>Logo and branding materials</li>
                  <li>Social media links</li>
                  <li>Stripe Connect account information</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Usage Data</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>IP address</li>
                  <li>Pages visited and time spent</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <CardHeader>
              <CardTitle>3. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>To provide and maintain our platform</li>
                <li>To process your transactions and payments</li>
                <li>To communicate with you about your account and orders</li>
                <li>To improve our platform and user experience</li>
                <li>To comply with legal obligations</li>
                <li>To prevent fraud and ensure security</li>
              </ul>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card>
            <CardHeader>
              <CardTitle>4. Information Sharing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                We may share your information with:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Stripe for payment processing</li>
                <li>Organizations (for order fulfillment)</li>
                <li>Service providers who assist our operations</li>
                <li>Law enforcement when required by law</li>
              </ul>
              <p className="text-gray-600">
                We do not sell your personal information to third parties.
              </p>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle>5. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                We implement appropriate security measures to protect your information, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Encryption of sensitive data</li>
                <li>Regular security assessments</li>
                <li>Secure data storage and transmission</li>
                <li>Access controls and authentication</li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle>6. Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Export your data</li>
              </ul>
              <p className="text-gray-600">
                To exercise these rights, please contact us at{' '}
                <a href="mailto:privacy@bakesale.org" className="text-[#E55937] hover:underline">
                  privacy@bakesale.org
                </a>
              </p>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>7. Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Maintain your session</li>
                <li>Remember your preferences</li>
                <li>Analyze platform usage</li>
                <li>Improve our services</li>
              </ul>
              <p className="text-gray-600">
                You can control cookie settings through your browser preferences.
              </p>
            </CardContent>
          </Card>

          {/* Children&apos;s Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>8. Children&apos;s Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Bake Sale is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you are a parent and believe your child has provided us with personal information, please contact us.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Privacy Policy */}
          <Card>
            <CardHeader>
              <CardTitle>9. Changes to Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </CardContent>
          </Card>

          {/* Contact Us */}
          <Card>
            <CardHeader>
              <CardTitle>10. Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                If you have any questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:privacy@bakesale.org" className="text-[#E55937] hover:underline">
                  privacy@bakesale.org
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 