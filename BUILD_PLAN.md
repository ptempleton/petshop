# Carly's Pet Shop — Build Plan

## Overview
Recreate a Microsoft PowerApps + Dataverse pet shop management app as a self-hosted web application running in Docker. The app is for personal/play use on a local network only — no external access, no authentication required.

---

## Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React 18 + React Router v6 + Vite |
| Backend  | Node.js + Express                 |
| Database | PostgreSQL 16                     |
| Serving  | nginx (reverse proxy + static)    |
| Runtime  | Docker + Docker Compose           |

---

## Architecture

```
Browser (port 8080)
    └── nginx (frontend container)
            ├── /           → serves React build (static files)
            └── /api/*      → proxies to backend:3001 (internal Docker network)
                                └── Express API
                                        └── PostgreSQL (internal Docker network)
```

- Only port **8080** is exposed to the host/network
- Backend and database are internal to the Docker network only
- Data persists in a named Docker volume (`postgres_data`)

---

## Database Schema

### `pet_types`
| Column | Type   | Notes       |
|--------|--------|-------------|
| id     | SERIAL | Primary key |
| name   | TEXT   | Unique      |

### `pets`
| Column      | Type           | Notes                  |
|-------------|----------------|------------------------|
| id          | UUID           | Primary key, generated |
| name        | TEXT           | Required               |
| gender      | TEXT           | Optional               |
| pet_type    | TEXT           | Required               |
| price       | NUMERIC(10,2)  | Optional               |
| picture     | TEXT           | URL string             |
| description | TEXT           | Optional               |
| available   | BOOLEAN        | Default true           |
| created_at  | TIMESTAMP      | Auto-set               |

### `pet_purchases`
| Column      | Type          | Notes                             |
|-------------|---------------|-----------------------------------|
| id          | UUID          | Primary key, generated            |
| pet_id      | UUID          | FK → pets(id), SET NULL on delete |
| pet_name    | TEXT          | Snapshot at time of sale          |
| pet_type    | TEXT          | Snapshot at time of sale          |
| pet_picture | TEXT          | Snapshot at time of sale          |
| pet_price   | NUMERIC(10,2) | Snapshot at time of sale          |
| new_owner   | TEXT          | Required                          |
| created_at  | TIMESTAMP     | Auto-set                          |

> Pet details are snapshotted into the purchase record so sale history is preserved even if the pet record is later edited or deleted.

---

## API Endpoints

### Pets — `/api/pets`
| Method | Path  | Action                               |
|--------|-------|--------------------------------------|
| GET    | `/`   | List all pets (optional `?type=Cat`) |
| GET    | `/:id`| Get single pet                       |
| POST   | `/`   | Create pet                           |
| PUT    | `/:id`| Update pet                           |
| DELETE | `/:id`| Delete pet                           |

### Pet Types — `/api/pet-types`
| Method | Path   | Action         |
|--------|--------|----------------|
| GET    | `/`    | List all types |
| POST   | `/`    | Create type    |
| PUT    | `/:id` | Rename type    |
| DELETE | `/:id` | Delete type    |

### Purchases — `/api/purchases`
| Method | Path   | Action                                             |
|--------|--------|----------------------------------------------------|
| GET    | `/`    | List all purchases (newest first)                  |
| GET    | `/:id` | Get single purchase                                |
| POST   | `/`    | Create purchase + mark pet unavailable (atomic)    |
| DELETE | `/:id` | Delete purchase + return pet to available (atomic) |

---

## Screens

### 1. Home (`/`)
- Header: **New Pet** button (left), title (centre), **Make Sale** + **Admin** buttons (right)
- Left sidebar: list of pet types (from `pet_types` table) + "All Pets" at top
- Right panel: scrollable list of pet cards filtered by selected type
- Each card shows: pet image, name, gender + type, description (2-line truncated), price, availability badge
- Clicking a card navigates to Edit Pet

### 2. New Pet (`/pets/new`)
- Shared `PetForm` component (blank)
- Fields: Pet Name*, Gender, Pet Type* (dropdown), Price, Picture URL, Description, Available (checkbox)
- **Save Form** → POST `/api/pets` → redirect to Home
- **Back/Cancel** → Home

### 3. Edit Pet (`/pets/:id/edit`)
- Shared `PetForm` component (pre-filled)
- Same fields as New Pet
- **Delete** button → confirm prompt → DELETE `/api/pets/:id` → Home
- **Save Form** → PUT `/api/pets/:id` → Home
- **Back/Cancel** → Home

