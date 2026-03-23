var K=Object.defineProperty;var x=(e,r)=>{for(var o in r)K(e,o,{get:r[o],enumerable:!0})};function D(e){let r=atob(e),o=r.length,n=new Uint8Array(o);for(let i=0;i<o;i++)n[i]=r.charCodeAt(i);return n}function h(e){typeof e=="string"&&(e=new TextEncoder().encode(e));let r="",o=e.byteLength;for(let n=0;n<o;n++)r+=String.fromCharCode(e[n]);return btoa(r)}var Ft=new Uint8Array(16),B=class{constructor(e="",r=1e3){this.prefix=e,this.maxCaptureSize=r,this.prefix=e,this.originalConsole={log:console.log.bind(console),info:console.info.bind(console),warn:console.warn.bind(console),error:console.error.bind(console),debug:console.debug.bind(console)},this.patchConsole()}originalConsole;logBuffer=[];patchConsole(){let e=r=>(...o)=>{let n=this.prefix?[this.prefix,...o]:o;this.originalConsole[r](...n),this.captureLog(r,o)};console.log=e("log"),console.info=e("info"),console.warn=e("warn"),console.error=e("error"),console.debug=e("debug")}captureLog(e,r){let o={level:e,timestamp:Date.now(),message:r.map(n=>{if(typeof n=="string")return n;try{return JSON.stringify(n)}catch{return String(n)}}).join(" ")};this.logBuffer.push(o),this.logBuffer.length>this.maxCaptureSize&&this.logBuffer.shift()}async postToServer(e,r){if(this.logBuffer.length>0){let n=[...this.logBuffer];this.logBuffer=[];try{if(!(await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n.map(a=>({...a,source:r})))})).ok)throw new Error("Failed to post logs to server")}catch(i){console.warn("Could not post logs to server",i.message),this.logBuffer.unshift(...n)}}}},P;function O(e=""){return P=new B(e),P}var c=e=>{throw new Error("Not initialized yet")},f=typeof window>"u"&&typeof globalThis.WebSocketPair>"u",g=new Map,m=0;f&&(globalThis.syscall=async(e,...r)=>await new Promise((o,n)=>{m++,g.set(m,{resolve:o,reject:n}),c({type:"sys",id:m,name:e,args:r})}));function b(e,r,o){f&&(c=o,self.addEventListener("message",n=>{(async()=>{let i=n.data;switch(i.type){case"inv":{let a=e[i.name];if(!a)throw new Error(`Function not loaded: ${i.name}`);try{let s=await Promise.resolve(a(...i.args||[]));c({type:"invr",id:i.id,result:s})}catch(s){console.error("An exception was thrown as a result of invoking function",i.name,"error:",s.message),c({type:"invr",id:i.id,error:s.message})}}break;case"sysr":{let a=i.id,s=g.get(a);if(!s)throw Error("Invalid request id");g.delete(a),i.error?s.reject(new Error(i.error)):s.resolve(i.result)}break}})().catch(console.error)}),c({type:"manifest",manifest:r}),O(`[${r.name} plug]`))}async function R(e,r){if(typeof e!="string"){let o=new Uint8Array(await e.arrayBuffer()),n=o.length>0?h(o):void 0;r={method:e.method,headers:Object.fromEntries(e.headers.entries()),base64Body:n},e=e.url}return syscall("sandboxFetch.fetch",e,r)}globalThis.nativeFetch=globalThis.fetch;function G(){globalThis.fetch=async(e,r)=>{let o=r?.body?h(new Uint8Array(await new Response(r.body).arrayBuffer())):void 0,n=await R(e,r&&{method:r.method,headers:r.headers,base64Body:o});return new Response(n.base64Body?D(n.base64Body):null,{status:n.status,headers:n.headers})}}f&&G();var l={};x(l,{alert:()=>we,configureVimMode:()=>je,confirm:()=>ve,copyToClipboard:()=>Ke,deleteLine:()=>De,dispatch:()=>he,downloadFile:()=>ae,filterBox:()=>pe,flashNotification:()=>ce,fold:()=>Se,foldAll:()=>Ee,getCurrentEditor:()=>q,getCurrentPage:()=>j,getCurrentPageMeta:()=>N,getCurrentPath:()=>X,getCursor:()=>Q,getRecentlyOpenedPages:()=>W,getSelection:()=>V,getText:()=>I,getUiOption:()=>Ce,goHistory:()=>se,hidePanel:()=>de,insertAtCursor:()=>Pe,insertAtPos:()=>ge,invokeCommand:()=>_,isMobile:()=>Xe,moveCursor:()=>ye,moveCursorToLine:()=>xe,moveLineDown:()=>Re,moveLineUp:()=>Oe,navigate:()=>J,newWindow:()=>ie,openCommandPalette:()=>Z,openPageNavigator:()=>Y,openSearchPanel:()=>Ue,openUrl:()=>ne,prompt:()=>be,rebuildEditorState:()=>re,redo:()=>Le,reloadConfigAndCommands:()=>oe,reloadPage:()=>ee,reloadUI:()=>te,replaceRange:()=>fe,save:()=>z,sendMessage:()=>Ne,setSelection:()=>H,setText:()=>$,setUiOption:()=>Te,showPanel:()=>ue,showProgress:()=>me,toggleComment:()=>Be,toggleFold:()=>Ae,undo:()=>ke,unfold:()=>Me,unfoldAll:()=>Fe,uploadFile:()=>le,vimEx:()=>Ge});typeof globalThis.syscall>"u"&&(globalThis.syscall=()=>{throw new Error("Not implemented here")});function t(e,...r){return globalThis.syscall(e,...r)}function j(){return t("editor.getCurrentPage")}function N(){return t("editor.getCurrentPageMeta")}function X(){return t("editor.getCurrentPath")}function W(){return t("editor.getRecentlyOpenedPages")}function q(){return t("editor.getCurrentEditor")}function I(){return t("editor.getText")}function $(e,r=!1){return t("editor.setText",e,r)}function Q(){return t("editor.getCursor")}function V(){return t("editor.getSelection")}function H(e,r){return t("editor.setSelection",e,r)}function _(e,r){return t("editor.invokeCommand",e,r)}function z(){return t("editor.save")}function J(e,r=!1,o=!1){return t("editor.navigate",e,r,o)}function Y(e="page"){return t("editor.openPageNavigator",e)}function Z(){return t("editor.openCommandPalette")}function ee(){return t("editor.reloadPage")}function te(){return t("editor.reloadUI")}function re(){return t("editor.rebuildEditorState")}function oe(){return t("editor.reloadConfigAndCommands")}function ne(e,r=!1){return t("editor.openUrl",e,r)}function ie(){return t("editor.newWindow")}function se(e){return t("editor.goHistory",e)}function ae(e,r){return t("editor.downloadFile",e,r)}function le(e,r){return t("editor.uploadFile",e,r)}function ce(e,r="info"){return t("editor.flashNotification",e,r)}function pe(e,r,o="",n=""){return t("editor.filterBox",e,r,o,n)}function ue(e,r,o,n=""){return t("editor.showPanel",e,r,o,n)}function de(e){return t("editor.hidePanel",e)}function me(e,r){return t("editor.showProgress",e,r)}function ge(e,r){return t("editor.insertAtPos",e,r)}function fe(e,r,o){return t("editor.replaceRange",e,r,o)}function ye(e,r=!1){return t("editor.moveCursor",e,r)}function xe(e,r=1,o=!1){return t("editor.moveCursorToLine",e,r,o)}function Pe(e,r=!1,o=!1){return t("editor.insertAtCursor",e,r,o)}function he(e){return t("editor.dispatch",e)}function be(e,r=""){return t("editor.prompt",e,r)}function ve(e){return t("editor.confirm",e)}function we(e){return t("editor.alert",e)}function Ce(e){return t("editor.getUiOption",e)}function Te(e,r){return t("editor.setUiOption",e,r)}function Se(){return t("editor.fold")}function Me(){return t("editor.unfold")}function Ae(){return t("editor.toggleFold")}function Ee(){return t("editor.foldAll")}function Fe(){return t("editor.unfoldAll")}function ke(){return t("editor.undo")}function Le(){return t("editor.redo")}function Ue(){return t("editor.openSearchPanel")}function Ke(e){return t("editor.copyToClipboard",e)}function De(){return t("editor.deleteLine")}function Be(){return t("editor.toggleComment")}function Oe(){return t("editor.moveLineUp")}function Re(){return t("editor.moveLineDown")}function Ge(e){return t("editor.vimEx",e)}function je(){return t("editor.configureVimMode")}function Ne(e,r){return t("editor.sendMessage",e,r)}function Xe(){return t("editor.isMobile")}var p={};x(p,{deleteDocument:()=>tt,deleteFile:()=>lt,deletePage:()=>_e,fileExists:()=>ct,getDocumentMeta:()=>Ye,getFileMeta:()=>st,getPageMeta:()=>Ie,listDocuments:()=>Je,listFiles:()=>rt,listPages:()=>qe,listPlugs:()=>ze,pageExists:()=>$e,readDocument:()=>Ze,readFile:()=>ot,readFileWithMeta:()=>it,readPage:()=>Qe,readPageWithMeta:()=>Ve,readRef:()=>nt,writeDocument:()=>et,writeFile:()=>at,writePage:()=>He});function qe(){return t("space.listPages")}function Ie(e){return t("space.getPageMeta",e)}function $e(e){return t("space.pageExists",e)}function Qe(e){return t("space.readPage",e)}function Ve(e){return t("space.readPageWithMeta",e)}function He(e,r){return t("space.writePage",e,r)}function _e(e){return t("space.deletePage",e)}function ze(){return t("space.listPlugs")}function Je(){return t("space.listDocuments")}function Ye(e){return t("space.getDocumentMeta",e)}function Ze(e){return t("space.readDocument",e)}function et(e,r){return t("space.writeDocument",e,r)}function tt(e){return t("space.deleteDocument",e)}function rt(){return t("space.listFiles")}function ot(e){return t("space.readFile",e)}function nt(e){return t("space.readRef",e)}function it(e){return t("space.readFileWithMeta",e)}function st(e){return t("space.getFileMeta",e)}function at(e,r){return t("space.writeFile",e,r)}function lt(e){return t("space.deleteFile",e)}function ct(e){return t("space.fileExists",e)}var Xt=new Uint8Array(16);var d="400px",v=0;function Tt(e){let r={};for(let o of e.split(/\r?\n/)){let n=o.trim();if(!n)continue;let i=n.indexOf(":");if(i===-1)continue;let a=n.slice(0,i).trim().toLowerCase(),s=n.slice(i+1).trim();s&&(a==="url"?r.url=s:a==="height"&&(r.height=s))}return r}function w(e){return e.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function u(e){return{html:`<pre style="color: #b42318; background: #fef3f2; padding: 0.75rem; border: 1px solid #fecdca; border-radius: 4px; white-space: pre-wrap;">${w(e)}</pre>`,script:""}}function St(){v+=1;let e="";return typeof crypto<"u"&&"randomUUID"in crypto?e=crypto.randomUUID():e=Math.random().toString(36).slice(2,10),`gpx-map-${v}-${e}`}function C(e,r){let o=e.matchAll(new RegExp(`<${r}\\b[^>]*?lat=["']([^"']+)["'][^>]*?lon=["']([^"']+)["'][^>]*?>`,"gi")),n=[];for(let i of o){let a=Number.parseFloat(i[1]),s=Number.parseFloat(i[2]);Number.isFinite(a)&&Number.isFinite(s)&&n.push([a,s])}return n}function Mt(e){return C(e,"wpt").length}function At(e){return!/<(?:\w+:)?gpx\b/i.test(e)}async function T(){let e=await l.getSelection(),{from:r,to:o}=e,n=await l.prompt("Enter GPX file path (e.g., /hikes/my-route.gpx):","");if(!n?.trim())return;let i=await l.prompt("Map height (default: 400px):",d)||d,a=`\`\`\`gpxmap
url: ${n.trim()}
height: ${i.trim()||d}
\`\`\``;await l.replaceRange(r,o,a)}async function S(e){let r=Tt(e),o=r.url,n=r.height||d;if(!o)return u("GPX Map Error: No URL specified. Use: url: /path/to/file.gpx");if(!await p.fileExists(o))return u(`GPX Map Error: File not found: ${o}`);let a=await p.readFile(o),s=new TextDecoder().decode(a);if(At(s))return u(`GPX Map Error: File is not valid GPX XML: ${o}`);let F=C(s,"trkpt"),k=Mt(s);if(F.length===0&&k===0)return u(`GPX Map Error: No usable trackpoints or waypoints found in ${o}`);let y=St(),L=`<div id="${y}" style="height: ${w(n)}; width: 100%; border: 1px solid #ccc; border-radius: 4px;"></div>`,U=`
    (function() {
      const mapId = ${JSON.stringify(y)};
      const gpxContent = ${JSON.stringify(s)};
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

      function initMap() {
        const element = document.getElementById(mapId);
        if (!element) {
          return;
        }

        const parser = new DOMParser();
        const gpx = parser.parseFromString(gpxContent, 'application/xml');
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

        if (!globalThis[mapStoreKey]) {
          globalThis[mapStoreKey] = {};
        }

        const existingMap = globalThis[mapStoreKey][mapId];
        if (existingMap) {
          existingMap.remove();
        }

        const map = L.map(mapId).setView([0, 0], 13);
        globalThis[mapStoreKey][mapId] = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '\xA9 OpenStreetMap contributors'
        }).addTo(map);

        if (tracks.length > 0) {
          const polyline = L.polyline(tracks, {
            color: '#0066cc',
            weight: 4,
            opacity: 0.8
          }).addTo(map);

          map.fitBounds(polyline.getBounds(), { padding: [20, 20] });
          L.marker(tracks[0], { title: 'Start' }).addTo(map).bindPopup('Start');
          L.marker(tracks[tracks.length - 1], { title: 'End' }).addTo(map).bindPopup('End');
          return;
        }

        waypoints.forEach((point) => {
          L.marker(point.coordinate).addTo(map).bindPopup(point.name);
        });
        map.fitBounds(L.latLngBounds(waypoints.map((point) => point.coordinate)), { padding: [20, 20] });
      }

      loadLeaflet().then(initMap).catch((error) => {
        renderError('GPX Map Error: ' + (error && error.message ? error.message : 'Unable to initialize map.'));
      });
    })();
  `;return{html:L,script:U}}function M(){return{options:[{label:"gpxmap",detail:"Insert GPX map widget",invoke:"gpxmap.insertGPXMap"}]}}var A={insertGPXMap:T,renderGPXWidget:S,gpxSlashComplete:M},E={name:"gpxmap",version:.1,imports:["https://get.silverbullet.md/global.plug.json"],functions:{insertGPXMap:{path:"./gpxmap.ts:insertGPXMap",command:{name:"GPX: Insert Map Widget",requireMode:"rw"}},renderGPXWidget:{path:"./gpxmap.ts:renderGPXWidget",codeWidget:"gpxmap"},gpxSlashComplete:{path:"./gpxmap.ts:gpxSlashComplete",events:["slash:complete"]}},assets:{}},lr={manifest:E,functionMapping:A};b(A,E,self.postMessage);export{lr as plug};
//# sourceMappingURL=gpxmap.plug.js.map
