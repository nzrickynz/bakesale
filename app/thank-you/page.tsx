import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Thank You | BakeSale",
  description: "Thank you for contacting BakeSale.",
};

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Thank You for Contacting Us
          </h1>
          <p className="text-gray-600 mb-8">
            We've received your message and one of our team members will get back to you within 48 hours.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-orange-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 