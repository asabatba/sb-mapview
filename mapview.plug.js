var G=Object.defineProperty;var y=(e,r)=>{for(var t in r)G(e,t,{get:r[t],enumerable:!0})};function $(e){let r=atob(e),t=r.length,n=new Uint8Array(t);for(let i=0;i<t;i++)n[i]=r.charCodeAt(i);return n}function k(e){typeof e=="string"&&(e=new TextEncoder().encode(e));let r="",t=e.byteLength;for(let n=0;n<t;n++)r+=String.fromCharCode(e[n]);return btoa(r)}var pt=new Uint8Array(16),B=class{constructor(e="",r=1e3){this.prefix=e,this.maxCaptureSize=r,this.prefix=e,this.originalConsole={log:console.log.bind(console),info:console.info.bind(console),warn:console.warn.bind(console),error:console.error.bind(console),debug:console.debug.bind(console)},this.patchConsole()}originalConsole;logBuffer=[];patchConsole(){let e=r=>(...t)=>{let n=this.prefix?[this.prefix,...t]:t;this.originalConsole[r](...n),this.captureLog(r,t)};console.log=e("log"),console.info=e("info"),console.warn=e("warn"),console.error=e("error"),console.debug=e("debug")}captureLog(e,r){let t={level:e,timestamp:Date.now(),message:r.map(n=>{if(typeof n=="string")return n;try{return JSON.stringify(n)}catch{return String(n)}}).join(" ")};this.logBuffer.push(t),this.logBuffer.length>this.maxCaptureSize&&this.logBuffer.shift()}async postToServer(e,r){if(this.logBuffer.length>0){let n=[...this.logBuffer];this.logBuffer=[];try{if(!(await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n.map(s=>({...s,source:r})))})).ok)throw new Error("Failed to post logs to server")}catch(i){console.warn("Could not post logs to server",i.message),this.logBuffer.unshift(...n)}}}},v;function J(e=""){return v=new B(e),v}var p=e=>{throw new Error("Not initialized yet")},x=typeof window>"u"&&typeof globalThis.WebSocketPair>"u",b=new Map,h=0;x&&(globalThis.syscall=async(e,...r)=>await new Promise((t,n)=>{h++,b.set(h,{resolve:t,reject:n}),p({type:"sys",id:h,name:e,args:r})}));function C(e,r,t){x&&(p=t,self.addEventListener("message",n=>{(async()=>{let i=n.data;switch(i.type){case"inv":{let s=e[i.name];if(!s)throw new Error(`Function not loaded: ${i.name}`);try{let a=await Promise.resolve(s(...i.args||[]));p({type:"invr",id:i.id,result:a})}catch(a){console.error("An exception was thrown as a result of invoking function",i.name,"error:",a.message),p({type:"invr",id:i.id,error:a.message})}}break;case"sysr":{let s=i.id,a=b.get(s);if(!a)throw Error("Invalid request id");b.delete(s),i.error?a.reject(new Error(i.error)):a.resolve(i.result)}break}})().catch(console.error)}),p({type:"manifest",manifest:r}),J(`[${r.name} plug]`))}async function z(e,r){if(typeof e!="string"){let t=new Uint8Array(await e.arrayBuffer()),n=t.length>0?k(t):void 0;r={method:e.method,headers:Object.fromEntries(e.headers.entries()),base64Body:n},e=e.url}return syscall("sandboxFetch.fetch",e,r)}globalThis.nativeFetch=globalThis.fetch;function V(){globalThis.fetch=async(e,r)=>{let t=r?.body?k(new Uint8Array(await new Response(r.body).arrayBuffer())):void 0,n=await z(e,r&&{method:r.method,headers:r.headers,base64Body:t});return new Response(n.base64Body?$(n.base64Body):null,{status:n.status,headers:n.headers})}}x&&V();var d={};y(d,{alert:()=>Ae,configureVimMode:()=>qe,confirm:()=>Le,copyToClipboard:()=>Ge,deleteLine:()=>$e,dispatch:()=>Ee,downloadFile:()=>ge,filterBox:()=>be,flashNotification:()=>he,fold:()=>Oe,foldAll:()=>je,getCurrentEditor:()=>X,getCurrentPage:()=>q,getCurrentPageMeta:()=>H,getCurrentPath:()=>_,getCursor:()=>ee,getRecentlyOpenedPages:()=>Q,getSelection:()=>re,getText:()=>Z,getUiOption:()=>Fe,goHistory:()=>fe,hidePanel:()=>Pe,insertAtCursor:()=>Me,insertAtPos:()=>Se,invokeCommand:()=>oe,isMobile:()=>_e,moveCursor:()=>ke,moveCursorToLine:()=>Ce,moveLineDown:()=>ze,moveLineUp:()=>Je,navigate:()=>ie,newWindow:()=>me,openCommandPalette:()=>ae,openPageNavigator:()=>se,openSearchPanel:()=>We,openUrl:()=>de,prompt:()=>Te,rebuildEditorState:()=>ue,redo:()=>Ke,reloadConfigAndCommands:()=>pe,reloadPage:()=>le,reloadUI:()=>ce,replaceRange:()=>ve,save:()=>ne,sendMessage:()=>He,setSelection:()=>te,setText:()=>Y,setUiOption:()=>Ue,showPanel:()=>xe,showProgress:()=>we,toggleComment:()=>Be,toggleFold:()=>Re,undo:()=>Ie,unfold:()=>De,unfoldAll:()=>Ne,uploadFile:()=>ye,vimEx:()=>Ve});typeof globalThis.syscall>"u"&&(globalThis.syscall=()=>{throw new Error("Not implemented here")});function o(e,...r){return globalThis.syscall(e,...r)}function q(){return o("editor.getCurrentPage")}function H(){return o("editor.getCurrentPageMeta")}function _(){return o("editor.getCurrentPath")}function Q(){return o("editor.getRecentlyOpenedPages")}function X(){return o("editor.getCurrentEditor")}function Z(){return o("editor.getText")}function Y(e,r=!1){return o("editor.setText",e,r)}function ee(){return o("editor.getCursor")}function re(){return o("editor.getSelection")}function te(e,r){return o("editor.setSelection",e,r)}function oe(e,r){return o("editor.invokeCommand",e,r)}function ne(){return o("editor.save")}function ie(e,r=!1,t=!1){return o("editor.navigate",e,r,t)}function se(e="page"){return o("editor.openPageNavigator",e)}function ae(){return o("editor.openCommandPalette")}function le(){return o("editor.reloadPage")}function ce(){return o("editor.reloadUI")}function ue(){return o("editor.rebuildEditorState")}function pe(){return o("editor.reloadConfigAndCommands")}function de(e,r=!1){return o("editor.openUrl",e,r)}function me(){return o("editor.newWindow")}function fe(e){return o("editor.goHistory",e)}function ge(e,r){return o("editor.downloadFile",e,r)}function ye(e,r){return o("editor.uploadFile",e,r)}function he(e,r="info"){return o("editor.flashNotification",e,r)}function be(e,r,t="",n=""){return o("editor.filterBox",e,r,t,n)}function xe(e,r,t,n=""){return o("editor.showPanel",e,r,t,n)}function Pe(e){return o("editor.hidePanel",e)}function we(e,r){return o("editor.showProgress",e,r)}function Se(e,r){return o("editor.insertAtPos",e,r)}function ve(e,r,t){return o("editor.replaceRange",e,r,t)}function ke(e,r=!1){return o("editor.moveCursor",e,r)}function Ce(e,r=1,t=!1){return o("editor.moveCursorToLine",e,r,t)}function Me(e,r=!1,t=!1){return o("editor.insertAtCursor",e,r,t)}function Ee(e){return o("editor.dispatch",e)}function Te(e,r=""){return o("editor.prompt",e,r)}function Le(e){return o("editor.confirm",e)}function Ae(e){return o("editor.alert",e)}function Fe(e){return o("editor.getUiOption",e)}function Ue(e,r){return o("editor.setUiOption",e,r)}function Oe(){return o("editor.fold")}function De(){return o("editor.unfold")}function Re(){return o("editor.toggleFold")}function je(){return o("editor.foldAll")}function Ne(){return o("editor.unfoldAll")}function Ie(){return o("editor.undo")}function Ke(){return o("editor.redo")}function We(){return o("editor.openSearchPanel")}function Ge(e){return o("editor.copyToClipboard",e)}function $e(){return o("editor.deleteLine")}function Be(){return o("editor.toggleComment")}function Je(){return o("editor.moveLineUp")}function ze(){return o("editor.moveLineDown")}function Ve(e){return o("editor.vimEx",e)}function qe(){return o("editor.configureVimMode")}function He(e,r){return o("editor.sendMessage",e,r)}function _e(){return o("editor.isMobile")}var f={};y(f,{deleteDocument:()=>cr,deleteFile:()=>yr,deletePage:()=>or,fileExists:()=>hr,getDocumentMeta:()=>sr,getFileMeta:()=>fr,getPageMeta:()=>Ze,listDocuments:()=>ir,listFiles:()=>ur,listPages:()=>Xe,listPlugs:()=>nr,pageExists:()=>Ye,readDocument:()=>ar,readFile:()=>pr,readFileWithMeta:()=>mr,readPage:()=>er,readPageWithMeta:()=>rr,readRef:()=>dr,writeDocument:()=>lr,writeFile:()=>gr,writePage:()=>tr});function Xe(){return o("space.listPages")}function Ze(e){return o("space.getPageMeta",e)}function Ye(e){return o("space.pageExists",e)}function er(e){return o("space.readPage",e)}function rr(e){return o("space.readPageWithMeta",e)}function tr(e,r){return o("space.writePage",e,r)}function or(e){return o("space.deletePage",e)}function nr(){return o("space.listPlugs")}function ir(){return o("space.listDocuments")}function sr(e){return o("space.getDocumentMeta",e)}function ar(e){return o("space.readDocument",e)}function lr(e,r){return o("space.writeDocument",e,r)}function cr(e){return o("space.deleteDocument",e)}function ur(){return o("space.listFiles")}function pr(e){return o("space.readFile",e)}function dr(e){return o("space.readRef",e)}function mr(e){return o("space.readFileWithMeta",e)}function fr(e){return o("space.getFileMeta",e)}function gr(e,r){return o("space.writeFile",e,r)}function yr(e){return o("space.deleteFile",e)}function hr(e){return o("space.fileExists",e)}var vt=new Uint8Array(16);var m={};y(m,{define:()=>Dr,get:()=>Ar,has:()=>Or,insert:()=>Ur,set:()=>Fr});function Ar(e,r){return o("config.get",e,r)}function Fr(e,r){return o("config.set",e,r)}function Ur(e,r){return o("config.insert",e,r)}function Or(e){return o("config.has",e)}function Dr(e,r){return o("config.define",e,r)}var jr="400px",M=13,w="https://demotiles.maplibre.org/style.json",Nr={lineColor:"#2563eb",lineWidth:3,lineOpacity:.9,fillColor:"#3b82f6",fillOpacity:.18,pointColor:"#dc2626",pointRadius:6},E="5.21.0",T=0,P;function U(e){return e.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function Ir(e){return e.replaceAll("&amp;","&").replaceAll("&lt;","<").replaceAll("&gt;",">").replaceAll("&quot;",'"').replaceAll("&apos;","'")}function L(e){return{html:`<pre style="color: #b42318; background: #fef3f2; padding: 0.75rem; border: 1px solid #fecdca; border-radius: 4px; white-space: pre-wrap;">${U(e)}</pre>`,script:""}}function Kr(){T+=1;let e="";return typeof crypto<"u"&&"randomUUID"in crypto?e=crypto.randomUUID():e=Math.random().toString(36).slice(2,10),`mapview-${T}-${e}`}function Wr(e){let r={};for(let t of e.split(/\r?\n/)){let n=t.trim();if(!n)continue;let i=n.indexOf(":");if(i===-1)continue;let s=n.slice(0,i).trim().toLowerCase(),a=n.slice(i+1).trim();if(a){if(s==="source"||s==="url"||s==="height"||s==="styleurl")r[s==="styleurl"?"styleUrl":s]=a;else if(s==="zoom")r.zoom=Number.parseFloat(a);else if(s==="center")try{r.center=JSON.parse(a)}catch{r.center=a}}}return r}function Gr(e){let r=e.trim();if(!r)return{};if(r.startsWith("{")){let t;try{t=JSON.parse(r)}catch(n){let i=n instanceof Error?n.message:"Unknown JSON parse error.";throw new Error(`Map config must be valid JSON: ${i}`)}if(!t||typeof t!="object"||Array.isArray(t))throw new Error("Map config JSON must be an object.");return t}return Wr(e)}function l(e){return typeof e=="string"&&e.trim()?e.trim():void 0}function $r(e){if(!Array.isArray(e)||e.length!==2)return;let r=Number(e[0]),t=Number(e[1]);if(!(!Number.isFinite(r)||!Number.isFinite(t)))return[r,t]}function u(e,r,t){if(e===void 0)return;let n=l(e);if(!n)throw new Error(`${t}: \`${r}\` must be a non-empty string.`);return n}function g(e,r,t){if(e===void 0)return;let n=Number(e);if(!Number.isFinite(n)||n<=0)throw new Error(`${t}: \`${r}\` must be a positive number.`);return n}function A(e,r,t){if(e===void 0)return;let n=Number(e);if(!Number.isFinite(n)||n<0||n>1)throw new Error(`${t}: \`${r}\` must be a number between 0 and 1.`);return n}function O(e,r){if(e===void 0)return{};if(!e||typeof e!="object"||Array.isArray(e))throw new Error(`${r} must be an object.`);let t=e;return{lineColor:u(t.lineColor,"lineColor",r),lineWidth:g(t.lineWidth,"lineWidth",r),lineOpacity:A(t.lineOpacity,"lineOpacity",r),fillColor:u(t.fillColor,"fillColor",r),fillOpacity:A(t.fillOpacity,"fillOpacity",r),pointColor:u(t.pointColor,"pointColor",r),pointRadius:g(t.pointRadius,"pointRadius",r),markerColor:u(t.markerColor,"markerColor",r)}}function Br(e,r){return{...e,...r}}function Jr(e,r){if(e===void 0)return{};if(!e||typeof e!="object"||Array.isArray(e))throw new Error(`${r} must be an object.`);let t=e;return{color:u(t.color,"color",r),scale:g(t.scale,"scale",r)}}function zr(e,r){return{...e,...r}}function Vr(e,r){return{color:u(e.color,"color",r),scale:g(e.scale,"scale",r)}}function qr(e,r){if(e===void 0)return[];if(!Array.isArray(e))throw new Error("`markers` must be an array of marker objects.");return e.map((t,n)=>{if(!t||typeof t!="object"||Array.isArray(t))throw new Error(`Marker ${n+1} must be an object.`);let i=t,s=Number(i.lat),a=Number(i.lon);if(!Number.isFinite(s)||!Number.isFinite(a))throw new Error(`Marker ${n+1} must include numeric \`lat\` and \`lon\`.`);let c=zr(r,Vr(i,`Marker ${n+1}`));return{lat:s,lon:a,label:l(i.label),popup:l(i.popup),color:c.color,scale:c.scale}})}function F(e,r,t){if(typeof e=="string"){let s=l(e);if(!s)throw new Error(`Source ${r+1} must be a non-empty string.`);return{path:s,style:t}}if(!e||typeof e!="object"||Array.isArray(e))throw new Error(`Source ${r+1} must be a string path or an object with \`path\`.`);let n=e,i=l(n.path);if(!i)throw new Error(`Source ${r+1} must include a non-empty \`path\`.`);return{path:i,style:Br(t,O(n.style,`Source ${r+1} style`))}}function Hr(e,r){return e===void 0?[]:Array.isArray(e)?e.map((t,n)=>F(t,n,r)):[F(e,0,r)]}function _r(e,r){if(e===void 0)return[];let t=l(e);if(!t)throw new Error("`url` must be a non-empty string path.");return[{path:t,style:r}]}function Qr(e){let r=O(e.sourceStyle,"`sourceStyle`"),t=Jr(e.markerStyle,"`markerStyle`"),n=e.source!==void 0?Hr(e.source,r):_r(e.url,r),i=l(e.height)||jr,s=e.center===void 0?void 0:$r(e.center);if(e.center!==void 0&&!s)throw new Error("`center` must be a JSON array like [lat, lon].");let a=e.zoom===void 0?void 0:Number(e.zoom);if(e.zoom!==void 0&&!Number.isFinite(a))throw new Error("`zoom` must be a number.");let c=e.styleUrl===void 0?void 0:l(e.styleUrl);if(e.styleUrl!==void 0&&!c)throw new Error("`styleUrl` must be a non-empty string.");return{sources:n,height:i,center:s,zoom:a,markers:qr(e.markers,t),styleUrl:c,sourceStyle:r,markerStyle:t}}function Xr(e,r){let t=e.matchAll(new RegExp(`<${r}\\b[^>]*?lat=["']([^"']+)["'][^>]*?lon=["']([^"']+)["'][^>]*?>`,"gi")),n=[];for(let i of t){let s=Number.parseFloat(i[1]),a=Number.parseFloat(i[2]);Number.isFinite(s)&&Number.isFinite(a)&&n.push([s,a])}return n}function Zr(e,r){let t=e.matchAll(/<wpt\b[^>]*?lat=["']([^"']+)["'][^>]*?lon=["']([^"']+)["'][^>]*?>([\s\S]*?)<\/wpt>/gi),n=[];for(let i of t){let s=Number.parseFloat(i[1]),a=Number.parseFloat(i[2]);if(!Number.isFinite(s)||!Number.isFinite(a))continue;let c=i[3].match(/<name\b[^>]*>([\s\S]*?)<\/name>/i),W=c?Ir(c[1].trim()):"Waypoint";n.push({lat:s,lon:a,popup:W,color:r})}return n}function Yr(e){if(!(e.length<2))return{type:"FeatureCollection",features:[{type:"Feature",properties:{source:"gpx-track"},geometry:{type:"LineString",coordinates:e.map(([r,t])=>[t,r])}}]}}function et(e){return/<(?:\w+:)?gpx\b/i.test(e)}function rt(e){return typeof e=="string"&&["Feature","FeatureCollection","Point","MultiPoint","LineString","MultiLineString","Polygon","MultiPolygon","GeometryCollection"].includes(e)}function tt(e,r){let t;try{t=JSON.parse(e)}catch(i){let s=i instanceof Error?i.message:"Unknown JSON parse error.";throw new Error(`GeoJSON Error: Invalid JSON in ${r}: ${s}`)}if(!t||typeof t!="object"||Array.isArray(t))throw new Error(`GeoJSON Error: ${r} must contain a GeoJSON object.`);let n=t;if(!rt(n.type))throw new Error(`GeoJSON Error: Unsupported or missing GeoJSON type in ${r}.`);return n}function ot(e){let r=e.trim();return r?r.startsWith("/")?[r,r.slice(1)]:[r,`/${r}`]:[]}async function nt(e){for(let r of ot(e))try{return new TextDecoder().decode(await f.readFile(r))}catch{}throw new Error(`Map Error: File not found: ${e}`)}async function it(e){let r=await nt(e.path),t=e.path.toLowerCase();if(t.endsWith(".gpx")){if(!et(r))throw new Error(`GPX Map Error: File is not valid GPX XML: ${e.path}`);let n=Xr(r,"trkpt"),i=Zr(r,e.style.markerColor);if(n.length===0&&i.length===0)throw new Error(`GPX Map Error: No usable trackpoints or waypoints found in ${e.path}`);if(n.length>0){let s=[];return n.length===1?s.push({lat:n[0][0],lon:n[0][1],popup:"Track point",color:e.style.markerColor}):(s.push({lat:n[0][0],lon:n[0][1],popup:"Start",color:e.style.markerColor}),s.push({lat:n[n.length-1][0],lon:n[n.length-1][1],popup:"End",color:e.style.markerColor})),{kind:"gpx",trackGeoJson:Yr(n),markers:s,style:e.style}}return{kind:"gpx",markers:i,style:e.style}}if(t.endsWith(".geojson")||t.endsWith(".json"))return{kind:"geojson",data:tt(r,e.path),style:e.style};throw new Error(`Map Error: Unsupported file type for ${e.path}. Use .gpx, .geojson, or .json.`)}function st(){return`\`\`\`mapview
{
  "styleUrl": "https://demotiles.maplibre.org/style.json",
  "height": "420px",
  "sourceStyle": {
    "lineWidth": 4,
    "lineOpacity": 0.85
  },
  "source": [
    {
      "path": "/path/to/route.gpx",
      "style": {
        "lineColor": "#0f766e",
        "markerColor": "#0f766e"
      }
    },
    {
      "path": "/path/to/pois.geojson",
      "style": {
        "pointColor": "#dc2626",
        "fillColor": "#f59e0b"
      }
    }
  ],
  "markerStyle": {
    "color": "#7c3aed"
  },
  "markers": [
    {
      "lat": 41.3874,
      "lon": 2.1686,
      "popup": "Example marker",
      "scale": 1.1
    }
  ]
}
\`\`\``}async function D(){let e=await d.getSelection(),{from:r,to:t}=e;await d.replaceRange(r,t,st())}async function at(){P||(P=Promise.all([m.define("mapview.styleUrl",{type:"string",default:w,description:"MapLibre style URL used by mapview."})]).then(()=>{})),await P}async function lt(e){if(await at(),e)return{styleUrl:e};let r=await m.get("mapview.styleUrl",w);return{styleUrl:l(r)||w}}function ct(e,r){return`
    (function() {
      const mapId = ${JSON.stringify(r)};
      const payload = ${JSON.stringify(e)};
      const globalKey = "__mapviewMapLibreLoader";
      const mapStoreKey = "__mapviewInstances";
      const cssHref = "https://unpkg.com/maplibre-gl@${E}/dist/maplibre-gl.css";
      const scriptSrc = "https://unpkg.com/maplibre-gl@${E}/dist/maplibre-gl.js";
      const defaultSourceStyle = ${JSON.stringify(Nr)};

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

      function buildMarkerOptions(marker) {
        const options = {};
        if (marker && typeof marker.color === 'string' && marker.color) {
          options.color = marker.color;
        }
        if (marker && typeof marker.scale === 'number') {
          options.scale = marker.scale;
        }
        return options;
      }

      function addMarker(maplibregl, map, markers, fitPoints, markerStore) {
        markers.forEach((marker) => {
          const instance = new maplibregl.Marker(buildMarkerOptions(marker))
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

      function resolvedSourceStyle(style) {
        return {
          lineColor: style && style.lineColor ? style.lineColor : defaultSourceStyle.lineColor,
          lineWidth: style && typeof style.lineWidth === 'number' ? style.lineWidth : defaultSourceStyle.lineWidth,
          lineOpacity: style && typeof style.lineOpacity === 'number' ? style.lineOpacity : defaultSourceStyle.lineOpacity,
          fillColor: style && style.fillColor ? style.fillColor : defaultSourceStyle.fillColor,
          fillOpacity: style && typeof style.fillOpacity === 'number' ? style.fillOpacity : defaultSourceStyle.fillOpacity,
          pointColor: style && style.pointColor ? style.pointColor : defaultSourceStyle.pointColor,
          pointRadius: style && typeof style.pointRadius === 'number' ? style.pointRadius : defaultSourceStyle.pointRadius
        };
      }

      function addGeoJsonLayers(maplibregl, map, sourceId, data, layerPrefix, fitPoints, style) {
        const coordinates = collectGeoJsonLngLats(data);
        if (coordinates.length === 0) {
          throw new Error('GeoJSON Error: No renderable features found.');
        }

        const resolvedStyle = resolvedSourceStyle(style);

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
            'fill-color': resolvedStyle.fillColor,
            'fill-opacity': resolvedStyle.fillOpacity
          }
        });

        map.addLayer({
          id: lineLayerId,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': resolvedStyle.lineColor,
            'line-width': resolvedStyle.lineWidth,
            'line-opacity': resolvedStyle.lineOpacity
          }
        });

        map.addLayer({
          id: pointLayerId,
          type: 'circle',
          source: sourceId,
          filter: ['==', ['geometry-type'], 'Point'],
          paint: {
            'circle-radius': resolvedStyle.pointRadius,
            'circle-color': resolvedStyle.pointColor,
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

            payload.sourceData.forEach((sourceData, index) => {
              if (sourceData.kind === 'gpx') {
                if (sourceData.trackGeoJson) {
                  addGeoJsonLayers(
                    maplibregl,
                    map,
                    mapId + '-gpx-source-' + index,
                    sourceData.trackGeoJson,
                    mapId + '-gpx-' + index,
                    fitPoints,
                    sourceData.style
                  );
                }

                addMarker(
                  maplibregl,
                  map,
                  sourceData.markers,
                  fitPoints,
                  markerStore
                );
                return;
              }

              addGeoJsonLayers(
                maplibregl,
                map,
                mapId + '-geojson-source-' + index,
                sourceData.data,
                mapId + '-geojson-' + index,
                fitPoints,
                sourceData.style
              );
            });

            addMarker(maplibregl, map, config.markers, fitPoints, markerStore);

            if (hasExplicitCenter) {
              map.jumpTo({
                center: toLngLat(config.center[0], config.center[1]),
                zoom: typeof config.zoom === 'number' ? config.zoom : ${M}
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
                zoom: ${M}
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
  `}async function S(e){try{let r=Qr(Gr(e)),t=await Promise.all(r.sources.map(it)),n=await lt(r.styleUrl);if(t.length===0&&r.markers.length===0&&!r.center)return L("Map Error: Provide a source file, at least one marker, or a center coordinate.");let i=Kr();return{html:`<div id="${i}" style="height: ${U(r.height)}; width: 100%; border: 1px solid #ccc; border-radius: 4px; overflow: hidden;"></div>`,script:ct({config:r,sourceData:t,...n},i)}}catch(r){let t=r instanceof Error?r.message:"Unknown map rendering error.";return L(t)}}async function R(e){return S(e)}function j(){return{options:[{label:"mapview",detail:"Insert mapview widget",invoke:"mapview.insertMapView"}]}}function N(){return{options:[{label:"gpxmap",detail:"Insert legacy gpxmap widget",invoke:"mapview.insertMapView"},{label:"mapview",detail:"Insert mapview widget",invoke:"mapview.insertMapView"}]}}var I={insertMapView:D,renderMapViewWidget:S,renderGPXWidget:R,mapViewSlashComplete:j,gpxSlashComplete:N},K={name:"mapview",version:.1,imports:["https://get.silverbullet.md/global.plug.json"],functions:{insertMapView:{path:"./mapview.ts:insertMapView",command:{name:"MapView: Insert Widget",requireMode:"rw"}},renderMapViewWidget:{path:"./mapview.ts:renderMapViewWidget",codeWidget:"mapview"},renderGPXWidget:{path:"./mapview.ts:renderGPXWidget",codeWidget:"gpxmap"},mapViewSlashComplete:{path:"./mapview.ts:mapViewSlashComplete",events:["slash:complete"]},gpxSlashComplete:{path:"./mapview.ts:gpxSlashComplete",events:["slash:complete"]}},assets:{}},Vt={manifest:K,functionMapping:I};C(I,K,self.postMessage);export{Vt as plug};
//# sourceMappingURL=mapview.plug.js.map
