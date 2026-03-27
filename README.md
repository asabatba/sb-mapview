# SilverBullet MapView Plug

This plug adds a `mapview` code widget for rendering GPX files, GeoJSON files, and marker layers inside SilverBullet using MapLibre GL JS.

## Features

- Render GPX tracks, GPX waypoints, GeoJSON, and marker-only maps
- Support additive `layers` config while keeping legacy `source` and `markers` configs working
- Show richer GeoJSON popups from feature properties such as `popup`, `description`, `name`, `title`, and `label`
- Render point labels from GeoJSON properties with per-layer `labelProperty` and `showLabels`
- Load MapLibre assets from the public CDN or from a self-hosted asset base URL
- Control source refresh behavior with `sourceCacheTtlMs`
- Insert starter widgets from the command palette or slash completion

## Compatibility

| Item | Value |
| --- | --- |
| SilverBullet | Tested against `@silverbulletmd/silverbullet` `2.5.3` |
| MapLibre GL JS | Runtime default `5.21.1` |
| Supported file types | `.gpx`, `.geojson`, `.json` |
| Known limits | One MapLibre runtime configuration per page, labels are point-only, runtime assets still need network access unless self-hosted |

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

## Install In SilverBullet

Publish this repository somewhere SilverBullet can access, then install the library from the `PLUG.md` URL with `Library: Install`.

If you are developing locally, place or symlink this folder into your SilverBullet space and make sure [`PLUG.md`](./PLUG.md) is available at `Library/mapview/PLUG`.

## Commands

- `MapView: Insert Widget`
- `MapView: Insert GPX Widget`
- `MapView: Insert GeoJSON Widget`
- `MapView: Insert Marker Widget`

Typing `/mapview` in the editor also exposes the starter blocks through slash completion.

## Usage

The widget body must be a JSON object.

### Recommended `layers` Model

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
- `maplibreVersion`: optional per-page MapLibre version override
- `maplibreAssetBaseUrl`: optional per-widget base URL for self-hosted `maplibre-gl.js` and `maplibre-gl.css`
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

### Layered Example

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

### Legacy Compatibility

Legacy `source` and `markers` widgets still work. They are normalized internally into the new `layers` model.

````markdown
```mapview
{
  "source": "/hikes/my-route.gpx",
  "height": "400px"
}
```
````

## View Behavior

- If `center` is present, the map uses `center` and `zoom` or defaults to zoom `13`
- If `center` is omitted, the widget fits all visible overlays and markers
- If auto-fit resolves to a single point, the map centers that point at zoom `13`
- A map with only `center` and `zoom` is valid and renders a base map with no overlays

## Global Config

```lua
config.set("mapview.styleUrl", "https://demotiles.maplibre.org/style.json")
config.set("mapview.maplibreVersion", "5.21.1")
config.set("mapview.maplibreAssetBaseUrl", "https://cdn.example.com/maplibre")
```

- `mapview.styleUrl` sets the default basemap style URL
- `mapview.maplibreVersion` sets the default MapLibre GL JS version
- `mapview.maplibreAssetBaseUrl` points to a directory containing `maplibre-gl.js` and `maplibre-gl.css`

If `mapview.styleUrl` is not set, the widget falls back to the OpenFreeMap Liberty style at `https://tiles.openfreemap.org/styles/liberty`.

If `mapview.maplibreAssetBaseUrl` is not set, the widget loads MapLibre GL JS from `unpkg`.

## Deployment Notes

- Public hosting: publish the repository and keep `PLUG.md` plus `mapview.plug.js` accessible to SilverBullet.
- Local development: symlink the repo into your SilverBullet space and rebuild after source changes.
- Self-hosted assets: serve `maplibre-gl.js` and `maplibre-gl.css` from your own static host and set `mapview.maplibreAssetBaseUrl` or `maplibreAssetBaseUrl`.
- Source refresh: the default `sourceCacheTtlMs` is `0`, so re-renders always read fresh file content unless you opt into caching.

## Validation

The repo now includes:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run check`

CI runs lint, typecheck, tests, and build verification on pushes and pull requests.
