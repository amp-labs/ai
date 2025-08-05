/**
 * Helper to get the OAuth URL for a provider via Ampersand API.
 * @param provider - The provider to authenticate with
 * @param groupRef - Optional group reference
 * @param consumerRef - Optional consumer reference
 * @param projectId - Project ID
 * @param apiKey - API key for authentication (required)
 * @returns The OAuth URL as a string
 */
export async function getOAuthURL({
  provider,
  groupRef,
  consumerRef,
  projectId,
  apiKey,
}: {
  provider: string;
  groupRef?: string;
  consumerRef?: string;
  projectId: string;
  apiKey: string;
}): Promise<string> {
  const options: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify({ provider, consumerRef, groupRef, projectId }),
  };
  const response = await fetch(
    "https://api.withampersand.com/v1/oauth-connect",
    options,
  );
  return response.text();
}
