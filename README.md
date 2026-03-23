# SilverBullet MapView Plug

This plug adds a `mapview` code widget for rendering GPX files, GeoJSON files, and manual marker maps inside SilverBullet using MapLibre GL JS.

## Features

- Render GPX tracks with start and end markers
- Fall back to GPX waypoints when a GPX file has no trackpoints
- Load GeoJSON files from your SilverBullet space
- Render inline markers without any external file
- Support explicit `center` and `zoom`, with automatic fitting when `center` is omitted
- Insert a starter widget block with the `MapView: Insert Widget` command

## Build

Install dependencies and compile the distributable plug:

```shell
npm install
npm run build
```

The build generates `mapview.plug.js`, which is the file referenced by `PLUG.md`.

## Install In SilverBullet

Publish this repository somewhere SilverBullet can access, then install the library from the `PLUG.md` URL with `Library: Install`.

If you are developing locally, place or symlink this folder into your SilverBullet space and make sure [`PLUG.md`](./PLUG.md) is available at `Library/mapview/PLUG`.

## Usage

The widget body accepts a JSON object.

Supported fields:

- `source`: a string path, a source object, or an array mixing both
- `url`: backward-compatible alias for a single string `source`
- `height`: CSS height for the map container, for example `400px` or `50vh`
- `center`: `[lat, lon]`
- `zoom`: numeric zoom level
- `styleUrl`: optional per-widget MapLibre style URL override
- `sourceStyle`: shared style applied to all file-based sources unless a source overrides it
- `markerStyle`: shared style applied to inline markers unless a marker overrides it
- `markers`: array of marker objects with `lat`, `lon`, optional `label`, `popup`, `color`, and `scale`

Source objects use this shape:

```json
{
  "path": "/maps/city.geojson",
  "style": {
    "lineColor": "#2563eb",
    "lineWidth": 4,
    "lineOpacity": 0.9,
    "fillColor": "#3b82f6",
    "fillOpacity": 0.2,
    "pointColor": "#dc2626",
    "pointRadius": 6,
    "markerColor": "#0f766e"
  }
}
```

### MapView Example

````markdown
```mapview
{
  "source": "/hikes/my-route.gpx",
  "height": "400px"
}
```
````

### GeoJSON Example

````markdown
```mapview
{
  "source": "/maps/city.geojson",
  "height": "450px"
}
```
````

### Multi-Source Map

````markdown
```mapview
{
  "sourceStyle": {
    "lineWidth": 4,
    "lineOpacity": 0.8
  },
  "source": [
    {
      "path": "/hikes/day-1.gpx",
      "style": {
        "lineColor": "#0f766e",
        "markerColor": "#0f766e"
      }
    },
    "/hikes/day-2.gpx",
    {
      "path": "/maps/waypoints.geojson",
      "style": {
        "pointColor": "#dc2626",
        "fillColor": "#f59e0b"
      }
    }
  ],
  "height": "450px"
}
```
````

### Per-Widget Basemap Override

````markdown
```mapview
{
  "styleUrl": "https://demotiles.maplibre.org/style.json",
  "source": "/hikes/my-route.gpx",
  "height": "400px"
}
```
````

### Styled Inline Markers

````markdown
```mapview
{
  "height": "400px",
  "center": [41.3874, 2.1686],
  "zoom": 13,
  "markerStyle": {
    "color": "#7c3aed",
    "scale": 1.05
  },
  "markers": [
    {
      "lat": 41.3874,
      "lon": 2.1686,
      "popup": "Barcelona"
    },
    {
      "lat": 41.4036,
      "lon": 2.1744,
      "label": "Sagrada Familia",
      "color": "#dc2626",
      "scale": 1.2
    }
  ]
}
```
````

## View Behavior

- If `center` is present, the map uses `center` and `zoom` or defaults to zoom `13`
- If `center` is omitted, the widget fits all loaded overlays and inline markers, including multiple source files
- If auto-fit resolves to a single point, the map centers that point at zoom `13`
- A map with only `center` and `zoom` is valid and renders a base map with no overlays

## Global Config

The basemap is configured with a global MapLibre style URL. Individual widgets can override it with `styleUrl`.

```lua
config.set("mapview.styleUrl", "https://demotiles.maplibre.org/style.json")
```

If `mapview.styleUrl` is not set, the widget falls back to the official MapLibre demo style.

## Compatibility Notes

- Existing simple `url: /path/file.gpx` blocks still work for basic GPX usage
- Existing legacy ````gpxmap` blocks still render, but new usage should prefer `mapview`
- `source` objects, `sourceStyle`, `markerStyle`, and per-widget `styleUrl` are JSON-only features
- The widget loads MapLibre GL JS from the public CDN at runtime
