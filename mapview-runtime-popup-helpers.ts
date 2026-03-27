export function createPopupHelpers() {
	const popupStyleStoreKey = "__mapviewPopupStyles";
	const defaultPopupClassName = "mapview-popup-default";

	function sanitizeCssValue(value: unknown): string {
		return String(value || "").replace(/[;{}\\]/g, "");
	}

	function sanitizeClassSegment(value: unknown): string {
		return String(value || "")
			.toLowerCase()
			.replace(/[^a-z0-9_-]+/g, "-")
			.replace(/^-+|-+$/g, "");
	}

	function ensurePopupStyleStore(): {
		element: HTMLStyleElement | null;
		rules: Record<string, boolean>;
	} {
		if (!(popupStyleStoreKey in globalThis)) {
			(globalThis as Record<string, unknown>)[popupStyleStoreKey] = {
				element: null,
				rules: {},
			};
		}

		const store = (
			globalThis as unknown as Record<
				string,
				{ element: HTMLStyleElement | null; rules: Record<string, boolean> }
			>
		)[popupStyleStoreKey] ?? {
			element: null,
			rules: {},
		};
		if (!store.element?.isConnected) {
			const style = document.createElement("style");
			style.setAttribute("data-mapview-popup-styles", "true");
			document.head.appendChild(style);
			store.element = style;
		}

		return store;
	}

	function appendPopupStyleRule(
		className: string,
		popupStyle?: {
			backgroundColor?: string;
			textColor?: string;
			borderColor?: string;
		},
	): void {
		if (!className) {
			return;
		}

		const store = ensurePopupStyleStore();
		if (store.rules[className]) {
			return;
		}

		const backgroundColor = sanitizeCssValue(
			popupStyle?.backgroundColor ? popupStyle.backgroundColor : "Canvas",
		);
		const textColor = sanitizeCssValue(
			popupStyle?.textColor ? popupStyle.textColor : "CanvasText",
		);
		const borderColor = sanitizeCssValue(
			popupStyle?.borderColor ? popupStyle.borderColor : backgroundColor,
		);

		store.element?.appendChild(
			document.createTextNode(
				`.maplibregl-popup.${className} .maplibregl-popup-content {` +
					`background:${backgroundColor};` +
					`color:${textColor};` +
					`border:1px solid ${borderColor};` +
					"box-shadow:0 10px 28px rgba(0, 0, 0, 0.18);" +
					"}" +
					`.maplibregl-popup.${className} .maplibregl-popup-close-button {` +
					`color:${textColor};` +
					"}" +
					`.maplibregl-popup.maplibregl-popup-anchor-top.${className} .maplibregl-popup-tip,` +
					`.maplibregl-popup.maplibregl-popup-anchor-top-left.${className} .maplibregl-popup-tip,` +
					`.maplibregl-popup.maplibregl-popup-anchor-top-right.${className} .maplibregl-popup-tip {` +
					`border-bottom-color:${backgroundColor};` +
					"}" +
					`.maplibregl-popup.maplibregl-popup-anchor-bottom.${className} .maplibregl-popup-tip,` +
					`.maplibregl-popup.maplibregl-popup-anchor-bottom-left.${className} .maplibregl-popup-tip,` +
					`.maplibregl-popup.maplibregl-popup-anchor-bottom-right.${className} .maplibregl-popup-tip {` +
					`border-top-color:${backgroundColor};` +
					"}" +
					`.maplibregl-popup.maplibregl-popup-anchor-left.${className} .maplibregl-popup-tip {` +
					`border-right-color:${backgroundColor};` +
					"}" +
					`.maplibregl-popup.maplibregl-popup-anchor-right.${className} .maplibregl-popup-tip {` +
					`border-left-color:${backgroundColor};` +
					"}",
			),
		);
		store.rules[className] = true;
	}

	function ensureDefaultPopupStyle(): void {
		appendPopupStyleRule(defaultPopupClassName, {
			backgroundColor: "Canvas",
			textColor: "CanvasText",
		});
	}

	function buildPopupClassName(
		marker: Record<string, unknown> | null,
		popupKey: string,
	): string {
		ensureDefaultPopupStyle();

		const classNames = [defaultPopupClassName];
		if (
			marker &&
			typeof marker.popupClassName === "string" &&
			marker.popupClassName
		) {
			classNames.push(marker.popupClassName);
		}

		if (
			marker &&
			(marker.popupBackgroundColor ||
				marker.popupTextColor ||
				marker.popupBorderColor)
		) {
			const generatedClassName = `mapview-popup-${sanitizeClassSegment(popupKey)}`;
			appendPopupStyleRule(generatedClassName, {
				backgroundColor:
					typeof marker.popupBackgroundColor === "string"
						? marker.popupBackgroundColor
						: undefined,
				textColor:
					typeof marker.popupTextColor === "string"
						? marker.popupTextColor
						: undefined,
				borderColor:
					typeof marker.popupBorderColor === "string"
						? marker.popupBorderColor
						: undefined,
			});
			classNames.push(generatedClassName);
		}

		return classNames.join(" ");
	}

	function buildPopupOptions(
		marker: Record<string, unknown>,
		popupClassName: string,
	): Record<string, unknown> {
		const options: Record<string, unknown> = {
			offset: 25,
			className: popupClassName,
		};

		if (typeof marker.popupMaxWidth === "string" && marker.popupMaxWidth) {
			options.maxWidth = marker.popupMaxWidth;
		}

		return options;
	}

	return {
		buildPopupClassName,
		buildPopupOptions,
		ensureDefaultPopupStyle,
	};
}
