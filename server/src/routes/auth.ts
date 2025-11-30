import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { db } from '../../db/index.js';
import { eq } from 'drizzle-orm';
import { user, account, shop, USER_ROLES } from '../../db/schema.js';

const router = express.Router();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, storeName, ownerName, phoneNumber, businessCategory } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (role === 'seller' && (!storeName || !ownerName || !phoneNumber || !businessCategory)) {
      return res.status(400).json({ error: 'All seller fields are required' });
    }

    // Check if user already exists
    const [existingUser] = await db.select().from(user).where(eq(user.email, email)).limit(1);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate UUIDs
    const userId = randomUUID();
    const accountId = randomUUID();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine user name and role
    const userName = role === 'customer' ? name : ownerName;
    const userRole = role === 'seller' ? USER_ROLES.SELLER : USER_ROLES.CUSTOMER;

    // Create user
    await db.insert(user).values({
      id: userId,
      name: userName || email,
      email,
      role: userRole,
      emailVerified: false,
    });

    // Create account with password
    await db.insert(account).values({
      id: accountId,
      accountId: email,
      providerId: 'credential',
      userId,
      password: hashedPassword,
    });

    // If seller, create shop
    if (role === 'seller' && storeName) {
      const shopId = randomUUID();
      await db.insert(shop).values({
        id: shopId,
        sellerId: userId,
        shopName: storeName,
        description: businessCategory ? `Category: ${businessCategory}` : null,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId, email, role: userRole },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        email,
        role: userRole,
        name: userName,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const [foundUser] = await db.select().from(user).where(eq(user.email, email)).limit(1);
    
    if (!foundUser) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Find account with password
    const [userAccount] = await db
      .select()
      .from(account)
      .where(eq(account.userId, foundUser.id))
      .limit(1);

    if (!userAccount || !userAccount.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, userAccount.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify role matches (if provided)
    if (role) {
      const expectedRole = role === 'seller' ? USER_ROLES.SELLER : USER_ROLES.CUSTOMER;
      if (foundUser.role !== expectedRole) {
        return res.status(403).json({ error: 'Invalid role for this account' });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: foundUser.id, email: foundUser.email, role: foundUser.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: foundUser.id,
        email: foundUser.email,
        role: foundUser.role,
        name: foundUser.name,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

export default router;

