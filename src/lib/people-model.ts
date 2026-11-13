/**
 * How people are placed and labelled on the People page: members by role, then last name, with
 * initials standing in for a missing photo; alumni by last name.
 *
 * Tested with plain Node, so this file must not import anything from 'astro:*'.
 */
import { roles } from '../content/people/roles.ts';

export type Role = (typeof roles)[number];

/**
 * The words of a name, without a suffix or a bracketed nickname:
 * "Elwood Mullins, Ph.D." → ["Elwood", "Mullins"]; "Yongseok (Sam) Cho" → ["Yongseok", "Cho"]
 */
const nameWords = (name: string): string[] =>
  name
    .split(',')[0]
    .replace(/\(.*?\)/g, ' ')
    .trim()
    .split(/\s+/);

/** First letter of the first and last names: "Walter J. Chazin" → "WC" */
function initials(name: string): string {
  const letters = nameWords(name).flatMap((word) => word.match(/\p{L}/u) ?? []);
  return letters.length > 1 ? letters[0] + letters.at(-1) : letters.join('');
}

/** Sort comparator: by last name, then by the whole name. */
const byLastName = (a: { name: string }, b: { name: string }): number =>
  nameWords(a.name).at(-1)!.localeCompare(nameWords(b.name).at(-1)!, 'en') || a.name.localeCompare(b.name, 'en');

/** Members in the order of the roles in src/content/people/roles.ts, then by last name; each with their initials. */
export function orderMembers<M extends { name: string; role: Role }>(members: readonly M[]): (M & { initials: string })[] {
  return members
    .toSorted((a, b) => roles.indexOf(a.role) - roles.indexOf(b.role) || byLastName(a, b))
    .map((member) => ({ ...member, initials: initials(member.name) }));
}

/** Alumni by last name. */
export const orderAlumni = <A extends { name: string }>(alumni: readonly A[]): A[] => alumni.toSorted(byLastName);
