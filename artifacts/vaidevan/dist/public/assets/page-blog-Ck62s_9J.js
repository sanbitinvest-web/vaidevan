var ia=Object.defineProperty;var na=(e,a,o)=>a in e?ia(e,a,{enumerable:!0,configurable:!0,writable:!0,value:o}):e[a]=o;var C=(e,a,o)=>na(e,typeof a!="symbol"?a+"":a,o);import{s as ca,u as le,j as t,c as da,a as la}from"./page-forms-CafLWIo5.js";import{r as h,R as Me,a as x,j as ma,k as De,l as oe,m as B,A as _,n as ge,o as pa}from"./vendor-icons-D2am8FWP.js";import{m as E}from"./vendor-motion-vZtm-S4e.js";import{g as me}from"./vendor-react-BffUpw4T.js";import{c as ua}from"./vendor-radix-C7rV6EvH.js";function ha(e,a){if(e instanceof RegExp)return{keys:!1,pattern:e};var o,r,s,i,l=[],d="",c=e.split("/");for(c[0]||c.shift();s=c.shift();)o=s[0],o==="*"?(l.push(o),d+=s[1]==="?"?"(?:/(.*))?":"/(.*)"):o===":"?(r=s.indexOf("?",1),i=s.indexOf(".",1),l.push(s.substring(1,~r?r:~i?i:s.length)),d+=~r&&!~i?"(?:/([^/]+?))?":"/([^/]+?)",~i&&(d+=(~r?"?":"")+"\\"+s.substring(i))):d+="/"+s;return{keys:l,pattern:new RegExp("^"+d+(a?"(?=$|/)":"/?$"),"i")}}const ga=Me.useInsertionEffect,fa=typeof window<"u"&&typeof window.document<"u"&&typeof window.document.createElement<"u",va=fa?h.useLayoutEffect:h.useEffect,ba=ga||va,He=e=>{const a=h.useRef([e,(...o)=>a[0](...o)]).current;return ba(()=>{a[0]=e}),a[1]},xa="popstate",pe="pushState",ue="replaceState",ya="hashchange",fe=[xa,pe,ue,ya],Sa=e=>{for(const a of fe)addEventListener(a,e);return()=>{for(const a of fe)removeEventListener(a,e)}},$e=(e,a)=>ca.useSyncExternalStore(Sa,e,a),ve=()=>location.search,Ta=({ssrSearch:e}={})=>$e(ve,e!=null?()=>e:ve),be=()=>location.pathname,ja=({ssrPath:e}={})=>$e(be,e!=null?()=>e:be),Va=(e,{replace:a=!1,state:o=null}={})=>history[a?ue:pe](o,"",e),Aa=(e={})=>[ja(e),Va],xe=Symbol.for("wouter_v3");if(typeof history<"u"&&typeof window[xe]>"u"){for(const e of[pe,ue]){const a=history[e];history[e]=function(){const o=a.apply(this,arguments),r=new Event(e);return r.arguments=arguments,dispatchEvent(r),o}}Object.defineProperty(window,xe,{value:!0})}const Ca=(e,a)=>a.toLowerCase().indexOf(e.toLowerCase())?"~"+a:a.slice(e.length)||"/",Le=(e="")=>e==="/"?"":e,Pa=(e,a)=>e[0]==="~"?e.slice(1):Le(a)+e,Ea=(e="",a)=>Ca(ye(Le(e)),ye(a)),ye=e=>{try{return decodeURI(e)}catch{return e}},Be={hook:Aa,searchHook:Ta,parser:ha,base:"",ssrPath:void 0,ssrSearch:void 0,ssrContext:void 0,hrefs:e=>e,aroundNav:(e,a,o)=>e(a,o)},_e=h.createContext(Be),M=()=>h.useContext(_e),Fe={},Ge=h.createContext(Fe),Ue=()=>h.useContext(Ge),U=e=>{const[a,o]=e.hook(e);return[Ea(e.base,a),He((r,s)=>e.aroundNav(o,Pa(r,e.base),s))]},No=()=>U(M()),Je=(e,a,o,r)=>{const{pattern:s,keys:i}=a instanceof RegExp?{keys:!1,pattern:a}:e(a||"*",r),l=s.exec(o)||[],[d,...c]=l;return d!==void 0?[!0,(()=>{const n=i!==!1?Object.fromEntries(i.map((g,u)=>[g,c[u]])):l.groups;let p={...c};return n&&Object.assign(p,n),p})(),...r?[d]:[]]:[!1,null]},wa=({children:e,...a})=>{const o=M(),r=a.hook?Be:o;let s=r;const[i,l=a.ssrSearch??""]=a.ssrPath?.split("?")??[];i&&(a.ssrSearch=l,a.ssrPath=i),a.hrefs=a.hrefs??a.hook?.hrefs,a.searchHook=a.searchHook??a.hook?.searchHook;let d=h.useRef({}),c=d.current,n=c;for(let p in r){const g=p==="base"?r[p]+(a[p]??""):a[p]??r[p];c===n&&g!==n[p]&&(d.current=n={...n}),n[p]=g,(g!==r[p]||g!==s[p])&&(s=n)}return h.createElement(_e.Provider,{value:s,children:e})},Se=({children:e,component:a},o)=>a?h.createElement(a,{params:o}):typeof e=="function"?e(o):e,qa=e=>{let a=h.useRef(Fe);const o=a.current;return a.current=Object.keys(e).length!==Object.keys(o).length||Object.entries(e).some(([r,s])=>s!==o[r])?e:o},ko=({path:e,nest:a,match:o,...r})=>{const s=M(),[i]=U(s),[l,d,c]=o??Je(s.parser,e,i,a),n=qa({...Ue(),...d});if(!l)return null;const p=c?h.createElement(wa,{base:c},Se(r,n)):Se(r,n);return h.createElement(Ge.Provider,{value:n,children:p})},S=h.forwardRef((e,a)=>{const o=M(),[r,s]=U(o),{to:i="",href:l=i,onClick:d,asChild:c,children:n,className:p,replace:g,state:u,transition:b,...y}=e,T=He(f=>{f.ctrlKey||f.metaKey||f.altKey||f.shiftKey||f.button!==0||(d?.(f),f.defaultPrevented||(f.preventDefault(),s(l,e)))}),v=o.hrefs(l[0]==="~"?l.slice(1):o.base+l,o);return c&&h.isValidElement(n)?h.cloneElement(n,{onClick:T,href:v}):h.createElement("a",{...y,onClick:T,href:v,className:p?.call?p(r===l):p,children:n,ref:a})}),We=e=>Array.isArray(e)?e.flatMap(a=>We(a&&a.type===h.Fragment?a.props.children:a)):[e],zo=({children:e,location:a})=>{const o=M(),[r]=U(o);for(const s of We(e)){let i=0;if(h.isValidElement(s)&&(i=Je(o.parser,s.props.path,a||r,s.props.nest))[0])return h.cloneElement(s,{match:i})}return null};var W,Te;function Oa(){if(Te)return W;Te=1;var e=typeof Element<"u",a=typeof Map=="function",o=typeof Set=="function",r=typeof ArrayBuffer=="function"&&!!ArrayBuffer.isView;function s(i,l){if(i===l)return!0;if(i&&l&&typeof i=="object"&&typeof l=="object"){if(i.constructor!==l.constructor)return!1;var d,c,n;if(Array.isArray(i)){if(d=i.length,d!=l.length)return!1;for(c=d;c--!==0;)if(!s(i[c],l[c]))return!1;return!0}var p;if(a&&i instanceof Map&&l instanceof Map){if(i.size!==l.size)return!1;for(p=i.entries();!(c=p.next()).done;)if(!l.has(c.value[0]))return!1;for(p=i.entries();!(c=p.next()).done;)if(!s(c.value[1],l.get(c.value[0])))return!1;return!0}if(o&&i instanceof Set&&l instanceof Set){if(i.size!==l.size)return!1;for(p=i.entries();!(c=p.next()).done;)if(!l.has(c.value[0]))return!1;return!0}if(r&&ArrayBuffer.isView(i)&&ArrayBuffer.isView(l)){if(d=i.length,d!=l.length)return!1;for(c=d;c--!==0;)if(i[c]!==l[c])return!1;return!0}if(i.constructor===RegExp)return i.source===l.source&&i.flags===l.flags;if(i.valueOf!==Object.prototype.valueOf&&typeof i.valueOf=="function"&&typeof l.valueOf=="function")return i.valueOf()===l.valueOf();if(i.toString!==Object.prototype.toString&&typeof i.toString=="function"&&typeof l.toString=="function")return i.toString()===l.toString();if(n=Object.keys(i),d=n.length,d!==Object.keys(l).length)return!1;for(c=d;c--!==0;)if(!Object.prototype.hasOwnProperty.call(l,n[c]))return!1;if(e&&i instanceof Element)return!1;for(c=d;c--!==0;)if(!((n[c]==="_owner"||n[c]==="__v"||n[c]==="__o")&&i.$$typeof)&&!s(i[n[c]],l[n[c]]))return!1;return!0}return i!==i&&l!==l}return W=function(l,d){try{return s(l,d)}catch(c){if((c.message||"").match(/stack|recursion/i))return console.warn("react-fast-compare cannot handle circular refs"),!1;throw c}},W}var Na=Oa();const ka=me(Na);var K,je;function za(){if(je)return K;je=1;var e=function(a,o,r,s,i,l,d,c){if(!a){var n;if(o===void 0)n=new Error("Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.");else{var p=[r,s,i,l,d,c],g=0;n=new Error(o.replace(/%s/g,function(){return p[g++]})),n.name="Invariant Violation"}throw n.framesToPop=1,n}};return K=e,K}var Ia=za();const Ve=me(Ia);var Q,Ae;function Ra(){return Ae||(Ae=1,Q=function(a,o,r,s){var i=r?r.call(s,a,o):void 0;if(i!==void 0)return!!i;if(a===o)return!0;if(typeof a!="object"||!a||typeof o!="object"||!o)return!1;var l=Object.keys(a),d=Object.keys(o);if(l.length!==d.length)return!1;for(var c=Object.prototype.hasOwnProperty.bind(o),n=0;n<l.length;n++){var p=l[n];if(!c(p))return!1;var g=a[p],u=o[p];if(i=r?r.call(s,g,u,p):void 0,i===!1||i===void 0&&g!==u)return!1}return!0}),Q}var Ma=Ra();const Da=me(Ma);var Ke=(e=>(e.BASE="base",e.BODY="body",e.HEAD="head",e.HTML="html",e.LINK="link",e.META="meta",e.NOSCRIPT="noscript",e.SCRIPT="script",e.STYLE="style",e.TITLE="title",e.FRAGMENT="Symbol(react.fragment)",e))(Ke||{}),Y={link:{rel:["amphtml","canonical","alternate"]},script:{type:["application/ld+json"]},meta:{charset:"",name:["generator","robots","description"],property:["og:type","og:title","og:url","og:image","og:image:alt","og:description","twitter:url","twitter:title","twitter:description","twitter:image","twitter:image:alt","twitter:card","twitter:site"]}},Ce=Object.values(Ke),J={accesskey:"accessKey",charset:"charSet",class:"className",contenteditable:"contentEditable",contextmenu:"contextMenu","http-equiv":"httpEquiv",itemprop:"itemProp",tabindex:"tabIndex"},Qe=Object.entries(J).reduce((e,[a,o])=>(e[o]=a,e),{}),A="data-rh",O={DEFAULT_TITLE:"defaultTitle",DEFER:"defer",ENCODE_SPECIAL_CHARACTERS:"encodeSpecialCharacters",ON_CHANGE_CLIENT_STATE:"onChangeClientState",TITLE_TEMPLATE:"titleTemplate",PRIORITIZE_SEO_TAGS:"prioritizeSeoTags"},N=(e,a)=>{for(let o=e.length-1;o>=0;o-=1){const r=e[o];if(Object.prototype.hasOwnProperty.call(r,a))return r[a]}return null},Ha=e=>{let a=N(e,"title");const o=N(e,O.TITLE_TEMPLATE);if(Array.isArray(a)&&(a=a.join("")),o&&a)return o.replace(/%s/g,()=>a);const r=N(e,O.DEFAULT_TITLE);return a||r||void 0},$a=e=>N(e,O.ON_CHANGE_CLIENT_STATE)||(()=>{}),Z=(e,a)=>a.filter(o=>typeof o[e]<"u").map(o=>o[e]).reduce((o,r)=>({...o,...r}),{}),La=(e,a)=>a.filter(o=>typeof o.base<"u").map(o=>o.base).reverse().reduce((o,r)=>{if(!o.length){const s=Object.keys(r);for(let i=0;i<s.length;i+=1){const d=s[i].toLowerCase();if(e.indexOf(d)!==-1&&r[d])return o.concat(r)}}return o},[]),Ba=e=>console&&typeof console.warn=="function"&&console.warn(e),z=(e,a,o)=>{const r={};return o.filter(s=>Array.isArray(s[e])?!0:(typeof s[e]<"u"&&Ba(`Helmet: ${e} should be of type "Array". Instead found type "${typeof s[e]}"`),!1)).map(s=>s[e]).reverse().reduce((s,i)=>{const l={};i.filter(c=>{let n;const p=Object.keys(c);for(let u=0;u<p.length;u+=1){const b=p[u],y=b.toLowerCase();a.indexOf(y)!==-1&&!(n==="rel"&&c[n].toLowerCase()==="canonical")&&!(y==="rel"&&c[y].toLowerCase()==="stylesheet")&&(n=y),a.indexOf(b)!==-1&&(b==="innerHTML"||b==="cssText"||b==="itemprop")&&(n=b)}if(!n||!c[n])return!1;const g=c[n].toLowerCase();return r[n]||(r[n]={}),l[n]||(l[n]={}),r[n][g]?!1:(l[n][g]=!0,!0)}).reverse().forEach(c=>s.push(c));const d=Object.keys(l);for(let c=0;c<d.length;c+=1){const n=d[c],p={...r[n],...l[n]};r[n]=p}return s},[]).reverse()},_a=(e,a)=>{if(Array.isArray(e)&&e.length){for(let o=0;o<e.length;o+=1)if(e[o][a])return!0}return!1},Fa=e=>({baseTag:La(["href"],e),bodyAttributes:Z("bodyAttributes",e),defer:N(e,O.DEFER),encode:N(e,O.ENCODE_SPECIAL_CHARACTERS),htmlAttributes:Z("htmlAttributes",e),linkTags:z("link",["rel","href"],e),metaTags:z("meta",["name","charset","http-equiv","property","itemprop"],e),noscriptTags:z("noscript",["innerHTML"],e),onChangeClientState:$a(e),scriptTags:z("script",["src","innerHTML"],e),styleTags:z("style",["cssText"],e),title:Ha(e),titleAttributes:Z("titleAttributes",e),prioritizeSeoTags:_a(e,O.PRIORITIZE_SEO_TAGS)}),Ye=e=>Array.isArray(e)?e.join(""):e,Ga=(e,a)=>{const o=Object.keys(e);for(let r=0;r<o.length;r+=1)if(a[o[r]]&&a[o[r]].includes(e[o[r]]))return!0;return!1},X=(e,a)=>Array.isArray(e)?e.reduce((o,r)=>(Ga(r,a)?o.priority.push(r):o.default.push(r),o),{priority:[],default:[]}):{default:e,priority:[]},Pe=(e,a)=>({...e,[a]:void 0}),Ua=["noscript","script","style"],te=(e,a=!0)=>a===!1?String(e):String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;"),Ze=e=>Object.keys(e).reduce((a,o)=>{const r=typeof e[o]<"u"?`${o}="${e[o]}"`:`${o}`;return a?`${a} ${r}`:r},""),Ja=(e,a,o,r)=>{const s=Ze(o),i=Ye(a);return s?`<${e} ${A}="true" ${s}>${te(i,r)}</${e}>`:`<${e} ${A}="true">${te(i,r)}</${e}>`},Wa=(e,a,o=!0)=>a.reduce((r,s)=>{const i=s,l=Object.keys(i).filter(n=>!(n==="innerHTML"||n==="cssText")).reduce((n,p)=>{const g=typeof i[p]>"u"?p:`${p}="${te(i[p],o)}"`;return n?`${n} ${g}`:g},""),d=i.innerHTML||i.cssText||"",c=Ua.indexOf(e)===-1;return`${r}<${e} ${A}="true" ${l}${c?"/>":`>${d}</${e}>`}`},""),Xe=(e,a={})=>Object.keys(e).reduce((o,r)=>{const s=J[r];return o[s||r]=e[r],o},a),Ka=(e,a,o)=>{const r={key:a,[A]:!0},s=Xe(o,r);return[x.createElement("title",s,a)]},$=(e,a)=>a.map((o,r)=>{const s={key:r,[A]:!0};return Object.keys(o).forEach(i=>{const d=J[i]||i;if(d==="innerHTML"||d==="cssText"){const c=o.innerHTML||o.cssText;s.dangerouslySetInnerHTML={__html:c}}else s[d]=o[i]}),x.createElement(e,s)}),V=(e,a,o=!0)=>{switch(e){case"title":return{toComponent:()=>Ka(e,a.title,a.titleAttributes),toString:()=>Ja(e,a.title,a.titleAttributes,o)};case"bodyAttributes":case"htmlAttributes":return{toComponent:()=>Xe(a),toString:()=>Ze(a)};default:return{toComponent:()=>$(e,a),toString:()=>Wa(e,a,o)}}},Qa=({metaTags:e,linkTags:a,scriptTags:o,encode:r})=>{const s=X(e,Y.meta),i=X(a,Y.link),l=X(o,Y.script);return{priorityMethods:{toComponent:()=>[...$("meta",s.priority),...$("link",i.priority),...$("script",l.priority)],toString:()=>`${V("meta",s.priority,r)} ${V("link",i.priority,r)} ${V("script",l.priority,r)}`},metaTags:s.default,linkTags:i.default,scriptTags:l.default}},Ya=e=>{const{baseTag:a,bodyAttributes:o,encode:r=!0,htmlAttributes:s,noscriptTags:i,styleTags:l,title:d="",titleAttributes:c,prioritizeSeoTags:n}=e;let{linkTags:p,metaTags:g,scriptTags:u}=e,b={toComponent:()=>[],toString:()=>""};return n&&({priorityMethods:b,linkTags:p,metaTags:g,scriptTags:u}=Qa(e)),{priority:b,base:V("base",a,r),bodyAttributes:V("bodyAttributes",o,r),htmlAttributes:V("htmlAttributes",s,r),link:V("link",p,r),meta:V("meta",g,r),noscript:V("noscript",i,r),script:V("script",u,r),style:V("style",l,r),title:V("title",{title:d,titleAttributes:c},r)}},re=Ya,D=[],he=!!(typeof window<"u"&&window.document&&window.document.createElement),se=class{constructor(e,a){C(this,"instances",[]);C(this,"canUseDOM",he);C(this,"context");C(this,"value",{setHelmet:e=>{this.context.helmet=e},helmetInstances:{get:()=>this.canUseDOM?D:this.instances,add:e=>{(this.canUseDOM?D:this.instances).push(e)},remove:e=>{const a=(this.canUseDOM?D:this.instances).indexOf(e);(this.canUseDOM?D:this.instances).splice(a,1)}}});this.context=e,this.canUseDOM=a||!1,a||(e.helmet=re({baseTag:[],bodyAttributes:{},htmlAttributes:{},linkTags:[],metaTags:[],noscriptTags:[],scriptTags:[],styleTags:[],title:"",titleAttributes:{}}))}},Za=parseInt(x.version.split(".")[0],10),ie=Za>=19,Xa={},ea=x.createContext(Xa),w,eo=(w=class extends h.Component{constructor(o){super(o);C(this,"helmetData");ie?this.helmetData=null:this.helmetData=new se(this.props.context||{},w.canUseDOM)}render(){return ie?x.createElement(x.Fragment,null,this.props.children):x.createElement(ea.Provider,{value:this.helmetData.value},this.props.children)}},C(w,"canUseDOM",he),w),q=(e,a)=>{const o=document.head||document.querySelector("head"),r=o.querySelectorAll(`${e}[${A}]`),s=[].slice.call(r),i=[];let l;return a&&a.length&&a.forEach(d=>{const c=document.createElement(e);for(const n in d)if(Object.prototype.hasOwnProperty.call(d,n))if(n==="innerHTML")c.innerHTML=d.innerHTML;else if(n==="cssText"){const p=d.cssText;c.appendChild(document.createTextNode(p))}else{const p=n,g=typeof d[p]>"u"?"":d[p];c.setAttribute(n,g)}c.setAttribute(A,"true"),s.some((n,p)=>(l=p,c.isEqualNode(n)))?s.splice(l,1):i.push(c)}),s.forEach(d=>d.parentNode?.removeChild(d)),i.forEach(d=>o.appendChild(d)),{oldTags:s,newTags:i}},ne=(e,a)=>{const o=document.getElementsByTagName(e)[0];if(!o)return;const r=o.getAttribute(A),s=r?r.split(","):[],i=[...s],l=Object.keys(a);for(const d of l){const c=a[d]||"";o.getAttribute(d)!==c&&o.setAttribute(d,c),s.indexOf(d)===-1&&s.push(d);const n=i.indexOf(d);n!==-1&&i.splice(n,1)}for(let d=i.length-1;d>=0;d-=1)o.removeAttribute(i[d]);s.length===i.length?o.removeAttribute(A):o.getAttribute(A)!==l.join(",")&&o.setAttribute(A,l.join(","))},ao=(e,a)=>{typeof e<"u"&&document.title!==e&&(document.title=Ye(e)),ne("title",a)},Ee=(e,a)=>{const{baseTag:o,bodyAttributes:r,htmlAttributes:s,linkTags:i,metaTags:l,noscriptTags:d,onChangeClientState:c,scriptTags:n,styleTags:p,title:g,titleAttributes:u}=e;ne("body",r),ne("html",s),ao(g,u);const b={baseTag:q("base",o),linkTags:q("link",i),metaTags:q("meta",l),noscriptTags:q("noscript",d),scriptTags:q("script",n),styleTags:q("style",p)},y={},T={};Object.keys(b).forEach(v=>{const{newTags:f,oldTags:k}=b[v];f.length&&(y[v]=f),k.length&&(T[v]=b[v].oldTags)}),a&&a(),c(e,y,T)},I=null,oo=e=>{I&&cancelAnimationFrame(I),e.defer?I=requestAnimationFrame(()=>{Ee(e,()=>{I=null})}):(Ee(e),I=null)},to=oo,we=class extends h.Component{constructor(){super(...arguments);C(this,"rendered",!1)}shouldComponentUpdate(a){return!Da(a,this.props)}componentDidUpdate(){this.emitChange()}componentWillUnmount(){const{helmetInstances:a}=this.props.context;a.remove(this),this.emitChange()}emitChange(){const{helmetInstances:a,setHelmet:o}=this.props.context;let r=null;const s=Fa(a.get().map(i=>{const{context:l,...d}=i.props;return d}));eo.canUseDOM?to(s):re&&(r=re(s)),o(r)}init(){if(this.rendered)return;this.rendered=!0;const{helmetInstances:a}=this.props.context;a.add(this),this.emitChange()}render(){return this.init(),null}},L=[],qe=e=>{const a={};for(const o of Object.keys(e))a[Qe[o]||o]=e[o];return a},P=e=>{const a={};for(const o of Object.keys(e)){const r=J[o];a[r||o]=e[o]}return a},Oe=(e,a)=>{if(!he)return;const o=document.getElementsByTagName(e)[0];if(!o)return;const r="data-rh-managed",s=o.getAttribute(r),i=s?s.split(","):[],l=Object.keys(a);for(const d of i)l.includes(d)||o.removeAttribute(d);for(const d of l){const c=a[d];c==null||c===!1?o.removeAttribute(d):c===!0?o.setAttribute(d,""):o.setAttribute(d,String(c))}l.length>0?o.setAttribute(r,l.join(",")):o.removeAttribute(r)},ee=()=>{const e={},a={};for(const o of L){const{htmlAttributes:r,bodyAttributes:s}=o.props;r&&Object.assign(e,qe(r)),s&&Object.assign(a,qe(s))}Oe("html",e),Oe("body",a)},ro=class extends h.Component{componentDidMount(){L.push(this),ee()}componentDidUpdate(){ee()}componentWillUnmount(){const e=L.indexOf(this);e!==-1&&L.splice(e,1),ee()}resolveTitle(){const{title:e,titleTemplate:a,defaultTitle:o}=this.props;return e&&a?a.replace(/%s/g,()=>Array.isArray(e)?e.join(""):e):e||o||void 0}renderTitle(){const e=this.resolveTitle();if(e===void 0)return null;const a=this.props.titleAttributes||{};return x.createElement("title",P(a),e)}renderBase(){const{base:e}=this.props;return e?x.createElement("base",P(e)):null}renderMeta(){const{meta:e}=this.props;return!e||!Array.isArray(e)?null:e.map((a,o)=>x.createElement("meta",{key:o,...P(a)}))}renderLink(){const{link:e}=this.props;return!e||!Array.isArray(e)?null:e.map((a,o)=>x.createElement("link",{key:o,...P(a)}))}renderScript(){const{script:e}=this.props;return!e||!Array.isArray(e)?null:e.map((a,o)=>{const{innerHTML:r,...s}=a,i=P(s);return r&&(i.dangerouslySetInnerHTML={__html:r}),x.createElement("script",{key:o,...i})})}renderStyle(){const{style:e}=this.props;return!e||!Array.isArray(e)?null:e.map((a,o)=>{const{cssText:r,...s}=a,i=P(s);return r&&(i.dangerouslySetInnerHTML={__html:r}),x.createElement("style",{key:o,...i})})}renderNoscript(){const{noscript:e}=this.props;return!e||!Array.isArray(e)?null:e.map((a,o)=>{const{innerHTML:r,...s}=a,i=P(s);return r&&(i.dangerouslySetInnerHTML={__html:r}),x.createElement("noscript",{key:o,...i})})}render(){return x.createElement(x.Fragment,null,this.renderTitle(),this.renderBase(),this.renderMeta(),this.renderLink(),this.renderScript(),this.renderStyle(),this.renderNoscript())}},ae,aa=(ae=class extends h.Component{shouldComponentUpdate(e){return!ka(Pe(this.props,"helmetData"),Pe(e,"helmetData"))}mapNestedChildrenToProps(e,a){if(!a)return null;switch(e.type){case"script":case"noscript":return{innerHTML:a};case"style":return{cssText:a};default:throw new Error(`<${e.type} /> elements are self-closing and can not contain children. Refer to our API for more information.`)}}flattenArrayTypeChildren(e,a,o,r){return{...a,[e.type]:[...a[e.type]||[],{...o,...this.mapNestedChildrenToProps(e,r)}]}}mapObjectTypeChildren(e,a,o,r){switch(e.type){case"title":return{...a,[e.type]:r,titleAttributes:{...o}};case"body":return{...a,bodyAttributes:{...o}};case"html":return{...a,htmlAttributes:{...o}};default:return{...a,[e.type]:{...o}}}}mapArrayTypeChildrenToProps(e,a){let o={...a};return Object.keys(e).forEach(r=>{o={...o,[r]:e[r]}}),o}warnOnInvalidChildren(e,a){return Ve(Ce.some(o=>e.type===o),typeof e.type=="function"?"You may be attempting to nest <Helmet> components within each other, which is not allowed. Refer to our API for more information.":`Only elements types ${Ce.join(", ")} are allowed. Helmet does not support rendering <${e.type}> elements. Refer to our API for more information.`),Ve(!a||typeof a=="string"||Array.isArray(a)&&!a.some(o=>typeof o!="string"),`Helmet expects a string as a child of <${e.type}>. Did you forget to wrap your children in braces? ( <${e.type}>{\`\`}</${e.type}> ) Refer to our API for more information.`),!0}mapChildrenToProps(e,a){let o={};return x.Children.forEach(e,r=>{if(!r||!r.props)return;const{children:s,...i}=r.props,l=Object.keys(i).reduce((c,n)=>(c[Qe[n]||n]=i[n],c),{});let{type:d}=r;switch(typeof d=="symbol"?d=d.toString():this.warnOnInvalidChildren(r,s),d){case"Symbol(react.fragment)":a=this.mapChildrenToProps(s,a);break;case"link":case"meta":case"noscript":case"script":case"style":o=this.flattenArrayTypeChildren(r,o,l,s);break;default:a=this.mapObjectTypeChildren(r,a,l,s);break}}),this.mapArrayTypeChildrenToProps(o,a)}render(){const{children:e,...a}=this.props;let o={...a},{helmetData:r}=a;if(e&&(o=this.mapChildrenToProps(e,o)),r&&!(r instanceof se)){const s=r;r=new se(s.context,!0),delete o.helmetData}return ie?x.createElement(ro,{...o}):r?x.createElement(we,{...o,context:r.value}):x.createElement(ea.Consumer,null,s=>x.createElement(we,{...o,context:s}))}},C(ae,"defaultProps",{defer:!0,encodeSpecialCharacters:!0,prioritizeSeoTags:!1}),ae);const so="/".replace(/\/$/,""),io=`${so}/api`;function no(){return localStorage.getItem("vdv_token")}async function m(e,a){const o=no(),r=await fetch(`${io}${e}`,{...a,headers:{"Content-Type":"application/json",...o?{Authorization:`Bearer ${o}`}:{},...a?.headers}});if(!r.ok){const s=await r.json().catch(()=>({error:"Erro desconhecido"}));throw new Error(s.error||"Erro na requisição")}return r.json()}const ce={login:(e,a)=>m("/auth/login",{method:"POST",body:JSON.stringify({email:e,password:a})}),me:()=>m("/auth/me"),dashboard:()=>m("/investor/dashboard"),overview:()=>m("/investor/overview"),financials:()=>m("/investor/financials"),vehicles:()=>m("/investor/vehicles"),contracts:()=>m("/investor/contracts"),createContract:e=>m("/investor/contracts",{method:"POST",body:JSON.stringify(e)}),signContract:(e,a)=>m(`/investor/contracts/${e}/sign`,{method:"PATCH",body:JSON.stringify(a??{})}),cancelContract:e=>m(`/investor/contracts/${e}/cancel`,{method:"PATCH"}),profile:()=>m("/investor/profile"),updateProfile:e=>m("/investor/profile",{method:"PUT",body:JSON.stringify(e)}),updateDocuments:e=>m("/investor/documents",{method:"PATCH",body:JSON.stringify(e)}),verifyGovBr:()=>m("/investor/profile/govbr-verify",{method:"PATCH"}),clients:()=>m("/admin/clients"),client:e=>m(`/admin/clients/${e}`),createClient:e=>m("/admin/clients",{method:"POST",body:JSON.stringify(e)}),updateClient:(e,a)=>m(`/admin/clients/${e}`,{method:"PUT",body:JSON.stringify(a)}),deleteClient:e=>m(`/admin/clients/${e}`,{method:"DELETE"}),verifyClientGovBr:e=>m(`/admin/clients/${e}/govbr-verify`,{method:"PATCH"}),contractTemplates:()=>m("/admin/contract-templates"),contractTemplate:e=>m(`/admin/contract-templates/${e}`),createContractTemplate:e=>m("/admin/contract-templates",{method:"POST",body:JSON.stringify(e)}),updateContractTemplate:(e,a)=>m(`/admin/contract-templates/${e}`,{method:"PUT",body:JSON.stringify(a)}),deleteContractTemplate:e=>m(`/admin/contract-templates/${e}`,{method:"DELETE"}),registerPartner:e=>m("/partners",{method:"POST",body:JSON.stringify(e)}),partners:()=>m("/admin/partners"),updatePartnerStatus:(e,a)=>m(`/admin/partners/${e}/status`,{method:"PATCH",body:JSON.stringify({status:a})}),updatePartnerDocStatus:(e,a,o)=>m(`/admin/partners/${e}/doc-status`,{method:"PATCH",body:JSON.stringify({field:a,status:o})}),deletePartner:e=>m(`/admin/partners/${e}`,{method:"DELETE"}),investorApplications:()=>m("/admin/investor-applications"),investorApplication:e=>m(`/admin/investor-applications/${e}`),reviewInvestorApplication:e=>m(`/admin/investor-applications/${e}/review`,{method:"PATCH"}),approveInvestorApplication:(e,a)=>m(`/admin/investor-applications/${e}/approve`,{method:"PATCH",body:JSON.stringify(a)}),rejectInvestorApplication:(e,a)=>m(`/admin/investor-applications/${e}/reject`,{method:"PATCH",body:JSON.stringify(a)}),updateInvestorNotes:(e,a)=>m(`/admin/investor-applications/${e}/notes`,{method:"PATCH",body:JSON.stringify({kycNotes:a})}),resetInvestorPassword:(e,a)=>m(`/admin/investor-applications/${e}/reset-password`,{method:"PATCH",body:JSON.stringify({newPassword:a})}),createReservation:e=>m("/reservations",{method:"POST",body:JSON.stringify(e)}),getReservationForPayment:e=>m(`/reservations/${e}/pay`),createPaymentLink:(e,a)=>m(`/reservations/${e}/pay/${a}`,{method:"POST"}),reservations:()=>m("/admin/reservations"),updateReservation:(e,a)=>m(`/admin/reservations/${e}`,{method:"PATCH",body:JSON.stringify(a)}),deleteReservation:e=>m(`/admin/reservations/${e}`,{method:"DELETE"}),generateAdminPaymentLink:(e,a)=>m(`/admin/reservations/${e}/generate-payment-link`,{method:"POST",body:JSON.stringify({gateway:a})}),vehicleListings:()=>m("/investor/vehicle-listings"),adminVehicleListings:()=>m("/admin/vehicle-listings"),createAdminVehicleListing:e=>m("/admin/vehicle-listings",{method:"POST",body:JSON.stringify(e)}),updateAdminVehicleListing:(e,a)=>m(`/admin/vehicle-listings/${e}`,{method:"PUT",body:JSON.stringify(a)}),updateAdminVehicleListingStatus:(e,a)=>m(`/admin/vehicle-listings/${e}/status`,{method:"PATCH",body:JSON.stringify({status:a})}),deleteAdminVehicleListing:e=>m(`/admin/vehicle-listings/${e}`,{method:"DELETE"}),trackingActive:()=>m("/admin/tracking/active"),trackingDrivers:()=>m("/admin/tracking/drivers"),createTrackingDriver:e=>m("/admin/tracking/drivers",{method:"POST",body:JSON.stringify(e)}),updateTrackingDriver:(e,a)=>m(`/admin/tracking/drivers/${e}`,{method:"PUT",body:JSON.stringify(a)}),deleteTrackingDriver:e=>m(`/admin/tracking/drivers/${e}`,{method:"DELETE"}),setVehicleTrackerUrl:(e,a)=>m(`/admin/tracking/vehicles/${e}/tracker-url`,{method:"PATCH",body:JSON.stringify({trackerUrl:a})}),favorites:()=>m("/investor/favorites"),addFavorite:e=>m("/investor/favorites",{method:"POST",body:JSON.stringify(e)}),removeFavorite:e=>m(`/investor/favorites/${encodeURIComponent(e)}`,{method:"DELETE"}),anonFavorites:()=>m("/favorites/anon",{credentials:"include"}),addAnonFavorite:e=>m("/favorites/anon",{method:"POST",body:JSON.stringify(e),credentials:"include"}),removeAnonFavorite:e=>m(`/favorites/anon/${encodeURIComponent(e)}`,{method:"DELETE",credentials:"include"}),replaceAnonFavorites:e=>m("/favorites/anon",{method:"PUT",body:JSON.stringify(e),credentials:"include"}),otpSend:e=>m("/auth/otp/send",{method:"POST",body:JSON.stringify({email:e})}),otpVerify:(e,a)=>m("/auth/otp/verify",{method:"POST",body:JSON.stringify({email:e,code:a})}),seed:()=>m("/seed",{method:"POST"}),blogPosts:()=>m("/blog/posts"),blogAdminPosts:()=>m("/blog/admin/posts"),createBlogPost:e=>m("/blog/posts",{method:"POST",body:JSON.stringify(e)}),updateBlogPost:(e,a)=>m(`/blog/posts/${e}`,{method:"PUT",body:JSON.stringify(a)}),deleteBlogPost:e=>m(`/blog/posts/${e}`,{method:"DELETE"}),toggleBlogPost:e=>m(`/blog/posts/${e}/toggle`,{method:"PATCH"}),syncBlogFromWP:()=>m("/soro/sync-from-wp",{method:"POST"})},Io=Object.freeze(Object.defineProperty({__proto__:null,api:ce},Symbol.toStringTag,{value:"Module"})),co="5511999294694",oa=`https://wa.me/${co}?text=`,Ne={general:{pt:"Olá! Vi o site da VaideVan e gostaria de saber mais sobre os serviços de locação de van executiva.",en:"Hello! I found VaideVan's website and I'd like to learn more about your executive van rental services.",es:"¡Hola! Encontré el sitio de VaideVan y me gustaría obtener más información sobre el alquiler de vans ejecutivas."},hero:{pt:"Olá! Gostaria de um orçamento de van executiva premium.",en:"Hello! I'd like to get a quote for a premium executive van.",es:"¡Hola! Me gustaría cotizar una van ejecutiva premium."},investor:{pt:"Olá! Tenho interesse em investir na VaideVan. Gostaria de receber informações sobre cotas, retorno e condições de entrada.",en:"Hello! I'm interested in investing with VaideVan. I'd like to learn about available shares, returns, and entry conditions.",es:"¡Hola! Me interesa invertir en VaideVan. Me gustaría recibir información sobre cuotas, retorno y condiciones de entrada."},b2b:{pt:"Olá! Represento uma empresa e gostaria de conhecer as soluções B2B da VaideVan para locação de frota executiva.",en:"Hello! I represent a company and I'd like to learn about VaideVan's B2B corporate fleet rental solutions.",es:"¡Hola! Represento a una empresa y quisiera conocer las soluciones B2B de VaideVan para el alquiler de flota ejecutiva."},airport:{pt:"Olá! Gostaria de um orçamento de transfer para aeroporto.",en:"Hello! I'd like a quote for airport transfer service.",es:"¡Hola! Me gustaría cotizar un servicio de transfer al aeropuerto."},events:{pt:"Olá! Gostaria de um orçamento de van para evento.",en:"Hello! I'd like a quote for event transportation.",es:"¡Hola! Me gustaría cotizar el transporte para un evento."},tours:{pt:"Olá! Gostaria de um orçamento de van para excursão em grupo.",en:"Hello! I'd like a quote for a group van tour.",es:"¡Hola! Me gustaría cotizar una excursión en van para grupo."},executive:{pt:"Olá! Gostaria de um orçamento de transporte executivo VIP.",en:"Hello! I'd like a quote for VIP executive transportation.",es:"¡Hola! Me gustaría cotizar el transporte ejecutivo VIP."},corporate:{pt:"Olá! Gostaria de um orçamento de locação corporativa de van.",en:"Hello! I'd like a quote for corporate van rental.",es:"¡Hola! Me gustaría cotizar el alquiler corporativo de van."},blog:{pt:"Olá! Estava lendo o blog da VaideVan e gostaria de um orçamento de transporte executivo.",en:"Hello! I was reading the VaideVan blog and I'd like to get a quote for executive transportation.",es:"¡Hola! Estaba leyendo el blog de VaideVan y me gustaría cotizar el transporte ejecutivo."},route:{pt:"Olá! Gostaria de simular uma rota e receber um orçamento com preço final.",en:"Hello! I'd like to get a quote for a specific route.",es:"¡Hola! Me gustaría cotizar una ruta específica y recibir el precio final."},fleet:{pt:"Olá! Gostaria de conhecer a frota VaideVan e solicitar um orçamento.",en:"Hello! I'd like to learn about VaideVan's fleet and request a quote.",es:"¡Hola! Me gustaría conocer la flota de VaideVan y solicitar una cotización."},customization:{pt:"Olá! Gostaria de informações sobre customização de van executiva VaideVan.",en:"Hello! I'd like information about VaideVan's executive van customization options.",es:"¡Hola! Me gustaría información sobre la personalización de vans ejecutivas VaideVan."},buy_sell:{pt:"Olá! Tenho interesse em comprar ou vender uma van executiva pela VaideVan.",en:"Hello! I'm interested in buying or selling an executive van through VaideVan.",es:"¡Hola! Me interesa comprar o vender una van ejecutiva a través de VaideVan."},partner:{pt:"Olá! Gostaria de saber mais sobre parcerias com a VaideVan.",en:"Hello! I'd like to learn more about partnering with VaideVan.",es:"¡Hola! Me gustaría saber más sobre las alianzas con VaideVan."},register:{pt:"Olá! Gostaria de me cadastrar como cliente VaideVan.",en:"Hello! I'd like to register as a VaideVan client.",es:"¡Hola! Me gustaría registrarme como cliente de VaideVan."}};function lo(e){return e.startsWith("en")?"en":e.startsWith("es")?"es":"pt"}function F(e,a){const o=lo(a),r=Ne[e]?.[o]??Ne.general[o];return oa+encodeURIComponent(r)}function Ro(e){return oa+encodeURIComponent(e)}function ta(){const{i18n:e}=le();return t.jsx("a",{href:F("general",e.language),target:"_blank",rel:"noopener noreferrer","data-testid":"whatsapp-float-button",className:"fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-[#25D366] text-white rounded-full shadow-lg hover:scale-110 transition-transform duration-300 animate-pulse","aria-label":"Falar com a VaideVan no WhatsApp",children:t.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor",className:"w-6 h-6 sm:w-8 sm:h-8",children:[t.jsx("path",{d:"M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.322.101.144.453.712 1.016 1.15.656.51 1.224.667 1.368.753.144.087.232.072.318-.014.087-.087.376-.434.477-.584.101-.151.202-.123.332-.079.13.043.824.39 1.026.491.202.101.332.144.376.217.043.072.043.434-.101.839z"}),t.jsx("path",{d:"M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.122 1.542 5.864L.25 23.75l6.039-1.205C7.94 23.447 9.877 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm.031 20.063c-1.844 0-3.488-.545-4.887-1.464l-.348-.225-3.081.815.827-2.984-.253-.393C3.331 14.542 2.76 12.871 2.76 11.938c0-5.114 4.161-9.274 9.274-9.274 5.114 0 9.275 4.16 9.275 9.274 0 5.114-4.161 9.275-9.274 9.275z"})]})})}var mo=Symbol.for("react.lazy"),G=Me[" use ".trim().toString()];function po(e){return typeof e=="object"&&e!==null&&"then"in e}function ra(e){return e!=null&&typeof e=="object"&&"$$typeof"in e&&e.$$typeof===mo&&"_payload"in e&&po(e._payload)}function uo(e){const a=go(e),o=h.forwardRef((r,s)=>{let{children:i,...l}=r;ra(i)&&typeof G=="function"&&(i=G(i._payload));const d=h.Children.toArray(i),c=d.find(vo);if(c){const n=c.props.children,p=d.map(g=>g===c?h.Children.count(n)>1?h.Children.only(null):h.isValidElement(n)?n.props.children:null:g);return t.jsx(a,{...l,ref:s,children:h.isValidElement(n)?h.cloneElement(n,void 0,p):null})}return t.jsx(a,{...l,ref:s,children:i})});return o.displayName=`${e}.Slot`,o}var ho=uo("Slot");function go(e){const a=h.forwardRef((o,r)=>{let{children:s,...i}=o;if(ra(s)&&typeof G=="function"&&(s=G(s._payload)),h.isValidElement(s)){const l=xo(s),d=bo(i,s.props);return s.type!==h.Fragment&&(d.ref=r?ua(r,l):l),h.cloneElement(s,d)}return h.Children.count(s)>1?h.Children.only(null):null});return a.displayName=`${e}.SlotClone`,a}var fo=Symbol("radix.slottable");function vo(e){return h.isValidElement(e)&&typeof e.type=="function"&&"__radixId"in e.type&&e.type.__radixId===fo}function bo(e,a){const o={...a};for(const r in a){const s=e[r],i=a[r];/^on[A-Z]/.test(r)?s&&i?o[r]=(...d)=>{const c=i(...d);return s(...d),c}:s&&(o[r]=s):r==="style"?o[r]={...s,...i}:r==="className"&&(o[r]=[s,i].filter(Boolean).join(" "))}return{...e,...o}}function xo(e){let a=Object.getOwnPropertyDescriptor(e.props,"ref")?.get,o=a&&"isReactWarning"in a&&a.isReactWarning;return o?e.ref:(a=Object.getOwnPropertyDescriptor(e,"ref")?.get,o=a&&"isReactWarning"in a&&a.isReactWarning,o?e.props.ref:e.props.ref||e.ref)}const ke=e=>typeof e=="boolean"?`${e}`:e===0?"0":e,ze=da,yo=(e,a)=>o=>{var r;if(a?.variants==null)return ze(e,o?.class,o?.className);const{variants:s,defaultVariants:i}=a,l=Object.keys(s).map(n=>{const p=o?.[n],g=i?.[n];if(p===null)return null;const u=ke(p)||ke(g);return s[n][u]}),d=o&&Object.entries(o).reduce((n,p)=>{let[g,u]=p;return u===void 0||(n[g]=u),n},{}),c=a==null||(r=a.compoundVariants)===null||r===void 0?void 0:r.reduce((n,p)=>{let{class:g,className:u,...b}=p;return Object.entries(b).every(y=>{let[T,v]=y;return Array.isArray(v)?v.includes({...i,...d}[T]):{...i,...d}[T]===v})?[...n,g,u]:n},[]);return ze(e,l,c,o?.class,o?.className)},So=yo("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover-elevate active-elevate-2",{variants:{variant:{default:"bg-primary text-primary-foreground border border-primary-border",destructive:"bg-destructive text-destructive-foreground shadow-sm border-destructive-border",outline:" border [border-color:var(--button-outline)] shadow-xs active:shadow-none ",secondary:"border bg-secondary text-secondary-foreground border border-secondary-border ",ghost:"border border-transparent",link:"text-primary underline-offset-4 hover:underline"},size:{default:"min-h-9 px-4 py-2",sm:"min-h-8 rounded-md px-3 text-xs",lg:"min-h-10 rounded-md px-8",icon:"h-9 w-9"}},defaultVariants:{variant:"default",size:"default"}}),de=h.forwardRef(({className:e,variant:a,size:o,asChild:r=!1,...s},i)=>{const l=r?ho:"button";return t.jsx(l,{className:la(So({variant:a,size:o,className:e})),ref:i,...s})});de.displayName="Button";const R=[{slug:"contratar-van-para-funcionarios-empresa",title:"Como Contratar Van para Funcionários da Empresa: Guia Completo",excerpt:"Descubra como o transporte fretado de van pode reduzir custos, aumentar a produtividade e melhorar a satisfação dos colaboradores da sua empresa.",date:"2024-11-15",category:"Fretamento Corporativo",readTime:"7 min",image:"https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&auto=format&fit=crop&q=80",content:`
<h2>Por que contratar van para funcionários?</h2>
<p>O transporte de funcionários é um dos maiores desafios logísticos das empresas modernas. Com o crescimento das cidades e o caos no trânsito das grandes metrópoles, oferecer um serviço de fretamento corporativo é mais do que um benefício — é um diferencial competitivo.</p>

