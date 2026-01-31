/**
 * Helper to get the OAuth URL for a provider via Ampersand API.
 * @param provider - The provider to authenticate with
 * @param groupRef - Optional group reference
 * @param consumerRef - Optional consumer reference
 * @param projectId - Project ID
 * @param apiKey - API key for authentication (required)
 * @param providerWorkspaceRef - Optional provider workspace identifier (e.g. Salesforce subdomain)
 * @returns The OAuth URL as a string
 */
export async function getOAuthURL({
  provider,
  groupRef,
  consumerRef,
  projectId,
  apiKey,
  providerWorkspaceRef,
}: {
  provider: string;
  groupRef?: string;
  consumerRef?: string;
  projectId: string;
  apiKey: string;
  providerWorkspaceRef?: string;
}): Promise<string> {
  const options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify({
      provider,
      consumerRef,
      groupRef,
      projectId,
      providerWorkspaceRef,
    }),
  };
  const response = await fetch(
    'https://api.withampersand.com/v1/oauth-connect',
    options,
  );

  // Check if response is successful
  if (!response.ok) {
    const errorText = await response.text();
    let errorDetails = errorText;
    let errorMessage = `Failed to get OAuth URL: ${response.status} ${response.statusText}`;

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

    // Provide more helpful error messages for common cases
    if (
      errorMessage.toLowerCase().includes('providerworkspaceref') ||
      errorDetails.toLowerCase().includes('providerworkspaceref')
    ) {
      throw new Error(
        `The provider "${provider}" requires a providerWorkspaceRef parameter. ` +
          `For Salesforce, this is your subdomain (e.g. "mycompany" for mycompany.salesforce.com). ` +
          `Please provide this parameter and try again.\n\nAPI Response: ${errorDetails}`,
      );
    }

    throw new Error(`${errorMessage}\n\nFull API Response: ${errorDetails}`);
  }

  return response.text();
}
