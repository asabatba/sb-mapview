# SilverBullet GPX Map Plug

This plug adds a `gpxmap` code widget for rendering GPX tracks or waypoints inside SilverBullet using Leaflet.

## Features

- Render GPX track data as a polyline with start and end markers
- Fall back to GPX waypoints when a file has no trackpoints
- Insert a widget block with the `GPX: Insert Map Widget` command
- Show clear in-widget errors for missing files, invalid GPX, or empty coordinate data

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

Insert a code block like this:

````markdown
```gpxmap
url: /hikes/my-route.gpx
height: 400px
```
````

Supported fields:

- `url`: path to a GPX file in your SilverBullet space
- `height`: CSS height for the map container, for example `400px` or `50vh`

You can also run the `GPX: Insert Map Widget` command and fill in the prompts.

## Notes

- The widget loads Leaflet from the public CDN at runtime.
- The current implementation reads `trkpt` elements first and falls back to `wpt` elements if no trackpoints are present.