<p>Empresas que investem em transporte coletivo para seus colaboradores observam uma série de vantagens concretas: <strong>redução do absenteísmo, maior pontualidade, aumento da produtividade</strong> e melhora significativa no clima organizacional.</p>

<h2>Vantagens do fretamento de van para empresas</h2>

<h3>1. Redução de custos operacionais</h3>
<p>Ao centralizar o transporte em uma única empresa especializada como a VaideVan, sua empresa elimina gastos com vale-transporte individualizado, reembolso de combustível e manutenção de frota própria. Um único contrato cobre dezenas de colaboradores com previsibilidade orçamentária total.</p>

<h3>2. Pontualidade garantida</h3>
<p>Com rotas planejadas e motoristas profissionais treinados, o fretamento de van garante que seus colaboradores cheguem no horário — sem depender de transporte público superlotado ou do trânsito imprevisível.</p>

<h3>3. Segurança e conforto</h3>
<p>As vans Mercedes-Benz Sprinter da VaideVan contam com ar-condicionado, cintos de segurança, rastreamento em tempo real e motoristas certificados. Seus colaboradores chegam ao trabalho descansados e prontos para produzir.</p>

<h3>4. Benefício valorizado pelos colaboradores</h3>
<p>Pesquisas indicam que o transporte fretado está entre os benefícios mais valorizados pelos trabalhadores brasileiros — à frente de planos de saúde e auxílio-alimentação em algumas faixas etárias. Oferecê-lo aumenta a retenção de talentos.</p>

