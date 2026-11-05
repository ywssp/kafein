import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { experimentStore } from '$lib/dummyData/experimentStore';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = ({ params }) => {
    const record = get(experimentStore).find((e) => e.id === params.id);
    if (!record) error(404, 'Recommendation not found');
    return { record };
};