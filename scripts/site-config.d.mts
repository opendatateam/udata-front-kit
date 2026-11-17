export type DeployEnv = 'demo' | 'preprod' | 'prod'

export declare const DEPLOY_ENVS: DeployEnv[]
export declare const CONFIGS_DIR: string

export declare function applyMergePatch<T>(base: T, patch: unknown): T
export declare function baseConfigPath(siteId: string): string
export declare function envConfigPath(siteId: string, deployEnv: string): string
export declare function loadSiteConfig(siteId: string, deployEnv?: string): any // eslint-disable-line @typescript-eslint/no-explicit-any
