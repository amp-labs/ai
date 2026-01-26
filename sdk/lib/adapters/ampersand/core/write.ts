import { WriteResponse } from '../types';
import * as Sentry from '@sentry/node';
interface WriteParams {
  objectName: string;
  type: 'create' | 'update';
  record: Record<string, any>;
  groupRef: string;
  associations?: Array<{
    to: { id: string };
    types: Array<{
      associationCategory: string;
      associationTypeId: number;
    }>;
  }>;
  apiKey?: string;
  projectId?: string;
  integrationName?: string;
}

export async function executeAmpersandWrite({
  objectName,
  type,
  record,
  groupRef,
  associations,
  apiKey = process.env.AMPERSAND_API_KEY || '',
  projectId = process.env.AMPERSAND_PROJECT_ID || '',
  integrationName = process.env.AMPERSAND_INTEGRATION_NAME || '',
}: WriteParams): Promise<WriteResponse> {
  try {
    const requestBody = {
      groupRef,
      type,
      record,
      ...(associations && { associations }),
    };

    /**
     * @remarks This function is used to write to Ampersand API, uses fetch instead of @amp-labs/sdk-node-write
     * to avoid issues with zod validation errors when migrating to AI SDK v5
     *
     * temporary solution until we migrate the @amp-labs/sdk-node-write package
     */

    const url = `https://write.withampersand.com/v1/projects/${projectId}/integrations/${integrationName}/objects/${objectName}`;

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetails = errorText;
      let errorMessage = `Write operation failed: ${response.status} ${response.statusText}`;

      try {
        const errorJson = JSON.parse(errorText);
        errorDetails = JSON.stringify(errorJson, null, 2);
        if (errorJson.message) {
          errorMessage = errorJson.message;
        } else if (errorJson.error) {
          errorMessage = errorJson.error;
        }
      } catch {
        // If not JSON, use the text as-is
        if (errorText) {
          errorMessage = errorText;
        }
      }

      console.error('[Ampersand] Error response:', errorDetails);

      throw new Error(`${errorMessage}\n\nFull API Response: ${errorDetails}`);
    }

    const data = await response.json();

    return {
      success: true,
      status: 'success',
      recordId: data?.result?.recordId || '',
      response: data,
    };
  } catch (error) {
    Sentry.captureException(error);
    console.error('[Ampersand] Error in write operation:', error);
    return {
      success: false,
      status: 'error',
      recordId: '',
      response: error,
    };
  }
}
