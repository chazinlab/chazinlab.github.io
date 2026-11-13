import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findByPmid, type Publication } from './publications-model.ts';
import { assembleThemes } from './research-model.ts';

const theme = (id: string, order: number) => ({ id, name: `Theme ${id}`, order, Summary: `About ${id}.` });

const project = (id: string, themeId: string, order: number, keyPapers: string[] = []) => ({
  id,
  theme: themeId,
  order,
  title: `Project ${id}`,
  caption: 'A figure.',
  Description: `About ${id}.`,
  keyPapers,
});

const paper = (id: string): Publication => ({
  id,
  title: 'A title.',
  authors: ['Chazin WJ'],
  journal: 'J Biol Chem',
  date: '2024-03-15',
  volume: '',
  issue: '',
  pages: '',
  doi: null,
  pmcid: null,
});

const noPapers = findByPmid([]);

test('lists themes by their order, each with its own projects by their order', () => {
  const themes = assembleThemes(
    [theme('immunity', 2), theme('genome', 1)],
    [project('s100', 'immunity', 1), project('radx', 'genome', 2), project('ner', 'genome', 1)],
    noPapers,
  );

  assert.deepEqual(
    themes.map((t) => [t.id, t.projects.map((p) => p.title)]),
    [
      ['genome', ['Project ner', 'Project radx']],
      ['immunity', ['Project s100']],
    ],
  );
});

test('a theme without projects is still listed', () => {
  const [genome] = assembleThemes([theme('genome', 1)], [], noPapers);

  assert.deepEqual(genome.projects, []);
});

test("gives each project its key papers in the order the project lists them", () => {
  const [genome] = assembleThemes(
    [theme('genome', 1)],
    [project('ner', 'genome', 1, ['3', '1'])],
    findByPmid([paper('1'), paper('2'), paper('3')]),
  );

  assert.deepEqual(
    genome.projects[0].keyPapers.map((p) => p.id),
    ['3', '1'],
  );
});

test('a key paper that is not in the publication list is an error naming the project file', () => {
  assert.throws(
    () => assembleThemes([theme('genome', 1)], [project('ner', 'genome', 1, ['999'])], noPapers),
    /PMID 999, listed in keyPapers in src\/content\/research\/ner\.md/,
  );
});

test('passes the rendered text of themes and projects through untouched', () => {
  const [genome] = assembleThemes([theme('genome', 1)], [project('ner', 'genome', 1)], noPapers);

  assert.equal(genome.Summary, 'About genome.');
  assert.equal(genome.projects[0].Description, 'About ner.');
});
