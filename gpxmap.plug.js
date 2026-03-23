var D=Object.defineProperty;var m=(e,r)=>{for(var o in r)D(e,o,{get:r[o],enumerable:!0})};function G(e){let r=atob(e),o=r.length,n=new Uint8Array(o);for(let i=0;i<o;i++)n[i]=r.charCodeAt(i);return n}function b(e){typeof e=="string"&&(e=new TextEncoder().encode(e));let r="",o=e.byteLength;for(let n=0;n<o;n++)r+=String.fromCharCode(e[n]);return btoa(r)}var _r=new Uint8Array(16),j=class{constructor(e="",r=1e3){this.prefix=e,this.maxCaptureSize=r,this.prefix=e,this.originalConsole={log:console.log.bind(console),info:console.info.bind(console),warn:console.warn.bind(console),error:console.error.bind(console),debug:console.debug.bind(console)},this.patchConsole()}originalConsole;logBuffer=[];patchConsole(){let e=r=>(...o)=>{let n=this.prefix?[this.prefix,...o]:o;this.originalConsole[r](...n),this.captureLog(r,o)};console.log=e("log"),console.info=e("info"),console.warn=e("warn"),console.error=e("error"),console.debug=e("debug")}captureLog(e,r){let o={level:e,timestamp:Date.now(),message:r.map(n=>{if(typeof n=="string")return n;try{return JSON.stringify(n)}catch{return String(n)}}).join(" ")};this.logBuffer.push(o),this.logBuffer.length>this.maxCaptureSize&&this.logBuffer.shift()}async postToServer(e,r){if(this.logBuffer.length>0){let n=[...this.logBuffer];this.logBuffer=[];try{if(!(await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n.map(s=>({...s,source:r})))})).ok)throw new Error("Failed to post logs to server")}catch(i){console.warn("Could not post logs to server",i.message),this.logBuffer.unshift(...n)}}}},P;function K(e=""){return P=new j(e),P}var l=e=>{throw new Error("Not initialized yet")},y=typeof window>"u"&&typeof globalThis.WebSocketPair>"u",f=new Map,g=0;y&&(globalThis.syscall=async(e,...r)=>await new Promise((o,n)=>{g++,f.set(g,{resolve:o,reject:n}),l({type:"sys",id:g,name:e,args:r})}));function w(e,r,o){y&&(l=o,self.addEventListener("message",n=>{(async()=>{let i=n.data;switch(i.type){case"inv":{let s=e[i.name];if(!s)throw new Error(`Function not loaded: ${i.name}`);try{let a=await Promise.resolve(s(...i.args||[]));l({type:"invr",id:i.id,result:a})}catch(a){console.error("An exception was thrown as a result of invoking function",i.name,"error:",a.message),l({type:"invr",id:i.id,error:a.message})}}break;case"sysr":{let s=i.id,a=f.get(s);if(!a)throw Error("Invalid request id");f.delete(s),i.error?a.reject(new Error(i.error)):a.resolve(i.result)}break}})().catch(console.error)}),l({type:"manifest",manifest:r}),K(`[${r.name} plug]`))}async function I(e,r){if(typeof e!="string"){let o=new Uint8Array(await e.arrayBuffer()),n=o.length>0?b(o):void 0;r={method:e.method,headers:Object.fromEntries(e.headers.entries()),base64Body:n},e=e.url}return syscall("sandboxFetch.fetch",e,r)}globalThis.nativeFetch=globalThis.fetch;function O(){globalThis.fetch=async(e,r)=>{let o=r?.body?b(new Uint8Array(await new Response(r.body).arrayBuffer())):void 0,n=await I(e,r&&{method:r.method,headers:r.headers,base64Body:o});return new Response(n.base64Body?G(n.base64Body):null,{status:n.status,headers:n.headers})}}y&&O();var u={};m(u,{alert:()=>ve,configureVimMode:()=>Re,confirm:()=>we,copyToClipboard:()=>De,deleteLine:()=>Ge,dispatch:()=>Pe,downloadFile:()=>ae,filterBox:()=>ue,flashNotification:()=>le,fold:()=>Me,foldAll:()=>Te,getCurrentEditor:()=>W,getCurrentPage:()=>R,getCurrentPageMeta:()=>N,getCurrentPath:()=>B,getCursor:()=>H,getRecentlyOpenedPages:()=>J,getSelection:()=>q,getText:()=>$,getUiOption:()=>Se,goHistory:()=>se,hidePanel:()=>de,insertAtCursor:()=>he,insertAtPos:()=>ge,invokeCommand:()=>Q,isMobile:()=>Be,moveCursor:()=>ye,moveCursorToLine:()=>xe,moveLineDown:()=>Ie,moveLineUp:()=>Ke,navigate:()=>V,newWindow:()=>ie,openCommandPalette:()=>Y,openPageNavigator:()=>Z,openSearchPanel:()=>Ue,openUrl:()=>ne,prompt:()=>be,rebuildEditorState:()=>te,redo:()=>Fe,reloadConfigAndCommands:()=>oe,reloadPage:()=>ee,reloadUI:()=>re,replaceRange:()=>fe,save:()=>_,sendMessage:()=>Ne,setSelection:()=>X,setText:()=>z,setUiOption:()=>ke,showPanel:()=>pe,showProgress:()=>me,toggleComment:()=>je,toggleFold:()=>Ee,undo:()=>Ae,unfold:()=>Ce,unfoldAll:()=>Le,uploadFile:()=>ce,vimEx:()=>Oe});typeof globalThis.syscall>"u"&&(globalThis.syscall=()=>{throw new Error("Not implemented here")});function t(e,...r){return globalThis.syscall(e,...r)}function R(){return t("editor.getCurrentPage")}function N(){return t("editor.getCurrentPageMeta")}function B(){return t("editor.getCurrentPath")}function J(){return t("editor.getRecentlyOpenedPages")}function W(){return t("editor.getCurrentEditor")}function $(){return t("editor.getText")}function z(e,r=!1){return t("editor.setText",e,r)}function H(){return t("editor.getCursor")}function q(){return t("editor.getSelection")}function X(e,r){return t("editor.setSelection",e,r)}function Q(e,r){return t("editor.invokeCommand",e,r)}function _(){return t("editor.save")}function V(e,r=!1,o=!1){return t("editor.navigate",e,r,o)}function Z(e="page"){return t("editor.openPageNavigator",e)}function Y(){return t("editor.openCommandPalette")}function ee(){return t("editor.reloadPage")}function re(){return t("editor.reloadUI")}function te(){return t("editor.rebuildEditorState")}function oe(){return t("editor.reloadConfigAndCommands")}function ne(e,r=!1){return t("editor.openUrl",e,r)}function ie(){return t("editor.newWindow")}function se(e){return t("editor.goHistory",e)}function ae(e,r){return t("editor.downloadFile",e,r)}function ce(e,r){return t("editor.uploadFile",e,r)}function le(e,r="info"){return t("editor.flashNotification",e,r)}function ue(e,r,o="",n=""){return t("editor.filterBox",e,r,o,n)}function pe(e,r,o,n=""){return t("editor.showPanel",e,r,o,n)}function de(e){return t("editor.hidePanel",e)}function me(e,r){return t("editor.showProgress",e,r)}function ge(e,r){return t("editor.insertAtPos",e,r)}function fe(e,r,o){return t("editor.replaceRange",e,r,o)}function ye(e,r=!1){return t("editor.moveCursor",e,r)}function xe(e,r=1,o=!1){return t("editor.moveCursorToLine",e,r,o)}function he(e,r=!1,o=!1){return t("editor.insertAtCursor",e,r,o)}function Pe(e){return t("editor.dispatch",e)}function be(e,r=""){return t("editor.prompt",e,r)}function we(e){return t("editor.confirm",e)}function ve(e){return t("editor.alert",e)}function Se(e){return t("editor.getUiOption",e)}function ke(e,r){return t("editor.setUiOption",e,r)}function Me(){return t("editor.fold")}function Ce(){return t("editor.unfold")}function Ee(){return t("editor.toggleFold")}function Te(){return t("editor.foldAll")}function Le(){return t("editor.unfoldAll")}function Ae(){return t("editor.undo")}function Fe(){return t("editor.redo")}function Ue(){return t("editor.openSearchPanel")}function De(e){return t("editor.copyToClipboard",e)}function Ge(){return t("editor.deleteLine")}function je(){return t("editor.toggleComment")}function Ke(){return t("editor.moveLineUp")}function Ie(){return t("editor.moveLineDown")}function Oe(e){return t("editor.vimEx",e)}function Re(){return t("editor.configureVimMode")}function Ne(e,r){return t("editor.sendMessage",e,r)}function Be(){return t("editor.isMobile")}var d={};m(d,{deleteDocument:()=>rr,deleteFile:()=>cr,deletePage:()=>Qe,fileExists:()=>lr,getDocumentMeta:()=>Ze,getFileMeta:()=>sr,getPageMeta:()=>$e,listDocuments:()=>Ve,listFiles:()=>tr,listPages:()=>We,listPlugs:()=>_e,pageExists:()=>ze,readDocument:()=>Ye,readFile:()=>or,readFileWithMeta:()=>ir,readPage:()=>He,readPageWithMeta:()=>qe,readRef:()=>nr,writeDocument:()=>er,writeFile:()=>ar,writePage:()=>Xe});function We(){return t("space.listPages")}function $e(e){return t("space.getPageMeta",e)}function ze(e){return t("space.pageExists",e)}function He(e){return t("space.readPage",e)}function qe(e){return t("space.readPageWithMeta",e)}function Xe(e,r){return t("space.writePage",e,r)}function Qe(e){return t("space.deletePage",e)}function _e(){return t("space.listPlugs")}function Ve(){return t("space.listDocuments")}function Ze(e){return t("space.getDocumentMeta",e)}function Ye(e){return t("space.readDocument",e)}function er(e,r){return t("space.writeDocument",e,r)}function rr(e){return t("space.deleteDocument",e)}function tr(){return t("space.listFiles")}function or(e){return t("space.readFile",e)}function nr(e){return t("space.readRef",e)}function ir(e){return t("space.readFileWithMeta",e)}function sr(e){return t("space.getFileMeta",e)}function ar(e,r){return t("space.writeFile",e,r)}function cr(e){return t("space.deleteFile",e)}function lr(e){return t("space.fileExists",e)}var ct=new Uint8Array(16);var p={};m(p,{define:()=>Cr,get:()=>vr,has:()=>Mr,insert:()=>kr,set:()=>Sr});function vr(e,r){return t("config.get",e,r)}function Sr(e,r){return t("config.set",e,r)}function kr(e,r){return t("config.insert",e,r)}function Mr(e){return t("config.has",e)}function Cr(e,r){return t("config.define",e,r)}var Tr="400px",v=13,h="https://demotiles.maplibre.org/style.json",S="5.21.0",k=0,x;function C(e){return e.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function Lr(e){return e.replaceAll("&amp;","&").replaceAll("&lt;","<").replaceAll("&gt;",">").replaceAll("&quot;",'"').replaceAll("&apos;","'")}function M(e){return{html:`<pre style="color: #b42318; background: #fef3f2; padding: 0.75rem; border: 1px solid #fecdca; border-radius: 4px; white-space: pre-wrap;">${C(e)}</pre>`,script:""}}function Ar(){k+=1;let e="";return typeof crypto<"u"&&"randomUUID"in crypto?e=crypto.randomUUID():e=Math.random().toString(36).slice(2,10),`gpx-map-${k}-${e}`}function Fr(e){let r={};for(let o of e.split(/\r?\n/)){let n=o.trim();if(!n)continue;let i=n.indexOf(":");if(i===-1)continue;let s=n.slice(0,i).trim().toLowerCase(),a=n.slice(i+1).trim();if(a){if(s==="source"||s==="url"||s==="height")r[s]=a;else if(s==="zoom")r.zoom=Number.parseFloat(a);else if(s==="center")try{r.center=JSON.parse(a)}catch{r.center=a}}}return r}function Ur(e){let r=e.trim();if(!r)return{};if(r.startsWith("{")){let o;try{o=JSON.parse(r)}catch(n){let i=n instanceof Error?n.message:"Unknown JSON parse error.";throw new Error(`Map config must be valid JSON: ${i}`)}if(!o||typeof o!="object"||Array.isArray(o))throw new Error("Map config JSON must be an object.");return o}return Fr(e)}function c(e){return typeof e=="string"&&e.trim()?e.trim():void 0}function Dr(e){if(!Array.isArray(e)||e.length!==2)return;let r=Number(e[0]),o=Number(e[1]);if(!(!Number.isFinite(r)||!Number.isFinite(o)))return[r,o]}function Gr(e){if(e===void 0)return[];if(!Array.isArray(e))throw new Error("`markers` must be an array of marker objects.");return e.map((r,o)=>{if(!r||typeof r!="object"||Array.isArray(r))throw new Error(`Marker ${o+1} must be an object.`);let n=r,i=Number(n.lat),s=Number(n.lon);if(!Number.isFinite(i)||!Number.isFinite(s))throw new Error(`Marker ${o+1} must include numeric \`lat\` and \`lon\`.`);return{lat:i,lon:s,label:c(n.label),popup:c(n.popup)}})}function jr(e){let r=c(e.source)||c(e.url),o=c(e.height)||Tr,n=e.center===void 0?void 0:Dr(e.center);if(e.center!==void 0&&!n)throw new Error("`center` must be a JSON array like [lat, lon].");let i=e.zoom===void 0?void 0:Number(e.zoom);if(e.zoom!==void 0&&!Number.isFinite(i))throw new Error("`zoom` must be a number.");return{source:r,height:o,center:n,zoom:i,markers:Gr(e.markers)}}function Kr(e,r){let o=e.matchAll(new RegExp(`<${r}\\b[^>]*?lat=["']([^"']+)["'][^>]*?lon=["']([^"']+)["'][^>]*?>`,"gi")),n=[];for(let i of o){let s=Number.parseFloat(i[1]),a=Number.parseFloat(i[2]);Number.isFinite(s)&&Number.isFinite(a)&&n.push([s,a])}return n}function Ir(e){let r=e.matchAll(/<wpt\b[^>]*?lat=["']([^"']+)["'][^>]*?lon=["']([^"']+)["'][^>]*?>([\s\S]*?)<\/wpt>/gi),o=[];for(let n of r){let i=Number.parseFloat(n[1]),s=Number.parseFloat(n[2]);if(!Number.isFinite(i)||!Number.isFinite(s))continue;let a=n[3].match(/<name\b[^>]*>([\s\S]*?)<\/name>/i),U=a?Lr(a[1].trim()):"Waypoint";o.push({lat:i,lon:s,popup:U})}return o}function Or(e){if(!(e.length<2))return{type:"FeatureCollection",features:[{type:"Feature",properties:{source:"gpx-track"},geometry:{type:"LineString",coordinates:e.map(([r,o])=>[o,r])}}]}}function Rr(e){return/<(?:\w+:)?gpx\b/i.test(e)}function Nr(e){return typeof e=="string"&&["Feature","FeatureCollection","Point","MultiPoint","LineString","MultiLineString","Polygon","MultiPolygon","GeometryCollection"].includes(e)}function Br(e,r){let o;try{o=JSON.parse(e)}catch(i){let s=i instanceof Error?i.message:"Unknown JSON parse error.";throw new Error(`GeoJSON Error: Invalid JSON in ${r}: ${s}`)}if(!o||typeof o!="object"||Array.isArray(o))throw new Error(`GeoJSON Error: ${r} must contain a GeoJSON object.`);let n=o;if(!Nr(n.type))throw new Error(`GeoJSON Error: Unsupported or missing GeoJSON type in ${r}.`);return n}function Jr(e){let r=e.trim();return r?r.startsWith("/")?[r,r.slice(1)]:[r,`/${r}`]:[]}async function Wr(e){for(let r of Jr(e))try{return new TextDecoder().decode(await d.readFile(r))}catch{continue}throw new Error(`Map Error: File not found: ${e}`)}async function $r(e){let r=await Wr(e),o=e.toLowerCase();if(o.endsWith(".gpx")){if(!Rr(r))throw new Error(`GPX Map Error: File is not valid GPX XML: ${e}`);let n=Kr(r,"trkpt"),i=Ir(r);if(n.length===0&&i.length===0)throw new Error(`GPX Map Error: No usable trackpoints or waypoints found in ${e}`);if(n.length>0){let s=[];return n.length===1?s.push({lat:n[0][0],lon:n[0][1],popup:"Track point"}):(s.push({lat:n[0][0],lon:n[0][1],popup:"Start"}),s.push({lat:n[n.length-1][0],lon:n[n.length-1][1],popup:"End"})),{kind:"gpx",trackGeoJson:Or(n),markers:s}}return{kind:"gpx",markers:i}}if(o.endsWith(".geojson")||o.endsWith(".json"))return{kind:"geojson",data:Br(r,e)};throw new Error(`Map Error: Unsupported file type for ${e}. Use .gpx, .geojson, or .json.`)}function zr(){return`\`\`\`gpxmap
{
  "height": "400px",
  "source": "/path/to/data.gpx",
  "center": [41.3874, 2.1686],
  "zoom": 13,
  "markers": [
    {
      "lat": 41.3874,
      "lon": 2.1686,
      "popup": "Example marker"
    }
  ]
}
\`\`\``}async function E(){let e=await u.getSelection(),{from:r,to:o}=e;await u.replaceRange(r,o,zr())}async function Hr(){x||(x=Promise.all([p.define("gpxmap.styleUrl",{type:"string",default:h,description:"MapLibre style URL used by gpxmap."})]).then(()=>{})),await x}async function qr(){await Hr();let e=await p.get("gpxmap.styleUrl",h);return{styleUrl:c(e)||h}}function Xr(e,r){return`
    (function() {
      const mapId = ${JSON.stringify(r)};
      const payload = ${JSON.stringify(e)};
      const globalKey = "__gpxMapMapLibreLoader";
      const mapStoreKey = "__gpxMapInstances";
      const cssHref = "https://unpkg.com/maplibre-gl@${S}/dist/maplibre-gl.css";
      const scriptSrc = "https://unpkg.com/maplibre-gl@${S}/dist/maplibre-gl.js";

      function loadMapLibre() {
        if (globalThis[globalKey]) {
          return globalThis[globalKey];
        }

        globalThis[globalKey] = new Promise((resolve, reject) => {
          const existingStylesheet = document.querySelector('link[data-gpxmap-maplibre="true"]');
          if (!existingStylesheet) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssHref;
            link.setAttribute('data-gpxmap-maplibre', 'true');
            document.head.appendChild(link);
          }

          if (typeof globalThis.maplibregl !== 'undefined') {
            resolve(globalThis.maplibregl);
            return;
          }

          const existingScript = document.querySelector('script[data-gpxmap-maplibre="true"]');
          if (existingScript) {
            existingScript.addEventListener('load', () => resolve(globalThis.maplibregl), { once: true });
            existingScript.addEventListener('error', () => reject(new Error('Failed to load MapLibre GL JS.')), { once: true });
            return;
          }

          const script = document.createElement('script');
          script.src = scriptSrc;
          script.setAttribute('data-gpxmap-maplibre', 'true');
          script.onload = () => resolve(globalThis.maplibregl);
          script.onerror = () => reject(new Error('Failed to load MapLibre GL JS.'));
          document.head.appendChild(script);
        });

        return globalThis[globalKey];
      }

      function renderError(message) {
        const element = document.getElementById(mapId);
        if (!element) {
          return;
        }

        element.outerHTML =
          '<pre style="color: #b42318; background: #fef3f2; padding: 0.75rem; border: 1px solid #fecdca; border-radius: 4px; white-space: pre-wrap;">' +
          message
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;') +
          '</pre>';
      }

      function toLngLat(lat, lon) {
        return [lon, lat];
      }

      function extractFeaturePopupText(feature) {
        const props = feature && feature.properties && typeof feature.properties === 'object'
          ? feature.properties
          : null;

        if (!props) {
          return null;
        }

        return props.popup || props.name || null;
      }

      function collectLngLatCoordinates(input, bucket) {
        if (!Array.isArray(input)) {
          return;
        }

        if (input.length >= 2 && typeof input[0] === 'number' && typeof input[1] === 'number') {
          bucket.push([input[0], input[1]]);
          return;
        }

        input.forEach((item) => collectLngLatCoordinates(item, bucket));
      }

      function collectGeoJsonLngLats(geojson) {
        const points = [];

        function visit(node) {
          if (!node || typeof node !== 'object') {
            return;
          }

          switch (node.type) {
            case 'FeatureCollection':
              (node.features || []).forEach(visit);
              return;
            case 'Feature':
              visit(node.geometry);
              return;
            case 'GeometryCollection':
              (node.geometries || []).forEach(visit);
              return;
            case 'Point':
            case 'MultiPoint':
            case 'LineString':
            case 'MultiLineString':
            case 'Polygon':
            case 'MultiPolygon':
              collectLngLatCoordinates(node.coordinates, points);
              return;
          }
        }

        visit(geojson);
        return points;
      }

      function addMarker(maplibregl, map, markers, fitPoints, markerStore) {
        markers.forEach((marker) => {
          const instance = new maplibregl.Marker()
            .setLngLat(toLngLat(marker.lat, marker.lon));

          if (marker.popup || marker.label) {
            instance.setPopup(
              new maplibregl.Popup({ offset: 25 }).setText(String(marker.popup || marker.label))
            );
          }

          instance.addTo(map);
          markerStore.push(instance);
          fitPoints.push(toLngLat(marker.lat, marker.lon));
        });
      }

      function registerPopupHandler(maplibregl, map, layerId) {
        map.on('click', layerId, (event) => {
          const feature = event.features && event.features[0];
          const popupText = extractFeaturePopupText(feature);
          if (!popupText) {
            return;
          }

          new maplibregl.Popup()
            .setLngLat(event.lngLat)
            .setText(String(popupText))
            .addTo(map);
        });

        map.on('mouseenter', layerId, () => {
          map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', layerId, () => {
          map.getCanvas().style.cursor = '';
        });
      }

      function addGeoJsonLayers(maplibregl, map, sourceId, data, layerPrefix, fitPoints) {
        const coordinates = collectGeoJsonLngLats(data);
        if (coordinates.length === 0) {
          throw new Error('GeoJSON Error: No renderable features found.');
        }

        map.addSource(sourceId, {
          type: 'geojson',
          data,
        });

        const fillLayerId = layerPrefix + '-fill';
        const lineLayerId = layerPrefix + '-line';
        const pointLayerId = layerPrefix + '-point';

        map.addLayer({
          id: fillLayerId,
          type: 'fill',
          source: sourceId,
          filter: ['==', ['geometry-type'], 'Polygon'],
          paint: {
            'fill-color': '#3b82f6',
            'fill-opacity': 0.18
          }
        });

        map.addLayer({
          id: lineLayerId,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': '#2563eb',
            'line-width': 3,
            'line-opacity': 0.9
          }
        });

        map.addLayer({
          id: pointLayerId,
          type: 'circle',
          source: sourceId,
          filter: ['==', ['geometry-type'], 'Point'],
          paint: {
            'circle-radius': 6,
            'circle-color': '#dc2626',
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 2
          }
        });

        registerPopupHandler(maplibregl, map, fillLayerId);
        registerPopupHandler(maplibregl, map, lineLayerId);
        registerPopupHandler(maplibregl, map, pointLayerId);

        coordinates.forEach((coordinate) => fitPoints.push(coordinate));
      }

      function cleanupExistingInstance() {
        if (!globalThis[mapStoreKey]) {
          globalThis[mapStoreKey] = {};
        }

        const existing = globalThis[mapStoreKey][mapId];
        if (!existing) {
          return;
        }

        (existing.markers || []).forEach((marker) => marker.remove());
        if (existing.map) {
          existing.map.remove();
        }
      }

      function initMap(maplibregl) {
        const element = document.getElementById(mapId);
        if (!element) {
          return;
        }

        cleanupExistingInstance();

        const config = payload.config;
        const hasExplicitCenter = Array.isArray(config.center);
        const initialCenter = hasExplicitCenter
          ? toLngLat(config.center[0], config.center[1])
          : [0, 0];
        const initialZoom = hasExplicitCenter && typeof config.zoom === 'number'
          ? config.zoom
          : 1;

        const map = new maplibregl.Map({
          container: mapId,
          style: payload.styleUrl,
          center: initialCenter,
          zoom: initialZoom
        });

        const markerStore = [];
        globalThis[mapStoreKey][mapId] = { map, markers: markerStore };

        let initialized = false;
        const initialErrorHandler = (event) => {
          if (initialized) {
            return;
          }

          const message = event && event.error && event.error.message
            ? event.error.message
            : 'Unable to load MapLibre style.';
          renderError('Map Error: ' + message);
          cleanupExistingInstance();
        };

        map.on('error', initialErrorHandler);

        map.once('load', () => {
          initialized = true;
          map.off('error', initialErrorHandler);

          try {
            const fitPoints = [];

            if (payload.sourceData && payload.sourceData.kind === 'gpx') {
              if (payload.sourceData.trackGeoJson) {
                addGeoJsonLayers(
                  maplibregl,
                  map,
                  mapId + '-gpx-source',
                  payload.sourceData.trackGeoJson,
                  mapId + '-gpx',
                  fitPoints
                );
              }

              addMarker(
                maplibregl,
                map,
                payload.sourceData.markers,
                fitPoints,
                markerStore
              );
            }

            if (payload.sourceData && payload.sourceData.kind === 'geojson') {
              addGeoJsonLayers(
                maplibregl,
                map,
                mapId + '-geojson-source',
                payload.sourceData.data,
                mapId + '-geojson',
                fitPoints
              );
            }

            addMarker(maplibregl, map, config.markers, fitPoints, markerStore);

            if (hasExplicitCenter) {
              map.jumpTo({
                center: toLngLat(config.center[0], config.center[1]),
                zoom: typeof config.zoom === 'number' ? config.zoom : ${v}
              });
              return;
            }

            if (fitPoints.length === 0) {
              return;
            }

            const bounds = fitPoints.reduce(
              (acc, point) => acc.extend(point),
              new maplibregl.LngLatBounds(fitPoints[0], fitPoints[0])
            );

            const southWest = bounds.getSouthWest();
            const northEast = bounds.getNorthEast();
            if (southWest.lng === northEast.lng && southWest.lat === northEast.lat) {
              map.jumpTo({
                center: [southWest.lng, southWest.lat],
                zoom: ${v}
              });
              return;
            }

            map.fitBounds(bounds, {
              padding: 40,
              duration: 0
            });
          } catch (error) {
            const message = error && error.message ? error.message : 'Unable to render map data.';
            renderError('Map Error: ' + message);
            cleanupExistingInstance();
          }
        });
      }

      loadMapLibre().then(initMap).catch((error) => {
        renderError('Map Error: ' + (error && error.message ? error.message : 'Unable to initialize map.'));
      });
    })();
  `}async function T(e){try{let r=jr(Ur(e)),o=r.source?await $r(r.source):void 0,n=await qr();if(!o&&r.markers.length===0&&!r.center)return M("Map Error: Provide a source file, at least one marker, or a center coordinate.");let i=Ar();return{html:`<div id="${i}" style="height: ${C(r.height)}; width: 100%; border: 1px solid #ccc; border-radius: 4px; overflow: hidden;"></div>`,script:Xr({config:r,sourceData:o,...n},i)}}catch(r){let o=r instanceof Error?r.message:"Unknown map rendering error.";return M(o)}}function L(){return{options:[{label:"gpxmap",detail:"Insert generic map widget",invoke:"gpxmap.insertGPXMap"}]}}var A={insertGPXMap:E,renderGPXWidget:T,gpxSlashComplete:L},F={name:"gpxmap",version:.1,imports:["https://get.silverbullet.md/global.plug.json"],functions:{insertGPXMap:{path:"./gpxmap.ts:insertGPXMap",command:{name:"Map: Insert Widget",requireMode:"rw"}},renderGPXWidget:{path:"./gpxmap.ts:renderGPXWidget",codeWidget:"gpxmap"},gpxSlashComplete:{path:"./gpxmap.ts:gpxSlashComplete",events:["slash:complete"]}},assets:{}},Lt={manifest:F,functionMapping:A};w(A,F,self.postMessage);export{Lt as plug};
//# sourceMappingURL=gpxmap.plug.js.map
