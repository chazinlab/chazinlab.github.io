import { test } from 'node:test';
import assert from 'node:assert/strict';
import { byRoleThenLastName, initials } from './member-display.ts';

const roles = ['PI', 'Postdoc', 'Student'] as const;
type Role = (typeof roles)[number];

const sorted = (members: { role: Role; name: string }[]) =>
  members.sort(byRoleThenLastName(roles)).map((member) => member.name);

test('orders members by the position of their role in the list', () => {
  assert.deepEqual(
    sorted([
      { role: 'Student', name: 'Ann Abel' },
      { role: 'PI', name: 'Zed Zane' },
      { role: 'Postdoc', name: 'Max Moe' },
    ]),
    ['Zed Zane', 'Max Moe', 'Ann Abel'],
  );
});

test('orders members with the same role by last name, not first name', () => {
  assert.deepEqual(
    sorted([
      { role: 'Postdoc', name: 'Ann Young' },
      { role: 'Postdoc', name: 'Zed Abel' },
    ]),
    ['Zed Abel', 'Ann Young'],
  );
});

test('ignores a suffix such as ", Ph.D." when finding the last name', () => {
  assert.deepEqual(
    sorted([
      { role: 'Postdoc', name: 'Ann Young, Ph.D.' },
      { role: 'Postdoc', name: 'Zed Abel, Ph.D.' },
      { role: 'Postdoc', name: 'Max Moe' },
    ]),
    ['Zed Abel, Ph.D.', 'Max Moe', 'Ann Young, Ph.D.'],
  );
});

test('initials are the first letters of the first and last names', () => {
  assert.equal(initials('Walter J. Chazin'), 'WC');
  assert.equal(initials("Areetha D'Souza"), 'AD');
  assert.equal(initials('Elwood Mullins, Ph.D.'), 'EM');
  assert.equal(initials('Cher'), 'C');
});
