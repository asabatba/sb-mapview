# SilverBullet MapView Plug

This plug adds a `mapview` code widget for rendering GPX files, GeoJSON files, and manual marker layers inside SilverBullet using bundled MapLibre GL JS.

## Features

- Render GPX tracks and waypoints
- Render GeoJSON files
- Render marker-only layers
- Compose maps through a single `layers` model
- Preview the active `mapview` block in the right-hand sidebar
- Configure a default basemap with `mapview.styleUrl`

## Compatibility

| Item | Value |
| --- | --- |
| SilverBullet | Tested against `@silverbulletmd/silverbullet` `2.5.3` |
| MapLibre GL JS | Bundled from `5.21.1` |
| Supported file types | `.gpx`, `.geojson`, `.json` |

## Development

Install dependencies and run the validation pipeline:

```shell
pnpm install
npm run check
```

Build the distributable plug:

```shell
npm run build
```

The build generates `mapview.plug.js`, which is the file referenced by `PLUG.md`.

Current repo layout:

- `src/index.ts`: SilverBullet entrypoint and host-side render pipeline
- `src/config/`: widget parsing and defaults
- `src/runtime/`: bundled browser runtime
- `src/sidebar/`: sidebar preview helpers
- `src/sources/`: GPX and GeoJSON loading/parsing
- `src/shared/`: shared types and utilities
- `test/`: lightweight tests

## Install In SilverBullet

Publish this repository somewhere SilverBullet can access, then install the library from the `PLUG.md` URL with `Library: Install`.

If you are developing locally, place or symlink this folder into your SilverBullet space and make sure `PLUG.md` is available at `Library/mapview/PLUG`.

## Commands

- `MapView: Insert Widget`
- `Map Sidebar: Toggle`

Typing `/mapview` in the editor inserts the starter block.

## Usage

The widget body must be a JSON object using the `layers` model.

Supported top-level fields:

- `layers`: array of file and marker layers
- `height`: CSS height for the map container, for example `400px` or `50vh`
- `center`: `[lat, lon]`
- `zoom`: numeric zoom level
- `styleUrl`: optional per-widget MapLibre style URL override
- `sourceStyle`: shared default style for file layers
- `markerStyle`: shared default style for marker layers
- `autoFit`: optional boolean, defaults to `true`
- `fitPadding`: optional numeric padding used for auto-fit
- `sourceCacheTtlMs`: optional shared cache TTL for file layers, defaults to `0`

File layers support:

- `path`
- `style`
- `visible`
- `popupProperty`
- `labelProperty`
- `showLabels`
- `showDirection`
- `sourceCacheTtlMs`

Marker layers support:

- `kind: "markers"`
- `markers`
- `style`
- `visible`

Source style fields:

- `lineColor`
- `lineWidth`
- `lineOpacity`
- `lineDasharray`
- `fillColor`
- `fillOpacity`
- `pointColor`
- `pointRadius`
- `pointStrokeColor`
- `pointStrokeWidth`
- `markerColor`
- `labelColor`
- `labelHaloColor`
- `labelHaloWidth`
- `labelSize`

Marker style fields:

- `color`
- `scale`
- `popupBackgroundColor`
- `popupTextColor`
- `popupBorderColor`
- `popupClassName`
- `popupMaxWidth`

### Example

````markdown
```mapview
{
  "height": "430px",
  "sourceCacheTtlMs": 0,
  "layers": [
    {
      "path": "/hikes/day-1.gpx",
      "style": {
        "lineColor": "#0f766e",
        "lineWidth": 4,
        "markerColor": "#0f766e"
      },
      "showDirection": true
    },
    {
      "path": "/maps/pois.geojson",
      "style": {
        "pointColor": "#dc2626",
        "fillColor": "#f59e0b",
        "labelColor": "#111827"
      },
      "popupProperty": "description",
      "labelProperty": "name",
      "showLabels": true
    },
    {
      "kind": "markers",
      "style": {
        "color": "#7c3aed",
        "popupBackgroundColor": "#111827",
        "popupTextColor": "#f8fafc"
      },
      "markers": [
        {
          "lat": 41.3874,
          "lon": 2.1686,
          "popup": "Barcelona"
        }
      ]
    }
  ]
}
```
````

## Sidebar

Toggle the sidebar with `Map Sidebar: Toggle`. When it is open, the plug previews the `mapview` block currently under the editor cursor. If the cursor is outside a `mapview` block, the sidebar shows a placeholder message.

## View Behavior

- If `center` is present, the map uses `center` and `zoom` or defaults to zoom `13`
- If `center` is omitted, the widget fits all visible overlays and markers
- If auto-fit resolves to a single point, the map centers that point at zoom `13`
- A map with only `center` and `zoom` is valid and renders a base map with no overlays

## Global Config

```lua
config.set("mapview.styleUrl", "https://demotiles.maplibre.org/style.json")
```

- `mapview.styleUrl` sets the default basemap style URL

If `mapview.styleUrl` is not set, the widget falls back to the OpenFreeMap Liberty style at `https://tiles.openfreemap.org/styles/liberty`.

## Migration From Legacy Config

Legacy top-level `source` and `markers` fields are no longer supported.

Before:

````markdown
```mapview
{
  "source": "/hikes/my-route.gpx"
}
```
````

After:

````markdown
```mapview
{
  "layers": [
    {
      "path": "/hikes/my-route.gpx"
    }
  ]
}
```
````

Before:

````markdown
```mapview
{
  "markers": [
    { "lat": 41.3874, "lon": 2.1686, "popup": "Barcelona" }
  ]
}
```
````

After:

````markdown
```mapview
{
  "layers": [
    {
      "kind": "markers",
      "markers": [
        { "lat": 41.3874, "lon": 2.1686, "popup": "Barcelona" }
      ]
    }
  ]
}
```
````

## Validation

The repo includes:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run check`
