export type TestFn = (name: string, fn: () => unknown | Promise<unknown>) => void;

declare export const describe: TestFn;
declare export const it: TestFn;
declare export const test: TestFn;

declare export function expect(actual: unknown): {
  toBe(expected: unknown): void;
};
