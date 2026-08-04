# Release Notes — v0.1.1

## 🌟 What's New in v0.1.1

### 💱 Configurable Display Currency & Firefly III Integration
- **Automatic Firefly III Currency Sync**: The dashboard now automatically queries your Firefly III instance (`GET /api/v1/currencies/default`) to adopt your preferred default currency (USD `$`, EUR `€`, GBP `£`, CAD `$`, AUD `$`, JPY `¥`, CHF, etc.) seamlessly without manual setup.
- **Interactive Currency Settings Page**: Added a new settings sub-page at `/settings/currency` allowing you to select and preview display currencies with live formatting examples before saving.
- **App-Wide Dynamic Formatting**:
  - Net Worth, Liquid total, and account balances on the Accounts page.
  - Income, Expenses, and Category totals on the Dashboard & Period ledgers.
  - Upcoming payments, credit card balances, and subscription projections.
  - Interactive Chart.js y-axes and hover tooltips.
  - Transaction items, category triage drawers, and insights alerts.
- **Offline & Demo Mode Fallbacks**: Robust fallback support for standard global currencies when running in demo mode or offline.

---

## 🛠️ Technical Improvements & Fixes
- **Next.js & React 19 Client/Server Context**: Created `CurrencyContext` and wrapped root layout in `CurrencyProvider` initialized with server-resolved display currency from cookies / Firefly III.
- **Chart.js Dynamic Callbacks**: Converted static chart label callbacks to dynamic formatters using active client currency context.
- **Insights Engine Alignment**: Updated server-side insights engine to pass currency-aware formatting functions for alert threshold messages.
- **Cleaner Imports**: Removed static formatter defaults to prevent GBP fallback across server and client components.

---

## 🚀 How to Upgrade (Docker / Raspberry Pi 5)

If you are running the dashboard via Docker Compose, pull the updated `v0.1.1` (or `latest`) image:

```bash
docker compose pull
docker compose up -d --force-recreate
```
