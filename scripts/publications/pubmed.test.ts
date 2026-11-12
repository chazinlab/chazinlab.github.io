import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchPublications } from './pubmed.ts';

/**
 * A stand-in for PubMed: answers esearch and esummary from fixed data.
 * `ids` is what esearch reports; by default, every record's PMID.
 */
function fakePubMed(records: Record<string, object>, ids = Object.keys(records)) {
  const requests: string[] = [];
  const fetch = async (input: string | URL | Request) => {
    const url = String(input);
    requests.push(url);
    const body = url.includes('esearch') ? { esearchresult: { idlist: ids } } : { result: records };
    return new Response(JSON.stringify(body));
  };
  return { fetch: fetch as typeof globalThis.fetch, requests };
}

const record = (uid: string, overrides: object = {}) => ({
  uid,
  title: 'A title.',
  authors: [{ name: 'Smith J' }, { name: 'Chazin WJ' }],
  source: 'J Biol Chem',
  sortpubdate: '2024/03/15 00:00',
  volume: '300',
  issue: '4',
  pages: '105-12',
  articleids: [{ idtype: 'pubmed', value: uid }],
  ...overrides,
});

test('normalizes PubMed records into publications', async () => {
  const { fetch } = fakePubMed({
    '111': record('111', {
      title: 'Zinc binding by <i>S100A9</i> &amp; calprotectin.',
      articleids: [
        { idtype: 'doi', value: '10.1000/xyz' },
        { idtype: 'pmc', value: 'PMC123' },
      ],
    }),
  });

  const [pub] = await fetchPublications('Chazin WJ[Author]', { fetch, pauseMs: 0 });

  assert.deepEqual(pub, {
    id: '111',
    title: 'Zinc binding by S100A9 & calprotectin.',
    authors: ['Smith J', 'Chazin WJ'],
    journal: 'J Biol Chem',
    date: '2024-03-15',
    year: 2024,
    volume: '300',
    issue: '4',
    pages: '105-12',
    doi: '10.1000/xyz',
    pmcid: 'PMC123',
  });
});

test('missing DOI and PMC links become null', async () => {
  const { fetch } = fakePubMed({ '111': record('111') });
  const [pub] = await fetchPublications('q', { fetch, pauseMs: 0 });
  assert.equal(pub.doi, null);
  assert.equal(pub.pmcid, null);
});

test('sorts newest first', async () => {
  const { fetch } = fakePubMed({
    '1': record('1', { sortpubdate: '2019/01/01 00:00' }),
    '2': record('2', { sortpubdate: '2025/06/01 00:00' }),
    '3': record('3', { sortpubdate: '2021/01/01 00:00' }),
  });
  const pubs = await fetchPublications('q', { fetch, pauseMs: 0 });
  assert.deepEqual(pubs.map((p) => p.id), ['2', '3', '1']);
});

test('excludes errata and preprints in the search itself', async () => {
  const { fetch, requests } = fakePubMed({});
  await fetchPublications('Chazin WJ[Author]', { fetch, pauseMs: 0 });
  const term = decodeURIComponent(new URL(requests[0]).searchParams.get('term') ?? '');
  assert.equal(term, 'Chazin WJ[Author] NOT "published erratum"[pt] NOT preprint[pt]');
});

test('skips PMIDs that PubMed returns no summary for (e.g. withdrawn papers)', async () => {
  const { fetch } = fakePubMed({ '111': record('111') }, ['111', '999']);
  const pubs = await fetchPublications('q', { fetch, pauseMs: 0 });
  assert.deepEqual(pubs.map((p) => p.id), ['111']);
});

test('rejects a malformed record instead of saving bad data', async () => {
  const { fetch } = fakePubMed({ '111': record('111', { sortpubdate: '' }) });
  await assert.rejects(fetchPublications('q', { fetch, pauseMs: 0 }), /PubMed record 111 is malformed/);
});

test('requests summaries in batches of 200', async () => {
  const records = Object.fromEntries(
    Array.from({ length: 450 }, (_, i) => [String(i + 1), record(String(i + 1))]),
  );
  const { fetch, requests } = fakePubMed(records);
  const pubs = await fetchPublications('q', { fetch, pauseMs: 0 });
  assert.equal(pubs.length, 450);
  assert.equal(requests.filter((url) => url.includes('esummary')).length, 3);
});
