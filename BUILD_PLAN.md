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
Browser (port 80)
    └── nginx (frontend container)
            ├── /           → serves React build (static files)
            └── /api/*      → proxies to backend:3001 (internal Docker network)
                                └── Express API
                                        └── PostgreSQL (internal Docker network)
```

- Only port 80 is exposed to the host/network
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
| Column      | Type          | Notes                          |
|-------------|---------------|--------------------------------|
| id          | UUID          | Primary key, generated         |
| pet_id      | UUID          | FK → pets(id), SET NULL on delete |
| pet_name    | TEXT          | Snapshot at time of sale       |
| pet_type    | TEXT          | Snapshot at time of sale       |
| pet_picture | TEXT          | Snapshot at time of sale       |
| pet_price   | NUMERIC(10,2) | Snapshot at time of sale       |
| new_owner   | TEXT          | Required                       |
| created_at  | TIMESTAMP     | Auto-set                       |

> Pet details are snapshotted into the purchase record so sale history is preserved even if the pet record is later edited or deleted.

---

## API Endpoints

### Pets — `/api/pets`
| Method | Path          | Action                              |
|--------|---------------|-------------------------------------|
| GET    | `/`           | List all pets (optional `?type=Cat`)|
| GET    | `/:id`        | Get single pet                      |
| POST   | `/`           | Create pet                          |
| PUT    | `/:id`        | Update pet                          |
| DELETE | `/:id`        | Delete pet                          |

### Pet Types — `/api/pet-types`
| Method | Path   | Action           |
|--------|--------|------------------|
| GET    | `/`    | List all types   |
| POST   | `/`    | Create type      |
| PUT    | `/:id` | Rename type      |
| DELETE | `/:id` | Delete type      |

### Purchases — `/api/purchases`
| Method | Path   | Action                                          |
|--------|--------|-------------------------------------------------|
| GET    | `/`    | List all purchases (newest first)               |
| GET    | `/:id` | Get single purchase                             |
| POST   | `/`    | Create purchase + mark pet unavailable (atomic) |
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
- **Save Form** button → POST `/api/pets` → redirect to Home
- **Back/Cancel** → Home

### 3. Edit Pet (`/pets/:id/edit`)
- Shared `PetForm` component (pre-filled)
- Same fields as New Pet
- **Delete** button (centre) → confirms → DELETE `/api/pets/:id` → Home
- **Save Form** → PUT `/api/pets/:id` → Home
- **Back/Cancel** → Home

### 4. Make Sale (`/sale`)
- Left panel: searchable list of **available** pets only
- Right panel: populates when a pet is selected (image, name, type, price, New Owner* field)
- **Complete Sale** → POST `/api/purchases` (atomic: creates record + sets pet unavailable) → redirect to Purchase Detail
- **Cancel Sale** → Home

### 5. Purchase Detail (`/admin/purchases/:id`)
- Shows: pet image, pet name, type, sale price, new owner, date purchased
- **Return Pet to Inventory** button → confirms → DELETE `/api/purchases/:id` (atomic: deletes record + sets pet available) → Admin Purchases list
- **Back to Purchases** link

### 6. Admin — Purchases (`/admin/purchases`)
- Table: thumbnail, pet name, type, price, new owner, date, View button
- View → Purchase Detail page

### 7. Admin — Pet Types (`/admin/pet-types`)
- List of all pet types with inline rename and Delete buttons
- Add new type at the bottom (name field + Add button)

---

## File Structure

```
PetShop/
├── docker-compose.yml
├── BUILD_PLAN.md
├── db/
│   └── init.sql                  # Schema + seed data (123 pets from original CSV)
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── index.js                  # Express app entry point
│   └── routes/
│       ├── pets.js
│       ├── petTypes.js
│       └── purchases.js
└── frontend/
    ├── Dockerfile                # Multi-stage: Vite build → nginx serve
    ├── nginx.conf                # SPA routing + /api proxy to backend
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx               # Route definitions
        ├── App.css               # Global styles (blue/white PowerApps theme)
        ├── api.js                # Fetch wrapper for all API calls
        ├── components/
        │   └── PetForm.jsx       # Shared form used by NewPet and EditPet
        └── pages/
            ├── Home.jsx
            ├── NewPet.jsx
            ├── EditPet.jsx
            ├── MakeSale.jsx
            ├── PurchaseDetail.jsx
            └── admin/
                ├── AdminLayout.jsx     # Shared admin shell (header + nav)
                ├── AdminPurchases.jsx
                └── AdminPetTypes.jsx
```

---

## Seed Data
- All 123 pets from `cr5bc_petinformations.csv` are imported via `db/init.sql`
- 121 marked available, 2 marked sold (unnamed Fish, Brownie the Monkey)
- Pet types seeded: Amphibian, Big cats, Bird, Cat, Chickens, Dog, Fish, Horse and Pony, Marsupial, Monkey, Rabbit, Reptiles, Rodent, Wolf + Fox

---

## Running the App

```bash
# First run (builds images, seeds database)
docker compose up --build

# Subsequent runs
docker compose up

# Stop
docker compose down

# Stop and wipe all data (fresh start)
docker compose down -v
```

Access at `http://localhost` or `http://<your-machine-ip>` from any device on the network.

---

## Design Decisions
- **Images use URLs** — same approach as the original PowerApp; no file upload needed
- **Pet type snapshots in purchases** — sale history is preserved independently of the pet catalogue
- **Atomic sale/return** — purchase creation and pet availability are updated in a single database transaction
- **nginx proxy** — only one port (80) exposed; backend is never directly reachable from the network
- **No authentication** — internal home network use only
