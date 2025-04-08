import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">BakeSale</span>
            </Link>
            <p className="text-gray-600">
              Connecting bakers with charitable causes to make a difference in our communities.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/causes"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Browse Causes
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Get in Touch</h3>
            <p className="text-gray-600">
              Have questions or want to learn more? Drop us a message!
            </p>
            <a
              href="mailto:hello@bakesale.co.nz"
              className="inline-flex items-center text-orange-600 hover:text-orange-700 transition-colors"
            >
              hello@bakesale.co.nz
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500">
            © {new Date().getFullYear()} BakeSale. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 