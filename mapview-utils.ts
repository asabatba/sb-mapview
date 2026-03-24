import type { WidgetRenderResult } from "./mapview-types.ts";

let mapInstanceCounter = 0;

export function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

export function decodeXmlEntities(value: string): string {
	return value
		.replaceAll("&amp;", "&")
		.replaceAll("&lt;", "<")
		.replaceAll("&gt;", ">")
		.replaceAll("&quot;", '"')
		.replaceAll("&apos;", "'");
}

export function buildError(message: string): WidgetRenderResult {
	return {
		html: `<pre style="color: #b42318; background: #fef3f2; padding: 0.75rem; border: 1px solid #fecdca; border-radius: 4px; white-space: pre-wrap;">${escapeHtml(
			message,
		)}</pre>`,
		script: "",
	};
}

export function createMapId(): string {
	mapInstanceCounter += 1;

	let randomPart = "";
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		randomPart = crypto.randomUUID();
	} else {
		randomPart = Math.random().toString(36).slice(2, 10);
	}

	return `mapview-${mapInstanceCounter}-${randomPart}`;
}

export function asString(value: unknown): string | undefined {
	return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