### 4. Make Sale (`/sale`)
- Left panel: searchable list of **available** pets only
- Right panel: populates when a pet is selected (image, name, type, price, New Owner* field)
- **Complete Sale** → POST `/api/purchases` (atomic: creates record + sets pet unavailable) → redirect to Purchase Detail
- **Cancel Sale** → Home

### 5. Purchase Detail (`/admin/purchases/:id`)
- Shows: pet image, pet name, type, sale price, new owner, date purchased
- **Return Pet to Inventory** button → confirm prompt → DELETE `/api/purchases/:id` (atomic: deletes record + sets pet available) → Admin Purchases list
- **Back to Purchases** link

### 6. Admin — Purchases (`/admin/purchases`)
- Table: thumbnail, pet name, type, price, new owner, date, View button
- View → Purchase Detail page

### 7. Admin — Pet Types (`/admin/pet-types`)
- List of all pet types with inline rename and Delete buttons
- Add new type at the bottom (name field + Add button)

---

## Delete Confirmations
All destructive actions require the user to confirm before proceeding:

| Location | Prompt |
|---|---|
| Edit Pet | `Delete [pet name]? This cannot be undone.` |
| Purchase Detail | `Return [pet name] to inventory? This will delete the sale record.` |
| Admin → Pet Types | `Delete type "[type name]"?` |

---

## Image Handling
- Pet images are stored as URLs (same approach as the original PowerApp)
- A local **"Photo Coming Soon"** SVG placeholder (`/placeholder.svg`) is shown when:
  - A pet has no picture URL set
  - A URL fails to load (broken link)
- The placeholder is served by the app itself — no external dependency, works offline
- The fallback is consistent across all pages (Home, Make Sale, Admin Purchases, Purchase Detail)
- The placeholder is styled to match the app's blue/white colour scheme

---

## File Structure

```
PetShop/
├── docker-compose.yml
├── BUILD_PLAN.md
├── update.sh                         # One-command deployment update script
├── db/
│   └── init.sql                      # Schema + seed data (123 pets from original CSV)
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── index.js                      # Express app entry point
│   └── routes/
│       ├── pets.js
│       ├── petTypes.js
│       └── purchases.js
└── frontend/
    ├── Dockerfile                    # Multi-stage: Vite build → nginx serve
    ├── nginx.conf                    # SPA routing + /api proxy to backend
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── public/
    │   └── placeholder.svg           # "Photo Coming Soon" fallback image
    └── src/
        ├── main.jsx
        ├── App.jsx                   # Route definitions
        ├── App.css                   # Global styles (blue/white PowerApps theme)
        ├── api.js                    # Fetch wrapper + FALLBACK_IMG constant
        ├── components/
        │   └── PetForm.jsx           # Shared form used by NewPet and EditPet
        └── pages/
            ├── Home.jsx
            ├── NewPet.jsx
            ├── EditPet.jsx
            ├── MakeSale.jsx
            ├── PurchaseDetail.jsx
            └── admin/
                ├── AdminLayout.jsx   # Shared admin shell (header + nav)
                ├── AdminPurchases.jsx
                └── AdminPetTypes.jsx
```

---

## Seed Data
- All 123 pets from `cr5bc_petinformations.csv` imported via `db/init.sql`
- 121 marked available, 2 marked sold (unnamed Fish, Brownie the Monkey)
- Pet types seeded: Amphibian, Big cats, Bird, Cat, Chickens, Dog, Fish, Horse and Pony, Marsupial, Monkey, Rabbit, Reptiles, Rodent, Wolf + Fox

---

## Running the App

```bash
# First run (builds images, seeds database)
sudo docker compose up --build -d

# Subsequent runs
sudo docker compose up -d

# Stop
sudo docker compose down

# Stop and wipe all data (fresh start)
sudo docker compose down -v
```

Access at `http://<server-ip>:8080` from any device on the network.

---

## Updating the App

Pull the latest code from GitHub and redeploy in one command:

```bash
./update.sh
```

This script runs `git pull`, rebuilds the containers, and prints the URL when done.

For first-time setup on a new server:

```bash
git clone https://github.com/ptempleton/petshop.git
cd petshop
chmod +x update.sh
sudo docker compose up --build -d
```

---

## Design Decisions
- **Images use URLs** — same approach as the original PowerApp; no file upload needed
- **Local placeholder image** — "Photo Coming Soon" SVG served by the app, no external dependency
- **Pet type snapshots in purchases** — sale history is preserved independently of the pet catalogue
- **Atomic sale/return** — purchase creation and pet availability are updated in a single database transaction
- **nginx proxy** — only one port (8080) exposed; backend is never directly reachable from the network
- **No authentication** — internal home network use only
- **Confirm on all deletes** — every destructive action prompts the user before proceeding
