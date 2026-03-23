var G=Object.defineProperty;var h=(e,r)=>{for(var t in r)G(e,t,{get:r[t],enumerable:!0})};function $(e){let r=atob(e),t=r.length,n=new Uint8Array(t);for(let i=0;i<t;i++)n[i]=r.charCodeAt(i);return n}function v(e){typeof e=="string"&&(e=new TextEncoder().encode(e));let r="",t=e.byteLength;for(let n=0;n<t;n++)r+=String.fromCharCode(e[n]);return btoa(r)}var mt=new Uint8Array(16),J=class{constructor(e="",r=1e3){this.prefix=e,this.maxCaptureSize=r,this.prefix=e,this.originalConsole={log:console.log.bind(console),info:console.info.bind(console),warn:console.warn.bind(console),error:console.error.bind(console),debug:console.debug.bind(console)},this.patchConsole()}originalConsole;logBuffer=[];patchConsole(){let e=r=>(...t)=>{let n=this.prefix?[this.prefix,...t]:t;this.originalConsole[r](...n),this.captureLog(r,t)};console.log=e("log"),console.info=e("info"),console.warn=e("warn"),console.error=e("error"),console.debug=e("debug")}captureLog(e,r){let t={level:e,timestamp:Date.now(),message:r.map(n=>{if(typeof n=="string")return n;try{return JSON.stringify(n)}catch{return String(n)}}).join(" ")};this.logBuffer.push(t),this.logBuffer.length>this.maxCaptureSize&&this.logBuffer.shift()}async postToServer(e,r){if(this.logBuffer.length>0){let n=[...this.logBuffer];this.logBuffer=[];try{if(!(await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n.map(s=>({...s,source:r})))})).ok)throw new Error("Failed to post logs to server")}catch(i){console.warn("Could not post logs to server",i.message),this.logBuffer.unshift(...n)}}}},k;function z(e=""){return k=new J(e),k}var c=e=>{throw new Error("Not initialized yet")},P=typeof window>"u"&&typeof globalThis.WebSocketPair>"u",x=new Map,b=0;P&&(globalThis.syscall=async(e,...r)=>await new Promise((t,n)=>{b++,x.set(b,{resolve:t,reject:n}),c({type:"sys",id:b,name:e,args:r})}));function M(e,r,t){P&&(c=t,self.addEventListener("message",n=>{(async()=>{let i=n.data;switch(i.type){case"inv":{let s=e[i.name];if(!s)throw new Error(`Function not loaded: ${i.name}`);try{let a=await Promise.resolve(s(...i.args||[]));c({type:"invr",id:i.id,result:a})}catch(a){console.error("An exception was thrown as a result of invoking function",i.name,"error:",a.message),c({type:"invr",id:i.id,error:a.message})}}break;case"sysr":{let s=i.id,a=x.get(s);if(!a)throw Error("Invalid request id");x.delete(s),i.error?a.reject(new Error(i.error)):a.resolve(i.result)}break}})().catch(console.error)}),c({type:"manifest",manifest:r}),z(`[${r.name} plug]`))}async function V(e,r){if(typeof e!="string"){let t=new Uint8Array(await e.arrayBuffer()),n=t.length>0?v(t):void 0;r={method:e.method,headers:Object.fromEntries(e.headers.entries()),base64Body:n},e=e.url}return syscall("sandboxFetch.fetch",e,r)}globalThis.nativeFetch=globalThis.fetch;function q(){globalThis.fetch=async(e,r)=>{let t=r?.body?v(new Uint8Array(await new Response(r.body).arrayBuffer())):void 0,n=await V(e,r&&{method:r.method,headers:r.headers,base64Body:t});return new Response(n.base64Body?$(n.base64Body):null,{status:n.status,headers:n.headers})}}P&&q();var m={};h(m,{alert:()=>Ne,configureVimMode:()=>He,confirm:()=>Ae,copyToClipboard:()=>Ge,deleteLine:()=>$e,dispatch:()=>Te,downloadFile:()=>ye,filterBox:()=>xe,flashNotification:()=>be,fold:()=>Ue,foldAll:()=>We,getCurrentEditor:()=>Z,getCurrentPage:()=>H,getCurrentPageMeta:()=>_,getCurrentPath:()=>Q,getCursor:()=>re,getRecentlyOpenedPages:()=>X,getSelection:()=>te,getText:()=>Y,getUiOption:()=>Fe,goHistory:()=>fe,hidePanel:()=>Se,insertAtCursor:()=>Ee,insertAtPos:()=>Ce,invokeCommand:()=>ne,isMobile:()=>Qe,moveCursor:()=>ve,moveCursorToLine:()=>Me,moveLineDown:()=>Ve,moveLineUp:()=>ze,navigate:()=>se,newWindow:()=>ge,openCommandPalette:()=>pe,openPageNavigator:()=>ae,openSearchPanel:()=>Ie,openUrl:()=>de,prompt:()=>Le,rebuildEditorState:()=>ce,redo:()=>Ke,reloadConfigAndCommands:()=>me,reloadPage:()=>le,reloadUI:()=>ue,replaceRange:()=>ke,save:()=>ie,sendMessage:()=>_e,setSelection:()=>oe,setText:()=>ee,setUiOption:()=>Oe,showPanel:()=>Pe,showProgress:()=>we,toggleComment:()=>Je,toggleFold:()=>Re,undo:()=>je,unfold:()=>De,unfoldAll:()=>Be,uploadFile:()=>he,vimEx:()=>qe});typeof globalThis.syscall>"u"&&(globalThis.syscall=()=>{throw new Error("Not implemented here")});function o(e,...r){return globalThis.syscall(e,...r)}function H(){return o("editor.getCurrentPage")}function _(){return o("editor.getCurrentPageMeta")}function Q(){return o("editor.getCurrentPath")}function X(){return o("editor.getRecentlyOpenedPages")}function Z(){return o("editor.getCurrentEditor")}function Y(){return o("editor.getText")}function ee(e,r=!1){return o("editor.setText",e,r)}function re(){return o("editor.getCursor")}function te(){return o("editor.getSelection")}function oe(e,r){return o("editor.setSelection",e,r)}function ne(e,r){return o("editor.invokeCommand",e,r)}function ie(){return o("editor.save")}function se(e,r=!1,t=!1){return o("editor.navigate",e,r,t)}function ae(e="page"){return o("editor.openPageNavigator",e)}function pe(){return o("editor.openCommandPalette")}function le(){return o("editor.reloadPage")}function ue(){return o("editor.reloadUI")}function ce(){return o("editor.rebuildEditorState")}function me(){return o("editor.reloadConfigAndCommands")}function de(e,r=!1){return o("editor.openUrl",e,r)}function ge(){return o("editor.newWindow")}function fe(e){return o("editor.goHistory",e)}function ye(e,r){return o("editor.downloadFile",e,r)}function he(e,r){return o("editor.uploadFile",e,r)}function be(e,r="info"){return o("editor.flashNotification",e,r)}function xe(e,r,t="",n=""){return o("editor.filterBox",e,r,t,n)}function Pe(e,r,t,n=""){return o("editor.showPanel",e,r,t,n)}function Se(e){return o("editor.hidePanel",e)}function we(e,r){return o("editor.showProgress",e,r)}function Ce(e,r){return o("editor.insertAtPos",e,r)}function ke(e,r,t){return o("editor.replaceRange",e,r,t)}function ve(e,r=!1){return o("editor.moveCursor",e,r)}function Me(e,r=1,t=!1){return o("editor.moveCursorToLine",e,r,t)}function Ee(e,r=!1,t=!1){return o("editor.insertAtCursor",e,r,t)}function Te(e){return o("editor.dispatch",e)}function Le(e,r=""){return o("editor.prompt",e,r)}function Ae(e){return o("editor.confirm",e)}function Ne(e){return o("editor.alert",e)}function Fe(e){return o("editor.getUiOption",e)}function Oe(e,r){return o("editor.setUiOption",e,r)}function Ue(){return o("editor.fold")}function De(){return o("editor.unfold")}function Re(){return o("editor.toggleFold")}function We(){return o("editor.foldAll")}function Be(){return o("editor.unfoldAll")}function je(){return o("editor.undo")}function Ke(){return o("editor.redo")}function Ie(){return o("editor.openSearchPanel")}function Ge(e){return o("editor.copyToClipboard",e)}function $e(){return o("editor.deleteLine")}function Je(){return o("editor.toggleComment")}function ze(){return o("editor.moveLineUp")}function Ve(){return o("editor.moveLineDown")}function qe(e){return o("editor.vimEx",e)}function He(){return o("editor.configureVimMode")}function _e(e,r){return o("editor.sendMessage",e,r)}function Qe(){return o("editor.isMobile")}var g={};h(g,{deleteDocument:()=>ur,deleteFile:()=>hr,deletePage:()=>nr,fileExists:()=>br,getDocumentMeta:()=>ar,getFileMeta:()=>fr,getPageMeta:()=>Ye,listDocuments:()=>sr,listFiles:()=>cr,listPages:()=>Ze,listPlugs:()=>ir,pageExists:()=>er,readDocument:()=>pr,readFile:()=>mr,readFileWithMeta:()=>gr,readPage:()=>rr,readPageWithMeta:()=>tr,readRef:()=>dr,writeDocument:()=>lr,writeFile:()=>yr,writePage:()=>or});function Ze(){return o("space.listPages")}function Ye(e){return o("space.getPageMeta",e)}function er(e){return o("space.pageExists",e)}function rr(e){return o("space.readPage",e)}function tr(e){return o("space.readPageWithMeta",e)}function or(e,r){return o("space.writePage",e,r)}function nr(e){return o("space.deletePage",e)}function ir(){return o("space.listPlugs")}function sr(){return o("space.listDocuments")}function ar(e){return o("space.getDocumentMeta",e)}function pr(e){return o("space.readDocument",e)}function lr(e,r){return o("space.writeDocument",e,r)}function ur(e){return o("space.deleteDocument",e)}function cr(){return o("space.listFiles")}function mr(e){return o("space.readFile",e)}function dr(e){return o("space.readRef",e)}function gr(e){return o("space.readFileWithMeta",e)}function fr(e){return o("space.getFileMeta",e)}function yr(e,r){return o("space.writeFile",e,r)}function hr(e){return o("space.deleteFile",e)}function br(e){return o("space.fileExists",e)}var kt=new Uint8Array(16);var d={};h(d,{define:()=>Dr,get:()=>Nr,has:()=>Ur,insert:()=>Or,set:()=>Fr});function Nr(e,r){return o("config.get",e,r)}function Fr(e,r){return o("config.set",e,r)}function Or(e,r){return o("config.insert",e,r)}function Ur(e){return o("config.has",e)}function Dr(e,r){return o("config.define",e,r)}var Wr="400px",E=13,w="https://demotiles.maplibre.org/style.json",Br={lineColor:"#2563eb",lineWidth:3,lineOpacity:.9,fillColor:"#3b82f6",fillOpacity:.18,pointColor:"#dc2626",pointRadius:6},T="5.21.0",L=0,S;function O(e){return e.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function jr(e){return e.replaceAll("&amp;","&").replaceAll("&lt;","<").replaceAll("&gt;",">").replaceAll("&quot;",'"').replaceAll("&apos;","'")}function A(e){return{html:`<pre style="color: #b42318; background: #fef3f2; padding: 0.75rem; border: 1px solid #fecdca; border-radius: 4px; white-space: pre-wrap;">${O(e)}</pre>`,script:""}}function Kr(){L+=1;let e="";return typeof crypto<"u"&&"randomUUID"in crypto?e=crypto.randomUUID():e=Math.random().toString(36).slice(2,10),`mapview-${L}-${e}`}function Ir(e){let r={};for(let t of e.split(/\r?\n/)){let n=t.trim();if(!n)continue;let i=n.indexOf(":");if(i===-1)continue;let s=n.slice(0,i).trim().toLowerCase(),a=n.slice(i+1).trim();if(a){if(s==="source"||s==="url"||s==="height"||s==="styleurl")r[s==="styleurl"?"styleUrl":s]=a;else if(s==="zoom")r.zoom=Number.parseFloat(a);else if(s==="center")try{r.center=JSON.parse(a)}catch{r.center=a}}}return r}function Gr(e){let r=e.trim();if(!r)return{};if(r.startsWith("{")){let t;try{t=JSON.parse(r)}catch(n){let i=n instanceof Error?n.message:"Unknown JSON parse error.";throw new Error(`Map config must be valid JSON: ${i}`)}if(!t||typeof t!="object"||Array.isArray(t))throw new Error("Map config JSON must be an object.");return t}return Ir(e)}function u(e){return typeof e=="string"&&e.trim()?e.trim():void 0}function $r(e){if(!Array.isArray(e)||e.length!==2)return;let r=Number(e[0]),t=Number(e[1]);if(!(!Number.isFinite(r)||!Number.isFinite(t)))return[r,t]}function l(e,r,t){if(e===void 0)return;let n=u(e);if(!n)throw new Error(`${t}: \`${r}\` must be a non-empty string.`);return n}function f(e,r,t){if(e===void 0)return;let n=u(e);if(!n)throw new Error(`${t}: \`${r}\` must be a non-empty string.`);return n}function y(e,r,t){if(e===void 0)return;let n=Number(e);if(!Number.isFinite(n)||n<=0)throw new Error(`${t}: \`${r}\` must be a positive number.`);return n}function N(e,r,t){if(e===void 0)return;let n=Number(e);if(!Number.isFinite(n)||n<0||n>1)throw new Error(`${t}: \`${r}\` must be a number between 0 and 1.`);return n}function U(e,r){if(e===void 0)return{};if(!e||typeof e!="object"||Array.isArray(e))throw new Error(`${r} must be an object.`);let t=e;return{lineColor:l(t.lineColor,"lineColor",r),lineWidth:y(t.lineWidth,"lineWidth",r),lineOpacity:N(t.lineOpacity,"lineOpacity",r),fillColor:l(t.fillColor,"fillColor",r),fillOpacity:N(t.fillOpacity,"fillOpacity",r),pointColor:l(t.pointColor,"pointColor",r),pointRadius:y(t.pointRadius,"pointRadius",r),markerColor:l(t.markerColor,"markerColor",r)}}function Jr(e,r){return{...e,...r}}function zr(e,r){if(e===void 0)return{};if(!e||typeof e!="object"||Array.isArray(e))throw new Error(`${r} must be an object.`);let t=e;return{color:l(t.color,"color",r),scale:y(t.scale,"scale",r),popupBackgroundColor:l(t.popupBackgroundColor,"popupBackgroundColor",r),popupTextColor:l(t.popupTextColor,"popupTextColor",r),popupBorderColor:l(t.popupBorderColor,"popupBorderColor",r),popupClassName:f(t.popupClassName,"popupClassName",r),popupMaxWidth:f(t.popupMaxWidth,"popupMaxWidth",r)}}function Vr(e,r){return{...e,...r}}function qr(e,r){return{color:l(e.color,"color",r),scale:y(e.scale,"scale",r),popupBackgroundColor:l(e.popupBackgroundColor,"popupBackgroundColor",r),popupTextColor:l(e.popupTextColor,"popupTextColor",r),popupBorderColor:l(e.popupBorderColor,"popupBorderColor",r),popupClassName:f(e.popupClassName,"popupClassName",r),popupMaxWidth:f(e.popupMaxWidth,"popupMaxWidth",r)}}function Hr(e,r){if(e===void 0)return[];if(!Array.isArray(e))throw new Error("`markers` must be an array of marker objects.");return e.map((t,n)=>{if(!t||typeof t!="object"||Array.isArray(t))throw new Error(`Marker ${n+1} must be an object.`);let i=t,s=Number(i.lat),a=Number(i.lon);if(!Number.isFinite(s)||!Number.isFinite(a))throw new Error(`Marker ${n+1} must include numeric \`lat\` and \`lon\`.`);let p=Vr(r,qr(i,`Marker ${n+1}`));return{lat:s,lon:a,label:u(i.label),popup:u(i.popup),color:p.color,scale:p.scale,popupBackgroundColor:p.popupBackgroundColor,popupTextColor:p.popupTextColor,popupBorderColor:p.popupBorderColor,popupClassName:p.popupClassName,popupMaxWidth:p.popupMaxWidth}})}function F(e,r,t){if(typeof e=="string"){let s=u(e);if(!s)throw new Error(`Source ${r+1} must be a non-empty string.`);return{path:s,style:t}}if(!e||typeof e!="object"||Array.isArray(e))throw new Error(`Source ${r+1} must be a string path or an object with \`path\`.`);let n=e,i=u(n.path);if(!i)throw new Error(`Source ${r+1} must include a non-empty \`path\`.`);return{path:i,style:Jr(t,U(n.style,`Source ${r+1} style`))}}function _r(e,r){return e===void 0?[]:Array.isArray(e)?e.map((t,n)=>F(t,n,r)):[F(e,0,r)]}function Qr(e,r){if(e===void 0)return[];let t=u(e);if(!t)throw new Error("`url` must be a non-empty string path.");return[{path:t,style:r}]}function Xr(e){let r=U(e.sourceStyle,"`sourceStyle`"),t=zr(e.markerStyle,"`markerStyle`"),n=e.source!==void 0?_r(e.source,r):Qr(e.url,r),i=u(e.height)||Wr,s=e.center===void 0?void 0:$r(e.center);if(e.center!==void 0&&!s)throw new Error("`center` must be a JSON array like [lat, lon].");let a=e.zoom===void 0?void 0:Number(e.zoom);if(e.zoom!==void 0&&!Number.isFinite(a))throw new Error("`zoom` must be a number.");let p=e.styleUrl===void 0?void 0:u(e.styleUrl);if(e.styleUrl!==void 0&&!p)throw new Error("`styleUrl` must be a non-empty string.");return{sources:n,height:i,center:s,zoom:a,markers:Hr(e.markers,t),styleUrl:p,sourceStyle:r,markerStyle:t}}function Zr(e,r){let t=e.matchAll(new RegExp(`<${r}\\b[^>]*?lat=["']([^"']+)["'][^>]*?lon=["']([^"']+)["'][^>]*?>`,"gi")),n=[];for(let i of t){let s=Number.parseFloat(i[1]),a=Number.parseFloat(i[2]);Number.isFinite(s)&&Number.isFinite(a)&&n.push([s,a])}return n}function Yr(e,r){let t=e.matchAll(/<wpt\b[^>]*?lat=["']([^"']+)["'][^>]*?lon=["']([^"']+)["'][^>]*?>([\s\S]*?)<\/wpt>/gi),n=[];for(let i of t){let s=Number.parseFloat(i[1]),a=Number.parseFloat(i[2]);if(!Number.isFinite(s)||!Number.isFinite(a))continue;let p=i[3].match(/<name\b[^>]*>([\s\S]*?)<\/name>/i),I=p?jr(p[1].trim()):"Waypoint";n.push({lat:s,lon:a,popup:I,color:r})}return n}function et(e){if(!(e.length<2))return{type:"FeatureCollection",features:[{type:"Feature",properties:{source:"gpx-track"},geometry:{type:"LineString",coordinates:e.map(([r,t])=>[t,r])}}]}}function rt(e){return/<(?:\w+:)?gpx\b/i.test(e)}function tt(e){return typeof e=="string"&&["Feature","FeatureCollection","Point","MultiPoint","LineString","MultiLineString","Polygon","MultiPolygon","GeometryCollection"].includes(e)}function ot(e,r){let t;try{t=JSON.parse(e)}catch(i){let s=i instanceof Error?i.message:"Unknown JSON parse error.";throw new Error(`GeoJSON Error: Invalid JSON in ${r}: ${s}`)}if(!t||typeof t!="object"||Array.isArray(t))throw new Error(`GeoJSON Error: ${r} must contain a GeoJSON object.`);let n=t;if(!tt(n.type))throw new Error(`GeoJSON Error: Unsupported or missing GeoJSON type in ${r}.`);return n}function nt(e){let r=e.trim();return r?r.startsWith("/")?[r,r.slice(1)]:[r,`/${r}`]:[]}async function it(e){for(let r of nt(e))try{return new TextDecoder().decode(await g.readFile(r))}catch{}throw new Error(`Map Error: File not found: ${e}`)}async function st(e){let r=await it(e.path),t=e.path.toLowerCase();if(t.endsWith(".gpx")){if(!rt(r))throw new Error(`GPX Map Error: File is not valid GPX XML: ${e.path}`);let n=Zr(r,"trkpt"),i=Yr(r,e.style.markerColor);if(n.length===0&&i.length===0)throw new Error(`GPX Map Error: No usable trackpoints or waypoints found in ${e.path}`);if(n.length>0){let s=[];return n.length===1?s.push({lat:n[0][0],lon:n[0][1],popup:"Track point",color:e.style.markerColor}):(s.push({lat:n[0][0],lon:n[0][1],popup:"Start",color:e.style.markerColor}),s.push({lat:n[n.length-1][0],lon:n[n.length-1][1],popup:"End",color:e.style.markerColor})),{kind:"gpx",trackGeoJson:et(n),markers:s,style:e.style}}return{kind:"gpx",markers:i,style:e.style}}if(t.endsWith(".geojson")||t.endsWith(".json"))return{kind:"geojson",data:ot(r,e.path),style:e.style};throw new Error(`Map Error: Unsupported file type for ${e.path}. Use .gpx, .geojson, or .json.`)}function at(){return`\`\`\`mapview
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
    "color": "#7c3aed",
    "popupBackgroundColor": "#111827",
    "popupTextColor": "#f8fafc",
    "popupBorderColor": "#334155"
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
\`\`\``}async function D(){let e=await m.getSelection(),{from:r,to:t}=e;await m.replaceRange(r,t,at())}async function pt(){S||(S=Promise.all([d.define("mapview.styleUrl",{type:"string",default:w,description:"MapLibre style URL used by mapview."})]).then(()=>{})),await S}async function lt(e){if(await pt(),e)return{styleUrl:e};let r=await d.get("mapview.styleUrl",w);return{styleUrl:u(r)||w}}function ut(e,r){return`
    (function() {
      const mapId = ${JSON.stringify(r)};
      const payload = ${JSON.stringify(e)};
      const globalKey = "__mapviewMapLibreLoader";
      const mapStoreKey = "__mapviewInstances";
      const popupStyleStoreKey = "__mapviewPopupStyles";
      const cssHref = "https://unpkg.com/maplibre-gl@${T}/dist/maplibre-gl.css";
      const scriptSrc = "https://unpkg.com/maplibre-gl@${T}/dist/maplibre-gl.js";
      const defaultSourceStyle = ${JSON.stringify(Br)};
      const defaultPopupClassName = "mapview-popup-default";

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

      function sanitizeClassSegment(value) {
        return String(value || "")
          .toLowerCase()
          .replace(/[^a-z0-9_-]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }

      function ensurePopupStyleStore() {
        if (!globalThis[popupStyleStoreKey]) {
          globalThis[popupStyleStoreKey] = {
            element: null,
            rules: {}
          };
        }

        const store = globalThis[popupStyleStoreKey];
        if (!store.element || !store.element.isConnected) {
          const style = document.createElement("style");
          style.setAttribute("data-mapview-popup-styles", "true");
          document.head.appendChild(style);
          store.element = style;
        }

        return store;
      }

      function appendPopupStyleRule(className, popupStyle) {
        if (!className) {
          return;
        }

        const store = ensurePopupStyleStore();
        if (store.rules[className]) {
          return;
        }

        const backgroundColor =
          popupStyle && popupStyle.backgroundColor
            ? popupStyle.backgroundColor
            : "Canvas";
        const textColor =
          popupStyle && popupStyle.textColor
            ? popupStyle.textColor
            : "CanvasText";
        const borderColor =
          popupStyle && popupStyle.borderColor
            ? popupStyle.borderColor
            : backgroundColor;

        store.element.appendChild(
          document.createTextNode(
            ".maplibregl-popup." + className + " .maplibregl-popup-content {" +
              "background:" + backgroundColor + ";" +
              "color:" + textColor + ";" +
              "border:1px solid " + borderColor + ";" +
              "box-shadow:0 10px 28px rgba(0, 0, 0, 0.18);" +
            "}" +
            ".maplibregl-popup." + className + " .maplibregl-popup-close-button {" +
              "color:" + textColor + ";" +
            "}" +
            ".maplibregl-popup.maplibregl-popup-anchor-top." + className + " .maplibregl-popup-tip," +
            ".maplibregl-popup.maplibregl-popup-anchor-top-left." + className + " .maplibregl-popup-tip," +
            ".maplibregl-popup.maplibregl-popup-anchor-top-right." + className + " .maplibregl-popup-tip {" +
              "border-bottom-color:" + backgroundColor + ";" +
            "}" +
            ".maplibregl-popup.maplibregl-popup-anchor-bottom." + className + " .maplibregl-popup-tip," +
            ".maplibregl-popup.maplibregl-popup-anchor-bottom-left." + className + " .maplibregl-popup-tip," +
            ".maplibregl-popup.maplibregl-popup-anchor-bottom-right." + className + " .maplibregl-popup-tip {" +
              "border-top-color:" + backgroundColor + ";" +
            "}" +
            ".maplibregl-popup.maplibregl-popup-anchor-left." + className + " .maplibregl-popup-tip {" +
              "border-right-color:" + backgroundColor + ";" +
            "}" +
            ".maplibregl-popup.maplibregl-popup-anchor-right." + className + " .maplibregl-popup-tip {" +
              "border-left-color:" + backgroundColor + ";" +
            "}"
          )
        );
        store.rules[className] = true;
      }

      function ensureDefaultPopupStyle() {
        appendPopupStyleRule(defaultPopupClassName, {
          backgroundColor: "Canvas",
          textColor: "CanvasText"
        });
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

      function buildPopupClassName(marker, popupKey) {
        ensureDefaultPopupStyle();

        const classNames = [defaultPopupClassName];
        if (marker && typeof marker.popupClassName === "string" && marker.popupClassName) {
          classNames.push(marker.popupClassName);
        }

        if (
          marker &&
          (marker.popupBackgroundColor || marker.popupTextColor || marker.popupBorderColor)
        ) {
          const generatedClassName = "mapview-popup-" + sanitizeClassSegment(popupKey);
          appendPopupStyleRule(generatedClassName, {
            backgroundColor: marker.popupBackgroundColor,
            textColor: marker.popupTextColor,
            borderColor: marker.popupBorderColor
          });
          classNames.push(generatedClassName);
        }

        return classNames.join(" ");
      }

      function buildPopupOptions(marker, popupClassName) {
        const options = {
          offset: 25,
          className: popupClassName
        };

        if (marker && typeof marker.popupMaxWidth === "string" && marker.popupMaxWidth) {
          options.maxWidth = marker.popupMaxWidth;
        }

        return options;
      }

      function addMarker(maplibregl, map, markers, fitPoints, markerStore, markerGroupKey) {
        markers.forEach((marker, index) => {
          const instance = new maplibregl.Marker(buildMarkerOptions(marker))
            .setLngLat(toLngLat(marker.lat, marker.lon));

          if (marker.popup || marker.label) {
            const popupClassName = buildPopupClassName(
              marker,
              markerGroupKey + "-" + index
            );
            instance.setPopup(
              new maplibregl.Popup(buildPopupOptions(marker, popupClassName))
                .setText(String(marker.popup || marker.label))
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

          new maplibregl.Popup({
            offset: 12,
            className: buildPopupClassName(null, layerId)
          })
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
        ensureDefaultPopupStyle();

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
                  markerStore,
                  mapId + '-gpx-' + index
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

            addMarker(
              maplibregl,
              map,
              config.markers,
              fitPoints,
              markerStore,
              mapId + '-manual'
            );

            if (hasExplicitCenter) {
              map.jumpTo({
                center: toLngLat(config.center[0], config.center[1]),
                zoom: typeof config.zoom === 'number' ? config.zoom : ${E}
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
                zoom: ${E}
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
  `}async function C(e){try{let r=Xr(Gr(e)),t=await Promise.all(r.sources.map(st)),n=await lt(r.styleUrl);if(t.length===0&&r.markers.length===0&&!r.center)return A("Map Error: Provide a source file, at least one marker, or a center coordinate.");let i=Kr();return{html:`<div id="${i}" style="height: ${O(r.height)}; width: 100%; border: 1px solid #ccc; border-radius: 4px; overflow: hidden;"></div>`,script:ut({config:r,sourceData:t,...n},i)}}catch(r){let t=r instanceof Error?r.message:"Unknown map rendering error.";return A(t)}}async function R(e){return C(e)}function W(){return{options:[{label:"mapview",detail:"Insert mapview widget",invoke:"mapview.insertMapView"}]}}function B(){return{options:[{label:"gpxmap",detail:"Insert legacy gpxmap widget",invoke:"mapview.insertMapView"},{label:"mapview",detail:"Insert mapview widget",invoke:"mapview.insertMapView"}]}}var j={insertMapView:D,renderMapViewWidget:C,renderGPXWidget:R,mapViewSlashComplete:W,gpxSlashComplete:B},K={name:"mapview",version:.1,imports:["https://get.silverbullet.md/global.plug.json"],functions:{insertMapView:{path:"./mapview.ts:insertMapView",command:{name:"MapView: Insert Widget",requireMode:"rw"}},renderMapViewWidget:{path:"./mapview.ts:renderMapViewWidget",codeWidget:"mapview"},renderGPXWidget:{path:"./mapview.ts:renderGPXWidget",codeWidget:"gpxmap"},mapViewSlashComplete:{path:"./mapview.ts:mapViewSlashComplete",events:["slash:complete"]},gpxSlashComplete:{path:"./mapview.ts:gpxSlashComplete",events:["slash:complete"]}},assets:{}},qt={manifest:K,functionMapping:j};M(j,K,self.postMessage);export{qt as plug};
//# sourceMappingURL=mapview.plug.js.map
