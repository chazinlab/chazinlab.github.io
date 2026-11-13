import { test } from 'node:test';
import assert from 'node:assert/strict';
import { roles } from '../content/people/roles.ts';
import { orderAlumni, orderMembers, type Role } from './people-model.ts';

const names = (people: { name: string }[]) => people.map((person) => person.name);
const member = (name: string, role: Role) => ({ name, role });

test('orders members by the position of their role in roles.ts', () => {
  const oneOfEach = roles.map((role, i) => member(`Person ${String.fromCharCode(90 - i)}`, role));

  assert.deepEqual(
    orderMembers(oneOfEach.toReversed()).map((m) => m.role),
    roles,
  );
});

test('orders members with the same role by last name, not first name', () => {
  assert.deepEqual(
    names(orderMembers([member('Ann Young', 'Postdoctoral Fellow'), member('Zed Abel', 'Postdoctoral Fellow')])),
    ['Zed Abel', 'Ann Young'],
  );
});

test('ignores a suffix such as ", Ph.D." when finding the last name', () => {
  assert.deepEqual(
    names(
      orderMembers([
        member('Ann Young, Ph.D.', 'Postdoctoral Fellow'),
        member('Zed Abel, Ph.D.', 'Postdoctoral Fellow'),
        member('Max Moe', 'Postdoctoral Fellow'),
      ]),
    ),
    ['Zed Abel, Ph.D.', 'Max Moe', 'Ann Young, Ph.D.'],
  );
});

test('gives each member the first letters of their first and last names as initials', () => {
  const initialsOf = (name: string) => orderMembers([member(name, 'Graduate Student')])[0].initials;

  assert.equal(initialsOf('Walter J. Chazin'), 'WC');
  assert.equal(initialsOf("Areetha D'Souza"), 'AD');
  assert.equal(initialsOf('Elwood Mullins, Ph.D.'), 'EM');
  assert.equal(initialsOf('Cher'), 'C');
});

test('keeps every other setting of a member', () => {
  const [walter] = orderMembers([{ ...member('Walter Chazin', 'Principal Investigator'), email: 'w@example.edu' }]);

  assert.equal(walter.email, 'w@example.edu');
});

test('orders alumni by last name, ignoring a bracketed nickname or former name', () => {
  assert.deepEqual(
    names(
      orderAlumni([
        { name: 'Lena Mäler' },
        { name: 'Kateryna Le Meur (Ogorodnik)' },
        { name: 'Yongseok (Sam) Cho' },
        { name: 'Georges Mer' },
        { name: 'Mikael Akke' },
      ]),
    ),
    ['Mikael Akke', 'Yongseok (Sam) Cho', 'Lena Mäler', 'Georges Mer', 'Kateryna Le Meur (Ogorodnik)'],
  );
});