<h2>Como funciona o processo de contratação?</h2>

<p>Contratar a VaideVan para o transporte de funcionários é simples e rápido:</p>

<ol>
<li><strong>Levantamento de necessidades:</strong> Nossa equipe analisa os pontos de coleta, horários e quantidade de colaboradores.</li>
<li><strong>Proposta personalizada:</strong> Desenvolvemos um plano de rotas otimizado e apresentamos uma proposta com valores transparentes.</li>
<li><strong>Assinatura do contrato:</strong> Contratos flexíveis, mensais ou anuais, com SLA de pontualidade garantido.</li>
<li><strong>Início das operações:</strong> Em até 48 horas após a assinatura, seu transporte corporativo já está rodando.</li>
</ol>

<h2>Qual o custo do fretamento corporativo?</h2>
<p>O valor depende do número de colaboradores, distância das rotas e frequência do serviço. Em geral, o fretamento corporativo custa menos do que o vale-transporte quando calculado por funcionário, especialmente em rotas de média e longa distância.</p>

<p>Entre em contato com a VaideVan pelo WhatsApp <strong>+55 11 99929-4694</strong> e solicite uma cotação gratuita. Nossa equipe responde em até 2 horas.</p>

<h2>Conclusão</h2>
<p>O transporte corporativo de van é um investimento com retorno mensurável. Reduza custos, melhore o bem-estar da sua equipe e elimine as preocupações com logística. A VaideVan tem mais de 20 anos de experiência em fretamento corporativo em São Paulo e em todo o Brasil.</p>
    `},{slug:"van-para-eventos-corporativos",title:"Van para Eventos Corporativos: Como Garantir o Transporte Perfeito",excerpt:"Planejando um evento empresarial? Saiba como organizar o transporte de convidados e colaboradores com eficiência, conforto e dentro do orçamento.",date:"2024-10-22",category:"Eventos",readTime:"6 min",image:"https://images.unsplash.com/photo-1540575467-a00d48a0eece?w=800&auto=format&fit=crop&q=80",content:`
