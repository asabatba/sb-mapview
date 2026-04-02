import type { Map as MaplibreMap } from "maplibre-gl";
import type { RenderLayer } from "../shared/types.ts";

export type InitCallback = (map: MaplibreMap, mapId: string) => void;

export interface MapViewAPI {
	/** Lists all available map views */
	listViews(): string[];

	/** Resolves with the map instance once it has finished loading. */
	getMap(mapId: string): Promise<MaplibreMap>;

	/**
	 * Register a callback that fires every time a map finishes loading.
	 * Returns an unsubscribe function.
	 */
	onInit(callback: InitCallback): () => void;

	/**
	 * Replace the layers currently shown on a map.
	 * Has no effect if the map does not exist or has not finished loading.
	 */
	updateLayers(mapId: string, layers: RenderLayer[]): void;
}

const registry = new Map<string, MaplibreMap>();
const pending = new Map<string, Array<(map: MaplibreMap) => void>>();
const listeners: InitCallback[] = [];

export function notifyMapReady(mapId: string, map: MaplibreMap): void {
	registry.set(mapId, map);
	pending.get(mapId)?.forEach((resolve) => resolve(map));
	pending.delete(mapId);
	listeners.forEach((cb) => cb(map, mapId));
}

const api: MapViewAPI = {
	listViews() {
		return Array.from(registry.keys());
	},
	getMap(mapId) {
		const existing = registry.get(mapId);
		if (existing) return Promise.resolve(existing);
		return new Promise((resolve) => {
			const queue = pending.get(mapId) ?? [];
			queue.push(resolve);
			pending.set(mapId, queue);
		});
	},
	onInit(callback) {
		listeners.push(callback);
		return () => {
			const i = listeners.indexOf(callback);
			if (i !== -1) listeners.splice(i, 1);
		};
	},
	updateLayers(mapId, layers) {
		const fn = (globalThis as Record<string, unknown>).__mapviewUpdateLayers as
			| ((mapId: string, layers: RenderLayer[]) => void)
			| undefined;
		fn?.(mapId, layers);
	},
};

(globalThis as Record<string, unknown>).mapview = api;
