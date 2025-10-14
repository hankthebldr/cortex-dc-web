/**
 * Data Export Routes
 * Export data to various formats (BigQuery, CSV, JSON)
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { requirePermission } from '../middleware/auth.middleware';
import { config } from '../config/env.config';
import { ExportService } from '../services/export.service';

const router = Router();
const exportService = new ExportService();

/**
 * POST /api/export/bigquery
 * Export data to BigQuery
 */
router.post('/bigquery', requirePermission('export'), asyncHandler(async (req: Request, res: Response) => {
  if (!config.ENABLE_BIGQUERY_EXPORT) {
    return res.status(503).json({
      success: false,
      error: 'BigQuery export is disabled',
    });
  }

  const { collection, table, options } = req.body;
  const user = req.user!;

  const result = await exportService.exportToBigQuery({
    collection,
    table,
    options,
    userId: user.uid,
  });

  res.json({
    success: true,
    data: result,
  });
}));

/**
 * POST /api/export/csv
 * Export data to CSV format
 */
router.post('/csv', requirePermission('export'), asyncHandler(async (req: Request, res: Response) => {
  const { collection, filters, fields } = req.body;
  const user = req.user!;

  const csvData = await exportService.exportToCSV({
    collection,
    filters,
    fields,
    userId: user.uid,
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${collection}-export.csv"`);
  res.send(csvData);
}));

/**
 * POST /api/export/json
 * Export data to JSON format
 */
router.post('/json', requirePermission('export'), asyncHandler(async (req: Request, res: Response) => {
  const { collection, filters } = req.body;
  const user = req.user!;

  const jsonData = await exportService.exportToJSON({
    collection,
    filters,
    userId: user.uid,
  });

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${collection}-export.json"`);
  res.json(jsonData);
}));

/**
 * GET /api/export/jobs
 * List export jobs
 */
router.get('/jobs', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { status, limit = 20, offset = 0 } = req.query;

  const jobs = await exportService.listJobs(user.uid, {
    status: status as string,
    limit: Number(limit),
    offset: Number(offset),
  });

  res.json({
    success: true,
    data: jobs,
  });
}));

/**
 * GET /api/export/jobs/:id
 * Get export job status
 */
router.get('/jobs/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { id } = req.params;

  const job = await exportService.getJob(user.uid, id);

  res.json({
    success: true,
    data: job,
  });
}));

/**
 * POST /api/export/schedule
 * Schedule recurring export
 */
router.post('/schedule', requirePermission('admin'), asyncHandler(async (req: Request, res: Response) => {
  const { schedule, exportConfig } = req.body;
  const user = req.user!;

  const result = await exportService.scheduleExport({
    schedule,
    exportConfig,
    userId: user.uid,
  });

  res.status(201).json({
    success: true,
    data: result,
  });
}));

export default router;