<h2>A logística de transporte em eventos corporativos</h2>
<p>Um evento corporativo bem organizado pode ser prejudicado por uma falha de logística no transporte. Imagine convidados VIP chegando atrasados, equipes espalhadas em diferentes pontos da cidade ou colaboradores sem meio de retorno após um jantar de confraternização — essas situações são evitáveis com um serviço de transporte especializado.</p>

<p>A VaideVan atende eventos corporativos em toda a Grande São Paulo e Brasil, oferecendo frotas de vans Mercedes-Benz Sprinter com até 15 lugares, climatizadas e com motoristas treinados para atendimento executivo.</p>

<h2>Tipos de eventos atendidos pela VaideVan</h2>

<h3>Conferências e congressos</h3>
<p>Transporte de participantes entre hotéis, centros de convenção e aeroportos. Cronograma rígido, motoristas com lista de passageiros e comunicação direta com o organizador do evento.</p>

<h3>Jantares e confraternizações</h3>
<p>Serviço de ida e volta para colaboradores e convidados. Garantia de retorno seguro após eventos noturnos, eliminando riscos e responsabilidades da empresa.</p>

<h3>Feiras e exposições</h3>
<p>Transporte contínuo de equipes entre estações de metrô, parkings e pavilhões de eventos como o Expo Center Norte, Anhembi e São Paulo Expo.</p>

<h3>Lançamentos de produtos e ações de marketing</h3>
<p>Vans personalizadas com identidade visual da marca para transportar equipes, imprensa e influenciadores em ações de ativação.</p>

<h2>Por que a VaideVan é a escolha certa para eventos?</h2>

<ul>
<li><strong>Frota moderna:</strong> Vans Mercedes-Benz Sprinter com ar-condicionado e WiFi</li>
<li><strong>Motoristas profissionais:</strong> Treinados para atendimento executivo e etiqueta corporativa</li>
<li><strong>Rastreamento em tempo real:</strong> Você acompanha cada veículo pelo app</li>
<li><strong>Atendimento 24h:</strong> Para eventos diurnos ou noturnos</li>
<li><strong>Cobertura nacional:</strong> 12 estados e mais de 49 cidades</li>
</ul>

<h2>Como solicitar orçamento para eventos?</h2>
<p>Entre em contato pelo WhatsApp <strong>+55 11 99929-4694</strong> com as seguintes informações:</p>
<ul>
<li>Data e horário do evento</li>
<li>Local de partida e destino</li>
<li>Número de passageiros</li>
<li>Necessidade de retorno</li>
</ul>
<p>Respondemos em até 2 horas com proposta completa e valores transparentes.</p>
    `},{slug:"transfer-aeroporto-guarulhos-sao-paulo",title:"Transfer Aeroporto Guarulhos: Tudo que Você Precisa Saber",excerpt:"Transfer executivo de van para Guarulhos, Congonhas e Viracopos. Saiba como evitar filas, atrasos e imprevistos no seu próximo deslocamento aeroportuário.",date:"2024-09-10",category:"Traslado Aeroportuário",readTime:"5 min",image:"https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop&q=80",content:`
<h2>Transfer de van para aeroporto: uma necessidade em São Paulo</h2>
<p>São Paulo é o maior hub aeroportuário da América do Sul, com três aeroportos que movimentam milhões de passageiros por mês: <strong>Guarulhos (GRU), Congonhas (CGH) e Viracopos (VCP)</strong>. Chegar a tempo e com conforto nesses aeroportos é um desafio — principalmente para grupos, famílias ou viajantes corporativos com bagagem volumosa.</p>

<p>O transfer de van executiva da VaideVan é a solução mais prática, segura e econômica para grupos de 2 a 15 pessoas.</p>

<h2>Vantagens do transfer de van vs. outros meios de transporte</h2>

<h3>Van executiva x Táxi/Aplicativo</h3>
<p>Para grupos de 3 ou mais pessoas, a van sai mais barata por pessoa do que múltiplos táxis ou aplicativos. Além disso, todos chegam juntos, sem o risco de alguém se perder ou atrasar o grupo.</p>

<h3>Van executiva x Ônibus de linha</h3>
<p>O ônibus é mais barato, mas não garante pontualidade, não aceita muita bagagem e não oferece conforto para viajantes com necessidades especiais ou idosos. A van vai direto ao destino, sem paradas.</p>

<h3>Van executiva x Frota própria</h3>
<p>Dirigir até o aeroporto significa pagar estacionamento caro por vários dias. Com a van da VaideVan, você desembarca na porta do terminal e não se preocupa com mais nada.</p>

<h2>Como funciona o serviço de transfer da VaideVan?</h2>

<ol>
<li><strong>Agendamento:</strong> Agende com antecedência pelo WhatsApp, informando voo, terminal e número de passageiros.</li>
<li><strong>Confirmação:</strong> Receba a confirmação com nome do motorista e placa do veículo.</li>
<li><strong>Embarque:</strong> O motorista chega antes do horário combinado no endereço indicado.</li>
<li><strong>Chegada:</strong> Desembarque diretamente no terminal correto, com auxílio para a bagagem.</li>
</ol>

<h2>Aeroportos atendidos</h2>
<ul>
<li><strong>Guarulhos (GRU):</strong> Terminal 1, 2 e 3</li>
<li><strong>Congonhas (CGH):</strong> Terminal doméstico</li>
<li><strong>Viracopos (VCP):</strong> Campinas — para voos da Azul e outros operadores</li>
</ul>

<h2>Solicite seu transfer agora</h2>
<p>Entre em contato pelo WhatsApp <strong>+55 11 99929-4694</strong> e agende seu transfer com antecedência. Para grupos ou viagens recorrentes, temos planos mensais com valores especiais.</p>
    `},{slug:"vantagens-van-executiva-sao-paulo",title:"Van Executiva em São Paulo: 10 Vantagens que Você Não Conhecia",excerpt:"Conheça os benefícios do transporte executivo de van em São Paulo e entenda por que empresas e famílias estão trocando o carro particular pela van premium.",date:"2024-08-05",category:"Transporte Executivo",readTime:"8 min",image:"https://images.unsplash.com/photo-1571754742563-56d1b3ca9574?w=800&auto=format&fit=crop&q=80",content:`
<h2>O crescimento do mercado de van executiva em São Paulo</h2>
<p>O setor de transporte executivo de van cresceu mais de 18% nos últimos dois anos em São Paulo. Cada vez mais, empresas, famílias e grupos de amigos descobrem que a van executiva combina o conforto de um veículo premium com a praticidade e economia do transporte coletivo.</p>

<p>A VaideVan, com mais de 20 anos no mercado e a maior frota de vans Mercedes-Benz Sprinter do Brasil, listou os 10 principais motivos pelos quais você deveria considerar esse modal de transporte.</p>

<h2>10 vantagens da van executiva em SP</h2>

<h3>1. Capacidade para grupos</h3>
<p>As vans Sprinter comportam de 10 a 15 passageiros com conforto, sem a necessidade de múltiplos veículos — e sem a divisão de grupos que causam atrasos e desencontros.</p>

<h3>2. Custo por pessoa extremamente competitivo</h3>
<p>Dividindo o valor da van entre os passageiros, o custo por pessoa fica muito abaixo de um carro de aplicativo executivo, especialmente para trajetos acima de 20 km.</p>

<h3>3. Motorista profissional</h3>
<p>Todos os motoristas da VaideVan são habilitados na categoria D, com curso de direção defensiva, NR-20 e treinamento em atendimento ao cliente.</p>

<h3>4. Ar-condicionado e conforto</h3>
<p>As vans Sprinter possuem sistema de ar-condicionado eficiente, bancos acolchoados e amplo espaço interno — ideal para viagens longas ou horários de pico.</p>

<h3>5. Pontualidade monitorada</h3>
<p>Com rastreamento GPS em tempo real, você acompanha a localização do veículo e recebe alertas de chegada. Zero incerteza.</p>

<h3>6. Segurança superior</h3>
<p>Veículos com inspeção mensal, seguro contra terceiros e câmeras internas. A VaideVan tem um dos menores índices de ocorrência do setor.</p>

<h3>7. Atendimento 24 horas</h3>
<p>Voos madrugada, eventos noturnos ou emergências corporativas — a VaideVan opera 24 horas por dia, 7 dias por semana, em todo o Brasil.</p>

<h3>8. Cobertura nacional</h3>
<p>Com operações em 12 estados e mais de 49 cidades, a VaideVan é a única empresa de van executiva com presença nacional consolidada.</p>

<h3>9. Sustentabilidade</h3>
<p>Um único veículo substituindo 5 a 7 carros particulares significa menos emissões, menos trânsito e menor impacto ambiental. Sua empresa pode usar esse argumento em seu relatório de sustentabilidade.</p>

<h3>10. Experiência de 20+ anos</h3>
<p>Com marca registrada e duas décadas de operação ininterrupta, a VaideVan tem a expertise necessária para antecipar problemas e garantir um serviço impecável.</p>

<h2>Como contratar uma van executiva em SP?</h2>
<p>Entre em contato pelo WhatsApp <strong>+55 11 99929-4694</strong> ou acesse <strong>vaidevan.com</strong> para solicitar um orçamento personalizado.</p>
    `},{slug:"fretamento-van-empresa-como-escolher",title:"Como Escolher a Melhor Empresa de Fretamento de Van para sua Empresa",excerpt:"Antes de fechar contrato, saiba quais critérios avaliar na hora de contratar uma empresa de fretamento de van corporativo. Evite prejuízos e surpresas.",date:"2024-07-18",category:"Fretamento Corporativo",readTime:"6 min",image:"https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80",content:`
<h2>O mercado de fretamento corporativo no Brasil</h2>
<p>O Brasil conta com mais de 3.000 empresas registradas no setor de fretamento de veículos. A qualidade varia enormemente — de operadores informais com veículos sem manutenção a empresas consolidadas com frotas modernas e processos certificados.</p>

<p>Escolher o parceiro errado pode significar atrasos, veículos quebrados, motoristas sem qualificação e, no pior dos casos, acidentes. Veja os critérios fundamentais para fazer a escolha certa.</p>

<h2>7 critérios para escolher sua empresa de fretamento de van</h2>

<h3>1. Regularização e licenças</h3>
<p>Exija CNPJ ativo e contrato formal de locação. Atenção: empresas de <strong>locação de veículo com motorista</strong> (como a VaideVan) operam sob o Código Civil (Lei 10.406/02) e <em>não</em> se enquadram como transportadoras ou fretadoras — portanto não dependem de registro na ANTT, ARTESP ou EMTU, conforme jurisprudência consolidada do TJMG (Jurisp. Mineira, a. 55, n° 170, 2004). O que garante a legalidade é o CNPJ ativo, a inscrição municipal e o contrato formal de locação.</p>

<h3>2. Idade e conservação da frota</h3>
<p>Vans com mais de 5 anos podem apresentar problemas mecânicos frequentes. A VaideVan opera exclusivamente com Mercedes-Benz Sprinter com até 3 anos de uso.</p>

<h3>3. Qualificação dos motoristas</h3>
<p>Solicite comprovação de habilitação categoria D, curso de direção defensiva e exame toxicológico periódico.</p>

<h3>4. Seguro e cobertura</h3>
<p>Verifique se a empresa possui seguro de responsabilidade civil e seguro de passageiros.</p>

<h3>5. Tecnologia e rastreamento</h3>
<p>Empresas modernas oferecem rastreamento GPS em tempo real, relatórios de velocidade e histórico de rotas.</p>

<h3>6. SLA de atendimento e pontualidade</h3>
<p>O contrato deve prever penalidades para atrasos e canais de suporte 24h. Exija KPIs de pontualidade superiores a 98%.</p>

<h3>7. Experiência e reputação</h3>
<p>Empresas com mais de 10 anos de operação e carteira consolidada de clientes corporativos oferecem muito mais segurança.</p>

<h2>Por que a VaideVan atende todos esses critérios</h2>
<p>Com <strong>mais de 20 anos no mercado</strong>, marca registrada, frota exclusiva de Mercedes-Benz Sprinter e operações certificadas em 12 estados, a VaideVan é a escolha mais segura para o fretamento corporativo no Brasil.</p>

<p>Solicite uma proposta pelo WhatsApp <strong>+55 11 99929-4694</strong> e receba uma análise gratuita da sua necessidade de transporte.</p>
    `},{slug:"van-casamento-como-organizar-transporte-convidados",title:"Van para Casamento: Como Organizar o Transporte dos Convidados",excerpt:"O transporte de convidados é um dos detalhes que fazem a diferença em um casamento. Saiba como planejar e contratar a van certa para o grande dia.",date:"2024-06-03",category:"Eventos",readTime:"5 min",image:"https://images.unsplash.com/photo-1519741497674-4a18ccb0e5c6?w=800&auto=format&fit=crop&q=80",content:`
<h2>Transporte em casamentos: por que é tão importante?</h2>
<p>Em um casamento, cada detalhe conta. A decoração, o buffet, a música — tudo é cuidadosamente planejado. Mas o transporte dos convidados frequentemente é deixado para o último momento, gerando estresse, atrasos e uma experiência ruim.</p>

<p>Contratar uma van executiva para o casamento garante que seus convidados especiais cheguem com conforto e pontualidade, sem depender de Uber ou se preocupar com estacionamento.</p>

<h2>Quando faz sentido contratar van para casamento?</h2>

<ul>
<li>Casamentos em locais de difícil acesso (fazendas, sítios, praias)</li>
<li>Convidados idosos ou com mobilidade reduzida</li>
<li>Familiares vindos de outros estados ou cidades</li>
<li>Festas noturnas onde o consumo de bebidas está previsto</li>
<li>Traslado entre cerimônia e recepção em locais diferentes</li>
</ul>

<h2>Como planejar o transporte do casamento</h2>

<h3>Passo 1: Mapeie os convidados e pontos de coleta</h3>
<p>Identifique quais convidados precisam de transporte e onde moram. Agrupe por bairro ou zona para otimizar as rotas.</p>

<h3>Passo 2: Defina os horários</h3>
<p>Calcule o tempo de deslocamento com margem de segurança — especialmente para cerimônias religiosas com horário fixo.</p>

<h3>Passo 3: Planeje o retorno</h3>
<p>Garanta o retorno seguro dos convidados com vans programadas para o final da recepção.</p>

<h3>Passo 4: Solicite orçamento com antecedência</h3>
<p>Datas de casamento têm alta demanda. Solicite orçamento com pelo menos 60 dias de antecedência.</p>

