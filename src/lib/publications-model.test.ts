import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  citationSource,
  featured,
  findByPmid,
  groupByYear,
  isPi,
  searchText,
  type Publication,
} from './publications-model.ts';

const publication = (id: string, overrides: Partial<Publication> = {}): Publication => ({
  id,
  title: 'A title.',
  authors: ['Smith J', 'Chazin WJ'],
  journal: 'J Biol Chem',
  date: '2024-03-15',
  volume: '300',
  issue: '4',
  pages: '105-12',
  doi: null,
  pmcid: null,
  ...overrides,
});

const ids = (publications: Publication[]) => publications.map((pub) => pub.id);

test('groups publications by year, newest year and newest paper first', () => {
  const groups = groupByYear([
    publication('1', { date: '2023-06-01' }),
    publication('2', { date: '2024-01-10' }),
    publication('3', { date: '2024-11-30' }),
    publication('4', { date: '2022-02-02' }),
  ]);

  assert.deepEqual(
    groups.map((group) => [group.year, ids(group.publications)]),
    [
      [2024, ['3', '2']],
      [2023, ['1']],
      [2022, ['4']],
    ],
  );
});

test('finds publications by PMID in the order asked for', () => {
  const find = findByPmid([publication('1'), publication('2'), publication('3')]);

  assert.deepEqual(ids(find(['3', '1'], 'a test')), ['3', '1']);
});

test('an unknown PMID is an error that says where it is listed', () => {
  const find = findByPmid([publication('1')]);

  assert.throws(() => find(['1', '999'], 'research project "rpa"'), /PMID 999, listed in research project "rpa"/);
});

test('the home page shows the featured papers in the order chosen', () => {
  const list = featured([publication('1'), publication('2'), publication('3')], ['2', '3']);

  assert.equal(list.heading, 'Featured Publications');
  assert.deepEqual(ids(list.publications), ['2', '3']);
});

test('the home page shows the five most recent papers until any are featured', () => {
  const sixPapers = ['1', '2', '3', '4', '5', '6'].map((id) => publication(id, { date: `2024-01-0${id}` }));

  const list = featured(sixPapers, []);

  assert.equal(list.heading, 'Recent Publications');
  assert.deepEqual(ids(list.publications), ['6', '5', '4', '3', '2']);
});

test('only the PI, exactly as PubMed writes the name, counts as the PI', () => {
  assert.equal(isPi('Chazin WJ'), true);
  assert.equal(isPi('Chazin W'), false);
  assert.equal(isPi('Smith J'), false);
});

test('writes the source in PubMed citation style, leaving out parts PubMed does not have', () => {
  assert.equal(citationSource(publication('1')), '2024;300(4):105-12.');
  assert.equal(citationSource(publication('1', { issue: '' })), '2024;300:105-12.');
  assert.equal(citationSource(publication('1', { volume: '', issue: '4' })), '2024;(4):105-12.');
  assert.equal(citationSource(publication('1', { volume: '', issue: '' })), '2024:105-12.');
  assert.equal(citationSource(publication('1', { volume: '', issue: '', pages: '' })), '2024.');
});

test('search text holds the title, authors, journal, year and PMID in lower case', () => {
  assert.equal(searchText(publication('42')), 'a title. smith j chazin wj j biol chem 2024 42');
});
