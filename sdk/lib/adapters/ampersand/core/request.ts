import { ensureInstallationExists } from "./installation";

export async function callAmpersandProxy({
  provider,
  suffix,
  method = "GET",
  headers = {},
  installationId,
  apiKey,
  projectId,
  integrationName,
  body,
}: {
  provider: string;
  suffix: string;
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
      "Content-Type": "application/json",
      "x-amp-project-id": projectId,
      "x-api-key": apiKey,
      "x-amp-proxy-version": "1",
      "x-amp-installation-id": finalInstallationId,
    },
  };
  if (body && method !== "GET" && Object.keys(body).length > 0) {
    fetchOptions.body = JSON.stringify(body);
  }
  const response = await fetch(
    `https://proxy.withampersand.com/${suffix}`,
    fetchOptions
  );
  const responseData = await response.json();
  return {
    status: response.status,
    response: responseData,
  };
}
