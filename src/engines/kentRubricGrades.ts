type RubricGrades = Record<string, [string, number][]>;

let cache: RubricGrades | null = null;
let loading = false;
let loadPromise: Promise<void> | null = null;

export function getKentGrades(rubricId: string): [string, number][] {
  return cache?.[rubricId] ?? [];
}

export function isKentGradesReady(): boolean {
  return cache !== null;
}

export function preloadKentGrades(): Promise<void> {
  if (cache !== null) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loading = true;
  loadPromise = fetch('/data/kent_rubric_grades.json')
    .then(r => r.json())
    .then((data: RubricGrades) => {
      cache = data;
      loading = false;
    })
    .catch(() => {
      cache = {};
      loading = false;
    });
  return loadPromise;
}

export function getKentLoadingState(): 'idle' | 'loading' | 'ready' {
  if (cache !== null) return 'ready';
  if (loading) return 'loading';
  return 'idle';
}
