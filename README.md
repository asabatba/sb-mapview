# SilverBullet Generic Map Plug

This plug adds a `gpxmap` code widget for rendering GPX files, GeoJSON files, and manual marker maps inside SilverBullet using Leaflet.

## Features

- Render GPX tracks with start and end markers
- Fall back to GPX waypoints when a GPX file has no trackpoints
- Load GeoJSON files from your SilverBullet space
- Render inline markers without any external file
- Support explicit `center` and `zoom`, with automatic fitting when `center` is omitted
- Insert a starter widget block with the `Map: Insert Widget` command

## Build

Install dependencies and compile the distributable plug:

```shell
npm install
npm run build
```

The build generates `gpxmap.plug.js`, which is the file referenced by `PLUG.md`.

## Install In SilverBullet

Publish this repository somewhere SilverBullet can access, then install the library from the `PLUG.md` URL with `Library: Install`.

If you are developing locally, place or symlink this folder into your SilverBullet space and make sure [`PLUG.md`](./PLUG.md) is available at `Library/gpxmap/PLUG`.

## Usage

The widget body accepts a JSON object.

Supported fields:

- `source`: path to a `.gpx`, `.geojson`, or `.json` file in your SilverBullet space
- `url`: backward-compatible alias for `source`
- `height`: CSS height for the map container, for example `400px` or `50vh`
- `center`: `[lat, lon]`
- `zoom`: numeric zoom level
- `markers`: array of marker objects with `lat`, `lon`, optional `label`, and optional `popup`

### GPX Example

````markdown
```gpxmap
{
  "source": "/hikes/my-route.gpx",
  "height": "400px"
}
```
````

### GeoJSON Example

````markdown
```gpxmap
{
  "source": "/maps/city.geojson",
  "height": "450px"
}
```
````

### Manual Marker Map

````markdown
```gpxmap
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
- If `center` is omitted, the widget fits all loaded overlays and inline markers
- If auto-fit resolves to a single point, the map centers that point at zoom `13`
- A map with only `center` and `zoom` is valid and renders a base map with no overlays

## Compatibility Notes

- Existing simple `url: /path/file.gpx` blocks still work for basic GPX usage
- GeoJSON styling uses Leaflet defaults in this version
- The widget loads Leaflet from the public CDN at runtime
