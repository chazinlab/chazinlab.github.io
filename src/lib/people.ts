/** The only reader of lab members and alumni: pages get render-ready models from here. */
import type { ImageMetadata } from 'astro';
import { getCollection } from 'astro:content';
import { renderBody, type Rendered } from './content';
import { orderAlumni, orderMembers } from './people-model';

export interface Member {
  name: string;
  /** Shown in place of a missing photo. */
  initials: string;
  role: string;
  photo?: ImageMetadata;
  email?: string;
  Bio: Rendered;
}

export interface Alumnus {
  name: string;
  /** Where they are now; missing when the lab doesn't know. */
  now?: string;
  inMemoriam?: true;
}

/** Current members, by role in the order set in src/content/people/roles.ts, then by last name. */
export async function members(): Promise<Member[]> {
  const entries = await getCollection('members');
  return orderMembers(await Promise.all(entries.map(async (entry) => ({ ...entry.data, Bio: await renderBody(entry) }))));
}

/** Alumni, by last name. */
export async function alumni(): Promise<Alumnus[]> {
  return orderAlumni((await getCollection('alumni')).map((entry) => entry.data));
}
