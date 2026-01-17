export type AssetKind = 'image' | 'audio' | 'json' | 'spritesheet' | 'font' | 'other';

export interface AssetLicense {
  spdx: string;
  sourceUrl?: string;
  attribution?: string;
}

export interface AssetFile {
  path: string;
  mimeType?: string;
  sha256?: string;
  size?: number;
  sourceUrl?: string;
}

export interface AssetEntry {
  id: string;
  kind: AssetKind;
  title?: string;
  tags?: string[];
  license: AssetLicense;
  files: AssetFile[];
  meta?: Record<string, unknown>;
}

export interface AssetManifest {
  version: number;
  generatedAt: string;
  assets: AssetEntry[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizePublicAssetPath(path: string): string {
  const trimmed = path.trim().replace(/\\/g, '/');
  if (trimmed.startsWith('/assets/')) return trimmed;
  if (trimmed.startsWith('assets/')) return `/${trimmed}`;
  if (trimmed.startsWith('/')) return `/assets${trimmed}`;
  return `/assets/${trimmed}`;
}

function parseManifest(input: unknown): AssetManifest {
  if (!isRecord(input)) throw new Error('Invalid assets manifest: expected object');

  const version = input.version;
  const generatedAt = input.generatedAt;
  const assets = input.assets;

  if (typeof version !== 'number') throw new Error('Invalid assets manifest: version must be number');
  if (typeof generatedAt !== 'string') throw new Error('Invalid assets manifest: generatedAt must be string');
  if (!Array.isArray(assets)) throw new Error('Invalid assets manifest: assets must be array');

  const parsedAssets: AssetEntry[] = assets.map((a, idx) => {
    if (!isRecord(a)) throw new Error(`Invalid asset entry at index ${idx}`);

    const id = a.id;
    const kind = a.kind;
    const title = a.title;
    const tags = a.tags;
    const license = a.license;
    const files = a.files;
    const meta = a.meta;

    if (typeof id !== 'string' || !id) throw new Error(`Invalid asset id at index ${idx}`);
    if (typeof kind !== 'string' || !kind) throw new Error(`Invalid asset kind for ${id}`);
    if (!isRecord(license)) throw new Error(`Invalid asset license for ${id}`);
    if (typeof license.spdx !== 'string' || !license.spdx) throw new Error(`Invalid license.spdx for ${id}`);
    if (!Array.isArray(files) || files.length === 0) throw new Error(`Invalid files for ${id}`);

    const parsedFiles: AssetFile[] = files.map((f, fIdx) => {
      if (!isRecord(f)) throw new Error(`Invalid file for ${id} at index ${fIdx}`);
      const path = f.path;
      if (typeof path !== 'string' || !path) throw new Error(`Invalid file.path for ${id} at index ${fIdx}`);

      return {
        path,
        mimeType: typeof f.mimeType === 'string' ? f.mimeType : undefined,
        sha256: typeof f.sha256 === 'string' ? f.sha256 : undefined,
        size: typeof f.size === 'number' ? f.size : undefined,
        sourceUrl: typeof f.sourceUrl === 'string' ? f.sourceUrl : undefined
      };
    });

    return {
      id,
      kind: kind as AssetKind,
      title: typeof title === 'string' ? title : undefined,
      tags: Array.isArray(tags) ? (tags.filter(t => typeof t === 'string') as string[]) : undefined,
      license: {
        spdx: license.spdx as string,
        sourceUrl: typeof license.sourceUrl === 'string' ? license.sourceUrl : undefined,
        attribution: typeof license.attribution === 'string' ? license.attribution : undefined
      },
      files: parsedFiles,
      meta: isRecord(meta) ? meta : undefined
    };
  });

  return { version, generatedAt, assets: parsedAssets };
}

export class AssetRegistry {
  private byId: Map<string, AssetEntry>;

  constructor(public readonly manifest: AssetManifest) {
    this.byId = new Map(manifest.assets.map(a => [a.id, a]));
  }

  static async load(url: string = '/assets/manifest.json', init?: RequestInit): Promise<AssetRegistry> {
    const res = await fetch(url, init);
    if (!res.ok) {
      throw new Error(`Failed to load assets manifest (${res.status} ${res.statusText})`);
    }

    const json = (await res.json()) as unknown;
    const manifest = parseManifest(json);
    return new AssetRegistry(manifest);
  }

  get(assetId: string): AssetEntry | undefined {
    return this.byId.get(assetId);
  }

  list(): AssetEntry[] {
    return Array.from(this.byId.values());
  }

  resolveFile(assetId: string, filePath?: string): string | undefined {
    const asset = this.byId.get(assetId);
    if (!asset) return undefined;

    const file = filePath
      ? asset.files.find(f => f.path === filePath)
      : asset.files[0];

    if (!file) return undefined;
    return normalizePublicAssetPath(file.path);
  }
}
