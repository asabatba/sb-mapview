var N=Object.defineProperty;var m=(e,t)=>{for(var o in t)N(e,o,{get:t[o],enumerable:!0})};function O(e){let t=atob(e),o=t.length,n=new Uint8Array(o);for(let i=0;i<o;i++)n[i]=t.charCodeAt(i);return n}function v(e){typeof e=="string"&&(e=new TextEncoder().encode(e));let t="",o=e.byteLength;for(let n=0;n<o;n++)t+=String.fromCharCode(e[n]);return btoa(t)}var Xt=new Uint8Array(16),K=class{constructor(e="",t=1e3){this.prefix=e,this.maxCaptureSize=t,this.prefix=e,this.originalConsole={log:console.log.bind(console),info:console.info.bind(console),warn:console.warn.bind(console),error:console.error.bind(console),debug:console.debug.bind(console)},this.patchConsole()}originalConsole;logBuffer=[];patchConsole(){let e=t=>(...o)=>{let n=this.prefix?[this.prefix,...o]:o;this.originalConsole[t](...n),this.captureLog(t,o)};console.log=e("log"),console.info=e("info"),console.warn=e("warn"),console.error=e("error"),console.debug=e("debug")}captureLog(e,t){let o={level:e,timestamp:Date.now(),message:t.map(n=>{if(typeof n=="string")return n;try{return JSON.stringify(n)}catch{return String(n)}}).join(" ")};this.logBuffer.push(o),this.logBuffer.length>this.maxCaptureSize&&this.logBuffer.shift()}async postToServer(e,t){if(this.logBuffer.length>0){let n=[...this.logBuffer];this.logBuffer=[];try{if(!(await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n.map(s=>({...s,source:t})))})).ok)throw new Error("Failed to post logs to server")}catch(i){console.warn("Could not post logs to server",i.message),this.logBuffer.unshift(...n)}}}},w;function B(e=""){return w=new K(e),w}var l=e=>{throw new Error("Not initialized yet")},y=typeof window>"u"&&typeof globalThis.WebSocketPair>"u",f=new Map,g=0;y&&(globalThis.syscall=async(e,...t)=>await new Promise((o,n)=>{g++,f.set(g,{resolve:o,reject:n}),l({type:"sys",id:g,name:e,args:t})}));function C(e,t,o){y&&(l=o,self.addEventListener("message",n=>{(async()=>{let i=n.data;switch(i.type){case"inv":{let s=e[i.name];if(!s)throw new Error(`Function not loaded: ${i.name}`);try{let a=await Promise.resolve(s(...i.args||[]));l({type:"invr",id:i.id,result:a})}catch(a){console.error("An exception was thrown as a result of invoking function",i.name,"error:",a.message),l({type:"invr",id:i.id,error:a.message})}}break;case"sysr":{let s=i.id,a=f.get(s);if(!a)throw Error("Invalid request id");f.delete(s),i.error?a.reject(new Error(i.error)):a.resolve(i.result)}break}})().catch(console.error)}),l({type:"manifest",manifest:t}),B(`[${t.name} plug]`))}async function R(e,t){if(typeof e!="string"){let o=new Uint8Array(await e.arrayBuffer()),n=o.length>0?v(o):void 0;t={method:e.method,headers:Object.fromEntries(e.headers.entries()),base64Body:n},e=e.url}return syscall("sandboxFetch.fetch",e,t)}globalThis.nativeFetch=globalThis.fetch;function j(){globalThis.fetch=async(e,t)=>{let o=t?.body?v(new Uint8Array(await new Response(t.body).arrayBuffer())):void 0,n=await R(e,t&&{method:t.method,headers:t.headers,base64Body:o});return new Response(n.base64Body?O(n.base64Body):null,{status:n.status,headers:n.headers})}}y&&j();var p={};m(p,{alert:()=>Ce,configureVimMode:()=>Ge,confirm:()=>ve,copyToClipboard:()=>Ne,deleteLine:()=>Oe,dispatch:()=>be,downloadFile:()=>ce,filterBox:()=>pe,flashNotification:()=>le,fold:()=>Ee,foldAll:()=>Ae,getCurrentEditor:()=>J,getCurrentPage:()=>G,getCurrentPageMeta:()=>W,getCurrentPath:()=>$,getCursor:()=>X,getRecentlyOpenedPages:()=>I,getSelection:()=>V,getText:()=>q,getUiOption:()=>Se,goHistory:()=>ae,hidePanel:()=>me,insertAtCursor:()=>Pe,insertAtPos:()=>fe,invokeCommand:()=>Q,isMobile:()=>$e,moveCursor:()=>xe,moveCursorToLine:()=>he,moveLineDown:()=>Re,moveLineUp:()=>Be,navigate:()=>Z,newWindow:()=>se,openCommandPalette:()=>ee,openPageNavigator:()=>Y,openSearchPanel:()=>De,openUrl:()=>ie,prompt:()=>we,rebuildEditorState:()=>oe,redo:()=>Ue,reloadConfigAndCommands:()=>ne,reloadPage:()=>te,reloadUI:()=>re,replaceRange:()=>ye,save:()=>H,sendMessage:()=>We,setSelection:()=>_,setText:()=>z,setUiOption:()=>Me,showPanel:()=>de,showProgress:()=>ge,toggleComment:()=>Ke,toggleFold:()=>ke,undo:()=>Le,unfold:()=>Te,unfoldAll:()=>Fe,uploadFile:()=>ue,vimEx:()=>je});typeof globalThis.syscall>"u"&&(globalThis.syscall=()=>{throw new Error("Not implemented here")});function r(e,...t){return globalThis.syscall(e,...t)}function G(){return r("editor.getCurrentPage")}function W(){return r("editor.getCurrentPageMeta")}function $(){return r("editor.getCurrentPath")}function I(){return r("editor.getRecentlyOpenedPages")}function J(){return r("editor.getCurrentEditor")}function q(){return r("editor.getText")}function z(e,t=!1){return r("editor.setText",e,t)}function X(){return r("editor.getCursor")}function V(){return r("editor.getSelection")}function _(e,t){return r("editor.setSelection",e,t)}function Q(e,t){return r("editor.invokeCommand",e,t)}function H(){return r("editor.save")}function Z(e,t=!1,o=!1){return r("editor.navigate",e,t,o)}function Y(e="page"){return r("editor.openPageNavigator",e)}function ee(){return r("editor.openCommandPalette")}function te(){return r("editor.reloadPage")}function re(){return r("editor.reloadUI")}function oe(){return r("editor.rebuildEditorState")}function ne(){return r("editor.reloadConfigAndCommands")}function ie(e,t=!1){return r("editor.openUrl",e,t)}function se(){return r("editor.newWindow")}function ae(e){return r("editor.goHistory",e)}function ce(e,t){return r("editor.downloadFile",e,t)}function ue(e,t){return r("editor.uploadFile",e,t)}function le(e,t="info"){return r("editor.flashNotification",e,t)}function pe(e,t,o="",n=""){return r("editor.filterBox",e,t,o,n)}function de(e,t,o,n=""){return r("editor.showPanel",e,t,o,n)}function me(e){return r("editor.hidePanel",e)}function ge(e,t){return r("editor.showProgress",e,t)}function fe(e,t){return r("editor.insertAtPos",e,t)}function ye(e,t,o){return r("editor.replaceRange",e,t,o)}function xe(e,t=!1){return r("editor.moveCursor",e,t)}function he(e,t=1,o=!1){return r("editor.moveCursorToLine",e,t,o)}function Pe(e,t=!1,o=!1){return r("editor.insertAtCursor",e,t,o)}function be(e){return r("editor.dispatch",e)}function we(e,t=""){return r("editor.prompt",e,t)}function ve(e){return r("editor.confirm",e)}function Ce(e){return r("editor.alert",e)}function Se(e){return r("editor.getUiOption",e)}function Me(e,t){return r("editor.setUiOption",e,t)}function Ee(){return r("editor.fold")}function Te(){return r("editor.unfold")}function ke(){return r("editor.toggleFold")}function Ae(){return r("editor.foldAll")}function Fe(){return r("editor.unfoldAll")}function Le(){return r("editor.undo")}function Ue(){return r("editor.redo")}function De(){return r("editor.openSearchPanel")}function Ne(e){return r("editor.copyToClipboard",e)}function Oe(){return r("editor.deleteLine")}function Ke(){return r("editor.toggleComment")}function Be(){return r("editor.moveLineUp")}function Re(){return r("editor.moveLineDown")}function je(e){return r("editor.vimEx",e)}function Ge(){return r("editor.configureVimMode")}function We(e,t){return r("editor.sendMessage",e,t)}function $e(){return r("editor.isMobile")}var d={};m(d,{deleteDocument:()=>rt,deleteFile:()=>ut,deletePage:()=>Qe,fileExists:()=>lt,getDocumentMeta:()=>Ye,getFileMeta:()=>at,getPageMeta:()=>qe,listDocuments:()=>Ze,listFiles:()=>ot,listPages:()=>Je,listPlugs:()=>He,pageExists:()=>ze,readDocument:()=>et,readFile:()=>nt,readFileWithMeta:()=>st,readPage:()=>Xe,readPageWithMeta:()=>Ve,readRef:()=>it,writeDocument:()=>tt,writeFile:()=>ct,writePage:()=>_e});function Je(){return r("space.listPages")}function qe(e){return r("space.getPageMeta",e)}function ze(e){return r("space.pageExists",e)}function Xe(e){return r("space.readPage",e)}function Ve(e){return r("space.readPageWithMeta",e)}function _e(e,t){return r("space.writePage",e,t)}function Qe(e){return r("space.deletePage",e)}function He(){return r("space.listPlugs")}function Ze(){return r("space.listDocuments")}function Ye(e){return r("space.getDocumentMeta",e)}function et(e){return r("space.readDocument",e)}function tt(e,t){return r("space.writeDocument",e,t)}function rt(e){return r("space.deleteDocument",e)}function ot(){return r("space.listFiles")}function nt(e){return r("space.readFile",e)}function it(e){return r("space.readRef",e)}function st(e){return r("space.readFileWithMeta",e)}function at(e){return r("space.getFileMeta",e)}function ct(e,t){return r("space.writeFile",e,t)}function ut(e){return r("space.deleteFile",e)}function lt(e){return r("space.fileExists",e)}var ir=new Uint8Array(16);var c={};m(c,{define:()=>Tt,get:()=>Ct,has:()=>Et,insert:()=>Mt,set:()=>St});function Ct(e,t){return r("config.get",e,t)}function St(e,t){return r("config.set",e,t)}function Mt(e,t){return r("config.insert",e,t)}function Et(e){return r("config.has",e)}function Tt(e,t){return r("config.define",e,t)}var At="400px",x=13,P="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",b="\xA9 OpenStreetMap contributors",S=0,h;function T(e){return e.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function M(e){return{html:`<pre style="color: #b42318; background: #fef3f2; padding: 0.75rem; border: 1px solid #fecdca; border-radius: 4px; white-space: pre-wrap;">${T(e)}</pre>`,script:""}}function Ft(){S+=1;let e="";return typeof crypto<"u"&&"randomUUID"in crypto?e=crypto.randomUUID():e=Math.random().toString(36).slice(2,10),`gpx-map-${S}-${e}`}function Lt(e){let t={};for(let o of e.split(/\r?\n/)){let n=o.trim();if(!n)continue;let i=n.indexOf(":");if(i===-1)continue;let s=n.slice(0,i).trim().toLowerCase(),a=n.slice(i+1).trim();if(a){if(s==="source"||s==="url"||s==="height")t[s]=a;else if(s==="zoom")t.zoom=Number.parseFloat(a);else if(s==="center")try{t.center=JSON.parse(a)}catch{t.center=a}}}return t}function Ut(e){let t=e.trim();if(!t)return{};if(t.startsWith("{")){let o;try{o=JSON.parse(t)}catch(n){let i=n instanceof Error?n.message:"Unknown JSON parse error.";throw new Error(`Map config must be valid JSON: ${i}`)}if(!o||typeof o!="object"||Array.isArray(o))throw new Error("Map config JSON must be an object.");return o}return Lt(e)}function u(e){return typeof e=="string"&&e.trim()?e.trim():void 0}function Dt(e){if(!Array.isArray(e)||e.length!==2)return;let t=Number(e[0]),o=Number(e[1]);if(!(!Number.isFinite(t)||!Number.isFinite(o)))return[t,o]}function Nt(e){if(e===void 0)return[];if(!Array.isArray(e))throw new Error("`markers` must be an array of marker objects.");return e.map((t,o)=>{if(!t||typeof t!="object"||Array.isArray(t))throw new Error(`Marker ${o+1} must be an object.`);let n=t,i=Number(n.lat),s=Number(n.lon);if(!Number.isFinite(i)||!Number.isFinite(s))throw new Error(`Marker ${o+1} must include numeric \`lat\` and \`lon\`.`);let a=u(n.label),D=u(n.popup);return{lat:i,lon:s,label:a,popup:D}})}function Ot(e){let t=u(e.source)||u(e.url),o=u(e.height)||At,n=e.center===void 0?void 0:Dt(e.center);if(e.center!==void 0&&!n)throw new Error("`center` must be a JSON array like [lat, lon].");let i=e.zoom===void 0?void 0:Number(e.zoom);if(e.zoom!==void 0&&!Number.isFinite(i))throw new Error("`zoom` must be a number.");return{source:t,height:o,center:n,zoom:i,markers:Nt(e.markers)}}function E(e,t){let o=e.matchAll(new RegExp(`<${t}\\b[^>]*?lat=["']([^"']+)["'][^>]*?lon=["']([^"']+)["'][^>]*?>`,"gi")),n=[];for(let i of o){let s=Number.parseFloat(i[1]),a=Number.parseFloat(i[2]);Number.isFinite(s)&&Number.isFinite(a)&&n.push([s,a])}return n}function Kt(e){return/<(?:\w+:)?gpx\b/i.test(e)}function Bt(e){return typeof e=="string"&&["Feature","FeatureCollection","Point","MultiPoint","LineString","MultiLineString","Polygon","MultiPolygon","GeometryCollection"].includes(e)}function Rt(e,t){let o;try{o=JSON.parse(e)}catch(i){let s=i instanceof Error?i.message:"Unknown JSON parse error.";throw new Error(`GeoJSON Error: Invalid JSON in ${t}: ${s}`)}if(!o||typeof o!="object"||Array.isArray(o))throw new Error(`GeoJSON Error: ${t} must contain a GeoJSON object.`);let n=o;if(!Bt(n.type))throw new Error(`GeoJSON Error: Unsupported or missing GeoJSON type in ${t}.`);return n}function jt(e){let t=e.trim();return t?t.startsWith("/")?[t,t.slice(1)]:[t,`/${t}`]:[]}async function Gt(e){let t;for(let n of jt(e))try{return new TextDecoder().decode(await d.readFile(n))}catch(i){t=i}throw(t instanceof Error?t.message:"")?new Error(`Map Error: File not found: ${e}`):new Error(`Map Error: File not found: ${e}`)}async function Wt(e){let t=await Gt(e),o=e.toLowerCase();if(o.endsWith(".gpx")){if(!Kt(t))throw new Error(`GPX Map Error: File is not valid GPX XML: ${e}`);let n=E(t,"trkpt"),i=E(t,"wpt");if(n.length===0&&i.length===0)throw new Error(`GPX Map Error: No usable trackpoints or waypoints found in ${e}`);return{kind:"gpx",content:t}}if(o.endsWith(".geojson")||o.endsWith(".json"))return{kind:"geojson",data:Rt(t,e)};throw new Error(`Map Error: Unsupported file type for ${e}. Use .gpx, .geojson, or .json.`)}function $t(){return`\`\`\`gpxmap
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
\`\`\``}async function k(){let e=await p.getSelection(),{from:t,to:o}=e;await p.replaceRange(t,o,$t())}async function It(){h||(h=Promise.all([c.define("gpxmap.tileUrl",{type:"string",default:P,description:"Leaflet tile URL template used by gpxmap."}),c.define("gpxmap.tileAttribution",{type:"string",default:b,description:"Leaflet attribution text used by gpxmap."})]).then(()=>{})),await h}async function Jt(){await It();let e=await c.get("gpxmap.tileUrl",P),t=await c.get("gpxmap.tileAttribution",b);return{tileUrl:u(e)||P,tileAttribution:u(t)||b}}function qt(e,t){return`
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
          : ${x};

        const map = L.map(mapId).setView(initialCenter, initialZoom);
        globalThis[mapStoreKey][mapId] = map;

        L.tileLayer(payload.tileUrl, {
          attribution: payload.tileAttribution
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
          map.setView(config.center, typeof config.zoom === 'number' ? config.zoom : ${x});
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
          map.setView([southWest.lat, southWest.lng], ${x});
          return;
        }

        map.fitBounds(bounds, { padding: [20, 20] });
      }

      loadLeaflet().then(initMap).catch((error) => {
        renderError('Map Error: ' + (error && error.message ? error.message : 'Unable to initialize map.'));
      });
    })();
  `}async function A(e){try{let t=Ot(Ut(e)),o=t.source?await Wt(t.source):void 0,n=await Jt();if(!o&&t.markers.length===0&&!t.center)return M("Map Error: Provide a source file, at least one marker, or a center coordinate.");let i=Ft();return{html:`<div id="${i}" style="height: ${T(t.height)}; width: 100%; border: 1px solid #ccc; border-radius: 4px;"></div>`,script:qt({config:t,sourceData:o,...n},i)}}catch(t){let o=t instanceof Error?t.message:"Unknown map rendering error.";return M(o)}}function F(){return{options:[{label:"gpxmap",detail:"Insert generic map widget",invoke:"gpxmap.insertGPXMap"}]}}var L={insertGPXMap:k,renderGPXWidget:A,gpxSlashComplete:F},U={name:"gpxmap",version:.1,imports:["https://get.silverbullet.md/global.plug.json"],functions:{insertGPXMap:{path:"./gpxmap.ts:insertGPXMap",command:{name:"Map: Insert Widget",requireMode:"rw"}},renderGPXWidget:{path:"./gpxmap.ts:renderGPXWidget",codeWidget:"gpxmap"},gpxSlashComplete:{path:"./gpxmap.ts:gpxSlashComplete",events:["slash:complete"]}},assets:{}},Er={manifest:U,functionMapping:L};C(L,U,self.postMessage);export{Er as plug};
//# sourceMappingURL=gpxmap.plug.js.map
