import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

export async function Navigation() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <img
                  className="h-8 w-auto"
                  src="/logo.svg"
                  alt="Bake Sale"
                />
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <Button
                asChild
                variant="ghost"
                className="text-gray-900 hover:text-[#E55937]"
              >
                <Link href="/dashboard">
                  View Dashboard
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                variant="ghost"
                className="text-gray-900 hover:text-[#E55937]"
              >
                <Link href="/login">
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 