<h2>Solicite seu orçamento</h2>
<p>A VaideVan atende casamentos em São Paulo, Grande SP e interior. Entre em contato pelo WhatsApp <strong>+55 11 99929-4694</strong>.</p>
    `},{slug:"excursao-van-roteiros-sao-paulo",title:"Excursão de Van: Os Melhores Roteiros a partir de São Paulo",excerpt:"Litoral, Serra da Mantiqueira, Campos do Jordão e muito mais. Descubra os roteiros de excursão mais populares e como organizar o transporte com conforto.",date:"2024-05-12",category:"Excursões",readTime:"7 min",image:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=80",content:`
<h2>Excursões de van saindo de São Paulo</h2>
<p>São Paulo é o melhor ponto de partida para excursões no interior e litoral do estado. Com mais de 150 roteiros turísticos a menos de 4 horas de distância, a van executiva é o meio de transporte mais prático para grupos.</p>

<h2>Roteiros mais populares</h2>

<h3>Litoral Sul — Riviera de São Lourenço e Guarujá</h3>
<p><strong>Distância:</strong> 80 km | <strong>Tempo estimado:</strong> 1h30 a 2h</p>
<p>O roteiro mais procurado aos finais de semana. A van parte de São Paulo e vai direto à praia, sem as complicações de estacionamento no litoral.</p>

<h3>Campos do Jordão — Serra da Mantiqueira</h3>
<p><strong>Distância:</strong> 170 km | <strong>Tempo estimado:</strong> 2h30 a 3h</p>
<p>A "Suíça brasileira" recebe visitantes o ano todo, especialmente no inverno. Passeios pela Avenida Macedo Soares, chocolaterias, fondue e muito mais.</p>

<h3>Brotas — Turismo de aventura</h3>
<p><strong>Distância:</strong> 240 km | <strong>Tempo estimado:</strong> 3h</p>
<p>Capital do ecoturismo de aventura no Brasil. Rapel, canoagem, tirolesa e cachoeiras.</p>

<h3>Aparecida — Basílica de Nossa Senhora</h3>
<p><strong>Distância:</strong> 170 km | <strong>Tempo estimado:</strong> 2h</p>
<p>Roteiro de fé muito procurado por grupos de igrejas, pastorais e famílias.</p>

<h3>Holambra — Cidade das Flores</h3>
<p><strong>Distância:</strong> 130 km | <strong>Tempo estimado:</strong> 2h</p>
<p>Especialmente durante o ExpoFlora, Holambra recebe milhares de visitantes.</p>

<h2>Como contratar excursão de van pela VaideVan</h2>
<p>Entre em contato pelo WhatsApp <strong>+55 11 99929-4694</strong> com o roteiro desejado, data e número de passageiros.</p>
    `},{slug:"transporte-corporativo-reducao-custos",title:"Transporte Corporativo: Como Reduzir Custos sem Abrir Mão da Qualidade",excerpt:"Gestores de RH e facilities apontam o transporte como um dos maiores custos operacionais. Veja estratégias comprovadas para reduzir gastos sem sacrificar a experiência.",date:"2024-04-07",category:"Fretamento Corporativo",readTime:"8 min",image:"https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80",content:`
<h2>O peso do transporte no orçamento corporativo</h2>
<p>Para empresas com mais de 100 colaboradores no Brasil, os gastos com transporte representam entre 8% e 15% do total de benefícios oferecidos. Em algumas indústrias, como manufatura e logística, esse percentual chega a 20%.</p>

<p>A boa notícia é que existem estratégias comprovadas para reduzir esses custos em até 30% sem reduzir a qualidade do serviço.</p>

<h2>Estratégias para redução de custos no transporte corporativo</h2>

<h3>1. Migração do vale-transporte para fretamento coletivo</h3>
<p>O vale-transporte individual é um dos benefícios mais caros e de menor controle para o RH. A migração para fretamento coletivo de van pode reduzir o custo por colaborador em 20% a 40%.</p>

<h3>2. Otimização de rotas</h3>
<p>Muitas empresas perdem dinheiro com rotas mal planejadas. Um mapeamento profissional pode reduzir o número de veículos necessários em 15% a 25%.</p>

<h3>3. Negociação de contratos anuais</h3>
<p>Contratos mensais custam de 10% a 20% mais do que contratos anuais. Se sua demanda é estável, opte por contratos de maior prazo.</p>

<h3>4. Flexibilização de horários</h3>
<p>Empresas que adotam horários flexíveis conseguem concentrar mais colaboradores nos mesmos veículos, reduzindo o custo total.</p>

<h3>5. Substituição de frota própria por terceirização</h3>
<p>Manter frota própria exige IPVA, seguro, manutenção e gestão — custos que frequentemente excedem o valor do fretamento terceirizado.</p>

<h2>Solicite uma análise gratuita de custos</h2>
<p>A VaideVan oferece uma análise gratuita da sua atual estrutura de transporte. Entre em contato pelo WhatsApp <strong>+55 11 99929-4694</strong>.</p>
    `},{slug:"transfer-executivo-vip-sao-paulo",title:"Transfer Executivo VIP em São Paulo: Quando o Padrão Faz a Diferença",excerpt:"Receber um cliente internacional, um CEO ou um parceiro estratégico exige um nível de serviço diferenciado. Saiba o que distingue o transfer VIP do transporte convencional.",date:"2024-03-20",category:"Transporte Executivo",readTime:"6 min",image:"https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80",content:`
<h2>O que é transfer executivo VIP?</h2>
<p>O transfer VIP vai muito além de um simples deslocamento de ponto A ao ponto B. Trata-se de uma experiência completa que começa no momento do contato — com atendimento personalizado, confirmações em tempo real e motoristas que entendem de etiqueta e discrição.</p>

<p>Na VaideVan, o serviço VIP inclui veículo exclusivo, motorista uniformizado, tablet para uso do passageiro, água mineral e total flexibilidade de horário. Cada detalhe é pensado para quem não pode se dar ao luxo de improvisar.</p>

<h2>Quando contratar transfer VIP</h2>

<h3>Recepção de executivos estrangeiros</h3>
<p>A primeira impressão começa no aeroporto. Um transfer VIP bem executado transmite profissionalismo, organização e respeito — valores que seu cliente ou parceiro levará para a mesa de negociações.</p>

<h3>Presidentes e diretores em viagem de negócios</h3>
<p>C-level executivos têm agendas apertadas e zero tolerância para atrasos. O transfer VIP garante pontualidade absoluta com motoristas que conhecem as rotas alternativas de São Paulo.</p>

<h3>Delegações governamentais e diplomáticas</h3>
<p>Visitas de autoridades exigem protocolos específicos, coordenação com seguranças e total discrição. A VaideVan tem experiência nesse segmento e atende com o sigilo necessário.</p>

<h3>Eventos de premiação e galas</h3>
<p>Chegar a um evento de gala em uma van executiva impecável, com motorista que abre a porta e aguarda o retorno, é um padrão que só o transfer VIP oferece.</p>

<h2>O que está incluso no transfer VIP da VaideVan</h2>
<ul>
<li>Mercedes-Benz Sprinter executive ou Vito de última geração</li>
<li>Motorista uniformizado, bilíngue (português/inglês) e certificado</li>
<li>Placa de identificação no aeroporto</li>
<li>Monitoramento de voo para ajuste automático de horário</li>
<li>Água, amenidades e carregador USB a bordo</li>
<li>Relatório de viagem para o departamento financeiro</li>
</ul>

<h2>Solicite seu transfer VIP</h2>
<p>Entre em contato pelo WhatsApp <strong>+55 11 99929-4694</strong> com 24h de antecedência e receba uma proposta personalizada.</p>
    `},{slug:"van-para-condominio-fretamento-residencial",title:"Van para Condomínio: Como o Fretamento Residencial Está Mudando a Rotina de Moradores",excerpt:"Condomínios fechados e loteamentos estão adotando vans coletivas para deslocamentos diários. Entenda como funciona e quais são os benefícios para síndicos e moradores.",date:"2024-03-05",category:"Fretamento Corporativo",readTime:"5 min",image:"https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&auto=format&fit=crop&q=80",content:`
<h2>O fretamento residencial como solução urbana</h2>
<p>Com o crescimento dos condomínios fechados na periferia das grandes cidades, especialmente em São Paulo, surgiu uma demanda específica: moradores que precisam se deslocar diariamente ao trabalho, à escola ou ao centro da cidade, mas que vivem em locais com transporte público precário.</p>

<p>O fretamento residencial de van — também chamado de van de condomínio — é a resposta a esse problema. Um único veículo cobre as necessidades de dezenas de moradores, reduzindo o número de carros nas ruas e o custo individual de cada família.</p>

<h2>Como funciona o fretamento para condomínios</h2>

<h3>Levantamento de demanda</h3>
<p>A VaideVan realiza uma pesquisa com os moradores para identificar destinos, horários e frequência de uso. Com base nesses dados, traçamos as rotas mais eficientes.</p>

<h3>Proposta coletiva</h3>
<p>O custo é dividido entre os participantes, tornando o serviço muito mais acessível do que qualquer alternativa individual. Em geral, o custo mensal por morador é inferior ao de um tanque de gasolina.</p>

<h3>Operação flexível</h3>
<p>O serviço pode cobrir destinos como estações de metrô/trem, centros comerciais, universidades, aeroportos e hubs de trabalho compartilhado.</p>

<h2>Vantagens para o condomínio</h2>
<ul>
<li>Valorização do empreendimento como diferencial</li>
<li>Redução do movimento de carros nas portarias</li>
<li>Benefício concreto para moradores — especialmente idosos e jovens sem habilitação</li>
<li>Controle e rastreamento em tempo real pelo síndico</li>
</ul>

<h2>Solicite uma visita técnica gratuita</h2>
<p>A equipe da VaideVan visita o condomínio, analisa as rotas e apresenta uma proposta personalizada. Entre em contato pelo WhatsApp <strong>+55 11 99929-4694</strong>.</p>
    `},{slug:"van-para-shows-e-eventos-culturais",title:"Van para Shows e Eventos Culturais: Vá com Conforto, Volte com Segurança",excerpt:"Shows, festivais, peças de teatro e exposições. Saiba como organizar o transporte em grupo para eventos culturais em São Paulo e evitar o estresse do trânsito e do estacionamento.",date:"2024-02-18",category:"Eventos",readTime:"4 min",image:"https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop&q=80",content:`
<h2>Ir ao show sem estresse: é possível</h2>
<p>Quem já tentou chegar ao Allianz Parque, ao Espaço das Américas ou ao Autódromo de Interlagos nos dias de grande evento sabe bem do que estamos falando. Trânsito caótico, estacionamento inexistente e preços abusivos. A solução é simples: ir em van.</p>

<p>A VaideVan oferece transporte para grupos em eventos culturais e de entretenimento em toda São Paulo. Você e seus amigos vão juntos, chegam juntos e voltam juntos — sem estresse e sem depender de aplicativos lotados no fim do show.</p>

<h2>Para quem é o serviço</h2>

<h3>Grupos de amigos</h3>
<p>A van é a solução perfeita para grupos de 8 a 15 pessoas que querem ir ao mesmo evento. Divide-se o custo e todo mundo vai e volta junto, sem preocupação com o motorista designado que não pode beber.</p>

<h3>Empresas em eventos de incentivo</h3>
<p>Muitas empresas levam equipes a shows e festivais como forma de reconhecimento. A van corporativa é a escolha mais adequada para esse tipo de ação.</p>

<h3>Grupos de excursão cultural</h3>
<p>Escolas, associações e grupos de terceira idade que visitam museus, teatros e exposições contam com a VaideVan para o transporte organizado.</p>

<h2>Principais locais atendidos em São Paulo</h2>
<ul>
<li>Allianz Parque</li>
<li>Espaço das Américas</li>
<li>Vibra São Paulo (antigo Citibank Hall)</li>
<li>Autódromo de Interlagos</li>
<li>Tokio Marine Hall</li>
<li>MASP, Pinacoteca e museus da Avenida Paulista</li>
<li>Teatro Municipal e Teatro Alfa</li>
</ul>

<h2>Agende agora</h2>
<p>Informe a data, o local e o número de pessoas pelo WhatsApp <strong>+55 11 99929-4694</strong> e receba a cotação em minutos.</p>
    `},{slug:"transporte-universitario-van-faculdade",title:"Transporte Universitário de Van: A Solução para Chegar na Faculdade Sem Perrengue",excerpt:"Fretamento de van para universidades e faculdades em São Paulo. Saiba como grupos de estudantes estão economizando tempo e dinheiro com o transporte coletivo.",date:"2024-02-01",category:"Excursões",readTime:"5 min",image:"https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80",content:`
<h2>O desafio do transporte universitário em SP</h2>
<p>São Paulo concentra as maiores universidades do país — USP, UNICAMP (Campinas), FGV, Insper, Mackenzie, PUC-SP e dezenas de outras — em locais nem sempre bem servidos pelo transporte público. Para estudantes que moram em bairros distantes, a rotina de ir à faculdade pode consumir 3 a 4 horas por dia em deslocamentos.</p>

<p>A van universitária é uma alternativa que combina custo acessível, pontualidade e conforto — permitindo que os estudantes aproveitem o trajeto para estudar, descansar ou socializar.</p>

<h2>Como funciona o fretamento universitário</h2>

<h3>Formação do grupo</h3>
<p>Estudantes da mesma faculdade e de bairros próximos se unem para contratar uma van. Com 8 a 12 alunos, o custo individual fica comparable ao passe de transporte público — com muito mais conforto.</p>

<h3>Rota e horário fixos</h3>
<p>A van segue um ponto de encontro, horário e rota fixos — saindo e voltando sempre nos mesmos horários de acordo com a grade de aulas.</p>

<h3>Flexibilidade em provas e eventos</h3>
<p>Em períodos de prova, a VaideVan oferece horários extras para atender às necessidades específicas de cada turma.</p>

<h2>Universidades e faculdades atendidas</h2>
<ul>
<li>USP — Campus Butantã, Leste e Piracicaba</li>
<li>UNICAMP — Campinas</li>
<li>FGV e Insper — Itaim Bibi e Pinheiros</li>
<li>Mackenzie e PUC-SP — Centro e Perdizes</li>
<li>FMUSP e outras faculdades de medicina</li>
<li>Faculdades FIAP, SENAC, SENAI e técnicas</li>
</ul>

<h2>Monte seu grupo e economize</h2>
<p>Entre em contato pelo WhatsApp <strong>+55 11 99929-4694</strong> e veja como montar um fretamento universitário para sua faculdade.</p>
    `},{slug:"van-para-viagem-litoral-sao-paulo",title:"Van para o Litoral de São Paulo: Guia Completo para Grupos",excerpt:"Santos, Guarujá, Ubatuba, Ilhabela e Maresias. Tudo que você precisa saber para organizar uma viagem de van ao litoral paulista com conforto e segurança.",date:"2024-01-22",category:"Excursões",readTime:"6 min",image:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",content:`
<h2>Litoral paulista: o destino favorito dos paulistanos</h2>
<p>Com mais de 600 km de costa e praias para todos os gostos, o litoral de São Paulo é o destino mais procurado pelos paulistanos nos finais de semana e feriados. O problema? A Via Anchieta e a Rodovia dos Imigrantes ficam completamente travadas nesses períodos.</p>

<p>A solução é viajar de van. Enquanto os motoristas de carro ficam presos no congestionamento, os passageiros da VaideVan chegam descansados, sem gastar com gasolina e sem o estresse de dirigir no trânsito intenso do litoral.</p>

<h2>Principais destinos do litoral paulista</h2>

<h3>Santos e Guarujá — Baixada Santista</h3>
<p><strong>Distância de SP:</strong> 70-90 km | <strong>Tempo:</strong> 1h30 a 3h (com trânsito)</p>
<p>A mais clássica praia dos paulistanos. Orla de Santos, Gonzaga, Pitangueiras e as praias exclusivas do Guarujá.</p>

<h3>Maresias e São Sebastião — Litoral Norte</h3>
<p><strong>Distância de SP:</strong> 180 km | <strong>Tempo:</strong> 2h30 a 4h</p>
<p>As melhores ondas do estado e praias de águas mais cristalinas. Ponto de encontro de surfistas e famílias que buscam praias mais tranquilas.</p>

<h3>Ubatuba</h3>
<p><strong>Distância de SP:</strong> 230 km | <strong>Tempo:</strong> 3h a 5h</p>
<p>102 praias, Mata Atlântica preservada e a vila de Paraty próxima. Destino ideal para quem quer natureza e tranquilidade.</p>

