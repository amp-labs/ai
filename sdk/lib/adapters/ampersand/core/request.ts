import { ensureInstallationExists } from './installation';

export async function callAmpersandProxy({
  provider,
  endpoint,
  method = 'GET',
  headers = {},
  installationId,
  apiKey,
  projectId,
  integrationName,
  body,
}: {
  provider: string;
  endpoint: string;
  method?: string;
  headers?: Record<string, string>;
  installationId?: string;
  apiKey: string;
  projectId: string;
  integrationName: string;
  body?: Record<string, any>;
}) {
  let finalInstallationId = installationId;
  if (!finalInstallationId) {
    finalInstallationId = await ensureInstallationExists(
      provider,
      apiKey,
      projectId,
      integrationName,
    );
  }
  const fetchOptions: any = {
    method,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
      'x-amp-project-id': projectId,
      'x-api-key': apiKey,
      'x-amp-proxy-version': '1',
      'x-amp-installation-id': finalInstallationId,
    },
  };
  if (body && method !== 'GET' && Object.keys(body).length > 0) {
    fetchOptions.body = JSON.stringify(body);
  }
  const proxyUrl = `https://proxy.withampersand.com/${endpoint}`;

  // Add timeout to prevent hanging requests
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
  fetchOptions.signal = controller.signal;

  const response = await fetch(proxyUrl, fetchOptions);
  clearTimeout(timeoutId);
  const responseText = await response.text();

  let responseData;
  try {
    responseData = JSON.parse(responseText);
  } catch (error) {
    // Enhanced error logging for JSON parsing failures
    console.error('Failed to parse Ampersand proxy response as JSON');
    console.error('Error:', error);
    console.error('URL:', proxyUrl);
    console.error('Method:', method);
    console.error('Status:', response.status);
    console.error(
      'Response headers:',
      JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2),
    );
    console.error('Response body:', responseText.substring(0, 1000));
    throw new Error(
      `Invalid JSON response from Ampersand proxy: ${responseText.substring(0, 200)}`,
    );
  }

  // Enhanced error logging for non-2xx responses
  if (!response.ok) {
    console.error('Ampersand proxy request failed');
    console.error('URL:', proxyUrl);
    console.error('Method:', method);
    console.error('Status:', response.status);
    console.error(
      'Headers sent:',
      JSON.stringify(
        {
          ...fetchOptions.headers,
          'x-api-key': '[REDACTED]',
        },
        null,
        2,
      ),
    );
    console.error(
      'Response headers:',
      JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2),
    );

    // Only log request body in verbose mode to avoid exposing sensitive data in production logs
    if (process.env.AMPERSAND_VERBOSE_LOGGING === 'true') {
      console.error('Response body:', JSON.stringify(responseData, null, 2));

      if (body) {
        console.error('Request body:', JSON.stringify(body, null, 2));
      }
    }

    throw new Error(
      `Ampersand proxy request failed: ${response.status} ${response.statusText}`,
    );
  }

  return {
    status: response.status,
    response: responseData,
  };
}
