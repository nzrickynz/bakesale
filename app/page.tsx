import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { Cake, Heart, Users, Shield, ArrowRight, Sparkles } from "lucide-react";

interface Cause {
  id: string;
  title: string;
  description: string;
  organization: {
    name: string;
  };
}

async function getFeaturedCauses() {
  const causes = await prisma.cause.findMany({
    include: {
      organization: {
        select: {
          name: true,
        },
      },
    },
    take: 3,
    orderBy: {
      createdAt: "desc",
    },
  });

  return causes;
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const causes = await getFeaturedCauses();

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F6F3]">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#E55937]">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto text-center relative">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Bake a Difference
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join our community of bakers and changemakers. Create delicious treats, support meaningful causes, and make a real impact in your community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-[#FFE974] text-gray-900 hover:bg-[#FFE974]/90">
                Start Baking
              </Button>
            </Link>
            <Link href="/causes">
              <Button size="lg" variant="outline" className="bg-white/10 text-white hover:bg-white/20">
                Explore Causes
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            How Bake Sale Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FFE974] rounded-full flex items-center justify-center mx-auto mb-4">
                <Cake className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                1. Create Your Listing
              </h3>
              <p className="text-gray-700">
                Share your delicious treats and set your price. Each listing supports a specific cause.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FFE974] rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                2. Support Causes
              </h3>
              <p className="text-gray-700">
                Buyers purchase your treats, and proceeds go directly to the cause you're supporting.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FFE974] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                3. Make an Impact
              </h3>
              <p className="text-gray-700">
                Join our community of bakers and buyers making a real difference in their communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Causes */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#F7F6F3]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Featured Causes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {causes.map((cause: Cause) => (
              <div
                key={cause.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {cause.title}
                  </h3>
                  <p className="text-gray-700 mb-4 line-clamp-2">
                    {cause.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      by {cause.organization.name}
                    </span>
                    <Link href={`/causes/${cause.id}`}>
                      <Button variant="outline" size="sm" className="group">
                        Learn More
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/causes">
              <Button className="bg-[#E55937] text-white hover:bg-[#E55937]/90">
                View All Causes
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Why Choose Bake Sale?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FFE974] rounded-full flex items-center justify-center mx-auto mb-4">
                <Cake className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Delicious Impact
              </h3>
              <p className="text-gray-700">
                Every treat you bake or buy helps support meaningful causes in your community.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FFE974] rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Secure & Transparent
              </h3>
              <p className="text-gray-700">
                All transactions are secure, and you can track exactly where your support goes.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FFE974] rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Community Driven
              </h3>
              <p className="text-gray-700">
                Join a vibrant community of bakers and supporters making real change happen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Community Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#E55937] text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Bake a Difference?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our community of bakers and changemakers. Start creating delicious treats for a cause today.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-[#FFE974] text-gray-900 hover:bg-[#FFE974]/90">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
