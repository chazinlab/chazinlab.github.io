/** The only reader of lab members and alumni: pages get render-ready models from here. */
import type { ImageMetadata } from 'astro';
import { getCollection } from 'astro:content';
import { byOrder, renderBody, type Rendered } from './content';

export interface Member {
  name: string;
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

/** Current members in `order`. */
export async function members(): Promise<Member[]> {
  const entries = (await getCollection('members')).sort(byOrder);
  return Promise.all(
    entries.map(async (entry) => {
      const { name, role, photo, email } = entry.data;
      return { name, role, photo, email, Bio: await renderBody(entry) };
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
