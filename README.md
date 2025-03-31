# Bake Sale Platform

A platform for managing and organizing bake sales for charitable causes.

## Features

- Create and manage organizations
- Create fundraising causes
- List baked goods for sale
- Track orders and fulfillment
- Volunteer management system
- Role-based access control
- Email notifications
- Image uploads
- Responsive design

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase
- Vercel
- Cloudinary for image hosting
- NextAuth.js for authentication
- Prisma ORM

## Database Models

- **User**: Stores user information and roles
- **Organization**: Represents a charitable organization
- **Cause**: Represents a fundraising cause
- **Listing**: A baked good item for sale
- **Order**: Tracks orders and fulfillment status
- **UserOrganization**: Links users to organizations with roles
- **VolunteerInvitation**: Manages volunteer invitations

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Required environment variables:

```bash
# Database
SUPABASE_DATABASE_URL=
SUPABASE_DIRECT_URL=

# Auth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT
