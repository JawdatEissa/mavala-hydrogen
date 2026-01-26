import { readdir, mkdir, copyFile, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUTPUT_DIR = path.resolve("public/diagnosis");
const BACKUP_DIR = path.resolve("public/diagnosis-backup-png-originals");

// Chosen to keep icons crisp on desktop even after scaling.
// (Displayed icons are relatively small; 768px gives plenty of headroom.)
const MAX_SIZE = 1024;

async function ensureBackup(sourceNames) {
  await mkdir(BACKUP_DIR, { recursive: true });
  for (const name of sourceNames) {
    const src = path.join(OUTPUT_DIR, name);
    const dest = path.join(BACKUP_DIR, name);
    try {
      await stat(dest);
      continue;
    } catch {
      // backup doesn't exist yet
    }
    await copyFile(src, dest);
  }
}

async function main() {
  const outEntries = await readdir(OUTPUT_DIR, { withFileTypes: true });
  const pngFiles = outEntries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".png"))
    .map((e) => e.name);

  if (pngFiles.length === 0) {
    console.log(`No PNG files found in ${OUTPUT_DIR}`);
    return;
  }

  // Keep originals so we can revert.
  await ensureBackup(pngFiles);

  let totalBefore = 0;
  let totalAfter = 0;

  for (const name of pngFiles) {
    const sourcePath = path.join(BACKUP_DIR, name);
    const outputPath = path.join(OUTPUT_DIR, name);

    const beforeStat = await stat(sourcePath);
    totalBefore += beforeStat.size;

    const pipeline = sharp(sourcePath, { failOn: "none" }).resize({
      width: MAX_SIZE,
      height: MAX_SIZE,
      fit: "inside",
      withoutEnlargement: true,
    });

    // "85% quality" here means palette quantization quality for PNG (lossy-ish PNG).
    // This keeps the .png extension everywhere in the site.
    await pipeline
      .png({
        palette: true,
        quality: 85,
        effort: 10,
        compressionLevel: 9,
        adaptiveFiltering: true,
      })
      .toFile(outputPath);

    const afterStat = await stat(outputPath);
    totalAfter += afterStat.size;
  }

  const mb = (b) => (b / (1024 * 1024)).toFixed(2);
  console.log(
    `Optimized ${pngFiles.length} diagnosis icons: ${mb(totalBefore)} MB -> ${mb(
      totalAfter
    )} MB`
  );
  console.log(`Backup kept at: ${BACKUP_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

