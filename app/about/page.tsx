import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | BakeSale",
  description: "Learn about BakeSale's mission to connect bakers with charitable causes.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[400px] w-full bg-[#E55937] flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <h1 className="text-4xl md:text-5xl font-bold text-white text-center relative">
          About BakeSale
        </h1>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-12">
          {/* Mission Section */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              At BakeSale, we believe in the power of community and the joy of baking. 
              Our platform connects passionate bakers with charitable causes, creating 
              meaningful opportunities to make a difference through the universal 
              language of food.
            </p>
          </section>

          {/* How It Works Section */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-orange-600">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Create</h3>
                <p className="text-gray-700">
                  Bakers create listings for their delicious treats, setting prices 
                  and choosing which causes to support.
                </p>
              </div>
              <div className="space-y-4">
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-orange-600">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Connect</h3>
                <p className="text-gray-700">
                  Customers browse listings, find their perfect treat, and make 
                  purchases that directly support charitable causes.
                </p>
              </div>
              <div className="space-y-4">
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-orange-600">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Contribute</h3>
                <p className="text-gray-700">
                  A portion of every sale goes directly to the chosen cause, 
                  making a real difference in our communities.
                </p>
              </div>
            </div>
          </section>

          {/* Impact Section */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Our Impact</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">For Bakers</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">✓</span>
                    Turn your passion into purpose
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">✓</span>
                    Connect with your community
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">✓</span>
                    Support causes you care about
                  </li>
                </ul>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">For Causes</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">✓</span>
                    Access new funding streams
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">✓</span>
                    Raise awareness for your mission
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-600 mr-2">✓</span>
                    Build community support
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Join Our Community</h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Whether you're a baker looking to make a difference or a customer 
              wanting to support great causes, BakeSale is the platform for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-md bg-orange-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                Get Started
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                Contact Us
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 