import { test } from 'node:test';
import assert from 'node:assert/strict';
import { versionedPath, versionedPublicPath } from './versioned-asset.ts';

const bytes = (text: string) => new TextEncoder().encode(text);

test('the same contents always get the same address', () => {
  assert.equal(versionedPath('/favicon.ico', bytes('icon')), versionedPath('/favicon.ico', bytes('icon')));
});

test('new contents get a new address, so browsers fetch the new icon', () => {
  assert.notEqual(versionedPath('/favicon.ico', bytes('old icon')), versionedPath('/favicon.ico', bytes('new icon')));
});

test('the address keeps the file path and adds a short fingerprint', () => {
  assert.match(versionedPath('/favicon.png', bytes('icon')), /^\/favicon\.png\?v=[0-9a-f]{10}$/);
});

test('every icon the layout links exists in public/', () => {
  for (const path of ['/favicon.ico', '/favicon.png', '/apple-touch-icon.png']) {
    assert.match(versionedPublicPath(path), new RegExp(`^${path.replace('.', '\\.')}\\?v=[0-9a-f]{10}$`));
  }
});
