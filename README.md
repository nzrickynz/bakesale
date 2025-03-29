# Bake Sale - Community Fundraising Platform

Bake Sale is a modern web application that helps organizations raise funds for their causes through bake sales and other fundraising events. Built with Next.js, TypeScript, and Tailwind CSS, it provides a seamless experience for both organizations and donors.

## Features

- **Organization Management**
  - Organization registration and profile management
  - Cause creation and management
  - Volunteer invitation system
  - Stripe Connect integration for donations

- **Authentication & Authorization**
  - Email/password authentication
  - Google OAuth integration
  - Role-based access control
  - Protected routes and API endpoints

- **Cause Management**
  - Create and manage fundraising causes
  - Set fundraising goals and deadlines
  - Track donation progress
  - Accept donations through Stripe

- **Volunteer System**
  - Invite volunteers to your organization
  - Manage volunteer roles and permissions
  - Track volunteer activities
  - Email notifications for invitations

## Tech Stack

- **Frontend**
  - Next.js 14 with App Router
  - TypeScript
  - Tailwind CSS
  - React Hook Form
  - Zod for validation

- **Backend**
  - Next.js API Routes
  - Prisma ORM
  - PostgreSQL database
  - NextAuth.js for authentication
  - Stripe for payments

- **Email**
  - Nodemailer for sending emails
  - SMTP for email delivery

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/bakesale.git
   cd bakesale
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration values.

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

See `.env.example` for a list of required environment variables.

## Database Schema

The application uses the following main models:

- **User**: Represents application users with roles (USER, VOLUNTEER, ADMIN)
- **Organization**: Represents fundraising organizations
- **UserOrganization**: Manages user-organization relationships and roles
- **Cause**: Represents fundraising causes
- **Donation**: Tracks donations to causes
- **VolunteerInvitation**: Manages volunteer invitations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
