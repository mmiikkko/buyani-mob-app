# Connecting Buyani App to Database

This guide explains how to connect your Buyani mobile app to a MySQL database.

## Architecture

The mobile app connects to a backend API server, which in turn connects to the MySQL database. This is the recommended approach for security and scalability.

```
Mobile App → Backend API → MySQL Database
```

## Setup Instructions

### 1. Backend Server Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:
```
DB_URI=mysql://username:password@localhost:3306/buyani
PORT=3000
JWT_SECRET=your-secret-key-here
```

5. The database schema is already configured in `server/db/schema.ts`. The auth routes are set up to:
   - Create users in the `user` table with UUIDs
   - Store passwords in the `account` table
   - Create shop entries for sellers
   - Verify credentials during login

6. Start the server:
```bash
npm run dev
```

### 2. Mobile App Configuration

1. Create a `.env` file in the root directory:
```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

For production, use your deployed API URL:
```
EXPO_PUBLIC_API_URL=https://api.buyani.com/api
```

2. Install AsyncStorage for token storage (if not already installed):
```bash
npm install @react-native-async-storage/async-storage
```

3. Update `lib/api.ts` to use AsyncStorage:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// In ApiClient class:
setToken(token: string) {
  AsyncStorage.setItem('auth_token', token);
}

getToken(): Promise<string | null> {
  return AsyncStorage.getItem('auth_token');
}

clearToken() {
  AsyncStorage.removeItem('auth_token');
}
```

### 3. Testing

1. Start the backend server:
```bash
cd server
npm run dev
```

2. Start the mobile app:
```bash
npm start
```

3. Test login/signup flows in the app - they should now connect to your database!

## Important Notes

- The backend server must be running for the mobile app to work
- For development, use your computer's IP address instead of `localhost` when testing on a physical device
- Make sure your MySQL database is running and accessible
- Keep your `.env` files secure and never commit them to version control

