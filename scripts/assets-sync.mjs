import { createHash } from 'crypto';
import fs from 'fs/promises';
import path from 'path';

const args = new Set(process.argv.slice(2));
const manifestArg = process.argv.find(a => a.startsWith('--manifest='));
const manifestPath = manifestArg
  ? manifestArg.split('=')[1]
  : path.join(process.cwd(), 'public', 'assets', 'manifest.json');

const force = args.has('--force');
const verify = args.has('--verify');

function isRecord(value) {
  return typeof value === 'object' && value !== null;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Download failed (${res.status} ${res.statusText}) for ${url}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function main() {
  const raw = await fs.readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(raw);

  if (!isRecord(manifest) || !Array.isArray(manifest.assets)) {
    throw new Error('Invalid manifest.json');
  }

  const baseDir = path.dirname(manifestPath);

  let downloadedCount = 0;
  let verifiedCount = 0;
  let skippedCount = 0;

  for (const asset of manifest.assets) {
    if (!isRecord(asset) || typeof asset.id !== 'string' || !Array.isArray(asset.files)) continue;

    for (const file of asset.files) {
      if (!isRecord(file) || typeof file.path !== 'string') continue;

      const outPath = path.join(baseDir, file.path);
      const outDir = path.dirname(outPath);
      await ensureDir(outDir);

      const hasLocal = await fileExists(outPath);
      const shouldDownload = Boolean(file.sourceUrl) && (!hasLocal || force);

      if (shouldDownload) {
        const buf = await download(file.sourceUrl);
        await fs.writeFile(outPath, buf);
        file.size = buf.length;
        file.sha256 = sha256(buf);
        downloadedCount++;
        continue;
      }

      if (verify && hasLocal) {
        const buf = await fs.readFile(outPath);
        const digest = sha256(buf);
        if (typeof file.sha256 === 'string' && file.sha256 && file.sha256 !== digest) {
          throw new Error(`SHA256 mismatch for ${asset.id}:${file.path}`);
        }
        verifiedCount++;
        continue;
      }

      skippedCount++;
    }
  }

  if (downloadedCount > 0) {
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  }

  process.stdout.write(
    JSON.stringify(
      {
        manifestPath,
        downloadedCount,
        verifiedCount,
        skippedCount
      },
      null,
      2
    ) + '\n'
  );
}

await main();
