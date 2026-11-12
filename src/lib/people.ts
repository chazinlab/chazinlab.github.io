/** The only reader of lab members and alumni: pages get render-ready models from here. */
import type { ImageMetadata } from 'astro';
import { getCollection } from 'astro:content';
import { roles } from '../content/people/roles';
import { renderBody, type Rendered } from './content';
import { byRoleThenLastName, initials } from './member-display';

export interface Member {
  name: string;
  /** Shown in place of a missing photo. */
  initials: string;
  role: string;
  photo: ImageMetadata | undefined;
  email: string | undefined;
  Bio: Rendered;
}

export interface Alumnus {
  name: string;
  role: string;
  /** e.g. "2015–2020" */
  years: string;
  nowAt: string;
}

/** Current members, by role in the order set in src/content/people/roles.ts, then by last name. */
export async function members(): Promise<Member[]> {
  const inDisplayOrder = byRoleThenLastName(roles);
  const entries = (await getCollection('members')).sort((a, b) => inDisplayOrder(a.data, b.data));
  return Promise.all(
    entries.map(async (entry) => {
      const { name, role, photo, email } = entry.data;
      return { name, initials: initials(name), role, photo, email, Bio: await renderBody(entry) };
    }),
  );
}

/** Alumni, most recent departures first. */
export async function alumni(): Promise<Alumnus[]> {
  const entries = await getCollection('alumni');
  return entries
    .map((entry) => entry.data)
    .sort((a, b) => b.to - a.to || b.from - a.from)
    .map(({ name, role, from, to, nowAt }) => ({ name, role, years: `${from}–${to}`, nowAt }));
}
