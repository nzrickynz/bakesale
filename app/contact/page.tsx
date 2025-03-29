import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F3] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Have questions or want to learn more about Bake Sale? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    placeholder="What's this about?"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Your message..."
                    className="min-h-[150px]"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-[#E55937] hover:bg-[#E55937]/90">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#FFE974] flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-gray-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600">
                      <a
                        href="mailto:hello@bakesale.org"
                        className="hover:text-[#E55937]"
                      >
                        hello@bakesale.org
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#FFE974] flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-gray-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Phone</h3>
                    <p className="text-gray-600">
                      <a
                        href="tel:+1234567890"
                        className="hover:text-[#E55937]"
                      >
                        (123) 456-7890
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#FFE974] flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-gray-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Address</h3>
                    <p className="text-gray-600">
                      123 Bake Street<br />
                      Sweet City, SC 12345<br />
                      United States
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    How do I become a volunteer?
                  </h3>
                  <p className="text-gray-600">
                    Organizations can invite you to volunteer for their listings. Once invited,
                    you&apos;ll receive an email with instructions to get started.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    How do I create a cause?
                  </h3>
                  <p className="text-gray-600">
                    First, register your organization. Once approved, you can create causes
                    and invite volunteers to help with listings.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    How are payments processed?
                  </h3>
                  <p className="text-gray-600">
                    We use Stripe to process payments securely. All funds go directly to
                    the organization&apos;s connected Stripe account.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 