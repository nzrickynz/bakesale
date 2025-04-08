import { Metadata } from "next";
import ContactForm from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | BakeSale",
  description: "Get in touch with the BakeSale team.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-gray-300 text-lg">
            Have questions or want to learn more about BakeSale? We'd love to hear from you!
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <ContactForm />
        </div>
      </div>
    </div>
  );
} 