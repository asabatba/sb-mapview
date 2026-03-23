var I=Object.defineProperty;var m=(e,r)=>{for(var n in r)I(e,n,{get:r[n],enumerable:!0})};function K(e){let r=atob(e),n=r.length,o=new Uint8Array(n);for(let i=0;i<n;i++)o[i]=r.charCodeAt(i);return o}function w(e){typeof e=="string"&&(e=new TextEncoder().encode(e));let r="",n=e.byteLength;for(let o=0;o<n;o++)r+=String.fromCharCode(e[o]);return btoa(r)}var Zr=new Uint8Array(16),O=class{constructor(e="",r=1e3){this.prefix=e,this.maxCaptureSize=r,this.prefix=e,this.originalConsole={log:console.log.bind(console),info:console.info.bind(console),warn:console.warn.bind(console),error:console.error.bind(console),debug:console.debug.bind(console)},this.patchConsole()}originalConsole;logBuffer=[];patchConsole(){let e=r=>(...n)=>{let o=this.prefix?[this.prefix,...n]:n;this.originalConsole[r](...o),this.captureLog(r,n)};console.log=e("log"),console.info=e("info"),console.warn=e("warn"),console.error=e("error"),console.debug=e("debug")}captureLog(e,r){let n={level:e,timestamp:Date.now(),message:r.map(o=>{if(typeof o=="string")return o;try{return JSON.stringify(o)}catch{return String(o)}}).join(" ")};this.logBuffer.push(n),this.logBuffer.length>this.maxCaptureSize&&this.logBuffer.shift()}async postToServer(e,r){if(this.logBuffer.length>0){let o=[...this.logBuffer];this.logBuffer=[];try{if(!(await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o.map(s=>({...s,source:r})))})).ok)throw new Error("Failed to post logs to server")}catch(i){console.warn("Could not post logs to server",i.message),this.logBuffer.unshift(...o)}}}},P;function R(e=""){return P=new O(e),P}var l=e=>{throw new Error("Not initialized yet")},y=typeof window>"u"&&typeof globalThis.WebSocketPair>"u",f=new Map,g=0;y&&(globalThis.syscall=async(e,...r)=>await new Promise((n,o)=>{g++,f.set(g,{resolve:n,reject:o}),l({type:"sys",id:g,name:e,args:r})}));function v(e,r,n){y&&(l=n,self.addEventListener("message",o=>{(async()=>{let i=o.data;switch(i.type){case"inv":{let s=e[i.name];if(!s)throw new Error(`Function not loaded: ${i.name}`);try{let a=await Promise.resolve(s(...i.args||[]));l({type:"invr",id:i.id,result:a})}catch(a){console.error("An exception was thrown as a result of invoking function",i.name,"error:",a.message),l({type:"invr",id:i.id,error:a.message})}}break;case"sysr":{let s=i.id,a=f.get(s);if(!a)throw Error("Invalid request id");f.delete(s),i.error?a.reject(new Error(i.error)):a.resolve(i.result)}break}})().catch(console.error)}),l({type:"manifest",manifest:r}),R(`[${r.name} plug]`))}async function G(e,r){if(typeof e!="string"){let n=new Uint8Array(await e.arrayBuffer()),o=n.length>0?w(n):void 0;r={method:e.method,headers:Object.fromEntries(e.headers.entries()),base64Body:o},e=e.url}return syscall("sandboxFetch.fetch",e,r)}globalThis.nativeFetch=globalThis.fetch;function N(){globalThis.fetch=async(e,r)=>{let n=r?.body?w(new Uint8Array(await new Response(r.body).arrayBuffer())):void 0,o=await G(e,r&&{method:r.method,headers:r.headers,base64Body:n});return new Response(o.base64Body?K(o.base64Body):null,{status:o.status,headers:o.headers})}}y&&N();var p={};m(p,{alert:()=>Me,configureVimMode:()=>Be,confirm:()=>Se,copyToClipboard:()=>Ie,deleteLine:()=>Ke,dispatch:()=>we,downloadFile:()=>le,filterBox:()=>de,flashNotification:()=>ue,fold:()=>Ee,foldAll:()=>Ae,getCurrentEditor:()=>$,getCurrentPage:()=>B,getCurrentPageMeta:()=>J,getCurrentPath:()=>W,getCursor:()=>q,getRecentlyOpenedPages:()=>V,getSelection:()=>Q,getText:()=>z,getUiOption:()=>ke,goHistory:()=>ce,hidePanel:()=>ge,insertAtCursor:()=>Pe,insertAtPos:()=>ye,invokeCommand:()=>X,isMobile:()=>We,moveCursor:()=>he,moveCursorToLine:()=>be,moveLineDown:()=>Ge,moveLineUp:()=>Re,navigate:()=>Y,newWindow:()=>ae,openCommandPalette:()=>re,openPageNavigator:()=>ee,openSearchPanel:()=>je,openUrl:()=>se,prompt:()=>ve,rebuildEditorState:()=>oe,redo:()=>De,reloadConfigAndCommands:()=>ie,reloadPage:()=>te,reloadUI:()=>ne,replaceRange:()=>xe,save:()=>Z,sendMessage:()=>Je,setSelection:()=>_,setText:()=>H,setUiOption:()=>Ce,showPanel:()=>me,showProgress:()=>fe,toggleComment:()=>Oe,toggleFold:()=>Le,undo:()=>Ue,unfold:()=>Te,unfoldAll:()=>Fe,uploadFile:()=>pe,vimEx:()=>Ne});typeof globalThis.syscall>"u"&&(globalThis.syscall=()=>{throw new Error("Not implemented here")});function t(e,...r){return globalThis.syscall(e,...r)}function B(){return t("editor.getCurrentPage")}function J(){return t("editor.getCurrentPageMeta")}function W(){return t("editor.getCurrentPath")}function V(){return t("editor.getRecentlyOpenedPages")}function $(){return t("editor.getCurrentEditor")}function z(){return t("editor.getText")}function H(e,r=!1){return t("editor.setText",e,r)}function q(){return t("editor.getCursor")}function Q(){return t("editor.getSelection")}function _(e,r){return t("editor.setSelection",e,r)}function X(e,r){return t("editor.invokeCommand",e,r)}function Z(){return t("editor.save")}function Y(e,r=!1,n=!1){return t("editor.navigate",e,r,n)}function ee(e="page"){return t("editor.openPageNavigator",e)}function re(){return t("editor.openCommandPalette")}function te(){return t("editor.reloadPage")}function ne(){return t("editor.reloadUI")}function oe(){return t("editor.rebuildEditorState")}function ie(){return t("editor.reloadConfigAndCommands")}function se(e,r=!1){return t("editor.openUrl",e,r)}function ae(){return t("editor.newWindow")}function ce(e){return t("editor.goHistory",e)}function le(e,r){return t("editor.downloadFile",e,r)}function pe(e,r){return t("editor.uploadFile",e,r)}function ue(e,r="info"){return t("editor.flashNotification",e,r)}function de(e,r,n="",o=""){return t("editor.filterBox",e,r,n,o)}function me(e,r,n,o=""){return t("editor.showPanel",e,r,n,o)}function ge(e){return t("editor.hidePanel",e)}function fe(e,r){return t("editor.showProgress",e,r)}function ye(e,r){return t("editor.insertAtPos",e,r)}function xe(e,r,n){return t("editor.replaceRange",e,r,n)}function he(e,r=!1){return t("editor.moveCursor",e,r)}function be(e,r=1,n=!1){return t("editor.moveCursorToLine",e,r,n)}function Pe(e,r=!1,n=!1){return t("editor.insertAtCursor",e,r,n)}function we(e){return t("editor.dispatch",e)}function ve(e,r=""){return t("editor.prompt",e,r)}function Se(e){return t("editor.confirm",e)}function Me(e){return t("editor.alert",e)}function ke(e){return t("editor.getUiOption",e)}function Ce(e,r){return t("editor.setUiOption",e,r)}function Ee(){return t("editor.fold")}function Te(){return t("editor.unfold")}function Le(){return t("editor.toggleFold")}function Ae(){return t("editor.foldAll")}function Fe(){return t("editor.unfoldAll")}function Ue(){return t("editor.undo")}function De(){return t("editor.redo")}function je(){return t("editor.openSearchPanel")}function Ie(e){return t("editor.copyToClipboard",e)}function Ke(){return t("editor.deleteLine")}function Oe(){return t("editor.toggleComment")}function Re(){return t("editor.moveLineUp")}function Ge(){return t("editor.moveLineDown")}function Ne(e){return t("editor.vimEx",e)}function Be(){return t("editor.configureVimMode")}function Je(e,r){return t("editor.sendMessage",e,r)}function We(){return t("editor.isMobile")}var d={};m(d,{deleteDocument:()=>nr,deleteFile:()=>pr,deletePage:()=>Xe,fileExists:()=>ur,getDocumentMeta:()=>er,getFileMeta:()=>cr,getPageMeta:()=>ze,listDocuments:()=>Ye,listFiles:()=>or,listPages:()=>$e,listPlugs:()=>Ze,pageExists:()=>He,readDocument:()=>rr,readFile:()=>ir,readFileWithMeta:()=>ar,readPage:()=>qe,readPageWithMeta:()=>Qe,readRef:()=>sr,writeDocument:()=>tr,writeFile:()=>lr,writePage:()=>_e});function $e(){return t("space.listPages")}function ze(e){return t("space.getPageMeta",e)}function He(e){return t("space.pageExists",e)}function qe(e){return t("space.readPage",e)}function Qe(e){return t("space.readPageWithMeta",e)}function _e(e,r){return t("space.writePage",e,r)}function Xe(e){return t("space.deletePage",e)}function Ze(){return t("space.listPlugs")}function Ye(){return t("space.listDocuments")}function er(e){return t("space.getDocumentMeta",e)}function rr(e){return t("space.readDocument",e)}function tr(e,r){return t("space.writeDocument",e,r)}function nr(e){return t("space.deleteDocument",e)}function or(){return t("space.listFiles")}function ir(e){return t("space.readFile",e)}function sr(e){return t("space.readRef",e)}function ar(e){return t("space.readFileWithMeta",e)}function cr(e){return t("space.getFileMeta",e)}function lr(e,r){return t("space.writeFile",e,r)}function pr(e){return t("space.deleteFile",e)}function ur(e){return t("space.fileExists",e)}var pt=new Uint8Array(16);var u={};m(u,{define:()=>Tr,get:()=>Mr,has:()=>Er,insert:()=>Cr,set:()=>kr});function Mr(e,r){return t("config.get",e,r)}function kr(e,r){return t("config.set",e,r)}function Cr(e,r){return t("config.insert",e,r)}function Er(e){return t("config.has",e)}function Tr(e,r){return t("config.define",e,r)}var Ar="400px",S=13,h="https://demotiles.maplibre.org/style.json",M="5.21.0",k=0,x;function E(e){return e.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function Fr(e){return e.replaceAll("&amp;","&").replaceAll("&lt;","<").replaceAll("&gt;",">").replaceAll("&quot;",'"').replaceAll("&apos;","'")}function C(e){return{html:`<pre style="color: #b42318; background: #fef3f2; padding: 0.75rem; border: 1px solid #fecdca; border-radius: 4px; white-space: pre-wrap;">${E(e)}</pre>`,script:""}}function Ur(){k+=1;let e="";return typeof crypto<"u"&&"randomUUID"in crypto?e=crypto.randomUUID():e=Math.random().toString(36).slice(2,10),`mapview-${k}-${e}`}function Dr(e){let r={};for(let n of e.split(/\r?\n/)){let o=n.trim();if(!o)continue;let i=o.indexOf(":");if(i===-1)continue;let s=o.slice(0,i).trim().toLowerCase(),a=o.slice(i+1).trim();if(a){if(s==="source"||s==="url"||s==="height")r[s]=a;else if(s==="zoom")r.zoom=Number.parseFloat(a);else if(s==="center")try{r.center=JSON.parse(a)}catch{r.center=a}}}return r}function jr(e){let r=e.trim();if(!r)return{};if(r.startsWith("{")){let n;try{n=JSON.parse(r)}catch(o){let i=o instanceof Error?o.message:"Unknown JSON parse error.";throw new Error(`Map config must be valid JSON: ${i}`)}if(!n||typeof n!="object"||Array.isArray(n))throw new Error("Map config JSON must be an object.");return n}return Dr(e)}function c(e){return typeof e=="string"&&e.trim()?e.trim():void 0}function Ir(e){if(!Array.isArray(e)||e.length!==2)return;let r=Number(e[0]),n=Number(e[1]);if(!(!Number.isFinite(r)||!Number.isFinite(n)))return[r,n]}function Kr(e){if(e===void 0)return[];if(!Array.isArray(e))throw new Error("`markers` must be an array of marker objects.");return e.map((r,n)=>{if(!r||typeof r!="object"||Array.isArray(r))throw new Error(`Marker ${n+1} must be an object.`);let o=r,i=Number(o.lat),s=Number(o.lon);if(!Number.isFinite(i)||!Number.isFinite(s))throw new Error(`Marker ${n+1} must include numeric \`lat\` and \`lon\`.`);return{lat:i,lon:s,label:c(o.label),popup:c(o.popup)}})}function Or(e){let r=c(e.source)||c(e.url),n=c(e.height)||Ar,o=e.center===void 0?void 0:Ir(e.center);if(e.center!==void 0&&!o)throw new Error("`center` must be a JSON array like [lat, lon].");let i=e.zoom===void 0?void 0:Number(e.zoom);if(e.zoom!==void 0&&!Number.isFinite(i))throw new Error("`zoom` must be a number.");return{source:r,height:n,center:o,zoom:i,markers:Kr(e.markers)}}function Rr(e,r){let n=e.matchAll(new RegExp(`<${r}\\b[^>]*?lat=["']([^"']+)["'][^>]*?lon=["']([^"']+)["'][^>]*?>`,"gi")),o=[];for(let i of n){let s=Number.parseFloat(i[1]),a=Number.parseFloat(i[2]);Number.isFinite(s)&&Number.isFinite(a)&&o.push([s,a])}return o}function Gr(e){let r=e.matchAll(/<wpt\b[^>]*?lat=["']([^"']+)["'][^>]*?lon=["']([^"']+)["'][^>]*?>([\s\S]*?)<\/wpt>/gi),n=[];for(let o of r){let i=Number.parseFloat(o[1]),s=Number.parseFloat(o[2]);if(!Number.isFinite(i)||!Number.isFinite(s))continue;let a=o[3].match(/<name\b[^>]*>([\s\S]*?)<\/name>/i),j=a?Fr(a[1].trim()):"Waypoint";n.push({lat:i,lon:s,popup:j})}return n}function Nr(e){if(!(e.length<2))return{type:"FeatureCollection",features:[{type:"Feature",properties:{source:"gpx-track"},geometry:{type:"LineString",coordinates:e.map(([r,n])=>[n,r])}}]}}function Br(e){return/<(?:\w+:)?gpx\b/i.test(e)}function Jr(e){return typeof e=="string"&&["Feature","FeatureCollection","Point","MultiPoint","LineString","MultiLineString","Polygon","MultiPolygon","GeometryCollection"].includes(e)}function Wr(e,r){let n;try{n=JSON.parse(e)}catch(i){let s=i instanceof Error?i.message:"Unknown JSON parse error.";throw new Error(`GeoJSON Error: Invalid JSON in ${r}: ${s}`)}if(!n||typeof n!="object"||Array.isArray(n))throw new Error(`GeoJSON Error: ${r} must contain a GeoJSON object.`);let o=n;if(!Jr(o.type))throw new Error(`GeoJSON Error: Unsupported or missing GeoJSON type in ${r}.`);return o}function Vr(e){let r=e.trim();return r?r.startsWith("/")?[r,r.slice(1)]:[r,`/${r}`]:[]}async function $r(e){for(let r of Vr(e))try{return new TextDecoder().decode(await d.readFile(r))}catch{continue}throw new Error(`Map Error: File not found: ${e}`)}async function zr(e){let r=await $r(e),n=e.toLowerCase();if(n.endsWith(".gpx")){if(!Br(r))throw new Error(`GPX Map Error: File is not valid GPX XML: ${e}`);let o=Rr(r,"trkpt"),i=Gr(r);if(o.length===0&&i.length===0)throw new Error(`GPX Map Error: No usable trackpoints or waypoints found in ${e}`);if(o.length>0){let s=[];return o.length===1?s.push({lat:o[0][0],lon:o[0][1],popup:"Track point"}):(s.push({lat:o[0][0],lon:o[0][1],popup:"Start"}),s.push({lat:o[o.length-1][0],lon:o[o.length-1][1],popup:"End"})),{kind:"gpx",trackGeoJson:Nr(o),markers:s}}return{kind:"gpx",markers:i}}if(n.endsWith(".geojson")||n.endsWith(".json"))return{kind:"geojson",data:Wr(r,e)};throw new Error(`Map Error: Unsupported file type for ${e}. Use .gpx, .geojson, or .json.`)}function Hr(){return`\`\`\`mapview
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
\`\`\``}async function T(){let e=await p.getSelection(),{from:r,to:n}=e;await p.replaceRange(r,n,Hr())}async function qr(){x||(x=Promise.all([u.define("mapview.styleUrl",{type:"string",default:h,description:"MapLibre style URL used by mapview."})]).then(()=>{})),await x}async function Qr(){await qr();let e=await u.get("mapview.styleUrl",h);return{styleUrl:c(e)||h}}function _r(e,r){return`
    (function() {
      const mapId = ${JSON.stringify(r)};
      const payload = ${JSON.stringify(e)};
      const globalKey = "__mapviewMapLibreLoader";
      const mapStoreKey = "__mapviewInstances";
      const cssHref = "https://unpkg.com/maplibre-gl@${M}/dist/maplibre-gl.css";
      const scriptSrc = "https://unpkg.com/maplibre-gl@${M}/dist/maplibre-gl.js";

      function loadMapLibre() {
        if (globalThis[globalKey]) {
          return globalThis[globalKey];
        }

        globalThis[globalKey] = new Promise((resolve, reject) => {
          const existingStylesheet = document.querySelector('link[data-mapview-maplibre="true"]');
          if (!existingStylesheet) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssHref;
            link.setAttribute('data-mapview-maplibre', 'true');
            document.head.appendChild(link);
          }

          if (typeof globalThis.maplibregl !== 'undefined') {
            resolve(globalThis.maplibregl);
            return;
          }

          const existingScript = document.querySelector('script[data-mapview-maplibre="true"]');
          if (existingScript) {
            existingScript.addEventListener('load', () => resolve(globalThis.maplibregl), { once: true });
            existingScript.addEventListener('error', () => reject(new Error('Failed to load MapLibre GL JS.')), { once: true });
            return;
          }

          const script = document.createElement('script');
          script.src = scriptSrc;
          script.setAttribute('data-mapview-maplibre', 'true');
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
                zoom: typeof config.zoom === 'number' ? config.zoom : ${S}
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
                zoom: ${S}
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
  `}async function b(e){try{let r=Or(jr(e)),n=r.source?await zr(r.source):void 0,o=await Qr();if(!n&&r.markers.length===0&&!r.center)return C("Map Error: Provide a source file, at least one marker, or a center coordinate.");let i=Ur();return{html:`<div id="${i}" style="height: ${E(r.height)}; width: 100%; border: 1px solid #ccc; border-radius: 4px; overflow: hidden;"></div>`,script:_r({config:r,sourceData:n,...o},i)}}catch(r){let n=r instanceof Error?r.message:"Unknown map rendering error.";return C(n)}}async function L(e){return b(e)}function A(){return{options:[{label:"mapview",detail:"Insert mapview widget",invoke:"mapview.insertMapView"}]}}function F(){return{options:[{label:"gpxmap",detail:"Insert legacy gpxmap widget",invoke:"mapview.insertMapView"},{label:"mapview",detail:"Insert mapview widget",invoke:"mapview.insertMapView"}]}}var U={insertMapView:T,renderMapViewWidget:b,renderGPXWidget:L,mapViewSlashComplete:A,gpxSlashComplete:F},D={name:"mapview",version:.1,imports:["https://get.silverbullet.md/global.plug.json"],functions:{insertMapView:{path:"./mapview.ts:insertMapView",command:{name:"MapView: Insert Widget",requireMode:"rw"}},renderMapViewWidget:{path:"./mapview.ts:renderMapViewWidget",codeWidget:"mapview"},renderGPXWidget:{path:"./mapview.ts:renderGPXWidget",codeWidget:"gpxmap"},mapViewSlashComplete:{path:"./mapview.ts:mapViewSlashComplete",events:["slash:complete"]},gpxSlashComplete:{path:"./mapview.ts:gpxSlashComplete",events:["slash:complete"]}},assets:{}},Dt={manifest:D,functionMapping:U};v(U,D,self.postMessage);export{Dt as plug};
//# sourceMappingURL=mapview.plug.js.map
