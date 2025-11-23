# FinTrack - Finance Management System

A modern, full-stack finance management web application built with Next.js 14, featuring bill tracking, analytics, and multi-user support with role-based access control.

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=flat-square&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat-square&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest-000000?style=flat-square)

## 🚀 Features

### Authentication & Authorization
- Secure JWT-based authentication with HTTP-only cookies
- Role-based access control (ADMIN/USER roles)
- Password hashing with bcryptjs (10 salt rounds)
- Session management with auto-refresh

### Bill Management
- 📄 Create bills with multiple line items
- 📊 Automatic GST calculation (0%, 5%, 12%, 18%, 28%)
- 📎 File attachments (PDF, JPG, PNG)
- 🗑️ Delete bills (ADMIN only)
- 🔍 Advanced filtering by category and date range
- 📱 Responsive design with mobile-optimized views
- 🔄 Real-time calculations

### Analytics Dashboard
- 💰 Total expense tracking
- 📈 Category-wise spending analysis (Pie Chart)
- 📅 Monthly expense trends (Bar Chart)
- 🏆 Biggest spending category
- 📋 Recent bills overview

### Parts & Items View
- 📦 Consolidated view of all items across bills
- 🔢 Piece tracking and unit pricing
- 💵 Automatic subtotal calculations
- 🎯 Filter by category and date

### Modern UI/UX with shadcn/ui
- Built with shadcn/ui components (Radix UI + Tailwind)
- Gradient-based color scheme
- Smooth animations and transitions
- Dark mode ready design system
- Lucide React icons throughout
- Toast notifications
- Dialog modals
- Responsive tables and cards

## 📁 Project Structure

```
fintrack/
├── app/
│   ├── api/                      # API routes
│   │   ├── analytics/
│   │   │   └── summary/         # Analytics endpoints
│   │   ├── auth/
│   │   │   ├── login/           # Login endpoint
│   │   │   ├── logout/          # Logout endpoint
│   │   │   └── me/              # Current user endpoint
│   │   └── bills/
│   │       ├── route.js         # GET, POST bills
│   │       └── [id]/route.js    # DELETE bill
│   ├── add-bill/                # Add bill page (ADMIN only)
│   ├── analytics/               # Analytics dashboard
│   ├── bills/                   # Bills listing page
│   ├── login/                   # Login page
│   ├── globals.css              # Global styles + shadcn/ui
│   ├── layout.js                # Root layout with Toaster
│   └── page.js                  # Home page (Parts view)
├── components/
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── input.jsx
│   │   ├── label.jsx
│   │   ├── select.jsx
│   │   ├── table.jsx
│   │   ├── badge.jsx
│   │   ├── dialog.jsx
│   │   ├── dropdown-menu.jsx
│   │   ├── alert.jsx
│   │   ├── toast.jsx
│   │   └── textarea.jsx
│   ├── Loading.js               # Loading component
│   └── Navbar.js                # Navigation with dropdown menu
├── hooks/
│   └── use-toast.js             # Toast notification hook
├── lib/
│   ├── auth.js                  # Authentication utilities
│   ├── db.js                    # Prisma client instance
│   └── utils.js                 # Utility functions (cn)
├── prisma/
│   ├── migrations/              # Database migrations
│   ├── schema.prisma            # Prisma schema (PostgreSQL)
│   └── seed.js                  # Database seeding script
├── public/
│   └── uploads/                 # Bill attachments
├── middleware.js                # Next.js middleware for auth
├── tailwind.config.js           # Tailwind + shadcn/ui config
├── components.json              # shadcn/ui config
└── .env                         # Environment variables
```

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI Library:** shadcn/ui (Radix UI + Tailwind CSS)
- **Styling:** Tailwind CSS 3.4
- **Icons:** Lucide React
- **Charts:** Recharts
- **Data Fetching:** SWR

### Backend
- **Runtime:** Node.js 18+
- **Database:** PostgreSQL 16
- **ORM:** Prisma 5.22
- **Authentication:** JWT + bcryptjs
- **File Upload:** Formidable

### Categories Supported
- Food
- Travel
- Equipment (Compute, Electrical, Mechanical)
- Parts (Compute, Electrical, Mechanical)
- Office Accessories
- Salaries

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 16
- Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/fintrack.git
cd fintrack
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Set Up Environment Variables
Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/fintrack?schema=public"
JWT_SECRET="your-super-strong-secret-key-change-this-in-production"
```

**Important:** Replace `USERNAME` and `PASSWORD` with your PostgreSQL credentials.

### Step 4: Set Up PostgreSQL

#### Install PostgreSQL (macOS with Homebrew)
```bash
brew install postgresql@16
brew services start postgresql@16
```

#### Create Database
```bash
/opt/homebrew/opt/postgresql@16/bin/createdb fintrack
```

Or if PostgreSQL is in your PATH:
```bash
createdb fintrack
```

#### Verify Database
```bash
/opt/homebrew/opt/postgresql@16/bin/psql -d fintrack -c "\l fintrack"
```

### Step 5: Run Database Migrations
```bash
npx prisma migrate dev --name init
```

This will:
- Create all database tables
- Generate Prisma Client
- Apply the schema to PostgreSQL

### Step 6: Seed Database with Initial Users
```bash
node prisma/seed.js
```

This creates 4 users:
- **ajay** (ADMIN) - Password: `Adminaj@2025`
- **purva** (USER) - Password: `Purva@123`
- **satya** (USER) - Password: `Satya@123`
- **krunal** (USER) - Password: `Krunal@123`

### Step 7: Create Uploads Directory
```bash
mkdir -p public/uploads
```

### Step 8: Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Database Schema

### User Model
```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  password  String   // bcrypt hashed
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  bills     Bill[]
}