<h3>Ilhabela</h3>
<p><strong>Distância de SP:</strong> 210 km | <strong>Tempo:</strong> 3h + balsa</p>
<p>A ilha mais procurada do litoral norte. Cachoeiras, praias desertas e um charme único.</p>

<h2>Dicas para viajar de van ao litoral</h2>
<ul>
<li>Reserve com antecedência nos feriados (demanda dobra)</li>
<li>Combine horário de saída para evitar pico do trânsito</li>
<li>Leve protetor solar e snacks na bagagem de bordo</li>
<li>Combine o horário de retorno com o motorista</li>
</ul>

<h2>Solicite seu orçamento</h2>
<p>Informe o destino, a data, o número de passageiros e o ponto de partida pelo WhatsApp <strong>+55 11 99929-4694</strong>. Respondemos em minutos.</p>
    `},{slug:"transporte-equipes-esportivas-van",title:"Transporte de Equipes Esportivas: Como a Van Profissional Faz Diferença no Rendimento",excerpt:"Clubes de futebol, vôlei, natação e corrida de rua estão usando vans para transporte de atletas. Veja como essa escolha impacta diretamente no desempenho e na logística.",date:"2023-12-14",category:"Eventos",readTime:"5 min",image:"https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80",content:`
<h2>Por que o transporte impacta o desempenho esportivo</h2>
<p>Atletas que chegam ao local de treino ou competição estressados, cansados de trânsito ou atrasados rendem menos. O transporte é parte da preparação — e equipes que tratam essa questão com profissionalismo colhem resultados superiores.</p>

<p>A VaideVan atende clubes esportivos, academias, times amadores e federações com serviços de van dedicada para transporte de atletas e equipes técnicas.</p>

<h2>Modalidades atendidas</h2>

<h3>Futebol, futsal e society</h3>
<p>Transporte de elenco e comissão técnica para treinos, jogos e torneios em toda a Grande São Paulo e interior do estado.</p>

<h3>Vôlei, basquete e handebol</h3>
<p>Modalidades de quadra com calendários intensos de competição. A van garante que todo o elenco chegue junto, no horário e em condições de jogar.</p>

<h3>Corridas de rua e triatlo</h3>
<p>Transporte de grupos de corredores até o local de largada nas madrugadas, com bagageiro para carregar equipamentos, bikes e material de hidratação.</p>

<h3>Natação e esportes aquáticos</h3>
<p>Rotas entre clubes e piscinas olímpicas, com espaço para equipamentos e troca de indumentária a bordo.</p>

<h2>Serviços adicionais para equipes</h2>
<ul>
<li>Van exclusiva para a comissão técnica</li>
<li>Transporte de materiais e equipamentos</li>
<li>Cobertura para torneios em outras cidades e estados</li>
<li>Contratos mensais com desconto para clubes</li>
</ul>

<h2>Fale com nossa equipe</h2>
<p>A VaideVan tem contratos com clubes em toda a Grande São Paulo. Entre em contato pelo WhatsApp <strong>+55 11 99929-4694</strong> e solicite uma proposta específica para sua modalidade.</p>
    `},{slug:"fretamento-van-igrejas-grupos-religiosos",title:"Fretamento de Van para Igrejas e Grupos Religiosos: Organização e Segurança na Fé",excerpt:"Retiros, romarias, congressos e peregrinações. Saiba como igrejas e comunidades religiosas estão organizando o transporte de seus grupos com a VaideVan.",date:"2023-11-28",category:"Excursões",readTime:"5 min",image:"https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80",content:`
<h2>Transporte para comunidades religiosas</h2>
<p>Peregrinações a Aparecida, retiros espirituais na Serra da Mantiqueira, congressos de jovens e caravanas para eventos religiosos — a logística de transporte é sempre um desafio para pastores, padres e líderes de comunidades.</p>

<p>A VaideVan atende igrejas evangélicas, católicas, espíritas e demais comunidades religiosas com um serviço respeitoso, pontual e seguro, tanto para destinos próximos quanto para viagens interestaduais.</p>

<h2>Principais roteiros religiosos atendidos</h2>

<h3>Basílica de Aparecida — Nossa Senhora</h3>
<p>O santuário mais visitado do Brasil, em Aparecida-SP. A VaideVan realiza caravanas regulares para grupos de igrejas e pastorais, com saída e retorno no mesmo dia ou com pernoite.</p>

<h3>Santuário Nacional de Fátima — Trindade (GO)</h3>
<p>Para grupos que desejam ir até Goiás, a VaideVan oferece vans com motoristas revezados para viagens longas com máximo conforto e segurança.</p>

<h3>Retiros espirituais na Serra</h3>
<p>Sítios e casas de retiro na Serra da Mantiqueira, Vale do Paraíba e arredores de São Paulo. Serviço com horários flexíveis e adaptado ao cronograma do retiro.</p>

<h3>Congressos e eventos de denominações</h3>
<p>Convenções, congressos de jovens, encontros de casais e festivais gospel. A van é a solução para levar grupos inteiros ao mesmo local com organização e economia.</p>

<h2>Por que confiar na VaideVan</h2>
<ul>
<li>Motoristas selecionados com postura respeitosa e discreta</li>
<li>Veículos espaçosos para acomodar todos com conforto</li>
<li>Bagageiro amplo para malas e instrumentos musicais</li>
<li>Atendimento personalizado para líderes religiosos</li>
</ul>

<h2>Solicite uma cotação</h2>
<p>Entre em contato pelo WhatsApp <strong>+55 11 99929-4694</strong> com o destino, data e número de participantes.</p>
    `},{slug:"transporte-obras-construcao-civil",title:"Transporte para Obras e Construção Civil: Logística de Mão de Obra com Eficiência",excerpt:"Construtoras, empreiteiras e incorporadoras que precisam deslocar equipes para canteiros de obra encontram na VaideVan a parceira ideal. Veja como funciona.",date:"2023-11-05",category:"Fretamento Corporativo",readTime:"6 min",image:"https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80",content:`
<h2>O desafio logístico do canteiro de obras</h2>
<p>Obras de grande porte exigem o deslocamento diário de dezenas — às vezes centenas — de trabalhadores para locais muitas vezes de difícil acesso, sem transporte público ou com linhas insuficientes. A ausência de um serviço de transporte confiável gera atrasos, faltas e retrabalho.</p>

<p>A VaideVan atende construtoras, empreiteiras, incorporadoras e prestadoras de serviço em obras de todos os portes, com frotas de vans Mercedes-Benz Sprinter para o transporte seguro e pontual da mão de obra.</p>

<h2>Soluções de transporte para construção civil</h2>

<h3>Transporte diário de operários</h3>
<p>Rotas fixas com coleta em pontos estratégicos — terminais de metrô, pontos de ônibus, bairros de concentração de trabalhadores — e entrega diretamente no canteiro de obras.</p>

<h3>Transporte de engenheiros e supervisores</h3>
<p>Van executiva para equipes técnicas com padrão diferenciado de conforto, pontualidade e apresentação.</p>

<h3>Visitas de diretores e clientes</h3>
<p>Transfer especial para visitas de diretoria, imprensa, investidores e clientes ao canteiro de obras. Impressione com um serviço de alto nível desde a chegada.</p>

<h3>Obras em regiões sem transporte público</h3>
<p>Obras em condomínios, loteamentos e indústrias em áreas periféricas ou rurais, onde a van é o único meio de transporte viável para a equipe.</p>

<h2>Benefícios comprovados para construtoras</h2>
<ul>
<li>Redução do absenteísmo em até 40%</li>
<li>Eliminação de atrasos por falha de transporte público</li>
<li>Conformidade com normas de segurança (NR-18)</li>
<li>Contratos mensais com faturamento para CNPJ</li>
<li>Relatórios de quilometragem para auditoria de projetos</li>
</ul>

<h2>Fale com nossa equipe comercial</h2>
<p>A VaideVan atende obras em toda a Grande São Paulo e interior. Entre em contato pelo WhatsApp <strong>+55 11 99929-4694</strong> e solicite uma proposta específica para seu canteiro.</p>
    `},{slug:"van-para-aniversarios-festas-particulares",title:"Van para Aniversários e Festas Particulares: Celebre sem se Preocupar com o Transporte",excerpt:"Aniversários de 15 anos, bodas, formaturas e festas de família. Descubra como a van particular transforma a logística de convidados em uma experiência especial.",date:"2023-10-17",category:"Eventos",readTime:"4 min",image:"https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop&q=80",content:`
<h2>O problema do transporte em festas particulares</h2>
<p>Organizar uma grande festa exige atenção a mil detalhes. O transporte dos convidados frequentemente fica em segundo plano — e se torna um problema real no dia do evento: convidados que não conhecem o local, idosos sem como ir e voltar, ou jovens que precisam de alguém que não beba para dirigir.</p>

<p>A van de festa da VaideVan resolve tudo isso de forma elegante, segura e surpreendentemente acessível.</p>

<h2>Para quais celebrações a van faz sentido</h2>

<h3>Festas de 15 anos e debutantes</h3>
<p>A van garante que a família e os convidados de honra cheguem com estilo ao salão, sem preocupação com estacionamento ou aplicativos.</p>

<h3>Formaturas e colação de grau</h3>
<p>Turmas de formandos costumam contratar vans para levar família e amigos às cerimônias e à festa posterior, que geralmente acontecem em locais diferentes.</p>

<h3>Bodas e aniversários de casamento</h3>
<p>Para famílias espalhadas pela cidade que precisam de transporte especial para a comemoração.</p>

<h3>Confraternizações de família</h3>
<p>Reuniões em chácara, sítio ou clube fora da cidade, onde o transporte coletivo não chega e cada carro representa um custo adicional de combustível e estacionamento.</p>

<h2>Diferenciais da VaideVan para festas</h2>
<ul>
<li>Van limpa e apresentável, como parte da celebração</li>
<li>Motorista pontual e discreto</li>
<li>Serviço de retorno programado para o final da festa</li>
<li>Atendimento personalizado para o organizador do evento</li>
</ul>

<h2>Faça um orçamento rápido</h2>
<p>Informe a data, o local e o número de convidados pelo WhatsApp <strong>+55 11 99929-4694</strong>. Respondemos com um orçamento detalhado em até 2 horas.</p>
    `},{slug:"como-funciona-rastreamento-van-executiva",title:"Como Funciona o Rastreamento de Van Executiva em Tempo Real",excerpt:"Entenda a tecnologia por trás do rastreamento GPS das vans da VaideVan e como esse recurso garante segurança, pontualidade e tranquilidade para empresas e passageiros.",date:"2023-09-30",category:"Transporte Executivo",readTime:"5 min",image:"https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",content:`
<h2>Tecnologia a serviço da segurança</h2>
<p>O rastreamento GPS em tempo real é um dos pilares da operação da VaideVan. Cada veículo da frota está equipado com dispositivo de rastreamento satelital de última geração, integrado a uma central de monitoramento que opera 24 horas por dia.</p>

<p>Para empresas que contratam o serviço, essa tecnologia traz previsibilidade e controle total sobre o deslocamento dos colaboradores. Para os passageiros, significa segurança e a certeza de que estão em um veículo monitorado.</p>

<h2>O que o rastreamento permite fazer</h2>

<h3>Localização em tempo real</h3>
<p>Gestores de RH e facilities podem ver exatamente onde está cada van a qualquer momento, diretamente pelo painel de gestão da VaideVan.</p>

<h3>Histórico de rotas e velocidade</h3>
<p>Todos os percursos são gravados. Em caso de incidente ou reclamação, o histórico completo de velocidade, paradas e rotas está disponível.</p>

<h3>Alertas de velocidade e frenagem brusca</h3>
<p>O sistema envia alertas automáticos caso o motorista exceda a velocidade definida ou realize manobras bruscas, permitindo intervenção imediata.</p>

<h3>Estimativa de chegada</h3>
<p>Com base na localização em tempo real e nas condições de trânsito, o sistema calcula e comunica o horário estimado de chegada — para o passageiro e para o cliente.</p>

<h2>Segurança para passageiros e gestores</h2>
<p>Em casos de emergência — acidente, pane mecânica ou qualquer ocorrência —, a central da VaideVan é acionada automaticamente e coordena o atendimento. Nenhum passageiro fica sem suporte.</p>

<h2>Acesse o rastreamento da sua frota</h2>
<p>Clientes corporativos da VaideVan têm acesso a um painel de controle exclusivo. Entre em contato pelo WhatsApp <strong>+55 11 99929-4694</strong> para uma demonstração gratuita.</p>
    `},{slug:"mercedes-benz-sprinter-por-que-e-a-melhor-van",title:"Mercedes-Benz Sprinter: Por Que é a Melhor Van para Transporte Executivo",excerpt:"A VaideVan opera exclusivamente com Mercedes-Benz Sprinter. Descubra os motivos técnicos e práticos que fazem essa van ser a preferida do mercado executivo brasileiro.",date:"2023-09-10",category:"Transporte Executivo",readTime:"6 min",image:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80",content:`
<h2>Por que a Sprinter domina o mercado executivo</h2>
<p>A Mercedes-Benz Sprinter não é apenas a van mais vendida do Brasil no segmento executivo — é o padrão de referência do setor. Com mais de 30 anos de presença no mercado brasileiro, a Sprinter acumula um histórico de confiabilidade, desempenho e conforto incomparável.</p>

<p>A VaideVan tomou a decisão estratégica de operar exclusivamente com Mercedes-Benz Sprinter. Essa escolha garante padronização da frota, manutenção preventiva mais eficiente e uma experiência consistente para todos os passageiros.</p>

<h2>Vantagens técnicas da Mercedes-Benz Sprinter</h2>

<h3>Motor diesel de alta eficiência</h3>
<p>O motor BlueTEC da Sprinter combina potência e eficiência de combustível, consumindo em média 12 a 15 km/litro mesmo carregada. Isso se traduz em menor custo operacional e, consequentemente, preços mais competitivos para os clientes.</p>

<h3>Suspensão para viagens longas</h3>
<p>O sistema de suspensão traseira de lâminas progressivas e dianteira independente absorve irregularidades do asfalto brasileiro com eficiência superior à dos concorrentes. Resultado: menos cansaço nos passageiros em trajetos longos.</p>

<h3>Capacidade de carga e bagageiro</h3>
<p>Com volume de carga superior a 9 m³ e capacidade para até 15 passageiros, a Sprinter é a única van que combina alta capacidade de passageiros com espaço generoso para bagagem.</p>

<h3>Sistema de ar-condicionado independente</h3>
<p>O sistema de climatização da Sprinter executive mantém a temperatura interna constante independentemente das condições externas — fundamental para o conforto em viagens longas ou no trânsito paulistano.</p>

<h2>Configurações disponíveis na VaideVan</h2>
<ul>
<li><strong>Sprinter Executive — 15 lugares:</strong> Para grupos grandes e fretamento corporativo</li>
<li><strong>Sprinter Executive Plus — 10 lugares:</strong> Para transfer VIP e eventos executivos</li>
<li><strong>Sprinter Executive Cargo:</strong> Para transporte de carga corporativa com motorista</li>
</ul>

<h2>Viaje no melhor</h2>
<p>Entre em contato pelo WhatsApp <strong>+55 11 99929-4694</strong> e experimente o padrão VaideVan de transporte executivo.</p>
    `},{slug:"mobilidade-corporativa-sustentavel-van",title:"Mobilidade Corporativa Sustentável: Como a Van Coletiva Reduz a Pegada de Carbono da Empresa",excerpt:"Empresas com metas de ESG e sustentabilidade encontram no fretamento coletivo de van uma solução real para reduzir emissões. Veja os números e como incluir isso no seu relatório.",date:"2023-08-22",category:"Fretamento Corporativo",readTime:"7 min",image:"https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80",content:`
<h2>ESG e o impacto do transporte corporativo</h2>
<p>A agenda ESG (Environmental, Social and Governance) passou de diferencial a exigência para empresas que querem se manter competitivas no mercado global. E o transporte corporativo é um dos pontos onde as empresas têm mais espaço para agir — e mais dificuldade de medir o impacto.</p>

<p>Um estudo conduzido pela ANTT mostrou que um veículo de transporte coletivo com 15 passageiros emite, por pessoa transportada, até 12 vezes menos CO₂ do que o mesmo trajeto feito com 15 carros individuais. A matemática é simples — e poderosa.</p>

<h2>Como calcular a redução de emissões do fretamento</h2>

<h3>Base de cálculo</h3>
<p>Um carro a gasolina emite em média 170g de CO₂ por km percorrido. Uma van Mercedes-Benz Sprinter Diesel emite 290g/km — mas transportando até 15 pessoas, isso representa apenas 19g de CO₂ por passageiro por km.</p>

