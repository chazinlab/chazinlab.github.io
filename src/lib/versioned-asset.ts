/**
 * Addresses for files in public/ that change whenever the file's contents change.
 *
 * Browsers keep site icons in a cache of their own and rarely check for a newer one, so replacing
 * public/favicon.ico alone leaves returning visitors with the old icon. Adding a short fingerprint
 * of the contents (`/favicon.ico?v=1a2b3c4d5e`) gives every new version a new address, which the
 * browser has never seen and so downloads. The file itself stays at its usual place in public/.
 *
 * Tested with plain Node, so this file must not import anything from 'astro:*'.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** `path` with a fingerprint of `contents` appended, e.g. `/favicon.ico?v=1a2b3c4d5e`. */
export function versionedPath(path: string, contents: Uint8Array): string {
  const fingerprint = createHash('sha256').update(contents).digest('hex').slice(0, 10);
  return `${path}?v=${fingerprint}`;
}

/**
 * The versioned address of a file in public/, given as it is served (`/favicon.ico`).
 * Reads public/ under `root`, which defaults to the folder the site is built from.
 */
export function versionedPublicPath(path: string, root: string = process.cwd()): string {
  return versionedPath(path, readFileSync(join(root, 'public', path)));
}
