# WorkSpace Hub Backend API

A high-performance, modular NestJS backend application for managing collaborative workspaces, task tracking, asynchronous report generation, file storage, and subscriptions.

---

## 🛠 Tech Stack & Core Dependencies

- **Framework:** [NestJS](https://nestjs.com/) (Node.js)
- **Database & ORM:** [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Caching & Queue:** [Redis](https://redis.io/) & [BullMQ](https://docs.bullmq.io/) (Asynchronous background jobs)
- **Object Storage:** [MinIO](https://min.io/) (S3-compatible document & file storage)
- **PDF Generation:** [Puppeteer](https://pptr.dev/) (Headless Chrome PDF rendering)
- **Payments:** [Stripe API](https://stripe.com/) (Subscription billing)
- **Authentication:** JWT (JSON Web Tokens) & Passport.js
- **Testing:** [Jest](https://jestjs.io/) & [Supertest](https://github.com/ladjs/supertest) (E2E Integration Testing)
- **Containerization:** [Docker](https://www.docker.com/) & Docker Compose

---

## 🚀 Infrastructure Setup

### Prerequisites

- Node.js (`v18+`)
- Docker & Docker Compose

### 1. Environment Configuration

Copy the sample environment variables or configure your `.env` and `.env.test` files:

```env
NODE_ENV=development
DATABASE_URL="postgresql://postgres:root@localhost:5432/workspace-hub"
HOST_URL=http://localhost:3000
JWT_SECRET_KEY=supersecret

REDIS_HOST=localhost
REDIS_PORT=6379

MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

STRIPE_PRO_SUBSCRIPTION_MONTHLY=price_1U9n...
STRIPE_ENTERPRISE_SUBSCRIPTION_MONTHLY=price_1U9q...
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Launch Docker Services

Run the local infrastructure stack (Postgres, Redis, MinIO) along with dedicated test instances:

```bash
docker compose up -d
```

### 3. Prisma Database Setup

Apply migrations and sync your database schema:

```bash
npx prisma db push
```

---

## 🧪 Running E2E Tests

E2E tests execute against dedicated test containers (`postgres_test` on port `5433`, `redis_test` on port `6380`, `minio_test` on port `9002`).

```bash
# Run tests sequentially to ensure database cleanups
dotenv -e .env.test -- npx jest --config ./test/jest-e2e.json --runInBand
```

---

## 🗺 API Routes Reference

### 🔐 Authentication

- `POST /auth/register` - Register a new user account.
- `POST /auth/login` - Authenticate credentials and receive a Bearer JWT token.

### 🏢 Workspaces

- `POST /workspaces` - Create a new workspace.
- `GET /workspaces` - List workspaces for the authenticated user.
- `GET /workspaces/:id` - Fetch details for a specific workspace.
- `DELETE /workspaces/:id` - Remove a workspace.

### 📋 Tasks

- `POST /task` - Create a new task under a workspace.
- `GET /task/:id` - Get details of a specific task.
- `PATCH /task/:id` - Update task status, assignee, or details.

### 📁 Attachments

- `POST /task/:taskId/attachment/upload` - Upload file attachments (`multipart/form-data` with key `file`). Max file size: 10MB.
- `GET /task/:taskId/attachments` - List all attachments for a specific task.
- `GET /attachment/:attachmentId/download` - Download a specific attachment.
- `DELETE /attachment/:attachmentId/delete` - Delete a specific attachment.

### 📊 Reports

- `POST /report/generate` - Dispatch an asynchronous BullMQ worker job to render a PDF report via Puppeteer.
- `GET /report/:id/download` - Retrieve or download the generated PDF report from MinIO.

### 💳 Subscriptions & Payments

- `POST /subscriptions/checkout` - Create a Stripe checkout session for Pro or Enterprise tiers.
- `POST /subscriptions/webhook` - Handle incoming Stripe webhook events (e.g., payment status updates).