enum Role {
  ADMIN
  USER
}
```

### Bill Model
```prisma
model Bill {
  id            Int      @id @default(autoincrement())
  userId        Int
  category      String
  description   String?
  subtotal      Float
  gstPercentage Float
  gstAmount     Float
  totalAmount   Float
  filePath      String
  timestamp     DateTime @default(now())
  user          User     @relation(fields: [userId], references: [id])
  items         Item[]
}
```

### Item Model
```prisma
model Item {
  id           Int    @id @default(autoincrement())
  billId       Int
  itemName     String
  pieces       Int
  pricePerUnit Float
  subtotal     Float
  bill         Bill   @relation(fields: [billId], references: [id], onDelete: Cascade)
}
```

## 🔐 Security Features

- JWT tokens stored in HTTP-only cookies
- Password hashing with bcrypt (10 salt rounds)
- Middleware-based route protection
- Role-based access control
- File type validation for uploads
- SQL injection protection via Prisma ORM
- CSRF protection via SameSite cookies

## 🎨 UI Components (shadcn/ui)

### Installed Components
- **Button** - Multiple variants (default, destructive, outline, ghost)
- **Card** - With gradient headers and icons
- **Input & Textarea** - Form inputs with validation
- **Select** - Dropdown menus
- **Table** - Responsive data tables
- **Dialog** - Modal dialogs for confirmations
- **Badge** - Status and category badges
- **Toast** - Notification system
- **Dropdown Menu** - User profile menu
- **Loading States** - Skeleton loaders

### Design System
- **Color Scheme:** Gradient-based (Blue, Indigo, Purple, Pink, Emerald, Teal)
- **Typography:** Inter font family
- **Spacing:** Consistent padding and margins
- **Animations:** Smooth transitions and hover effects

## 📱 Responsive Design

- **Mobile (< 768px):** Card-based layouts, hamburger menu
- **Tablet (768px - 1024px):** Adaptive grid layouts
- **Desktop (> 1024px):** Full-featured table views
- Touch-friendly interactive elements
- Responsive charts and graphs

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
  - Body: `{ username, password }`
  - Returns: Sets HTTP-only cookie
- `POST /api/auth/logout` - User logout
  - Clears authentication cookie
- `GET /api/auth/me` - Get current user
  - Returns: `{ user: { id, username, role, createdAt } }`

### Bills
- `GET /api/bills` - Get bills (with pagination & filters)
  - Query params: `page`, `limit`, `category`, `startDate`, `endDate`
  - Returns: `{ bills: [], pagination: { ... } }`
- `POST /api/bills` - Create new bill (ADMIN only)
  - Body: FormData with items, category, gstPercentage, description, file
  - Returns: Created bill object
- `DELETE /api/bills/:id` - Delete bill (ADMIN only)
  - Returns: Success message

### Analytics
- `GET /api/analytics/summary` - Get analytics summary
  - Returns: `{ totalExpense, totalBills, biggestCategory, categoryData, monthData, recentBills }`

## 🚢 Deployment

### Environment Variables for Production
```env
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-secret-key-min-32-chars"
NODE_ENV="production"
```

### Build for Production
```bash
npm run build
npm start
```

### Recommended Platforms
- **Vercel** - Best for Next.js (with Vercel Postgres)
- **Railway** - Easy PostgreSQL hosting
- **Heroku** - Traditional PaaS
- **DigitalOcean** - App Platform with managed databases

## 🐛 Troubleshooting

### PostgreSQL Issues

**Service not running:**
```bash
brew services list | grep postgresql
brew services restart postgresql@16
```

**Connection refused:**
```bash
# Check if PostgreSQL is listening
lsof -i :5432

# Check PostgreSQL logs
tail -f /opt/homebrew/var/log/postgresql@16.log
```

### Prisma Issues

**Client out of sync:**
```bash
npx prisma generate
```

**Migration failed:**
```bash
npx prisma migrate reset  # WARNING: Deletes all data
npx prisma migrate dev
```

### Next.js Issues

**Port already in use:**
```bash
lsof -ti:3000 | xargs kill
```

**Module not found:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Purva** - Initial work and development

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- shadcn for the beautiful UI component library
- Vercel for hosting and deployment platform
- Prisma team for the excellent ORM
- Radix UI for accessible component primitives

---

**Built with ❤️ using Next.js 14, PostgreSQL, Prisma, and shadcn/ui**
