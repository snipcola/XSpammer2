import { writable } from 'svelte/store';

export const logsActive = writable(true);
export const content = writable('home');