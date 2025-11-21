import { SDKNodePlatform } from '@amp-labs/sdk-node-platform';

export interface ClientConfig {
  apiKey: string;
  projectId?: string;
  integrationName?: string;
  clientName?: string;
  clientVersion?: string;
  userAgent?: string;
}

export interface SDKNodePlatformConfig {
  apiKeyHeader: string;
  headers?: Record<string, string>;
}

/**
 * Creates a configured SDKNodePlatform instance with usage tracking headers
 */
export function createSDKNodePlatformClient(
  config: ClientConfig,
): SDKNodePlatform {
  const headers: Record<string, string> = {};

  // Add client tracking headers
  if (config.clientName) {
    headers['x-amp-client'] = config.clientName;
  }

  if (config.clientVersion) {
    headers['x-amp-client-version'] = config.clientVersion;
  }

  // Add user agent if provided
  if (config.userAgent) {
    headers['User-Agent'] = config.userAgent;
  }

  // Add SDK version tracking
  headers['x-amp-sdk'] = '@amp-labs/ai';
  headers['x-amp-sdk-version'] = '0.1.0'; // This should be dynamically read from package.json

  // Add integration tracking
  if (config.integrationName) {
    headers['x-amp-integration'] = config.integrationName;
  }

  // Add project tracking
  if (config.projectId) {
    headers['x-amp-project'] = config.projectId;
  }

  const sdkConfig: SDKNodePlatformConfig = {
    apiKeyHeader: config.apiKey,
  };

  // Only add headers if we have any
  if (Object.keys(headers).length > 0) {
    sdkConfig.headers = headers;
  }

  return new SDKNodePlatform(sdkConfig);
}

/**
 * Gets the current SDK version from package.json
 */
export function getSDKVersion(): string {
  try {
    // In a real implementation, this would read from package.json
    // For now, we'll return a static version
    return '0.1.0';
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Creates a default client configuration from environment variables
 */
export function createDefaultClientConfig(): ClientConfig {
  return {
    apiKey: process.env.AMPERSAND_API_KEY || '',
    projectId: process.env.AMPERSAND_PROJECT_ID,
    integrationName: process.env.AMPERSAND_INTEGRATION_NAME,
    clientName: process.env.AMPERSAND_CLIENT_NAME || 'ai-sdk',
    clientVersion: process.env.AMPERSAND_CLIENT_VERSION || getSDKVersion(),
    userAgent: process.env.AMPERSAND_USER_AGENT,
  };
}

/**
 * Creates a custom client configuration for usage tracking
 * This is the main function users should use to configure client tracking
 */
export function createClientConfig(
  options: Partial<ClientConfig> = {},
): ClientConfig {
  const defaultConfig = createDefaultClientConfig();

  return {
    ...defaultConfig,
    ...options,
  };
}

/**
 * Helper function to set global client configuration
 * This allows users to configure client tracking once and have it applied to all requests
 */
let globalClientConfig: ClientConfig | null = null;

export function setGlobalClientConfig(config: ClientConfig): void {
  globalClientConfig = config;
}

export function getGlobalClientConfig(): ClientConfig | null {
  return globalClientConfig;
}

export function clearGlobalClientConfig(): void {
  globalClientConfig = null;
}

/**
 * Gets the effective client configuration (global + defaults)
 */
export function getEffectiveClientConfig(
  overrideConfig?: Partial<ClientConfig>,
): ClientConfig {
  const defaultConfig = createDefaultClientConfig();
  const globalConfig = getGlobalClientConfig();

  return {
    ...defaultConfig,
    ...globalConfig,
    ...overrideConfig,
  };
}
