declare const process: { env: Record<string, string | undefined> };

export interface AmpersandConfig {
    apiKey: string;
    projectId: string;
    integrationName: string;
    groupRef: string;
}

export class AmpersandConfigManager {
    private static config: AmpersandConfig | null = null;

    static init(config?: Partial<AmpersandConfig>): AmpersandConfig {
        this.config = {
            apiKey: config?.apiKey || process.env.AMPERSAND_API_KEY || "",
            projectId: config?.projectId || process.env.AMPERSAND_PROJECT_ID || "",
            integrationName: config?.integrationName || process.env.AMPERSAND_INTEGRATION_NAME || "",
            groupRef: config?.groupRef || process.env.AMPERSAND_GROUP_REF || "",
        };
        return this.config;
    }

    static get(): AmpersandConfig {
        if (!this.config) {
            return this.init();
        }
        return this.config;
    }

    static require(): AmpersandConfig {
        const config = this.get();
        const missing = Object.entries(config)
            .filter(([_, value]) => !value)
            .map(([key]) => key);

        if (missing.length > 0) {
            throw new Error(`Missing required Ampersand configuration: ${missing.join(", ")}`);
        }

        return config;
    }
}

export const amp = {
    init: (config?: Partial<AmpersandConfig>) => AmpersandConfigManager.init(config),
    get: () => AmpersandConfigManager.get(),
    require: () => AmpersandConfigManager.require(),
};

// Export types for better developer experience
export type {
    CreateActionType,
    UpdateActionType,
    WriteOutputType,
    CheckConnectionInputType,
    CheckConnectionOutputType,
    CreateInstallationInputType,
    CreateInstallationOutputType,
    CheckInstallationInputType,
    CheckInstallationOutputType,
    OAuthInputType,
    OAuthOutputType,
    ProxyInputType,
    ProxyOutputType,
} from "./adapters/common"; 