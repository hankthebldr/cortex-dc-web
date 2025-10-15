import { Router } from 'express';
import { getDatabase } from '@cortex/db/src/adapters/database.factory';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();

/**
 * Get current user profile
 */
router.get('/me', async (req: AuthRequest, res) => {
  try {
    const db = getDatabase();
    const user = await db.findByField('users', 'keycloakId', req.user?.uid);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ data: user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

/**
 * Create new user profile
 * POST /api/users
 */
router.post('/', async (req: AuthRequest, res) => {
  try {
    const db = getDatabase();
    const {
      email,
      displayName,
      role = 'user',
      department,
      organizationId,
      theme = 'dark',
      notifications = true,
      language = 'en',
    } = req.body;

    // Validate required fields
    if (!email || !displayName) {
      return res.status(400).json({
        success: false,
        error: 'Email and displayName are required',
      });
    }

    // Check if user already exists
    const existingUser = await db.findByField('users', 'email', email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists',
      });
    }

    // Create user profile
    const userProfile = await db.create('users', {
      email,
      displayName,
      photoURL: null,
      role,
      organizationId: organizationId || null,
      department: department || null,
      permissions: [],
      preferences: {
        theme,
        notifications,
        language,
      },
      metadata: {
        createdAt: new Date(),
        lastActive: new Date(),
        loginCount: 0,
        emailVerified: false,
        providerData: [],
      },
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      profile: userProfile,
    });
  } catch (error: any) {
    console.error('Error creating user profile:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create user profile',
    });
  }
});

/**
 * Update user profile
 * PUT /api/users/:id
 */
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const {
      displayName,
      department,
      role,
      status,
      preferences,
    } = req.body;

    // Check if user exists
    const existingUser = await db.findOne('users', id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Build update object (only include provided fields)
    const updateData: any = {
      'metadata.lastModified': new Date(),
    };

    if (displayName !== undefined) updateData.displayName = displayName;
    if (department !== undefined) updateData.department = department;
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;
    if (preferences !== undefined) updateData.preferences = preferences;

    // Update user profile
    const updatedUser = await db.update('users', id, updateData);

    res.json({
      success: true,
      profile: updatedUser,
    });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update user profile',
    });
  }
});

/**
 * Get user by ID
 * GET /api/users/:id
 */
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const user = await db.findOne('users', id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * List users with optional filters
 * GET /api/users?role=admin&status=active&limit=20
 */
router.get('/', async (req: AuthRequest, res) => {
  try {
    const db = getDatabase();
    const { role, status, organizationId, limit = '50' } = req.query;

    const filters: any[] = [];

    if (role) {
      filters.push({ field: 'role', operator: '==', value: role });
    }

    if (status) {
      filters.push({ field: 'status', operator: '==', value: status });
    }

    if (organizationId) {
      filters.push({ field: 'organizationId', operator: '==', value: organizationId });
    }

    const users = await db.findMany('users', {
      filters,
      limit: parseInt(limit as string, 10),
    });

    res.json({ data: users });
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

/**
 * Delete user
 * DELETE /api/users/:id
 */
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    // Only admins can delete users
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const db = getDatabase();
    const { id } = req.params;

    // Check if user exists
    const existingUser = await db.findOne('users', id);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    await db.delete('users', id);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

/**
 * Bulk update users
 * PUT /api/users/bulk
 */
router.put('/bulk/update', async (req: AuthRequest, res) => {
  try {
    // Only admins can bulk update
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const db = getDatabase();
    const { userIds, updates } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds must be a non-empty array' });
    }

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'updates must be an object' });
    }

    // Add lastModified to updates
    const updateData = {
      ...updates,
      'metadata.lastModified': new Date(),
    };

    await db.updateMany('users', userIds, updateData);

    res.json({
      success: true,
      updated: userIds.length,
    });
  } catch (error: any) {
    console.error('Error bulk updating users:', error);
    res.status(500).json({ error: error.message || 'Failed to bulk update users' });
  }
});

export const userRoutes = router;
