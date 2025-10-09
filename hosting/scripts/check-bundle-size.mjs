import { promises as fs } from 'fs';
import path from 'path';

const BYTES_IN_KB = 1024;
const budgetKb = Number.parseInt(process.env.BUNDLE_SIZE_BUDGET_KB ?? '512', 10);
const budgetBytes = budgetKb * BYTES_IN_KB;

const buildDir = path.join(process.cwd(), '.next', 'static');

async function collectBundleSize(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const sizes = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return collectBundleSize(fullPath);
      }
      if (!entry.name.endsWith('.js')) {
        return 0;
      }
      const stat = await fs.stat(fullPath);
      return stat.size;
    }),
  );

  return sizes.reduce((total, current) => total + current, 0);
}

async function main() {
  try {
    await fs.access(buildDir);
  } catch (error) {
    console.error(
      `Bundle artifacts were not found in "${buildDir}". Did you forget to run \"npm run build\" first?`,
    );
    process.exitCode = 1;
    return;
  }

  const totalBytes = await collectBundleSize(buildDir);
  const totalKb = totalBytes / BYTES_IN_KB;

  if (totalBytes > budgetBytes) {
    console.error(
      `Bundle size regression detected: ${totalKb.toFixed(1)} KB exceeds the budget of ${budgetKb} KB.`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(`Bundle size check passed: ${totalKb.toFixed(1)} KB within the ${budgetKb} KB budget.`);
}

await main();
