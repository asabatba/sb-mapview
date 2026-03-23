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

- `source`: a path or array of paths to `.gpx`, `.geojson`, or `.json` files in your SilverBullet space
- `url`: backward-compatible alias for `source`
- `height`: CSS height for the map container, for example `400px` or `50vh`
- `center`: `[lat, lon]`
- `zoom`: numeric zoom level
- `markers`: array of marker objects with `lat`, `lon`, optional `label`, and optional `popup`

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
  "source": [
    "/hikes/day-1.gpx",
    "/hikes/day-2.gpx",
    "/maps/waypoints.geojson"
  ],
  "height": "450px"
}
```
````

### Manual Marker Map

````markdown
```mapview
{
  "height": "400px",
  "center": [41.3874, 2.1686],
  "zoom": 13,
  "markers": [
    {
      "lat": 41.3874,
      "lon": 2.1686,
      "popup": "Barcelona"
    },
    {
      "lat": 41.4036,
      "lon": 2.1744,
      "label": "Sagrada Familia"
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

The basemap is configured with a global MapLibre style URL:

```lua
config.set("mapview.styleUrl", "https://demotiles.maplibre.org/style.json")
```

If `mapview.styleUrl` is not set, the widget falls back to the official MapLibre demo style.

## Compatibility Notes

- Existing simple `url: /path/file.gpx` blocks still work for basic GPX usage
- Existing legacy ````gpxmap` blocks still render, but new usage should prefer `mapview`
- GeoJSON styling uses MapLibre defaults in this version
- The widget loads MapLibre GL JS from the public CDN at runtime
