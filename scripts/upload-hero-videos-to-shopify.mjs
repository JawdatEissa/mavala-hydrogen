/**
 * Upload hero videos to Shopify Files via Admin GraphQL.
 *
 * Flow:
 *   1. stagedUploadsCreate (resource: VIDEO) — get signed upload URLs
 *   2. Upload each .mp4 file to staged target
 *   3. fileCreate — register each video in Shopify Files
 *   4. Poll fileStatus until READY, then print final CDN URLs
 *
 * Usage:
 *   node scripts/upload-hero-videos-to-shopify.mjs
 *   node scripts/upload-hero-videos-to-shopify.mjs --dry-run
 */
import dotenv from 'dotenv';
import { readFileSync, statSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// ── CLI flags ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');

// ── Video files to upload ──────────────────────────────────────────────────
const VIDEOS_DIR = join(__dirname, '..', 'downloads', 'hero-videos-inspect');

const VIDEOS = [
  {
    file: 'home-hero-21ldJiKpid8.mp4',
    alt: 'Mavala Home Page Hero Video',
    page: 'home',
  },
  {
    file: 'about-hero-fNGAmWwRx6Y-1080p-merged.mp4',
    alt: 'Mavala About Page Hero Video',
    page: 'about',
  },
];

// ── Shopify Admin credentials ──────────────────────────────────────────────
const domain =
  process.env.PUBLIC_STORE_DOMAIN?.replace(/^https?:\/\//, '').trim() || '';
const shop = domain.replace(/\.myshopify\.com$/i, '');
const clientId = process.env.SHOPIFY_CLIENT_ID?.trim() || '';
const clientSecret = process.env.SHOPIFY_CLIENT_SECRET?.trim() || '';
const adminVersion =
  process.env.SHOPIFY_API_VERSION?.trim() ||
  process.env.PUBLIC_STOREFRONT_API_VERSION?.trim() ||
  '2026-01';

if (!shop || !clientId || !clientSecret) {
  console.error(
    'Missing SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET / PUBLIC_STORE_DOMAIN in .env.local',
  );
  process.exit(1);
}

// ── Admin token ────────────────────────────────────────────────────────────
let adminToken = null;

async function getToken() {
  if (adminToken) return adminToken;
  const res = await fetch(
    `https://${shop}.myshopify.com/admin/oauth/access_token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    },
  );
  const json = await res.json();
  if (!res.ok || !json.access_token) {
    throw new Error(`Admin token exchange failed: HTTP ${res.status}`);
  }
  adminToken = json.access_token;
  return adminToken;
}

// ── Admin GraphQL helper ───────────────────────────────────────────────────
async function adminGQL(query, variables = {}) {
  const token = await getToken();
  const res = await fetch(
    `https://${shop}.myshopify.com/admin/api/${adminVersion}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({ query, variables }),
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Admin GQL HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

// ── GraphQL mutations/queries ──────────────────────────────────────────────
const STAGED_UPLOADS_CREATE = `#graphql
  mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        url
        resourceUrl
        parameters {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const FILE_CREATE = `#graphql
  mutation fileCreate($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files {
        id
        alt
        fileStatus
        ... on Video {
          sources {
            url
            mimeType
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const FILE_STATUS_QUERY = `#graphql
  query fileStatus($id: ID!) {
    node(id: $id) {
      ... on Video {
        id
        fileStatus
        originalSource {
          url
        }
        sources {
          url
          mimeType
        }
        preview {
          image {
            url
          }
        }
      }
    }
  }
`;

// ── Step 1: Create staged upload targets ───────────────────────────────────
async function createStagedUploads(videoMetas) {
  const input = videoMetas.map((v) => ({
    filename: v.filename,
    mimeType: 'video/mp4',
    resource: 'VIDEO',
    fileSize: String(v.fileSize),
    httpMethod: 'POST',
  }));

  console.log('\n📤 Creating staged upload targets...');
  const result = await adminGQL(STAGED_UPLOADS_CREATE, { input });
  const targets = result.data?.stagedUploadsCreate?.stagedTargets || [];
  const errors = result.data?.stagedUploadsCreate?.userErrors || [];

  if (errors.length > 0) {
    throw new Error(
      `stagedUploadsCreate errors: ${errors.map((e) => e.message).join('; ')}`,
    );
  }
  if (targets.length !== videoMetas.length) {
    throw new Error(
      `Expected ${videoMetas.length} staged targets, got ${targets.length}`,
    );
  }

  console.log(`  Got ${targets.length} staged upload target(s)`);
  return targets;
}

// ── Step 2: Upload files to staged targets ─────────────────────────────────
async function uploadFileToTarget(target, filePath, mimeType) {
  const fileBuffer = readFileSync(filePath);
  const filename = basename(filePath);

  const formData = new FormData();
  for (const param of target.parameters) {
    formData.append(param.name, param.value);
  }
  formData.append(
    'file',
    new Blob([fileBuffer], { type: mimeType }),
    filename,
  );

  console.log(
    `  Uploading ${filename} (${(fileBuffer.length / 1024 / 1024).toFixed(1)} MB)...`,
  );
  const uploadRes = await fetch(target.url, {
    method: 'POST',
    body: formData,
  });

  if (!uploadRes.ok && uploadRes.status >= 400) {
    const text = await uploadRes.text();
    throw new Error(
      `Staged upload failed for ${filename}: HTTP ${uploadRes.status} — ${text}`,
    );
  }

  console.log(`  Uploaded ${filename} -> resourceUrl: ${target.resourceUrl}`);
  return target.resourceUrl;
}

// ── Step 3: Register files in Shopify ──────────────────────────────────────
async function createFiles(uploads) {
  const files = uploads.map((u) => ({
    alt: u.alt,
    contentType: 'VIDEO',
    originalSource: u.resourceUrl,
  }));

  console.log('\n📁 Registering files in Shopify...');
  const result = await adminGQL(FILE_CREATE, { files });

  // Check for top-level GraphQL errors (e.g. missing scopes)
  if (result.errors?.length) {
    const msgs = result.errors.map((e) => e.message).join('\n  ');
    throw new Error(`fileCreate GraphQL errors:\n  ${msgs}`);
  }

  const created = result.data?.fileCreate?.files || [];
  const errors = result.data?.fileCreate?.userErrors || [];

  if (errors.length > 0) {
    throw new Error(
      `fileCreate errors: ${errors.map((e) => `${e.field}: ${e.message}`).join('; ')}`,
    );
  }

  for (const f of created) {
    console.log(`  Created: ${f.id} — status: ${f.fileStatus}`);
  }

  return created;
}

// ── Step 4: Poll file status until READY ───────────────────────────────────
async function pollUntilReady(fileId, maxAttempts = 60, intervalMs = 5000) {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await adminGQL(FILE_STATUS_QUERY, { id: fileId });
    const node = result.data?.node;
    if (!node) {
      console.log(`  Waiting for ${fileId}... (not found yet)`);
    } else {
      console.log(`  ${fileId} — status: ${node.fileStatus}`);
      if (node.fileStatus === 'READY') {
        return node;
      }
      if (node.fileStatus === 'FAILED') {
        throw new Error(`File ${fileId} processing FAILED`);
      }
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`File ${fileId} did not become READY after ${maxAttempts} attempts`);
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== Mavala Hero Video Upload to Shopify ===');
  console.log(`Store: ${shop}.myshopify.com`);
  console.log(`API version: ${adminVersion}`);

  // Gather file metadata
  const videoMetas = VIDEOS.map((v) => {
    const filePath = join(VIDEOS_DIR, v.file);
    const stats = statSync(filePath);
    return {
      ...v,
      filePath,
      filename: v.file,
      fileSize: stats.size,
    };
  });

  for (const v of videoMetas) {
    console.log(
      `  ${v.page}: ${v.filename} (${(v.fileSize / 1024 / 1024).toFixed(1)} MB)`,
    );
  }

  if (DRY_RUN) {
    console.log('\n--dry-run: would upload the above files. Exiting.');
    return;
  }

  // Step 1: Staged uploads
  const targets = await createStagedUploads(videoMetas);

  // Step 2: Upload files
  const uploads = [];
  for (let i = 0; i < videoMetas.length; i++) {
    const resourceUrl = await uploadFileToTarget(
      targets[i],
      videoMetas[i].filePath,
      'video/mp4',
    );
    uploads.push({
      ...videoMetas[i],
      resourceUrl,
    });
  }

  // Step 3: Create file records
  const createdFiles = await createFiles(uploads);

  // Step 4: Poll until ready
  console.log('\n⏳ Waiting for video processing (this may take a few minutes)...');
  const results = [];
  for (let i = 0; i < createdFiles.length; i++) {
    const ready = await pollUntilReady(createdFiles[i].id);
    results.push({
      page: uploads[i].page,
      fileId: ready.id,
      sources: ready.sources || [],
      preview: ready.preview?.image?.url || null,
    });
  }

  // Print results
  console.log('\n✅ All videos uploaded and processed!\n');
  console.log('=== Video URLs (save these) ===\n');
  for (const r of results) {
    console.log(`Page: ${r.page}`);
    console.log(`  File ID: ${r.fileId}`);
    if (r.preview) console.log(`  Preview: ${r.preview}`);
    for (const s of r.sources) {
      console.log(`  ${s.mimeType}: ${s.url}`);
    }
    console.log();
  }
}

main().catch((err) => {
  console.error('\n❌ Error:', err.message || err);
  process.exit(1);
});
