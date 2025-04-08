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
- Supabase (Database and Storage)
- Vercel
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
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database
DATABASE_URL=

# Auth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# App URL
NEXT_PUBLIC_APP_URL=

# Email Configuration (Resend)
RESEND_API_KEY=
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT
