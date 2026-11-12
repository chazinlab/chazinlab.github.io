/**
 * How a member is placed and labelled on the People page: by role, then last name, with initials
 * standing in for a missing photo.
 *
 * Tested with plain Node, so this file must not import anything from 'astro:*'.
 */

/** The words of a name without any suffix: "Elwood Mullins, Ph.D." → ["Elwood", "Mullins"] */
const nameWords = (name: string): string[] => name.split(',')[0].trim().split(/\s+/);

const lastName = (name: string): string => nameWords(name).at(-1)!;

/** First letter of the first and last names: "Walter J. Chazin" → "WC" */
export function initials(name: string): string {
  const letters = nameWords(name).flatMap((word) => word.match(/\p{L}/u) ?? []);
  return letters.length > 1 ? letters[0] + letters.at(-1) : letters.join('');
}

/** Sort comparator: members in the order of `roles`, and by last name within a role. */
export const byRoleThenLastName =
  <Role extends string>(roles: readonly Role[]) =>
  (a: { role: Role; name: string }, b: { role: Role; name: string }): number =>
    roles.indexOf(a.role) - roles.indexOf(b.role) ||
    lastName(a.name).localeCompare(lastName(b.name)) ||
    a.name.localeCompare(b.name);
