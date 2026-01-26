import { readdir, copyFile, unlink } from "node:fs/promises";
import path from "node:path";

const OUTPUT_DIR = path.resolve("public/diagnosis");
const BACKUP_DIR = path.resolve("public/diagnosis-backup-png-originals");

async function main() {
  const entries = await readdir(BACKUP_DIR, { withFileTypes: true });
  const pngFiles = entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".png"))
    .map((e) => e.name);

  if (pngFiles.length === 0) {
    console.log(`No PNG files found in ${BACKUP_DIR}`);
    return;
  }

  // Restore PNGs
  await Promise.all(
    pngFiles.map((name) =>
      copyFile(path.join(BACKUP_DIR, name), path.join(OUTPUT_DIR, name))
    )
  );

  // Remove any previously generated JPG/WebP artifacts (if any)
  const outputEntries = await readdir(OUTPUT_DIR, { withFileTypes: true });
  const artifacts = outputEntries
    .filter(
      (e) =>
        e.isFile() &&
        (e.name.toLowerCase().endsWith(".jpg") ||
          e.name.toLowerCase().endsWith(".webp"))
    )
    .map((e) => path.join(OUTPUT_DIR, e.name));

  await Promise.all(artifacts.map((p) => unlink(p)));

  console.log(
    `Restored ${pngFiles.length} PNG icons and deleted ${artifacts.length} artifact files.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

