var M=Object.defineProperty;var g=(e,r)=>{for(var o in r)M(e,o,{get:r[o],enumerable:!0})};function A(e){let r=atob(e),o=r.length,n=new Uint8Array(o);for(let i=0;i<o;i++)n[i]=r.charCodeAt(i);return n}function y(e){typeof e=="string"&&(e=new TextEncoder().encode(e));let r="",o=e.byteLength;for(let n=0;n<o;n++)r+=String.fromCharCode(e[n]);return btoa(r)}var Pt=new Uint8Array(16),k=class{constructor(e="",r=1e3){this.prefix=e,this.maxCaptureSize=r,this.prefix=e,this.originalConsole={log:console.log.bind(console),info:console.info.bind(console),warn:console.warn.bind(console),error:console.error.bind(console),debug:console.debug.bind(console)},this.patchConsole()}originalConsole;logBuffer=[];patchConsole(){let e=r=>(...o)=>{let n=this.prefix?[this.prefix,...o]:o;this.originalConsole[r](...n),this.captureLog(r,o)};console.log=e("log"),console.info=e("info"),console.warn=e("warn"),console.error=e("error"),console.debug=e("debug")}captureLog(e,r){let o={level:e,timestamp:Date.now(),message:r.map(n=>{if(typeof n=="string")return n;try{return JSON.stringify(n)}catch{return String(n)}}).join(" ")};this.logBuffer.push(o),this.logBuffer.length>this.maxCaptureSize&&this.logBuffer.shift()}async postToServer(e,r){if(this.logBuffer.length>0){let n=[...this.logBuffer];this.logBuffer=[];try{if(!(await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n.map(s=>({...s,source:r})))})).ok)throw new Error("Failed to post logs to server")}catch(i){console.warn("Could not post logs to server",i.message),this.logBuffer.unshift(...n)}}}},f;function F(e=""){return f=new k(e),f}var u=e=>{throw new Error("Not initialized yet")},m=typeof window>"u"&&typeof globalThis.WebSocketPair>"u",d=new Map,l=0;m&&(globalThis.syscall=async(e,...r)=>await new Promise((o,n)=>{l++,d.set(l,{resolve:o,reject:n}),u({type:"sys",id:l,name:e,args:r})}));function x(e,r,o){m&&(u=o,self.addEventListener("message",n=>{(async()=>{let i=n.data;switch(i.type){case"inv":{let s=e[i.name];if(!s)throw new Error(`Function not loaded: ${i.name}`);try{let a=await Promise.resolve(s(...i.args||[]));u({type:"invr",id:i.id,result:a})}catch(a){console.error("An exception was thrown as a result of invoking function",i.name,"error:",a.message),u({type:"invr",id:i.id,error:a.message})}}break;case"sysr":{let s=i.id,a=d.get(s);if(!a)throw Error("Invalid request id");d.delete(s),i.error?a.reject(new Error(i.error)):a.resolve(i.result)}break}})().catch(console.error)}),u({type:"manifest",manifest:r}),F(`[${r.name} plug]`))}async function E(e,r){if(typeof e!="string"){let o=new Uint8Array(await e.arrayBuffer()),n=o.length>0?y(o):void 0;r={method:e.method,headers:Object.fromEntries(e.headers.entries()),base64Body:n},e=e.url}return syscall("sandboxFetch.fetch",e,r)}globalThis.nativeFetch=globalThis.fetch;function L(){globalThis.fetch=async(e,r)=>{let o=r?.body?y(new Uint8Array(await new Response(r.body).arrayBuffer())):void 0,n=await E(e,r&&{method:r.method,headers:r.headers,base64Body:o});return new Response(n.base64Body?A(n.base64Body):null,{status:n.status,headers:n.headers})}}m&&L();var c={};g(c,{alert:()=>fe,configureVimMode:()=>Ue,confirm:()=>ge,copyToClipboard:()=>Me,deleteLine:()=>Ae,dispatch:()=>de,downloadFile:()=>ee,filterBox:()=>oe,flashNotification:()=>re,fold:()=>Pe,foldAll:()=>ve,getCurrentEditor:()=>R,getCurrentPage:()=>U,getCurrentPageMeta:()=>D,getCurrentPath:()=>K,getCursor:()=>G,getRecentlyOpenedPages:()=>B,getSelection:()=>q,getText:()=>O,getUiOption:()=>ye,goHistory:()=>Z,hidePanel:()=>ie,insertAtCursor:()=>le,insertAtPos:()=>ae,invokeCommand:()=>N,isMobile:()=>Ke,moveCursor:()=>ue,moveCursorToLine:()=>pe,moveLineDown:()=>Ee,moveLineUp:()=>Fe,navigate:()=>$,newWindow:()=>Y,openCommandPalette:()=>V,openPageNavigator:()=>Q,openSearchPanel:()=>Te,openUrl:()=>J,prompt:()=>me,rebuildEditorState:()=>H,redo:()=>Se,reloadConfigAndCommands:()=>z,reloadPage:()=>I,reloadUI:()=>_,replaceRange:()=>ce,save:()=>X,sendMessage:()=>De,setSelection:()=>W,setText:()=>j,setUiOption:()=>xe,showPanel:()=>ne,showProgress:()=>se,toggleComment:()=>ke,toggleFold:()=>be,undo:()=>Ce,unfold:()=>he,unfoldAll:()=>we,uploadFile:()=>te,vimEx:()=>Le});typeof globalThis.syscall>"u"&&(globalThis.syscall=()=>{throw new Error("Not implemented here")});function t(e,...r){return globalThis.syscall(e,...r)}function U(){return t("editor.getCurrentPage")}function D(){return t("editor.getCurrentPageMeta")}function K(){return t("editor.getCurrentPath")}function B(){return t("editor.getRecentlyOpenedPages")}function R(){return t("editor.getCurrentEditor")}function O(){return t("editor.getText")}function j(e,r=!1){return t("editor.setText",e,r)}function G(){return t("editor.getCursor")}function q(){return t("editor.getSelection")}function W(e,r){return t("editor.setSelection",e,r)}function N(e,r){return t("editor.invokeCommand",e,r)}function X(){return t("editor.save")}function $(e,r=!1,o=!1){return t("editor.navigate",e,r,o)}function Q(e="page"){return t("editor.openPageNavigator",e)}function V(){return t("editor.openCommandPalette")}function I(){return t("editor.reloadPage")}function _(){return t("editor.reloadUI")}function H(){return t("editor.rebuildEditorState")}function z(){return t("editor.reloadConfigAndCommands")}function J(e,r=!1){return t("editor.openUrl",e,r)}function Y(){return t("editor.newWindow")}function Z(e){return t("editor.goHistory",e)}function ee(e,r){return t("editor.downloadFile",e,r)}function te(e,r){return t("editor.uploadFile",e,r)}function re(e,r="info"){return t("editor.flashNotification",e,r)}function oe(e,r,o="",n=""){return t("editor.filterBox",e,r,o,n)}function ne(e,r,o,n=""){return t("editor.showPanel",e,r,o,n)}function ie(e){return t("editor.hidePanel",e)}function se(e,r){return t("editor.showProgress",e,r)}function ae(e,r){return t("editor.insertAtPos",e,r)}function ce(e,r,o){return t("editor.replaceRange",e,r,o)}function ue(e,r=!1){return t("editor.moveCursor",e,r)}function pe(e,r=1,o=!1){return t("editor.moveCursorToLine",e,r,o)}function le(e,r=!1,o=!1){return t("editor.insertAtCursor",e,r,o)}function de(e){return t("editor.dispatch",e)}function me(e,r=""){return t("editor.prompt",e,r)}function ge(e){return t("editor.confirm",e)}function fe(e){return t("editor.alert",e)}function ye(e){return t("editor.getUiOption",e)}function xe(e,r){return t("editor.setUiOption",e,r)}function Pe(){return t("editor.fold")}function he(){return t("editor.unfold")}function be(){return t("editor.toggleFold")}function ve(){return t("editor.foldAll")}function we(){return t("editor.unfoldAll")}function Ce(){return t("editor.undo")}function Se(){return t("editor.redo")}function Te(){return t("editor.openSearchPanel")}function Me(e){return t("editor.copyToClipboard",e)}function Ae(){return t("editor.deleteLine")}function ke(){return t("editor.toggleComment")}function Fe(){return t("editor.moveLineUp")}function Ee(){return t("editor.moveLineDown")}function Le(e){return t("editor.vimEx",e)}function Ue(){return t("editor.configureVimMode")}function De(e,r){return t("editor.sendMessage",e,r)}function Ke(){return t("editor.isMobile")}var p={};g(p,{deleteDocument:()=>_e,deleteFile:()=>tt,deletePage:()=>Ne,fileExists:()=>rt,getDocumentMeta:()=>Qe,getFileMeta:()=>Ze,getPageMeta:()=>Oe,listDocuments:()=>$e,listFiles:()=>He,listPages:()=>Re,listPlugs:()=>Xe,pageExists:()=>je,readDocument:()=>Ve,readFile:()=>ze,readFileWithMeta:()=>Ye,readPage:()=>Ge,readPageWithMeta:()=>qe,readRef:()=>Je,writeDocument:()=>Ie,writeFile:()=>et,writePage:()=>We});function Re(){return t("space.listPages")}function Oe(e){return t("space.getPageMeta",e)}function je(e){return t("space.pageExists",e)}function Ge(e){return t("space.readPage",e)}function qe(e){return t("space.readPageWithMeta",e)}function We(e,r){return t("space.writePage",e,r)}function Ne(e){return t("space.deletePage",e)}function Xe(){return t("space.listPlugs")}function $e(){return t("space.listDocuments")}function Qe(e){return t("space.getDocumentMeta",e)}function Ve(e){return t("space.readDocument",e)}function Ie(e,r){return t("space.writeDocument",e,r)}function _e(e){return t("space.deleteDocument",e)}function He(){return t("space.listFiles")}function ze(e){return t("space.readFile",e)}function Je(e){return t("space.readRef",e)}function Ye(e){return t("space.readFileWithMeta",e)}function Ze(e){return t("space.getFileMeta",e)}function et(e,r){return t("space.writeFile",e,r)}function tt(e){return t("space.deleteFile",e)}function rt(e){return t("space.fileExists",e)}var Et=new Uint8Array(16);function P(e,r){let o=new RegExp(`${r}:\\s*(.+)`,"i"),n=e.match(o);return n?n[1].trim():null}async function h(){let e=await c.getSelection(),{from:r,to:o}=e,n=await c.prompt("Enter GPX file path (e.g., /hikes/my-route.gpx):","");if(!n)return;let i=await c.prompt("Map height (default: 400px):","400px")||"400px",s=`\`\`\`gpxmap
url: ${n}
height: ${i}
\`\`\``;await c.replaceRange(r,o,s)}async function b(e){let r=P(e,"url"),o=P(e,"height")||"400px";if(!r)return{html:'<pre style="color: red;">GPX Map Error: No URL specified. Use: url: /path/to/file.gpx</pre>',script:""};if(!await p.fileExists(r))return{html:`<pre style="color: red;">GPX Map Error: File not found: ${r}</pre>`,script:""};let i=await p.readFile(r),s=new TextDecoder().decode(i),a=`gpx-map-${Date.now()}`,S=`
    <div id="${a}" style="height: ${o}; width: 100%; border: 1px solid #ccc; border-radius: 4px;"></div>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  `,T=`
    (function() {
      // Load Leaflet CSS if not already loaded
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      
      // Load Leaflet JS
      if (typeof L === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => initMap();
        document.head.appendChild(script);
      } else {
        initMap();
      }
      
      function initMap() {
        const mapId = '${a}';
        const gpxContent = ${JSON.stringify(s)};
        
        // Remove existing map if any
        if (window[mapId + '_map']) {
          window[mapId + '_map'].remove();
        }
        
        // Create map
        const map = L.map(mapId).setView([0, 0], 13);
        window[mapId + '_map'] = map;
        
        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '\xA9 OpenStreetMap contributors'
        }).addTo(map);
        
        // Parse GPX and add to map
        const parser = new DOMParser();
        const gpx = parser.parseFromString(gpxContent, 'application/xml');
        
        const trackPoints = [];
        const trkpts = gpx.querySelectorAll('trkpt');
        
        trkpts.forEach(pt => {
          const lat = parseFloat(pt.getAttribute('lat'));
          const lon = parseFloat(pt.getAttribute('lon'));
          if (!isNaN(lat) && !isNaN(lon)) {
            trackPoints.push([lat, lon]);
          }
        });
        
        if (trackPoints.length > 0) {
          // Draw the track
          const polyline = L.polyline(trackPoints, {
            color: '#0066cc',
            weight: 4,
            opacity: 0.8
          }).addTo(map);
          
          // Fit map to track bounds
          map.fitBounds(polyline.getBounds(), { padding: [20, 20] });
          
          // Add start/end markers
          L.marker(trackPoints[0], {
            title: 'Start'
          }).addTo(map).bindPopup('Start');
          
          L.marker(trackPoints[trackPoints.length - 1], {
            title: 'End'
          }).addTo(map).bindPopup('End');
        } else {
          // Try to find waypoints
          const waypoints = gpx.querySelectorAll('wpt');
          waypoints.forEach(wp => {
            const lat = parseFloat(wp.getAttribute('lat'));
            const lon = parseFloat(wp.getAttribute('lon'));
            const name = wp.querySelector('name')?.textContent || 'Waypoint';
            if (!isNaN(lat) && !isNaN(lon)) {
              L.marker([lat, lon]).addTo(map).bindPopup(name);
              trackPoints.push([lat, lon]);
            }
          });
          
          if (trackPoints.length > 0) {
            map.fitBounds(L.latLngBounds(trackPoints), { padding: [20, 20] });
          }
        }
      }
    })();
  `;return{html:S,script:T}}function v(){return{options:[{label:"gpxmap",detail:"Insert GPX map widget",invoke:"gpxmap.insertGPXMap"}]}}var w={insertGPXMap:h,renderGPXWidget:b,gpxSlashComplete:v},C={name:"gpxmap",version:.1,imports:["https://get.silverbullet.md/global.plug.json"],requiredPermissions:["fetch"],functions:{insertGPXMap:{path:"./gpxmap.ts:insertGPXMap",command:{name:"GPX: Insert Map Widget",requireMode:"rw"}},renderGPXWidget:{path:"./gpxmap.ts:renderGPXWidget",codeWidget:"gpxmap"},gpxSlashComplete:{path:"./gpxmap.ts:gpxSlashComplete",events:["slash:complete"]}},assets:{}},Jt={manifest:C,functionMapping:w};x(w,C,self.postMessage);export{Jt as plug};
//# sourceMappingURL=gpxmap.plug.js.map
