/**
 * PubMed adapter: turns a PubMed search into a clean, newest-first list of publications.
 * Uses NCBI E-utilities (esearch → esummary): https://www.ncbi.nlm.nih.gov/books/NBK25499/
 */
import { newestFirst, publicationSchema, type Publication } from '../../src/lib/publications-model.ts';

interface Options {
  fetch?: typeof globalThis.fetch;
  /** Pause between requests; NCBI allows 3 requests/second without an API key. */
  pauseMs?: number;
}

/** The parts of PubMed's JSON responses this adapter reads. */
interface EsearchResponse {
  esearchresult: { idlist: string[] };
}
interface EsummaryResponse {
  /** Keyed by PMID; a withdrawn or unavailable PMID has no record. */
  result: Record<string, EsummaryRecord | undefined>;
}
interface EsummaryRecord {
  uid: string;
  title: string;
  authors: { name: string }[];
  source: string;
  sortpubdate: string; // "2026/10/24 00:00"
  volume: string;
  issue: string;
  pages: string;
  articleids: { idtype: string; value: string }[];
}

const EUTILS = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const BATCH_SIZE = 200;
/** Errata are corrections, not papers; preprints duplicate their published versions. */
const EXCLUDED_TYPES = ' NOT "published erratum"[pt] NOT preprint[pt]';

/**
 * Every publication matching `query`, newest first.
 * Throws if PubMed is unreachable or returns a malformed record, so a bad refresh never overwrites a good list.
 */
export async function fetchPublications(
  query: string,
  { fetch = globalThis.fetch, pauseMs = 400 }: Options = {},
): Promise<Publication[]> {
  const getJson = async <T>(url: string): Promise<T> => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`PubMed request failed (${response.status}): ${url}`);
    return response.json();
  };

  const search = await getJson<EsearchResponse>(
    `${EUTILS}/esearch.fcgi?db=pubmed&retmode=json&retmax=10000&term=${encodeURIComponent(query + EXCLUDED_TYPES)}`,
  );
  const ids = search.esearchresult.idlist;

  // Batches run one after another (not in parallel) to stay within NCBI's rate limit.
  const publications: Publication[] = [];
  for (let start = 0; start < ids.length; start += BATCH_SIZE) {
    if (start > 0) await new Promise((resolve) => setTimeout(resolve, pauseMs));
    const batch = ids.slice(start, start + BATCH_SIZE);
    const summary = await getJson<EsummaryResponse>(`${EUTILS}/esummary.fcgi?db=pubmed&retmode=json&id=${batch.join(',')}`);
    for (const id of batch) {
      const record = summary.result[id];
      if (record) publications.push(toPublication(record));
    }
  }

  return publications.sort(newestFirst);
}

function toPublication(record: EsummaryRecord): Publication {
  const articleId = (type: string) => record.articleids.find((a) => a.idtype === type)?.value ?? null;
  const parsed = publicationSchema.safeParse({
    id: record.uid,
    title: plainText(record.title),
    authors: record.authors.map((a) => a.name),
    journal: record.source,
    date: record.sortpubdate.slice(0, 10).replaceAll('/', '-'),
    volume: record.volume,
    issue: record.issue,
    pages: record.pages,
    doi: articleId('doi'),
    pmcid: articleId('pmc'),
  });
  if (!parsed.success) throw new Error(`PubMed record ${record.uid} is malformed:\n${parsed.error.message}`);
  return parsed.data;
}

/** Titles can contain markup such as <i>E. coli</i> or &amp; — keep only the text. */
function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&amp;', '&')
    .trim();
}
