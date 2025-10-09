export type UserConfig = Record<string, unknown>;

export declare function defineConfig<T extends UserConfig>(config: T): T;
