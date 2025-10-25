/**
 * TRR Routes
 * Enterprise-grade CRUD operations with validation and authorization
 */

import { Router } from 'express';
import { getDatabase } from '@cortex/db/src/adapters/database.factory';
import { AuthRequest } from '../middleware/auth.middleware';
import { validateCreateTRR, validateUpdateTRR } from '@cortex/db/src/schemas/trr';

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

    // Authorization: Verify user owns this TRR
    if (trr.createdBy !== req.user?.uid) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this TRR' });
    }

    res.json({ data: trr });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch TRR' });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    // Validate request body
    const validation = validateCreateTRR(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }

    const db = getDatabase();
    const now = new Date();
    const trr = await db.create('trrs', {
      ...validation.data,
      createdBy: req.user?.uid,
      lastModifiedBy: req.user?.uid,
      createdAt: now,
      updatedAt: now
    });
    res.status(201).json({ data: trr });
  } catch (error) {
    console.error('Error creating TRR:', error);
    res.status(500).json({ error: 'Failed to create TRR' });
  }
});

router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const db = getDatabase();

    // Authorization: Verify user owns this TRR before updating
    const existingTRR = await db.findOne('trrs', req.params.id);
    if (!existingTRR) {
      return res.status(404).json({ error: 'TRR not found' });
    }
    if (existingTRR.createdBy !== req.user?.uid) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to update this TRR' });
    }

    // Validate update data
    const validation = validateUpdateTRR(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }

    // Prevent changing ownership and organization
    const { createdBy, organizationId, ...updateData } = validation.data;
    const trr = await db.update('trrs', req.params.id, {
      ...updateData,
      lastModifiedBy: req.user?.uid,
      updatedAt: new Date()
    });
    res.json({ data: trr });
  } catch (error) {
    console.error('Error updating TRR:', error);
    res.status(500).json({ error: 'Failed to update TRR' });
  }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const db = getDatabase();

    // Authorization: Verify user owns this TRR before deleting
    const existingTRR = await db.findOne('trrs', req.params.id);
    if (!existingTRR) {
      return res.status(404).json({ error: 'TRR not found' });
    }
    if (existingTRR.createdBy !== req.user?.uid) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to delete this TRR' });
    }

    await db.delete('trrs', req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete TRR' });
  }
});

export const trrRoutes: import("express").Router = router;
