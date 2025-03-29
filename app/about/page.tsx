export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">About Bake Sale</h1>
      
      <div className="prose max-w-none">
        <p className="text-lg mb-4">
          Bake Sale is a platform that connects organizations with volunteers to raise funds through delicious baked goods.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
        <p className="mb-4">
          We believe in the power of community and the joy of baking. Our platform makes it easy for organizations to organize bake sales and for volunteers to contribute their time and baking skills to meaningful causes.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">How It Works</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Organizations create causes and list their bake sale events</li>
          <li>Volunteers sign up to bake and help at events</li>
          <li>Customers can browse and order delicious treats</li>
          <li>Funds are raised for important causes</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Get Involved</h2>
        <p className="mb-4">
          Whether you're an organization looking to raise funds, a volunteer who loves to bake, or someone who enjoys supporting good causes through delicious treats, there's a place for you in our community.
        </p>

        <div className="mt-8">
          <a
            href="/register"
            className="inline-block bg-[#E55937] text-white px-6 py-3 rounded-lg hover:bg-[#E55937]/90 transition-colors"
          >
            Join Our Community
          </a>
        </div>
      </div>
    </div>
  );
} 