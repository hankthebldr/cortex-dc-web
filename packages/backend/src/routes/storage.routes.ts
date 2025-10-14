/**
 * Storage Routes
 * File upload and management endpoints
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { requirePermission } from '../middleware/auth.middleware';
import { StorageService } from '../services/storage.service';

const router = Router();
const storageService = new StorageService();

/**
 * POST /api/storage/upload
 * Upload a file
 */
router.post('/upload', requirePermission('write'), asyncHandler(async (req: Request, res: Response) => {
  const { file, path, metadata } = req.body;
  const user = req.user!;

  const result = await storageService.upload({
    file,
    path,
    metadata,
    userId: user.uid,
  });

  res.status(201).json({
    success: true,
    data: result,
  });
}));

/**
 * GET /api/storage/download/:path
 * Download a file
 */
router.get('/download/*', asyncHandler(async (req: Request, res: Response) => {
  const filePath = req.params[0];

  const result = await storageService.download(filePath);

  res.setHeader('Content-Type', result.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
  res.send(result.data);
}));

/**
 * GET /api/storage/url/:path
 * Get signed URL for a file
 */
router.get('/url/*', asyncHandler(async (req: Request, res: Response) => {
  const filePath = req.params[0];
  const { expiresIn = 3600 } = req.query;

  const url = await storageService.getSignedUrl(filePath, Number(expiresIn));

  res.json({
    success: true,
    data: { url },
  });
}));

/**
 * DELETE /api/storage/:path
 * Delete a file
 */
router.delete('/*', requirePermission('delete'), asyncHandler(async (req: Request, res: Response) => {
  const filePath = req.params[0];

  await storageService.delete(filePath);

  res.json({
    success: true,
    message: 'File deleted successfully',
  });
}));

/**
 * GET /api/storage/list
 * List files in a directory
 */
router.get('/list', asyncHandler(async (req: Request, res: Response) => {
  const { prefix, maxResults = 100 } = req.query;

  const files = await storageService.list({
    prefix: prefix as string,
    maxResults: Number(maxResults),
  });

  res.json({
    success: true,
    data: files,
  });
}));

/**
 * GET /api/storage/metadata/:path
 * Get file metadata
 */
router.get('/metadata/*', asyncHandler(async (req: Request, res: Response) => {
  const filePath = req.params[0];

  const metadata = await storageService.getMetadata(filePath);

  res.json({
    success: true,
    data: metadata,
  });
}));

export default router;
