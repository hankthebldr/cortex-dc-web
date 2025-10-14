/**
 * AI Service Routes
 * Gemini AI integration endpoints
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { config } from '../config/env.config';
import { AIService } from '../services/ai.service';

const router = Router();
const aiService = new AIService();

/**
 * POST /api/ai/chat
 * Send a chat message and get AI response
 */
router.post('/chat', asyncHandler(async (req: Request, res: Response) => {
  if (!config.ENABLE_AI_FEATURES) {
    return res.status(503).json({
      success: false,
      error: 'AI features are disabled',
    });
  }

  const { message, context, conversationId } = req.body;
  const user = req.user!;

  const response = await aiService.chat({
    message,
    context,
    conversationId,
    userId: user.uid,
  });

  res.json({
    success: true,
    data: response,
  });
}));

/**
 * POST /api/ai/analyze
 * Analyze data or content
 */
router.post('/analyze', asyncHandler(async (req: Request, res: Response) => {
  if (!config.ENABLE_AI_FEATURES) {
    return res.status(503).json({
      success: false,
      error: 'AI features are disabled',
    });
  }

  const { content, analysisType } = req.body;
  const user = req.user!;

  const analysis = await aiService.analyze({
    content,
    analysisType,
    userId: user.uid,
  });

  res.json({
    success: true,
    data: analysis,
  });
}));

/**
 * POST /api/ai/generate
 * Generate content based on prompt
 */
router.post('/generate', asyncHandler(async (req: Request, res: Response) => {
  if (!config.ENABLE_AI_FEATURES) {
    return res.status(503).json({
      success: false,
      error: 'AI features are disabled',
    });
  }

  const { prompt, options } = req.body;
  const user = req.user!;

  const generated = await aiService.generate({
    prompt,
    options,
    userId: user.uid,
  });

  res.json({
    success: true,
    data: generated,
  });
}));

/**
 * POST /api/ai/summarize
 * Summarize long text
 */
router.post('/summarize', asyncHandler(async (req: Request, res: Response) => {
  if (!config.ENABLE_AI_FEATURES) {
    return res.status(503).json({
      success: false,
      error: 'AI features are disabled',
    });
  }

  const { text, maxLength } = req.body;
  const user = req.user!;

  const summary = await aiService.summarize({
    text,
    maxLength,
    userId: user.uid,
  });

  res.json({
    success: true,
    data: summary,
  });
}));

/**
 * GET /api/ai/conversations
 * Get user's conversation history
 */
router.get('/conversations', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { limit = 20, offset = 0 } = req.query;

  const conversations = await aiService.getConversations(user.uid, {
    limit: Number(limit),
    offset: Number(offset),
  });

  res.json({
    success: true,
    data: conversations,
  });
}));

/**
 * GET /api/ai/conversations/:id
 * Get a specific conversation
 */
router.get('/conversations/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { id } = req.params;

  const conversation = await aiService.getConversation(user.uid, id);

  res.json({
    success: true,
    data: conversation,
  });
}));

/**
 * DELETE /api/ai/conversations/:id
 * Delete a conversation
 */
router.delete('/conversations/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const { id } = req.params;

  await aiService.deleteConversation(user.uid, id);

  res.json({
    success: true,
    message: 'Conversation deleted',
  });
}));

export default router;
