# Buyani API Server

Backend API server for the Buyani mobile app using Express, Drizzle ORM, and MySQL.

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your database connection:
```
DB_URI=mysql://username:password@localhost:3306/buyani
PORT=3000
JWT_SECRET=your-secret-key-here
```

4. The database schema is already set up in `db/schema.ts` with all the required tables (user, account, shop, products, orders, etc.).

5. Run the server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user (customer or seller)
- `POST /api/auth/login` - Login with email and password

## Next Steps

1. Create your database schema in `server/db/schema.ts`
2. Update the auth routes to use your actual schema
3. Add more endpoints as needed (products, orders, etc.)
4. Set up proper error handling and validation
5. Add authentication middleware for protected routes

