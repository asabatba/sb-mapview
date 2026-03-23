var F=Object.defineProperty;var y=(e,t)=>{for(var o in t)F(e,o,{get:t[o],enumerable:!0})};function L(e){let t=atob(e),o=t.length,n=new Uint8Array(o);for(let i=0;i<o;i++)n[i]=t.charCodeAt(i);return n}function h(e){typeof e=="string"&&(e=new TextEncoder().encode(e));let t="",o=e.byteLength;for(let n=0;n<o;n++)t+=String.fromCharCode(e[n]);return btoa(t)}var Kt=new Uint8Array(16),U=class{constructor(e="",t=1e3){this.prefix=e,this.maxCaptureSize=t,this.prefix=e,this.originalConsole={log:console.log.bind(console),info:console.info.bind(console),warn:console.warn.bind(console),error:console.error.bind(console),debug:console.debug.bind(console)},this.patchConsole()}originalConsole;logBuffer=[];patchConsole(){let e=t=>(...o)=>{let n=this.prefix?[this.prefix,...o]:o;this.originalConsole[t](...n),this.captureLog(t,o)};console.log=e("log"),console.info=e("info"),console.warn=e("warn"),console.error=e("error"),console.debug=e("debug")}captureLog(e,t){let o={level:e,timestamp:Date.now(),message:t.map(n=>{if(typeof n=="string")return n;try{return JSON.stringify(n)}catch{return String(n)}}).join(" ")};this.logBuffer.push(o),this.logBuffer.length>this.maxCaptureSize&&this.logBuffer.shift()}async postToServer(e,t){if(this.logBuffer.length>0){let n=[...this.logBuffer];this.logBuffer=[];try{if(!(await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n.map(s=>({...s,source:t})))})).ok)throw new Error("Failed to post logs to server")}catch(i){console.warn("Could not post logs to server",i.message),this.logBuffer.unshift(...n)}}}},x;function D(e=""){return x=new U(e),x}var c=e=>{throw new Error("Not initialized yet")},g=typeof window>"u"&&typeof globalThis.WebSocketPair>"u",m=new Map,d=0;g&&(globalThis.syscall=async(e,...t)=>await new Promise((o,n)=>{d++,m.set(d,{resolve:o,reject:n}),c({type:"sys",id:d,name:e,args:t})}));function P(e,t,o){g&&(c=o,self.addEventListener("message",n=>{(async()=>{let i=n.data;switch(i.type){case"inv":{let s=e[i.name];if(!s)throw new Error(`Function not loaded: ${i.name}`);try{let a=await Promise.resolve(s(...i.args||[]));c({type:"invr",id:i.id,result:a})}catch(a){console.error("An exception was thrown as a result of invoking function",i.name,"error:",a.message),c({type:"invr",id:i.id,error:a.message})}}break;case"sysr":{let s=i.id,a=m.get(s);if(!a)throw Error("Invalid request id");m.delete(s),i.error?a.reject(new Error(i.error)):a.resolve(i.result)}break}})().catch(console.error)}),c({type:"manifest",manifest:t}),D(`[${t.name} plug]`))}async function N(e,t){if(typeof e!="string"){let o=new Uint8Array(await e.arrayBuffer()),n=o.length>0?h(o):void 0;t={method:e.method,headers:Object.fromEntries(e.headers.entries()),base64Body:n},e=e.url}return syscall("sandboxFetch.fetch",e,t)}globalThis.nativeFetch=globalThis.fetch;function K(){globalThis.fetch=async(e,t)=>{let o=t?.body?h(new Uint8Array(await new Response(t.body).arrayBuffer())):void 0,n=await N(e,t&&{method:t.method,headers:t.headers,base64Body:o});return new Response(n.base64Body?L(n.base64Body):null,{status:n.status,headers:n.headers})}}g&&K();var u={};y(u,{alert:()=>Pe,configureVimMode:()=>Oe,confirm:()=>he,copyToClipboard:()=>Fe,deleteLine:()=>Le,dispatch:()=>ye,downloadFile:()=>ne,filterBox:()=>ae,flashNotification:()=>se,fold:()=>ve,foldAll:()=>Me,getCurrentEditor:()=>G,getCurrentPage:()=>O,getCurrentPageMeta:()=>B,getCurrentPath:()=>R,getCursor:()=>$,getRecentlyOpenedPages:()=>j,getSelection:()=>I,getText:()=>W,getUiOption:()=>be,goHistory:()=>oe,hidePanel:()=>ue,insertAtCursor:()=>fe,insertAtPos:()=>pe,invokeCommand:()=>z,isMobile:()=>Re,moveCursor:()=>me,moveCursorToLine:()=>ge,moveLineDown:()=>Ne,moveLineUp:()=>De,navigate:()=>V,newWindow:()=>re,openCommandPalette:()=>H,openPageNavigator:()=>Q,openSearchPanel:()=>Ae,openUrl:()=>te,prompt:()=>xe,rebuildEditorState:()=>Y,redo:()=>Te,reloadConfigAndCommands:()=>ee,reloadPage:()=>_,reloadUI:()=>Z,replaceRange:()=>de,save:()=>X,sendMessage:()=>Be,setSelection:()=>q,setText:()=>J,setUiOption:()=>we,showPanel:()=>ce,showProgress:()=>le,toggleComment:()=>Ue,toggleFold:()=>Se,undo:()=>ke,unfold:()=>Ce,unfoldAll:()=>Ee,uploadFile:()=>ie,vimEx:()=>Ke});typeof globalThis.syscall>"u"&&(globalThis.syscall=()=>{throw new Error("Not implemented here")});function r(e,...t){return globalThis.syscall(e,...t)}function O(){return r("editor.getCurrentPage")}function B(){return r("editor.getCurrentPageMeta")}function R(){return r("editor.getCurrentPath")}function j(){return r("editor.getRecentlyOpenedPages")}function G(){return r("editor.getCurrentEditor")}function W(){return r("editor.getText")}function J(e,t=!1){return r("editor.setText",e,t)}function $(){return r("editor.getCursor")}function I(){return r("editor.getSelection")}function q(e,t){return r("editor.setSelection",e,t)}function z(e,t){return r("editor.invokeCommand",e,t)}function X(){return r("editor.save")}function V(e,t=!1,o=!1){return r("editor.navigate",e,t,o)}function Q(e="page"){return r("editor.openPageNavigator",e)}function H(){return r("editor.openCommandPalette")}function _(){return r("editor.reloadPage")}function Z(){return r("editor.reloadUI")}function Y(){return r("editor.rebuildEditorState")}function ee(){return r("editor.reloadConfigAndCommands")}function te(e,t=!1){return r("editor.openUrl",e,t)}function re(){return r("editor.newWindow")}function oe(e){return r("editor.goHistory",e)}function ne(e,t){return r("editor.downloadFile",e,t)}function ie(e,t){return r("editor.uploadFile",e,t)}function se(e,t="info"){return r("editor.flashNotification",e,t)}function ae(e,t,o="",n=""){return r("editor.filterBox",e,t,o,n)}function ce(e,t,o,n=""){return r("editor.showPanel",e,t,o,n)}function ue(e){return r("editor.hidePanel",e)}function le(e,t){return r("editor.showProgress",e,t)}function pe(e,t){return r("editor.insertAtPos",e,t)}function de(e,t,o){return r("editor.replaceRange",e,t,o)}function me(e,t=!1){return r("editor.moveCursor",e,t)}function ge(e,t=1,o=!1){return r("editor.moveCursorToLine",e,t,o)}function fe(e,t=!1,o=!1){return r("editor.insertAtCursor",e,t,o)}function ye(e){return r("editor.dispatch",e)}function xe(e,t=""){return r("editor.prompt",e,t)}function he(e){return r("editor.confirm",e)}function Pe(e){return r("editor.alert",e)}function be(e){return r("editor.getUiOption",e)}function we(e,t){return r("editor.setUiOption",e,t)}function ve(){return r("editor.fold")}function Ce(){return r("editor.unfold")}function Se(){return r("editor.toggleFold")}function Me(){return r("editor.foldAll")}function Ee(){return r("editor.unfoldAll")}function ke(){return r("editor.undo")}function Te(){return r("editor.redo")}function Ae(){return r("editor.openSearchPanel")}function Fe(e){return r("editor.copyToClipboard",e)}function Le(){return r("editor.deleteLine")}function Ue(){return r("editor.toggleComment")}function De(){return r("editor.moveLineUp")}function Ne(){return r("editor.moveLineDown")}function Ke(e){return r("editor.vimEx",e)}function Oe(){return r("editor.configureVimMode")}function Be(e,t){return r("editor.sendMessage",e,t)}function Re(){return r("editor.isMobile")}var l={};y(l,{deleteDocument:()=>Ze,deleteFile:()=>it,deletePage:()=>ze,fileExists:()=>st,getDocumentMeta:()=>Qe,getFileMeta:()=>ot,getPageMeta:()=>We,listDocuments:()=>Ve,listFiles:()=>Ye,listPages:()=>Ge,listPlugs:()=>Xe,pageExists:()=>Je,readDocument:()=>He,readFile:()=>et,readFileWithMeta:()=>rt,readPage:()=>$e,readPageWithMeta:()=>Ie,readRef:()=>tt,writeDocument:()=>_e,writeFile:()=>nt,writePage:()=>qe});function Ge(){return r("space.listPages")}function We(e){return r("space.getPageMeta",e)}function Je(e){return r("space.pageExists",e)}function $e(e){return r("space.readPage",e)}function Ie(e){return r("space.readPageWithMeta",e)}function qe(e,t){return r("space.writePage",e,t)}function ze(e){return r("space.deletePage",e)}function Xe(){return r("space.listPlugs")}function Ve(){return r("space.listDocuments")}function Qe(e){return r("space.getDocumentMeta",e)}function He(e){return r("space.readDocument",e)}function _e(e,t){return r("space.writeDocument",e,t)}function Ze(e){return r("space.deleteDocument",e)}function Ye(){return r("space.listFiles")}function et(e){return r("space.readFile",e)}function tt(e){return r("space.readRef",e)}function rt(e){return r("space.readFileWithMeta",e)}function ot(e){return r("space.getFileMeta",e)}function nt(e,t){return r("space.writeFile",e,t)}function it(e){return r("space.deleteFile",e)}function st(e){return r("space.fileExists",e)}var Xt=new Uint8Array(16);var wt="400px",f=13,b=0;function C(e){return e.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function w(e){return{html:`<pre style="color: #b42318; background: #fef3f2; padding: 0.75rem; border: 1px solid #fecdca; border-radius: 4px; white-space: pre-wrap;">${C(e)}</pre>`,script:""}}function vt(){b+=1;let e="";return typeof crypto<"u"&&"randomUUID"in crypto?e=crypto.randomUUID():e=Math.random().toString(36).slice(2,10),`gpx-map-${b}-${e}`}function Ct(e){let t={};for(let o of e.split(/\r?\n/)){let n=o.trim();if(!n)continue;let i=n.indexOf(":");if(i===-1)continue;let s=n.slice(0,i).trim().toLowerCase(),a=n.slice(i+1).trim();if(a){if(s==="source"||s==="url"||s==="height")t[s]=a;else if(s==="zoom")t.zoom=Number.parseFloat(a);else if(s==="center")try{t.center=JSON.parse(a)}catch{t.center=a}}}return t}function St(e){let t=e.trim();if(!t)return{};if(t.startsWith("{")){let o;try{o=JSON.parse(t)}catch(n){let i=n instanceof Error?n.message:"Unknown JSON parse error.";throw new Error(`Map config must be valid JSON: ${i}`)}if(!o||typeof o!="object"||Array.isArray(o))throw new Error("Map config JSON must be an object.");return o}return Ct(e)}function p(e){return typeof e=="string"&&e.trim()?e.trim():void 0}function Mt(e){if(!Array.isArray(e)||e.length!==2)return;let t=Number(e[0]),o=Number(e[1]);if(!(!Number.isFinite(t)||!Number.isFinite(o)))return[t,o]}function Et(e){if(e===void 0)return[];if(!Array.isArray(e))throw new Error("`markers` must be an array of marker objects.");return e.map((t,o)=>{if(!t||typeof t!="object"||Array.isArray(t))throw new Error(`Marker ${o+1} must be an object.`);let n=t,i=Number(n.lat),s=Number(n.lon);if(!Number.isFinite(i)||!Number.isFinite(s))throw new Error(`Marker ${o+1} must include numeric \`lat\` and \`lon\`.`);let a=p(n.label),A=p(n.popup);return{lat:i,lon:s,label:a,popup:A}})}function kt(e){let t=p(e.source)||p(e.url),o=p(e.height)||wt,n=e.center===void 0?void 0:Mt(e.center);if(e.center!==void 0&&!n)throw new Error("`center` must be a JSON array like [lat, lon].");let i=e.zoom===void 0?void 0:Number(e.zoom);if(e.zoom!==void 0&&!Number.isFinite(i))throw new Error("`zoom` must be a number.");return{source:t,height:o,center:n,zoom:i,markers:Et(e.markers)}}function v(e,t){let o=e.matchAll(new RegExp(`<${t}\\b[^>]*?lat=["']([^"']+)["'][^>]*?lon=["']([^"']+)["'][^>]*?>`,"gi")),n=[];for(let i of o){let s=Number.parseFloat(i[1]),a=Number.parseFloat(i[2]);Number.isFinite(s)&&Number.isFinite(a)&&n.push([s,a])}return n}function Tt(e){return/<(?:\w+:)?gpx\b/i.test(e)}function At(e){return typeof e=="string"&&["Feature","FeatureCollection","Point","MultiPoint","LineString","MultiLineString","Polygon","MultiPolygon","GeometryCollection"].includes(e)}function Ft(e,t){let o;try{o=JSON.parse(e)}catch(i){let s=i instanceof Error?i.message:"Unknown JSON parse error.";throw new Error(`GeoJSON Error: Invalid JSON in ${t}: ${s}`)}if(!o||typeof o!="object"||Array.isArray(o))throw new Error(`GeoJSON Error: ${t} must contain a GeoJSON object.`);let n=o;if(!At(n.type))throw new Error(`GeoJSON Error: Unsupported or missing GeoJSON type in ${t}.`);return n}async function Lt(e){if(!await l.fileExists(e))throw new Error(`Map Error: File not found: ${e}`);let o=new TextDecoder().decode(await l.readFile(e)),n=e.toLowerCase();if(n.endsWith(".gpx")){if(!Tt(o))throw new Error(`GPX Map Error: File is not valid GPX XML: ${e}`);let i=v(o,"trkpt"),s=v(o,"wpt");if(i.length===0&&s.length===0)throw new Error(`GPX Map Error: No usable trackpoints or waypoints found in ${e}`);return{kind:"gpx",content:o}}if(n.endsWith(".geojson")||n.endsWith(".json"))return{kind:"geojson",data:Ft(o,e)};throw new Error(`Map Error: Unsupported file type for ${e}. Use .gpx, .geojson, or .json.`)}function Ut(){return`\`\`\`gpxmap
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
\`\`\``}async function S(){let e=await u.getSelection(),{from:t,to:o}=e;await u.replaceRange(t,o,Ut())}function Dt(e,t){return`
    (function() {
      const mapId = ${JSON.stringify(t)};
      const payload = ${JSON.stringify(e)};
      const globalKey = "__gpxMapLeafletLoader";
      const mapStoreKey = "__gpxMapInstances";

      function loadLeaflet() {
        if (globalThis[globalKey]) {
          return globalThis[globalKey];
        }

        globalThis[globalKey] = new Promise((resolve, reject) => {
          const existingStylesheet = document.querySelector('link[data-gpxmap-leaflet="true"]');
          if (!existingStylesheet) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            link.setAttribute('data-gpxmap-leaflet', 'true');
            document.head.appendChild(link);
          }

          if (typeof globalThis.L !== 'undefined') {
            resolve(globalThis.L);
            return;
          }

          const existingScript = document.querySelector('script[data-gpxmap-leaflet="true"]');
          if (existingScript) {
            existingScript.addEventListener('load', () => resolve(globalThis.L), { once: true });
            existingScript.addEventListener('error', () => reject(new Error('Failed to load Leaflet.')), { once: true });
            return;
          }

          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.setAttribute('data-gpxmap-leaflet', 'true');
          script.onload = () => resolve(globalThis.L);
          script.onerror = () => reject(new Error('Failed to load Leaflet.'));
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

      function parseCoordinates(doc, selector) {
        return Array.from(doc.querySelectorAll(selector))
          .map((point) => {
            const lat = Number.parseFloat(point.getAttribute('lat') || '');
            const lon = Number.parseFloat(point.getAttribute('lon') || '');
            return Number.isFinite(lat) && Number.isFinite(lon) ? [lat, lon] : null;
          })
          .filter(Boolean);
      }

      function parseWaypoints(doc) {
        return Array.from(doc.querySelectorAll('wpt'))
          .map((point) => {
            const lat = Number.parseFloat(point.getAttribute('lat') || '');
            const lon = Number.parseFloat(point.getAttribute('lon') || '');
            if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
              return null;
            }

            const nameNode = point.querySelector('name');
            return {
              coordinate: [lat, lon],
              name: nameNode && nameNode.textContent ? nameNode.textContent : 'Waypoint'
            };
          })
          .filter(Boolean);
      }

      function bindPopupIfPresent(layer, text) {
        if (text) {
          layer.bindPopup(String(text));
        }
      }

      function initMap() {
        const element = document.getElementById(mapId);
        if (!element) {
          return;
        }

        if (!globalThis[mapStoreKey]) {
          globalThis[mapStoreKey] = {};
        }

        const existingMap = globalThis[mapStoreKey][mapId];
        if (existingMap) {
          existingMap.remove();
        }

        const config = payload.config;
        const hasExplicitCenter = Array.isArray(config.center);
        const initialCenter = hasExplicitCenter ? config.center : [0, 0];
        const initialZoom = hasExplicitCenter && typeof config.zoom === 'number'
          ? config.zoom
          : ${f};

        const map = L.map(mapId).setView(initialCenter, initialZoom);
        globalThis[mapStoreKey][mapId] = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '\xA9 OpenStreetMap contributors'
        }).addTo(map);

        const fitCoordinates = [];

        function addFitCoordinate(coordinate) {
          fitCoordinates.push(coordinate);
        }

        function addBounds(bounds) {
          if (!bounds || !bounds.isValid()) {
            return;
          }

          const southWest = bounds.getSouthWest();
          const northEast = bounds.getNorthEast();
          addFitCoordinate([southWest.lat, southWest.lng]);
          addFitCoordinate([northEast.lat, northEast.lng]);
        }

        if (payload.sourceData && payload.sourceData.kind === 'gpx') {
          const parser = new DOMParser();
          const gpx = parser.parseFromString(payload.sourceData.content, 'application/xml');
          if (gpx.querySelector('parsererror')) {
            renderError('GPX Map Error: Could not parse GPX XML.');
            return;
          }

          const tracks = parseCoordinates(gpx, 'trkpt');
          const waypoints = parseWaypoints(gpx);

          if (tracks.length === 0 && waypoints.length === 0) {
            renderError('GPX Map Error: No usable trackpoints or waypoints found.');
            return;
          }

          if (tracks.length > 0) {
            const polyline = L.polyline(tracks, {
              color: '#0066cc',
              weight: 4,
              opacity: 0.8
            }).addTo(map);
            addBounds(polyline.getBounds());

            L.marker(tracks[0], { title: 'Start' }).addTo(map).bindPopup('Start');
            L.marker(tracks[tracks.length - 1], { title: 'End' }).addTo(map).bindPopup('End');
          } else {
            waypoints.forEach((point) => {
              L.marker(point.coordinate).addTo(map).bindPopup(point.name);
              addFitCoordinate(point.coordinate);
            });
          }
        }

        if (payload.sourceData && payload.sourceData.kind === 'geojson') {
          const geoJsonLayer = L.geoJSON(payload.sourceData.data, {
            onEachFeature: (feature, layer) => {
              const props = feature && feature.properties && typeof feature.properties === 'object'
                ? feature.properties
                : null;
              const popupText = props && (props.popup || props.name);
              bindPopupIfPresent(layer, popupText);
            }
          }).addTo(map);
          const geoJsonBounds = geoJsonLayer.getBounds();
          if (!geoJsonBounds.isValid()) {
            if (config.markers.length === 0) {
              renderError('GeoJSON Error: No renderable features found.');
              return;
            }
          } else {
            addBounds(geoJsonBounds);
          }
        }

        config.markers.forEach((marker) => {
          const layer = L.marker([marker.lat, marker.lon]).addTo(map);
          bindPopupIfPresent(layer, marker.popup || marker.label);
          addFitCoordinate([marker.lat, marker.lon]);
        });

        if (hasExplicitCenter) {
          map.setView(config.center, typeof config.zoom === 'number' ? config.zoom : ${f});
          return;
        }

        if (fitCoordinates.length === 0) {
          return;
        }

        const bounds = L.latLngBounds(fitCoordinates);
        if (!bounds.isValid()) {
          return;
        }

        const southWest = bounds.getSouthWest();
        const northEast = bounds.getNorthEast();
        if (southWest.lat === northEast.lat && southWest.lng === northEast.lng) {
          map.setView([southWest.lat, southWest.lng], ${f});
          return;
        }

        map.fitBounds(bounds, { padding: [20, 20] });
      }

      loadLeaflet().then(initMap).catch((error) => {
        renderError('Map Error: ' + (error && error.message ? error.message : 'Unable to initialize map.'));
      });
    })();
  `}async function M(e){try{let t=kt(St(e)),o=t.source?await Lt(t.source):void 0;if(!o&&t.markers.length===0&&!t.center)return w("Map Error: Provide a source file, at least one marker, or a center coordinate.");let n=vt();return{html:`<div id="${n}" style="height: ${C(t.height)}; width: 100%; border: 1px solid #ccc; border-radius: 4px;"></div>`,script:Dt({config:t,sourceData:o},n)}}catch(t){let o=t instanceof Error?t.message:"Unknown map rendering error.";return w(o)}}function E(){return{options:[{label:"gpxmap",detail:"Insert generic map widget",invoke:"gpxmap.insertGPXMap"}]}}var k={insertGPXMap:S,renderGPXWidget:M,gpxSlashComplete:E},T={name:"gpxmap",version:.1,imports:["https://get.silverbullet.md/global.plug.json"],functions:{insertGPXMap:{path:"./gpxmap.ts:insertGPXMap",command:{name:"Map: Insert Widget",requireMode:"rw"}},renderGPXWidget:{path:"./gpxmap.ts:renderGPXWidget",codeWidget:"gpxmap"},gpxSlashComplete:{path:"./gpxmap.ts:gpxSlashComplete",events:["slash:complete"]}},assets:{}},gr={manifest:T,functionMapping:k};P(k,T,self.postMessage);export{gr as plug};
//# sourceMappingURL=gpxmap.plug.js.map
