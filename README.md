TrackFlow — Production Logistics Tracking SaaS (EasyPost)

Real-time shipment tracking for FedEx, UPS, USPS, DHL and 500+ carriers. Built with Next.js 14, EasyPost API, Mapbox, and jsPDF.


---

🚀 Quick Start

1. Install dependencies

npm install

2. Configure API keys

Copy the example env file:

cp .env.example .env.local

Then open .env.local and fill in your keys:

# Required for tracking — get free at easypost.com
NEXT_PUBLIC_TRACKING_API_KEY=your_easypost_api_key_here

# Optional for live maps — get free at mapbox.com
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here

3. Start the dev server

npm run dev

Open http://localhost:3000


---

🔑 Getting Your API Keys

EasyPost (Tracking API) — Required

1. Go to https://www.easypost.com


2. Create a free account


3. Navigate to Developers → API Keys


4. Copy your Test API Key (and Production key later)


5. Paste into NEXT_PUBLIC_TRACKING_API_KEY in .env.local



Note: Use server-side API calls for security. Free tier allows testing with demo tracking numbers.

Mapbox (Live Map) — Optional

1. Go to account.mapbox.com/access-tokens


2. Sign up for a free account


3. Copy your Default public token


4. Paste into NEXT_PUBLIC_MAPBOX_TOKEN in .env.local



Free tier: 50,000 map loads/month. If skipped, the map section shows a placeholder.


---

📁 Project Structure

trackflow/
├── app/
│   ├── api/track/route.ts      # EasyPost API proxy (server-side)
│   ├── page.tsx                # Homepage (landing)
│   ├── tracking/page.tsx       # Main tracking page
│   ├── dashboard/page.tsx      # Saved shipments dashboard
│   ├── services/page.tsx       # Services page
│   ├── admin/page.tsx          # Admin & setup panel
│   ├── layout.tsx              # Root layout + fonts
│   └── globals.css             # Global styles + design system
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── tracking/
│   │   ├── TrackingInput.tsx   # Universal search bar
│   │   └── TrackingResult.tsx  # Status + timeline display
│   └── map/
│       └── LiveMap.tsx         # Mapbox live map
├── lib/
│   ├── easypost.ts             # EasyPost API integration
│   ├── invoice.ts              # jsPDF invoice generator
│   ├── store.ts                # Zustand global state (saved shipments)
│   └── utils.ts                # Helper functions
├── .env.example                # Template — copy to .env.local
└── README.md


---

🛠 What Our Logistics Company Offers

Service	Description

Real-time shipment tracking	Track your packages across multiple carriers (FedEx, UPS, USPS, DHL) instantly.
Delivery notifications	Get automated updates on delivery status, delays, and estimated arrival times.
Flexible shipping options	Standard, express, and same-day delivery tailored to your needs.
Package insurance	Protect your shipments with optional insurance coverage.
Dashboard management	Save and manage all your shipments in one convenient dashboard.
Route optimization	Live maps and optimized routing for faster delivery.
PDF invoicing	Generate invoices and shipment reports with a click.
Customer support	Dedicated support to assist with queries, claims, and logistics planning.



---

🌐 Deploy to Vercel

npm install -g vercel
vercel deploy

Add your environment variables in the Vercel project settings under Settings → Environment Variables.


---

🧪 Test Tracking Numbers

Use these real-format EasyPost test numbers:

Carrier	Format Example

UPS	1Z999AA10123456784
USPS	9400111899223397620913
FedEx	274999999999
DHL	1234567890



---

⚙️ Environment Variables Reference

Variable	Required	Description

NEXT_PUBLIC_TRACKING_API_KEY	Yes	EasyPost API key
NEXT_PUBLIC_MAPBOX_TOKEN	No	Mapbox access token for maps
NEXT_PUBLIC_APP_URL	No	Production app URL



---

📄 License

MIT — build anything you want.
