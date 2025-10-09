export interface Page {
  goto(url: string): Promise<void>;
  locator(selector: string): {
    toHaveText(expected: string): Promise<void>;
  };
}

export interface TestArgs {
  page: Page;
}

declare type TestCallback = (args: TestArgs) => unknown | Promise<unknown>;

declare export const test: {
  (name: string, callback: TestCallback): void;
  describe(name: string, callback: () => void): void;
};

declare export const expect: {
  (actual: { toHaveText: (expected: string) => Promise<void> }): {
    toHaveText(expected: string): Promise<void>;
  };
};

export declare const devices: Record<string, Record<string, unknown>>;

export declare function defineConfig<T>(config: T): T;
