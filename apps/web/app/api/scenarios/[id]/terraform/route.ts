import { NextRequest, NextResponse } from 'next/server';
import { terraformGenerationService } from '@cortex/db';

/**
 * GET /api/scenarios/[id]/terraform
 * Generate and download Terraform configuration for a scenario
 *
 * Query parameters:
 * - format: 'hcl' | 'json' (default: 'hcl')
 * - provider: 'gcp' | 'aws' | 'azure' (default: 'gcp')
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scenarioId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const format = (searchParams.get('format') as 'hcl' | 'json') || 'hcl';
    const provider = (searchParams.get('provider') as 'gcp' | 'aws' | 'azure') || 'gcp';

    // Generate Terraform configuration
    const result = await terraformGenerationService.generateDownloadableFile(
      scenarioId,
      format
    );

    // Set appropriate headers for file download
    const headers = new Headers();
    headers.set('Content-Type', result.mimeType);
    headers.set('Content-Disposition', `attachment; filename="${result.filename}"`);
    headers.set('Content-Length', result.content.length.toString());

    return new NextResponse(result.content, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error generating Terraform configuration:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate Terraform configuration',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/scenarios/[id]/terraform
 * Generate Terraform configuration with custom options (preview without download)
 *
 * Body:
 * {
 *   format?: 'hcl' | 'json',
 *   provider?: 'gcp' | 'aws' | 'azure',
 *   includeVariables?: boolean,
 *   includeOutputs?: boolean
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scenarioId = params.id;
    const body = await request.json();

    const {
      format = 'hcl',
      provider = 'gcp',
      includeVariables = true,
      includeOutputs = true,
    } = body;

    // Generate Terraform configuration
    const output = await terraformGenerationService.generateTerraformForScenario(
      scenarioId,
      {
        format,
        provider,
        includeVariables,
        includeOutputs,
      }
    );

    return NextResponse.json({
      success: true,
      data: output,
    });
  } catch (error) {
    console.error('Error generating Terraform configuration:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate Terraform configuration',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
