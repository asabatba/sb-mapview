import { DEFAULT_SOURCE_STYLE, DEFAULT_ZOOM } from "../config/constants.ts";
import type { MapViewAction, RenderPayload } from "../shared/types.ts";
import { RUNTIME_BUNDLE, RUNTIME_CSS } from "./generated-bundle.ts";

function buildRuntimeBootstrapScript(body: string): string {
	const css = JSON.stringify(RUNTIME_CSS);
	const bundle = JSON.stringify(RUNTIME_BUNDLE);

	return (
		`;(function(){` +
		`if(!document.getElementById("__mapview_style")){` +
		`var cs=document.createElement("style");` +
		`cs.id="__mapview_style";` +
		`cs.textContent=${css};` +
		`document.head.appendChild(cs);}` +
		body +
		`if(!document.getElementById("__mapview_bundle")){` +
		`var s=document.createElement("script");` +
		`s.id="__mapview_bundle";` +
		`s.textContent=${bundle};` +
		`document.head.appendChild(s);}` +
		`})();`
	);
}

export function createMapScript(payload: RenderPayload, mapId: string): string {
	const defaults = { sourceStyle: DEFAULT_SOURCE_STYLE, zoom: DEFAULT_ZOOM };
	const serializedMapId = JSON.stringify(mapId);
	const serializedPayload = JSON.stringify(payload);
	const serializedDefaults = JSON.stringify(defaults);

	return buildRuntimeBootstrapScript(
		`var m=${serializedMapId};` +
			`var p=${serializedPayload};` +
			`var d=${serializedDefaults};` +
			`if(typeof window.__mapviewInit==="function"){window.__mapviewInit(m,p,d);return;}` +
			`window.__mapview_q=window.__mapview_q||[];` +
			`window.__mapview_q.push([m,p,d]);`,
	);
}

export function createMapActionScript(action: MapViewAction): string {
	const serializedAction = JSON.stringify(action);

	return buildRuntimeBootstrapScript(
		`var a=${serializedAction};` +
			`if(typeof window.__mapviewDispatch==="function"){window.__mapviewDispatch(a);return;}` +
			`window.__mapview_action_q=window.__mapview_action_q||[];` +
			`window.__mapview_action_q.push(a);`,
	);
}
