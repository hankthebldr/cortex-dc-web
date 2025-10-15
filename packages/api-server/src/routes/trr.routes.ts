/**
 * TRR Routes
 * Similar structure to POV routes
 */

import { Router } from 'express';
import { getDatabase } from '@cortex/db/src/adapters/database.factory';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();

router.get('/', async (req: AuthRequest, res) => {
  try {
    const db = getDatabase();
    const trrs = await db.findMany('trrs', {
      filters: [{ field: 'createdBy', operator: '==', value: req.user?.uid }],
      orderBy: 'createdAt',
      orderDirection: 'desc',
    });
    res.json({ data: trrs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch TRRs' });
  }
});

router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const db = getDatabase();
    const trr = await db.findOne('trrs', req.params.id);
    if (!trr) return res.status(404).json({ error: 'TRR not found' });
    res.json({ data: trr });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch TRR' });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const db = getDatabase();
    const trr = await db.create('trrs', { ...req.body, createdBy: req.user?.uid });
    res.status(201).json({ data: trr });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create TRR' });
  }
});

router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const db = getDatabase();
    const trr = await db.update('trrs', req.params.id, req.body);
    res.json({ data: trr });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update TRR' });
  }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const db = getDatabase();
    await db.delete('trrs', req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete TRR' });
  }
});

export const trrRoutes: import("express").Router = router;
