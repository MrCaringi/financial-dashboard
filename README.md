# Firefly Personal Financial Dashboard

An interactive, responsive financial dashboard optimized for mobile layouts, connecting directly to a **Firefly III** instance. Designed to track Safe-to-Spend pacing, upcoming cycle outgoings, and categorizing transactions on the fly.

## Key Features

1. **Safe-to-Spend Analysis**: Computes disposable income based on total asset balance, subtracting upcoming unpaid bills and credit card statements up to your next payday.
2. **Dynamic Burn Comparison**: Renders an interactive line chart comparing cumulative daily spend against the previous cycle's pacing.
3. **Interactive Uncategorized Queue (`/uncategorized`)**: 
   - Displays transactions from the last 7 days without a category.
   - Accessible via the **Inbox icon** in the main header (which displays a badge count of pending items).
   - Category updates are sent directly to Firefly III, and the transaction is cleared from the queue with a smooth fade animation.
4. **Grouped Accounts Ledger**: Displays active asset and liability accounts structured into *Current Accounts*, *Savings*, and *Credit Cards* with individual activity states.
5. **Credit Card Payment Rules**: Configure statement cycles (statement/due day) and payment preferences (Full statement balance vs Minimum payment calculations) inside the app. Rules are persisted directly within Firefly III as JSON metadata inside each account's notes field.

---

## Technical Stack

- **Framework**: Next.js 16.2 (App Router)
- **Styling**: Tailwind CSS & Vanilla CSS (using a custom `glass-card` system)
- **Charts**: Chart.js (`react-chartjs-2`)
- **Icons**: Lucide React
- **API**: Custom integration layer in `src/lib/firefly.ts` connecting to Firefly III Core v1 API.

---

## Getting Started

### 1. Configure Environment

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:
```env
FIREFLY_API_URL="http://your-firefly-server:8080"
FIREFLY_PAT="your-firefly-personal-access-token"
SESSION_SECRET="generate-with-openssl-rand-base64-32"
```

> **Tip:** Generate a secure session secret with: `openssl rand -base64 32`

### 2. Install Dependencies

```bash
npm install
```

### 3. Run in Development

```bash
npm run dev
```

The dashboard will be available at [http://localhost:3001](http://localhost:3001).

### 4. First-Time Setup

On first launch, you'll be prompted to create a dashboard password. This password is stored locally on the server and used to protect access to your financial data.

---

## Docker Deployment

The application is containerized and runs in standalone mode using Docker Compose.

### Docker Structure
- **Dockerfile**: Multi-stage build using `node:22-alpine`. Next.js is configured for `output: "standalone"` to keep the production image lightweight.
- **.dockerignore**: Excludes `node_modules`, `.next`, and `.env` files from the build context.
- **docker-compose.yml**: Maps external host port `3001` to internal container port `3000`, and passes `.env.local` as `env_file`.

### Running with Docker

```bash
# Build and start
docker compose up --build -d

# Stop
docker compose down

# View logs
docker compose logs -f
```

---

## Project Structure

```
src/
├── app/
│   ├── actions/         # Server actions (auth, transactions, automations)
│   ├── api/             # API routes
│   ├── dashboard/       # Dashboard pages with cycle navigation
│   ├── login/           # Login page
│   ├── settings/        # Settings (accounts, connection, rules)
│   ├── uncategorized/   # Transaction categorization queue
│   └── ...
├── components/          # Reusable UI components
├── hooks/               # Custom React hooks
├── lib/
│   ├── api/             # Firefly III API client & data fetching
│   └── ...              # Utilities, formatting, payday logic
└── middleware.ts        # Auth middleware
```

---

## License

MIT
