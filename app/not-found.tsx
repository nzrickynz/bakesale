import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F6F3] p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#E55937] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <Button className="bg-[#E55937] hover:bg-[#E55937]/90">
            <Home className="w-4 h-4 mr-2" />
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
} 