<h3>Exemplo prático</h3>
<p>Empresa com 30 colaboradores que percorrem 25 km por dia:</p>
<ul>
<li><strong>Carros individuais:</strong> 30 × 25 km × 170g = 127,5 kg de CO₂ por dia</li>
<li><strong>2 vans Sprinter:</strong> 2 × 25 km × 290g = 14,5 kg de CO₂ por dia</li>
<li><strong>Redução:</strong> 88,6% menos emissões</li>
</ul>

<h2>Como incluir no relatório de sustentabilidade</h2>

<h3>Protocolo GHG (Greenhouse Gas)</h3>
<p>O fretamento coletivo de van pode ser contabilizado no Escopo 3 do Protocolo GHG como redução de emissões em deslocamento de funcionários (Category 7: Employee Commuting).</p>

<h3>Documentação da VaideVan</h3>
<p>A VaideVan fornece relatórios mensais detalhados com quilometragem, número de passageiros e estimativa de emissões, compatíveis com as principais metodologias de inventário de carbono.</p>

<h2>Impacto social além do ambiental</h2>
<ul>
<li>Redução de veículos no trânsito (impacto na qualidade do ar urbano)</li>
<li>Menos stress para os colaboradores (impacto na saúde mental — "S" do ESG)</li>
<li>Inclusão de colaboradores sem carro ou habilitação — diversidade e mobilidade social</li>
</ul>

<h2>Comece sua jornada de mobilidade sustentável</h2>
<p>Entre em contato pelo WhatsApp <strong>+55 11 99929-4694</strong> e receba uma análise gratuita do impacto ambiental atual do seu transporte corporativo e como o fretamento coletivo pode melhorar seu relatório ESG.</p>
    `},{slug:"roteiro-campos-do-jordao-van-grupo",title:"Roteiro Completo para Campos do Jordão de Van: Dicas, Atrações e Como Organizar o Grupo",excerpt:"Campos do Jordão é o destino de inverno mais famoso de São Paulo. Veja como planejar a viagem em grupo com van, os melhores pontos turísticos e o que não pode faltar.",date:"2023-07-30",category:"Excursões",readTime:"7 min",image:"https://images.unsplash.com/photo-1476900164809-ff19b8ae5968?w=800&auto=format&fit=crop&q=80",content:`
<h2>Campos do Jordão: a "Suíça brasileira"</h2>
<p>A 170 km de São Paulo, Campos do Jordão é a estância turística mais visitada do estado e um dos destinos de inverno mais famosos do Brasil. Com temperatura que pode chegar a 0°C em julho, a cidade encanta por sua arquitetura tirolesa, restaurantes sofisticados, chocolaterias artesanais e o famoso Festival de Inverno.</p>

<p>A melhor forma de chegar? De van. A estrada até Campos (Rodovia Floriano Rodrigues Pinheiro) tem trechos de serra com curvas pronunciadas e muita neblina no inverno — condições que exigem motorista experiente.</p>

<h2>O que fazer em Campos do Jordão</h2>

<h3>Avenida Macedo Soares — Centro histórico</h3>
<p>A principal rua da cidade concentra restaurantes, lojas de artesanato, chocolaterias e bares. O passeio a pé é obrigatório.</p>

<h3>Morro do Elefante — Teleférico</h3>
<p>Vista panorâmica da Serra da Mantiqueira a mais de 1.800 metros de altitude. A atração mais fotografada da cidade.</p>

<h3>Parque Estadual de Campos do Jordão</h3>
<p>Trilhas em meio à Floresta de Araucárias, cachoeiras e pontos de observação da fauna local.</p>

<h3>Festival de Inverno — Julho</h3>
<p>Um dos maiores festivais de música clássica da América Latina. Concertos, exposições e eventos culturais por todo o mês de julho.</p>

<h3>Chocolaterias e fondue</h3>
<p>Fondue de queijo e chocolate com vista para as montanhas é a experiência gastronômica mais procurada. Reserve com antecedência nos finais de semana de julho.</p>

<h2>Roteiro sugerido de 2 dias</h2>
<ul>
<li><strong>Dia 1:</strong> Chegada, check-in, almoço na Macedo Soares, Morro do Elefante, jantar de fondue</li>
<li><strong>Dia 2:</strong> Parque Estadual, chocolaterias, compras, retorno à tarde</li>
</ul>

<h2>Organize sua excursão de van</h2>
<p>A VaideVan faz o trajeto São Paulo → Campos do Jordão regularmente. Entre em contato pelo WhatsApp <strong>+55 11 99929-4694</strong> e organize sua excursão em grupo com toda a segurança.</p>
    `},{slug:"contrato-fretamento-van-o-que-deve-conter",title:"Contrato de Fretamento de Van: O Que Deve Conter para Proteger sua Empresa",excerpt:"Antes de fechar qualquer contrato de fretamento de van, saiba quais cláusulas são indispensáveis, o que evitar e como garantir SLA, segurança e transparência na prestação do serviço.",date:"2023-07-05",category:"Fretamento Corporativo",readTime:"6 min",image:"https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&auto=format&fit=crop&q=80",content:`
<h2>A importância de um contrato bem redigido</h2>
<p>No mercado de fretamento de van, é comum encontrar operadores que trabalham com contratos genéricos, vagos ou simplesmente com um pedido informal. Essa prática expõe a empresa contratante a riscos sérios: atrasos sem penalidade, troca de veículo sem aviso, motoristas sem qualificação e ausência de suporte em emergências.</p>

<p>Um contrato de fretamento bem estruturado protege ambas as partes e estabelece expectativas claras desde o início da relação comercial.</p>

<h2>Cláusulas indispensáveis em um contrato de fretamento</h2>

<h3>1. Identificação completa das partes e do veículo</h3>
<p>CNPJ, razão social, endereço, placa e modelo do veículo devem estar explícitos. A troca de veículo só pode ocorrer com autorização prévia e comunicação formal.</p>

<h3>2. Descrição detalhada do serviço</h3>
<p>Rotas, pontos de coleta, horários de saída e chegada, frequência semanal e número de passageiros autorizados.</p>

<h3>3. SLA de pontualidade</h3>
<p>O contrato deve definir o percentual mínimo de pontualidade (ex: 98% dos dias) e as penalidades em caso de descumprimento.</p>

<h3>4. Requisitos do motorista</h3>
<p>Habilitação categoria D, curso de direção defensiva, exame toxicológico semestral e comportamento adequado exigidos por contrato.</p>

<h3>5. Seguro e responsabilidade civil</h3>
<p>Especificação da cobertura de seguro (RCTR-C para transporte coletivo de passageiros) e limites de indenização em caso de acidente.</p>

<h3>6. Multas e rescisão</h3>
<p>Condições para rescisão por ambas as partes, prazo de aviso prévio e multas por descumprimento de contrato.</p>

<h3>7. Confidencialidade</h3>
<p>Cláusula de confidencialidade sobre as rotas, endereços de passageiros e dados operacionais da empresa.</p>

<h2>O que a VaideVan oferece nos seus contratos</h2>
<p>A VaideVan utiliza contratos padronizados revisados juridicamente, com todas as cláusulas acima e mais:</p>
<ul>
<li>SLA garantido de 98,5% de pontualidade</li>
<li>Seguro RCTR-C com cobertura total</li>
<li>Cláusula de substituição de veículo em até 2 horas</li>
<li>Relatório mensal de desempenho incluído</li>
</ul>

<h2>Solicite uma proposta</h2>
<p>Entre em contato pelo WhatsApp <strong>+55 11 99929-4694</strong> e receba uma proposta de contrato para análise do seu departamento jurídico.</p>
    `},{slug:"van-para-viagens-intermunicipais-interior-sp",title:"Van para Viagens Intermunicipais: O Interior de São Paulo ao Seu Alcance",excerpt:"Ribeirão Preto, Campinas, Sorocaba, São José dos Campos e mais de 49 cidades atendidas. Saiba como a VaideVan conecta São Paulo ao interior com conforto e pontualidade.",date:"2023-06-15",category:"Transporte Executivo",readTime:"6 min",image:"https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80",content:`
<h2>São Paulo x Interior: uma demanda crescente</h2>
<p>O interior do estado de São Paulo concentra alguns dos maiores polos industriais, universitários e de serviços do país. Cidades como Campinas, Ribeirão Preto, São José dos Campos e Sorocaba atraem executivos, profissionais e equipes corporativas diariamente.</p>

<p>A VaideVan opera rotas intermunicipais com mais de 49 cidades atendidas no estado e em outros 11 estados, sendo a única empresa de van executiva com esse nível de cobertura territorial.</p>

<h2>Principais corredores intermunicipais atendidos</h2>

<h3>São Paulo → Campinas</h3>
<p><strong>Distância:</strong> 100 km | <strong>Tempo médio:</strong> 1h30 a 2h pela Anhanguera/Bandeirantes</p>
<p>Rota mais movimentada do interior paulista. Polo de tecnologia, universidades e indústrias de alta tecnologia.</p>

<h3>São Paulo → Ribeirão Preto</h3>
<p><strong>Distância:</strong> 310 km | <strong>Tempo médio:</strong> 4h pela SP-330</p>
<p>Capital do agronegócio paulista. Polo médico, jurídico e financeiro do interior.</p>

<h3>São Paulo → São José dos Campos</h3>
<p><strong>Distância:</strong> 90 km | <strong>Tempo médio:</strong> 1h20</p>
<p>Polo aeroespacial (Embraer, ITA), indústrias automotivas e tecnológicas.</p>

<h3>São Paulo → Sorocaba</h3>
<p><strong>Distância:</strong> 100 km | <strong>Tempo médio:</strong> 1h30</p>
<p>Polo industrial com forte presença da indústria têxtil e metalúrgica.</p>

<h3>São Paulo → Bauru, Marília, Araçatuba</h3>
<p>Rotas para o oeste paulista com motoristas especializados em viagens longas.</p>

<h2>Serviços oferecidos nas rotas intermunicipais</h2>
<ul>
<li>Transporte de equipes para reuniões e apresentações</li>
<li>Transfer executivo de ida e volta no mesmo dia</li>
<li>Van com motorista para visitas técnicas e obras</li>
<li>Fretamento mensal para empresas com deslocamentos frequentes</li>
</ul>

