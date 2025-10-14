/**
 * Data Management Routes
 * CRUD operations for application data
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { requirePermission } from '../middleware/auth.middleware';
import { DataService } from '../services/data.service';

const router = Router();
const dataService = new DataService();

/**
 * GET /api/data/:collection
 * List documents in a collection
 */
router.get('/:collection', asyncHandler(async (req: Request, res: Response) => {
  const { collection } = req.params;
  const { limit = 50, offset = 0, orderBy, filters } = req.query;

  const result = await dataService.list(collection, {
    limit: Number(limit),
    offset: Number(offset),
    orderBy: orderBy as string,
    filters: filters ? JSON.parse(filters as string) : undefined,
  });

  res.json({
    success: true,
    data: result.items,
    pagination: {
      total: result.total,
      limit: Number(limit),
      offset: Number(offset),
    },
  });
}));

/**
 * GET /api/data/:collection/:id
 * Get a single document by ID
 */
router.get('/:collection/:id', asyncHandler(async (req: Request, res: Response) => {
  const { collection, id } = req.params;

  const document = await dataService.get(collection, id);

  res.json({
    success: true,
    data: document,
  });
}));

/**
 * POST /api/data/:collection
 * Create a new document
 */
router.post('/:collection', requirePermission('write'), asyncHandler(async (req: Request, res: Response) => {
  const { collection } = req.params;
  const data = req.body;
  const user = req.user!;

  const document = await dataService.create(collection, data, user.uid);

  res.status(201).json({
    success: true,
    data: document,
  });
}));

/**
 * PUT /api/data/:collection/:id
 * Update an existing document
 */
router.put('/:collection/:id', requirePermission('write'), asyncHandler(async (req: Request, res: Response) => {
  const { collection, id } = req.params;
  const updates = req.body;
  const user = req.user!;

  const document = await dataService.update(collection, id, updates, user.uid);

  res.json({
    success: true,
    data: document,
  });
}));

/**
 * PATCH /api/data/:collection/:id
 * Partially update a document
 */
router.patch('/:collection/:id', requirePermission('write'), asyncHandler(async (req: Request, res: Response) => {
  const { collection, id } = req.params;
  const updates = req.body;
  const user = req.user!;

  const document = await dataService.patch(collection, id, updates, user.uid);

  res.json({
    success: true,
    data: document,
  });
}));

/**
 * DELETE /api/data/:collection/:id
 * Delete a document
 */
router.delete('/:collection/:id', requirePermission('delete'), asyncHandler(async (req: Request, res: Response) => {
  const { collection, id } = req.params;

  await dataService.delete(collection, id);

  res.json({
    success: true,
    message: 'Document deleted successfully',
  });
}));

/**
 * POST /api/data/:collection/batch
 * Batch create multiple documents
 */
router.post('/:collection/batch', requirePermission('write'), asyncHandler(async (req: Request, res: Response) => {
  const { collection } = req.params;
  const { items } = req.body;
  const user = req.user!;

  const result = await dataService.batchCreate(collection, items, user.uid);

  res.status(201).json({
    success: true,
    data: result,
  });
}));

/**
 * PUT /api/data/:collection/batch
 * Batch update multiple documents
 */
router.put('/:collection/batch', requirePermission('write'), asyncHandler(async (req: Request, res: Response) => {
  const { collection } = req.params;
  const { updates } = req.body;
  const user = req.user!;

  const result = await dataService.batchUpdate(collection, updates, user.uid);

  res.json({
    success: true,
    data: result,
  });
}));

/**
 * DELETE /api/data/:collection/batch
 * Batch delete multiple documents
 */
router.delete('/:collection/batch', requirePermission('delete'), asyncHandler(async (req: Request, res: Response) => {
  const { collection } = req.params;
  const { ids } = req.body;

  await dataService.batchDelete(collection, ids);

  res.json({
    success: true,
    message: `Deleted ${ids.length} documents`,
  });
}));

/**
 * POST /api/data/:collection/search
 * Search documents with advanced filters
 */
router.post('/:collection/search', asyncHandler(async (req: Request, res: Response) => {
  const { collection } = req.params;
  const { query, filters, limit = 50, offset = 0 } = req.body;

  const result = await dataService.search(collection, query, {
    filters,
    limit: Number(limit),
    offset: Number(offset),
  });

  res.json({
    success: true,
    data: result.items,
    pagination: {
      total: result.total,
      limit: Number(limit),
      offset: Number(offset),
    },
  });
}));

export default router;
