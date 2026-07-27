const MAPVIEW_BLOCK_PATTERN = /^```mapview[^\n]*\r?\n([\s\S]*?)\r?\n```/gm;

export const SIDEBAR_MAP_ID = "mapview-sidebar";
export const SIDEBAR_HEIGHT = "100vh";

export function findActiveMapViewWidget(
	documentText: string,
	cursor: number,
): string | undefined {
	const safeCursor = Math.max(0, Math.min(cursor, documentText.length));

	for (const match of documentText.matchAll(MAPVIEW_BLOCK_PATTERN)) {
		const matchedText = match[0];
		const widgetBody = match[1];
		if (!matchedText || widgetBody === undefined) {
			continue;
		}

		const start = match.index ?? 0;
		const end = start + matchedText.length;
		if (safeCursor >= start && safeCursor <= end) {
			return widgetBody;
		}
	}

	return undefined;
}

export function buildSidebarPlaceholderHtml(): string {
	return [
		'<div style="padding: 1rem; color: #475467; font: 14px/1.5 system-ui, sans-serif;">',
		"Move the cursor inside a <code>mapview</code> block to preview it in the sidebar.",
		"</div>",
	].join("");
}
