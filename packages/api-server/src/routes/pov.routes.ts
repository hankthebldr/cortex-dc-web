/**
 * POV Routes
 */

import { Router } from 'express';
import { getDatabase } from '@cortex/db/src/adapters/database.factory';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// GET /api/povs - List all POVs for current user
router.get('/', async (req: AuthRequest, res) => {
  try {
    const db = getDatabase();
    const userId = req.user?.uid;

    const povs = await db.findMany('povs', {
      filters: [{ field: 'createdBy', operator: '==', value: userId }],
      orderBy: 'createdAt',
      orderDirection: 'desc',
    });

    res.json({ data: povs });
  } catch (error) {
    console.error('[POV Routes] Error listing POVs:', error);
    res.status(500).json({ error: 'Failed to fetch POVs' });
  }
});

// GET /api/povs/:id - Get single POV
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const pov = await db.findOne('povs', id);

    if (!pov) {
      return res.status(404).json({ error: 'POV not found' });
    }

    res.json({ data: pov });
  } catch (error) {
    console.error('[POV Routes] Error fetching POV:', error);
    res.status(500).json({ error: 'Failed to fetch POV' });
  }
});

// POST /api/povs - Create new POV
router.post('/', async (req: AuthRequest, res) => {
  try {
    const db = getDatabase();
    const userId = req.user?.uid;

    const povData = {
      ...req.body,
      createdBy: userId,
    };

    const pov = await db.create('povs', povData);

    res.status(201).json({ data: pov });
  } catch (error) {
    console.error('[POV Routes] Error creating POV:', error);
    res.status(500).json({ error: 'Failed to create POV' });
  }
});

// PUT /api/povs/:id - Update POV
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const pov = await db.update('povs', id, req.body);

    res.json({ data: pov });
  } catch (error) {
    console.error('[POV Routes] Error updating POV:', error);
    res.status(500).json({ error: 'Failed to update POV' });
  }
});

// DELETE /api/povs/:id - Delete POV
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    await db.delete('povs', id);

    res.status(204).send();
  } catch (error) {
    console.error('[POV Routes] Error deleting POV:', error);
    res.status(500).json({ error: 'Failed to delete POV' });
  }
});

export const povRoutes: import("express").Router = router;