<h2>Solicite sua rota</h2>
<p>A VaideVan atende rotas personalizadas para qualquer destino no estado de São Paulo. Entre em contato pelo WhatsApp <strong>+55 11 99929-4694</strong> com o itinerário desejado.</p>
    `}];function To(e){return R.find(a=>a.slug===e)}function Ie(e){return new Date(e.includes("T")?e:e+"T00:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})}const H="Todos";function Re(e){return{slug:e.slug,title:e.title,excerpt:e.excerpt,image:e.image,category:e.category,readTime:e.readTime,date:e.date}}function jo(){const{i18n:e}=le(),[a,o]=h.useState(H),[r,s]=h.useState(1e4);h.useState(!1);const[i,l]=h.useState(R.map(Re));h.useEffect(()=>{const u=`${"/".replace(/\/$/,"")}/api`;fetch(`${u}/blog/posts`).then(b=>b.ok?b.json():Promise.reject()).then(b=>{if(!b?.length)return;const y=b.map(f=>({slug:f.slug,title:f.title,excerpt:f.excerpt,image:f.image,category:f.category,readTime:f.readTime,date:f.createdAt})),T=new Set(y.map(f=>f.slug)),v=R.filter(f=>!T.has(f.slug)).map(Re);l([...y,...v])}).catch(()=>{})},[]);const d=[H,...Array.from(new Set(i.map(u=>u.category)))],c=a===H?i:i.filter(u=>u.category===a),n=c[0],p=c.slice(1,r+1),g=c.length>r+1;return t.jsxs("div",{className:"min-h-screen bg-background text-foreground",children:[t.jsxs(aa,{children:[t.jsx("title",{children:"Blog VaideVan — Dicas de Transporte Executivo e Fretamento de Van"}),t.jsx("meta",{name:"description",content:"Artigos especializados sobre transporte executivo, fretamento de van corporativa, transfer aeroporto, excursões e mobilidade urbana. Conteúdo atualizado pela equipe VaideVan."}),t.jsx("meta",{name:"keywords",content:"blog transporte executivo, fretamento van SP, dicas aluguel van, transfer aeroporto São Paulo, mobilidade corporativa, van executiva blog, VaideVan artigos"}),t.jsx("meta",{name:"robots",content:"index, follow, max-snippet:-1, max-image-preview:large"}),t.jsx("link",{rel:"canonical",href:"https://vaidevan.com/blog"}),t.jsx("meta",{property:"og:type",content:"website"}),t.jsx("meta",{property:"og:url",content:"https://vaidevan.com/blog"}),t.jsx("meta",{property:"og:title",content:"Blog VaideVan — Dicas de Transporte Executivo e Fretamento de Van"}),t.jsx("meta",{property:"og:description",content:"Artigos especializados sobre transporte executivo, fretamento de van corporativa, transfer aeroporto e mobilidade urbana."}),t.jsx("meta",{property:"og:image",content:"https://vaidevan.com/opengraph.webp"}),t.jsx("meta",{property:"og:locale",content:"pt_BR"}),t.jsx("meta",{property:"og:site_name",content:"VaideVan"}),t.jsx("meta",{name:"twitter:card",content:"summary_large_image"}),t.jsx("meta",{name:"twitter:title",content:"Blog VaideVan — Dicas de Transporte Executivo"}),t.jsx("meta",{name:"twitter:description",content:"Artigos sobre transporte executivo, fretamento corporativo e transfer aeroporto."}),t.jsx("meta",{name:"twitter:image",content:"https://vaidevan.com/opengraph.webp"})]}),t.jsx("header",{className:"fixed top-0 w-full z-50 bg-background/95 backdrop-blur-md border-b border-white/10",children:t.jsxs("div",{className:"container mx-auto px-4 h-16 flex items-center justify-between",children:[t.jsx(S,{href:"/","aria-label":"VaideVan - Início",children:t.jsx("img",{src:"/logo-black-sm.webp",alt:"VaideVan",className:"h-10 w-auto object-contain cursor-pointer",width:"40",height:"40"})}),t.jsxs("nav",{className:"hidden md:flex items-center gap-8",children:[t.jsx(S,{href:"/",className:"text-sm font-semibold hover:text-primary transition-colors",children:"Início"}),t.jsx(S,{href:"/#servicos",className:"text-sm font-semibold hover:text-primary transition-colors",children:"Serviços"}),t.jsx(S,{href:"/#seja-investidor",className:"text-sm font-semibold hover:text-primary transition-colors",children:"Seja Investidor"}),t.jsx(S,{href:"/blog",className:"text-sm font-semibold text-primary border-b border-primary pb-0.5",children:"Blog"})]}),t.jsx("a",{href:F("blog",e.language),target:"_blank",rel:"noopener noreferrer",children:t.jsx("button",{className:"font-bold rounded-full px-6 py-2 bg-primary text-black hover:bg-primary/90 text-sm transition-all",children:"Solicitar Orçamento"})})]})}),t.jsx("main",{className:"pt-28 pb-24 px-4",children:t.jsxs("div",{className:"container mx-auto max-w-6xl",children:[t.jsxs(E.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.6},className:"text-center mb-12",children:[t.jsx("span",{className:"text-primary text-sm font-bold tracking-widest uppercase mb-4 block",children:"Conteúdo especializado"}),t.jsx("h1",{className:"text-5xl md:text-6xl font-black mb-4",children:"Blog VaideVan"}),t.jsx("p",{className:"text-white/60 text-xl max-w-2xl mx-auto",children:"Dicas, guias e informações sobre transporte executivo, fretamento corporativo e mobilidade urbana."})]}),t.jsx(E.div,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},transition:{duration:.5,delay:.15},className:"flex flex-wrap justify-center gap-2 mb-14",children:d.map(u=>t.jsxs("button",{onClick:()=>{o(u),s(1e4)},className:`px-4 py-2 rounded-full text-sm font-bold transition-all border ${a===u?"bg-primary text-black border-primary":"bg-transparent text-white/60 border-white/20 hover:border-primary/50 hover:text-white"}`,children:[u===H&&t.jsx(ma,{className:"w-3.5 h-3.5 inline mr-1.5 -mt-0.5"}),u]},u))}),n&&t.jsx(E.article,{initial:{opacity:0,y:30},animate:{opacity:1,y:0},transition:{duration:.7,delay:.1},className:"mb-14",children:t.jsx(S,{href:`/blog/${n.slug}`,children:t.jsxs("div",{className:"group relative rounded-3xl bg-card border border-white/10 overflow-hidden hover:border-primary/40 transition-all cursor-pointer",children:[t.jsxs("div",{className:"relative h-64 md:h-80 overflow-hidden",children:[t.jsx("img",{src:n.image,alt:n.title,className:"w-full h-full object-cover group-hover:scale-105 transition-transform duration-700",loading:"lazy",onError:u=>{u.target.src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop&q=80"}}),t.jsx("div",{className:"absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"}),t.jsx("div",{className:"absolute top-5 left-5",children:t.jsxs("span",{className:"bg-primary text-black text-xs font-black rounded-full px-3 py-1 flex items-center gap-1",children:[t.jsx(De,{className:"w-3 h-3"}),n.category]})})]}),t.jsxs("div",{className:"p-8 md:p-10",children:[t.jsxs("div",{className:"flex flex-wrap items-center gap-4 mb-4",children:[t.jsxs("span",{className:"text-white/40 text-sm flex items-center gap-1",children:[t.jsx(oe,{className:"w-4 h-4"}),Ie(n.date)]}),t.jsxs("span",{className:"text-white/40 text-sm flex items-center gap-1",children:[t.jsx(B,{className:"w-4 h-4"}),n.readTime," de leitura"]})]}),t.jsx("h2",{className:"text-3xl md:text-4xl font-black mb-4 group-hover:text-primary transition-colors leading-tight",children:n.title}),t.jsx("p",{className:"text-white/60 text-lg leading-relaxed mb-6 max-w-3xl",children:n.excerpt}),t.jsxs("span",{className:"inline-flex items-center gap-2 text-primary font-bold group-hover:gap-4 transition-all",children:["Ler artigo completo ",t.jsx(_,{className:"w-5 h-5"})]})]})]})})},n.slug),p.length>0&&t.jsx("div",{className:"grid md:grid-cols-2 lg:grid-cols-3 gap-6",children:p.map((u,b)=>t.jsx(E.article,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.5,delay:Math.min(b*.07,.5)},children:t.jsx(S,{href:`/blog/${u.slug}`,children:t.jsxs("div",{className:"group h-full rounded-2xl bg-card border border-white/10 overflow-hidden hover:border-primary/40 hover:-translate-y-1 transition-all cursor-pointer flex flex-col",children:[t.jsxs("div",{className:"relative h-48 overflow-hidden",children:[t.jsx("img",{src:u.image,alt:u.title,className:"w-full h-full object-cover group-hover:scale-105 transition-transform duration-700",loading:"lazy",onError:y=>{y.target.src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop&q=80"}}),t.jsx("div",{className:"absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"}),t.jsx("div",{className:"absolute top-3 left-3",children:t.jsx("span",{className:"bg-primary/90 text-black text-xs font-bold rounded-full px-2.5 py-1",children:u.category})})]}),t.jsxs("div",{className:"p-6 flex flex-col flex-1",children:[t.jsx("h3",{className:"text-lg font-black mb-3 group-hover:text-primary transition-colors leading-snug flex-1",children:u.title}),t.jsx("p",{className:"text-white/50 text-sm leading-relaxed mb-4 line-clamp-2",children:u.excerpt}),t.jsxs("div",{className:"flex items-center justify-between text-white/30 text-xs",children:[t.jsxs("span",{className:"flex items-center gap-1",children:[t.jsx(oe,{className:"w-3 h-3"}),Ie(u.date)]}),t.jsxs("span",{className:"flex items-center gap-1",children:[t.jsx(B,{className:"w-3 h-3"}),u.readTime]})]})]})]})})},u.slug))}),g&&t.jsx("div",{className:"text-center mt-12",children:t.jsxs("button",{onClick:()=>s(u=>u+24),className:"inline-flex items-center gap-2 px-8 py-3 rounded-full border border-white/20 hover:border-primary hover:text-primary font-bold text-sm transition-all",children:["Ver mais artigos ",t.jsx(_,{className:"w-4 h-4"})]})}),c.length===0&&t.jsx("div",{className:"text-center py-24 text-white/40",children:t.jsx("p",{className:"text-xl font-bold",children:"Nenhum artigo nesta categoria."})})]})}),t.jsxs("footer",{className:"bg-card border-t border-white/10 py-10 px-4 text-center",children:[t.jsx(S,{href:"/",children:t.jsx("img",{src:"/logo-black-sm.webp",alt:"VaideVan",className:"h-10 mx-auto mb-4 object-contain cursor-pointer",width:"40",height:"40"})}),t.jsxs("p",{className:"text-white/30 text-sm",children:["© ",new Date().getFullYear()," VaideVan. Todos os direitos reservados."]})]}),t.jsx(ta,{})]})}const Mo=Object.freeze(Object.defineProperty({__proto__:null,default:jo},Symbol.toStringTag,{value:"Module"}));function Vo(e){return new Date(e.includes("T")?e:e+"T00:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})}function Ao(){const{i18n:e}=le(),o=Ue().slug??"",r=To(o),[s,i]=h.useState(r?{...r,date:r.date}:null);h.useEffect(()=>{ce.blogPosts().then(v=>{const f=v.find(k=>k.slug===o);f&&i({slug:f.slug,title:f.title,excerpt:f.excerpt,content:f.content,image:f.image,category:f.category,readTime:f.readTime,date:f.createdAt})}).catch(()=>{})},[o]);const[l,d]=h.useState(R.map(v=>({...v})));h.useEffect(()=>{ce.blogPosts().then(v=>{const f=v.map(j=>({slug:j.slug,title:j.title,excerpt:j.excerpt,content:j.content,image:j.image,category:j.category,readTime:j.readTime,date:j.createdAt})),k=new Set(f.map(j=>j.slug)),sa=[...f,...R.filter(j=>!k.has(j.slug))];d(sa)}).catch(()=>{})},[]);const c=l;if(!s)return t.jsxs("div",{className:"min-h-screen bg-background text-foreground flex items-center justify-center flex-col gap-6",children:[t.jsx("h1",{className:"text-3xl font-black",children:"Post não encontrado"}),t.jsx(S,{href:"/blog",children:t.jsx(de,{className:"rounded-full bg-primary text-black font-bold",children:"Voltar ao Blog"})})]});const n=c.filter(v=>v.slug!==s.slug&&v.category===s.category).slice(0,3),p=n.length<3?[...n,...c.filter(v=>v.slug!==s.slug&&!n.includes(v)).slice(0,3-n.length)]:n,g=c.findIndex(v=>v.slug===s.slug),u=g>0?c[g-1]:null,b=g<c.length-1?c[g+1]:null,y=s.excerpt.replace(/<[^>]*>/g,"").replace(/&[^;]+;/g," ").trim(),T=y.length>155?y.substring(0,152)+"...":y;return t.jsxs("div",{className:"min-h-screen bg-background text-foreground",children:[t.jsxs(aa,{children:[t.jsxs("title",{children:[s.title," | Blog VaideVan"]}),t.jsx("meta",{name:"description",content:T}),t.jsx("meta",{name:"keywords",content:`${s.category}, transporte executivo, aluguel van executiva premium, VaideVan, locação van SP`}),t.jsx("meta",{name:"robots",content:"index, follow, max-snippet:-1, max-image-preview:large"}),t.jsx("link",{rel:"canonical",href:`https://vaidevan.com/blog/${s.slug}`}),t.jsx("meta",{property:"og:type",content:"article"}),t.jsx("meta",{property:"og:url",content:`https://vaidevan.com/blog/${s.slug}`}),t.jsx("meta",{property:"og:title",content:`${s.title} | Blog VaideVan`}),t.jsx("meta",{property:"og:description",content:T}),t.jsx("meta",{property:"og:image",content:s.image}),t.jsx("meta",{property:"og:locale",content:"pt_BR"}),t.jsx("meta",{property:"og:site_name",content:"VaideVan"}),t.jsx("meta",{property:"article:published_time",content:s.date}),t.jsx("meta",{property:"article:section",content:s.category}),t.jsx("meta",{name:"twitter:card",content:"summary_large_image"}),t.jsx("meta",{name:"twitter:title",content:`${s.title} | Blog VaideVan`}),t.jsx("meta",{name:"twitter:description",content:T}),t.jsx("meta",{name:"twitter:image",content:s.image})]}),t.jsx("header",{className:"fixed top-0 w-full z-50 bg-background/95 backdrop-blur-md border-b border-white/10",children:t.jsxs("div",{className:"container mx-auto px-4 h-20 flex items-center justify-between",children:[t.jsx(S,{href:"/","aria-label":"VaideVan - Início",children:t.jsx("img",{src:"/logo-black-sm.webp",alt:"VaideVan",className:"h-12 w-auto object-contain cursor-pointer",width:"48",height:"48"})}),t.jsxs("nav",{className:"hidden md:flex items-center gap-8",children:[t.jsx(S,{href:"/",className:"text-sm font-semibold hover:text-primary transition-colors",children:"Início"}),t.jsx(S,{href:"/#servicos",className:"text-sm font-semibold hover:text-primary transition-colors",children:"Serviços"}),t.jsx(S,{href:"/#seja-investidor",className:"text-sm font-semibold hover:text-primary transition-colors",children:"Seja Investidor"}),t.jsx(S,{href:"/blog",className:"text-sm font-semibold text-primary",children:"Blog"})]}),t.jsx("a",{href:F("blog",e.language),target:"_blank",rel:"noopener noreferrer",children:t.jsx("button",{className:"font-bold rounded-full px-6 py-2.5 bg-primary text-black hover:bg-primary/90 text-sm transition-all",children:"Solicitar Orçamento"})})]})}),t.jsx("main",{className:"pt-32 pb-24 px-4",children:t.jsxs("div",{className:"container mx-auto max-w-4xl",children:[t.jsxs("nav",{"aria-label":"Breadcrumb",className:"flex items-center gap-2 text-white/40 text-sm mb-10",children:[t.jsx(S,{href:"/",className:"hover:text-white transition-colors",children:"Início"}),t.jsx(ge,{className:"w-4 h-4"}),t.jsx(S,{href:"/blog",className:"hover:text-white transition-colors",children:"Blog"}),t.jsx(ge,{className:"w-4 h-4"}),t.jsx("span",{className:"text-white/70 line-clamp-1",children:s.title})]}),t.jsx(E.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.5},className:"rounded-3xl overflow-hidden mb-10 h-64 md:h-96",children:t.jsx("img",{src:s.image,alt:s.title,className:"w-full h-full object-cover"})}),t.jsxs(E.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.6},children:[t.jsxs("div",{className:"flex flex-wrap items-center gap-4 mb-6",children:[t.jsxs("span",{className:"bg-primary/15 text-primary text-xs font-black rounded-full px-3 py-1 flex items-center gap-1",children:[t.jsx(De,{className:"w-3 h-3"}),s.category]}),t.jsxs("span",{className:"text-white/40 text-sm flex items-center gap-1",children:[t.jsx(oe,{className:"w-4 h-4"}),Vo(s.date)]}),t.jsxs("span",{className:"text-white/40 text-sm flex items-center gap-1",children:[t.jsx(B,{className:"w-4 h-4"}),s.readTime," de leitura"]})]}),t.jsx("h1",{className:"text-4xl md:text-5xl font-black leading-tight mb-6",children:s.title}),t.jsx("p",{className:"text-white/60 text-xl leading-relaxed mb-12 border-l-4 border-primary pl-6",children:s.excerpt}),t.jsx("div",{className:"prose-vaidevan",style:{lineHeight:"1.8",color:"rgba(255,255,255,0.8)"},dangerouslySetInnerHTML:{__html:s.content}})]}),t.jsxs(E.div,{initial:{opacity:0,y:20},whileInView:{opacity:1,y:0},viewport:{once:!0},transition:{duration:.6},className:"mt-16 rounded-3xl bg-primary/5 border border-primary/20 p-10 text-center",children:[t.jsxs("h3",{className:"text-2xl md:text-3xl font-black mb-4",children:["Pronto para contratar a ",t.jsx("span",{className:"text-primary",children:"VaideVan"}),"?"]}),t.jsx("p",{className:"text-white/60 mb-8 max-w-xl mx-auto",children:"Nossa equipe está de prontidão agora. Entre em contato pelo WhatsApp e receba sua proposta de forma imediata."}),t.jsx("a",{href:F("blog",e.language),target:"_blank",rel:"noopener noreferrer",children:t.jsxs(de,{className:"h-12 px-10 font-black rounded-full bg-primary text-black hover:bg-primary/90",children:["Falar no WhatsApp",t.jsx(_,{className:"w-4 h-4 ml-2"})]})})]}),t.jsxs("div",{className:"mt-12 grid md:grid-cols-2 gap-4",children:[u&&t.jsx(S,{href:`/blog/${u.slug}`,children:t.jsxs("div",{className:"group flex items-start gap-4 p-5 rounded-2xl bg-card border border-white/10 hover:border-primary/40 transition-all cursor-pointer",children:[t.jsx(pa,{className:"w-5 h-5 text-primary mt-1 flex-shrink-0 group-hover:-translate-x-1 transition-transform"}),t.jsxs("div",{children:[t.jsx("p",{className:"text-white/40 text-xs mb-1",children:"Artigo anterior"}),t.jsx("p",{className:"font-bold text-sm group-hover:text-primary transition-colors line-clamp-2",children:u.title})]})]})}),b&&t.jsx(S,{href:`/blog/${b.slug}`,children:t.jsxs("div",{className:"group flex items-start gap-4 p-5 rounded-2xl bg-card border border-white/10 hover:border-primary/40 transition-all cursor-pointer md:text-right md:flex-row-reverse",children:[t.jsx(_,{className:"w-5 h-5 text-primary mt-1 flex-shrink-0 group-hover:translate-x-1 transition-transform"}),t.jsxs("div",{children:[t.jsx("p",{className:"text-white/40 text-xs mb-1",children:"Próximo artigo"}),t.jsx("p",{className:"font-bold text-sm group-hover:text-primary transition-colors line-clamp-2",children:b.title})]})]})})]}),p.length>0&&t.jsxs("div",{className:"mt-20",children:[t.jsx("h3",{className:"text-2xl font-black mb-8",children:"Outros artigos sobre transporte executivo"}),t.jsx("div",{className:"grid md:grid-cols-3 gap-5",children:p.map(v=>t.jsx(S,{href:`/blog/${v.slug}`,children:t.jsxs("div",{className:"group rounded-2xl bg-card border border-white/10 hover:border-primary/40 hover:-translate-y-1 transition-all cursor-pointer h-full flex flex-col overflow-hidden",children:[t.jsxs("div",{className:"relative h-44 overflow-hidden flex-shrink-0",children:[t.jsx("img",{src:v.image,alt:v.title,className:"w-full h-full object-cover group-hover:scale-105 transition-transform duration-700",loading:"lazy",decoding:"async"}),t.jsx("div",{className:"absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"}),t.jsx("span",{className:"absolute top-3 left-3 bg-primary/90 text-black text-xs font-bold rounded-full px-2.5 py-1",children:v.category})]}),t.jsxs("div",{className:"p-5 flex flex-col flex-1",children:[t.jsx("h4",{className:"font-black text-sm group-hover:text-primary transition-colors leading-snug flex-1 mb-3",children:v.title}),t.jsxs("p",{className:"text-white/30 text-xs flex items-center gap-1",children:[t.jsx(B,{className:"w-3 h-3"}),v.readTime," de leitura"]})]})]})},v.slug))})]})]})}),t.jsxs("footer",{className:"bg-card border-t border-white/10 py-10 px-4 text-center",children:[t.jsx(S,{href:"/",children:t.jsx("img",{src:"/logo-black-sm.webp",alt:"VaideVan",className:"h-12 mx-auto mb-4 object-contain cursor-pointer",width:"48",height:"48"})}),t.jsxs("p",{className:"text-white/30 text-sm",children:["© ",new Date().getFullYear()," VaideVan. Todos os direitos reservados."]})]}),t.jsx(ta,{})]})}const Do=Object.freeze(Object.defineProperty({__proto__:null,default:Ao},Symbol.toStringTag,{value:"Module"}));export{de as B,aa as H,S as L,wa as R,zo as S,ta as W,ce as a,No as b,Ro as c,oa as d,eo as e,ko as f,yo as g,Io as h,Mo as i,Do as j,Ue as u,F as w};
