# Auto-Mate (automate your dm)

A powerful automation platform built with modern web technologies, enabling users to create, manage, and monetize automation workflows. Auto-Mate combines AI-powered integrations, secure authentication, and flexible pricing models to deliver a complete automation-as-a-service solution.

## Features

- **Automation Workflows**: Create and manage complex automation workflows with visual interfaces
- **AI Integrations**: Seamless integration with OpenAI and Google Gemini for intelligent automation
- **Payment Processing**: Built-in Stripe integration for subscription management and billing
- **User Management**: Secure authentication with Clerk
- **Webhooks Support**: Trigger automations from external events
- **Real-time Updates**: Powered by React Query for efficient data fetching and caching
- **Responsive Design**: Beautiful UI built with Tailwind CSS and Shadcn/ui components
- **Database ORM**: Prisma for type-safe database operations

## Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) with TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: Shadcn/ui
- **State Management**: Redux + React Query
- **Authentication**: [Clerk](https://clerk.com/)

### Backend
- **ORM**: [Prisma](https://www.prisma.io/)
- **AI APIs**: OpenAI, Google Gemini
- **Payment Processing**: Stripe

### Development
- **Language**: TypeScript
- **Build Tool**: Next.js
- **CSS Preprocessing**: PostCSS

## Project Structure

```
src/
├── app/              # Next.js app directory with routes
│   ├── (auth)/      # Authentication routes (sign-in, sign-up)
│   ├── (protected)/ # Protected routes (dashboard, API, webhooks)
│   ├── (website)/   # Public website pages
│   └── layout.tsx   # Root layout
├── actions/         # Server actions
│   ├── automations/ # Automation-related actions
│   ├── integrations/ # Integration actions
│   ├── user/        # User actions
│   └── webhooks/    # Webhook handling
├── components/      # React components
│   ├── global/      # Global reusable components
│   └── ui/          # Shadcn/ui components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and API clients
├── redux/           # Redux store and slices
├── types/           # TypeScript type definitions
└── providers/       # React context providers
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database (configured with Prisma)
- Clerk account for authentication
- Stripe account for payments
- OpenAI and Google Gemini API keys

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd slide-webprodigies
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with the following:
```
DATABASE_URL=your_database_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
```

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Building for Production

```bash
npm run build
npm run start
```

## Key Features Implementation

### Automations
Manage workflows and automation rules in `src/actions/automations/` and `src/components/global/automations/`

### Integrations
Connect external services through `src/actions/integrations/`

### Billing & Subscriptions
Payment and subscription management via Stripe integration in `src/lib/stripe.ts` and `src/components/global/billing/`

### Webhooks
Handle external events through `src/actions/webhooks/`

## Database Schema

Managed with Prisma. View the schema at [prisma/schema.prisma](prisma/schema.prisma)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)

## Build for educational and learning purpose 

This project is built for educational and learning purposes. It is not intended to be used in production or for commercial purposes.
