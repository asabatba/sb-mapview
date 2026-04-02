import { DEFAULT_SOURCE_STYLE, DEFAULT_ZOOM } from "../config/constants.ts";
import { RUNTIME_BUNDLE, RUNTIME_CSS } from "./generated-bundle.ts";
import type { RenderPayload } from "../shared/types.ts";

export function createMapScript(payload: RenderPayload, mapId: string): string {
	const defaults = { sourceStyle: DEFAULT_SOURCE_STYLE, zoom: DEFAULT_ZOOM };
	const m = JSON.stringify(mapId);
	const p = JSON.stringify(payload);
	const d = JSON.stringify(defaults);
	const css = JSON.stringify(RUNTIME_CSS);
	const bundle = JSON.stringify(RUNTIME_BUNDLE);

	// The generated script:
	// 1. Injects MapLibre CSS once (deduplicated by element ID).
	// 2. If the runtime bundle is already loaded, calls __mapviewInit directly.
	// 3. Otherwise, queues the call and injects the bundle script tag once.
	//    Inline script tags execute synchronously, so __mapviewInit is defined
	//    and the queue is flushed before control returns.
	return `;(function(){` +
		`if(!document.getElementById("__mapview_style")){` +
		`var cs=document.createElement("style");` +
		`cs.id="__mapview_style";` +
		`cs.textContent=${css};` +
		`document.head.appendChild(cs);}` +
		`var m=${m};var p=${p};var d=${d};` +
		`if(typeof window.__mapviewInit==="function"){window.__mapviewInit(m,p,d);return;}` +
		`window.__mapview_q=window.__mapview_q||[];` +
		`window.__mapview_q.push([m,p,d]);` +
		`if(!document.getElementById("__mapview_bundle")){` +
		`var s=document.createElement("script");` +
		`s.id="__mapview_bundle";` +
		`s.textContent=${bundle};` +
		`document.head.appendChild(s);}` +
		`})();`;
}
