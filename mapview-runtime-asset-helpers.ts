export function createMapLibreAssetHelpers() {
	const loaderStoreKey = "__mapviewMapLibreLoaders";
	const loadedConfigKey = "__mapviewLoadedMapLibreConfig";

	function normalizeAssetBaseUrl(
		assetBaseUrl: string | undefined,
	): string | undefined {
		const trimmed = assetBaseUrl?.trim();
		return trimmed ? trimmed.replace(/\/+$/, "") : undefined;
	}

	function createAssetConfigKey(
		maplibreVersion: string,
		assetBaseUrl?: string,
	): string {
		return `${maplibreVersion}::${normalizeAssetBaseUrl(assetBaseUrl) ?? "unpkg"}`;
	}

	function buildAssetUrls(
		maplibreVersion: string,
		assetBaseUrl?: string,
	): { cssHref: string; scriptSrc: string; assetConfigKey: string } {
		const normalizedBaseUrl = normalizeAssetBaseUrl(assetBaseUrl);
		if (normalizedBaseUrl) {
			return {
				cssHref: `${normalizedBaseUrl}/maplibre-gl.css`,
				scriptSrc: `${normalizedBaseUrl}/maplibre-gl.js`,
				assetConfigKey: createAssetConfigKey(
					maplibreVersion,
					normalizedBaseUrl,
				),
			};
		}

		return {
			cssHref: `https://unpkg.com/maplibre-gl@${maplibreVersion}/dist/maplibre-gl.css`,
			scriptSrc: `https://unpkg.com/maplibre-gl@${maplibreVersion}/dist/maplibre-gl.js`,
			assetConfigKey: createAssetConfigKey(maplibreVersion),
		};
	}

	function getLoaderStore(): Record<string, Promise<unknown>> {
		if (!(loaderStoreKey in globalThis)) {
			(globalThis as Record<string, unknown>)[loaderStoreKey] = {};
		}

		return (
			((globalThis as unknown as Record<string, unknown>)[
				loaderStoreKey
			] as Record<string, Promise<unknown>>) ?? {}
		);
	}

	function getMapLibreConfigError(
		activeConfigKey: string,
		requestedConfigKey: string,
	): Error {
		return new Error(
			`MapLibre GL JS ${activeConfigKey} is already active on this page. mapview supports only one MapLibre runtime configuration per page and cannot switch to ${requestedConfigKey}.`,
		);
	}

	function assertCompatibleLoadedRuntime(
		activeConfigKey: string | undefined,
		requestedConfigKey: string,
	): void {
		if (activeConfigKey && activeConfigKey !== requestedConfigKey) {
			throw getMapLibreConfigError(activeConfigKey, requestedConfigKey);
		}
	}

	function findVersionedAsset(
		assetConfigKey: string,
		tagName: string,
	): Element | null {
		const encodedKey = encodeURIComponent(assetConfigKey);
		return document.querySelector(
			`${tagName}[data-mapview-maplibre-key="${encodedKey}"]`,
		);
	}

	function loadMapLibre(
		maplibreVersion: string,
		assetBaseUrl?: string,
	): Promise<unknown> {
		const { assetConfigKey, cssHref, scriptSrc } = buildAssetUrls(
			maplibreVersion,
			assetBaseUrl,
		);
		const loaders = getLoaderStore();
		if (loaders[assetConfigKey]) {
			return loaders[assetConfigKey];
		}

		const activeConfigKeys = Object.keys(loaders).filter(
			(configKey) => configKey !== assetConfigKey,
		);
		if (activeConfigKeys.length > 0) {
			const activeConfigKey = activeConfigKeys[0];
			return Promise.reject(
				getMapLibreConfigError(
					activeConfigKey || assetConfigKey,
					assetConfigKey,
				),
			);
		}

		const activeLoadedConfigKey = (globalThis as Record<string, unknown>)[
			loadedConfigKey
		];
		if (
			typeof activeLoadedConfigKey === "string" &&
			"maplibregl" in globalThis
		) {
			try {
				assertCompatibleLoadedRuntime(activeLoadedConfigKey, assetConfigKey);
			} catch (error) {
				return Promise.reject(error);
			}
		}

		loaders[assetConfigKey] = new Promise((resolve, reject) => {
			const existingStylesheet = findVersionedAsset(assetConfigKey, "link");
			if (!existingStylesheet) {
				const link = document.createElement("link");
				link.rel = "stylesheet";
				link.href = cssHref;
				link.setAttribute(
					"data-mapview-maplibre-key",
					encodeURIComponent(assetConfigKey),
				);
				document.head.appendChild(link);
			}

			if (
				"maplibregl" in globalThis &&
				(globalThis as Record<string, unknown>)[loadedConfigKey] ===
					assetConfigKey
			) {
				resolve((globalThis as Record<string, unknown>).maplibregl);
				return;
			}

			let script = findVersionedAsset(
				assetConfigKey,
				"script",
			) as HTMLScriptElement | null;
			if (script?.getAttribute("data-mapview-status") === "error") {
				script.remove();
				script = null;
			}

			const handleLoad = () => {
				const targetScript = findVersionedAsset(
					assetConfigKey,
					"script",
				) as HTMLScriptElement | null;
				if (targetScript) {
					targetScript.setAttribute("data-mapview-status", "loaded");
				}

				if (!("maplibregl" in globalThis)) {
					handleError();
					return;
				}

				(globalThis as Record<string, unknown>)[loadedConfigKey] =
					assetConfigKey;
				resolve((globalThis as Record<string, unknown>).maplibregl);
			};

			const handleError = () => {
				const targetScript = findVersionedAsset(
					assetConfigKey,
					"script",
				) as HTMLScriptElement | null;
				if (targetScript) {
					targetScript.setAttribute("data-mapview-status", "error");
					targetScript.remove();
				}

				reject(
					new Error(
						`Failed to load MapLibre GL JS ${maplibreVersion} from ${scriptSrc}.`,
					),
				);
			};

			if (script) {
				if (
					script.getAttribute("data-mapview-status") === "loaded" &&
					"maplibregl" in globalThis
				) {
					(globalThis as Record<string, unknown>)[loadedConfigKey] =
						assetConfigKey;
					resolve((globalThis as Record<string, unknown>).maplibregl);
					return;
				}

				script.addEventListener("load", handleLoad, { once: true });
				script.addEventListener("error", handleError, { once: true });
				return;
			}

			script = document.createElement("script");
			script.src = scriptSrc;
			script.setAttribute(
				"data-mapview-maplibre-key",
				encodeURIComponent(assetConfigKey),
			);
			script.setAttribute("data-mapview-status", "loading");
			script.addEventListener("load", handleLoad, { once: true });
			script.addEventListener("error", handleError, { once: true });
			document.head.appendChild(script);
		}).catch((error) => {
			delete loaders[assetConfigKey];
			throw error;
		});

		return loaders[assetConfigKey];
	}

	return {
		assertCompatibleLoadedRuntime,
		buildAssetUrls,
		createAssetConfigKey,
		loadMapLibre,
	};
}
