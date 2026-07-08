import { pipeline, type FeatureExtractionPipeline } from '@xenova/transformers';

interface RubricEntry { id: string; r: string; }

interface SemanticResult {
  id: string;
  text: string;
  cat: string;
  score: number;
}

const DIM = 384;

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; embeddings: Float32Array; ids: string[]; cats: string[]; textMap: Map<string, string>; N: number; pipe: FeatureExtractionPipeline }
  | { status: 'error'; message: string };

let state: State = { status: 'idle' };
let initPromise: Promise<void> | null = null;

function float16toFloat32(h: number): number {
  const s = (h & 0x8000) >> 15;
  const e = (h & 0x7C00) >> 10;
  const f = h & 0x03FF;
  if (e === 0) return (s ? -1 : 1) * Math.pow(2, -14) * (f / 1024);
  if (e === 0x1F) return f ? NaN : (s ? -Infinity : Infinity);
  return (s ? -1 : 1) * Math.pow(2, e - 15) * (1 + f / 1024);
}

function normalize(v: Float32Array): Float32Array {
  let norm = 0;
  for (let i = 0; i < v.length; i++) norm += v[i] * v[i];
  norm = Math.sqrt(norm);
  if (norm === 0) return v;
  const out = new Float32Array(v.length);
  for (let i = 0; i < v.length; i++) out[i] = v[i] / norm;
  return out;
}

function dotProduct(emb: Float32Array, offset: number, qvec: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < DIM; i++) sum += emb[offset + i] * qvec[i];
  return sum;
}

async function loadEmbeddings(): Promise<void> {
  const [binBuf, meta, index] = await Promise.all([
    fetch('/data/rubric_embeddings.bin').then(r => { if (!r.ok) throw new Error('Failed to load embeddings'); return r.arrayBuffer(); }),
    fetch('/data/rubric_embeddings_meta.json').then(r => r.json()) as Promise<{ n: number; dim: number; ids: string[]; cats: string[] }>,
    fetch('/data/rubric_index.json').then(r => r.json()) as Promise<RubricEntry[]>,
  ]);

  const n = meta.n;
  const f16 = new Uint16Array(binBuf);
  const f32 = new Float32Array(n * DIM);
  for (let i = 0; i < f16.length; i++) f32[i] = float16toFloat32(f16[i]);

  const textMap = new Map<string, string>();
  for (const entry of index) textMap.set(entry.id, entry.r);

  // @ts-ignore -- pipeline overload types vary across versions
  const pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { quantized: true }) as FeatureExtractionPipeline;

  state = {
    status: 'ready',
    embeddings: f32,
    ids: meta.ids,
    cats: meta.cats,
    textMap,
    N: n,
    pipe,
  };
}

export function initSemantic(): Promise<void> {
  if (state.status === 'ready') return Promise.resolve();
  if (state.status === 'error') return Promise.reject(new Error((state as { status: 'error'; message: string }).message));
  if (initPromise) return initPromise;

  state = { status: 'loading' };
  initPromise = loadEmbeddings().catch((err: Error) => {
    state = { status: 'error', message: err.message };
    initPromise = null;
    throw err;
  });
  return initPromise;
}

export async function semanticSearch(query: string, topK = 10): Promise<SemanticResult[]> {
  if (state.status !== 'ready') throw new Error('Semantic search not initialised');

  const { embeddings, ids, cats, textMap, N, pipe } = state;

  // @ts-ignore -- Transformers.js output shape varies
  const output = await pipe(query, { pooling: 'mean', normalize: true });
  // @ts-ignore -- Transformers.js output shape varies
  const rawData: number[] | Float32Array = output.data ?? output[0]?.data;
  const qvec = normalize(new Float32Array(rawData));

  const sims = new Float32Array(N);
  for (let i = 0; i < N; i++) sims[i] = dotProduct(embeddings, i * DIM, qvec);

  const indices = Array.from({ length: N }, (_, i) => i);
  indices.sort((a, b) => sims[b] - sims[a]);

  return indices.slice(0, topK).map(i => ({
    id: ids[i],
    text: textMap.get(ids[i]) ?? ids[i],
    cat: cats[i],
    score: Math.round(sims[i] * 100),
  }));
}

export function getSemanticStatus(): 'idle' | 'loading' | 'ready' | 'error' {
  return state.status;
}
