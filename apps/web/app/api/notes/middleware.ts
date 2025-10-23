/**
 * API Middleware: Authentication for Notes API
 * GUID: 0d1e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@cortex/db';

/**
 * Extract Bearer token from Authorization header
 */
function extractBearerToken(request: NextRequest): string | null {
	const authHeader = request.headers.get('Authorization');

	if (!authHeader) {
		return null;
	}

	const parts = authHeader.split(' ');
	if (parts.length !== 2 || parts[0] !== 'Bearer') {
		return null;
	}

	return parts[1];
}

/**
 * Validate API key or authentication token
 */
export async function validateAuth(request: NextRequest): Promise<{
	valid: boolean;
	userId?: string;
	error?: string;
}> {
	const token = extractBearerToken(request);

	if (!token) {
		return {
			valid: false,
			error: 'Missing authentication token',
		};
	}

	try {
		const auth = getAuth();

		// Verify the token
		const user = await auth.verifyToken(token);

		if (!user) {
			return {
				valid: false,
				error: 'Invalid authentication token',
			};
		}

		return {
			valid: true,
			userId: user.id,
		};
	} catch (error: any) {
		return {
			valid: false,
			error: `Authentication failed: ${error.message}`,
		};
	}
}

/**
 * Authentication middleware wrapper
 */
export async function withAuth(
	request: NextRequest,
	handler: (request: NextRequest, userId: string) => Promise<NextResponse>
): Promise<NextResponse> {
	const authResult = await validateAuth(request);

	if (!authResult.valid) {
		return NextResponse.json(
			{
				success: false,
				error: authResult.error || 'Unauthorized',
			},
			{ status: 401 }
		);
	}

	return handler(request, authResult.userId!);
}

/**
 * Optional authentication middleware
 * Allows requests with or without authentication
 */
export async function withOptionalAuth(
	request: NextRequest,
	handler: (request: NextRequest, userId?: string) => Promise<NextResponse>
): Promise<NextResponse> {
	const authResult = await validateAuth(request);

	return handler(request, authResult.userId);
}

/**
 * Rate limiting check (basic implementation)
 */
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
	identifier: string,
	maxRequests: number = 100,
	windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number } {
	const now = Date.now();
	const record = requestCounts.get(identifier);

	if (!record || now > record.resetAt) {
		// Create new record
		requestCounts.set(identifier, {
			count: 1,
			resetAt: now + windowMs,
		});
		return { allowed: true, remaining: maxRequests - 1 };
	}

	if (record.count >= maxRequests) {
		return { allowed: false, remaining: 0 };
	}

	record.count++;
	return { allowed: true, remaining: maxRequests - record.count };
}

/**
 * Rate limiting middleware
 */
export async function withRateLimit(
	request: NextRequest,
	handler: (request: NextRequest) => Promise<NextResponse>,
	maxRequests: number = 100
): Promise<NextResponse> {
	// Use IP address as identifier
	const ip = request.headers.get('x-forwarded-for') ||
	           request.headers.get('x-real-ip') ||
	           'unknown';

	const rateLimit = checkRateLimit(ip, maxRequests);

	if (!rateLimit.allowed) {
		return NextResponse.json(
			{
				success: false,
				error: 'Rate limit exceeded',
				retryAfter: 60,
			},
			{
				status: 429,
				headers: {
					'Retry-After': '60',
					'X-RateLimit-Remaining': '0',
				},
			}
		);
	}

	const response = await handler(request);

	// Add rate limit headers
	response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());

	return response;
}
