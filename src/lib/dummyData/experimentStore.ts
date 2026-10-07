import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type ReportStatus = 'Active' | 'Paused' | 'Complete';

export type Experiment = {
    id: string;
    batch: string;
    package: string;
    start: string;
    status: ReportStatus;
    name?: string;
    initialMass?: number;
    preparation?: string;
    notes?: string;
    length?: number;
    width?: number;
    height?: number;
    volume?: number;
    duration?: number;
    interval?: number;
    sensorNode?: string;
};

// sample data muna
const defaultExperiments: Experiment[] = [
    { id: 'EXP-001', batch: 'SCG-001', package: 'Shoebox', start: 'Sep 20, 2026', status: 'Active' },
    { id: 'EXP-002', batch: 'SCG-002', package: 'Pouch', start: 'Sep 18, 2026', status: 'Complete' },
    { id: 'EXP-003', batch: 'SCG-003', package: 'Shoebox', start: 'Sep 15, 2026', status: 'Complete' },
    { id: 'EXP-004', batch: 'SCG-004', package: 'Crate', start: 'Sep 25, 2026', status: 'Paused' },
    { id: 'EXP-005', batch: 'SCG-005', package: 'Pouch', start: 'Oct 01, 2026', status: 'Paused' }
];

const storedData = browser ? window.localStorage.getItem('my_experiments') : null;
const initialData: Experiment[] = storedData ? JSON.parse(storedData) : defaultExperiments;

export const experimentStore = writable<Experiment[]>(initialData);

if (browser) {
    experimentStore.subscribe((value) => {
        window.localStorage.setItem('my_experiments', JSON.stringify(value));
    });
}

export function addActiveExperiment(newExperiment: Experiment) {
    experimentStore.update((list) => [
        { ...newExperiment, status: 'Active' },
        ...list.map((e) => (e.status === 'Active' ? { ...e, status: 'Paused' as const } : e))
    ]);
}

export function nextIds(list: Experiment[]) {
    const maxNum = (values: string[]) =>
        values.reduce((max, v) => Math.max(max, Number(v.match(/(\d+)$/)?.[1] ?? 0)), 0);
    const n = maxNum(list.map((e) => e.id)) + 1;
    const b = maxNum(list.map((e) => e.batch)) + 1;
    return {
        experimentId: `EXP-${String(n).padStart(3, '0')}`,
        batchId: `SCG-${String(b).padStart(3, '0')}`
    };
}

export function setExperimentStatus(id: string, status: ReportStatus) {
    experimentStore.update((list) =>
        list.map((e) => {
            if (e.id === id) return { ...e, status };
            // Making one experiment Active pauses whichever other one was Active
            if (status === 'Active' && e.status === 'Active') {
                return { ...e, status: 'Paused' as const };
            }
            return e;
        })
    );
}

export function updateExperiment(id: string, patch: Partial<Experiment>) {
    experimentStore.update((list) => list.map((e) => (e.id === id ? { ...e, ...patch } : e)));
}