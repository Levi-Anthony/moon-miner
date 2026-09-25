var Eu=Object.defineProperty;var wu=(n,e,t)=>e in n?Eu(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t;var at=(n,e,t)=>wu(n,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function t(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(r){if(r.ep)return;r.ep=!0;const s=t(r);fetch(r.href,s)}})();/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const ul="186",Tu=0,ac=1,Au=2,Ir=1,Ru=2,Pr=3,Ri=0,nn=1,ln=2,Un=0,Nr=1,Xs=2,oc=3,lc=4,Cu=5,ir=100,Pu=101,Du=102,Lu=103,Iu=104,Nu=200,Uu=201,Fu=202,Ou=203,Td=204,Ad=205,Bu=206,ku=207,zu=208,Gu=209,Hu=210,Vu=211,Wu=212,Xu=213,qu=214,po=0,mo=1,go=2,kr=3,_o=4,xo=5,vo=6,So=7,fl=0,Yu=1,$u=2,Fn=0,Rd=1,Cd=2,Pd=3,Dd=4,Ld=5,Id=6,Nd=7,Ud=300,Ci=301,or=302,ya=303,ba=304,la=306,Mo=1e3,Xn=1001,yo=1002,Bt=1003,Ku=1004,as=1005,qt=1006,Ea=1007,Ei=1008,cn=1009,Fd=1010,Od=1011,zr=1012,pl=1013,On=1014,In=1015,rn=1016,ml=1017,gl=1018,Gr=1020,Bd=35902,kd=35899,zd=1021,Gd=1022,wn=1023,$n=1026,wi=1027,Hd=1028,_l=1029,Pi=1030,xl=1031,vl=1033,Os=33776,Bs=33777,ks=33778,zs=33779,bo=35840,Eo=35841,wo=35842,To=35843,Ao=36196,Ro=37492,Co=37496,Po=37488,Do=37489,qs=37490,Lo=37491,Io=37808,No=37809,Uo=37810,Fo=37811,Oo=37812,Bo=37813,ko=37814,zo=37815,Go=37816,Ho=37817,Vo=37818,Wo=37819,Xo=37820,qo=37821,Yo=36492,$o=36494,Ko=36495,Zo=36283,Jo=36284,Ys=36285,Qo=36286,Zu=3200,$s=0,Ju=1,li="",Qt="srgb",Ks="srgb-linear",Zs="linear",et="srgb",wa=7680,Qu=519,ju=512,ef=513,tf=514,Sl=515,nf=516,rf=517,Ml=518,sf=519,Vd=35044,cc="300 es",Nn=2e3,Hr=2001;function af(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function Js(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function of(){const n=Js("canvas");return n.style.display="block",n}const dc={};function Qs(...n){const e="THREE."+n.shift();console.log(e,...n)}function Wd(n){const e=n[0];if(typeof e=="string"&&e.startsWith("TSL:")){const t=n[1];t&&t.isStackTrace?n[0]+=" "+t.getLocation():n[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return n}function Ne(...n){n=Wd(n);const e="THREE."+n.shift();{const t=n[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...n)}}function Ke(...n){n=Wd(n);const e="THREE."+n.shift();{const t=n[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...n)}}function sr(...n){const e=n.join(" ");e in dc||(dc[e]=!0,Ne(...n))}function lf(n,e,t){return new Promise(function(i,r){function s(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:r();break;case n.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:i()}}setTimeout(s,t)})}const cf={[po]:mo,[go]:vo,[_o]:So,[kr]:xo,[mo]:po,[vo]:go,[So]:_o,[xo]:kr};class Ni{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){const i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){const i=this._listeners;if(i===void 0)return;const r=i[e];if(r!==void 0){const s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const i=t[e.type];if(i!==void 0){e.target=this;const r=i.slice(0);for(let s=0,a=r.length;s<a;s++)r[s].call(this,e);e.target=null}}}const Gt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Ta=Math.PI/180,jo=180/Math.PI;function pi(){const n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Gt[n&255]+Gt[n>>8&255]+Gt[n>>16&255]+Gt[n>>24&255]+"-"+Gt[e&255]+Gt[e>>8&255]+"-"+Gt[e>>16&15|64]+Gt[e>>24&255]+"-"+Gt[t&63|128]+Gt[t>>8&255]+"-"+Gt[t>>16&255]+Gt[t>>24&255]+Gt[i&255]+Gt[i>>8&255]+Gt[i>>16&255]+Gt[i>>24&255]).toLowerCase()}function Ye(n,e,t){return Math.max(e,Math.min(t,n))}function df(n,e){return(n%e+e)%e}function Aa(n,e,t){return(1-t)*n+t*e}function Ln(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:case Uint8ClampedArray:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function rt(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}const Xl=class Xl{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6],this.y=r[1]*t+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Ye(this.x,e.x,t.x),this.y=Ye(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Ye(this.x,e,t),this.y=Ye(this.y,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Ye(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Ye(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),r=Math.sin(t),s=this.x-e.x,a=this.y-e.y;return this.x=s*i-a*r+e.x,this.y=s*r+a*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Xl.prototype.isVector2=!0;let Ae=Xl;class pr{constructor(e=0,t=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=r}static slerpFlat(e,t,i,r,s,a,o){let l=i[r+0],c=i[r+1],u=i[r+2],f=i[r+3],h=s[a+0],p=s[a+1],g=s[a+2],M=s[a+3];if(f!==M||l!==h||c!==p||u!==g){let m=l*h+c*p+u*g+f*M;m<0&&(h=-h,p=-p,g=-g,M=-M,m=-m);let d=1-o;if(m<.9995){const E=Math.acos(m),A=Math.sin(E);d=Math.sin(d*E)/A,o=Math.sin(o*E)/A,l=l*d+h*o,c=c*d+p*o,u=u*d+g*o,f=f*d+M*o}else{l=l*d+h*o,c=c*d+p*o,u=u*d+g*o,f=f*d+M*o;const E=1/Math.sqrt(l*l+c*c+u*u+f*f);l*=E,c*=E,u*=E,f*=E}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=f}static multiplyQuaternionsFlat(e,t,i,r,s,a){const o=i[r],l=i[r+1],c=i[r+2],u=i[r+3],f=s[a],h=s[a+1],p=s[a+2],g=s[a+3];return e[t]=o*g+u*f+l*p-c*h,e[t+1]=l*g+u*h+c*f-o*p,e[t+2]=c*g+u*p+o*h-l*f,e[t+3]=u*g-o*f-l*h-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,r){return this._x=e,this._y=t,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,r=e._y,s=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(i/2),u=o(r/2),f=o(s/2),h=l(i/2),p=l(r/2),g=l(s/2);switch(a){case"XYZ":this._x=h*u*f+c*p*g,this._y=c*p*f-h*u*g,this._z=c*u*g+h*p*f,this._w=c*u*f-h*p*g;break;case"YXZ":this._x=h*u*f+c*p*g,this._y=c*p*f-h*u*g,this._z=c*u*g-h*p*f,this._w=c*u*f+h*p*g;break;case"ZXY":this._x=h*u*f-c*p*g,this._y=c*p*f+h*u*g,this._z=c*u*g+h*p*f,this._w=c*u*f-h*p*g;break;case"ZYX":this._x=h*u*f-c*p*g,this._y=c*p*f+h*u*g,this._z=c*u*g-h*p*f,this._w=c*u*f+h*p*g;break;case"YZX":this._x=h*u*f+c*p*g,this._y=c*p*f+h*u*g,this._z=c*u*g-h*p*f,this._w=c*u*f-h*p*g;break;case"XZY":this._x=h*u*f-c*p*g,this._y=c*p*f-h*u*g,this._z=c*u*g+h*p*f,this._w=c*u*f+h*p*g;break;default:Ne("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],r=t[4],s=t[8],a=t[1],o=t[5],l=t[9],c=t[2],u=t[6],f=t[10],h=i+o+f;if(h>0){const p=.5/Math.sqrt(h+1);this._w=.25/p,this._x=(u-l)*p,this._y=(s-c)*p,this._z=(a-r)*p}else if(i>o&&i>f){const p=2*Math.sqrt(1+i-o-f);this._w=(u-l)/p,this._x=.25*p,this._y=(r+a)/p,this._z=(s+c)/p}else if(o>f){const p=2*Math.sqrt(1+o-i-f);this._w=(s-c)/p,this._x=(r+a)/p,this._y=.25*p,this._z=(l+u)/p}else{const p=2*Math.sqrt(1+f-i-o);this._w=(a-r)/p,this._x=(s+c)/p,this._y=(l+u)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ye(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const r=Math.min(1,t/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,r=e._y,s=e._z,a=e._w,o=t._x,l=t._y,c=t._z,u=t._w;return this._x=i*u+a*o+r*c-s*l,this._y=r*u+a*l+s*o-i*c,this._z=s*u+a*c+i*l-r*o,this._w=a*u-i*o-r*l-s*c,this._onChangeCallback(),this}slerp(e,t){let i=e._x,r=e._y,s=e._z,a=e._w,o=this.dot(e);o<0&&(i=-i,r=-r,s=-s,a=-a,o=-o);let l=1-t;if(o<.9995){const c=Math.acos(o),u=Math.sin(c);l=Math.sin(l*c)/u,t=Math.sin(t*c)/u,this._x=this._x*l+i*t,this._y=this._y*l+r*t,this._z=this._z*l+s*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+i*t,this._y=this._y*l+r*t,this._z=this._z*l+s*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),r=Math.sqrt(1-i),s=Math.sqrt(i);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const ql=class ql{constructor(e=0,t=0,i=0){this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(hc.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(hc.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6]*r,this.y=s[1]*t+s[4]*i+s[7]*r,this.z=s[2]*t+s[5]*i+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,r=this.z,s=e.elements,a=1/(s[3]*t+s[7]*i+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*i+s[8]*r+s[12])*a,this.y=(s[1]*t+s[5]*i+s[9]*r+s[13])*a,this.z=(s[2]*t+s[6]*i+s[10]*r+s[14])*a,this}applyQuaternion(e){const t=this.x,i=this.y,r=this.z,s=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*r-o*i),u=2*(o*t-s*r),f=2*(s*i-a*t);return this.x=t+l*c+a*f-o*u,this.y=i+l*u+o*c-s*f,this.z=r+l*f+s*u-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*i+s[8]*r,this.y=s[1]*t+s[5]*i+s[9]*r,this.z=s[2]*t+s[6]*i+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Ye(this.x,e.x,t.x),this.y=Ye(this.y,e.y,t.y),this.z=Ye(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Ye(this.x,e,t),this.y=Ye(this.y,e,t),this.z=Ye(this.z,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Ye(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,r=e.y,s=e.z,a=t.x,o=t.y,l=t.z;return this.x=r*l-s*o,this.y=s*a-i*l,this.z=i*o-r*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Ra.copy(this).projectOnVector(e),this.sub(Ra)}reflect(e){return this.sub(Ra.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Ye(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return t*t+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const r=Math.sin(t)*e;return this.x=r*Math.sin(i),this.y=Math.cos(t)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};ql.prototype.isVector3=!0;let I=ql;const Ra=new I,hc=new pr,Yl=class Yl{constructor(e,t,i,r,s,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,a,o,l,c)}set(e,t,i,r,s,a,o,l,c){const u=this.elements;return u[0]=e,u[1]=r,u[2]=o,u[3]=t,u[4]=s,u[5]=l,u[6]=i,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,r=t.elements,s=this.elements,a=i[0],o=i[3],l=i[6],c=i[1],u=i[4],f=i[7],h=i[2],p=i[5],g=i[8],M=r[0],m=r[3],d=r[6],E=r[1],A=r[4],v=r[7],w=r[2],b=r[5],R=r[8];return s[0]=a*M+o*E+l*w,s[3]=a*m+o*A+l*b,s[6]=a*d+o*v+l*R,s[1]=c*M+u*E+f*w,s[4]=c*m+u*A+f*b,s[7]=c*d+u*v+f*R,s[2]=h*M+p*E+g*w,s[5]=h*m+p*A+g*b,s[8]=h*d+p*v+g*R,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8];return t*a*u-t*o*c-i*s*u+i*o*l+r*s*c-r*a*l}invert(){const e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],f=u*a-o*c,h=o*l-u*s,p=c*s-a*l,g=t*f+i*h+r*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const M=1/g;return e[0]=f*M,e[1]=(r*c-u*i)*M,e[2]=(o*i-r*a)*M,e[3]=h*M,e[4]=(u*t-r*l)*M,e[5]=(r*s-o*t)*M,e[6]=p*M,e[7]=(i*l-c*t)*M,e[8]=(a*t-i*s)*M,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,r,s,a,o){const l=Math.cos(s),c=Math.sin(s);return this.set(i*l,i*c,-i*(l*a+c*o)+a+e,-r*c,r*l,-r*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return sr("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Ca.makeScale(e,t)),this}rotate(e){return sr("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Ca.makeRotation(-e)),this}translate(e,t){return sr("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Ca.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let r=0;r<9;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}};Yl.prototype.isMatrix3=!0;let Fe=Yl;const Ca=new Fe,uc=new Fe().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),fc=new Fe().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function hf(){const n={enabled:!0,workingColorSpace:Ks,spaces:{},convert:function(r,s,a){return this.enabled===!1||s===a||!s||!a||(this.spaces[s].transfer===et&&(r.r=qn(r.r),r.g=qn(r.g),r.b=qn(r.b)),this.spaces[s].primaries!==this.spaces[a].primaries&&(r.applyMatrix3(this.spaces[s].toXYZ),r.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===et&&(r.r=ar(r.r),r.g=ar(r.g),r.b=ar(r.b))),r},workingToColorSpace:function(r,s){return this.convert(r,this.workingColorSpace,s)},colorSpaceToWorking:function(r,s){return this.convert(r,s,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===li?Zs:this.spaces[r].transfer},getToneMappingMode:function(r){return this.spaces[r].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(r,s=this.workingColorSpace){return r.fromArray(this.spaces[s].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,s,a){return r.copy(this.spaces[s].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(r,s){return sr("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(r,s)},toWorkingColorSpace:function(r,s){return sr("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(r,s)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[Ks]:{primaries:e,whitePoint:i,transfer:Zs,toXYZ:uc,fromXYZ:fc,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Qt},outputColorSpaceConfig:{drawingBufferColorSpace:Qt}},[Qt]:{primaries:e,whitePoint:i,transfer:et,toXYZ:uc,fromXYZ:fc,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Qt}}}),n}const qe=hf();function qn(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function ar(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}let zi;class uf{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{zi===void 0&&(zi=Js("canvas")),zi.width=e.width,zi.height=e.height;const r=zi.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),i=zi}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Js("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const r=i.getImageData(0,0,e.width,e.height),s=r.data;for(let a=0;a<s.length;a++)s[a]=qn(s[a]/255)*255;return i.putImageData(r,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(qn(t[i]/255)*255):t[i]=qn(t[i]);return{data:t,width:e.width,height:e.height}}else return Ne("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let ff=0;class yl{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:ff++}),this.uuid=pi(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let a=0,o=r.length;a<o;a++)r[a].isDataTexture?s.push(Pa(r[a].image)):s.push(Pa(r[a]))}else s=Pa(r);i.url=s}return t||(e.images[this.uuid]=i),i}}function Pa(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?uf.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(Ne("Texture: Unable to serialize Texture."),{})}let pf=0;const Da=new I;class $t extends Ni{constructor(e=$t.DEFAULT_IMAGE,t=$t.DEFAULT_MAPPING,i=Xn,r=Xn,s=qt,a=Ei,o=wn,l=cn,c=$t.DEFAULT_ANISOTROPY,u=li){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:pf++}),this.uuid=pi(),this.name="",this.source=new yl(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=s,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Ae(0,0),this.repeat=new Ae(1,1),this.center=new Ae(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Fe,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Da).x}get height(){return this.source.getSize(Da).y}get depth(){return this.source.getSize(Da).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const i=e[t];if(i===void 0){Ne(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){Ne(`Texture.setValues(): property '${t}' does not exist.`);continue}r&&i&&r.isVector2&&i.isVector2||r&&i&&r.isVector3&&i.isVector3||r&&i&&r.isMatrix3&&i.isMatrix3?r.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Ud)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Mo:e.x=e.x-Math.floor(e.x);break;case Xn:e.x=e.x<0?0:1;break;case yo:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Mo:e.y=e.y-Math.floor(e.y);break;case Xn:e.y=e.y<0?0:1;break;case yo:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}$t.DEFAULT_IMAGE=null;$t.DEFAULT_MAPPING=Ud;$t.DEFAULT_ANISOTROPY=1;const $l=class $l{constructor(e=0,t=0,i=0,r=1){this.x=e,this.y=t,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,r){return this.x=e,this.y=t,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,r=this.z,s=this.w,a=e.elements;return this.x=a[0]*t+a[4]*i+a[8]*r+a[12]*s,this.y=a[1]*t+a[5]*i+a[9]*r+a[13]*s,this.z=a[2]*t+a[6]*i+a[10]*r+a[14]*s,this.w=a[3]*t+a[7]*i+a[11]*r+a[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,r,s;const l=e.elements,c=l[0],u=l[4],f=l[8],h=l[1],p=l[5],g=l[9],M=l[2],m=l[6],d=l[10];if(Math.abs(u-h)<.01&&Math.abs(f-M)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+h)<.1&&Math.abs(f+M)<.1&&Math.abs(g+m)<.1&&Math.abs(c+p+d-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const A=(c+1)/2,v=(p+1)/2,w=(d+1)/2,b=(u+h)/4,R=(f+M)/4,_=(g+m)/4;return A>v&&A>w?A<.01?(i=0,r=.707106781,s=.707106781):(i=Math.sqrt(A),r=b/i,s=R/i):v>w?v<.01?(i=.707106781,r=0,s=.707106781):(r=Math.sqrt(v),i=b/r,s=_/r):w<.01?(i=.707106781,r=.707106781,s=0):(s=Math.sqrt(w),i=R/s,r=_/s),this.set(i,r,s,t),this}let E=Math.sqrt((m-g)*(m-g)+(f-M)*(f-M)+(h-u)*(h-u));return Math.abs(E)<.001&&(E=1),this.x=(m-g)/E,this.y=(f-M)/E,this.z=(h-u)/E,this.w=Math.acos((c+p+d-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Ye(this.x,e.x,t.x),this.y=Ye(this.y,e.y,t.y),this.z=Ye(this.z,e.z,t.z),this.w=Ye(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Ye(this.x,e,t),this.y=Ye(this.y,e,t),this.z=Ye(this.z,e,t),this.w=Ye(this.w,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Ye(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};$l.prototype.isVector4=!0;let St=$l;class mf extends Ni{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:qt,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new St(0,0,e,t),this.scissorTest=!1,this.viewport=new St(0,0,e,t),this.textures=[];const r={width:e,height:t,depth:i.depth},s=new $t(r),a=i.count;for(let o=0;o<a;o++)this.textures[o]=s.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(e={}){const t={minFilter:qt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=i,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const r=Object.assign({},e.textures[t].image);this.textures[t].source=new yl(r)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){const t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class jt extends mf{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class Xd extends $t{constructor(e=null,t=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=Bt,this.minFilter=Bt,this.wrapR=Xn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class gf extends $t{constructor(e=null,t=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=Bt,this.minFilter=Bt,this.wrapR=Xn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}}const oa=class oa{constructor(e,t,i,r,s,a,o,l,c,u,f,h,p,g,M,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,a,o,l,c,u,f,h,p,g,M,m)}set(e,t,i,r,s,a,o,l,c,u,f,h,p,g,M,m){const d=this.elements;return d[0]=e,d[4]=t,d[8]=i,d[12]=r,d[1]=s,d[5]=a,d[9]=o,d[13]=l,d[2]=c,d[6]=u,d[10]=f,d[14]=h,d[3]=p,d[7]=g,d[11]=M,d[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new oa().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();const t=this.elements,i=e.elements,r=1/Gi.setFromMatrixColumn(e,0).length(),s=1/Gi.setFromMatrixColumn(e,1).length(),a=1/Gi.setFromMatrixColumn(e,2).length();return t[0]=i[0]*r,t[1]=i[1]*r,t[2]=i[2]*r,t[3]=0,t[4]=i[4]*s,t[5]=i[5]*s,t[6]=i[6]*s,t[7]=0,t[8]=i[8]*a,t[9]=i[9]*a,t[10]=i[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,r=e.y,s=e.z,a=Math.cos(i),o=Math.sin(i),l=Math.cos(r),c=Math.sin(r),u=Math.cos(s),f=Math.sin(s);if(e.order==="XYZ"){const h=a*u,p=a*f,g=o*u,M=o*f;t[0]=l*u,t[4]=-l*f,t[8]=c,t[1]=p+g*c,t[5]=h-M*c,t[9]=-o*l,t[2]=M-h*c,t[6]=g+p*c,t[10]=a*l}else if(e.order==="YXZ"){const h=l*u,p=l*f,g=c*u,M=c*f;t[0]=h+M*o,t[4]=g*o-p,t[8]=a*c,t[1]=a*f,t[5]=a*u,t[9]=-o,t[2]=p*o-g,t[6]=M+h*o,t[10]=a*l}else if(e.order==="ZXY"){const h=l*u,p=l*f,g=c*u,M=c*f;t[0]=h-M*o,t[4]=-a*f,t[8]=g+p*o,t[1]=p+g*o,t[5]=a*u,t[9]=M-h*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){const h=a*u,p=a*f,g=o*u,M=o*f;t[0]=l*u,t[4]=g*c-p,t[8]=h*c+M,t[1]=l*f,t[5]=M*c+h,t[9]=p*c-g,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){const h=a*l,p=a*c,g=o*l,M=o*c;t[0]=l*u,t[4]=M-h*f,t[8]=g*f+p,t[1]=f,t[5]=a*u,t[9]=-o*u,t[2]=-c*u,t[6]=p*f+g,t[10]=h-M*f}else if(e.order==="XZY"){const h=a*l,p=a*c,g=o*l,M=o*c;t[0]=l*u,t[4]=-f,t[8]=c*u,t[1]=h*f+M,t[5]=a*u,t[9]=p*f-g,t[2]=g*f-p,t[6]=o*u,t[10]=M*f+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(_f,e,xf)}lookAt(e,t,i){const r=this.elements;return sn.subVectors(e,t),sn.lengthSq()===0&&(sn.z=1),sn.normalize(),ti.crossVectors(i,sn),ti.lengthSq()===0&&(Math.abs(i.z)===1?sn.x+=1e-4:sn.z+=1e-4,sn.normalize(),ti.crossVectors(i,sn)),ti.normalize(),os.crossVectors(sn,ti),r[0]=ti.x,r[4]=os.x,r[8]=sn.x,r[1]=ti.y,r[5]=os.y,r[9]=sn.y,r[2]=ti.z,r[6]=os.z,r[10]=sn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,r=t.elements,s=this.elements,a=i[0],o=i[4],l=i[8],c=i[12],u=i[1],f=i[5],h=i[9],p=i[13],g=i[2],M=i[6],m=i[10],d=i[14],E=i[3],A=i[7],v=i[11],w=i[15],b=r[0],R=r[4],_=r[8],T=r[12],C=r[1],D=r[5],O=r[9],H=r[13],F=r[2],k=r[6],X=r[10],S=r[14],Q=r[3],W=r[7],j=r[11],ee=r[15];return s[0]=a*b+o*C+l*F+c*Q,s[4]=a*R+o*D+l*k+c*W,s[8]=a*_+o*O+l*X+c*j,s[12]=a*T+o*H+l*S+c*ee,s[1]=u*b+f*C+h*F+p*Q,s[5]=u*R+f*D+h*k+p*W,s[9]=u*_+f*O+h*X+p*j,s[13]=u*T+f*H+h*S+p*ee,s[2]=g*b+M*C+m*F+d*Q,s[6]=g*R+M*D+m*k+d*W,s[10]=g*_+M*O+m*X+d*j,s[14]=g*T+M*H+m*S+d*ee,s[3]=E*b+A*C+v*F+w*Q,s[7]=E*R+A*D+v*k+w*W,s[11]=E*_+A*O+v*X+w*j,s[15]=E*T+A*H+v*S+w*ee,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],r=e[8],s=e[12],a=e[1],o=e[5],l=e[9],c=e[13],u=e[2],f=e[6],h=e[10],p=e[14],g=e[3],M=e[7],m=e[11],d=e[15],E=l*p-c*h,A=o*p-c*f,v=o*h-l*f,w=a*p-c*u,b=a*h-l*u,R=a*f-o*u;return t*(M*E-m*A+d*v)-i*(g*E-m*w+d*b)+r*(g*A-M*w+d*R)-s*(g*v-M*b+m*R)}determinantAffine(){const e=this.elements,t=e[0],i=e[4],r=e[8],s=e[1],a=e[5],o=e[9],l=e[2],c=e[6],u=e[10];return t*(a*u-o*c)-i*(s*u-o*l)+r*(s*c-a*l)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],f=e[9],h=e[10],p=e[11],g=e[12],M=e[13],m=e[14],d=e[15],E=t*o-i*a,A=t*l-r*a,v=t*c-s*a,w=i*l-r*o,b=i*c-s*o,R=r*c-s*l,_=u*M-f*g,T=u*m-h*g,C=u*d-p*g,D=f*m-h*M,O=f*d-p*M,H=h*d-p*m,F=E*H-A*O+v*D+w*C-b*T+R*_;if(F===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const k=1/F;return e[0]=(o*H-l*O+c*D)*k,e[1]=(r*O-i*H-s*D)*k,e[2]=(M*R-m*b+d*w)*k,e[3]=(h*b-f*R-p*w)*k,e[4]=(l*C-a*H-c*T)*k,e[5]=(t*H-r*C+s*T)*k,e[6]=(m*v-g*R-d*A)*k,e[7]=(u*R-h*v+p*A)*k,e[8]=(a*O-o*C+c*_)*k,e[9]=(i*C-t*O-s*_)*k,e[10]=(g*b-M*v+d*E)*k,e[11]=(f*v-u*b-p*E)*k,e[12]=(o*T-a*D-l*_)*k,e[13]=(t*D-i*T+r*_)*k,e[14]=(M*A-g*w-m*E)*k,e[15]=(u*w-f*A+h*E)*k,this}scale(e){const t=this.elements,i=e.x,r=e.y,s=e.z;return t[0]*=i,t[4]*=r,t[8]*=s,t[1]*=i,t[5]*=r,t[9]*=s,t[2]*=i,t[6]*=r,t[10]*=s,t[3]*=i,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,r))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),r=Math.sin(t),s=1-i,a=e.x,o=e.y,l=e.z,c=s*a,u=s*o;return this.set(c*a+i,c*o-r*l,c*l+r*o,0,c*o+r*l,u*o+i,u*l-r*a,0,c*l-r*o,u*l+r*a,s*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,r,s,a){return this.set(1,i,s,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,i){const r=this.elements,s=t._x,a=t._y,o=t._z,l=t._w,c=s+s,u=a+a,f=o+o,h=s*c,p=s*u,g=s*f,M=a*u,m=a*f,d=o*f,E=l*c,A=l*u,v=l*f,w=i.x,b=i.y,R=i.z;return r[0]=(1-(M+d))*w,r[1]=(p+v)*w,r[2]=(g-A)*w,r[3]=0,r[4]=(p-v)*b,r[5]=(1-(h+d))*b,r[6]=(m+E)*b,r[7]=0,r[8]=(g+A)*R,r[9]=(m-E)*R,r[10]=(1-(h+M))*R,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,i){const r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];const s=this.determinantAffine();if(s===0)return i.set(1,1,1),t.identity(),this;let a=Gi.set(r[0],r[1],r[2]).length();const o=Gi.set(r[4],r[5],r[6]).length(),l=Gi.set(r[8],r[9],r[10]).length();s<0&&(a=-a),Sn.copy(this);const c=1/a,u=1/o,f=1/l;return Sn.elements[0]*=c,Sn.elements[1]*=c,Sn.elements[2]*=c,Sn.elements[4]*=u,Sn.elements[5]*=u,Sn.elements[6]*=u,Sn.elements[8]*=f,Sn.elements[9]*=f,Sn.elements[10]*=f,t.setFromRotationMatrix(Sn),i.x=a,i.y=o,i.z=l,this}makePerspective(e,t,i,r,s,a,o=Nn,l=!1){const c=this.elements,u=2*s/(t-e),f=2*s/(i-r),h=(t+e)/(t-e),p=(i+r)/(i-r);let g,M;if(l)g=s/(a-s),M=a*s/(a-s);else if(o===Nn)g=-(a+s)/(a-s),M=-2*a*s/(a-s);else if(o===Hr)g=-a/(a-s),M=-a*s/(a-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=f,c[9]=p,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=M,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,i,r,s,a,o=Nn,l=!1){const c=this.elements,u=2/(t-e),f=2/(i-r),h=-(t+e)/(t-e),p=-(i+r)/(i-r);let g,M;if(l)g=1/(a-s),M=a/(a-s);else if(o===Nn)g=-2/(a-s),M=-(a+s)/(a-s);else if(o===Hr)g=-1/(a-s),M=-s/(a-s);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=f,c[9]=0,c[13]=p,c[2]=0,c[6]=0,c[10]=g,c[14]=M,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let r=0;r<16;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}};oa.prototype.isMatrix4=!0;let mt=oa;const Gi=new I,Sn=new mt,_f=new I(0,0,0),xf=new I(1,1,1),ti=new I,os=new I,sn=new I,pc=new mt,mc=new pr;class Kn{constructor(e=0,t=0,i=0,r=Kn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,r=this._order){return this._x=e,this._y=t,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const r=e.elements,s=r[0],a=r[4],o=r[8],l=r[1],c=r[5],u=r[9],f=r[2],h=r[6],p=r[10];switch(t){case"XYZ":this._y=Math.asin(Ye(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,p),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Ye(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-f,s),this._z=0);break;case"ZXY":this._x=Math.asin(Ye(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-f,p),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-Ye(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(h,p),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Ye(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-f,s)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-Ye(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-u,p),this._y=0);break;default:Ne("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return pc.makeRotationFromQuaternion(e),this.setFromRotationMatrix(pc,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return mc.setFromEuler(this),this.setFromQuaternion(mc,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Kn.DEFAULT_ORDER="XYZ";class qd{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let vf=0;const gc=new I,Hi=new pr,kn=new mt,ls=new I,xr=new I,Sf=new I,Mf=new pr,_c=new I(1,0,0),xc=new I(0,1,0),vc=new I(0,0,1),Sc={type:"added"},yf={type:"removed"},Vi={type:"childadded",child:null},La={type:"childremoved",child:null};class Lt extends Ni{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:vf++}),this.uuid=pi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Lt.DEFAULT_UP.clone();const e=new I,t=new Kn,i=new pr,r=new I(1,1,1);function s(){i.setFromEuler(t,!1)}function a(){t.setFromQuaternion(i,void 0,!1)}t._onChange(s),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new mt},normalMatrix:{value:new Fe}}),this.matrix=new mt,this.matrixWorld=new mt,this.matrixAutoUpdate=Lt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Lt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new qd,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Hi.setFromAxisAngle(e,t),this.quaternion.multiply(Hi),this}rotateOnWorldAxis(e,t){return Hi.setFromAxisAngle(e,t),this.quaternion.premultiply(Hi),this}rotateX(e){return this.rotateOnAxis(_c,e)}rotateY(e){return this.rotateOnAxis(xc,e)}rotateZ(e){return this.rotateOnAxis(vc,e)}translateOnAxis(e,t){return gc.copy(e).applyQuaternion(this.quaternion),this.position.add(gc.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(_c,e)}translateY(e){return this.translateOnAxis(xc,e)}translateZ(e){return this.translateOnAxis(vc,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(kn.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?ls.copy(e):ls.set(e,t,i);const r=this.parent;this.updateWorldMatrix(!0,!1),xr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?kn.lookAt(xr,ls,this.up):kn.lookAt(ls,xr,this.up),this.quaternion.setFromRotationMatrix(kn),r&&(kn.extractRotation(r.matrixWorld),Hi.setFromRotationMatrix(kn),this.quaternion.premultiply(Hi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Ke("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Sc),Vi.child=e,this.dispatchEvent(Vi),Vi.child=null):Ke("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(yf),La.child=e,this.dispatchEvent(La),La.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),kn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),kn.multiply(e.parent.matrixWorld)),e.applyMatrix4(kn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Sc),Vi.child=e,this.dispatchEvent(Vi),Vi.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,r=this.children.length;i<r;i++){const a=this.children[i].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(xr,e,Sf),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(xr,Mf,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);const t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const e=this.pivot;if(e!==null){const t=e.x,i=e.y,r=e.z,s=this.matrix.elements;s[12]+=t-s[0]*t-s[4]*i-s[8]*r,s[13]+=i-s[1]*t-s[5]*i-s[9]*r,s[14]+=r-s[2]*t-s[6]*i-s[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t,i=!1){const r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),t===!0){const s=this.children;for(let a=0,o=s.length;a<o;a++)s[a].updateWorldMatrix(!1,!0,i)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(o=>({...o})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function s(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const f=l[c];s(e.shapes,f)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(s(e.materials,this.material[l]));r.material=o}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let o=0;o<this.children.length;o++)r.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];r.animations.push(s(e.animations,l))}}if(t){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),u=a(e.images),f=a(e.shapes),h=a(e.skeletons),p=a(e.animations),g=a(e.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),u.length>0&&(i.images=u),f.length>0&&(i.shapes=f),h.length>0&&(i.skeletons=h),p.length>0&&(i.animations=p),g.length>0&&(i.nodes=g)}return i.object=r,i;function a(o){const l=[];for(const c in o){const u=o[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const r=e.children[i];this.add(r.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}Lt.DEFAULT_UP=new I(0,1,0);Lt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Lt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class Ti extends Lt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const bf={type:"move"};class Ia{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ti,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ti,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new I,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new I),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ti,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new I,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new I,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let r=null,s=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const M of e.hand.values()){const m=t.getJointPose(M,i),d=this._getHandJoint(c,M);m!==null&&(d.matrix.fromArray(m.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=m.radius),d.visible=m!==null}const u=c.joints["index-finger-tip"],f=c.joints["thumb-tip"],h=u.position.distanceTo(f.position),p=.02,g=.005;c.inputState.pinching&&h>p+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&h<=p-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,i),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(r=t.getPose(e.targetRaySpace,i),r===null&&s!==null&&(r=s),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(bf)))}return o!==null&&(o.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new Ti;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}const Yd={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ni={h:0,s:0,l:0},cs={h:0,s:0,l:0};function Na(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}class Le{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Qt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,qe.colorSpaceToWorking(this,t),this}setRGB(e,t,i,r=qe.workingColorSpace){return this.r=e,this.g=t,this.b=i,qe.colorSpaceToWorking(this,r),this}setHSL(e,t,i,r=qe.workingColorSpace){if(e=df(e,1),t=Ye(t,0,1),i=Ye(i,0,1),t===0)this.r=this.g=this.b=i;else{const s=i<=.5?i*(1+t):i+t-i*t,a=2*i-s;this.r=Na(a,s,e+1/3),this.g=Na(a,s,e),this.b=Na(a,s,e-1/3)}return qe.colorSpaceToWorking(this,r),this}setStyle(e,t=Qt){function i(s){s!==void 0&&parseFloat(s)<1&&Ne("Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const a=r[1],o=r[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:Ne("Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=r[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(s,16),t);Ne("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Qt){const i=Yd[e.toLowerCase()];return i!==void 0?this.setHex(i,t):Ne("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=qn(e.r),this.g=qn(e.g),this.b=qn(e.b),this}copyLinearToSRGB(e){return this.r=ar(e.r),this.g=ar(e.g),this.b=ar(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Qt){return qe.workingToColorSpace(Ht.copy(this),e),Math.round(Ye(Ht.r*255,0,255))*65536+Math.round(Ye(Ht.g*255,0,255))*256+Math.round(Ye(Ht.b*255,0,255))}getHexString(e=Qt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=qe.workingColorSpace){qe.workingToColorSpace(Ht.copy(this),t);const i=Ht.r,r=Ht.g,s=Ht.b,a=Math.max(i,r,s),o=Math.min(i,r,s);let l,c;const u=(o+a)/2;if(o===a)l=0,c=0;else{const f=a-o;switch(c=u<=.5?f/(a+o):f/(2-a-o),a){case i:l=(r-s)/f+(r<s?6:0);break;case r:l=(s-i)/f+2;break;case s:l=(i-r)/f+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=qe.workingColorSpace){return qe.workingToColorSpace(Ht.copy(this),t),e.r=Ht.r,e.g=Ht.g,e.b=Ht.b,e}getStyle(e=Qt){qe.workingToColorSpace(Ht.copy(this),e);const t=Ht.r,i=Ht.g,r=Ht.b;return e!==Qt?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,t,i){return this.getHSL(ni),this.setHSL(ni.h+e,ni.s+t,ni.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(ni),e.getHSL(cs);const i=Aa(ni.h,cs.h,t),r=Aa(ni.s,cs.s,t),s=Aa(ni.l,cs.l,t);return this.setHSL(i,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*i+s[6]*r,this.g=s[1]*t+s[4]*i+s[7]*r,this.b=s[2]*t+s[5]*i+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Ht=new Le;Le.NAMES=Yd;class ca{constructor(e,t=1,i=1e3){this.isFog=!0,this.name="",this.color=new Le(e),this.near=t,this.far=i}clone(){return new ca(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class Ef extends Lt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Kn,this.environmentIntensity=1,this.environmentRotation=new Kn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}}const Mn=new I,zn=new I,Ua=new I,Gn=new I,Wi=new I,Xi=new I,Mc=new I,Fa=new I,Oa=new I,Ba=new I,ka=new St,za=new St,Ga=new St;class mn{constructor(e=new I,t=new I,i=new I){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,r){r.subVectors(i,t),Mn.subVectors(e,t),r.cross(Mn);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,i,r,s){Mn.subVectors(r,t),zn.subVectors(i,t),Ua.subVectors(e,t);const a=Mn.dot(Mn),o=Mn.dot(zn),l=Mn.dot(Ua),c=zn.dot(zn),u=zn.dot(Ua),f=a*c-o*o;if(f===0)return s.set(0,0,0),null;const h=1/f,p=(c*l-o*u)*h,g=(a*u-o*l)*h;return s.set(1-p-g,g,p)}static containsPoint(e,t,i,r){return this.getBarycoord(e,t,i,r,Gn)===null?!1:Gn.x>=0&&Gn.y>=0&&Gn.x+Gn.y<=1}static getInterpolation(e,t,i,r,s,a,o,l){return this.getBarycoord(e,t,i,r,Gn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,Gn.x),l.addScaledVector(a,Gn.y),l.addScaledVector(o,Gn.z),l)}static getInterpolatedAttribute(e,t,i,r,s,a){return ka.setScalar(0),za.setScalar(0),Ga.setScalar(0),ka.fromBufferAttribute(e,t),za.fromBufferAttribute(e,i),Ga.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(ka,s.x),a.addScaledVector(za,s.y),a.addScaledVector(Ga,s.z),a}static isFrontFacing(e,t,i,r){return Mn.subVectors(i,t),zn.subVectors(e,t),Mn.cross(zn).dot(r)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,r){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,i,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Mn.subVectors(this.c,this.b),zn.subVectors(this.a,this.b),Mn.cross(zn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return mn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return mn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,r,s){return mn.getInterpolation(e,this.a,this.b,this.c,t,i,r,s)}containsPoint(e){return mn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return mn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,r=this.b,s=this.c;let a,o;Wi.subVectors(r,i),Xi.subVectors(s,i),Fa.subVectors(e,i);const l=Wi.dot(Fa),c=Xi.dot(Fa);if(l<=0&&c<=0)return t.copy(i);Oa.subVectors(e,r);const u=Wi.dot(Oa),f=Xi.dot(Oa);if(u>=0&&f<=u)return t.copy(r);const h=l*f-u*c;if(h<=0&&l>=0&&u<=0)return a=l/(l-u),t.copy(i).addScaledVector(Wi,a);Ba.subVectors(e,s);const p=Wi.dot(Ba),g=Xi.dot(Ba);if(g>=0&&p<=g)return t.copy(s);const M=p*c-l*g;if(M<=0&&c>=0&&g<=0)return o=c/(c-g),t.copy(i).addScaledVector(Xi,o);const m=u*g-p*f;if(m<=0&&f-u>=0&&p-g>=0)return Mc.subVectors(s,r),o=(f-u)/(f-u+(p-g)),t.copy(r).addScaledVector(Mc,o);const d=1/(m+M+h);return a=M*d,o=h*d,t.copy(i).addScaledVector(Wi,a).addScaledVector(Xi,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}class Zr{constructor(e=new I(1/0,1/0,1/0),t=new I(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(yn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(yn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=yn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const s=i.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=s.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,yn):yn.fromBufferAttribute(s,a),yn.applyMatrix4(e.matrixWorld),this.expandByPoint(yn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ds.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),ds.copy(i.boundingBox)),ds.applyMatrix4(e.matrixWorld),this.union(ds)}const r=e.children;for(let s=0,a=r.length;s<a;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,yn),yn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(vr),hs.subVectors(this.max,vr),qi.subVectors(e.a,vr),Yi.subVectors(e.b,vr),$i.subVectors(e.c,vr),ii.subVectors(Yi,qi),ri.subVectors($i,Yi),_i.subVectors(qi,$i);let t=[0,-ii.z,ii.y,0,-ri.z,ri.y,0,-_i.z,_i.y,ii.z,0,-ii.x,ri.z,0,-ri.x,_i.z,0,-_i.x,-ii.y,ii.x,0,-ri.y,ri.x,0,-_i.y,_i.x,0];return!Ha(t,qi,Yi,$i,hs)||(t=[1,0,0,0,1,0,0,0,1],!Ha(t,qi,Yi,$i,hs))?!1:(us.crossVectors(ii,ri),t=[us.x,us.y,us.z],Ha(t,qi,Yi,$i,hs))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,yn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(yn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Hn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Hn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Hn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Hn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Hn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Hn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Hn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Hn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Hn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Hn=[new I,new I,new I,new I,new I,new I,new I,new I],yn=new I,ds=new Zr,qi=new I,Yi=new I,$i=new I,ii=new I,ri=new I,_i=new I,vr=new I,hs=new I,us=new I,xi=new I;function Ha(n,e,t,i,r){for(let s=0,a=n.length-3;s<=a;s+=3){xi.fromArray(n,s);const o=r.x*Math.abs(xi.x)+r.y*Math.abs(xi.y)+r.z*Math.abs(xi.z),l=e.dot(xi),c=t.dot(xi),u=i.dot(xi);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}const At=new I,fs=new Ae;let wf=0;class Tn extends Ni{constructor(e,t,i=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:wf++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=Vd,this.updateRanges=[],this.gpuType=In,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)fs.fromBufferAttribute(this,t),fs.applyMatrix3(e),this.setXY(t,fs.x,fs.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)At.fromBufferAttribute(this,t),At.applyMatrix3(e),this.setXYZ(t,At.x,At.y,At.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)At.fromBufferAttribute(this,t),At.applyMatrix4(e),this.setXYZ(t,At.x,At.y,At.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)At.fromBufferAttribute(this,t),At.applyNormalMatrix(e),this.setXYZ(t,At.x,At.y,At.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)At.fromBufferAttribute(this,t),At.transformDirection(e),this.setXYZ(t,At.x,At.y,At.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=Ln(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=rt(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Ln(t,this.array)),t}setX(e,t){return this.normalized&&(t=rt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Ln(t,this.array)),t}setY(e,t){return this.normalized&&(t=rt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Ln(t,this.array)),t}setZ(e,t){return this.normalized&&(t=rt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Ln(t,this.array)),t}setW(e,t){return this.normalized&&(t=rt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=rt(t,this.array),i=rt(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,r){return e*=this.itemSize,this.normalized&&(t=rt(t,this.array),i=rt(i,this.array),r=rt(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,t,i,r,s){return e*=this.itemSize,this.normalized&&(t=rt(t,this.array),i=rt(i,this.array),r=rt(r,this.array),s=rt(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}}class $d extends Tn{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class Kd extends Tn{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class lt extends Tn{constructor(e,t,i){super(new Float32Array(e),t,i)}}const Tf=new Zr,Sr=new I,Va=new I;class Jr{constructor(e=new I,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):Tf.setFromPoints(e).getCenter(i);let r=0;for(let s=0,a=e.length;s<a;s++)r=Math.max(r,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Sr.subVectors(e,this.center);const t=Sr.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),r=(i-this.radius)*.5;this.center.addScaledVector(Sr,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Va.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Sr.copy(e.center).add(Va)),this.expandByPoint(Sr.copy(e.center).sub(Va))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}let Af=0;const un=new mt,Wa=new Lt,Ki=new I,an=new Zr,Mr=new Zr,Ft=new I;class Ct extends Ni{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Af++}),this.uuid=pi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(af(e)?Kd:$d)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const s=new Fe().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return un.makeRotationFromQuaternion(e),this.applyMatrix4(un),this}rotateX(e){return un.makeRotationX(e),this.applyMatrix4(un),this}rotateY(e){return un.makeRotationY(e),this.applyMatrix4(un),this}rotateZ(e){return un.makeRotationZ(e),this.applyMatrix4(un),this}translate(e,t,i){return un.makeTranslation(e,t,i),this.applyMatrix4(un),this}scale(e,t,i){return un.makeScale(e,t,i),this.applyMatrix4(un),this}lookAt(e){return Wa.lookAt(e),Wa.updateMatrix(),this.applyMatrix4(Wa.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ki).negate(),this.translate(Ki.x,Ki.y,Ki.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const i=[];for(let r=0,s=e.length;r<s;r++){const a=e[r];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new lt(i,3))}else{const i=Math.min(e.length,t.count);for(let r=0;r<i;r++){const s=e[r];t.setXYZ(r,s.x,s.y,s.z||0)}e.length>t.count&&Ne("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Zr);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ke("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new I(-1/0,-1/0,-1/0),new I(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,r=t.length;i<r;i++){const s=t[i];an.setFromBufferAttribute(s),this.morphTargetsRelative?(Ft.addVectors(this.boundingBox.min,an.min),this.boundingBox.expandByPoint(Ft),Ft.addVectors(this.boundingBox.max,an.max),this.boundingBox.expandByPoint(Ft)):(this.boundingBox.expandByPoint(an.min),this.boundingBox.expandByPoint(an.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ke('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Jr);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ke("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new I,1/0);return}if(e){const i=this.boundingSphere.center;if(an.setFromBufferAttribute(e),t)for(let s=0,a=t.length;s<a;s++){const o=t[s];Mr.setFromBufferAttribute(o),this.morphTargetsRelative?(Ft.addVectors(an.min,Mr.min),an.expandByPoint(Ft),Ft.addVectors(an.max,Mr.max),an.expandByPoint(Ft)):(an.expandByPoint(Mr.min),an.expandByPoint(Mr.max))}an.getCenter(i);let r=0;for(let s=0,a=e.count;s<a;s++)Ft.fromBufferAttribute(e,s),r=Math.max(r,i.distanceToSquared(Ft));if(t)for(let s=0,a=t.length;s<a;s++){const o=t[s],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)Ft.fromBufferAttribute(o,c),l&&(Ki.fromBufferAttribute(e,c),Ft.add(Ki)),r=Math.max(r,i.distanceToSquared(Ft))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&Ke('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Ke("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,r=t.normal,s=t.uv;let a=this.getAttribute("tangent");(a===void 0||a.count!==i.count)&&(a=new Tn(new Float32Array(4*i.count),4),this.setAttribute("tangent",a));const o=[],l=[];for(let _=0;_<i.count;_++)o[_]=new I,l[_]=new I;const c=new I,u=new I,f=new I,h=new Ae,p=new Ae,g=new Ae,M=new I,m=new I;function d(_,T,C){c.fromBufferAttribute(i,_),u.fromBufferAttribute(i,T),f.fromBufferAttribute(i,C),h.fromBufferAttribute(s,_),p.fromBufferAttribute(s,T),g.fromBufferAttribute(s,C),u.sub(c),f.sub(c),p.sub(h),g.sub(h);const D=1/(p.x*g.y-g.x*p.y);isFinite(D)&&(M.copy(u).multiplyScalar(g.y).addScaledVector(f,-p.y).multiplyScalar(D),m.copy(f).multiplyScalar(p.x).addScaledVector(u,-g.x).multiplyScalar(D),o[_].add(M),o[T].add(M),o[C].add(M),l[_].add(m),l[T].add(m),l[C].add(m))}let E=this.groups;E.length===0&&(E=[{start:0,count:e.count}]);for(let _=0,T=E.length;_<T;++_){const C=E[_],D=C.start,O=C.count;for(let H=D,F=D+O;H<F;H+=3)d(e.getX(H+0),e.getX(H+1),e.getX(H+2))}const A=new I,v=new I,w=new I,b=new I;function R(_){w.fromBufferAttribute(r,_),b.copy(w);const T=o[_];A.copy(T),A.sub(w.multiplyScalar(w.dot(T))).normalize(),v.crossVectors(b,T);const D=v.dot(l[_])<0?-1:1;a.setXYZW(_,A.x,A.y,A.z,D)}for(let _=0,T=E.length;_<T;++_){const C=E[_],D=C.start,O=C.count;for(let H=D,F=D+O;H<F;H+=3)R(e.getX(H+0)),R(e.getX(H+1)),R(e.getX(H+2))}this._transformed=!0}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==t.count)i=new Tn(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let h=0,p=i.count;h<p;h++)i.setXYZ(h,0,0,0);const r=new I,s=new I,a=new I,o=new I,l=new I,c=new I,u=new I,f=new I;if(e)for(let h=0,p=e.count;h<p;h+=3){const g=e.getX(h+0),M=e.getX(h+1),m=e.getX(h+2);r.fromBufferAttribute(t,g),s.fromBufferAttribute(t,M),a.fromBufferAttribute(t,m),u.subVectors(a,s),f.subVectors(r,s),u.cross(f),o.fromBufferAttribute(i,g),l.fromBufferAttribute(i,M),c.fromBufferAttribute(i,m),o.add(u),l.add(u),c.add(u),i.setXYZ(g,o.x,o.y,o.z),i.setXYZ(M,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let h=0,p=t.count;h<p;h+=3)r.fromBufferAttribute(t,h+0),s.fromBufferAttribute(t,h+1),a.fromBufferAttribute(t,h+2),u.subVectors(a,s),f.subVectors(r,s),u.cross(f),i.setXYZ(h+0,u.x,u.y,u.z),i.setXYZ(h+1,u.x,u.y,u.z),i.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Ft.fromBufferAttribute(e,t),Ft.normalize(),e.setXYZ(t,Ft.x,Ft.y,Ft.z)}toNonIndexed(){function e(o,l){const c=o.array,u=o.itemSize,f=o.normalized,h=new c.constructor(l.length*u);let p=0,g=0;for(let M=0,m=l.length;M<m;M++){o.isInterleavedBufferAttribute?p=l[M]*o.data.stride+o.offset:p=l[M]*u;for(let d=0;d<u;d++)h[g++]=c[p++]}return new Tn(h,u,f)}if(this.index===null)return Ne("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Ct,i=this.index.array,r=this.attributes;for(const o in r){const l=r[o],c=e(l,i);t.setAttribute(o,c)}const s=this.morphAttributes;for(const o in s){const l=[],c=s[o];for(let u=0,f=c.length;u<f;u++){const h=c[u],p=e(h,i);l.push(p)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const l in i){const c=i[l];e.data.attributes[l]=c.toJSON(e.data)}const r={};let s=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let f=0,h=c.length;f<h;f++){const p=c[f];u.push(p.toJSON(e.data))}u.length>0&&(r[l]=u,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone());const r=e.attributes;for(const c in r){const u=r[c];this.setAttribute(c,u.clone(t))}const s=e.morphAttributes;for(const c in s){const u=[],f=s[c];for(let h=0,p=f.length;h<p;h++)u.push(f[h].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,u=a.length;c<u;c++){const f=a[c];this.addGroup(f.start,f.count,f.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Rf{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Vd,this.updateRanges=[],this.version=0,this.uuid=pi()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let r=0,s=this.stride;r<s;r++)this.array[e+r]=t.array[i+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=pi()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=pi()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));const t={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return t.usage=this.usage,t}}const Zt=new I;class js{constructor(e,t,i,r=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)Zt.fromBufferAttribute(this,t),Zt.applyMatrix4(e),this.setXYZ(t,Zt.x,Zt.y,Zt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Zt.fromBufferAttribute(this,t),Zt.applyNormalMatrix(e),this.setXYZ(t,Zt.x,Zt.y,Zt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Zt.fromBufferAttribute(this,t),Zt.transformDirection(e),this.setXYZ(t,Zt.x,Zt.y,Zt.z);return this}getComponent(e,t){let i=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(i=Ln(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=rt(i,this.array)),this.data.array[e*this.data.stride+this.offset+t]=i,this}setX(e,t){return this.normalized&&(t=rt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=rt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=rt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=rt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Ln(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Ln(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Ln(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Ln(t,this.array)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=rt(t,this.array),i=rt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=rt(t,this.array),i=rt(i,this.array),r=rt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this}setXYZW(e,t,i,r,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=rt(t,this.array),i=rt(i,this.array),r=rt(r,this.array),s=rt(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this.data.array[e+3]=s,this}clone(e){if(e===void 0){Qs("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return new Tn(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new js(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){Qs("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}const Xa=new I,Cf=new I,Pf=new Fe;class ai{constructor(e=new I(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,r){return this.normal.set(e,t,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const r=Xa.subVectors(i,t).cross(Cf.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,i=!0){const r=e.delta(Xa),s=this.normal.dot(r);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const a=-(e.start.dot(this.normal)+this.constant)/s;return i===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||Pf.getNormalMatrix(e),r=this.coplanarPoint(Xa).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}}let Df=0;class Jn extends Ni{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Df++}),this.uuid=pi(),this.name="",this.type="Material",this.blending=Nr,this.side=Ri,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Td,this.blendDst=Ad,this.blendEquation=ir,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Le(0,0,0),this.blendAlpha=0,this.depthFunc=kr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Qu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=wa,this.stencilZFail=wa,this.stencilZPass=wa,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){Ne(`Material: parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){Ne(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector2&&i&&i.isVector2||r&&r.isEuler&&i&&i.isEuler||r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(i.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(i.clippingPlanes=this.clippingPlanes.map(s=>s.toJSON())),this.rotation!==void 0&&(i.rotation=this.rotation),this.depthPacking!==void 0&&(i.depthPacking=this.depthPacking),this.linewidth!==void 0&&(i.linewidth=this.linewidth),this.linecap!==void 0&&(i.linecap=this.linecap),this.linejoin!==void 0&&(i.linejoin=this.linejoin),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.wireframe!==void 0&&(i.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(i.flatShading=this.flatShading),this.fog!==void 0&&(i.fog=this.fog),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(s){const a=[];for(const o in s){const l=s[o];delete l.metadata,a.push(l)}return a}if(t){const s=r(e.textures),a=r(e.images);s.length>0&&(i.textures=s),a.length>0&&(i.images=a)}return i}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Le().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(i=>new ai().fromJSON(i))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let i=e.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new Ae().fromArray(i)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Ae().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const r=t.length;i=new Array(r);for(let s=0;s!==r;++s)i[s]=t[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class Zd extends Jn{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Le(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let Zi;const yr=new I,Ji=new I,Qi=new I,ji=new Ae,br=new Ae,Jd=new mt,ps=new I,Er=new I,ms=new I,yc=new Ae,qa=new Ae,bc=new Ae;class Lf extends Lt{constructor(e=new Zd){if(super(),this.isSprite=!0,this.type="Sprite",Zi===void 0){Zi=new Ct;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new Rf(t,5);Zi.setIndex([0,1,2,0,2,3]),Zi.setAttribute("position",new js(i,3,0,!1)),Zi.setAttribute("uv",new js(i,2,3,!1))}this.geometry=Zi,this.material=e,this.center=new Ae(.5,.5),this.count=1}intersectsFrustum(e){return e.intersectsSprite(this)}raycast(e,t){e.camera===null&&Ke('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Ji.setFromMatrixScale(this.matrixWorld),Jd.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Qi.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Ji.multiplyScalar(-Qi.z);const i=this.material.rotation;let r,s;i!==0&&(s=Math.cos(i),r=Math.sin(i));const a=this.center;gs(ps.set(-.5,-.5,0),Qi,a,Ji,r,s),gs(Er.set(.5,-.5,0),Qi,a,Ji,r,s),gs(ms.set(.5,.5,0),Qi,a,Ji,r,s),yc.set(0,0),qa.set(1,0),bc.set(1,1);let o=e.ray.intersectTriangle(ps,Er,ms,!1,yr);if(o===null&&(gs(Er.set(-.5,.5,0),Qi,a,Ji,r,s),qa.set(0,1),o=e.ray.intersectTriangle(ps,ms,Er,!1,yr),o===null))return;const l=e.ray.origin.distanceTo(yr);l<e.near||l>e.far||t.push({distance:l,point:yr.clone(),uv:mn.getInterpolation(yr,ps,Er,ms,yc,qa,bc,new Ae),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function gs(n,e,t,i,r,s){ji.subVectors(n,t).addScalar(.5).multiply(i),r!==void 0?(br.x=s*ji.x-r*ji.y,br.y=r*ji.x+s*ji.y):br.copy(ji),n.copy(e),n.x+=br.x,n.y+=br.y,n.applyMatrix4(Jd)}const Vn=new I,Ya=new I,_s=new I,xs=new I;class bl{constructor(e=new I,t=new I(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Vn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Vn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Vn.copy(this.origin).addScaledVector(this.direction,t),Vn.distanceToSquared(e))}distanceSqToSegment(e,t,i,r){Ya.copy(e).add(t).multiplyScalar(.5),_s.copy(t).sub(e).normalize(),xs.copy(this.origin).sub(Ya);const s=e.distanceTo(t)*.5,a=-this.direction.dot(_s),o=xs.dot(this.direction),l=-xs.dot(_s),c=xs.lengthSq(),u=Math.abs(1-a*a);let f,h,p,g;if(u>0)if(f=a*l-o,h=a*o-l,g=s*u,f>=0)if(h>=-g)if(h<=g){const M=1/u;f*=M,h*=M,p=f*(f+a*h+2*o)+h*(a*f+h+2*l)+c}else h=s,f=Math.max(0,-(a*h+o)),p=-f*f+h*(h+2*l)+c;else h=-s,f=Math.max(0,-(a*h+o)),p=-f*f+h*(h+2*l)+c;else h<=-g?(f=Math.max(0,-(-a*s+o)),h=f>0?-s:Math.min(Math.max(-s,-l),s),p=-f*f+h*(h+2*l)+c):h<=g?(f=0,h=Math.min(Math.max(-s,-l),s),p=h*(h+2*l)+c):(f=Math.max(0,-(a*s+o)),h=f>0?s:Math.min(Math.max(-s,-l),s),p=-f*f+h*(h+2*l)+c);else h=a>0?-s:s,f=Math.max(0,-(a*h+o)),p=-f*f+h*(h+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,f),r&&r.copy(Ya).addScaledVector(_s,h),p}intersectSphere(e,t){if(e.radius<0)return null;Vn.subVectors(e.center,this.origin);const i=Vn.dot(this.direction),r=Vn.dot(Vn)-i*i,s=e.radius*e.radius;if(r>s)return null;const a=Math.sqrt(s-r),o=i-a,l=i+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,r,s,a,o,l;const c=1/this.direction.x,u=1/this.direction.y,f=1/this.direction.z,h=this.origin;return c>=0?(i=(e.min.x-h.x)*c,r=(e.max.x-h.x)*c):(i=(e.max.x-h.x)*c,r=(e.min.x-h.x)*c),u>=0?(s=(e.min.y-h.y)*u,a=(e.max.y-h.y)*u):(s=(e.max.y-h.y)*u,a=(e.min.y-h.y)*u),i>a||s>r||((s>i||isNaN(i))&&(i=s),(a<r||isNaN(r))&&(r=a),f>=0?(o=(e.min.z-h.z)*f,l=(e.max.z-h.z)*f):(o=(e.max.z-h.z)*f,l=(e.min.z-h.z)*f),i>l||o>r)||((o>i||i!==i)&&(i=o),(l<r||r!==r)&&(r=l),r<0)?null:this.at(i>=0?i:r,t)}intersectsBox(e){return this.intersectBox(e,Vn)!==null}intersectTriangle(e,t,i,r,s){const a=this.origin,o=this.direction,l=o.x,c=o.y,u=o.z,f=e.x-a.x,h=e.y-a.y,p=e.z-a.z,g=t.x-a.x,M=t.y-a.y,m=t.z-a.z,d=i.x-a.x,E=i.y-a.y,A=i.z-a.z,v=Math.abs(l),w=Math.abs(c),b=Math.abs(u);let R,_,T,C,D,O,H,F,k,X,S,Q;if(v>=w&&v>=b?(T=l,O=f,k=g,Q=d,l>=0?(R=c,_=u,C=h,D=p,H=M,F=m,X=E,S=A):(R=u,_=c,C=p,D=h,H=m,F=M,X=A,S=E)):w>=b?(T=c,O=h,k=M,Q=E,c>=0?(R=u,_=l,C=p,D=f,H=m,F=g,X=A,S=d):(R=l,_=u,C=f,D=p,H=g,F=m,X=d,S=A)):(T=u,O=p,k=m,Q=A,u>=0?(R=l,_=c,C=f,D=h,H=g,F=M,X=d,S=E):(R=c,_=l,C=h,D=f,H=M,F=g,X=E,S=d)),T===0)return null;const W=R/T,j=_/T,ee=1/T,ie=C-W*O,se=D-j*O,Me=H-W*k,ve=F-j*k,Ue=X-W*Q,Y=S-j*Q,Z=Ue*ve-Y*Me,le=ie*Y-se*Ue,De=Me*se-ve*ie;if(r){if(Z<0||le<0||De<0)return null}else if((Z<0||le<0||De<0)&&(Z>0||le>0||De>0))return null;const _e=Z+le+De;if(_e===0)return null;const He=ee*(Z*O+le*k+De*Q);return(_e>0?He<0:He>0)?null:this.at(He/_e,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class mi extends Jn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Le(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Kn,this.combine=fl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Ec=new mt,vi=new bl,vs=new Jr,wc=new I,Ss=new I,Ms=new I,ys=new I,$a=new I,bs=new I,Tc=new I,Es=new I;class bt extends Lt{constructor(e=new Ct,t=new mi){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){const o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}getVertexPosition(e,t){const i=this.geometry,r=i.attributes.position,s=i.morphAttributes.position,a=i.morphTargetsRelative;t.fromBufferAttribute(r,e);const o=this.morphTargetInfluences;if(s&&o){bs.set(0,0,0);for(let l=0,c=s.length;l<c;l++){const u=o[l],f=s[l];u!==0&&($a.fromBufferAttribute(f,e),a?bs.addScaledVector($a,u):bs.addScaledVector($a.sub(t),u))}t.add(bs)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){const i=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),vs.copy(i.boundingSphere),vs.applyMatrix4(s),vi.copy(e.ray).recast(e.near),!(vs.containsPoint(vi.origin)===!1&&(vi.intersectSphere(vs,wc)===null||vi.origin.distanceToSquared(wc)>(e.far-e.near)**2))&&(Ec.copy(s).invert(),vi.copy(e.ray).applyMatrix4(Ec),!(i.boundingBox!==null&&vi.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,vi)))}_computeIntersections(e,t,i){let r;const s=this.geometry,a=this.material,o=s.index,l=s.attributes.position,c=s.attributes.uv,u=s.attributes.uv1,f=s.attributes.normal,h=s.groups,p=s.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,M=h.length;g<M;g++){const m=h[g],d=a[m.materialIndex],E=Math.max(m.start,p.start),A=Math.min(o.count,Math.min(m.start+m.count,p.start+p.count));for(let v=E,w=A;v<w;v+=3){const b=o.getX(v),R=o.getX(v+1),_=o.getX(v+2);r=ws(this,d,e,i,c,u,f,b,R,_),r&&(r.faceIndex=Math.floor(v/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{const g=Math.max(0,p.start),M=Math.min(o.count,p.start+p.count);for(let m=g,d=M;m<d;m+=3){const E=o.getX(m),A=o.getX(m+1),v=o.getX(m+2);r=ws(this,a,e,i,c,u,f,E,A,v),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,M=h.length;g<M;g++){const m=h[g],d=a[m.materialIndex],E=Math.max(m.start,p.start),A=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let v=E,w=A;v<w;v+=3){const b=v,R=v+1,_=v+2;r=ws(this,d,e,i,c,u,f,b,R,_),r&&(r.faceIndex=Math.floor(v/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{const g=Math.max(0,p.start),M=Math.min(l.count,p.start+p.count);for(let m=g,d=M;m<d;m+=3){const E=m,A=m+1,v=m+2;r=ws(this,a,e,i,c,u,f,E,A,v),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}}}function If(n,e,t,i,r,s,a,o){let l;if(e.side===nn?l=i.intersectTriangle(a,s,r,!0,o):l=i.intersectTriangle(r,s,a,e.side===Ri,o),l===null)return null;Es.copy(o),Es.applyMatrix4(n.matrixWorld);const c=t.ray.origin.distanceTo(Es);return c<t.near||c>t.far?null:{distance:c,point:Es.clone(),object:n}}function ws(n,e,t,i,r,s,a,o,l,c){n.getVertexPosition(o,Ss),n.getVertexPosition(l,Ms),n.getVertexPosition(c,ys);const u=If(n,e,t,i,Ss,Ms,ys,Tc);if(u){const f=new I;mn.getBarycoord(Tc,Ss,Ms,ys,f),r&&(u.uv=mn.getInterpolatedAttribute(r,o,l,c,f,new Ae)),s&&(u.uv1=mn.getInterpolatedAttribute(s,o,l,c,f,new Ae)),a&&(u.normal=mn.getInterpolatedAttribute(a,o,l,c,f,new I),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));const h={a:o,b:l,c,normal:new I,materialIndex:0};mn.getNormal(Ss,Ms,ys,h.normal),u.face=h,u.barycoord=f}return u}class Nf extends $t{constructor(e=null,t=1,i=1,r,s,a,o,l,c=Bt,u=Bt,f,h){super(null,a,o,l,c,u,r,s,f,h),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Si=new Jr,Uf=new Ae(.5,.5),Ts=new I;class El{constructor(e=new ai,t=new ai,i=new ai,r=new ai,s=new ai,a=new ai){this.planes=[e,t,i,r,s,a]}set(e,t,i,r,s,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(i),o[3].copy(r),o[4].copy(s),o[5].copy(a),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=Nn,i=!1){const r=this.planes,s=e.elements,a=s[0],o=s[1],l=s[2],c=s[3],u=s[4],f=s[5],h=s[6],p=s[7],g=s[8],M=s[9],m=s[10],d=s[11],E=s[12],A=s[13],v=s[14],w=s[15];if(r[0].setComponents(c-a,p-u,d-g,w-E).normalize(),r[1].setComponents(c+a,p+u,d+g,w+E).normalize(),r[2].setComponents(c+o,p+f,d+M,w+A).normalize(),r[3].setComponents(c-o,p-f,d-M,w-A).normalize(),i)r[4].setComponents(l,h,m,v).normalize(),r[5].setComponents(c-l,p-h,d-m,w-v).normalize();else if(r[4].setComponents(c-l,p-h,d-m,w-v).normalize(),t===Nn)r[5].setComponents(c+l,p+h,d+m,w+v).normalize();else if(t===Hr)r[5].setComponents(l,h,m,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Si.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Si.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Si)}intersectsSprite(e){Si.center.set(0,0,0);const t=Uf.distanceTo(e.center);return Si.radius=.7071067811865476+t,Si.applyMatrix4(e.matrixWorld),this.intersectsSphere(Si)}intersectsSphere(e){const t=this.planes,i=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const r=t[i];if(Ts.x=r.normal.x>0?e.max.x:e.min.x,Ts.y=r.normal.y>0?e.max.y:e.min.y,Ts.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Ts)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Qd extends Jn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Le(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const ea=new I,ta=new I,Ac=new mt,wr=new bl,As=new Jr,Ka=new I,Rc=new I;class Ff extends Lt{constructor(e=new Ct,t=new Qd){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[0];for(let r=1,s=t.count;r<s;r++)ea.fromBufferAttribute(t,r-1),ta.fromBufferAttribute(t,r),i[r]=i[r-1],i[r]+=ea.distanceTo(ta);e.setAttribute("lineDistance",new lt(i,1))}else Ne("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){const i=this.geometry,r=this.matrixWorld,s=e.params.Line.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),As.copy(i.boundingSphere),As.applyMatrix4(r),As.radius+=s,e.ray.intersectsSphere(As)===!1)return;Ac.copy(r).invert(),wr.copy(e.ray).applyMatrix4(Ac);const o=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,u=i.index,h=i.attributes.position;if(u!==null){const p=Math.max(0,a.start),g=Math.min(u.count,a.start+a.count);for(let M=p,m=g-1;M<m;M+=c){const d=u.getX(M),E=u.getX(M+1),A=Rs(this,e,wr,l,d,E,M);A&&t.push(A)}if(this.isLineLoop){const M=u.getX(g-1),m=u.getX(p),d=Rs(this,e,wr,l,M,m,g-1);d&&t.push(d)}}else{const p=Math.max(0,a.start),g=Math.min(h.count,a.start+a.count);for(let M=p,m=g-1;M<m;M+=c){const d=Rs(this,e,wr,l,M,M+1,M);d&&t.push(d)}if(this.isLineLoop){const M=Rs(this,e,wr,l,g-1,p,g-1);M&&t.push(M)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){const o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}}function Rs(n,e,t,i,r,s,a){const o=n.geometry.attributes.position;if(ea.fromBufferAttribute(o,r),ta.fromBufferAttribute(o,s),t.distanceSqToSegment(ea,ta,Ka,Rc)>i)return;Ka.applyMatrix4(n.matrixWorld);const c=e.ray.origin.distanceTo(Ka);if(!(c<e.near||c>e.far))return{distance:c,point:Rc.clone().applyMatrix4(n.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:n}}class jd extends Jn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Le(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const Cc=new mt,el=new bl,Cs=new Jr,Ps=new I;class Of extends Lt{constructor(e=new Ct,t=new jd){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){const i=this.geometry,r=this.matrixWorld,s=e.params.Points.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Cs.copy(i.boundingSphere),Cs.applyMatrix4(r),Cs.radius+=s,e.ray.intersectsSphere(Cs)===!1)return;Cc.copy(r).invert(),el.copy(e.ray).applyMatrix4(Cc);const o=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=i.index,f=i.attributes.position;if(c!==null){const h=Math.max(0,a.start),p=Math.min(c.count,a.start+a.count);for(let g=h,M=p;g<M;g++){const m=c.getX(g);Ps.fromBufferAttribute(f,m),Pc(Ps,m,l,r,e,t,this)}}else{const h=Math.max(0,a.start),p=Math.min(f.count,a.start+a.count);for(let g=h,M=p;g<M;g++)Ps.fromBufferAttribute(f,g),Pc(Ps,g,l,r,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){const o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}}function Pc(n,e,t,i,r,s,a){const o=el.distanceSqToPoint(n);if(o<t){const l=new I;el.closestPointToPoint(n,l),l.applyMatrix4(i);const c=r.ray.origin.distanceTo(l);if(c<r.near||c>r.far)return;s.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}class eh extends $t{constructor(e=[],t=Ci,i,r,s,a,o,l,c,u){super(e,t,i,r,s,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class da extends $t{constructor(e,t,i,r,s,a,o,l,c){super(e,t,i,r,s,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Vr extends $t{constructor(e,t,i=On,r,s,a,o=Bt,l=Bt,c,u=$n,f=1){if(u!==$n&&u!==wi)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const h={width:e,height:t,depth:f};super(h,r,s,a,o,l,u,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new yl(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}}class Bf extends Vr{constructor(e,t=On,i=Ci,r,s,a=Bt,o=Bt,l,c=$n){const u={width:e,height:e,depth:1},f=[u,u,u,u,u,u];super(e,e,t,i,r,s,a,o,l,c),this.image=f,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class th extends $t{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Ui extends Ct{constructor(e=1,t=1,i=1,r=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:r,heightSegments:s,depthSegments:a};const o=this;r=Math.floor(r),s=Math.floor(s),a=Math.floor(a);const l=[],c=[],u=[],f=[];let h=0,p=0;g("z","y","x",-1,-1,i,t,e,a,s,0),g("z","y","x",1,-1,i,t,-e,a,s,1),g("x","z","y",1,1,e,i,t,r,a,2),g("x","z","y",1,-1,e,i,-t,r,a,3),g("x","y","z",1,-1,e,t,i,r,s,4),g("x","y","z",-1,-1,e,t,-i,r,s,5),this.setIndex(l),this.setAttribute("position",new lt(c,3)),this.setAttribute("normal",new lt(u,3)),this.setAttribute("uv",new lt(f,2));function g(M,m,d,E,A,v,w,b,R,_,T){const C=v/R,D=w/_,O=v/2,H=w/2,F=b/2,k=R+1,X=_+1;let S=0,Q=0;const W=new I;for(let j=0;j<X;j++){const ee=j*D-H;for(let ie=0;ie<k;ie++){const se=ie*C-O;W[M]=se*E,W[m]=ee*A,W[d]=F,c.push(W.x,W.y,W.z),W[M]=0,W[m]=0,W[d]=b>0?1:-1,u.push(W.x,W.y,W.z),f.push(ie/R),f.push(1-j/_),S+=1}}for(let j=0;j<_;j++)for(let ee=0;ee<R;ee++){const ie=h+ee+k*j,se=h+ee+k*(j+1),Me=h+(ee+1)+k*(j+1),ve=h+(ee+1)+k*j;l.push(ie,se,ve),l.push(se,Me,ve),Q+=6}o.addGroup(p,Q,T),p+=Q,h+=S}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ui(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}class wl extends Ct{constructor(e=1,t=32,i=0,r=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:i,thetaLength:r},t=Math.max(3,t);const s=[],a=[],o=[],l=[],c=new I,u=new Ae;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let f=0,h=3;f<=t;f++,h+=3){const p=i+f/t*r;c.x=e*Math.cos(p),c.y=e*Math.sin(p),a.push(c.x,c.y,c.z),o.push(0,0,1),u.x=(a[h]/e+1)/2,u.y=(a[h+1]/e+1)/2,l.push(u.x,u.y)}for(let f=1;f<=t;f++)s.push(f,f+1,0);this.setIndex(s),this.setAttribute("position",new lt(a,3)),this.setAttribute("normal",new lt(o,3)),this.setAttribute("uv",new lt(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new wl(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class Tl extends Ct{constructor(e=1,t=1,i=1,r=32,s=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:r,heightSegments:s,openEnded:a,thetaStart:o,thetaLength:l};const c=this;r=Math.floor(r),s=Math.floor(s);const u=[],f=[],h=[],p=[];let g=0;const M=[],m=i/2;let d=0;E(),a===!1&&(e>0&&A(!0),t>0&&A(!1)),this.setIndex(u),this.setAttribute("position",new lt(f,3)),this.setAttribute("normal",new lt(h,3)),this.setAttribute("uv",new lt(p,2));function E(){const v=new I,w=new I;let b=0;const R=(t-e)/i;for(let _=0;_<=s;_++){const T=[],C=_/s,D=C*(t-e)+e;for(let O=0;O<=r;O++){const H=O/r,F=H*l+o,k=Math.sin(F),X=Math.cos(F);w.x=D*k,w.y=-C*i+m,w.z=D*X,f.push(w.x,w.y,w.z),v.set(k,R,X).normalize(),h.push(v.x,v.y,v.z),p.push(H,1-C),T.push(g++)}M.push(T)}for(let _=0;_<r;_++)for(let T=0;T<s;T++){const C=M[T][_],D=M[T+1][_],O=M[T+1][_+1],H=M[T][_+1];(e>0||T!==0)&&(u.push(C,D,H),b+=3),(t>0||T!==s-1)&&(u.push(D,O,H),b+=3)}c.addGroup(d,b,0),d+=b}function A(v){const w=g,b=new Ae,R=new I;let _=0;const T=v===!0?e:t,C=v===!0?1:-1;for(let O=1;O<=r;O++)f.push(0,m*C,0),h.push(0,C,0),p.push(.5,.5),g++;const D=g;for(let O=0;O<=r;O++){const F=O/r*l+o,k=Math.cos(F),X=Math.sin(F);R.x=T*X,R.y=m*C,R.z=T*k,f.push(R.x,R.y,R.z),h.push(0,C,0),b.x=k*.5+.5,b.y=X*.5*C+.5,p.push(b.x,b.y),g++}for(let O=0;O<r;O++){const H=w+O,F=D+O;v===!0?u.push(F,F+1,H):u.push(F+1,F,H),_+=3}c.addGroup(d,_,v===!0?1:2),d+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Tl(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Al extends Ct{constructor(e=[],t=[],i=1,r=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:i,detail:r};const s=[],a=[];o(r),c(i),u(),this.setAttribute("position",new lt(s,3)),this.setAttribute("normal",new lt(s.slice(),3)),this.setAttribute("uv",new lt(a,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(E){const A=new I,v=new I,w=new I;for(let b=0;b<t.length;b+=3)p(t[b+0],A),p(t[b+1],v),p(t[b+2],w),l(A,v,w,E)}function l(E,A,v,w){const b=w+1,R=[];for(let _=0;_<=b;_++){R[_]=[];const T=E.clone().lerp(v,_/b),C=A.clone().lerp(v,_/b),D=b-_;for(let O=0;O<=D;O++)O===0&&_===b?R[_][O]=T:R[_][O]=T.clone().lerp(C,O/D)}for(let _=0;_<b;_++)for(let T=0;T<2*(b-_)-1;T++){const C=Math.floor(T/2);T%2===0?(h(R[_][C+1]),h(R[_+1][C]),h(R[_][C])):(h(R[_][C+1]),h(R[_+1][C+1]),h(R[_+1][C]))}}function c(E){const A=new I;for(let v=0;v<s.length;v+=3)A.x=s[v+0],A.y=s[v+1],A.z=s[v+2],A.normalize().multiplyScalar(E),s[v+0]=A.x,s[v+1]=A.y,s[v+2]=A.z}function u(){const E=new I;for(let A=0;A<s.length;A+=3){E.x=s[A+0],E.y=s[A+1],E.z=s[A+2];const v=m(E)/2/Math.PI+.5,w=d(E)/Math.PI+.5;a.push(v,1-w)}g(),f()}function f(){for(let E=0;E<a.length;E+=6){const A=a[E+0],v=a[E+2],w=a[E+4],b=Math.max(A,v,w),R=Math.min(A,v,w);b>.9&&R<.1&&(A<.2&&(a[E+0]+=1),v<.2&&(a[E+2]+=1),w<.2&&(a[E+4]+=1))}}function h(E){s.push(E.x,E.y,E.z)}function p(E,A){const v=E*3;A.x=e[v+0],A.y=e[v+1],A.z=e[v+2]}function g(){const E=new I,A=new I,v=new I,w=new I,b=new Ae,R=new Ae,_=new Ae;for(let T=0,C=0;T<s.length;T+=9,C+=6){E.set(s[T+0],s[T+1],s[T+2]),A.set(s[T+3],s[T+4],s[T+5]),v.set(s[T+6],s[T+7],s[T+8]),b.set(a[C+0],a[C+1]),R.set(a[C+2],a[C+3]),_.set(a[C+4],a[C+5]),w.copy(E).add(A).add(v).divideScalar(3);const D=m(w);M(b,C+0,E,D),M(R,C+2,A,D),M(_,C+4,v,D)}}function M(E,A,v,w){w<0&&E.x===1&&(a[A]=E.x-1),v.x===0&&v.z===0&&(a[A]=w/2/Math.PI+.5)}function m(E){return Math.atan2(E.z,-E.x)}function d(E){return Math.atan2(-E.y,Math.sqrt(E.x*E.x+E.z*E.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Al(e.vertices,e.indices,e.radius,e.detail)}}class Rl extends Al{constructor(e=1,t=0){const i=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],r=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(i,r,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new Rl(e.radius,e.detail)}}class Fi extends Ct{constructor(e=1,t=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:r};const s=e/2,a=t/2,o=Math.floor(i),l=Math.floor(r),c=o+1,u=l+1,f=e/o,h=t/l,p=[],g=[],M=[],m=[];for(let d=0;d<u;d++){const E=d*h-a;for(let A=0;A<c;A++){const v=A*f-s;g.push(v,-E,0),M.push(0,0,1),m.push(A/o),m.push(1-d/l)}}for(let d=0;d<l;d++)for(let E=0;E<o;E++){const A=E+c*d,v=E+c*(d+1),w=E+1+c*(d+1),b=E+1+c*d;p.push(A,v,b),p.push(v,w,b)}this.setIndex(p),this.setAttribute("position",new lt(g,3)),this.setAttribute("normal",new lt(M,3)),this.setAttribute("uv",new lt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Fi(e.width,e.height,e.widthSegments,e.heightSegments)}}class Oi extends Ct{constructor(e=.5,t=1,i=32,r=1,s=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:r,thetaStart:s,thetaLength:a},i=Math.max(3,i),r=Math.max(1,r);const o=[],l=[],c=[],u=[];let f=e;const h=(t-e)/r,p=new I,g=new Ae;for(let M=0;M<=r;M++){for(let m=0;m<=i;m++){const d=s+m/i*a;p.x=f*Math.cos(d),p.y=f*Math.sin(d),l.push(p.x,p.y,p.z),c.push(0,0,1),g.x=(p.x/t+1)/2,g.y=(p.y/t+1)/2,u.push(g.x,g.y)}f+=h}for(let M=0;M<r;M++){const m=M*(i+1);for(let d=0;d<i;d++){const E=d+m,A=E,v=E+i+1,w=E+i+2,b=E+1;o.push(A,v,b),o.push(v,w,b)}}this.setIndex(o),this.setAttribute("position",new lt(l,3)),this.setAttribute("normal",new lt(c,3)),this.setAttribute("uv",new lt(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Oi(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class Cl extends Ct{constructor(e=1,t=32,i=16,r=0,s=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:r,phiLength:s,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));const l=Math.min(a+o,Math.PI);let c=0;const u=[],f=new I,h=new I,p=[],g=[],M=[],m=[];for(let d=0;d<=i;d++){const E=[],A=d/i,v=a+A*o,w=e*Math.cos(v),b=Math.sqrt(e*e-w*w);let R=0;d===0&&a===0?R=.5/t:d===i&&l===Math.PI&&(R=-.5/t);for(let _=0;_<=t;_++){const T=_/t,C=r+T*s;f.x=-b*Math.cos(C),f.y=w,f.z=b*Math.sin(C),g.push(f.x,f.y,f.z),h.copy(f).normalize(),M.push(h.x,h.y,h.z),m.push(T+R,1-A),E.push(c++)}u.push(E)}for(let d=0;d<i;d++)for(let E=0;E<t;E++){const A=u[d][E+1],v=u[d][E],w=u[d+1][E],b=u[d+1][E+1];(d!==0||a>0)&&p.push(A,v,b),(d!==i-1||l<Math.PI)&&p.push(v,w,b)}this.setIndex(p),this.setAttribute("position",new lt(g,3)),this.setAttribute("normal",new lt(M,3)),this.setAttribute("uv",new lt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Cl(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}function lr(n){const e={};for(const t in n){e[t]={};for(const i in n[t]){const r=n[t][i];if(Dc(r))r.isRenderTargetTexture?(Ne("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=r.clone();else if(Array.isArray(r))if(Dc(r[0])){const s=[];for(let a=0,o=r.length;a<o;a++)s[a]=r[a].clone();e[t][i]=s}else e[t][i]=r.slice();else e[t][i]=r}}return e}function Jt(n){const e={};for(let t=0;t<n.length;t++){const i=lr(n[t]);for(const r in i)e[r]=i[r]}return e}function Dc(n){return n&&(n.isColor||n.isMatrix3||n.isMatrix4||n.isVector2||n.isVector3||n.isVector4||n.isTexture||n.isQuaternion)}function kf(n){const e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function nh(n){const e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:qe.workingColorSpace}const na={clone:lr,merge:Jt};var zf=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Gf=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Yt extends Jn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=zf,this.fragmentShader=Gf,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=lr(e.uniforms),this.uniformsGroups=kf(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const r in this.uniforms){const a=this.uniforms[r].value;a&&a.isTexture?t.uniforms[r]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[r]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[r]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[r]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[r]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[r]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[r]={type:"m4",value:a.toArray()}:t.uniforms[r]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(const i in e.uniforms){const r=e.uniforms[i];switch(this.uniforms[i]={},r.type){case"t":this.uniforms[i].value=t[r.value]||null;break;case"c":this.uniforms[i].value=new Le().setHex(r.value);break;case"v2":this.uniforms[i].value=new Ae().fromArray(r.value);break;case"v3":this.uniforms[i].value=new I().fromArray(r.value);break;case"v4":this.uniforms[i].value=new St().fromArray(r.value);break;case"m3":this.uniforms[i].value=new Fe().fromArray(r.value);break;case"m4":this.uniforms[i].value=new mt().fromArray(r.value);break;default:this.uniforms[i].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(const i in e.extensions)this.extensions[i]=e.extensions[i];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}}class Hf extends Yt{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Qr extends Jn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Le(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Le(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=$s,this.normalScale=new Ae(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Kn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class ih extends Jn{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Le(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Le(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=$s,this.normalScale=new Ae(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Kn,this.combine=fl,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Vf extends Jn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Zu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Wf extends Jn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class rh extends Lt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Le(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}const Za=new mt,Lc=new I,Ic=new I;class Xf{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ae(512,512),this.mapType=cn,this.map=null,this.mapPass=null,this.matrix=new mt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new El,this._frameExtents=new Ae(1,1),this._viewportCount=1,this._viewports=[new St(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera;Lc.setFromMatrixPosition(e.matrixWorld),t.position.copy(Lc),Ic.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Ic),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,i,r){Za.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),i.setFromProjectionMatrix(Za,e.coordinateSystem,e.reversedDepth);const s=this._frameExtents,a=r?r.z/s.x:1,o=r?r.w/s.y:1,l=r?r.x/s.x:0,c=r?r.y/s.y:0;e.coordinateSystem===Hr||e.reversedDepth?t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(Za)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const Ds=new I,Ls=new pr,Cn=new I;class sh extends Lt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new mt,this.projectionMatrix=new mt,this.projectionMatrixInverse=new mt,this.coordinateSystem=Nn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Ds,Ls,Cn),Cn.x===1&&Cn.y===1&&Cn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ds,Ls,Cn.set(1,1,1)).invert()}updateWorldMatrix(e,t,i=!1){super.updateWorldMatrix(e,t,i),this.matrixWorld.decompose(Ds,Ls,Cn),Cn.x===1&&Cn.y===1&&Cn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ds,Ls,Cn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const si=new I,Nc=new Ae,Uc=new Ae;class pn extends sh{constructor(e=50,t=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=jo*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Ta*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return jo*2*Math.atan(Math.tan(Ta*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){si.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(si.x,si.y).multiplyScalar(-e/si.z),si.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(si.x,si.y).multiplyScalar(-e/si.z)}getViewSize(e,t){return this.getViewBounds(e,Nc,Uc),t.subVectors(Uc,Nc)}setViewOffset(e,t,i,r,s,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Ta*.5*this.fov)/this.zoom,i=2*t,r=this.aspect*i,s=-.5*r;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;s+=a.offsetX*r/l,t-=a.offsetY*i/c,r*=a.width/l,i*=a.height/c}const o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}class ha extends sh{constructor(e=-1,t=1,i=1,r=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=r,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,r,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let s=i-e,a=i+e,o=r+t,l=r-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,a=s+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class qf extends Xf{constructor(){super(new ha(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class ah extends rh{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Lt.DEFAULT_UP),this.updateMatrix(),this.target=new Lt,this.shadow=new qf}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}class Yf extends rh{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}const er=-90,tr=1;class $f extends Lt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new pn(er,tr,e,t);r.layers=this.layers,this.add(r);const s=new pn(er,tr,e,t);s.layers=this.layers,this.add(s);const a=new pn(er,tr,e,t);a.layers=this.layers,this.add(a);const o=new pn(er,tr,e,t);o.layers=this.layers,this.add(o);const l=new pn(er,tr,e,t);l.layers=this.layers,this.add(l);const c=new pn(er,tr,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,r,s,a,o,l]=t;for(const c of t)this.remove(c);if(e===Nn)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Hr)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,a,o,l,c,u]=this.children,f=e.getRenderTarget(),h=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const M=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(i,0,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(i,1,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(i,2,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(i,3,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(i,4,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),i.texture.generateMipmaps=M,e.setRenderTarget(i,5,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(f,h,p),e.xr.enabled=g,i.texture.needsPMREMUpdate=!0}}class Kf extends pn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}class Zf{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=performance.now(),this._delta=0,this._elapsed=0,this._timescale=1,this._document=null,this._pageVisibilityHandler=null}connect(e){this._document=e,e.hidden!==void 0&&(this._pageVisibilityHandler=Jf.bind(this),e.addEventListener("visibilitychange",this._pageVisibilityHandler,!1))}disconnect(){this._pageVisibilityHandler!==null&&(this._document.removeEventListener("visibilitychange",this._pageVisibilityHandler),this._pageVisibilityHandler=null),this._document=null}getDelta(){return this._delta/1e3}getElapsed(){return this._elapsed/1e3}getTimescale(){return this._timescale}setTimescale(e){return this._timescale=e,this}reset(){return this._currentTime=performance.now()-this._startTime,this}dispose(){this.disconnect()}update(e){return this._pageVisibilityHandler!==null&&this._document.hidden===!0?this._delta=0:(this._previousTime=this._currentTime,this._currentTime=(e!==void 0?e:performance.now())-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta),this}}function Jf(){this._document.hidden===!1&&this.reset()}const Kl=class Kl{constructor(e,t,i,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,i,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let i=0;i<4;i++)this.elements[i]=e[i+t];return this}set(e,t,i,r){const s=this.elements;return s[0]=e,s[2]=t,s[1]=i,s[3]=r,this}};Kl.prototype.isMatrix2=!0;let Fc=Kl;function Oc(n,e,t,i){const r=Qf(i);switch(t){case zd:return n*e;case Hd:return n*e/r.components*r.byteLength;case _l:return n*e/r.components*r.byteLength;case Pi:return n*e*2/r.components*r.byteLength;case xl:return n*e*2/r.components*r.byteLength;case Gd:return n*e*3/r.components*r.byteLength;case wn:return n*e*4/r.components*r.byteLength;case vl:return n*e*4/r.components*r.byteLength;case Os:case Bs:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case ks:case zs:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Eo:case To:return Math.max(n,16)*Math.max(e,8)/4;case bo:case wo:return Math.max(n,8)*Math.max(e,8)/2;case Ao:case Ro:case Po:case Do:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Co:case qs:case Lo:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Io:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case No:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case Uo:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case Fo:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case Oo:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case Bo:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case ko:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case zo:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case Go:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case Ho:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case Vo:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case Wo:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case Xo:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case qo:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case Yo:case $o:case Ko:return Math.ceil(n/4)*Math.ceil(e/4)*16;case Zo:case Jo:return Math.ceil(n/4)*Math.ceil(e/4)*8;case Ys:case Qo:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Qf(n){switch(n){case cn:case Fd:return{byteLength:1,components:1};case zr:case Od:case rn:return{byteLength:2,components:1};case ml:case gl:return{byteLength:2,components:4};case On:case pl:case In:return{byteLength:4,components:1};case Bd:case kd:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:ul}}));typeof window<"u"&&(window.__THREE__?Ne("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=ul);/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function oh(){let n=null,e=!1,t=null,i=null;function r(s,a){i=n.requestAnimationFrame(r),t(s,a)}return{start:function(){e!==!0&&t!==null&&n!==null&&(i=n.requestAnimationFrame(r),e=!0)},stop:function(){n!==null&&n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){n=s}}}function jf(n){const e=new WeakMap;function t(o,l){const c=o.array,u=o.usage,f=c.byteLength,h=n.createBuffer();n.bindBuffer(l,h),n.bufferData(l,c,u),o.onUploadCallback();let p;if(c instanceof Float32Array)p=n.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)p=n.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?p=n.HALF_FLOAT:p=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=n.SHORT;else if(c instanceof Uint32Array)p=n.UNSIGNED_INT;else if(c instanceof Int32Array)p=n.INT;else if(c instanceof Int8Array)p=n.BYTE;else if(c instanceof Uint8Array)p=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:f}}function i(o,l,c){const u=l.array,f=l.updateRanges;if(n.bindBuffer(c,o),f.length===0)n.bufferSubData(c,0,u);else{f.sort((p,g)=>p.start-g.start);let h=0;for(let p=1;p<f.length;p++){const g=f[h],M=f[p];M.start<=g.start+g.count+1?g.count=Math.max(g.count,M.start+M.count-g.start):(++h,f[h]=M)}f.length=h+1;for(let p=0,g=f.length;p<g;p++){const M=f[p];n.bufferSubData(c,M.start*u.BYTES_PER_ELEMENT,u,M.start,M.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function s(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(n.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const u=e.get(o);(!u||u.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,o,l),c.version=o.version}}return{get:r,remove:s,update:a}}var ep=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,tp=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,np=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,ip=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,rp=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,sp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,ap=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,op=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,lp=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,cp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,dp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,hp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,up=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,fp=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,pp=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,mp=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,gp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,_p=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,xp=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,vp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Sp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Mp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,yp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,bp=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Ep=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,wp=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,Tp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Ap=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Rp=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Cp=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Pp="gl_FragColor = linearToOutputTexel( gl_FragColor );",Dp=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Lp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Ip=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Np=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Up=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Fp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Op=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Bp=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,kp=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,zp=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Gp=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Hp=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Vp=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Wp=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Xp=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,qp=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,Yp=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,$p=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Kp=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Zp=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Jp=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Qp=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,jp=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,em=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,tm=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,nm=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,im=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,rm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,sm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,am=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,om=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,lm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,cm=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,dm=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,hm=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,um=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,fm=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,pm=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,mm=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,gm=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,_m=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,xm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,vm=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Sm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Mm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,ym=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,bm=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Em=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,wm=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Tm=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Am=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Rm=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Cm=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,Pm=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Dm=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Lm=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Im=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Nm=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Um=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Fm=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,Om=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Bm=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,km=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,zm=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Gm=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Hm=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Vm=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Wm=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Xm=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,qm=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Ym=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,$m=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Km=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Zm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Jm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Qm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,jm=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const eg=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,tg=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ng=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,ig=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,rg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,sg=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ag=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,og=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,lg=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,cg=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,dg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,hg=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ug=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,fg=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,pg=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,mg=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,gg=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,_g=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,xg=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,vg=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Sg=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Mg=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,yg=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,bg=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Eg=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,wg=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Tg=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Ag=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Rg=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Cg=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Pg=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Dg=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Lg=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Ig=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,ze={alphahash_fragment:ep,alphahash_pars_fragment:tp,alphamap_fragment:np,alphamap_pars_fragment:ip,alphatest_fragment:rp,alphatest_pars_fragment:sp,aomap_fragment:ap,aomap_pars_fragment:op,batching_pars_vertex:lp,batching_vertex:cp,begin_vertex:dp,beginnormal_vertex:hp,bsdfs:up,iridescence_fragment:fp,bumpmap_pars_fragment:pp,clipping_planes_fragment:mp,clipping_planes_pars_fragment:gp,clipping_planes_pars_vertex:_p,clipping_planes_vertex:xp,color_fragment:vp,color_pars_fragment:Sp,color_pars_vertex:Mp,color_vertex:yp,common:bp,cube_uv_reflection_fragment:Ep,defaultnormal_vertex:wp,displacementmap_pars_vertex:Tp,displacementmap_vertex:Ap,emissivemap_fragment:Rp,emissivemap_pars_fragment:Cp,colorspace_fragment:Pp,colorspace_pars_fragment:Dp,envmap_fragment:Lp,envmap_common_pars_fragment:Ip,envmap_pars_fragment:Np,envmap_pars_vertex:Up,envmap_physical_pars_fragment:qp,envmap_vertex:Fp,fog_vertex:Op,fog_pars_vertex:Bp,fog_fragment:kp,fog_pars_fragment:zp,gradientmap_pars_fragment:Gp,lightmap_pars_fragment:Hp,lights_lambert_fragment:Vp,lights_lambert_pars_fragment:Wp,lights_pars_begin:Xp,lights_toon_fragment:Yp,lights_toon_pars_fragment:$p,lights_phong_fragment:Kp,lights_phong_pars_fragment:Zp,lights_physical_fragment:Jp,lights_physical_pars_fragment:Qp,lights_fragment_begin:jp,lights_fragment_maps:em,lights_fragment_end:tm,lightprobes_pars_fragment:nm,logdepthbuf_fragment:im,logdepthbuf_pars_fragment:rm,logdepthbuf_pars_vertex:sm,logdepthbuf_vertex:am,map_fragment:om,map_pars_fragment:lm,map_particle_fragment:cm,map_particle_pars_fragment:dm,metalnessmap_fragment:hm,metalnessmap_pars_fragment:um,morphinstance_vertex:fm,morphcolor_vertex:pm,morphnormal_vertex:mm,morphtarget_pars_vertex:gm,morphtarget_vertex:_m,normal_fragment_begin:xm,normal_fragment_maps:vm,normal_pars_fragment:Sm,normal_pars_vertex:Mm,normal_vertex:ym,normalmap_pars_fragment:bm,clearcoat_normal_fragment_begin:Em,clearcoat_normal_fragment_maps:wm,clearcoat_pars_fragment:Tm,iridescence_pars_fragment:Am,opaque_fragment:Rm,packing:Cm,premultiplied_alpha_fragment:Pm,project_vertex:Dm,dithering_fragment:Lm,dithering_pars_fragment:Im,roughnessmap_fragment:Nm,roughnessmap_pars_fragment:Um,shadowmap_pars_fragment:Fm,shadowmap_pars_vertex:Om,shadowmap_vertex:Bm,shadowmask_pars_fragment:km,skinbase_vertex:zm,skinning_pars_vertex:Gm,skinning_vertex:Hm,skinnormal_vertex:Vm,specularmap_fragment:Wm,specularmap_pars_fragment:Xm,tonemapping_fragment:qm,tonemapping_pars_fragment:Ym,transmission_fragment:$m,transmission_pars_fragment:Km,uv_pars_fragment:Zm,uv_pars_vertex:Jm,uv_vertex:Qm,worldpos_vertex:jm,background_vert:eg,background_frag:tg,backgroundCube_vert:ng,backgroundCube_frag:ig,cube_vert:rg,cube_frag:sg,depth_vert:ag,depth_frag:og,distance_vert:lg,distance_frag:cg,equirect_vert:dg,equirect_frag:hg,linedashed_vert:ug,linedashed_frag:fg,meshbasic_vert:pg,meshbasic_frag:mg,meshlambert_vert:gg,meshlambert_frag:_g,meshmatcap_vert:xg,meshmatcap_frag:vg,meshnormal_vert:Sg,meshnormal_frag:Mg,meshphong_vert:yg,meshphong_frag:bg,meshphysical_vert:Eg,meshphysical_frag:wg,meshtoon_vert:Tg,meshtoon_frag:Ag,points_vert:Rg,points_frag:Cg,shadow_vert:Pg,shadow_frag:Dg,sprite_vert:Lg,sprite_frag:Ig},pe={common:{diffuse:{value:new Le(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Fe},alphaMap:{value:null},alphaMapTransform:{value:new Fe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Fe}},envmap:{envMap:{value:null},envMapRotation:{value:new Fe},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Fe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Fe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Fe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Fe},normalScale:{value:new Ae(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Fe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Fe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Fe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Fe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Le(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new I},probesMax:{value:new I},probesResolution:{value:new I}},points:{diffuse:{value:new Le(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Fe},alphaTest:{value:0},uvTransform:{value:new Fe}},sprite:{diffuse:{value:new Le(16777215)},opacity:{value:1},center:{value:new Ae(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Fe},alphaMap:{value:null},alphaMapTransform:{value:new Fe},alphaTest:{value:0}}},Dn={basic:{uniforms:Jt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.fog]),vertexShader:ze.meshbasic_vert,fragmentShader:ze.meshbasic_frag},lambert:{uniforms:Jt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new Le(0)},envMapIntensity:{value:1}}]),vertexShader:ze.meshlambert_vert,fragmentShader:ze.meshlambert_frag},phong:{uniforms:Jt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new Le(0)},specular:{value:new Le(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:ze.meshphong_vert,fragmentShader:ze.meshphong_frag},standard:{uniforms:Jt([pe.common,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.roughnessmap,pe.metalnessmap,pe.fog,pe.lights,{emissive:{value:new Le(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ze.meshphysical_vert,fragmentShader:ze.meshphysical_frag},toon:{uniforms:Jt([pe.common,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.gradientmap,pe.fog,pe.lights,{emissive:{value:new Le(0)}}]),vertexShader:ze.meshtoon_vert,fragmentShader:ze.meshtoon_frag},matcap:{uniforms:Jt([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,{matcap:{value:null}}]),vertexShader:ze.meshmatcap_vert,fragmentShader:ze.meshmatcap_frag},points:{uniforms:Jt([pe.points,pe.fog]),vertexShader:ze.points_vert,fragmentShader:ze.points_frag},dashed:{uniforms:Jt([pe.common,pe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ze.linedashed_vert,fragmentShader:ze.linedashed_frag},depth:{uniforms:Jt([pe.common,pe.displacementmap]),vertexShader:ze.depth_vert,fragmentShader:ze.depth_frag},normal:{uniforms:Jt([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,{opacity:{value:1}}]),vertexShader:ze.meshnormal_vert,fragmentShader:ze.meshnormal_frag},sprite:{uniforms:Jt([pe.sprite,pe.fog]),vertexShader:ze.sprite_vert,fragmentShader:ze.sprite_frag},background:{uniforms:{uvTransform:{value:new Fe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ze.background_vert,fragmentShader:ze.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Fe}},vertexShader:ze.backgroundCube_vert,fragmentShader:ze.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ze.cube_vert,fragmentShader:ze.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ze.equirect_vert,fragmentShader:ze.equirect_frag},distance:{uniforms:Jt([pe.common,pe.displacementmap,{referencePosition:{value:new I},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ze.distance_vert,fragmentShader:ze.distance_frag},shadow:{uniforms:Jt([pe.lights,pe.fog,{color:{value:new Le(0)},opacity:{value:1}}]),vertexShader:ze.shadow_vert,fragmentShader:ze.shadow_frag}};Dn.physical={uniforms:Jt([Dn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Fe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Fe},clearcoatNormalScale:{value:new Ae(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Fe},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Fe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Fe},sheen:{value:0},sheenColor:{value:new Le(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Fe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Fe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Fe},transmissionSamplerSize:{value:new Ae},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Fe},attenuationDistance:{value:0},attenuationColor:{value:new Le(0)},specularColor:{value:new Le(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Fe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Fe},anisotropyVector:{value:new Ae},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Fe}}]),vertexShader:ze.meshphysical_vert,fragmentShader:ze.meshphysical_frag};const Is={r:0,b:0,g:0},Ng=new mt,lh=new Fe;lh.set(-1,0,0,0,1,0,0,0,1);function Ug(n,e,t,i,r,s){const a=new Le(0);let o=r===!0?0:1,l,c,u=null,f=0,h=null;function p(E){let A=E.isScene===!0?E.background:null;if(A&&A.isTexture){const v=E.backgroundBlurriness>0;A=e.get(A,v)}return A}function g(E){let A=!1;const v=p(E);v===null?m(a,o):v&&v.isColor&&(m(v,1),A=!0);const w=n.xr.getEnvironmentBlendMode();w==="additive"?t.buffers.color.setClear(0,0,0,1,s):w==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,s),(n.autoClear||A)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function M(E,A){const v=p(A);v&&(v.isCubeTexture||v.mapping===la)?(c===void 0&&(c=new bt(new Ui(1,1,1),new Yt({name:"BackgroundCubeMaterial",uniforms:lr(Dn.backgroundCube.uniforms),vertexShader:Dn.backgroundCube.vertexShader,fragmentShader:Dn.backgroundCube.fragmentShader,side:nn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(w,b,R){this.matrixWorld.copyPosition(R.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),c.material.uniforms.envMap.value=v,c.material.uniforms.backgroundBlurriness.value=A.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Ng.makeRotationFromEuler(A.backgroundRotation)).transpose(),v.isCubeTexture&&v.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(lh),c.material.toneMapped=qe.getTransfer(v.colorSpace)!==et,(u!==v||f!==v.version||h!==n.toneMapping)&&(c.material.needsUpdate=!0,u=v,f=v.version,h=n.toneMapping),c.layers.enableAll(),E.unshift(c,c.geometry,c.material,0,0,null)):v&&v.isTexture&&(l===void 0&&(l=new bt(new Fi(2,2),new Yt({name:"BackgroundMaterial",uniforms:lr(Dn.background.uniforms),vertexShader:Dn.background.vertexShader,fragmentShader:Dn.background.fragmentShader,side:Ri,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=v,l.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,l.material.toneMapped=qe.getTransfer(v.colorSpace)!==et,v.matrixAutoUpdate===!0&&v.updateMatrix(),l.material.uniforms.uvTransform.value.copy(v.matrix),(u!==v||f!==v.version||h!==n.toneMapping)&&(l.material.needsUpdate=!0,u=v,f=v.version,h=n.toneMapping),l.layers.enableAll(),E.unshift(l,l.geometry,l.material,0,0,null))}function m(E,A){E.getRGB(Is,nh(n)),t.buffers.color.setClear(Is.r,Is.g,Is.b,A,s)}function d(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(E,A=1){a.set(E),o=A,m(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(E){o=E,m(a,o)},render:g,addToRenderList:M,dispose:d}}function Fg(n,e){const t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},r=h(null);let s=r,a=!1;function o(D,O,H,F,k){let X=!1;const S=f(D,F,H,O);s!==S&&(s=S,c(s.object)),X=p(D,F,H,k),X&&g(D,F,H,k),k!==null&&e.update(k,n.ELEMENT_ARRAY_BUFFER),(X||a)&&(a=!1,v(D,O,H,F),k!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(k).buffer))}function l(){return n.createVertexArray()}function c(D){return n.bindVertexArray(D)}function u(D){return n.deleteVertexArray(D)}function f(D,O,H,F){const k=F.wireframe===!0;let X=i[O.id];X===void 0&&(X={},i[O.id]=X);const S=D.isInstancedMesh===!0?D.id:0;let Q=X[S];Q===void 0&&(Q={},X[S]=Q);let W=Q[H.id];W===void 0&&(W={},Q[H.id]=W);let j=W[k];return j===void 0&&(j=h(l()),W[k]=j),j}function h(D){const O=[],H=[],F=[];for(let k=0;k<t;k++)O[k]=0,H[k]=0,F[k]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:O,enabledAttributes:H,attributeDivisors:F,object:D,attributes:{},index:null}}function p(D,O,H,F){const k=s.attributes,X=O.attributes;let S=0;const Q=H.getAttributes();for(const W in Q)if(Q[W].location>=0){const ee=k[W];let ie=X[W];if(ie===void 0&&(W==="instanceMatrix"&&D.instanceMatrix&&(ie=D.instanceMatrix),W==="instanceColor"&&D.instanceColor&&(ie=D.instanceColor)),ee===void 0||ee.attribute!==ie||ie&&ee.data!==ie.data)return!0;S++}return s.attributesNum!==S||s.index!==F}function g(D,O,H,F){const k={},X=O.attributes;let S=0;const Q=H.getAttributes();for(const W in Q)if(Q[W].location>=0){let ee=X[W];ee===void 0&&(W==="instanceMatrix"&&D.instanceMatrix&&(ee=D.instanceMatrix),W==="instanceColor"&&D.instanceColor&&(ee=D.instanceColor));const ie={};ie.attribute=ee,ee&&ee.data&&(ie.data=ee.data),k[W]=ie,S++}s.attributes=k,s.attributesNum=S,s.index=F}function M(){const D=s.newAttributes;for(let O=0,H=D.length;O<H;O++)D[O]=0}function m(D){d(D,0)}function d(D,O){const H=s.newAttributes,F=s.enabledAttributes,k=s.attributeDivisors;H[D]=1,F[D]===0&&(n.enableVertexAttribArray(D),F[D]=1),k[D]!==O&&(n.vertexAttribDivisor(D,O),k[D]=O)}function E(){const D=s.newAttributes,O=s.enabledAttributes;for(let H=0,F=O.length;H<F;H++)O[H]!==D[H]&&(n.disableVertexAttribArray(H),O[H]=0)}function A(D,O,H,F,k,X,S){S===!0?n.vertexAttribIPointer(D,O,H,k,X):n.vertexAttribPointer(D,O,H,F,k,X)}function v(D,O,H,F){M();const k=F.attributes,X=H.getAttributes(),S=O.defaultAttributeValues;for(const Q in X){const W=X[Q];if(W.location>=0){let j=k[Q];if(j===void 0&&(Q==="instanceMatrix"&&D.instanceMatrix&&(j=D.instanceMatrix),Q==="instanceColor"&&D.instanceColor&&(j=D.instanceColor)),j!==void 0){const ee=j.normalized,ie=j.itemSize,se=e.get(j);if(se===void 0)continue;const Me=se.buffer,ve=se.type,Ue=se.bytesPerElement,Y=ve===n.INT||ve===n.UNSIGNED_INT||j.gpuType===pl;if(j.isInterleavedBufferAttribute){const Z=j.data,le=Z.stride,De=j.offset;if(Z.isInstancedInterleavedBuffer){for(let _e=0;_e<W.locationSize;_e++)d(W.location+_e,Z.meshPerAttribute);D.isInstancedMesh!==!0&&F._maxInstanceCount===void 0&&(F._maxInstanceCount=Z.meshPerAttribute*Z.count)}else for(let _e=0;_e<W.locationSize;_e++)m(W.location+_e);n.bindBuffer(n.ARRAY_BUFFER,Me);for(let _e=0;_e<W.locationSize;_e++)A(W.location+_e,ie/W.locationSize,ve,ee,le*Ue,(De+ie/W.locationSize*_e)*Ue,Y)}else{if(j.isInstancedBufferAttribute){for(let Z=0;Z<W.locationSize;Z++)d(W.location+Z,j.meshPerAttribute);D.isInstancedMesh!==!0&&F._maxInstanceCount===void 0&&(F._maxInstanceCount=j.meshPerAttribute*j.count)}else for(let Z=0;Z<W.locationSize;Z++)m(W.location+Z);n.bindBuffer(n.ARRAY_BUFFER,Me);for(let Z=0;Z<W.locationSize;Z++)A(W.location+Z,ie/W.locationSize,ve,ee,ie*Ue,ie/W.locationSize*Z*Ue,Y)}}else if(S!==void 0){const ee=S[Q];if(ee!==void 0)switch(ee.length){case 2:n.vertexAttrib2fv(W.location,ee);break;case 3:n.vertexAttrib3fv(W.location,ee);break;case 4:n.vertexAttrib4fv(W.location,ee);break;default:n.vertexAttrib1fv(W.location,ee)}}}}E()}function w(){T();for(const D in i){const O=i[D];for(const H in O){const F=O[H];for(const k in F){const X=F[k];for(const S in X)u(X[S].object),delete X[S];delete F[k]}}delete i[D]}}function b(D){if(i[D.id]===void 0)return;const O=i[D.id];for(const H in O){const F=O[H];for(const k in F){const X=F[k];for(const S in X)u(X[S].object),delete X[S];delete F[k]}}delete i[D.id]}function R(D){for(const O in i){const H=i[O];for(const F in H){const k=H[F];if(k[D.id]===void 0)continue;const X=k[D.id];for(const S in X)u(X[S].object),delete X[S];delete k[D.id]}}}function _(D){for(const O in i){const H=i[O],F=D.isInstancedMesh===!0?D.id:0,k=H[F];if(k!==void 0){for(const X in k){const S=k[X];for(const Q in S)u(S[Q].object),delete S[Q];delete k[X]}delete H[F],Object.keys(H).length===0&&delete i[O]}}}function T(){C(),a=!0,s!==r&&(s=r,c(s.object))}function C(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:o,reset:T,resetDefaultState:C,dispose:w,releaseStatesOfGeometry:b,releaseStatesOfObject:_,releaseStatesOfProgram:R,initAttributes:M,enableAttribute:m,disableUnusedAttributes:E}}function Og(n,e,t){let i;function r(l){i=l}function s(l,c){n.drawArrays(i,l,c),t.update(c,i,1)}function a(l,c,u){u!==0&&(n.drawArraysInstanced(i,l,c,u),t.update(c,i,u))}function o(l,c,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,c,0,u);let h=0;for(let p=0;p<u;p++)h+=c[p];t.update(h,i,1)}this.setMode=r,this.render=s,this.renderInstances=a,this.renderMultiDraw=o}function Bg(n,e,t,i){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){const R=e.get("EXT_texture_filter_anisotropic");r=n.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function a(R){return!(R!==wn&&i.convert(R)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(R){const _=R===rn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(R!==cn&&R!==In&&!_&&i.convert(R)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE))}function l(R){if(R==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const u=l(c);u!==c&&(Ne("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);const f=t.logarithmicDepthBuffer===!0,h=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&h===!1&&Ne("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");const p=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),g=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),M=n.getParameter(n.MAX_TEXTURE_SIZE),m=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),d=n.getParameter(n.MAX_VERTEX_ATTRIBS),E=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),A=n.getParameter(n.MAX_VARYING_VECTORS),v=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),w=n.getParameter(n.MAX_SAMPLES),b=n.getParameter(n.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:f,reversedDepthBuffer:h,maxTextures:p,maxVertexTextures:g,maxTextureSize:M,maxCubemapSize:m,maxAttributes:d,maxVertexUniforms:E,maxVaryings:A,maxFragmentUniforms:v,maxSamples:w,samples:b}}function kg(n){const e=this;let t=null,i=0,r=!1,s=!1;const a=new ai,o=new Fe,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(f,h){const p=f.length!==0||h||i!==0||r;return r=h,i=f.length,p},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(f,h){t=u(f,h,0)},this.setState=function(f,h,p){const g=f.clippingPlanes,M=f.clipIntersection,m=f.clipShadows,d=n.get(f);if(!r||g===null||g.length===0||s&&!m)s?u(null):c();else{const E=s?0:i,A=E*4;let v=d.clippingState||null;l.value=v,v=u(g,h,A,p);for(let w=0;w!==A;++w)v[w]=t[w];d.clippingState=v,this.numIntersection=M?this.numPlanes:0,this.numPlanes+=E}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function u(f,h,p,g){const M=f!==null?f.length:0;let m=null;if(M!==0){if(m=l.value,g!==!0||m===null){const d=p+M*4,E=h.matrixWorldInverse;o.getNormalMatrix(E),(m===null||m.length<d)&&(m=new Float32Array(d));for(let A=0,v=p;A!==M;++A,v+=4)a.copy(f[A]).applyMatrix4(E,o),a.normal.toArray(m,v),m[v+3]=a.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=M,e.numIntersection=0,m}}const rr=4,zg=6,Gg=20,Hg=256,Tr=new ha,Bc=new Le;let Ja=null,Qa=0,ja=0,eo=!1;const Vg=new I,Mi=new I;class kc{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,r=100,s={}){const{size:a=256,position:o=Vg}=s;Ja=this._renderer.getRenderTarget(),Qa=this._renderer.getActiveCubeFace(),ja=this._renderer.getActiveMipmapLevel(),eo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,i,r,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Hc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Gc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Ja,Qa,ja),this._renderer.xr.enabled=eo,e.scissorTest=!1,nr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Ci||e.mapping===or?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Ja=this._renderer.getRenderTarget(),Qa=this._renderer.getActiveCubeFace(),ja=this._renderer.getActiveMipmapLevel(),eo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:qt,minFilter:qt,generateMipmaps:!1,type:rn,format:wn,colorSpace:Ks,depthBuffer:!1},r=zc(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=zc(e,t,i);const{_lodMax:s}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=Wg(s)),this._blurMaterial=qg(s,e,t),this._ggxMaterial=Xg(s,e,t)}return r}_compileMaterial(e){const t=new bt(new Ct,e);this._renderer.compile(t,Tr)}_sceneToCubeUV(e,t,i,r,s){const l=new pn(90,1,t,i),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],f=this._renderer,h=f.autoClear,p=f.toneMapping;f.getClearColor(Bc),f.toneMapping=Fn,f.autoClear=!1,f.state.buffers.depth.getReversed()&&(f.setRenderTarget(r),f.clearDepth(),f.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new bt(new Ui,new mi({name:"PMREM.Background",side:nn,depthWrite:!1,depthTest:!1})));const M=this._backgroundBox,m=M.material;let d=!1;const E=e.background;E?E.isColor&&(m.color.copy(E),e.background=null,d=!0):(m.color.copy(Bc),d=!0);for(let A=0;A<6;A++){const v=A%3;v===0?(l.up.set(0,c[A],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x+u[A],s.y,s.z)):v===1?(l.up.set(0,0,c[A]),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y+u[A],s.z)):(l.up.set(0,c[A],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y,s.z+u[A]));const w=this._cubeSize;nr(r,v*w,A>2?w:0,w,w),f.setRenderTarget(r),d&&f.render(M,l),f.render(e,l)}f.toneMapping=p,f.autoClear=h,e.background=E}_textureToCubeUV(e,t){const i=this._renderer,r=e.mapping===Ci||e.mapping===or;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Hc()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Gc());const s=r?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=s;const o=s.uniforms;o.envMap.value=e;const l=this._cubeSize;nr(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(a,Tr)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const r=this._lodMeshes.length;for(let s=1;s<r;s++)this._applyGGXFilter(e,s-1,s);t.autoClear=i}_applyGGXFilter(e,t,i){const r=this._renderer,s=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[i];o.material=a;const l=a.uniforms,c=i/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),f=Math.sqrt(c*c-u*u),h=c*1.25,p=f*h,{_lodMax:g}=this,M=this._sizeLods[i],m=3*M*(i>g-rr?i-g+rr:0),d=4*(this._cubeSize-M);l.envMap.value=e.texture,l.roughness.value=p,l.mipInt.value=g-t,nr(s,m,d,3*M,2*M),r.setRenderTarget(s),r.render(o,Tr),l.envMap.value=s.texture,l.roughness.value=0,l.mipInt.value=g-i,nr(e,m,d,3*M,2*M),r.setRenderTarget(e),r.render(o,Tr)}_blur(e,t,i,r){const s=this._pingPongRenderTarget,a=Math.min(r,Math.PI)/Math.SQRT2;this._blurPass(e,s,t,i,a),this._blurPass(s,e,i,i,a)}_blurPass(e,t,i,r,s){const a=this._renderer,o=this._blurMaterial,l=this._lodMeshes[r];l.material=o;const c=o.uniforms;c.envMap.value=e.texture,c.sigma.value=s,c.mipInt.value=this._lodMax-i;const u=this._sizeLods[r],f=3*u*(r>this._lodMax-rr?r-this._lodMax+rr:0),h=4*(this._cubeSize-u);nr(t,f,h,3*u,2*u),a.setRenderTarget(t),a.render(l,Tr)}}function Wg(n){const e=[],t=[];let i=n;const r=n-rr+1+zg;for(let s=0;s<r;s++){const a=Math.pow(2,i);e.push(a);const o=1/(a-2),l=-o,c=1+o,u=[l,l,c,l,c,c,l,l,c,c,l,c],f=6,h=6,p=3,g=new Float32Array(p*h*f),M=new Float32Array(p*h*f);for(let d=0;d<f;d++){const E=d%3*2/3-1,A=d>2?0:-1,v=[E,A,0,E+2/3,A,0,E+2/3,A+1,0,E,A,0,E+2/3,A+1,0,E,A+1,0];g.set(v,p*h*d);for(let w=0;w<h;w++){const b=u[w*2]*2-1,R=u[w*2+1]*2-1;d===0?Mi.set(1,R,b):d===1?Mi.set(-b,1,-R):d===2?Mi.set(-b,R,1):d===3?Mi.set(-1,R,-b):d===4?Mi.set(-b,-1,R):Mi.set(b,R,-1),Mi.toArray(M,(d*h+w)*p)}}const m=new Ct;m.setAttribute("position",new Tn(g,p)),m.setAttribute("outputDirection",new Tn(M,p)),t.push(new bt(m,null)),i>rr&&i--}return{lodMeshes:t,sizeLods:e}}function zc(n,e,t){const i=new jt(n,e,t);return i.texture.mapping=la,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function nr(n,e,t,i,r){n.viewport.set(e,t,i,r),n.scissor.set(e,t,i,r)}function Xg(n,e,t){return new Yt({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Hg,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:ua(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Un,depthTest:!1,depthWrite:!1})}function qg(n,e,t){return new Yt({name:"SphericalGaussianBlur",defines:{SAMPLES:Gg,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:ua(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:Un,depthTest:!1,depthWrite:!1})}function Gc(){return new Yt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ua(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Un,depthTest:!1,depthWrite:!1})}function Hc(){return new Yt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ua(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Un,depthTest:!1,depthWrite:!1})}function ua(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}class ch extends jt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];this.texture=new eh(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new Ui(5,5,5),s=new Yt({name:"CubemapFromEquirect",uniforms:lr(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:nn,blending:Un});s.uniforms.tEquirect.value=t;const a=new bt(r,s),o=t.minFilter;return t.minFilter===Ei&&(t.minFilter=qt),new $f(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,i=!0,r=!0){const s=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,i,r);e.setRenderTarget(s)}}function Yg(n){let e=new WeakMap,t=new WeakMap,i=null;function r(h,p=!1){return h==null?null:p?a(h):s(h)}function s(h){if(h&&h.isTexture){const p=h.mapping;if(p===ya||p===ba)if(e.has(h)){const g=e.get(h).texture;return o(g,h.mapping)}else{const g=h.image;if(g&&g.height>0){const M=new ch(g.height);return M.fromEquirectangularTexture(n,h),e.set(h,M),h.addEventListener("dispose",c),o(M.texture,h.mapping)}else return null}}return h}function a(h){if(h&&h.isTexture){const p=h.mapping,g=p===ya||p===ba,M=p===Ci||p===or;if(g||M){let m=t.get(h);const d=m!==void 0?m.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==d)return i===null&&(i=new kc(n)),m=g?i.fromEquirectangular(h,m):i.fromCubemap(h,m),m.texture.pmremVersion=h.pmremVersion,t.set(h,m),m.texture;if(m!==void 0)return m.texture;{const E=h.image;return g&&E&&E.height>0||M&&E&&l(E)?(i===null&&(i=new kc(n)),m=g?i.fromEquirectangular(h):i.fromCubemap(h),m.texture.pmremVersion=h.pmremVersion,t.set(h,m),h.addEventListener("dispose",u),m.texture):null}}}return h}function o(h,p){return p===ya?h.mapping=Ci:p===ba&&(h.mapping=or),h}function l(h){let p=0;const g=6;for(let M=0;M<g;M++)h[M]!==void 0&&p++;return p===g}function c(h){const p=h.target;p.removeEventListener("dispose",c);const g=e.get(p);g!==void 0&&(e.delete(p),g.dispose())}function u(h){const p=h.target;p.removeEventListener("dispose",u);const g=t.get(p);g!==void 0&&(t.delete(p),g.dispose())}function f(){e=new WeakMap,t=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:r,dispose:f}}function $g(n){const e={};function t(i){if(e[i]!==void 0)return e[i];const r=n.getExtension(i);return e[i]=r,r}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const r=t(i);return r===null&&sr("WebGLRenderer: "+i+" extension not supported."),r}}}function Kg(n,e,t,i){const r={},s=new WeakMap;function a(f){const h=f.target;h.index!==null&&e.remove(h.index);for(const g in h.attributes)e.remove(h.attributes[g]);h.removeEventListener("dispose",a),delete r[h.id];const p=s.get(h);p&&(e.remove(p),s.delete(h)),i.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,t.memory.geometries--}function o(f,h){return r[h.id]===!0||(h.addEventListener("dispose",a),r[h.id]=!0,t.memory.geometries++),h}function l(f){const h=f.attributes;for(const p in h)e.update(h[p],n.ARRAY_BUFFER)}function c(f){const h=[],p=f.index,g=f.attributes.position;let M=0;if(g===void 0)return;if(p!==null){const E=p.array;M=p.version;for(let A=0,v=E.length;A<v;A+=3){const w=E[A+0],b=E[A+1],R=E[A+2];h.push(w,b,b,R,R,w)}}else{const E=g.array;M=g.version;for(let A=0,v=E.length/3-1;A<v;A+=3){const w=A+0,b=A+1,R=A+2;h.push(w,b,b,R,R,w)}}const m=new(g.count>=65535?Kd:$d)(h,1);m.version=M;const d=s.get(f);d&&e.remove(d),s.set(f,m)}function u(f){const h=s.get(f);if(h){const p=f.index;p!==null&&h.version<p.version&&c(f)}else c(f);return s.get(f)}return{get:o,update:l,getWireframeAttribute:u}}function Zg(n,e,t){let i;function r(f){i=f}let s,a;function o(f){s=f.type,a=f.bytesPerElement}function l(f,h){n.drawElements(i,h,s,f*a),t.update(h,i,1)}function c(f,h,p){p!==0&&(n.drawElementsInstanced(i,h,s,f*a,p),t.update(h,i,p))}function u(f,h,p){if(p===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,h,0,s,f,0,p);let M=0;for(let m=0;m<p;m++)M+=h[m];t.update(M,i,1)}this.setMode=r,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u}function Jg(n){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,a,o){switch(t.calls++,a){case n.TRIANGLES:t.triangles+=o*(s/3);break;case n.LINES:t.lines+=o*(s/2);break;case n.LINE_STRIP:t.lines+=o*(s-1);break;case n.LINE_LOOP:t.lines+=o*s;break;case n.POINTS:t.points+=o*s;break;default:Ke("WebGLInfo: Unknown draw mode:",a);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:i}}function Qg(n,e,t){const i=new WeakMap,r=new St;function s(a,o,l){const c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,f=u!==void 0?u.length:0;let h=i.get(o);if(h===void 0||h.count!==f){let C=function(){_.dispose(),i.delete(o),o.removeEventListener("dispose",C)};var p=C;h!==void 0&&h.texture.dispose();const g=o.morphAttributes.position!==void 0,M=o.morphAttributes.normal!==void 0,m=o.morphAttributes.color!==void 0,d=o.morphAttributes.position||[],E=o.morphAttributes.normal||[],A=o.morphAttributes.color||[];let v=0;g===!0&&(v=1),M===!0&&(v=2),m===!0&&(v=3);let w=o.attributes.position.count*v,b=1;w>e.maxTextureSize&&(b=Math.ceil(w/e.maxTextureSize),w=e.maxTextureSize);const R=new Float32Array(w*b*4*f),_=new Xd(R,w,b,f);_.type=In,_.needsUpdate=!0;const T=v*4;for(let D=0;D<f;D++){const O=d[D],H=E[D],F=A[D],k=w*b*4*D;for(let X=0;X<O.count;X++){const S=X*T;g===!0&&(r.fromBufferAttribute(O,X),R[k+S+0]=r.x,R[k+S+1]=r.y,R[k+S+2]=r.z,R[k+S+3]=0),M===!0&&(r.fromBufferAttribute(H,X),R[k+S+4]=r.x,R[k+S+5]=r.y,R[k+S+6]=r.z,R[k+S+7]=0),m===!0&&(r.fromBufferAttribute(F,X),R[k+S+8]=r.x,R[k+S+9]=r.y,R[k+S+10]=r.z,R[k+S+11]=F.itemSize===4?r.w:1)}}h={count:f,texture:_,size:new Ae(w,b)},i.set(o,h),o.addEventListener("dispose",C)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",a.morphTexture,t);else{let g=0;for(let m=0;m<c.length;m++)g+=c[m];const M=o.morphTargetsRelative?1:1-g;l.getUniforms().setValue(n,"morphTargetBaseInfluence",M),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",h.texture,t),l.getUniforms().setValue(n,"morphTargetsTextureSize",h.size)}return{update:s}}function jg(n,e,t,i,r){let s=new WeakMap;function a(c){const u=r.render.frame,f=c.geometry,h=e.get(c,f);if(s.get(h)!==u&&(e.update(h),s.set(h,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),s.get(c)!==u&&(t.update(c.instanceMatrix,n.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,n.ARRAY_BUFFER),s.set(c,u))),c.isSkinnedMesh){const p=c.skeleton;s.get(p)!==u&&(p.update(),s.set(p,u))}return h}function o(){s=new WeakMap}function l(c){const u=c.target;u.removeEventListener("dispose",l),i.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:a,dispose:o}}const e0={[Rd]:"LINEAR_TONE_MAPPING",[Cd]:"REINHARD_TONE_MAPPING",[Pd]:"CINEON_TONE_MAPPING",[Dd]:"ACES_FILMIC_TONE_MAPPING",[Id]:"AGX_TONE_MAPPING",[Nd]:"NEUTRAL_TONE_MAPPING",[Ld]:"CUSTOM_TONE_MAPPING"};function t0(n,e,t,i,r,s){const a=new jt(e,t,{type:n,depthBuffer:r,stencilBuffer:s,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1});let o=null,l=null;const c=new Ct;c.setAttribute("position",new lt([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new lt([0,2,0,0,2,0],2));const u=new Hf({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),f=new bt(c,u),h=new ha(-1,1,1,-1,0,1);let p=null,g=null,M=!1,m,d=null,E=[],A=!1;this.setSize=function(v,w){a.setSize(v,w),o!==null&&o.setSize(v,w),l!==null&&l.setSize(v,w);for(let b=0;b<E.length;b++){const R=E[b];R.setSize&&R.setSize(v,w)}},this.setEffects=function(v){E=v,A=E.length>0&&E[0].isRenderPass===!0;const w=a.width,b=a.height;E.length>0&&o===null&&(o=new jt(w,b,{type:rn,depthBuffer:!1,stencilBuffer:!1}),l=new jt(w,b,{type:rn,depthBuffer:!1,stencilBuffer:!1}));for(let R=0;R<E.length;R++){const _=E[R];_.setSize&&_.setSize(w,b)}},this.begin=function(v,w){if(M||v.toneMapping===Fn&&E.length===0)return!1;if(d=w,w!==null){const b=w.width,R=w.height;(a.width!==b||a.height!==R)&&this.setSize(b,R)}return A===!1&&v.setRenderTarget(a),m=v.toneMapping,v.toneMapping=Fn,!0},this.hasRenderPass=function(){return A},this.end=function(v,w){v.toneMapping=m,M=!0;let b=a,R=o;for(let _=0;_<E.length;_++){const T=E[_];T.enabled!==!1&&(T.render(v,R,b,w),T.needsSwap!==!1&&(b=R,R=R===o?l:o))}if(p!==v.outputColorSpace||g!==v.toneMapping){p=v.outputColorSpace,g=v.toneMapping,u.defines={},qe.getTransfer(p)===et&&(u.defines.SRGB_TRANSFER="");const _=e0[g];_&&(u.defines[_]=""),u.needsUpdate=!0}u.uniforms.tDiffuse.value=b.texture,v.setRenderTarget(d),v.render(f,h),d=null,M=!1},this.isCompositing=function(){return M},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),c.dispose(),u.dispose()}}const dh=new $t,tl=new Vr(1,1),hh=new Xd,uh=new gf,fh=new eh,Vc=[],Wc=[],Xc=new Float32Array(16),qc=new Float32Array(9),Yc=new Float32Array(4);function mr(n,e,t){const i=n[0];if(i<=0||i>0)return n;const r=e*t;let s=Vc[r];if(s===void 0&&(s=new Float32Array(r),Vc[r]=s),e!==0){i.toArray(s,0);for(let a=1,o=0;a!==e;++a)o+=t,n[a].toArray(s,o)}return s}function It(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function Nt(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function fa(n,e){let t=Wc[e];t===void 0&&(t=new Int32Array(e),Wc[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function n0(n,e){const t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function i0(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(It(t,e))return;n.uniform2fv(this.addr,e),Nt(t,e)}}function r0(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(It(t,e))return;n.uniform3fv(this.addr,e),Nt(t,e)}}function s0(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(It(t,e))return;n.uniform4fv(this.addr,e),Nt(t,e)}}function a0(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(It(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),Nt(t,e)}else{if(It(t,i))return;Yc.set(i),n.uniformMatrix2fv(this.addr,!1,Yc),Nt(t,i)}}function o0(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(It(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),Nt(t,e)}else{if(It(t,i))return;qc.set(i),n.uniformMatrix3fv(this.addr,!1,qc),Nt(t,i)}}function l0(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(It(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),Nt(t,e)}else{if(It(t,i))return;Xc.set(i),n.uniformMatrix4fv(this.addr,!1,Xc),Nt(t,i)}}function c0(n,e){const t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function d0(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(It(t,e))return;n.uniform2iv(this.addr,e),Nt(t,e)}}function h0(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(It(t,e))return;n.uniform3iv(this.addr,e),Nt(t,e)}}function u0(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(It(t,e))return;n.uniform4iv(this.addr,e),Nt(t,e)}}function f0(n,e){const t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function p0(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(It(t,e))return;n.uniform2uiv(this.addr,e),Nt(t,e)}}function m0(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(It(t,e))return;n.uniform3uiv(this.addr,e),Nt(t,e)}}function g0(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(It(t,e))return;n.uniform4uiv(this.addr,e),Nt(t,e)}}function _0(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r);let s;this.type===n.SAMPLER_2D_SHADOW?(tl.compareFunction=t.isReversedDepthBuffer()?Ml:Sl,s=tl):s=dh,t.setTexture2D(e||s,r)}function x0(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture3D(e||uh,r)}function v0(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTextureCube(e||fh,r)}function S0(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture2DArray(e||hh,r)}function M0(n){switch(n){case 5126:return n0;case 35664:return i0;case 35665:return r0;case 35666:return s0;case 35674:return a0;case 35675:return o0;case 35676:return l0;case 5124:case 35670:return c0;case 35667:case 35671:return d0;case 35668:case 35672:return h0;case 35669:case 35673:return u0;case 5125:return f0;case 36294:return p0;case 36295:return m0;case 36296:return g0;case 35678:case 36198:case 36298:case 36306:case 35682:return _0;case 35679:case 36299:case 36307:return x0;case 35680:case 36300:case 36308:case 36293:return v0;case 36289:case 36303:case 36311:case 36292:return S0}}function y0(n,e){n.uniform1fv(this.addr,e)}function b0(n,e){const t=mr(e,this.size,2);n.uniform2fv(this.addr,t)}function E0(n,e){const t=mr(e,this.size,3);n.uniform3fv(this.addr,t)}function w0(n,e){const t=mr(e,this.size,4);n.uniform4fv(this.addr,t)}function T0(n,e){const t=mr(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function A0(n,e){const t=mr(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function R0(n,e){const t=mr(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function C0(n,e){n.uniform1iv(this.addr,e)}function P0(n,e){n.uniform2iv(this.addr,e)}function D0(n,e){n.uniform3iv(this.addr,e)}function L0(n,e){n.uniform4iv(this.addr,e)}function I0(n,e){n.uniform1uiv(this.addr,e)}function N0(n,e){n.uniform2uiv(this.addr,e)}function U0(n,e){n.uniform3uiv(this.addr,e)}function F0(n,e){n.uniform4uiv(this.addr,e)}function O0(n,e,t){const i=this.cache,r=e.length,s=fa(t,r);It(i,s)||(n.uniform1iv(this.addr,s),Nt(i,s));let a;this.type===n.SAMPLER_2D_SHADOW?a=tl:a=dh;for(let o=0;o!==r;++o)t.setTexture2D(e[o]||a,s[o])}function B0(n,e,t){const i=this.cache,r=e.length,s=fa(t,r);It(i,s)||(n.uniform1iv(this.addr,s),Nt(i,s));for(let a=0;a!==r;++a)t.setTexture3D(e[a]||uh,s[a])}function k0(n,e,t){const i=this.cache,r=e.length,s=fa(t,r);It(i,s)||(n.uniform1iv(this.addr,s),Nt(i,s));for(let a=0;a!==r;++a)t.setTextureCube(e[a]||fh,s[a])}function z0(n,e,t){const i=this.cache,r=e.length,s=fa(t,r);It(i,s)||(n.uniform1iv(this.addr,s),Nt(i,s));for(let a=0;a!==r;++a)t.setTexture2DArray(e[a]||hh,s[a])}function G0(n){switch(n){case 5126:return y0;case 35664:return b0;case 35665:return E0;case 35666:return w0;case 35674:return T0;case 35675:return A0;case 35676:return R0;case 5124:case 35670:return C0;case 35667:case 35671:return P0;case 35668:case 35672:return D0;case 35669:case 35673:return L0;case 5125:return I0;case 36294:return N0;case 36295:return U0;case 36296:return F0;case 35678:case 36198:case 36298:case 36306:case 35682:return O0;case 35679:case 36299:case 36307:return B0;case 35680:case 36300:case 36308:case 36293:return k0;case 36289:case 36303:case 36311:case 36292:return z0}}class H0{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=M0(t.type)}}class V0{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=G0(t.type)}}class W0{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const r=this.seq;for(let s=0,a=r.length;s!==a;++s){const o=r[s];o.setValue(e,t[o.id],i)}}}const to=/(\w+)(\])?(\[|\.)?/g;function $c(n,e){n.seq.push(e),n.map[e.id]=e}function X0(n,e,t){const i=n.name,r=i.length;for(to.lastIndex=0;;){const s=to.exec(i),a=to.lastIndex;let o=s[1];const l=s[2]==="]",c=s[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===r){$c(t,c===void 0?new H0(o,n,e):new V0(o,n,e));break}else{let f=t.map[o];f===void 0&&(f=new W0(o),$c(t,f)),t=f}}}class Gs{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<i;++a){const o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);X0(o,l,this)}const r=[],s=[];for(const a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(a):s.push(a);r.length>0&&(this.seq=r.concat(s))}setValue(e,t,i,r){const s=this.map[t];s!==void 0&&s.setValue(e,i,r)}setOptional(e,t,i){const r=t[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,t,i,r){for(let s=0,a=t.length;s!==a;++s){const o=t[s],l=i[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,r)}}static seqWithValue(e,t){const i=[];for(let r=0,s=e.length;r!==s;++r){const a=e[r];a.id in t&&i.push(a)}return i}}function Kc(n,e,t){const i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}const q0=37297;let Y0=0;function $0(n,e){const t=n.split(`
`),i=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let a=r;a<s;a++){const o=a+1;i.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return i.join(`
`)}const Zc=new Fe;function K0(n){qe._getMatrix(Zc,qe.workingColorSpace,n);const e=`mat3( ${Zc.elements.map(t=>t.toFixed(4))} )`;switch(qe.getTransfer(n)){case Zs:return[e,"LinearTransferOETF"];case et:return[e,"sRGBTransferOETF"];default:return Ne("WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function Jc(n,e,t){const i=n.getShaderParameter(e,n.COMPILE_STATUS),s=(n.getShaderInfoLog(e)||"").trim();if(i&&s==="")return"";const a=/ERROR: 0:(\d+)/.exec(s);if(a){const o=parseInt(a[1]);return t.toUpperCase()+`

`+s+`

`+$0(n.getShaderSource(e),o)}else return s}function Z0(n,e){const t=K0(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}const J0={[Rd]:"Linear",[Cd]:"Reinhard",[Pd]:"Cineon",[Dd]:"ACESFilmic",[Id]:"AgX",[Nd]:"Neutral",[Ld]:"Custom"};function Q0(n,e){const t=J0[e];return t===void 0?(Ne("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+n+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Ns=new I;function j0(){qe.getLuminanceCoefficients(Ns);const n=Ns.x.toFixed(4),e=Ns.y.toFixed(4),t=Ns.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function e_(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Dr).join(`
`)}function t_(n){const e=[];for(const t in n){const i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function n_(n,e){const t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){const s=n.getActiveAttrib(e,r),a=s.name;let o=1;s.type===n.FLOAT_MAT2&&(o=2),s.type===n.FLOAT_MAT3&&(o=3),s.type===n.FLOAT_MAT4&&(o=4),t[a]={type:s.type,location:n.getAttribLocation(e,a),locationSize:o}}return t}function Dr(n){return n!==""}function Qc(n,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function jc(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const i_=/^[ \t]*#include +<([\w\d./]+)>/gm;function nl(n){return n.replace(i_,s_)}const r_=new Map;function s_(n,e){let t=ze[e];if(t===void 0){const i=r_.get(e);if(i!==void 0)t=ze[i],Ne('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return nl(t)}const a_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function ed(n){return n.replace(a_,o_)}function o_(n,e,t,i){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function td(n){let e=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}const l_={[Ir]:"SHADOWMAP_TYPE_PCF",[Pr]:"SHADOWMAP_TYPE_VSM"};function c_(n){return l_[n.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const d_={[Ci]:"ENVMAP_TYPE_CUBE",[or]:"ENVMAP_TYPE_CUBE",[la]:"ENVMAP_TYPE_CUBE_UV"};function h_(n){return n.envMap===!1?"ENVMAP_TYPE_CUBE":d_[n.envMapMode]||"ENVMAP_TYPE_CUBE"}const u_={[or]:"ENVMAP_MODE_REFRACTION"};function f_(n){return n.envMap===!1?"ENVMAP_MODE_REFLECTION":u_[n.envMapMode]||"ENVMAP_MODE_REFLECTION"}const p_={[fl]:"ENVMAP_BLENDING_MULTIPLY",[Yu]:"ENVMAP_BLENDING_MIX",[$u]:"ENVMAP_BLENDING_ADD"};function m_(n){return n.envMap===!1?"ENVMAP_BLENDING_NONE":p_[n.combine]||"ENVMAP_BLENDING_NONE"}function g_(n){const e=n.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function __(n,e,t,i){const r=n.getContext(),s=t.defines;let a=t.vertexShader,o=t.fragmentShader;const l=c_(t),c=h_(t),u=f_(t),f=m_(t),h=g_(t),p=e_(t),g=t_(s),M=r.createProgram();let m,d,E=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Dr).join(`
`),m.length>0&&(m+=`
`),d=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Dr).join(`
`),d.length>0&&(d+=`
`)):(m=[td(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Dr).join(`
`),d=[td(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+f:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Fn?"#define TONE_MAPPING":"",t.toneMapping!==Fn?ze.tonemapping_pars_fragment:"",t.toneMapping!==Fn?Q0("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",ze.colorspace_pars_fragment,Z0("linearToOutputTexel",t.outputColorSpace),j0(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Dr).join(`
`)),a=nl(a),a=Qc(a,t),a=jc(a,t),o=nl(o),o=Qc(o,t),o=jc(o,t),a=ed(a),o=ed(o),t.isRawShaderMaterial!==!0&&(E=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,d=["#define varying in",t.glslVersion===cc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===cc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);const A=E+m+a,v=E+d+o,w=Kc(r,r.VERTEX_SHADER,A),b=Kc(r,r.FRAGMENT_SHADER,v);r.attachShader(M,w),r.attachShader(M,b),t.index0AttributeName!==void 0?r.bindAttribLocation(M,0,t.index0AttributeName):t.hasPositionAttribute===!0&&r.bindAttribLocation(M,0,"position"),r.linkProgram(M);function R(D){if(n.debug.checkShaderErrors){const O=r.getProgramInfoLog(M)||"",H=r.getShaderInfoLog(w)||"",F=r.getShaderInfoLog(b)||"",k=O.trim(),X=H.trim(),S=F.trim();let Q=!0,W=!0;if(r.getProgramParameter(M,r.LINK_STATUS)===!1)if(Q=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(r,M,w,b);else{const j=Jc(r,w,"vertex"),ee=Jc(r,b,"fragment");Ke("WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(M,r.VALIDATE_STATUS)+`

Material Name: `+D.name+`
Material Type: `+D.type+`

Program Info Log: `+k+`
`+j+`
`+ee)}else k!==""?Ne("WebGLProgram: Program Info Log:",k):(X===""||S==="")&&(W=!1);W&&(D.diagnostics={runnable:Q,programLog:k,vertexShader:{log:X,prefix:m},fragmentShader:{log:S,prefix:d}})}r.deleteShader(w),r.deleteShader(b),_=new Gs(r,M),T=n_(r,M)}let _;this.getUniforms=function(){return _===void 0&&R(this),_};let T;this.getAttributes=function(){return T===void 0&&R(this),T};let C=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return C===!1&&(C=r.getProgramParameter(M,q0)),C},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(M),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Y0++,this.cacheKey=e,this.usedTimes=1,this.program=M,this.vertexShader=w,this.fragmentShader=b,this}let x_=0;class v_{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,i){const r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(i)===!1&&(r.add(i),i.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new S_(e),t.set(e,i)),i}}class S_{constructor(e){this.id=x_++,this.code=e,this.usedTimes=0}}function M_(n){return n===Pi||n===qs||n===Ys}function y_(n,e,t,i,r,s){const a=new qd,o=new v_,l=new Set,c=[],u=new Map,f=i.logarithmicDepthBuffer;let h=i.precision;const p={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(_){return l.add(_),_===0?"uv":`uv${_}`}function M(_,T,C,D,O,H){const F=D.fog,k=O.geometry,X=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?D.environment:null,S=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,Q=e.get(_.envMap||X,S),W=Q&&Q.mapping===la?Q.image.height:null,j=p[_.type];_.precision!==null&&(h=i.getMaxPrecision(_.precision),h!==_.precision&&Ne("WebGLProgram.getParameters:",_.precision,"not supported, using",h,"instead."));const ee=k.morphAttributes.position||k.morphAttributes.normal||k.morphAttributes.color,ie=ee!==void 0?ee.length:0;let se=0;k.morphAttributes.position!==void 0&&(se=1),k.morphAttributes.normal!==void 0&&(se=2),k.morphAttributes.color!==void 0&&(se=3);let Me,ve,Ue,Y;if(j){const dt=Dn[j];Me=dt.vertexShader,ve=dt.fragmentShader}else{Me=_.vertexShader,ve=_.fragmentShader;const dt=o.getVertexShaderStage(_),Je=o.getFragmentShaderStage(_);o.update(_,dt,Je),Ue=dt.id,Y=Je.id}const Z=n.getRenderTarget(),le=n.state.buffers.depth.getReversed(),De=O.isInstancedMesh===!0,_e=O.isBatchedMesh===!0,He=!!_.map,Pt=!!_.matcap,Ve=!!Q,Ze=!!_.aoMap,ct=!!_.lightMap,Xe=!!_.bumpMap&&_.wireframe===!1,gt=!!_.normalMap,Ut=!!_.displacementMap,en=!!_.emissiveMap,xt=!!_.metalnessMap,wt=!!_.roughnessMap,U=_.anisotropy>0,kt=_.clearcoat>0,je=_.dispersion>0,P=_.retroreflectivity>0,x=_.iridescence>0,B=_.sheen>0,V=_.transmission>0,K=U&&!!_.anisotropyMap,ae=kt&&!!_.clearcoatMap,oe=kt&&!!_.clearcoatNormalMap,J=kt&&!!_.clearcoatRoughnessMap,ne=x&&!!_.iridescenceMap,ce=x&&!!_.iridescenceThicknessMap,Re=B&&!!_.sheenColorMap,fe=B&&!!_.sheenRoughnessMap,de=!!_.specularMap,Ce=!!_.specularColorMap,Ie=!!_.specularIntensityMap,Oe=V&&!!_.transmissionMap,N=V&&!!_.thicknessMap,he=!!_.gradientMap,te=!!_.alphaMap,ue=_.alphaTest>0,xe=!!_.alphaHash,re=!!_.extensions;let Pe=Fn;_.toneMapped&&(Z===null||Z.isXRRenderTarget===!0)&&(Pe=n.toneMapping);const we={shaderID:j,shaderType:_.type,shaderName:_.name,vertexShader:Me,fragmentShader:ve,defines:_.defines,customVertexShaderID:Ue,customFragmentShaderID:Y,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:h,batching:_e,batchingColor:_e&&O._colorsTexture!==null,instancing:De,instancingColor:De&&O.instanceColor!==null,instancingMorph:De&&O.morphTexture!==null,outputColorSpace:Z===null?n.outputColorSpace:Z.isXRRenderTarget===!0?Z.texture.colorSpace:qe.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:He,matcap:Pt,envMap:Ve,envMapMode:Ve&&Q.mapping,envMapCubeUVHeight:W,aoMap:Ze,lightMap:ct,bumpMap:Xe,normalMap:gt,displacementMap:Ut,emissiveMap:en,normalMapObjectSpace:gt&&_.normalMapType===Ju,normalMapTangentSpace:gt&&_.normalMapType===$s,packedNormalMap:gt&&_.normalMapType===$s&&M_(_.normalMap.format),metalnessMap:xt,roughnessMap:wt,anisotropy:U,anisotropyMap:K,clearcoat:kt,clearcoatMap:ae,clearcoatNormalMap:oe,clearcoatRoughnessMap:J,dispersion:je,retroreflection:P,iridescence:x,iridescenceMap:ne,iridescenceThicknessMap:ce,sheen:B,sheenColorMap:Re,sheenRoughnessMap:fe,specularMap:de,specularColorMap:Ce,specularIntensityMap:Ie,transmission:V,transmissionMap:Oe,thicknessMap:N,gradientMap:he,opaque:_.transparent===!1&&_.blending===Nr&&_.alphaToCoverage===!1,alphaMap:te,alphaTest:ue,alphaHash:xe,combine:_.combine,mapUv:He&&g(_.map.channel),aoMapUv:Ze&&g(_.aoMap.channel),lightMapUv:ct&&g(_.lightMap.channel),bumpMapUv:Xe&&g(_.bumpMap.channel),normalMapUv:gt&&g(_.normalMap.channel),displacementMapUv:Ut&&g(_.displacementMap.channel),emissiveMapUv:en&&g(_.emissiveMap.channel),metalnessMapUv:xt&&g(_.metalnessMap.channel),roughnessMapUv:wt&&g(_.roughnessMap.channel),anisotropyMapUv:K&&g(_.anisotropyMap.channel),clearcoatMapUv:ae&&g(_.clearcoatMap.channel),clearcoatNormalMapUv:oe&&g(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:J&&g(_.clearcoatRoughnessMap.channel),iridescenceMapUv:ne&&g(_.iridescenceMap.channel),iridescenceThicknessMapUv:ce&&g(_.iridescenceThicknessMap.channel),sheenColorMapUv:Re&&g(_.sheenColorMap.channel),sheenRoughnessMapUv:fe&&g(_.sheenRoughnessMap.channel),specularMapUv:de&&g(_.specularMap.channel),specularColorMapUv:Ce&&g(_.specularColorMap.channel),specularIntensityMapUv:Ie&&g(_.specularIntensityMap.channel),transmissionMapUv:Oe&&g(_.transmissionMap.channel),thicknessMapUv:N&&g(_.thicknessMap.channel),alphaMapUv:te&&g(_.alphaMap.channel),vertexTangents:!!k.attributes.tangent&&(gt||U),vertexNormals:!!k.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!k.attributes.color&&k.attributes.color.itemSize===4,pointsUvs:O.isPoints===!0&&!!k.attributes.uv&&(He||te),fog:!!F,useFog:_.fog===!0,fogExp2:!!F&&F.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||k.attributes.normal===void 0&&gt===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:f,reversedDepthBuffer:le,skinning:O.isSkinnedMesh===!0,hasPositionAttribute:k.attributes.position!==void 0,morphTargets:k.morphAttributes.position!==void 0,morphNormals:k.morphAttributes.normal!==void 0,morphColors:k.morphAttributes.color!==void 0,morphTargetsCount:ie,morphTextureStride:se,numSunLights:T.sun.length,numDirLights:T.directional.length,numPointLights:T.point.length,numSpotLights:T.spot.length,numSpotLightMaps:T.spotLightMap.length,numRectAreaLights:T.rectArea.length,numHemiLights:T.hemi.length,numSunLightShadows:T.sunShadowMap.length,numDirLightShadows:T.directionalShadowMap.length,numPointLightShadows:T.pointShadowMap.length,numSpotLightShadows:T.spotShadowMap.length,numSpotLightShadowsWithMaps:T.numSpotLightShadowsWithMaps,numLightProbes:T.numLightProbes,numLightProbeGrids:H.length,numClippingPlanes:s.numPlanes,numClipIntersection:s.numIntersection,dithering:_.dithering,shadowMapEnabled:n.shadowMap.enabled&&C.length>0,shadowMapType:n.shadowMap.type,toneMapping:Pe,decodeVideoTexture:He&&_.map.isVideoTexture===!0&&qe.getTransfer(_.map.colorSpace)===et,decodeVideoTextureEmissive:en&&_.emissiveMap.isVideoTexture===!0&&qe.getTransfer(_.emissiveMap.colorSpace)===et,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===ln,flipSided:_.side===nn,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:re&&_.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(re&&_.extensions.multiDraw===!0||_e)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return we.vertexUv1s=l.has(1),we.vertexUv2s=l.has(2),we.vertexUv3s=l.has(3),l.clear(),we}function m(_){const T=[];if(_.shaderID?T.push(_.shaderID):(T.push(_.customVertexShaderID),T.push(_.customFragmentShaderID)),_.defines!==void 0)for(const C in _.defines)T.push(C),T.push(_.defines[C]);return _.isRawShaderMaterial===!1&&(d(T,_),E(T,_),T.push(n.outputColorSpace)),T.push(_.customProgramCacheKey),T.join()}function d(_,T){_.push(T.precision),_.push(T.outputColorSpace),_.push(T.envMapMode),_.push(T.envMapCubeUVHeight),_.push(T.mapUv),_.push(T.alphaMapUv),_.push(T.lightMapUv),_.push(T.aoMapUv),_.push(T.bumpMapUv),_.push(T.normalMapUv),_.push(T.displacementMapUv),_.push(T.emissiveMapUv),_.push(T.metalnessMapUv),_.push(T.roughnessMapUv),_.push(T.anisotropyMapUv),_.push(T.clearcoatMapUv),_.push(T.clearcoatNormalMapUv),_.push(T.clearcoatRoughnessMapUv),_.push(T.iridescenceMapUv),_.push(T.iridescenceThicknessMapUv),_.push(T.sheenColorMapUv),_.push(T.sheenRoughnessMapUv),_.push(T.specularMapUv),_.push(T.specularColorMapUv),_.push(T.specularIntensityMapUv),_.push(T.transmissionMapUv),_.push(T.thicknessMapUv),_.push(T.combine),_.push(T.fogExp2),_.push(T.sizeAttenuation),_.push(T.morphTargetsCount),_.push(T.morphAttributeCount),_.push(T.numSunLights),_.push(T.numDirLights),_.push(T.numPointLights),_.push(T.numSpotLights),_.push(T.numSpotLightMaps),_.push(T.numHemiLights),_.push(T.numRectAreaLights),_.push(T.numSunLightShadows),_.push(T.numDirLightShadows),_.push(T.numPointLightShadows),_.push(T.numSpotLightShadows),_.push(T.numSpotLightShadowsWithMaps),_.push(T.numLightProbes),_.push(T.shadowMapType),_.push(T.toneMapping),_.push(T.numClippingPlanes),_.push(T.numClipIntersection),_.push(T.depthPacking)}function E(_,T){a.disableAll(),T.instancing&&a.enable(0),T.instancingColor&&a.enable(1),T.instancingMorph&&a.enable(2),T.matcap&&a.enable(3),T.envMap&&a.enable(4),T.normalMapObjectSpace&&a.enable(5),T.normalMapTangentSpace&&a.enable(6),T.clearcoat&&a.enable(7),T.iridescence&&a.enable(8),T.alphaTest&&a.enable(9),T.vertexColors&&a.enable(10),T.vertexAlphas&&a.enable(11),T.vertexUv1s&&a.enable(12),T.vertexUv2s&&a.enable(13),T.vertexUv3s&&a.enable(14),T.vertexTangents&&a.enable(15),T.anisotropy&&a.enable(16),T.alphaHash&&a.enable(17),T.batching&&a.enable(18),T.dispersion&&a.enable(19),T.retroreflection&&a.enable(24),T.batchingColor&&a.enable(20),T.gradientMap&&a.enable(21),T.packedNormalMap&&a.enable(22),T.vertexNormals&&a.enable(23),_.push(a.mask),a.disableAll(),T.fog&&a.enable(0),T.useFog&&a.enable(1),T.flatShading&&a.enable(2),T.logarithmicDepthBuffer&&a.enable(3),T.reversedDepthBuffer&&a.enable(4),T.skinning&&a.enable(5),T.morphTargets&&a.enable(6),T.morphNormals&&a.enable(7),T.morphColors&&a.enable(8),T.premultipliedAlpha&&a.enable(9),T.shadowMapEnabled&&a.enable(10),T.doubleSided&&a.enable(11),T.flipSided&&a.enable(12),T.useDepthPacking&&a.enable(13),T.dithering&&a.enable(14),T.transmission&&a.enable(15),T.sheen&&a.enable(16),T.opaque&&a.enable(17),T.pointsUvs&&a.enable(18),T.decodeVideoTexture&&a.enable(19),T.decodeVideoTextureEmissive&&a.enable(20),T.alphaToCoverage&&a.enable(21),T.numLightProbeGrids>0&&a.enable(22),T.hasPositionAttribute&&a.enable(23),_.push(a.mask)}function A(_){const T=p[_.type];let C;if(T){const D=Dn[T];C=na.clone(D.uniforms)}else C=_.uniforms;return C}function v(_,T){let C=u.get(T);return C!==void 0?++C.usedTimes:(C=new __(n,T,_,r),c.push(C),u.set(T,C)),C}function w(_){if(--_.usedTimes===0){const T=c.indexOf(_);c[T]=c[c.length-1],c.pop(),u.delete(_.cacheKey),_.destroy()}}function b(_){o.remove(_)}function R(){o.dispose()}return{getParameters:M,getProgramCacheKey:m,getUniforms:A,acquireProgram:v,releaseProgram:w,releaseShaderCache:b,programs:c,dispose:R}}function b_(){let n=new WeakMap;function e(a){return n.has(a)}function t(a){let o=n.get(a);return o===void 0&&(o={},n.set(a,o)),o}function i(a){n.delete(a)}function r(a,o,l){n.get(a)[o]=l}function s(){n=new WeakMap}return{has:e,get:t,remove:i,update:r,dispose:s}}function E_(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.materialVariant!==e.materialVariant?n.materialVariant-e.materialVariant:n.z!==e.z?n.z-e.z:n.id-e.id}function nd(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function id(){const n=[];let e=0;const t=[],i=[],r=[];function s(){e=0,t.length=0,i.length=0,r.length=0}function a(h){let p=0;return h.isInstancedMesh&&(p+=2),h.isSkinnedMesh&&(p+=1),p}function o(h,p,g,M,m,d){let E=n[e];return E===void 0?(E={id:h.id,object:h,geometry:p,material:g,materialVariant:a(h),groupOrder:M,renderOrder:h.renderOrder,z:m,group:d},n[e]=E):(E.id=h.id,E.object=h,E.geometry=p,E.material=g,E.materialVariant=a(h),E.groupOrder=M,E.renderOrder=h.renderOrder,E.z=m,E.group=d),e++,E}function l(h,p,g,M,m,d,E){E.reversedDepth===!0&&(m=-m);const A=o(h,p,g,M,m,d);g.transmission>0?i.push(A):g.transparent===!0?r.push(A):t.push(A)}function c(h,p,g,M,m,d){const E=o(h,p,g,M,m,d);g.transmission>0?i.unshift(E):g.transparent===!0?r.unshift(E):t.unshift(E)}function u(h,p){t.length>1&&t.sort(h||E_),i.length>1&&i.sort(p||nd),r.length>1&&r.sort(p||nd)}function f(){for(let h=e,p=n.length;h<p;h++){const g=n[h];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:i,transparent:r,init:s,push:l,unshift:c,finish:f,sort:u}}function w_(){let n=new WeakMap;function e(i,r){const s=n.get(i);let a;return s===void 0?(a=new id,n.set(i,[a])):r>=s.length?(a=new id,s.push(a)):a=s[r],a}function t(){n=new WeakMap}return{get:e,dispose:t}}function T_(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new I,color:new Le};break;case"SpotLight":t={position:new I,direction:new I,color:new Le,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new I,color:new Le,distance:0,decay:0};break;case"HemisphereLight":t={direction:new I,skyColor:new Le,groundColor:new Le};break;case"RectAreaLight":t={color:new Le,position:new I,halfWidth:new I,halfHeight:new I};break}return n[e.id]=t,t}}}function A_(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ae};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ae};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ae,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}let R_=0;function C_(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function P_(n){const e=new T_,t=A_(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new I);const r=new I,s=new mt,a=new mt;function o(c){let u=0,f=0,h=0;for(let O=0;O<9;O++)i.probe[O].set(0,0,0);let p=0,g=0,M=0,m=0,d=0,E=0,A=0,v=0,w=0,b=0,R=0,_=0,T=0,C=0;c.sort(C_);for(let O=0,H=c.length;O<H;O++){const F=c[O],k=F.color,X=F.intensity,S=F.distance;let Q=null;if(F.shadow&&F.shadow.map&&(F.shadow.map.texture.format===Pi?Q=F.shadow.map.texture:Q=F.shadow.map.depthTexture||F.shadow.map.texture),F.isAmbientLight)u+=k.r*X,f+=k.g*X,h+=k.b*X;else if(F.isLightProbe){for(let W=0;W<9;W++)i.probe[W].addScaledVector(F.sh.coefficients[W],X);C++}else if(F.isSunLight){const W=e.get(F);if(W.color.copy(F.color).multiplyScalar(F.intensity),F.castShadow){const j=F.shadow,ee=t.get(F);ee.shadowIntensity=j.intensity,ee.shadowBias=j.bias,ee.shadowNormalBias=j.normalBias,ee.shadowRadius=j.radius,ee.shadowMapSize.copy(j.mapSize).multiply(j.getFrameExtents()),i.sunShadow[g]=ee,i.sunShadowMap[g]=Q;const ie=j.getViewportCount();for(let se=0;se<ie;se++)i.sunShadowMatrix[M+se]=j.getMatrix(se),i.sunShadowCascade[M+se]=j._cascadeData[se];M+=ie,g++}i.sun[p]=W,p++}else if(F.isDirectionalLight){const W=e.get(F);if(W.color.copy(F.color).multiplyScalar(F.intensity),F.castShadow){const j=F.shadow,ee=t.get(F);ee.shadowIntensity=j.intensity,ee.shadowBias=j.bias,ee.shadowNormalBias=j.normalBias,ee.shadowRadius=j.radius,ee.shadowMapSize=j.mapSize,i.directionalShadow[m]=ee,i.directionalShadowMap[m]=Q,i.directionalShadowMatrix[m]=F.shadow.matrix,w++}i.directional[m]=W,m++}else if(F.isSpotLight){const W=e.get(F);W.position.setFromMatrixPosition(F.matrixWorld),W.color.copy(k).multiplyScalar(X),W.distance=S,W.coneCos=Math.cos(F.angle),W.penumbraCos=Math.cos(F.angle*(1-F.penumbra)),W.decay=F.decay,i.spot[E]=W;const j=F.shadow;if(F.map&&(i.spotLightMap[_]=F.map,_++,j.updateMatrices(F),F.castShadow&&T++),i.spotLightMatrix[E]=j.matrix,F.castShadow){const ee=t.get(F);ee.shadowIntensity=j.intensity,ee.shadowBias=j.bias,ee.shadowNormalBias=j.normalBias,ee.shadowRadius=j.radius,ee.shadowMapSize=j.mapSize,i.spotShadow[E]=ee,i.spotShadowMap[E]=Q,R++}E++}else if(F.isRectAreaLight){const W=e.get(F);W.color.copy(k).multiplyScalar(X),W.halfWidth.set(F.width*.5,0,0),W.halfHeight.set(0,F.height*.5,0),i.rectArea[A]=W,A++}else if(F.isPointLight){const W=e.get(F);if(W.color.copy(F.color).multiplyScalar(F.intensity),W.distance=F.distance,W.decay=F.decay,F.castShadow){const j=F.shadow,ee=t.get(F);ee.shadowIntensity=j.intensity,ee.shadowBias=j.bias,ee.shadowNormalBias=j.normalBias,ee.shadowRadius=j.radius,ee.shadowMapSize=j.mapSize,ee.shadowCameraNear=j.camera.near,ee.shadowCameraFar=j.camera.far,i.pointShadow[d]=ee,i.pointShadowMap[d]=Q,i.pointShadowMatrix[d]=F.shadow.matrix,b++}i.point[d]=W,d++}else if(F.isHemisphereLight){const W=e.get(F);W.skyColor.copy(F.color).multiplyScalar(X),W.groundColor.copy(F.groundColor).multiplyScalar(X),i.hemi[v]=W,v++}}A>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=pe.LTC_FLOAT_1,i.rectAreaLTC2=pe.LTC_FLOAT_2):(i.rectAreaLTC1=pe.LTC_HALF_1,i.rectAreaLTC2=pe.LTC_HALF_2)),i.ambient[0]=u,i.ambient[1]=f,i.ambient[2]=h;const D=i.hash;(D.sunLength!==p||D.directionalLength!==m||D.pointLength!==d||D.spotLength!==E||D.rectAreaLength!==A||D.hemiLength!==v||D.numSunShadows!==g||D.numDirectionalShadows!==w||D.numPointShadows!==b||D.numSpotShadows!==R||D.numSpotMaps!==_||D.numLightProbes!==C)&&(i.sun.length=p,i.directional.length=m,i.spot.length=E,i.rectArea.length=A,i.point.length=d,i.hemi.length=v,i.sunShadow.length=g,i.sunShadowMap.length=g,i.sunShadowMatrix.length=M,i.sunShadowCascade.length=M,i.directionalShadow.length=w,i.directionalShadowMap.length=w,i.directionalShadowMatrix.length=w,i.pointShadow.length=b,i.pointShadowMap.length=b,i.pointShadowMatrix.length=b,i.spotShadow.length=R,i.spotShadowMap.length=R,i.spotLightMatrix.length=R+_-T,i.spotLightMap.length=_,i.numSpotLightShadowsWithMaps=T,i.numLightProbes=C,D.sunLength=p,D.directionalLength=m,D.pointLength=d,D.spotLength=E,D.rectAreaLength=A,D.hemiLength=v,D.numSunShadows=g,D.numDirectionalShadows=w,D.numPointShadows=b,D.numSpotShadows=R,D.numSpotMaps=_,D.numLightProbes=C,i.version=R_++)}function l(c,u){let f=0,h=0,p=0,g=0,M=0,m=0;const d=u.matrixWorldInverse;for(let E=0,A=c.length;E<A;E++){const v=c[E];if(v.isSunLight){const w=i.sun[f];w.direction.setFromMatrixPosition(v.matrixWorld),w.direction.transformDirection(d),f++}else if(v.isDirectionalLight){const w=i.directional[h];w.direction.setFromMatrixPosition(v.matrixWorld),r.setFromMatrixPosition(v.target.matrixWorld),w.direction.sub(r),w.direction.transformDirection(d),h++}else if(v.isSpotLight){const w=i.spot[g];w.position.setFromMatrixPosition(v.matrixWorld),w.position.applyMatrix4(d),w.direction.setFromMatrixPosition(v.matrixWorld),r.setFromMatrixPosition(v.target.matrixWorld),w.direction.sub(r),w.direction.transformDirection(d),g++}else if(v.isRectAreaLight){const w=i.rectArea[M];w.position.setFromMatrixPosition(v.matrixWorld),w.position.applyMatrix4(d),a.identity(),s.copy(v.matrixWorld),s.premultiply(d),a.extractRotation(s),w.halfWidth.set(v.width*.5,0,0),w.halfHeight.set(0,v.height*.5,0),w.halfWidth.applyMatrix4(a),w.halfHeight.applyMatrix4(a),M++}else if(v.isPointLight){const w=i.point[p];w.position.setFromMatrixPosition(v.matrixWorld),w.position.applyMatrix4(d),p++}else if(v.isHemisphereLight){const w=i.hemi[m];w.direction.setFromMatrixPosition(v.matrixWorld),w.direction.transformDirection(d),m++}}}return{setup:o,setupView:l,state:i}}function rd(n){const e=new P_(n),t=[],i=[],r=[];function s(h){f.camera=h,t.length=0,i.length=0,r.length=0}function a(h){t.push(h)}function o(h){i.push(h)}function l(h){r.push(h)}function c(){e.setup(t)}function u(h){e.setupView(t,h)}const f={lightsArray:t,shadowsArray:i,lightProbeGridArray:r,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:s,state:f,setupLights:c,setupLightsView:u,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function D_(n){let e=new WeakMap;function t(r,s=0){const a=e.get(r);let o;return a===void 0?(o=new rd(n),e.set(r,[o])):s>=a.length?(o=new rd(n),a.push(o)):o=a[s],o}function i(){e=new WeakMap}return{get:t,dispose:i}}const L_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,I_=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,N_=[new I(1,0,0),new I(-1,0,0),new I(0,1,0),new I(0,-1,0),new I(0,0,1),new I(0,0,-1)],U_=[new I(0,-1,0),new I(0,-1,0),new I(0,0,1),new I(0,0,-1),new I(0,-1,0),new I(0,-1,0)],sd=new mt,Ar=new I,no=new I;function F_(n,e,t){let i=new El;const r=new Ae,s=new Ae,a=new St,o=new Vf,l=new Wf,c={},u=t.maxTextureSize,f={[Ri]:nn,[nn]:Ri,[ln]:ln},h=new Yt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ae},radius:{value:4}},vertexShader:L_,fragmentShader:I_}),p=h.clone();p.defines.HORIZONTAL_PASS=1;const g=new Ct;g.setAttribute("position",new Tn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const M=new bt(g,h),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ir;let d=this.type;this.render=function(b,R,_){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||b.length===0)return;this.type===Ru&&(Ne("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Ir);const T=n.getRenderTarget(),C=n.getActiveCubeFace(),D=n.getActiveMipmapLevel(),O=n.state;O.setBlending(Un),O.buffers.depth.getReversed()===!0?O.buffers.color.setClear(0,0,0,0):O.buffers.color.setClear(1,1,1,1),O.buffers.depth.setTest(!0),O.setScissorTest(!1);const H=d!==this.type;H&&R.traverse(function(F){F.material&&(Array.isArray(F.material)?F.material.forEach(k=>k.needsUpdate=!0):F.material.needsUpdate=!0)});for(let F=0,k=b.length;F<k;F++){const X=b[F],S=X.shadow;if(S===void 0){Ne("WebGLShadowMap:",X,"has no shadow.");continue}if(S.autoUpdate===!1&&S.needsUpdate===!1)continue;r.copy(S.mapSize);const Q=S.getFrameExtents();r.multiply(Q),s.copy(S.mapSize),(r.x>u||r.y>u)&&(r.x>u&&(s.x=Math.floor(u/Q.x),r.x=s.x*Q.x,S.mapSize.x=s.x),r.y>u&&(s.y=Math.floor(u/Q.y),r.y=s.y*Q.y,S.mapSize.y=s.y));const W=n.state.buffers.depth.getReversed();if(S.camera._reversedDepth=W,S.map===null||H===!0){if(S.map!==null&&(S.map.depthTexture!==null&&(S.map.depthTexture.dispose(),S.map.depthTexture=null),S.map.dispose()),this.type===Pr){if(X.isPointLight){Ne("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}S.map=new jt(r.x,r.y,{format:Pi,type:rn,minFilter:qt,magFilter:qt,generateMipmaps:!1}),S.map.texture.name=X.name+".shadowMap",S.map.depthTexture=new Vr(r.x,r.y,In),S.map.depthTexture.name=X.name+".shadowMapDepth",S.map.depthTexture.format=$n,S.map.depthTexture.compareFunction=null,S.map.depthTexture.minFilter=Bt,S.map.depthTexture.magFilter=Bt}else X.isPointLight?(S.map=new ch(r.x),S.map.depthTexture=new Bf(r.x,On)):(S.map=new jt(r.x,r.y),S.map.depthTexture=new Vr(r.x,r.y,On)),S.map.depthTexture.name=X.name+".shadowMap",S.map.depthTexture.format=$n,this.type===Ir?(S.map.depthTexture.compareFunction=W?Ml:Sl,S.map.depthTexture.minFilter=qt,S.map.depthTexture.magFilter=qt):(S.map.depthTexture.compareFunction=null,S.map.depthTexture.minFilter=Bt,S.map.depthTexture.magFilter=Bt);S.camera.updateProjectionMatrix()}S.map.isWebGLCubeRenderTarget!==!0&&(S.map.width!==r.x||S.map.height!==r.y)&&S.map.setSize(r.x,r.y);const j=S.map.isWebGLCubeRenderTarget?6:S.getViewportCount();X.isPointLight!==!0&&S.updateMatrices(X,_);for(let ee=0;ee<j;ee++){const ie=S.getCamera(ee);if(X.isPointLight){const se=S.camera,Me=S.matrix,ve=X.distance||se.far;ve!==se.far&&(se.far=ve,se.updateProjectionMatrix()),Ar.setFromMatrixPosition(X.matrixWorld),se.position.copy(Ar),no.copy(se.position),no.add(N_[ee]),se.up.copy(U_[ee]),se.lookAt(no),se.updateMatrixWorld(),Me.makeTranslation(-Ar.x,-Ar.y,-Ar.z),sd.multiplyMatrices(se.projectionMatrix,se.matrixWorldInverse),S._frustum.setFromProjectionMatrix(sd,se.coordinateSystem,se.reversedDepth)}if(S.map.isWebGLCubeRenderTarget)n.setRenderTarget(S.map,ee),n.clear();else{ee===0&&(n.setRenderTarget(S.map),n.clear());const se=S.getViewport(ee);a.set(s.x*se.x,s.y*se.y,s.x*se.z,s.y*se.w),O.viewport(a)}i=S.getFrustum(ee),v(R,_,ie,X,this.type)}S.isPointLightShadow!==!0&&this.type===Pr&&E(S,_),S.needsUpdate=!1}d=this.type,m.needsUpdate=!1,n.setRenderTarget(T,C,D)};function E(b,R){const _=e.update(M);h.defines.VSM_SAMPLES!==b.blurSamples&&(h.defines.VSM_SAMPLES=b.blurSamples,p.defines.VSM_SAMPLES=b.blurSamples,h.needsUpdate=!0,p.needsUpdate=!0),b.mapPass===null?b.mapPass=new jt(r.x,r.y,{format:Pi,type:rn}):(b.mapPass.width!==b.map.width||b.mapPass.height!==b.map.height)&&b.mapPass.setSize(b.map.width,b.map.height),h.uniforms.shadow_pass.value=b.map.depthTexture,h.uniforms.resolution.value.set(b.map.width,b.map.height),h.uniforms.radius.value=b.radius,n.setRenderTarget(b.mapPass),n.clear(),n.renderBufferDirect(R,null,_,h,M,null),p.uniforms.shadow_pass.value=b.mapPass.texture,p.uniforms.resolution.value.set(b.map.width,b.map.height),p.uniforms.radius.value=b.radius,n.setRenderTarget(b.map),n.clear(),n.renderBufferDirect(R,null,_,p,M,null)}function A(b,R,_,T){let C=null;const D=_.isPointLight===!0?b.customDistanceMaterial:b.customDepthMaterial;if(D!==void 0)C=D;else if(C=_.isPointLight===!0?l:o,n.localClippingEnabled&&R.clipShadows===!0&&Array.isArray(R.clippingPlanes)&&R.clippingPlanes.length!==0||R.displacementMap&&R.displacementScale!==0||R.alphaMap&&R.alphaTest>0||R.map&&R.alphaTest>0||R.alphaToCoverage===!0){const O=C.uuid,H=R.uuid;let F=c[O];F===void 0&&(F={},c[O]=F);let k=F[H];k===void 0&&(k=C.clone(),F[H]=k,R.addEventListener("dispose",w)),C=k}if(C.visible=R.visible,C.wireframe=R.wireframe,T===Pr?C.side=R.shadowSide!==null?R.shadowSide:R.side:C.side=R.shadowSide!==null?R.shadowSide:f[R.side],C.alphaMap=R.alphaMap,C.alphaTest=R.alphaToCoverage===!0?.5:R.alphaTest,C.map=R.map,C.clipShadows=R.clipShadows,C.clippingPlanes=R.clippingPlanes,C.clipIntersection=R.clipIntersection,C.displacementMap=R.displacementMap,C.displacementScale=R.displacementScale,C.displacementBias=R.displacementBias,C.wireframeLinewidth=R.wireframeLinewidth,C.linewidth=R.linewidth,_.isPointLight===!0&&C.isMeshDistanceMaterial===!0){const O=n.properties.get(C);O.light=_}return C}function v(b,R,_,T,C){if(b.visible===!1)return;if(b.layers.test(R.layers)&&(b.isMesh||b.isLine||b.isPoints)&&(b.castShadow||b.receiveShadow&&C===Pr)&&(!b.frustumCulled||b.intersectsFrustum(i))){b.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,b.matrixWorld);const H=e.update(b),F=b.material;if(Array.isArray(F)){const k=H.groups;for(let X=0,S=k.length;X<S;X++){const Q=k[X],W=F[Q.materialIndex];if(W&&W.visible){const j=A(b,W,T,C);b.onBeforeShadow(n,b,R,_,H,j,Q),n.renderBufferDirect(_,null,H,j,b,Q),b.onAfterShadow(n,b,R,_,H,j,Q)}}}else if(F.visible){const k=A(b,F,T,C);b.onBeforeShadow(n,b,R,_,H,k,null),n.renderBufferDirect(_,null,H,k,b,null),b.onAfterShadow(n,b,R,_,H,k,null)}}const O=b.children;for(let H=0,F=O.length;H<F;H++)v(O[H],R,_,T,C)}function w(b){b.target.removeEventListener("dispose",w);for(const _ in c){const T=c[_],C=b.target.uuid;C in T&&(T[C].dispose(),delete T[C])}}}function O_(n,e){function t(){let N=!1;const he=new St;let te=null;const ue=new St(0,0,0,0);return{setMask:function(xe){te!==xe&&!N&&(n.colorMask(xe,xe,xe,xe),te=xe)},setLocked:function(xe){N=xe},setClear:function(xe,re,Pe,we,dt){dt===!0&&(xe*=we,re*=we,Pe*=we),he.set(xe,re,Pe,we),ue.equals(he)===!1&&(n.clearColor(xe,re,Pe,we),ue.copy(he))},reset:function(){N=!1,te=null,ue.set(-1,0,0,0)}}}function i(){let N=!1,he=!1,te=null,ue=null,xe=null;return{setReversed:function(re){if(he!==re){const Pe=e.get("EXT_clip_control");re?Pe.clipControlEXT(Pe.LOWER_LEFT_EXT,Pe.ZERO_TO_ONE_EXT):Pe.clipControlEXT(Pe.LOWER_LEFT_EXT,Pe.NEGATIVE_ONE_TO_ONE_EXT),he=re;const we=xe;xe=null,this.setClear(we)}},getReversed:function(){return he},setTest:function(re){re?Z(n.DEPTH_TEST):le(n.DEPTH_TEST)},setMask:function(re){te!==re&&!N&&(n.depthMask(re),te=re)},setFunc:function(re){if(he&&(re=cf[re]),ue!==re){switch(re){case po:n.depthFunc(n.NEVER);break;case mo:n.depthFunc(n.ALWAYS);break;case go:n.depthFunc(n.LESS);break;case kr:n.depthFunc(n.LEQUAL);break;case _o:n.depthFunc(n.EQUAL);break;case xo:n.depthFunc(n.GEQUAL);break;case vo:n.depthFunc(n.GREATER);break;case So:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}ue=re}},setLocked:function(re){N=re},setClear:function(re){xe!==re&&(xe=re,he&&(re=1-re),n.clearDepth(re))},reset:function(){N=!1,te=null,ue=null,xe=null,he=!1}}}function r(){let N=!1,he=null,te=null,ue=null,xe=null,re=null,Pe=null,we=null,dt=null;return{setTest:function(Je){N||(Je?Z(n.STENCIL_TEST):le(n.STENCIL_TEST))},setMask:function(Je){he!==Je&&!N&&(n.stencilMask(Je),he=Je)},setFunc:function(Je,vn,An){(te!==Je||ue!==vn||xe!==An)&&(n.stencilFunc(Je,vn,An),te=Je,ue=vn,xe=An)},setOp:function(Je,vn,An){(re!==Je||Pe!==vn||we!==An)&&(n.stencilOp(Je,vn,An),re=Je,Pe=vn,we=An)},setLocked:function(Je){N=Je},setClear:function(Je){dt!==Je&&(n.clearStencil(Je),dt=Je)},reset:function(){N=!1,he=null,te=null,ue=null,xe=null,re=null,Pe=null,we=null,dt=null}}}const s=new t,a=new i,o=new r,l=new WeakMap,c=new WeakMap;let u={},f={},h={},p=new WeakMap,g=[],M=null,m=!1,d=null,E=null,A=null,v=null,w=null,b=null,R=null,_=new Le(0,0,0),T=0,C=!1,D=null,O=null,H=null,F=null,k=null;const X=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let S=!1,Q=0;const W=n.getParameter(n.VERSION);W.indexOf("WebGL")!==-1?(Q=parseFloat(/^WebGL (\d)/.exec(W)[1]),S=Q>=1):W.indexOf("OpenGL ES")!==-1&&(Q=parseFloat(/^OpenGL ES (\d)/.exec(W)[1]),S=Q>=2);let j=null,ee={};const ie=n.getParameter(n.SCISSOR_BOX),se=n.getParameter(n.VIEWPORT),Me=new St().fromArray(ie),ve=new St().fromArray(se);function Ue(N,he,te,ue){const xe=new Uint8Array(4),re=n.createTexture();n.bindTexture(N,re),n.texParameteri(N,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(N,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Pe=0;Pe<te;Pe++)N===n.TEXTURE_3D||N===n.TEXTURE_2D_ARRAY?n.texImage3D(he,0,n.RGBA,1,1,ue,0,n.RGBA,n.UNSIGNED_BYTE,xe):n.texImage2D(he+Pe,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,xe);return re}const Y={};Y[n.TEXTURE_2D]=Ue(n.TEXTURE_2D,n.TEXTURE_2D,1),Y[n.TEXTURE_CUBE_MAP]=Ue(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),Y[n.TEXTURE_2D_ARRAY]=Ue(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),Y[n.TEXTURE_3D]=Ue(n.TEXTURE_3D,n.TEXTURE_3D,1,1),s.setClear(0,0,0,1),a.setClear(1),o.setClear(0),Z(n.DEPTH_TEST),a.setFunc(kr),Xe(!1),gt(ac),Z(n.CULL_FACE),Ze(Un);function Z(N){u[N]!==!0&&(n.enable(N),u[N]=!0)}function le(N){u[N]!==!1&&(n.disable(N),u[N]=!1)}function De(N,he){return h[N]!==he?(n.bindFramebuffer(N,he),h[N]=he,N===n.DRAW_FRAMEBUFFER&&(h[n.FRAMEBUFFER]=he),N===n.FRAMEBUFFER&&(h[n.DRAW_FRAMEBUFFER]=he),!0):!1}function _e(N,he){let te=g,ue=!1;if(N){te=p.get(he),te===void 0&&(te=[],p.set(he,te));const xe=N.textures;if(te.length!==xe.length||te[0]!==n.COLOR_ATTACHMENT0){for(let re=0,Pe=xe.length;re<Pe;re++)te[re]=n.COLOR_ATTACHMENT0+re;te.length=xe.length,ue=!0}}else te[0]!==n.BACK&&(te[0]=n.BACK,ue=!0);ue&&n.drawBuffers(te)}function He(N){return M!==N?(n.useProgram(N),M=N,!0):!1}const Pt={[ir]:n.FUNC_ADD,[Pu]:n.FUNC_SUBTRACT,[Du]:n.FUNC_REVERSE_SUBTRACT};Pt[Lu]=n.MIN,Pt[Iu]=n.MAX;const Ve={[Nu]:n.ZERO,[Uu]:n.ONE,[Fu]:n.SRC_COLOR,[Td]:n.SRC_ALPHA,[Hu]:n.SRC_ALPHA_SATURATE,[zu]:n.DST_COLOR,[Bu]:n.DST_ALPHA,[Ou]:n.ONE_MINUS_SRC_COLOR,[Ad]:n.ONE_MINUS_SRC_ALPHA,[Gu]:n.ONE_MINUS_DST_COLOR,[ku]:n.ONE_MINUS_DST_ALPHA,[Vu]:n.CONSTANT_COLOR,[Wu]:n.ONE_MINUS_CONSTANT_COLOR,[Xu]:n.CONSTANT_ALPHA,[qu]:n.ONE_MINUS_CONSTANT_ALPHA};function Ze(N,he,te,ue,xe,re,Pe,we,dt,Je){if(N===Un){m===!0&&(le(n.BLEND),m=!1);return}if(m===!1&&(Z(n.BLEND),m=!0),N!==Cu){if(N!==d||Je!==C){if((E!==ir||w!==ir)&&(n.blendEquation(n.FUNC_ADD),E=ir,w=ir),Je)switch(N){case Nr:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Xs:n.blendFunc(n.ONE,n.ONE);break;case oc:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case lc:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:Ke("WebGLState: Invalid blending: ",N);break}else switch(N){case Nr:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Xs:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case oc:Ke("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case lc:Ke("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ke("WebGLState: Invalid blending: ",N);break}A=null,v=null,b=null,R=null,_.set(0,0,0),T=0,d=N,C=Je}return}xe=xe||he,re=re||te,Pe=Pe||ue,(he!==E||xe!==w)&&(n.blendEquationSeparate(Pt[he],Pt[xe]),E=he,w=xe),(te!==A||ue!==v||re!==b||Pe!==R)&&(n.blendFuncSeparate(Ve[te],Ve[ue],Ve[re],Ve[Pe]),A=te,v=ue,b=re,R=Pe),(we.equals(_)===!1||dt!==T)&&(n.blendColor(we.r,we.g,we.b,dt),_.copy(we),T=dt),d=N,C=!1}function ct(N,he){N.side===ln?le(n.CULL_FACE):Z(n.CULL_FACE);let te=N.side===nn;he&&(te=!te),Xe(te),N.blending===Nr&&N.transparent===!1?Ze(Un):Ze(N.blending,N.blendEquation,N.blendSrc,N.blendDst,N.blendEquationAlpha,N.blendSrcAlpha,N.blendDstAlpha,N.blendColor,N.blendAlpha,N.premultipliedAlpha),a.setFunc(N.depthFunc),a.setTest(N.depthTest),a.setMask(N.depthWrite),s.setMask(N.colorWrite);const ue=N.stencilWrite;o.setTest(ue),ue&&(o.setMask(N.stencilWriteMask),o.setFunc(N.stencilFunc,N.stencilRef,N.stencilFuncMask),o.setOp(N.stencilFail,N.stencilZFail,N.stencilZPass)),en(N.polygonOffset,N.polygonOffsetFactor,N.polygonOffsetUnits),N.alphaToCoverage===!0?Z(n.SAMPLE_ALPHA_TO_COVERAGE):le(n.SAMPLE_ALPHA_TO_COVERAGE)}function Xe(N){D!==N&&(N?n.frontFace(n.CW):n.frontFace(n.CCW),D=N)}function gt(N){N!==Tu?(Z(n.CULL_FACE),N!==O&&(N===ac?n.cullFace(n.BACK):N===Au?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):le(n.CULL_FACE),O=N}function Ut(N){N!==H&&(S&&n.lineWidth(N),H=N)}function en(N,he,te){N?(Z(n.POLYGON_OFFSET_FILL),(F!==he||k!==te)&&(F=he,k=te,a.getReversed()&&(he=-he),n.polygonOffset(he,te))):le(n.POLYGON_OFFSET_FILL)}function xt(N){N?Z(n.SCISSOR_TEST):le(n.SCISSOR_TEST)}function wt(N){N===void 0&&(N=n.TEXTURE0+X-1),j!==N&&(n.activeTexture(N),j=N)}function U(N,he,te){te===void 0&&(j===null?te=n.TEXTURE0+X-1:te=j);let ue=ee[te];ue===void 0&&(ue={type:void 0,texture:void 0},ee[te]=ue),(ue.type!==N||ue.texture!==he)&&(j!==te&&(n.activeTexture(te),j=te),n.bindTexture(N,he||Y[N]),ue.type=N,ue.texture=he)}function kt(){const N=ee[j];N!==void 0&&N.type!==void 0&&(n.bindTexture(N.type,null),N.type=void 0,N.texture=void 0)}function je(){try{n.compressedTexImage2D(...arguments)}catch(N){Ke("WebGLState:",N)}}function P(){try{n.compressedTexImage3D(...arguments)}catch(N){Ke("WebGLState:",N)}}function x(){try{n.texSubImage2D(...arguments)}catch(N){Ke("WebGLState:",N)}}function B(){try{n.texSubImage3D(...arguments)}catch(N){Ke("WebGLState:",N)}}function V(){try{n.compressedTexSubImage2D(...arguments)}catch(N){Ke("WebGLState:",N)}}function K(){try{n.compressedTexSubImage3D(...arguments)}catch(N){Ke("WebGLState:",N)}}function ae(){try{n.texStorage2D(...arguments)}catch(N){Ke("WebGLState:",N)}}function oe(){try{n.texStorage3D(...arguments)}catch(N){Ke("WebGLState:",N)}}function J(){try{n.texImage2D(...arguments)}catch(N){Ke("WebGLState:",N)}}function ne(){try{n.texImage3D(...arguments)}catch(N){Ke("WebGLState:",N)}}function ce(N){return f[N]!==void 0?f[N]:n.getParameter(N)}function Re(N,he){f[N]!==he&&(n.pixelStorei(N,he),f[N]=he)}function fe(N){Me.equals(N)===!1&&(n.scissor(N.x,N.y,N.z,N.w),Me.copy(N))}function de(N){ve.equals(N)===!1&&(n.viewport(N.x,N.y,N.z,N.w),ve.copy(N))}function Ce(N,he){let te=c.get(he);te===void 0&&(te=new WeakMap,c.set(he,te));let ue=te.get(N);ue===void 0&&(ue=n.getUniformBlockIndex(he,N.name),te.set(N,ue))}function Ie(N,he){const ue=c.get(he).get(N);l.get(he)!==ue&&(n.uniformBlockBinding(he,ue,N.__bindingPointIndex),l.set(he,ue))}function Oe(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),a.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),n.pixelStorei(n.PACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,!1),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,n.BROWSER_DEFAULT_WEBGL),n.pixelStorei(n.PACK_ROW_LENGTH,0),n.pixelStorei(n.PACK_SKIP_PIXELS,0),n.pixelStorei(n.PACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_ROW_LENGTH,0),n.pixelStorei(n.UNPACK_IMAGE_HEIGHT,0),n.pixelStorei(n.UNPACK_SKIP_PIXELS,0),n.pixelStorei(n.UNPACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_SKIP_IMAGES,0),u={},f={},j=null,ee={},h={},p=new WeakMap,g=[],M=null,m=!1,d=null,E=null,A=null,v=null,w=null,b=null,R=null,_=new Le(0,0,0),T=0,C=!1,D=null,O=null,H=null,F=null,k=null,Me.set(0,0,n.canvas.width,n.canvas.height),ve.set(0,0,n.canvas.width,n.canvas.height),s.reset(),a.reset(),o.reset()}return{buffers:{color:s,depth:a,stencil:o},enable:Z,disable:le,bindFramebuffer:De,drawBuffers:_e,useProgram:He,setBlending:Ze,setMaterial:ct,setFlipSided:Xe,setCullFace:gt,setLineWidth:Ut,setPolygonOffset:en,setScissorTest:xt,activeTexture:wt,bindTexture:U,unbindTexture:kt,compressedTexImage2D:je,compressedTexImage3D:P,texImage2D:J,texImage3D:ne,pixelStorei:Re,getParameter:ce,updateUBOMapping:Ce,uniformBlockBinding:Ie,texStorage2D:ae,texStorage3D:oe,texSubImage2D:x,texSubImage3D:B,compressedTexSubImage2D:V,compressedTexSubImage3D:K,scissor:fe,viewport:de,reset:Oe}}function B_(n,e,t,i,r,s,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Ae,u=new WeakMap,f=new Set;let h;const p=new WeakMap;let g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function M(P,x){return g?new OffscreenCanvas(P,x):Js("canvas")}function m(P,x,B){let V=1;const K=je(P);if((K.width>B||K.height>B)&&(V=B/Math.max(K.width,K.height)),V<1)if(typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&P instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&P instanceof ImageBitmap||typeof VideoFrame<"u"&&P instanceof VideoFrame){const ae=Math.floor(V*K.width),oe=Math.floor(V*K.height);h===void 0&&(h=M(ae,oe));const J=x?M(ae,oe):h;return J.width=ae,J.height=oe,J.getContext("2d").drawImage(P,0,0,ae,oe),Ne("WebGLRenderer: Texture has been resized from ("+K.width+"x"+K.height+") to ("+ae+"x"+oe+")."),J}else return"data"in P&&Ne("WebGLRenderer: Image in DataTexture is too big ("+K.width+"x"+K.height+")."),P;return P}function d(P){return P.generateMipmaps}function E(P){n.generateMipmap(P)}function A(P){return P.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:P.isWebGL3DRenderTarget?n.TEXTURE_3D:P.isWebGLArrayRenderTarget||P.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function v(P,x,B,V,K,ae=!1){if(P!==null){if(n[P]!==void 0)return n[P];Ne("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+P+"'")}let oe;V&&(oe=e.get("EXT_texture_norm16"),oe||Ne("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let J=x;if(x===n.RED&&(B===n.FLOAT&&(J=n.R32F),B===n.HALF_FLOAT&&(J=n.R16F),B===n.UNSIGNED_BYTE&&(J=n.R8),B===n.UNSIGNED_SHORT&&oe&&(J=oe.R16_EXT),B===n.SHORT&&oe&&(J=oe.R16_SNORM_EXT)),x===n.RED_INTEGER&&(B===n.UNSIGNED_BYTE&&(J=n.R8UI),B===n.UNSIGNED_SHORT&&(J=n.R16UI),B===n.UNSIGNED_INT&&(J=n.R32UI),B===n.BYTE&&(J=n.R8I),B===n.SHORT&&(J=n.R16I),B===n.INT&&(J=n.R32I)),x===n.RG&&(B===n.FLOAT&&(J=n.RG32F),B===n.HALF_FLOAT&&(J=n.RG16F),B===n.UNSIGNED_BYTE&&(J=n.RG8),B===n.UNSIGNED_SHORT&&oe&&(J=oe.RG16_EXT),B===n.SHORT&&oe&&(J=oe.RG16_SNORM_EXT)),x===n.RG_INTEGER&&(B===n.UNSIGNED_BYTE&&(J=n.RG8UI),B===n.UNSIGNED_SHORT&&(J=n.RG16UI),B===n.UNSIGNED_INT&&(J=n.RG32UI),B===n.BYTE&&(J=n.RG8I),B===n.SHORT&&(J=n.RG16I),B===n.INT&&(J=n.RG32I)),x===n.RGB_INTEGER&&(B===n.UNSIGNED_BYTE&&(J=n.RGB8UI),B===n.UNSIGNED_SHORT&&(J=n.RGB16UI),B===n.UNSIGNED_INT&&(J=n.RGB32UI),B===n.BYTE&&(J=n.RGB8I),B===n.SHORT&&(J=n.RGB16I),B===n.INT&&(J=n.RGB32I)),x===n.RGBA_INTEGER&&(B===n.UNSIGNED_BYTE&&(J=n.RGBA8UI),B===n.UNSIGNED_SHORT&&(J=n.RGBA16UI),B===n.UNSIGNED_INT&&(J=n.RGBA32UI),B===n.BYTE&&(J=n.RGBA8I),B===n.SHORT&&(J=n.RGBA16I),B===n.INT&&(J=n.RGBA32I)),x===n.RGB&&(B===n.UNSIGNED_SHORT&&oe&&(J=oe.RGB16_EXT),B===n.SHORT&&oe&&(J=oe.RGB16_SNORM_EXT),B===n.UNSIGNED_INT_5_9_9_9_REV&&(J=n.RGB9_E5),B===n.UNSIGNED_INT_10F_11F_11F_REV&&(J=n.R11F_G11F_B10F)),x===n.RGBA){const ne=ae?Zs:qe.getTransfer(K);B===n.FLOAT&&(J=n.RGBA32F),B===n.HALF_FLOAT&&(J=n.RGBA16F),B===n.UNSIGNED_BYTE&&(J=ne===et?n.SRGB8_ALPHA8:n.RGBA8),B===n.UNSIGNED_SHORT&&oe&&(J=oe.RGBA16_EXT),B===n.SHORT&&oe&&(J=oe.RGBA16_SNORM_EXT),B===n.UNSIGNED_SHORT_4_4_4_4&&(J=n.RGBA4),B===n.UNSIGNED_SHORT_5_5_5_1&&(J=n.RGB5_A1)}return(J===n.R16F||J===n.R32F||J===n.RG16F||J===n.RG32F||J===n.RGBA16F||J===n.RGBA32F)&&e.get("EXT_color_buffer_float"),J}function w(P,x){let B;return P?x===null||x===On||x===Gr?B=n.DEPTH24_STENCIL8:x===In?B=n.DEPTH32F_STENCIL8:x===zr&&(B=n.DEPTH24_STENCIL8,Ne("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===On||x===Gr?B=n.DEPTH_COMPONENT24:x===In?B=n.DEPTH_COMPONENT32F:x===zr&&(B=n.DEPTH_COMPONENT16),B}function b(P,x){return d(P)===!0||P.isFramebufferTexture&&P.minFilter!==Bt&&P.minFilter!==qt?Math.log2(Math.max(x.width,x.height))+1:P.mipmaps!==void 0&&P.mipmaps.length>0?P.mipmaps.length:P.isCompressedTexture&&Array.isArray(P.image)?x.mipmaps.length:1}function R(P){const x=P.target;x.removeEventListener("dispose",R),T(x),x.isVideoTexture&&u.delete(x),x.isHTMLTexture&&f.delete(x)}function _(P){const x=P.target;x.removeEventListener("dispose",_),D(x)}function T(P){const x=i.get(P);if(x.__webglInit===void 0)return;const B=P.source,V=p.get(B);if(V){const K=V[x.__cacheKey];K.usedTimes--,K.usedTimes===0&&C(P),Object.keys(V).length===0&&p.delete(B)}i.remove(P)}function C(P){const x=i.get(P);n.deleteTexture(x.__webglTexture);const B=P.source,V=p.get(B);delete V[x.__cacheKey],a.memory.textures--}function D(P){const x=i.get(P);if(P.depthTexture&&(P.depthTexture.dispose(),i.remove(P.depthTexture)),P.isWebGLCubeRenderTarget)for(let V=0;V<6;V++){if(Array.isArray(x.__webglFramebuffer[V]))for(let K=0;K<x.__webglFramebuffer[V].length;K++)n.deleteFramebuffer(x.__webglFramebuffer[V][K]);else n.deleteFramebuffer(x.__webglFramebuffer[V]);x.__webglDepthbuffer&&n.deleteRenderbuffer(x.__webglDepthbuffer[V])}else{if(Array.isArray(x.__webglFramebuffer))for(let V=0;V<x.__webglFramebuffer.length;V++)n.deleteFramebuffer(x.__webglFramebuffer[V]);else n.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&n.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&n.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let V=0;V<x.__webglColorRenderbuffer.length;V++)x.__webglColorRenderbuffer[V]&&n.deleteRenderbuffer(x.__webglColorRenderbuffer[V]);x.__webglDepthRenderbuffer&&n.deleteRenderbuffer(x.__webglDepthRenderbuffer)}const B=P.textures;for(let V=0,K=B.length;V<K;V++){const ae=i.get(B[V]);ae.__webglTexture&&(n.deleteTexture(ae.__webglTexture),a.memory.textures--),i.remove(B[V])}i.remove(P)}let O=0;function H(){O=0}function F(){return O}function k(P){O=P}function X(){const P=O;return P>=r.maxTextures&&Ne("WebGLTextures: Trying to use "+(P+1)+" texture units while this GPU supports only "+r.maxTextures),O+=1,P}function S(P){const x=[];return x.push(P.wrapS),x.push(P.wrapT),x.push(P.wrapR||0),x.push(P.magFilter),x.push(P.minFilter),x.push(P.anisotropy),x.push(P.internalFormat),x.push(P.format),x.push(P.type),x.push(P.generateMipmaps),x.push(P.premultiplyAlpha),x.push(P.flipY),x.push(P.unpackAlignment),x.push(P.colorSpace),x.join()}function Q(P,x){const B=i.get(P);if(P.isVideoTexture&&U(P),P.isRenderTargetTexture===!1&&P.isExternalTexture!==!0&&P.version>0&&B.__version!==P.version){const V=P.image;if(V===null)Ne("WebGLRenderer: Texture marked for update but no image data found.");else if(V.complete===!1)Ne("WebGLRenderer: Texture marked for update but image is incomplete");else{le(B,P,x);return}}else P.isExternalTexture&&(B.__webglTexture=P.sourceTexture?P.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,B.__webglTexture,n.TEXTURE0+x)}function W(P,x){const B=i.get(P);if(P.isRenderTargetTexture===!1&&P.version>0&&B.__version!==P.version){le(B,P,x);return}else P.isExternalTexture&&(B.__webglTexture=P.sourceTexture?P.sourceTexture:null);t.bindTexture(n.TEXTURE_2D_ARRAY,B.__webglTexture,n.TEXTURE0+x)}function j(P,x){const B=i.get(P);if(P.isRenderTargetTexture===!1&&P.version>0&&B.__version!==P.version){le(B,P,x);return}t.bindTexture(n.TEXTURE_3D,B.__webglTexture,n.TEXTURE0+x)}function ee(P,x){const B=i.get(P);if(P.isCubeDepthTexture!==!0&&P.version>0&&B.__version!==P.version){De(B,P,x);return}t.bindTexture(n.TEXTURE_CUBE_MAP,B.__webglTexture,n.TEXTURE0+x)}const ie={[Mo]:n.REPEAT,[Xn]:n.CLAMP_TO_EDGE,[yo]:n.MIRRORED_REPEAT},se={[Bt]:n.NEAREST,[Ku]:n.NEAREST_MIPMAP_NEAREST,[as]:n.NEAREST_MIPMAP_LINEAR,[qt]:n.LINEAR,[Ea]:n.LINEAR_MIPMAP_NEAREST,[Ei]:n.LINEAR_MIPMAP_LINEAR},Me={[ju]:n.NEVER,[sf]:n.ALWAYS,[ef]:n.LESS,[Sl]:n.LEQUAL,[tf]:n.EQUAL,[Ml]:n.GEQUAL,[nf]:n.GREATER,[rf]:n.NOTEQUAL};function ve(P,x){if(x.type===In&&e.has("OES_texture_float_linear")===!1&&(x.magFilter===qt||x.magFilter===Ea||x.magFilter===as||x.magFilter===Ei||x.minFilter===qt||x.minFilter===Ea||x.minFilter===as||x.minFilter===Ei)&&Ne("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(P,n.TEXTURE_WRAP_S,ie[x.wrapS]),n.texParameteri(P,n.TEXTURE_WRAP_T,ie[x.wrapT]),(P===n.TEXTURE_3D||P===n.TEXTURE_2D_ARRAY)&&n.texParameteri(P,n.TEXTURE_WRAP_R,ie[x.wrapR]),n.texParameteri(P,n.TEXTURE_MAG_FILTER,se[x.magFilter]),n.texParameteri(P,n.TEXTURE_MIN_FILTER,se[x.minFilter]),x.compareFunction&&(n.texParameteri(P,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(P,n.TEXTURE_COMPARE_FUNC,Me[x.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===Bt||x.minFilter!==as&&x.minFilter!==Ei||x.type===In&&e.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||i.get(x).__currentAnisotropy){const B=e.get("EXT_texture_filter_anisotropic");n.texParameterf(P,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,r.getMaxAnisotropy())),i.get(x).__currentAnisotropy=x.anisotropy}}}function Ue(P,x){let B=!1;P.__webglInit===void 0&&(P.__webglInit=!0,x.addEventListener("dispose",R));const V=x.source;let K=p.get(V);K===void 0&&(K={},p.set(V,K));const ae=S(x);if(ae!==P.__cacheKey){K[ae]===void 0&&(K[ae]={texture:n.createTexture(),usedTimes:0},a.memory.textures++,B=!0),K[ae].usedTimes++;const oe=K[P.__cacheKey];oe!==void 0&&(K[P.__cacheKey].usedTimes--,oe.usedTimes===0&&C(x)),P.__cacheKey=ae,P.__webglTexture=K[ae].texture}return B}function Y(P,x,B){return Math.floor(Math.floor(P/B)/x)}function Z(P,x,B,V){const ae=P.updateRanges;if(ae.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,x.width,x.height,B,V,x.data);else{ae.sort((Re,fe)=>Re.start-fe.start);let oe=0;for(let Re=1;Re<ae.length;Re++){const fe=ae[oe],de=ae[Re],Ce=fe.start+fe.count,Ie=Y(de.start,x.width,4),Oe=Y(fe.start,x.width,4);de.start<=Ce+1&&Ie===Oe&&Y(de.start+de.count-1,x.width,4)===Ie?fe.count=Math.max(fe.count,de.start+de.count-fe.start):(++oe,ae[oe]=de)}ae.length=oe+1;const J=t.getParameter(n.UNPACK_ROW_LENGTH),ne=t.getParameter(n.UNPACK_SKIP_PIXELS),ce=t.getParameter(n.UNPACK_SKIP_ROWS);t.pixelStorei(n.UNPACK_ROW_LENGTH,x.width);for(let Re=0,fe=ae.length;Re<fe;Re++){const de=ae[Re],Ce=Math.floor(de.start/4),Ie=Math.ceil(de.count/4),Oe=Ce%x.width,N=Math.floor(Ce/x.width),he=Ie,te=1;t.pixelStorei(n.UNPACK_SKIP_PIXELS,Oe),t.pixelStorei(n.UNPACK_SKIP_ROWS,N),t.texSubImage2D(n.TEXTURE_2D,0,Oe,N,he,te,B,V,x.data)}P.clearUpdateRanges(),t.pixelStorei(n.UNPACK_ROW_LENGTH,J),t.pixelStorei(n.UNPACK_SKIP_PIXELS,ne),t.pixelStorei(n.UNPACK_SKIP_ROWS,ce)}}function le(P,x,B){let V=n.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(V=n.TEXTURE_2D_ARRAY),x.isData3DTexture&&(V=n.TEXTURE_3D);const K=Ue(P,x),ae=x.source;t.bindTexture(V,P.__webglTexture,n.TEXTURE0+B);const oe=i.get(ae);if(ae.version!==oe.__version||K===!0){if(t.activeTexture(n.TEXTURE0+B),(typeof ImageBitmap<"u"&&x.image instanceof ImageBitmap)===!1){const te=qe.getPrimaries(qe.workingColorSpace),ue=x.colorSpace===li?null:qe.getPrimaries(x.colorSpace),xe=x.colorSpace===li||te===ue?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,xe)}t.pixelStorei(n.UNPACK_ALIGNMENT,x.unpackAlignment);let ne=m(x.image,!1,r.maxTextureSize);ne=kt(x,ne);const ce=s.convert(x.format,x.colorSpace),Re=s.convert(x.type);let fe=v(x.internalFormat,ce,Re,x.normalized,x.colorSpace,x.isVideoTexture);ve(V,x);let de;const Ce=x.mipmaps,Ie=x.isVideoTexture!==!0,Oe=oe.__version===void 0||K===!0,N=ae.dataReady,he=b(x,ne);if(x.isDepthTexture)fe=w(x.format===wi,x.type),Oe&&(Ie?t.texStorage2D(n.TEXTURE_2D,1,fe,ne.width,ne.height):t.texImage2D(n.TEXTURE_2D,0,fe,ne.width,ne.height,0,ce,Re,null));else if(x.isDataTexture)if(Ce.length>0){Ie&&Oe&&t.texStorage2D(n.TEXTURE_2D,he,fe,Ce[0].width,Ce[0].height);for(let te=0,ue=Ce.length;te<ue;te++)de=Ce[te],Ie?N&&t.texSubImage2D(n.TEXTURE_2D,te,0,0,de.width,de.height,ce,Re,de.data):t.texImage2D(n.TEXTURE_2D,te,fe,de.width,de.height,0,ce,Re,de.data);x.generateMipmaps=!1}else Ie?(Oe&&t.texStorage2D(n.TEXTURE_2D,he,fe,ne.width,ne.height),N&&Z(x,ne,ce,Re)):t.texImage2D(n.TEXTURE_2D,0,fe,ne.width,ne.height,0,ce,Re,ne.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){Ie&&Oe&&t.texStorage3D(n.TEXTURE_2D_ARRAY,he,fe,Ce[0].width,Ce[0].height,ne.depth);for(let te=0,ue=Ce.length;te<ue;te++)if(de=Ce[te],x.format!==wn)if(ce!==null)if(Ie){if(N)if(x.layerUpdates.size>0){const xe=Oc(de.width,de.height,x.format,x.type);for(const re of x.layerUpdates){const Pe=de.data.subarray(re*xe/de.data.BYTES_PER_ELEMENT,(re+1)*xe/de.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,te,0,0,re,de.width,de.height,1,ce,Pe)}}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,te,0,0,0,de.width,de.height,ne.depth,ce,de.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,te,fe,de.width,de.height,ne.depth,0,de.data,0,0);else Ne("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ie?N&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,te,0,0,0,de.width,de.height,ne.depth,ce,Re,de.data):t.texImage3D(n.TEXTURE_2D_ARRAY,te,fe,de.width,de.height,ne.depth,0,ce,Re,de.data);x.layerUpdates.size>0&&x.clearLayerUpdates()}else{Ie&&Oe&&t.texStorage2D(n.TEXTURE_2D,he,fe,Ce[0].width,Ce[0].height);for(let te=0,ue=Ce.length;te<ue;te++)de=Ce[te],x.format!==wn?ce!==null?Ie?N&&t.compressedTexSubImage2D(n.TEXTURE_2D,te,0,0,de.width,de.height,ce,de.data):t.compressedTexImage2D(n.TEXTURE_2D,te,fe,de.width,de.height,0,de.data):Ne("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ie?N&&t.texSubImage2D(n.TEXTURE_2D,te,0,0,de.width,de.height,ce,Re,de.data):t.texImage2D(n.TEXTURE_2D,te,fe,de.width,de.height,0,ce,Re,de.data)}else if(x.isDataArrayTexture)if(Ie){if(Oe&&t.texStorage3D(n.TEXTURE_2D_ARRAY,he,fe,ne.width,ne.height,ne.depth),N)if(x.layerUpdates.size>0){const te=Oc(ne.width,ne.height,x.format,x.type);for(const ue of x.layerUpdates){const xe=ne.data.subarray(ue*te/ne.data.BYTES_PER_ELEMENT,(ue+1)*te/ne.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,ue,ne.width,ne.height,1,ce,Re,xe)}x.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,ne.width,ne.height,ne.depth,ce,Re,ne.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,fe,ne.width,ne.height,ne.depth,0,ce,Re,ne.data);else if(x.isData3DTexture)Ie?(Oe&&t.texStorage3D(n.TEXTURE_3D,he,fe,ne.width,ne.height,ne.depth),N&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,ne.width,ne.height,ne.depth,ce,Re,ne.data)):t.texImage3D(n.TEXTURE_3D,0,fe,ne.width,ne.height,ne.depth,0,ce,Re,ne.data);else if(x.isFramebufferTexture){if(Oe)if(Ie)t.texStorage2D(n.TEXTURE_2D,he,fe,ne.width,ne.height);else{let te=ne.width,ue=ne.height;for(let xe=0;xe<he;xe++)t.texImage2D(n.TEXTURE_2D,xe,fe,te,ue,0,ce,Re,null),te>>=1,ue>>=1}}else if(x.isHTMLTexture){if("texElementImage2D"in n){const te=n.canvas;if(te.hasAttribute("layoutsubtree")||te.setAttribute("layoutsubtree","true"),ne.parentNode!==te){te.appendChild(ne),f.add(x),te.onpaint=ue=>{const xe=ue.changedElements;for(const re of f)xe.includes(re.image)&&(re.needsUpdate=!0)},te.requestPaint();return}if(n.texElementImage2D.length===3)n.texElementImage2D(n.TEXTURE_2D,n.RGBA8,ne);else{const xe=n.RGBA,re=n.RGBA,Pe=n.UNSIGNED_BYTE;n.texElementImage2D(n.TEXTURE_2D,0,xe,re,Pe,ne)}n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE)}}else if(Ce.length>0){if(Ie&&Oe){const te=je(Ce[0]);t.texStorage2D(n.TEXTURE_2D,he,fe,te.width,te.height)}for(let te=0,ue=Ce.length;te<ue;te++)de=Ce[te],Ie?N&&t.texSubImage2D(n.TEXTURE_2D,te,0,0,ce,Re,de):t.texImage2D(n.TEXTURE_2D,te,fe,ce,Re,de);x.generateMipmaps=!1}else if(Ie){if(Oe){const te=je(ne);t.texStorage2D(n.TEXTURE_2D,he,fe,te.width,te.height)}N&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,ce,Re,ne)}else t.texImage2D(n.TEXTURE_2D,0,fe,ce,Re,ne);d(x)&&E(V),oe.__version=ae.version,x.onUpdate&&x.onUpdate(x)}P.__version=x.version}function De(P,x,B){if(x.image.length!==6)return;const V=Ue(P,x),K=x.source;t.bindTexture(n.TEXTURE_CUBE_MAP,P.__webglTexture,n.TEXTURE0+B);const ae=i.get(K);if(K.version!==ae.__version||V===!0){t.activeTexture(n.TEXTURE0+B);const oe=qe.getPrimaries(qe.workingColorSpace),J=x.colorSpace===li?null:qe.getPrimaries(x.colorSpace),ne=x.colorSpace===li||oe===J?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(n.UNPACK_ALIGNMENT,x.unpackAlignment),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,ne);const ce=x.isCompressedTexture||x.image[0].isCompressedTexture,Re=x.image[0]&&x.image[0].isDataTexture,fe=[];for(let re=0;re<6;re++)!ce&&!Re?fe[re]=m(x.image[re],!0,r.maxCubemapSize):fe[re]=Re?x.image[re].image:x.image[re],fe[re]=kt(x,fe[re]);const de=fe[0],Ce=s.convert(x.format,x.colorSpace),Ie=s.convert(x.type),Oe=v(x.internalFormat,Ce,Ie,x.normalized,x.colorSpace),N=x.isVideoTexture!==!0,he=ae.__version===void 0||V===!0,te=K.dataReady;let ue=b(x,de);ve(n.TEXTURE_CUBE_MAP,x);let xe;if(ce){N&&he&&t.texStorage2D(n.TEXTURE_CUBE_MAP,ue,Oe,de.width,de.height);for(let re=0;re<6;re++){xe=fe[re].mipmaps;for(let Pe=0;Pe<xe.length;Pe++){const we=xe[Pe];x.format!==wn?Ce!==null?N?te&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,Pe,0,0,we.width,we.height,Ce,we.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,Pe,Oe,we.width,we.height,0,we.data):Ne("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):N?te&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,Pe,0,0,we.width,we.height,Ce,Ie,we.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,Pe,Oe,we.width,we.height,0,Ce,Ie,we.data)}}}else{if(xe=x.mipmaps,N&&he){xe.length>0&&ue++;const re=je(fe[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,ue,Oe,re.width,re.height)}for(let re=0;re<6;re++)if(Re){N?te&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,0,0,0,fe[re].width,fe[re].height,Ce,Ie,fe[re].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,0,Oe,fe[re].width,fe[re].height,0,Ce,Ie,fe[re].data);for(let Pe=0;Pe<xe.length;Pe++){const dt=xe[Pe].image[re].image;N?te&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,Pe+1,0,0,dt.width,dt.height,Ce,Ie,dt.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,Pe+1,Oe,dt.width,dt.height,0,Ce,Ie,dt.data)}}else{N?te&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,0,0,0,Ce,Ie,fe[re]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,0,Oe,Ce,Ie,fe[re]);for(let Pe=0;Pe<xe.length;Pe++){const we=xe[Pe];N?te&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,Pe+1,0,0,Ce,Ie,we.image[re]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,Pe+1,Oe,Ce,Ie,we.image[re])}}}d(x)&&E(n.TEXTURE_CUBE_MAP),ae.__version=K.version,x.onUpdate&&x.onUpdate(x)}P.__version=x.version}function _e(P,x,B,V,K,ae){const oe=s.convert(B.format,B.colorSpace),J=s.convert(B.type),ne=v(B.internalFormat,oe,J,B.normalized,B.colorSpace),ce=i.get(x),Re=i.get(B);if(Re.__renderTarget=x,!ce.__hasExternalTextures){const fe=Math.max(1,x.width>>ae),de=Math.max(1,x.height>>ae);K===n.TEXTURE_3D||K===n.TEXTURE_2D_ARRAY?t.texImage3D(K,ae,ne,fe,de,x.depth,0,oe,J,null):t.texImage2D(K,ae,ne,fe,de,0,oe,J,null)}t.bindFramebuffer(n.FRAMEBUFFER,P),wt(x)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,V,K,Re.__webglTexture,0,xt(x)):(K===n.TEXTURE_2D||K>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&K<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,V,K,Re.__webglTexture,ae),t.bindFramebuffer(n.FRAMEBUFFER,null)}function He(P,x,B){if(n.bindRenderbuffer(n.RENDERBUFFER,P),x.depthBuffer){const V=x.depthTexture,K=V&&V.isDepthTexture?V.type:null,ae=w(x.stencilBuffer,K),oe=x.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;wt(x)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,xt(x),ae,x.width,x.height):B?n.renderbufferStorageMultisample(n.RENDERBUFFER,xt(x),ae,x.width,x.height):n.renderbufferStorage(n.RENDERBUFFER,ae,x.width,x.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,oe,n.RENDERBUFFER,P)}else{const V=x.textures;for(let K=0;K<V.length;K++){const ae=V[K],oe=s.convert(ae.format,ae.colorSpace),J=s.convert(ae.type),ne=v(ae.internalFormat,oe,J,ae.normalized,ae.colorSpace);wt(x)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,xt(x),ne,x.width,x.height):B?n.renderbufferStorageMultisample(n.RENDERBUFFER,xt(x),ne,x.width,x.height):n.renderbufferStorage(n.RENDERBUFFER,ne,x.width,x.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function Pt(P,x,B){const V=x.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(n.FRAMEBUFFER,P),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const K=i.get(x.depthTexture);if(K.__renderTarget=x,(!K.__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),V){if(K.__webglInit===void 0&&(K.__webglInit=!0,x.depthTexture.addEventListener("dispose",R)),K.__webglTexture===void 0){K.__webglTexture=n.createTexture(),t.bindTexture(n.TEXTURE_CUBE_MAP,K.__webglTexture),ve(n.TEXTURE_CUBE_MAP,x.depthTexture);const ce=s.convert(x.depthTexture.format),Re=s.convert(x.depthTexture.type);let fe;x.depthTexture.format===$n?fe=n.DEPTH_COMPONENT24:x.depthTexture.format===wi&&(fe=n.DEPTH24_STENCIL8);for(let de=0;de<6;de++)n.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,fe,x.width,x.height,0,ce,Re,null)}}else Q(x.depthTexture,0);const ae=K.__webglTexture,oe=xt(x),J=V?n.TEXTURE_CUBE_MAP_POSITIVE_X+B:n.TEXTURE_2D,ne=x.depthTexture.format===wi?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;if(x.depthTexture.format===$n)wt(x)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,ne,J,ae,0,oe):n.framebufferTexture2D(n.FRAMEBUFFER,ne,J,ae,0);else if(x.depthTexture.format===wi)wt(x)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,ne,J,ae,0,oe):n.framebufferTexture2D(n.FRAMEBUFFER,ne,J,ae,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Ve(P){const x=i.get(P),B=P.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==P.depthTexture){const V=P.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),V){const K=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,V.removeEventListener("dispose",K)};V.addEventListener("dispose",K),x.__depthDisposeCallback=K}x.__boundDepthTexture=V}if(P.depthTexture&&!x.__autoAllocateDepthBuffer)if(B)for(let V=0;V<6;V++)Pt(x.__webglFramebuffer[V],P,V);else{const V=P.texture.mipmaps;V&&V.length>0?Pt(x.__webglFramebuffer[0],P,0):Pt(x.__webglFramebuffer,P,0)}else if(B){x.__webglDepthbuffer=[];for(let V=0;V<6;V++)if(t.bindFramebuffer(n.FRAMEBUFFER,x.__webglFramebuffer[V]),x.__webglDepthbuffer[V]===void 0)x.__webglDepthbuffer[V]=n.createRenderbuffer(),He(x.__webglDepthbuffer[V],P,!1);else{const K=P.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ae=x.__webglDepthbuffer[V];n.bindRenderbuffer(n.RENDERBUFFER,ae),n.framebufferRenderbuffer(n.FRAMEBUFFER,K,n.RENDERBUFFER,ae)}}else{const V=P.texture.mipmaps;if(V&&V.length>0?t.bindFramebuffer(n.FRAMEBUFFER,x.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=n.createRenderbuffer(),He(x.__webglDepthbuffer,P,!1);else{const K=P.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ae=x.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,ae),n.framebufferRenderbuffer(n.FRAMEBUFFER,K,n.RENDERBUFFER,ae)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function Ze(P,x,B){const V=i.get(P);x!==void 0&&_e(V.__webglFramebuffer,P,P.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),B!==void 0&&Ve(P)}function ct(P){const x=P.texture,B=i.get(P),V=i.get(x);P.addEventListener("dispose",_);const K=P.textures,ae=P.isWebGLCubeRenderTarget===!0,oe=K.length>1;if(oe||(V.__webglTexture===void 0&&(V.__webglTexture=n.createTexture()),V.__version=x.version,a.memory.textures++),ae){B.__webglFramebuffer=[];for(let J=0;J<6;J++)if(x.mipmaps&&x.mipmaps.length>0){B.__webglFramebuffer[J]=[];for(let ne=0;ne<x.mipmaps.length;ne++)B.__webglFramebuffer[J][ne]=n.createFramebuffer()}else B.__webglFramebuffer[J]=n.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){B.__webglFramebuffer=[];for(let J=0;J<x.mipmaps.length;J++)B.__webglFramebuffer[J]=n.createFramebuffer()}else B.__webglFramebuffer=n.createFramebuffer();if(oe)for(let J=0,ne=K.length;J<ne;J++){const ce=i.get(K[J]);ce.__webglTexture===void 0&&(ce.__webglTexture=n.createTexture(),a.memory.textures++)}if(P.samples>0&&wt(P)===!1){B.__webglMultisampledFramebuffer=n.createFramebuffer(),B.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let J=0;J<K.length;J++){const ne=K[J];B.__webglColorRenderbuffer[J]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,B.__webglColorRenderbuffer[J]);const ce=s.convert(ne.format,ne.colorSpace),Re=s.convert(ne.type),fe=v(ne.internalFormat,ce,Re,ne.normalized,ne.colorSpace,P.isXRRenderTarget===!0),de=xt(P);n.renderbufferStorageMultisample(n.RENDERBUFFER,de,fe,P.width,P.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+J,n.RENDERBUFFER,B.__webglColorRenderbuffer[J])}n.bindRenderbuffer(n.RENDERBUFFER,null),P.depthBuffer&&(B.__webglDepthRenderbuffer=n.createRenderbuffer(),He(B.__webglDepthRenderbuffer,P,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(ae){t.bindTexture(n.TEXTURE_CUBE_MAP,V.__webglTexture),ve(n.TEXTURE_CUBE_MAP,x);for(let J=0;J<6;J++)if(x.mipmaps&&x.mipmaps.length>0)for(let ne=0;ne<x.mipmaps.length;ne++)_e(B.__webglFramebuffer[J][ne],P,x,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+J,ne);else _e(B.__webglFramebuffer[J],P,x,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+J,0);d(x)&&E(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(oe){for(let J=0,ne=K.length;J<ne;J++){const ce=K[J],Re=i.get(ce);let fe=n.TEXTURE_2D;(P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(fe=P.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(fe,Re.__webglTexture),ve(fe,ce),_e(B.__webglFramebuffer,P,ce,n.COLOR_ATTACHMENT0+J,fe,0),d(ce)&&E(fe)}t.unbindTexture()}else{let J=n.TEXTURE_2D;if((P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(J=P.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(J,V.__webglTexture),ve(J,x),x.mipmaps&&x.mipmaps.length>0)for(let ne=0;ne<x.mipmaps.length;ne++)_e(B.__webglFramebuffer[ne],P,x,n.COLOR_ATTACHMENT0,J,ne);else _e(B.__webglFramebuffer,P,x,n.COLOR_ATTACHMENT0,J,0);d(x)&&E(J),t.unbindTexture()}P.depthBuffer&&Ve(P)}function Xe(P){const x=P.textures;for(let B=0,V=x.length;B<V;B++){const K=x[B];if(d(K)){const ae=A(P),oe=i.get(K).__webglTexture;t.bindTexture(ae,oe),E(ae),t.unbindTexture()}}}const gt=[],Ut=[];function en(P){if(P.samples>0){if(wt(P)===!1){const x=P.textures,B=P.width,V=P.height;let K=n.COLOR_BUFFER_BIT;const ae=P.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,oe=i.get(P),J=x.length>1;if(J)for(let ce=0;ce<x.length;ce++)t.bindFramebuffer(n.FRAMEBUFFER,oe.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ce,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,oe.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ce,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,oe.__webglMultisampledFramebuffer);const ne=P.texture.mipmaps;ne&&ne.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,oe.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,oe.__webglFramebuffer);for(let ce=0;ce<x.length;ce++){if(P.resolveDepthBuffer&&(P.depthBuffer&&(K|=n.DEPTH_BUFFER_BIT),P.stencilBuffer&&P.resolveStencilBuffer&&(K|=n.STENCIL_BUFFER_BIT)),J){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,oe.__webglColorRenderbuffer[ce]);const Re=i.get(x[ce]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,Re,0)}n.blitFramebuffer(0,0,B,V,0,0,B,V,K,n.NEAREST),l===!0&&(gt.length=0,Ut.length=0,gt.push(n.COLOR_ATTACHMENT0+ce),P.depthBuffer&&P.storeMultisampledDepthBuffer===!1&&(gt.push(ae),Ut.push(ae),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,Ut)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,gt))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),J)for(let ce=0;ce<x.length;ce++){t.bindFramebuffer(n.FRAMEBUFFER,oe.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ce,n.RENDERBUFFER,oe.__webglColorRenderbuffer[ce]);const Re=i.get(x[ce]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,oe.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ce,n.TEXTURE_2D,Re,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,oe.__webglMultisampledFramebuffer)}else if(P.depthBuffer&&P.storeMultisampledDepthBuffer===!1&&l){const x=P.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[x])}}}function xt(P){return Math.min(r.maxSamples,P.samples)}function wt(P){const x=i.get(P);return P.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function U(P){const x=a.render.frame;u.get(P)!==x&&(u.set(P,x),P.update())}function kt(P,x){const B=P.colorSpace,V=P.format,K=P.type;return P.isCompressedTexture===!0||P.isVideoTexture===!0||B!==Ks&&B!==li&&(qe.getTransfer(B)===et?(V!==wn||K!==cn)&&Ne("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ke("WebGLTextures: Unsupported texture color space:",B)),x}function je(P){return typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement?(c.width=P.naturalWidth||P.width,c.height=P.naturalHeight||P.height):typeof VideoFrame<"u"&&P instanceof VideoFrame?(c.width=P.displayWidth,c.height=P.displayHeight):(c.width=P.width,c.height=P.height),c}this.allocateTextureUnit=X,this.resetTextureUnits=H,this.getTextureUnits=F,this.setTextureUnits=k,this.setTexture2D=Q,this.setTexture2DArray=W,this.setTexture3D=j,this.setTextureCube=ee,this.rebindTextures=Ze,this.setupRenderTarget=ct,this.updateRenderTargetMipmap=Xe,this.updateMultisampleRenderTarget=en,this.setupDepthRenderbuffer=Ve,this.setupFrameBufferTexture=_e,this.useMultisampledRTT=wt,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function k_(n,e){function t(i,r=li){let s;const a=qe.getTransfer(r);if(i===cn)return n.UNSIGNED_BYTE;if(i===ml)return n.UNSIGNED_SHORT_4_4_4_4;if(i===gl)return n.UNSIGNED_SHORT_5_5_5_1;if(i===Bd)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===kd)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===Fd)return n.BYTE;if(i===Od)return n.SHORT;if(i===zr)return n.UNSIGNED_SHORT;if(i===pl)return n.INT;if(i===On)return n.UNSIGNED_INT;if(i===In)return n.FLOAT;if(i===rn)return n.HALF_FLOAT;if(i===zd)return n.ALPHA;if(i===Gd)return n.RGB;if(i===wn)return n.RGBA;if(i===$n)return n.DEPTH_COMPONENT;if(i===wi)return n.DEPTH_STENCIL;if(i===Hd)return n.RED;if(i===_l)return n.RED_INTEGER;if(i===Pi)return n.RG;if(i===xl)return n.RG_INTEGER;if(i===vl)return n.RGBA_INTEGER;if(i===Os||i===Bs||i===ks||i===zs)if(a===et)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(i===Os)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Bs)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===ks)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===zs)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(i===Os)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Bs)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===ks)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===zs)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===bo||i===Eo||i===wo||i===To)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(i===bo)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Eo)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===wo)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===To)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Ao||i===Ro||i===Co||i===Po||i===Do||i===qs||i===Lo)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(i===Ao||i===Ro)return a===et?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(i===Co)return a===et?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC;if(i===Po)return s.COMPRESSED_R11_EAC;if(i===Do)return s.COMPRESSED_SIGNED_R11_EAC;if(i===qs)return s.COMPRESSED_RG11_EAC;if(i===Lo)return s.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===Io||i===No||i===Uo||i===Fo||i===Oo||i===Bo||i===ko||i===zo||i===Go||i===Ho||i===Vo||i===Wo||i===Xo||i===qo)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(i===Io)return a===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===No)return a===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Uo)return a===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Fo)return a===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Oo)return a===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Bo)return a===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===ko)return a===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===zo)return a===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Go)return a===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Ho)return a===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Vo)return a===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Wo)return a===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Xo)return a===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===qo)return a===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Yo||i===$o||i===Ko)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(i===Yo)return a===et?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===$o)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Ko)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Zo||i===Jo||i===Ys||i===Qo)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(i===Zo)return s.COMPRESSED_RED_RGTC1_EXT;if(i===Jo)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Ys)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Qo)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Gr?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}const z_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,G_=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class H_{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const i=new th(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new Yt({vertexShader:z_,fragmentShader:G_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new bt(new Fi(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class V_ extends Ni{constructor(e,t){super();const i=this;let r=null,s=1,a=null,o="local-floor",l=1,c=null,u=null,f=null,h=null,p=null,g=null;const M=typeof XRWebGLBinding<"u",m=new H_,d={},E=t.getContextAttributes();let A=null,v=null;const w=[],b=[],R=new Ae;let _=null,T=null;const C=new pn;C.viewport=new St;const D=new pn;D.viewport=new St;const O=[C,D],H=new Kf;let F=null,k=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Y){let Z=w[Y];return Z===void 0&&(Z=new Ia,w[Y]=Z),Z.getTargetRaySpace()},this.getControllerGrip=function(Y){let Z=w[Y];return Z===void 0&&(Z=new Ia,w[Y]=Z),Z.getGripSpace()},this.getHand=function(Y){let Z=w[Y];return Z===void 0&&(Z=new Ia,w[Y]=Z),Z.getHandSpace()};function X(Y){const Z=b.indexOf(Y.inputSource);if(Z===-1)return;const le=w[Z];le!==void 0&&(le.update(Y.inputSource,Y.frame,c||a),le.dispatchEvent({type:Y.type,data:Y.inputSource}))}function S(){r.removeEventListener("select",X),r.removeEventListener("selectstart",X),r.removeEventListener("selectend",X),r.removeEventListener("squeeze",X),r.removeEventListener("squeezestart",X),r.removeEventListener("squeezeend",X),r.removeEventListener("end",S),r.removeEventListener("inputsourceschange",Q);for(let Y=0;Y<w.length;Y++){const Z=b[Y];Z!==null&&(b[Y]=null,w[Y].disconnect(Z))}F=null,k=null,m.reset();for(const Y in d)delete d[Y];if(e.setRenderTarget(A),p=null,h=null,f=null,r=null,v=null,Ue.stop(),i.isPresenting=!1,e.setPixelRatio(_),e.setSize(R.width,R.height,!1),T!==null){const Y=T.camera;Y.fov=T.fov,Y.zoom=T.zoom,Y.updateProjectionMatrix(),T=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Y){s=Y,i.isPresenting===!0&&Ne("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Y){o=Y,i.isPresenting===!0&&Ne("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(Y){c=Y},this.getBaseLayer=function(){return h!==null?h:p},this.getBinding=function(){return f===null&&M&&(f=new XRWebGLBinding(r,t)),f},this.getFrame=function(){return g},this.getSession=function(){return r},this.setSession=async function(Y){if(r=Y,r!==null){if(A=e.getRenderTarget(),r.addEventListener("select",X),r.addEventListener("selectstart",X),r.addEventListener("selectend",X),r.addEventListener("squeeze",X),r.addEventListener("squeezestart",X),r.addEventListener("squeezeend",X),r.addEventListener("end",S),r.addEventListener("inputsourceschange",Q),E.xrCompatible!==!0&&await t.makeXRCompatible(),_=e.getPixelRatio(),e.getSize(R),M&&"createProjectionLayer"in XRWebGLBinding.prototype){let le=null,De=null,_e=null;E.depth&&(_e=E.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,le=E.stencil?wi:$n,De=E.stencil?Gr:On);const He={colorFormat:t.RGBA8,depthFormat:_e,scaleFactor:s};f=this.getBinding(),h=f.createProjectionLayer(He),r.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),v=new jt(h.textureWidth,h.textureHeight,{format:wn,type:cn,depthTexture:new Vr(h.textureWidth,h.textureHeight,De,void 0,void 0,void 0,void 0,void 0,void 0,le),stencilBuffer:E.stencil,colorSpace:e.outputColorSpace,samples:E.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}else{const le={antialias:E.antialias,alpha:!0,depth:E.depth,stencil:E.stencil,framebufferScaleFactor:s};p=new XRWebGLLayer(r,t,le),r.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),v=new jt(p.framebufferWidth,p.framebufferHeight,{format:wn,type:cn,colorSpace:e.outputColorSpace,stencilBuffer:E.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1,storeMultisampledDepthBuffer:p.ignoreDepthValues===!1,storeMultisampledStencilBuffer:p.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await r.requestReferenceSpace(o),Ue.setContext(r),Ue.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function Q(Y){for(let Z=0;Z<Y.removed.length;Z++){const le=Y.removed[Z],De=b.indexOf(le);De>=0&&(b[De]=null,w[De].disconnect(le))}for(let Z=0;Z<Y.added.length;Z++){const le=Y.added[Z];let De=b.indexOf(le);if(De===-1){for(let He=0;He<w.length;He++)if(He>=b.length){b.push(le),De=He;break}else if(b[He]===null){b[He]=le,De=He;break}if(De===-1)break}const _e=w[De];_e&&_e.connect(le)}}const W=new I,j=new I;function ee(Y,Z,le){W.setFromMatrixPosition(Z.matrixWorld),j.setFromMatrixPosition(le.matrixWorld);const De=W.distanceTo(j),_e=Z.projectionMatrix.elements,He=le.projectionMatrix.elements,Pt=_e[14]/(_e[10]-1),Ve=_e[14]/(_e[10]+1),Ze=(_e[9]+1)/_e[5],ct=(_e[9]-1)/_e[5],Xe=(_e[8]-1)/_e[0],gt=(He[8]+1)/He[0],Ut=Pt*Xe,en=Pt*gt,xt=De/(-Xe+gt),wt=xt*-Xe;if(Z.matrixWorld.decompose(Y.position,Y.quaternion,Y.scale),Y.translateX(wt),Y.translateZ(xt),Y.matrixWorld.compose(Y.position,Y.quaternion,Y.scale),Y.matrixWorldInverse.copy(Y.matrixWorld).invert(),_e[10]===-1)Y.projectionMatrix.copy(Z.projectionMatrix),Y.projectionMatrixInverse.copy(Z.projectionMatrixInverse);else{const U=Pt+xt,kt=Ve+xt,je=Ut-wt,P=en+(De-wt),x=Ze*Ve/kt*U,B=ct*Ve/kt*U;Y.projectionMatrix.makePerspective(je,P,x,B,U,kt),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert()}}function ie(Y,Z){Z===null?Y.matrixWorld.copy(Y.matrix):Y.matrixWorld.multiplyMatrices(Z.matrixWorld,Y.matrix),Y.matrixWorldInverse.copy(Y.matrixWorld).invert()}this.updateCamera=function(Y){if(r===null)return;let Z=Y.near,le=Y.far;m.texture!==null&&(m.depthNear>0&&(Z=m.depthNear),m.depthFar>0&&(le=m.depthFar)),H.near=D.near=C.near=Z,H.far=D.far=C.far=le,(F!==H.near||k!==H.far)&&(r.updateRenderState({depthNear:H.near,depthFar:H.far}),F=H.near,k=H.far),H.layers.mask=Y.layers.mask|6,C.layers.mask=H.layers.mask&-5,D.layers.mask=H.layers.mask&-3;const De=Y.parent,_e=H.cameras;ie(H,De);for(let He=0;He<_e.length;He++)ie(_e[He],De);_e.length===2?ee(H,C,D):H.projectionMatrix.copy(C.projectionMatrix),T===null&&Y.isPerspectiveCamera&&(T={camera:Y,fov:Y.fov,zoom:Y.zoom}),se(Y,H,De)};function se(Y,Z,le){le===null?Y.matrix.copy(Z.matrixWorld):(Y.matrix.copy(le.matrixWorld),Y.matrix.invert(),Y.matrix.multiply(Z.matrixWorld)),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.updateMatrixWorld(!0),Y.projectionMatrix.copy(Z.projectionMatrix),Y.projectionMatrixInverse.copy(Z.projectionMatrixInverse),Y.isPerspectiveCamera&&(Y.fov=jo*2*Math.atan(1/Y.projectionMatrix.elements[5]),Y.zoom=1)}this.getCamera=function(){return H},this.getFoveation=function(){if(!(h===null&&p===null))return l},this.setFoveation=function(Y){l=Y,h!==null&&(h.fixedFoveation=Y),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=Y)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(H)},this.getCameraTexture=function(Y){return d[Y]};let Me=null;function ve(Y,Z){if(u=Z.getViewerPose(c||a),g=Z,u!==null){const le=u.views;p!==null&&(e.setRenderTargetFramebuffer(v,p.framebuffer),e.setRenderTarget(v));let De=!1;le.length!==H.cameras.length&&(H.cameras.length=0,De=!0);for(let Ve=0;Ve<le.length;Ve++){const Ze=le[Ve];let ct=null;if(p!==null)ct=p.getViewport(Ze);else{const gt=f.getViewSubImage(h,Ze);ct=gt.viewport,Ve===0&&(e.setRenderTargetTextures(v,gt.colorTexture,gt.depthStencilTexture),e.setRenderTarget(v))}let Xe=O[Ve];Xe===void 0&&(Xe=new pn,Xe.layers.enable(Ve),Xe.viewport=new St,O[Ve]=Xe),Xe.matrix.fromArray(Ze.transform.matrix),Xe.matrix.decompose(Xe.position,Xe.quaternion,Xe.scale),Xe.projectionMatrix.fromArray(Ze.projectionMatrix),Xe.projectionMatrixInverse.copy(Xe.projectionMatrix).invert(),Xe.viewport.set(ct.x,ct.y,ct.width,ct.height),Ve===0&&(H.matrix.copy(Xe.matrix),H.matrix.decompose(H.position,H.quaternion,H.scale)),De===!0&&H.cameras.push(Xe)}const _e=r.enabledFeatures;if(_e&&_e.includes("depth-sensing")&&r.depthUsage=="gpu-optimized"&&M){f=i.getBinding();const Ve=f.getDepthInformation(le[0]);Ve&&Ve.isValid&&Ve.texture&&m.init(Ve,r.renderState)}if(_e&&_e.includes("camera-access")&&M){e.state.unbindTexture(),f=i.getBinding();for(let Ve=0;Ve<le.length;Ve++){const Ze=le[Ve].camera;if(Ze){let ct=d[Ze];ct||(ct=new th,d[Ze]=ct);const Xe=f.getCameraImage(Ze);ct.sourceTexture=Xe}}}}for(let le=0;le<w.length;le++){const De=b[le],_e=w[le];De!==null&&_e!==void 0&&_e.update(De,Z,c||a)}Me&&Me(Y,Z),Z.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:Z}),g=null}const Ue=new oh;Ue.setAnimationLoop(ve),this.setAnimationLoop=function(Y){Me=Y},this.dispose=function(){}}}const W_=new mt,ph=new Fe;ph.set(-1,0,0,0,1,0,0,0,1);function X_(n,e){function t(m,d){m.matrixAutoUpdate===!0&&m.updateMatrix(),d.value.copy(m.matrix)}function i(m,d){d.color.getRGB(m.fogColor.value,nh(n)),d.isFog?(m.fogNear.value=d.near,m.fogFar.value=d.far):d.isFogExp2&&(m.fogDensity.value=d.density)}function r(m,d,E,A,v){d.isNodeMaterial?d.uniformsNeedUpdate=!1:d.isMeshBasicMaterial?s(m,d):d.isMeshLambertMaterial?(s(m,d),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)):d.isMeshToonMaterial?(s(m,d),f(m,d)):d.isMeshPhongMaterial?(s(m,d),u(m,d),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)):d.isMeshStandardMaterial?(s(m,d),h(m,d),d.isMeshPhysicalMaterial&&p(m,d,v)):d.isMeshMatcapMaterial?(s(m,d),g(m,d)):d.isMeshDepthMaterial?s(m,d):d.isMeshDistanceMaterial?(s(m,d),M(m,d)):d.isMeshNormalMaterial?s(m,d):d.isLineBasicMaterial?(a(m,d),d.isLineDashedMaterial&&o(m,d)):d.isPointsMaterial?l(m,d,E,A):d.isSpriteMaterial?c(m,d):d.isShadowMaterial?(m.color.value.copy(d.color),m.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function s(m,d){m.opacity.value=d.opacity,d.color&&m.diffuse.value.copy(d.color),d.emissive&&m.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.bumpMap&&(m.bumpMap.value=d.bumpMap,t(d.bumpMap,m.bumpMapTransform),m.bumpScale.value=d.bumpScale,d.side===nn&&(m.bumpScale.value*=-1)),d.normalMap&&(m.normalMap.value=d.normalMap,t(d.normalMap,m.normalMapTransform),m.normalScale.value.copy(d.normalScale),d.side===nn&&m.normalScale.value.negate()),d.displacementMap&&(m.displacementMap.value=d.displacementMap,t(d.displacementMap,m.displacementMapTransform),m.displacementScale.value=d.displacementScale,m.displacementBias.value=d.displacementBias),d.emissiveMap&&(m.emissiveMap.value=d.emissiveMap,t(d.emissiveMap,m.emissiveMapTransform)),d.specularMap&&(m.specularMap.value=d.specularMap,t(d.specularMap,m.specularMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest);const E=e.get(d),A=E.envMap,v=E.envMapRotation;A&&(m.envMap.value=A,m.envMapRotation.value.setFromMatrix4(W_.makeRotationFromEuler(v)).transpose(),A.isCubeTexture&&A.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(ph),m.reflectivity.value=d.reflectivity,m.ior.value=d.ior,m.refractionRatio.value=d.refractionRatio),d.lightMap&&(m.lightMap.value=d.lightMap,m.lightMapIntensity.value=d.lightMapIntensity,t(d.lightMap,m.lightMapTransform)),d.aoMap&&(m.aoMap.value=d.aoMap,m.aoMapIntensity.value=d.aoMapIntensity,t(d.aoMap,m.aoMapTransform))}function a(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform))}function o(m,d){m.dashSize.value=d.dashSize,m.totalSize.value=d.dashSize+d.gapSize,m.scale.value=d.scale}function l(m,d,E,A){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.size.value=d.size*E,m.scale.value=A*.5,d.map&&(m.map.value=d.map,t(d.map,m.uvTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function c(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.rotation.value=d.rotation,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function u(m,d){m.specular.value.copy(d.specular),m.shininess.value=Math.max(d.shininess,1e-4)}function f(m,d){d.gradientMap&&(m.gradientMap.value=d.gradientMap)}function h(m,d){m.metalness.value=d.metalness,d.metalnessMap&&(m.metalnessMap.value=d.metalnessMap,t(d.metalnessMap,m.metalnessMapTransform)),m.roughness.value=d.roughness,d.roughnessMap&&(m.roughnessMap.value=d.roughnessMap,t(d.roughnessMap,m.roughnessMapTransform)),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)}function p(m,d,E){m.ior.value=d.ior,d.sheen>0&&(m.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),m.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(m.sheenColorMap.value=d.sheenColorMap,t(d.sheenColorMap,m.sheenColorMapTransform)),d.sheenRoughnessMap&&(m.sheenRoughnessMap.value=d.sheenRoughnessMap,t(d.sheenRoughnessMap,m.sheenRoughnessMapTransform))),d.clearcoat>0&&(m.clearcoat.value=d.clearcoat,m.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(m.clearcoatMap.value=d.clearcoatMap,t(d.clearcoatMap,m.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,t(d.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(m.clearcoatNormalMap.value=d.clearcoatNormalMap,t(d.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===nn&&m.clearcoatNormalScale.value.negate())),d.dispersion>0&&(m.dispersion.value=d.dispersion),d.retroreflectivity>0&&(m.retroreflectivity.value=d.retroreflectivity),d.iridescence>0&&(m.iridescence.value=d.iridescence,m.iridescenceIOR.value=d.iridescenceIOR,m.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(m.iridescenceMap.value=d.iridescenceMap,t(d.iridescenceMap,m.iridescenceMapTransform)),d.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=d.iridescenceThicknessMap,t(d.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),d.transmission>0&&(m.transmission.value=d.transmission,m.transmissionSamplerMap.value=E.texture,m.transmissionSamplerSize.value.set(E.width,E.height),d.transmissionMap&&(m.transmissionMap.value=d.transmissionMap,t(d.transmissionMap,m.transmissionMapTransform)),m.thickness.value=d.thickness,d.thicknessMap&&(m.thicknessMap.value=d.thicknessMap,t(d.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=d.attenuationDistance,m.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(m.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(m.anisotropyMap.value=d.anisotropyMap,t(d.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=d.specularIntensity,m.specularColor.value.copy(d.specularColor),d.specularColorMap&&(m.specularColorMap.value=d.specularColorMap,t(d.specularColorMap,m.specularColorMapTransform)),d.specularIntensityMap&&(m.specularIntensityMap.value=d.specularIntensityMap,t(d.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,d){d.matcap&&(m.matcap.value=d.matcap)}function M(m,d){const E=e.get(d).light;m.referencePosition.value.setFromMatrixPosition(E.matrixWorld),m.nearDistance.value=E.shadow.camera.near,m.farDistance.value=E.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function q_(n,e,t,i){let r={},s={},a=[];const o=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(v,w){const b=w.program;i.uniformBlockBinding(v,b)}function c(v,w){let b=r[v.id];b===void 0&&(m(v),b=u(v),r[v.id]=b,v.addEventListener("dispose",E));const R=w.program;i.updateUBOMapping(v,R);const _=e.render.frame;s[v.id]!==_&&(h(v),s[v.id]=_)}function u(v){const w=f();v.__bindingPointIndex=w;const b=n.createBuffer(),R=v.__size,_=v.usage;return n.bindBuffer(n.UNIFORM_BUFFER,b),n.bufferData(n.UNIFORM_BUFFER,R,_),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,w,b),b}function f(){for(let v=0;v<o;v++)if(a.indexOf(v)===-1)return a.push(v),v;return Ke("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(v){const w=r[v.id],b=v.uniforms,R=v.__cache;n.bindBuffer(n.UNIFORM_BUFFER,w);for(let _=0,T=b.length;_<T;_++){const C=b[_];if(Array.isArray(C))for(let D=0,O=C.length;D<O;D++)p(C[D],_,D,R);else p(C,_,0,R)}n.bindBuffer(n.UNIFORM_BUFFER,null)}function p(v,w,b,R){if(M(v,w,b,R)===!0){const _=v.__offset,T=v.value;if(Array.isArray(T)){let C=0;for(let D=0;D<T.length;D++){const O=T[D],H=d(O);g(O,v.__data,C),typeof O!="number"&&typeof O!="boolean"&&!O.isMatrix3&&!ArrayBuffer.isView(O)&&(C+=H.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(T,v.__data,0);n.bufferSubData(n.UNIFORM_BUFFER,_,v.__data)}}function g(v,w,b){typeof v=="number"||typeof v=="boolean"?w[0]=v:v.isMatrix3?(w[0]=v.elements[0],w[1]=v.elements[1],w[2]=v.elements[2],w[3]=0,w[4]=v.elements[3],w[5]=v.elements[4],w[6]=v.elements[5],w[7]=0,w[8]=v.elements[6],w[9]=v.elements[7],w[10]=v.elements[8],w[11]=0):ArrayBuffer.isView(v)?w.set(new v.constructor(v.buffer,v.byteOffset,w.length)):v.toArray(w,b)}function M(v,w,b,R){const _=v.value,T=w+"_"+b;if(R[T]===void 0)return typeof _=="number"||typeof _=="boolean"?R[T]=_:ArrayBuffer.isView(_)?R[T]=_.slice():R[T]=_.clone(),!0;{const C=R[T];if(typeof _=="number"||typeof _=="boolean"){if(C!==_)return R[T]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(C.equals(_)===!1)return C.copy(_),!0}}return!1}function m(v){const w=v.uniforms;let b=0;const R=16;for(let T=0,C=w.length;T<C;T++){const D=Array.isArray(w[T])?w[T]:[w[T]];for(let O=0,H=D.length;O<H;O++){const F=D[O],k=Array.isArray(F.value)?F.value:[F.value];for(let X=0,S=k.length;X<S;X++){const Q=k[X],W=d(Q),j=b%R,ee=j%W.boundary,ie=j+ee;b+=ee,ie!==0&&R-ie<W.storage&&(b+=R-ie),F.__data=new Float32Array(W.storage/Float32Array.BYTES_PER_ELEMENT),F.__offset=b,b+=W.storage}}}const _=b%R;return _>0&&(b+=R-_),v.__size=b,v.__cache={},this}function d(v){const w={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(w.boundary=4,w.storage=4):v.isVector2?(w.boundary=8,w.storage=8):v.isVector3||v.isColor?(w.boundary=16,w.storage=12):v.isVector4?(w.boundary=16,w.storage=16):v.isMatrix3?(w.boundary=48,w.storage=48):v.isMatrix4?(w.boundary=64,w.storage=64):v.isTexture?Ne("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(v)?(w.boundary=16,w.storage=v.byteLength):Ne("WebGLRenderer: Unsupported uniform value type.",v),w}function E(v){const w=v.target;w.removeEventListener("dispose",E);const b=a.indexOf(w.__bindingPointIndex);a.splice(b,1),n.deleteBuffer(r[w.id]),delete r[w.id],delete s[w.id]}function A(){for(const v in r)n.deleteBuffer(r[v]);a=[],r={},s={}}return{bind:l,update:c,dispose:A}}const Y_=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let Pn=null;function $_(){return Pn===null&&(Pn=new Nf(Y_,16,16,Pi,rn),Pn.name="DFG_LUT",Pn.minFilter=qt,Pn.magFilter=qt,Pn.wrapS=Xn,Pn.wrapT=Xn,Pn.generateMipmaps=!1,Pn.needsUpdate=!0),Pn}class K_{constructor(e={}){const{canvas:t=of(),context:i=null,depth:r=!0,stencil:s=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:h=!1,outputBufferType:p=cn}=e;this.isWebGLRenderer=!0;let g;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=i.getContextAttributes().alpha}else g=a;const M=p,m=new Set([vl,xl,_l]),d=new Set([cn,On,zr,Gr,ml,gl]),E=new Uint32Array(4),A=new Int32Array(4),v=new I;let w=null,b=null;const R=[],_=[];let T=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Fn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const C=this;let D=!1,O=null,H=null,F=null,k=null;this._outputColorSpace=Qt;let X=0,S=0,Q=null,W=-1,j=null;const ee=new St,ie=new St;let se=null;const Me=new Le(0);let ve=0,Ue=t.width,Y=t.height,Z=1,le=null,De=null;const _e=new St(0,0,Ue,Y),He=new St(0,0,Ue,Y);let Pt=!1;const Ve=new El;let Ze=!1,ct=!1;const Xe=new mt,gt=new I,Ut=new St,en={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let xt=!1;function wt(){return Q===null?Z:1}let U=i;function kt(y,L){return t.getContext(y,L)}let je,P,x,B,V,K,ae,oe,J,ne,ce,Re,fe,de,Ce,Ie,Oe,N,he,te,ue,xe,re;try{const y={alpha:!0,depth:r,stencil:s,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:f};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${ul}`),t.addEventListener("webglcontextlost",dt,!1),t.addEventListener("webglcontextrestored",Je,!1),t.addEventListener("webglcontextcreationerror",vn,!1),U===null){const L="webgl2";if(U=kt(L,y),U===null)throw kt(L)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Pe()}catch(y){throw t.removeEventListener("webglcontextlost",dt,!1),t.removeEventListener("webglcontextrestored",Je,!1),t.removeEventListener("webglcontextcreationerror",vn,!1),Ke("WebGLRenderer: "+y.message),y}function Pe(){je=new $g(U),je.init(),ue=new k_(U,je),P=new Bg(U,je,e,ue),x=new O_(U,je),P.reversedDepthBuffer&&h&&x.buffers.depth.setReversed(!0),H=U.createFramebuffer(),F=U.createFramebuffer(),k=U.createFramebuffer(),B=new Jg(U),V=new b_,K=new B_(U,je,x,V,P,ue,B),ae=new Yg(C),oe=new jf(U),xe=new Fg(U,oe),J=new Kg(U,oe,B,xe),ne=new jg(U,J,oe,xe,B),N=new Qg(U,P,K),Ce=new kg(V),ce=new y_(C,ae,je,P,xe,Ce),Re=new X_(C,V),fe=new w_,de=new D_(je),Oe=new Ug(C,ae,x,ne,g,l),Ie=new F_(C,ne,P),re=new q_(U,B,P,x),he=new Og(U,je,B),te=new Zg(U,je,B),B.programs=ce.programs,C.capabilities=P,C.extensions=je,C.properties=V,C.renderLists=fe,C.shadowMap=Ie,C.state=x,C.info=B}M!==cn&&(T=new t0(M,t.width,t.height,o,r,s));const we=new V_(C,U);this.xr=we,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){const y=je.get("WEBGL_lose_context");y&&y.loseContext()},this.forceContextRestore=function(){const y=je.get("WEBGL_lose_context");y&&y.restoreContext()},this.getPixelRatio=function(){return Z},this.setPixelRatio=function(y){y!==void 0&&(Z=y,this.setSize(Ue,Y,!1))},this.getSize=function(y){return y.set(Ue,Y)},this.setSize=function(y,L,q=!0){if(we.isPresenting){Ne("WebGLRenderer: Can't change size while VR device is presenting.");return}Ue=y,Y=L,t.width=Math.floor(y*Z),t.height=Math.floor(L*Z),q===!0&&(t.style.width=y+"px",t.style.height=L+"px"),T!==null&&T.setSize(t.width,t.height),this.setViewport(0,0,y,L)},this.getDrawingBufferSize=function(y){return y.set(Ue*Z,Y*Z).floor()},this.setDrawingBufferSize=function(y,L,q){Ue=y,Y=L,Z=q,t.width=Math.floor(y*q),t.height=Math.floor(L*q),this.setViewport(0,0,y,L)},this.setEffects=function(y){if(M===cn){Ke("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(y){for(let L=0;L<y.length;L++)if(y[L].isOutputPass===!0){Ne("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}T.setEffects(y||[])},this.getCurrentViewport=function(y){return y.copy(ee)},this.getViewport=function(y){return y.copy(_e)},this.setViewport=function(y,L,q,z){y.isVector4?_e.set(y.x,y.y,y.z,y.w):_e.set(y,L,q,z),x.viewport(ee.copy(_e).multiplyScalar(Z).round())},this.getScissor=function(y){return y.copy(He)},this.setScissor=function(y,L,q,z){y.isVector4?He.set(y.x,y.y,y.z,y.w):He.set(y,L,q,z),x.scissor(ie.copy(He).multiplyScalar(Z).round())},this.getScissorTest=function(){return Pt},this.setScissorTest=function(y){x.setScissorTest(Pt=y)},this.setOpaqueSort=function(y){le=y},this.setTransparentSort=function(y){De=y},this.getClearColor=function(y){return y.copy(Oe.getClearColor())},this.setClearColor=function(){Oe.setClearColor(...arguments)},this.getClearAlpha=function(){return Oe.getClearAlpha()},this.setClearAlpha=function(){Oe.setClearAlpha(...arguments)},this.clear=function(y=!0,L=!0,q=!0){let z=0;if(y){let G=!1;if(Q!==null){const ge=Q.texture.format;G=m.has(ge)}if(G){const ge=Q.texture.type,ye=d.has(ge),me=Oe.getClearColor(),be=Oe.getClearAlpha(),Te=me.r,ke=me.g,We=me.b;ye?(E[0]=Te,E[1]=ke,E[2]=We,E[3]=be,U.clearBufferuiv(U.COLOR,0,E)):(A[0]=Te,A[1]=ke,A[2]=We,A[3]=be,U.clearBufferiv(U.COLOR,0,A))}else z|=U.COLOR_BUFFER_BIT}L&&(z|=U.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),q&&(z|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),z!==0&&U.clear(z)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(y){y.setRenderer(this),O=y},this.dispose=function(){t.removeEventListener("webglcontextlost",dt,!1),t.removeEventListener("webglcontextrestored",Je,!1),t.removeEventListener("webglcontextcreationerror",vn,!1),Oe.dispose(),fe.dispose(),de.dispose(),V.dispose(),ae.dispose(),ne.dispose(),xe.dispose(),re.dispose(),ce.dispose(),we.dispose(),we.removeEventListener("sessionstart",Jl),we.removeEventListener("sessionend",Ql),gi.stop()};function dt(y){y.preventDefault(),Qs("WebGLRenderer: Context Lost."),D=!0}function Je(){Qs("WebGLRenderer: Context Restored."),D=!1;const y=B.autoReset,L=Ie.enabled,q=Ie.autoUpdate,z=Ie.needsUpdate,G=Ie.type;Pe(),B.autoReset=y,Ie.enabled=L,Ie.autoUpdate=q,Ie.needsUpdate=z,Ie.type=G}function vn(y){Ke("WebGLRenderer: A WebGL context could not be created. Reason: ",y.statusMessage)}function An(y){const L=y.target;L.removeEventListener("dispose",An),_u(L)}function _u(y){xu(y),V.remove(y)}function xu(y){const L=V.get(y).programs;L!==void 0&&(L.forEach(function(q){ce.releaseProgram(q)}),y.isShaderMaterial&&ce.releaseShaderCache(y))}this.renderBufferDirect=function(y,L,q,z,G,ge){L===null&&(L=en);const ye=G.isMesh&&G.matrixWorld.determinantAffine()<0,me=Mu(y,L,q,z,G);x.setMaterial(z,ye);let be=q.index,Te=1;if(z.wireframe===!0){if(be=J.getWireframeAttribute(q),be===void 0)return;Te=2}const ke=q.drawRange,We=q.attributes.position;let Ee=ke.start*Te,Qe=(ke.start+ke.count)*Te;ge!==null&&(Ee=Math.max(Ee,ge.start*Te),Qe=Math.min(Qe,(ge.start+ge.count)*Te)),be!==null?(Ee=Math.max(Ee,0),Qe=Math.min(Qe,be.count)):We!=null&&(Ee=Math.max(Ee,0),Qe=Math.min(Qe,We.count));const Tt=Qe-Ee;if(Tt<0||Tt===1/0)return;xe.setup(G,z,me,q,be);let ft,st=he;if(be!==null&&(ft=oe.get(be),st=te,st.setIndex(ft)),G.isMesh)z.wireframe===!0?(x.setLineWidth(z.wireframeLinewidth*wt()),st.setMode(U.LINES)):st.setMode(U.TRIANGLES);else if(G.isLine){let zt=z.linewidth;zt===void 0&&(zt=1),x.setLineWidth(zt*wt()),G.isLineSegments?st.setMode(U.LINES):G.isLineLoop?st.setMode(U.LINE_LOOP):st.setMode(U.LINE_STRIP)}else G.isPoints?st.setMode(U.POINTS):G.isSprite&&st.setMode(U.TRIANGLES);if(G.isBatchedMesh)if(je.get("WEBGL_multi_draw"))st.renderMultiDraw(G._multiDrawStarts,G._multiDrawCounts,G._multiDrawCount);else{const zt=G._multiDrawStarts,Se=G._multiDrawCounts,Kt=G._multiDrawCount,$e=be?oe.get(be).bytesPerElement:1,hn=V.get(z).currentProgram.getUniforms();for(let Rn=0;Rn<Kt;Rn++)hn.setValue(U,"_gl_DrawID",Rn),st.render(zt[Rn]/$e,Se[Rn])}else if(G.isInstancedMesh)st.renderInstances(Ee,Tt,G.count);else if(q.isInstancedBufferGeometry){const zt=q._maxInstanceCount!==void 0?q._maxInstanceCount:1/0,Se=Math.min(q.instanceCount,zt);st.renderInstances(Ee,Tt,Se)}else st.render(Ee,Tt)};function Zl(y,L,q,z){O!==null&&y.isNodeMaterial&&O.setObject(z,y),Ze===!0&&Ce.setState(y,q,!1),y.transparent===!0&&y.side===ln&&y.forceSinglePass===!1?(y.side=nn,y.needsUpdate=!0,ss(y,L,z),y.side=Ri,y.needsUpdate=!0,ss(y,L,z),y.side=ln):ss(y,L,z)}this.compile=function(y,L,q=null){q===null&&(q=y),O!==null&&O.renderStart(y,L,q),b=de.get(q),b.init(L),_.push(b),q.traverseVisible(function(G){G.isLight&&G.layers.test(L.layers)&&(b.pushLight(G),G.castShadow&&b.pushShadow(G))}),y!==q&&y.traverseVisible(function(G){G.isLight&&G.layers.test(L.layers)&&(b.pushLight(G),G.castShadow&&b.pushShadow(G))}),b.setupLights(),O!==null&&O.updateLights(b.state.lightsArray),ct=this.localClippingEnabled,Ze=Ce.init(this.clippingPlanes,ct),Ze===!0&&Ce.setGlobalState(this.clippingPlanes,L),O!==null&&Ie.render(b.state.shadowsArray,q,L);const z=new Set;return y.traverse(function(G){if(!(G.isMesh||G.isPoints||G.isLine||G.isSprite))return;const ge=G.material;if(ge)if(Array.isArray(ge))for(let ye=0;ye<ge.length;ye++){const me=ge[ye];Zl(me,q,L,G),z.add(me)}else Zl(ge,q,L,G),z.add(ge)}),b=_.pop(),O!==null&&O.renderEnd(),z},this.compileAsync=function(y,L,q=null){const z=this.compile(y,L,q);return new Promise(G=>{function ge(){if(z.forEach(function(ye){const be=V.get(ye).currentProgram;(be===void 0||be.isReady())&&z.delete(ye)}),z.size===0){G(y);return}setTimeout(ge,10)}je.get("KHR_parallel_shader_compile")!==null?ge():setTimeout(ge,10)})};let Sa=null;function vu(y){Sa&&Sa(y)}function Jl(){gi.stop()}function Ql(){gi.start()}const gi=new oh;gi.setAnimationLoop(vu),typeof self<"u"&&gi.setContext(self),this.setAnimationLoop=function(y){Sa=y,we.setAnimationLoop(y),y===null?gi.stop():gi.start()},we.addEventListener("sessionstart",Jl),we.addEventListener("sessionend",Ql),this.render=function(y,L){if(L!==void 0&&L.isCamera!==!0){Ke("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(D===!0)return;O!==null&&O.renderStart(y,L);const q=we.enabled===!0&&we.isPresenting===!0,z=T!==null&&(Q===null||q)&&T.begin(C,Q);if(y.matrixWorldAutoUpdate===!0&&y.updateMatrixWorld(),L.parent===null&&L.matrixWorldAutoUpdate===!0&&L.updateMatrixWorld(),we.enabled===!0&&we.isPresenting===!0&&(T===null||T.isCompositing()===!1)&&(we.cameraAutoUpdate===!0&&we.updateCamera(L),L=we.getCamera()),y.isScene===!0&&y.onBeforeRender(C,y,L,Q),b=de.get(y,_.length),b.init(L),b.state.textureUnits=K.getTextureUnits(),_.push(b),Xe.multiplyMatrices(L.projectionMatrix,L.matrixWorldInverse),Ve.setFromProjectionMatrix(Xe,Nn,L.reversedDepth),ct=this.localClippingEnabled,Ze=Ce.init(this.clippingPlanes,ct),w=fe.get(y,R.length),w.init(),R.push(w),we.enabled===!0&&we.isPresenting===!0){const ye=C.xr.getDepthSensingMesh();ye!==null&&Ma(ye,L,-1/0,C.sortObjects)}Ma(y,L,0,C.sortObjects),w.finish(),O!==null&&O.updateLights(b.state.lightsArray),C.sortObjects===!0&&w.sort(le,De),xt=we.enabled===!1||we.isPresenting===!1||we.hasDepthSensing()===!1,xt&&Oe.addToRenderList(w,y),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Ze===!0&&Ce.beginShadows();const G=b.state.shadowsArray;if(Ie.render(G,y,L),Ze===!0&&Ce.endShadows(),(z&&T.hasRenderPass())===!1){const ye=w.opaque,me=w.transmissive;if(b.setupLights(),L.isArrayCamera){const be=L.cameras;if(me.length>0)for(let Te=0,ke=be.length;Te<ke;Te++){const We=be[Te];ec(ye,me,y,We)}xt&&Oe.render(y);for(let Te=0,ke=be.length;Te<ke;Te++){const We=be[Te];jl(w,y,We,We.viewport)}}else me.length>0&&ec(ye,me,y,L),xt&&Oe.render(y),jl(w,y,L)}Q!==null&&S===0&&(K.updateMultisampleRenderTarget(Q),K.updateRenderTargetMipmap(Q)),z&&T.end(C),y.isScene===!0&&y.onAfterRender(C,y,L),xe.resetDefaultState(),W=-1,j=null,_.pop(),_.length>0?(b=_[_.length-1],K.setTextureUnits(b.state.textureUnits),Ze===!0&&Ce.setGlobalState(C.clippingPlanes,b.state.camera)):b=null,R.pop(),R.length>0?w=R[R.length-1]:w=null,O!==null&&O.renderEnd()};function Ma(y,L,q,z){if(y.visible===!1)return;if(y.layers.test(L.layers)){if(y.isGroup)q=y.renderOrder;else if(y.isLOD)y.autoUpdate===!0&&y.update(L);else if(y.isLightProbeGrid)b.pushLightProbeGrid(y);else if(y.isLight)b.pushLight(y),y.castShadow&&b.pushShadow(y);else if(y.isSprite){if(!y.frustumCulled||y.intersectsFrustum(Ve)){z&&Ut.setFromMatrixPosition(y.matrixWorld).applyMatrix4(Xe);const ye=ne.update(y),me=y.material;me.visible&&w.push(y,ye,me,q,Ut.z,null,L)}}else if((y.isMesh||y.isLine||y.isPoints)&&(!y.frustumCulled||y.intersectsFrustum(Ve))){const ye=ne.update(y),me=y.material;if(z&&(y.boundingSphere!==void 0?(y.boundingSphere===null&&y.computeBoundingSphere(),Ut.copy(y.boundingSphere.center)):(ye.boundingSphere===null&&ye.computeBoundingSphere(),Ut.copy(ye.boundingSphere.center)),Ut.applyMatrix4(y.matrixWorld).applyMatrix4(Xe)),Array.isArray(me)){const be=ye.groups;for(let Te=0,ke=be.length;Te<ke;Te++){const We=be[Te],Ee=me[We.materialIndex];Ee&&Ee.visible&&w.push(y,ye,Ee,q,Ut.z,We,L)}}else me.visible&&w.push(y,ye,me,q,Ut.z,null,L)}}const ge=y.children;for(let ye=0,me=ge.length;ye<me;ye++)Ma(ge[ye],L,q,z)}function jl(y,L,q,z){const{opaque:G,transmissive:ge,transparent:ye}=y;b.setupLightsView(q),Ze===!0&&Ce.setGlobalState(C.clippingPlanes,q),z&&x.viewport(ee.copy(z)),G.length>0&&rs(G,L,q),ge.length>0&&rs(ge,L,q),ye.length>0&&rs(ye,L,q),x.buffers.depth.setTest(!0),x.buffers.depth.setMask(!0),x.buffers.color.setMask(!0),x.setPolygonOffset(!1)}function ec(y,L,q,z){if((q.isScene===!0?q.overrideMaterial:null)!==null)return;if(b.state.transmissionRenderTarget[z.id]===void 0){const Ee=je.has("EXT_color_buffer_half_float")||je.has("EXT_color_buffer_float");b.state.transmissionRenderTarget[z.id]=new jt(1,1,{generateMipmaps:!0,type:Ee?rn:cn,minFilter:Ei,samples:Math.max(4,P.samples),stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:qe.workingColorSpace})}const ge=b.state.transmissionRenderTarget[z.id],ye=z.viewport||ee;ge.setSize(ye.z*C.transmissionResolutionScale,ye.w*C.transmissionResolutionScale);const me=C.getRenderTarget(),be=C.getActiveCubeFace(),Te=C.getActiveMipmapLevel();C.setRenderTarget(ge),C.getClearColor(Me),ve=C.getClearAlpha(),ve<1&&C.setClearColor(16777215,.5),C.clear(),xt&&Oe.render(q);const ke=C.toneMapping;C.toneMapping=Fn;const We=z.viewport;if(z.viewport!==void 0&&(z.viewport=void 0),b.setupLightsView(z),Ze===!0&&Ce.setGlobalState(C.clippingPlanes,z),rs(y,q,z),K.updateMultisampleRenderTarget(ge),K.updateRenderTargetMipmap(ge),je.has("WEBGL_multisampled_render_to_texture")===!1){let Ee=!1;for(let Qe=0,Tt=L.length;Qe<Tt;Qe++){const ft=L[Qe],{object:st,geometry:zt,material:Se,group:Kt}=ft;if(Se.side===ln&&st.layers.test(z.layers)){const $e=Se.side;Se.side=nn,Se.needsUpdate=!0,tc(st,q,z,zt,Se,Kt),Se.side=$e,Se.needsUpdate=!0,Ee=!0}}Ee===!0&&(K.updateMultisampleRenderTarget(ge),K.updateRenderTargetMipmap(ge))}C.setRenderTarget(me,be,Te),C.setClearColor(Me,ve),We!==void 0&&(z.viewport=We),C.toneMapping=ke}function rs(y,L,q){const z=L.isScene===!0?L.overrideMaterial:null;for(let G=0,ge=y.length;G<ge;G++){const ye=y[G],{object:me,geometry:be,group:Te}=ye;let ke=ye.material;ke.allowOverride===!0&&z!==null&&(ke=z),me.layers.test(q.layers)&&tc(me,L,q,be,ke,Te)}}function tc(y,L,q,z,G,ge){O!==null&&G.isNodeMaterial&&O.setObject(y,G),y.onBeforeRender(C,L,q,z,G,ge),y.modelViewMatrix.multiplyMatrices(q.matrixWorldInverse,y.matrixWorld),y.normalMatrix.getNormalMatrix(y.modelViewMatrix),G.onBeforeRender(C,L,q,z,y,ge),G.transparent===!0&&G.side===ln&&G.forceSinglePass===!1?(G.side=nn,G.needsUpdate=!0,C.renderBufferDirect(q,L,z,G,y,ge),G.side=Ri,G.needsUpdate=!0,C.renderBufferDirect(q,L,z,G,y,ge),G.side=ln):C.renderBufferDirect(q,L,z,G,y,ge),y.onAfterRender(C,L,q,z,G,ge)}function ss(y,L,q){L.isScene!==!0&&(L=en);const z=V.get(y),G=b.state.lights,ge=b.state.shadowsArray,ye=G.state.version,me=ce.getParameters(y,G.state,ge,L,q,b.state.lightProbeGridArray),be=ce.getProgramCacheKey(me);let Te=z.programs;z.environment=y.isMeshStandardMaterial||y.isMeshLambertMaterial||y.isMeshPhongMaterial?L.environment:null,z.fog=L.fog;const ke=y.isMeshStandardMaterial||y.isMeshLambertMaterial&&!y.envMap||y.isMeshPhongMaterial&&!y.envMap;z.envMap=ae.get(y.envMap||z.environment,ke),z.envMapRotation=z.environment!==null&&y.envMap===null?L.environmentRotation:y.envMapRotation,Te===void 0&&(y.addEventListener("dispose",An),Te=new Map,z.programs=Te);let We=Te.get(be);if(We!==void 0){if(z.currentProgram===We&&z.lightsStateVersion===ye)return ic(y,me),We}else me.uniforms=ce.getUniforms(y),O!==null&&y.isNodeMaterial&&O.build(y,q,me),y.onBeforeCompile(me,C),We=ce.acquireProgram(me,be),Te.set(be,We),z.uniforms=me.uniforms;const Ee=z.uniforms;return(!y.isShaderMaterial&&!y.isRawShaderMaterial||y.clipping===!0)&&(Ee.clippingPlanes=Ce.uniform),ic(y,me),z.needsLights=bu(y),z.lightsStateVersion=ye,z.needsLights&&(Ee.ambientLightColor.value=G.state.ambient,Ee.lightProbe.value=G.state.probe,Ee.sunLights.value=G.state.sun,Ee.sunLightShadows.value=G.state.sunShadow,Ee.directionalLights.value=G.state.directional,Ee.directionalLightShadows.value=G.state.directionalShadow,Ee.spotLights.value=G.state.spot,Ee.spotLightShadows.value=G.state.spotShadow,Ee.rectAreaLights.value=G.state.rectArea,Ee.ltc_1.value=G.state.rectAreaLTC1,Ee.ltc_2.value=G.state.rectAreaLTC2,Ee.pointLights.value=G.state.point,Ee.pointLightShadows.value=G.state.pointShadow,Ee.hemisphereLights.value=G.state.hemi,Ee.sunShadowMatrix.value=G.state.sunShadowMatrix,Ee.sunShadowCascade.value=G.state.sunShadowCascade,Ee.directionalShadowMatrix.value=G.state.directionalShadowMatrix,Ee.spotLightMatrix.value=G.state.spotLightMatrix,Ee.spotLightMap.value=G.state.spotLightMap,Ee.pointShadowMatrix.value=G.state.pointShadowMatrix),z.lightProbeGrid=b.state.lightProbeGridArray.length>0,z.currentProgram=We,z.uniformsList=null,We}function nc(y){if(y.uniformsList===null){const L=y.currentProgram.getUniforms();y.uniformsList=Gs.seqWithValue(L.seq,y.uniforms)}return y.uniformsList}function ic(y,L){const q=V.get(y);q.outputColorSpace=L.outputColorSpace,q.batching=L.batching,q.batchingColor=L.batchingColor,q.instancing=L.instancing,q.instancingColor=L.instancingColor,q.instancingMorph=L.instancingMorph,q.skinning=L.skinning,q.morphTargets=L.morphTargets,q.morphNormals=L.morphNormals,q.morphColors=L.morphColors,q.morphTargetsCount=L.morphTargetsCount,q.numClippingPlanes=L.numClippingPlanes,q.numIntersection=L.numClipIntersection,q.vertexAlphas=L.vertexAlphas,q.vertexTangents=L.vertexTangents,q.toneMapping=L.toneMapping}function Su(y,L){if(y.length===0)return null;if(y.length===1)return y[0].texture!==null?y[0]:null;v.setFromMatrixPosition(L.matrixWorld);for(let q=0,z=y.length;q<z;q++){const G=y[q];if(G.texture!==null&&G.boundingBox.containsPoint(v))return G}return null}function Mu(y,L,q,z,G){L.isScene!==!0&&(L=en),K.resetTextureUnits();const ge=L.fog,ye=z.isMeshStandardMaterial||z.isMeshLambertMaterial||z.isMeshPhongMaterial?L.environment:null,me=Q===null?C.outputColorSpace:Q.isXRRenderTarget===!0?Q.texture.colorSpace:qe.workingColorSpace,be=z.isMeshStandardMaterial||z.isMeshLambertMaterial&&!z.envMap||z.isMeshPhongMaterial&&!z.envMap,Te=ae.get(z.envMap||ye,be),ke=z.vertexColors===!0&&!!q.attributes.color&&q.attributes.color.itemSize===4,We=!!q.attributes.tangent&&(!!z.normalMap||z.anisotropy>0),Ee=!!q.morphAttributes.position,Qe=!!q.morphAttributes.normal,Tt=!!q.morphAttributes.color;let ft=Fn;z.toneMapped&&(Q===null||Q.isXRRenderTarget===!0)&&(ft=C.toneMapping);const st=q.morphAttributes.position||q.morphAttributes.normal||q.morphAttributes.color,zt=st!==void 0?st.length:0,Se=V.get(z),Kt=b.state.lights;if(Ze===!0&&(ct===!0||y!==j)){const ht=y===j&&z.id===W;Ce.setState(z,y,ht)}let $e=!1;z.version===Se.__version?(Se.needsLights&&Se.lightsStateVersion!==Kt.state.version||Se.outputColorSpace!==me||G.isBatchedMesh&&Se.batching===!1||!G.isBatchedMesh&&Se.batching===!0||G.isBatchedMesh&&Se.batchingColor===!0&&G._colorsTexture===null||G.isBatchedMesh&&Se.batchingColor===!1&&G._colorsTexture!==null||G.isInstancedMesh&&Se.instancing===!1||!G.isInstancedMesh&&Se.instancing===!0||G.isSkinnedMesh&&Se.skinning===!1||!G.isSkinnedMesh&&Se.skinning===!0||G.isInstancedMesh&&Se.instancingColor===!0&&G.instanceColor===null||G.isInstancedMesh&&Se.instancingColor===!1&&G.instanceColor!==null||G.isInstancedMesh&&Se.instancingMorph===!0&&G.morphTexture===null||G.isInstancedMesh&&Se.instancingMorph===!1&&G.morphTexture!==null||Se.envMap!==Te||z.fog===!0&&Se.fog!==ge||Se.numClippingPlanes!==void 0&&(Se.numClippingPlanes!==Ce.numPlanes||Se.numIntersection!==Ce.numIntersection)||Se.vertexAlphas!==ke||Se.vertexTangents!==We||Se.morphTargets!==Ee||Se.morphNormals!==Qe||Se.morphColors!==Tt||Se.toneMapping!==ft||Se.morphTargetsCount!==zt||!!Se.lightProbeGrid!=b.state.lightProbeGridArray.length>0)&&($e=!0):($e=!0,Se.__version=z.version);let hn=Se.currentProgram;$e===!0&&(hn=ss(z,L,G),O&&z.isNodeMaterial&&O.onUpdateProgram(z,hn,Se));let Rn=!1,Qn=!1,Bi=!1;const it=hn.getUniforms(),Et=Se.uniforms;if(x.useProgram(hn.program)&&(Rn=!0,Qn=!0,Bi=!0),z.id!==W&&(W=z.id,Qn=!0),Se.needsLights){const ht=Su(b.state.lightProbeGridArray,G);Se.lightProbeGrid!==ht&&(Se.lightProbeGrid=ht,Qn=!0)}if(Rn||j!==y){x.buffers.depth.getReversed()&&y.reversedDepth!==!0&&(y._reversedDepth=!0,y.updateProjectionMatrix()),it.setValue(U,"projectionMatrix",y.projectionMatrix),it.setValue(U,"viewMatrix",y.matrixWorldInverse);const ei=it.map.cameraPosition;ei!==void 0&&ei.setValue(U,gt.setFromMatrixPosition(y.matrixWorld)),P.logarithmicDepthBuffer&&it.setValue(U,"logDepthBufFC",2/(Math.log(y.far+1)/Math.LN2)),(z.isMeshPhongMaterial||z.isMeshToonMaterial||z.isMeshLambertMaterial||z.isMeshBasicMaterial||z.isMeshStandardMaterial||z.isShaderMaterial)&&it.setValue(U,"isOrthographic",y.isOrthographicCamera===!0),j!==y&&(j=y,Qn=!0,Bi=!0)}if(Se.needsLights&&(Kt.state.sunShadowMap.length>0&&it.setValue(U,"sunShadowMap",Kt.state.sunShadowMap,K),Kt.state.directionalShadowMap.length>0&&it.setValue(U,"directionalShadowMap",Kt.state.directionalShadowMap,K),Kt.state.spotShadowMap.length>0&&it.setValue(U,"spotShadowMap",Kt.state.spotShadowMap,K),Kt.state.pointShadowMap.length>0&&it.setValue(U,"pointShadowMap",Kt.state.pointShadowMap,K)),G.isSkinnedMesh){it.setOptional(U,G,"bindMatrix"),it.setOptional(U,G,"bindMatrixInverse");const ht=G.skeleton;ht&&(ht.boneTexture===null&&ht.computeBoneTexture(),it.setValue(U,"boneTexture",ht.boneTexture,K))}G.isBatchedMesh&&(it.setOptional(U,G,"batchingTexture"),it.setValue(U,"batchingTexture",G._matricesTexture,K),it.setOptional(U,G,"batchingIdTexture"),it.setValue(U,"batchingIdTexture",G._indirectTexture,K),it.setOptional(U,G,"batchingColorTexture"),G._colorsTexture!==null&&it.setValue(U,"batchingColorTexture",G._colorsTexture,K));const jn=q.morphAttributes;if((jn.position!==void 0||jn.normal!==void 0||jn.color!==void 0)&&N.update(G,q,hn),(Qn||Se.receiveShadow!==G.receiveShadow)&&(Se.receiveShadow=G.receiveShadow,it.setValue(U,"receiveShadow",G.receiveShadow)),(z.isMeshStandardMaterial||z.isMeshLambertMaterial||z.isMeshPhongMaterial)&&z.envMap===null&&L.environment!==null&&(Et.envMapIntensity.value=L.environmentIntensity),Et.dfgLUT!==void 0&&(Et.dfgLUT.value=$_()),Qn){if(it.setValue(U,"toneMappingExposure",C.toneMappingExposure),Se.needsLights&&yu(Et,Bi),ge&&z.fog===!0&&Re.refreshFogUniforms(Et,ge),Re.refreshMaterialUniforms(Et,z,Z,Y,b.state.transmissionRenderTarget[y.id]),Se.needsLights&&Se.lightProbeGrid){const ht=Se.lightProbeGrid;Et.probesSH.value=ht.texture,Et.probesMin.value.copy(ht.boundingBox.min),Et.probesMax.value.copy(ht.boundingBox.max),Et.probesResolution.value.copy(ht.resolution)}Gs.upload(U,nc(Se),Et,K)}if(z.isShaderMaterial&&z.uniformsNeedUpdate===!0&&(Gs.upload(U,nc(Se),Et,K),z.uniformsNeedUpdate=!1),z.isSpriteMaterial&&it.setValue(U,"center",G.center),it.setValue(U,"modelViewMatrix",G.modelViewMatrix),it.setValue(U,"normalMatrix",G.normalMatrix),it.setValue(U,"modelMatrix",G.matrixWorld),z.uniformsGroups!==void 0){const ht=z.uniformsGroups;for(let ei=0,ki=ht.length;ei<ki;ei++){const sc=ht[ei];re.update(sc,hn),re.bind(sc,hn)}}return hn}function yu(y,L){y.ambientLightColor.needsUpdate=L,y.lightProbe.needsUpdate=L,y.sunLights.needsUpdate=L,y.sunLightShadows.needsUpdate=L,y.directionalLights.needsUpdate=L,y.directionalLightShadows.needsUpdate=L,y.pointLights.needsUpdate=L,y.pointLightShadows.needsUpdate=L,y.spotLights.needsUpdate=L,y.spotLightShadows.needsUpdate=L,y.rectAreaLights.needsUpdate=L,y.hemisphereLights.needsUpdate=L}function bu(y){return y.isMeshLambertMaterial||y.isMeshToonMaterial||y.isMeshPhongMaterial||y.isMeshStandardMaterial||y.isShadowMaterial||y.isShaderMaterial&&y.lights===!0}this.getActiveCubeFace=function(){return X},this.getActiveMipmapLevel=function(){return S},this.getRenderTarget=function(){return Q},this.setRenderTargetTextures=function(y,L,q){const z=V.get(y);z.__autoAllocateDepthBuffer=y.resolveDepthBuffer===!1,z.__autoAllocateDepthBuffer===!1&&(z.__useRenderToTexture=!1),V.get(y.texture).__webglTexture=L,V.get(y.depthTexture).__webglTexture=z.__autoAllocateDepthBuffer?void 0:q,z.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(y,L){const q=V.get(y);q.__webglFramebuffer=L,q.__useDefaultFramebuffer=L===void 0},this.setRenderTarget=function(y,L=0,q=0){Q=y,X=L,S=q;let z=null,G=!1,ge=!1;if(y){const me=V.get(y);if(me.__useDefaultFramebuffer!==void 0){x.bindFramebuffer(U.FRAMEBUFFER,me.__webglFramebuffer),ee.copy(y.viewport),ie.copy(y.scissor),se=y.scissorTest,x.viewport(ee),x.scissor(ie),x.setScissorTest(se),W=-1;return}else if(me.__webglFramebuffer===void 0)K.setupRenderTarget(y);else if(me.__hasExternalTextures)K.rebindTextures(y,V.get(y.texture).__webglTexture,V.get(y.depthTexture).__webglTexture);else if(y.depthBuffer){const ke=y.depthTexture;if(me.__boundDepthTexture!==ke){if(ke!==null&&V.has(ke)&&(y.width!==ke.image.width||y.height!==ke.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");K.setupDepthRenderbuffer(y)}}const be=y.texture;(be.isData3DTexture||be.isDataArrayTexture||be.isCompressedArrayTexture)&&(ge=!0);const Te=V.get(y).__webglFramebuffer;y.isWebGLCubeRenderTarget?(Array.isArray(Te[L])?z=Te[L][q]:z=Te[L],G=!0):y.samples>0&&K.useMultisampledRTT(y)===!1?z=V.get(y).__webglMultisampledFramebuffer:Array.isArray(Te)?z=Te[q]:z=Te,ee.copy(y.viewport),ie.copy(y.scissor),se=y.scissorTest}else ee.copy(_e).multiplyScalar(Z).floor(),ie.copy(He).multiplyScalar(Z).floor(),se=Pt;if(q!==0&&(z=H),x.bindFramebuffer(U.FRAMEBUFFER,z)&&x.drawBuffers(y,z),x.viewport(ee),x.scissor(ie),x.setScissorTest(se),G){const me=V.get(y.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+L,me.__webglTexture,q)}else if(ge){const me=L;for(let be=0;be<y.textures.length;be++){const Te=V.get(y.textures[be]);U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0+be,Te.__webglTexture,q,me)}}else if(y!==null&&q!==0){const me=V.get(y.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,me.__webglTexture,q)}W=-1};function rc(y){const L=V.get(y);return(L.__readFormat!==y.format||L.__readType!==y.type)&&(L.__readFormat=y.format,L.__readType=y.type,L.__formatReadable=P.textureFormatReadable(y.format),L.__typeReadable=P.textureTypeReadable(y.type)),L}this.readRenderTargetPixels=function(y,L,q,z,G,ge,ye,me=0){if(!(y&&y.isWebGLRenderTarget)){Ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let be=V.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&ye!==void 0&&(be=be[ye]),be){x.bindFramebuffer(U.FRAMEBUFFER,be);try{const Te=y.textures[me],ke=Te.format,We=Te.type;y.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+me);const Ee=rc(Te);if(Ee.__formatReadable===!1){Ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Ee.__typeReadable===!1){Ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}L>=0&&L<=y.width-z&&q>=0&&q<=y.height-G&&U.readPixels(L,q,z,G,ue.convert(ke),ue.convert(We),ge)}finally{const Te=Q!==null?V.get(Q).__webglFramebuffer:null;x.bindFramebuffer(U.FRAMEBUFFER,Te)}}},this.readRenderTargetPixelsAsync=async function(y,L,q,z,G,ge,ye,me=0){if(!(y&&y.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let be=V.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&ye!==void 0&&(be=be[ye]),be)if(L>=0&&L<=y.width-z&&q>=0&&q<=y.height-G){x.bindFramebuffer(U.FRAMEBUFFER,be);const Te=y.textures[me],ke=Te.format,We=Te.type;y.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+me);const Ee=rc(Te);if(Ee.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Ee.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Qe=U.createBuffer();U.bindBuffer(U.PIXEL_PACK_BUFFER,Qe),U.bufferData(U.PIXEL_PACK_BUFFER,ge.byteLength,U.STREAM_READ),U.readPixels(L,q,z,G,ue.convert(ke),ue.convert(We),0),U.bindBuffer(U.PIXEL_PACK_BUFFER,null);const Tt=Q!==null?V.get(Q).__webglFramebuffer:null;x.bindFramebuffer(U.FRAMEBUFFER,Tt);const ft=U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE,0);return U.flush(),await lf(U,ft,4),U.bindBuffer(U.PIXEL_PACK_BUFFER,Qe),U.getBufferSubData(U.PIXEL_PACK_BUFFER,0,ge),U.bindBuffer(U.PIXEL_PACK_BUFFER,null),U.deleteBuffer(Qe),U.deleteSync(ft),ge}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(y,L=null,q=0){const z=Math.pow(2,-q),G=Math.floor(y.image.width*z),ge=Math.floor(y.image.height*z),ye=L!==null?L.x:0,me=L!==null?L.y:0;K.setTexture2D(y,0),U.copyTexSubImage2D(U.TEXTURE_2D,q,0,0,ye,me,G,ge),x.unbindTexture()},this.copyTextureToTexture=function(y,L,q=null,z=null,G=0,ge=0){let ye,me,be,Te,ke,We,Ee,Qe,Tt;const ft=y.isCompressedTexture?y.mipmaps[ge]:y.image;if(q!==null)ye=q.max.x-q.min.x,me=q.max.y-q.min.y,be=q.isBox3?q.max.z-q.min.z:1,Te=q.min.x,ke=q.min.y,We=q.isBox3?q.min.z:0;else{const Et=Math.pow(2,-G);ye=Math.floor(ft.width*Et),me=Math.floor(ft.height*Et),y.isDataArrayTexture?be=ft.depth:y.isData3DTexture?be=Math.floor(ft.depth*Et):be=1,Te=0,ke=0,We=0}z!==null?(Ee=z.x,Qe=z.y,Tt=z.z):(Ee=0,Qe=0,Tt=0);const st=ue.convert(L.format),zt=ue.convert(L.type);let Se;L.isData3DTexture?(K.setTexture3D(L,0),Se=U.TEXTURE_3D):L.isDataArrayTexture||L.isCompressedArrayTexture?(K.setTexture2DArray(L,0),Se=U.TEXTURE_2D_ARRAY):(K.setTexture2D(L,0),Se=U.TEXTURE_2D),x.activeTexture(U.TEXTURE0),x.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,L.flipY),x.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,L.premultiplyAlpha),x.pixelStorei(U.UNPACK_ALIGNMENT,L.unpackAlignment);const Kt=x.getParameter(U.UNPACK_ROW_LENGTH),$e=x.getParameter(U.UNPACK_IMAGE_HEIGHT),hn=x.getParameter(U.UNPACK_SKIP_PIXELS),Rn=x.getParameter(U.UNPACK_SKIP_ROWS),Qn=x.getParameter(U.UNPACK_SKIP_IMAGES);x.pixelStorei(U.UNPACK_ROW_LENGTH,ft.width),x.pixelStorei(U.UNPACK_IMAGE_HEIGHT,ft.height),x.pixelStorei(U.UNPACK_SKIP_PIXELS,Te),x.pixelStorei(U.UNPACK_SKIP_ROWS,ke),x.pixelStorei(U.UNPACK_SKIP_IMAGES,We);const Bi=y.isDataArrayTexture||y.isData3DTexture,it=L.isDataArrayTexture||L.isData3DTexture;if(y.isDepthTexture){const Et=V.get(y),jn=V.get(L),ht=V.get(Et.__renderTarget),ei=V.get(jn.__renderTarget);x.bindFramebuffer(U.READ_FRAMEBUFFER,ht.__webglFramebuffer),x.bindFramebuffer(U.DRAW_FRAMEBUFFER,ei.__webglFramebuffer);for(let ki=0;ki<be;ki++)Bi&&(U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,V.get(y).__webglTexture,G,We+ki),U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,V.get(L).__webglTexture,ge,Tt+ki)),U.blitFramebuffer(Te,ke,ye,me,Ee,Qe,ye,me,U.DEPTH_BUFFER_BIT,U.NEAREST);x.bindFramebuffer(U.READ_FRAMEBUFFER,null),x.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else if(G!==0||y.isRenderTargetTexture||V.has(y)){const Et=V.get(y),jn=V.get(L);x.bindFramebuffer(U.READ_FRAMEBUFFER,F),x.bindFramebuffer(U.DRAW_FRAMEBUFFER,k);for(let ht=0;ht<be;ht++)Bi?U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Et.__webglTexture,G,We+ht):U.framebufferTexture2D(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,Et.__webglTexture,G),it?U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,jn.__webglTexture,ge,Tt+ht):U.framebufferTexture2D(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,jn.__webglTexture,ge),G!==0?U.blitFramebuffer(Te,ke,ye,me,Ee,Qe,ye,me,U.COLOR_BUFFER_BIT,U.NEAREST):it?U.copyTexSubImage3D(Se,ge,Ee,Qe,Tt+ht,Te,ke,ye,me):U.copyTexSubImage2D(Se,ge,Ee,Qe,Te,ke,ye,me);x.bindFramebuffer(U.READ_FRAMEBUFFER,null),x.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else it?y.isDataTexture||y.isData3DTexture?U.texSubImage3D(Se,ge,Ee,Qe,Tt,ye,me,be,st,zt,ft.data):L.isCompressedArrayTexture?U.compressedTexSubImage3D(Se,ge,Ee,Qe,Tt,ye,me,be,st,ft.data):U.texSubImage3D(Se,ge,Ee,Qe,Tt,ye,me,be,st,zt,ft):y.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,ge,Ee,Qe,ye,me,st,zt,ft.data):y.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,ge,Ee,Qe,ft.width,ft.height,st,ft.data):U.texSubImage2D(U.TEXTURE_2D,ge,Ee,Qe,ye,me,st,zt,ft);x.pixelStorei(U.UNPACK_ROW_LENGTH,Kt),x.pixelStorei(U.UNPACK_IMAGE_HEIGHT,$e),x.pixelStorei(U.UNPACK_SKIP_PIXELS,hn),x.pixelStorei(U.UNPACK_SKIP_ROWS,Rn),x.pixelStorei(U.UNPACK_SKIP_IMAGES,Qn),ge===0&&L.generateMipmaps&&U.generateMipmap(Se),x.unbindTexture()},this.initRenderTarget=function(y){V.get(y).__webglFramebuffer===void 0&&K.setupRenderTarget(y)},this.initTexture=function(y){y.isCubeTexture?K.setTextureCube(y,0):y.isData3DTexture?K.setTexture3D(y,0):y.isDataArrayTexture||y.isCompressedArrayTexture?K.setTexture2DArray(y,0):K.setTexture2D(y,0),x.unbindTexture()},this.resetState=function(){X=0,S=0,Q=null,x.reset(),xe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Nn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=qe._getDrawingBufferColorSpace(e),t.unpackColorSpace=qe._getUnpackColorSpace()}}const Hs={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class jr{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const Z_=new ha(-1,1,1,-1,0,1);class J_ extends Ct{constructor(){super(),this.setAttribute("position",new lt([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new lt([0,2,0,0,2,0],2))}}const Q_=new J_;class mh{constructor(e){this._mesh=new bt(Q_,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Z_)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class j_ extends jr{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof Yt?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=na.clone(e.uniforms),this.material=new Yt({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new mh(this.material)}render(e,t,i){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=i.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class ad extends jr{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,i){const r=e.getContext(),s=e.state;s.buffers.color.setMask(!1),s.buffers.depth.setMask(!1),s.buffers.color.setLocked(!0),s.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),s.buffers.stencil.setTest(!0),s.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),s.buffers.stencil.setFunc(r.ALWAYS,a,4294967295),s.buffers.stencil.setClear(o),s.buffers.stencil.setLocked(!0),e.setRenderTarget(i),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),s.buffers.color.setLocked(!1),s.buffers.depth.setLocked(!1),s.buffers.color.setMask(!0),s.buffers.depth.setMask(!0),s.buffers.stencil.setLocked(!1),s.buffers.stencil.setFunc(r.EQUAL,1,4294967295),s.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),s.buffers.stencil.setLocked(!0)}}class ex extends jr{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class tx{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const i=e.getSize(new Ae);this._width=i.width,this._height=i.height,t=new jt(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:rn}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new j_(Hs),this.copyPass.material.blending=Un,this.timer=new Zf}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());const t=this.renderer.getRenderTarget();let i=!1;for(let r=0,s=this.passes.length;r<s;r++){const a=this.passes[r];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(r),a.render(this.renderer,this.writeBuffer,this.readBuffer,e,i),a.needsSwap){if(i){const o=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}ad!==void 0&&(a instanceof ad?i=!0:a instanceof ex&&(i=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new Ae);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const i=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(i,r),this.renderTarget2.setSize(i,r);for(let s=0;s<this.passes.length;s++)this.passes[s].setSize(i,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class nx extends jr{constructor(e,t,i=null,r=null,s=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=i,this.clearColor=r,this.clearAlpha=s,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new Le}render(e,t,i){const r=e.autoClear;e.autoClear=!1;let s,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(s=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:i),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(s),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=r}}const ix={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new Le(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class cr extends jr{constructor(e,t=1,i,r){super(),this.strength=t,this.radius=i,this.threshold=r,this.resolution=e!==void 0?new Ae(e.x,e.y):new Ae(256,256),this.clearColor=new Le(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let s=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new jt(s,a,{type:rn,depthBuffer:!1}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let u=0;u<this.nMips;u++){const f=new jt(s,a,{type:rn,depthBuffer:!1});f.texture.name="UnrealBloomPass.h"+u,f.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(f);const h=new jt(s,a,{type:rn,depthBuffer:!1});h.texture.name="UnrealBloomPass.v"+u,h.texture.generateMipmaps=!1,this.renderTargetsVertical.push(h),s=Math.round(s/2),a=Math.round(a/2)}const o=ix;this.highPassUniforms=na.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=r,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Yt({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];const l=[6,10,14,18,22];s=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let u=0;u<this.nMips;u++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[u])),this.separableBlurMaterials[u].uniforms.invSize.value=new Ae(1/s,1/a),s=Math.round(s/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new I(1,1,1),new I(1,1,1),new I(1,1,1),new I(1,1,1),new I(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=na.clone(Hs.uniforms),this.blendMaterial=new Yt({uniforms:this.copyUniforms,vertexShader:Hs.vertexShader,fragmentShader:Hs.fragmentShader,premultipliedAlpha:!0,blending:Xs,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new Le,this._oldClearAlpha=1,this._basic=new mi,this._fsQuad=new mh(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let i=Math.round(e/2),r=Math.round(t/2);this.renderTargetBright.setSize(i,r);for(let s=0;s<this.nMips;s++)this.renderTargetsHorizontal[s].setSize(i,r),this.renderTargetsVertical[s].setSize(i,r),this.separableBlurMaterials[s].uniforms.invSize.value=new Ae(1/i,1/r),i=Math.round(i/2),r=Math.round(r/2)}render(e,t,i,r,s){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();const a=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),s&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=i.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=i.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let o=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this._fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[l].uniforms.direction.value=cr.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=cr.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this._fsQuad.render(e),o=this.renderTargetsVertical[l];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,s&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(i),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=a}_getSeparableBlurMaterial(e){const t=[],i=e/3;for(let a=0;a<e;a++)t.push(.39894*Math.exp(-.5*a*a/(i*i))/i);const r=[],s=[];for(let a=1;a<e;a+=2){const o=t[a],l=a+1<e?t[a+1]:0,c=o+l;r.push((a*o+(a+1)*l)/c),s.push(c)}return new Yt({defines:{KERNEL_PAIRS:r.length},uniforms:{colorTexture:{value:null},invSize:{value:new Ae(.5,.5)},direction:{value:new Ae(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:r},gaussianWeights:{value:s}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float centerWeight;
				uniform float gaussianOffsets[KERNEL_PAIRS];
				uniform float gaussianWeights[KERNEL_PAIRS];

				void main() {

					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * centerWeight;

					for ( int i = 0; i < KERNEL_PAIRS; i ++ ) {

						vec2 uvOffset = direction * invSize * gaussianOffsets[ i ];
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * gaussianWeights[ i ];

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new Yt({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}}cr.BlurDirectionX=new Ae(1,0);cr.BlurDirectionY=new Ae(0,1);const gh=Math.sqrt(3);function Pl(n,e,t){return{x:t*1.5*n,y:t*gh*(e+n/2)}}function pa(n,e,t){const i=.6666666666666666*(n/t),r=e/(t*gh)-i/2;return rx(i,r)}function rx(n,e){const t=-n-e;let i=Math.round(n),r=Math.round(e);const s=Math.round(t),a=Math.abs(i-n),o=Math.abs(r-e),l=Math.abs(s-t);return a>o&&a>l?i=-r-s:o>l&&(r=-i-s),{q:i,r}}function es(n,e){return`${n},${e}`}const sx=[{q:1,r:0},{q:1,r:-1},{q:0,r:-1},{q:-1,r:0},{q:-1,r:1},{q:0,r:1}];function ax(n,e){return sx.map(t=>({q:n+t.q,r:e+t.r}))}const _h={id:"first-run-readable",label:"Readable First Run",description:"Raw-field start with separated opening, upper, lower, and far-east seams for route-shape testing.",start:{x:128,y:520},startHeading:-.1,starterFieldPoints:Dl([{x:150,y:516},{x:268,y:500}]),fertileZones:[{id:"runway-pocket",x:320,y:492,radius:82,vein:{from:{x:240,y:512},to:{x:408,y:466},width:64},richness:1.18,remaining:6.5},{id:"temptation-lobe",x:690,y:342,radius:120,vein:{from:{x:590,y:414},to:{x:784,y:280},width:70},richness:1.95,remaining:13},{id:"recovery-pocket",x:392,y:640,radius:108,vein:{from:{x:286,y:624},to:{x:514,y:672},width:72},richness:1.65,remaining:12},{id:"upper-shelf",x:484,y:256,radius:90,vein:{from:{x:382,y:294},to:{x:592,y:226},width:58},richness:1.45,remaining:9},{id:"east-saddle",x:846,y:496,radius:112,vein:{from:{x:734,y:548},to:{x:958,y:448},width:68},richness:1.55,remaining:12},{id:"south-east-pocket",x:782,y:632,radius:94,vein:{from:{x:676,y:628},to:{x:900,y:664},width:62},richness:1.45,remaining:9}],ridges:[{id:"left-horizon",from:{x:76,y:392},to:{x:188,y:368}},{id:"north-backstop",from:{x:664,y:210},to:{x:884,y:268}},{id:"south-boundary",from:{x:610,y:674},to:{x:844,y:682}}],beats:[{id:"runway",label:"opening seam",x:320,y:492},{id:"upper-shelf",label:"upper shelf",x:484,y:256},{id:"temptation",label:"rich far seam",x:690,y:342},{id:"recovery",label:"lower recovery",x:392,y:640},{id:"east-saddle",label:"east saddle",x:846,y:496},{id:"south-east",label:"south-east pocket",x:782,y:632}]},ox={..._h,id:"first-run-tight",label:"Tighter First Run",description:"A compact comparison variant with no starter field and shorter gaps between separated seams.",starterFieldPoints:[],fertileZones:[{id:"runway-pocket",x:310,y:500,radius:74,vein:{from:{x:236,y:514},to:{x:382,y:474},width:58},richness:1.35,remaining:7},{id:"temptation-lobe",x:640,y:354,radius:100,vein:{from:{x:552,y:416},to:{x:720,y:300},width:64},richness:2.1,remaining:13},{id:"recovery-pocket",x:386,y:618,radius:90,vein:{from:{x:300,y:604},to:{x:478,y:642},width:64},richness:1.75,remaining:9.5},{id:"upper-shelf",x:444,y:288,radius:76,vein:{from:{x:362,y:316},to:{x:526,y:264},width:54},richness:1.45,remaining:7},{id:"east-saddle",x:786,y:500,radius:92,vein:{from:{x:694,y:536},to:{x:880,y:464},width:60},richness:1.6,remaining:9},{id:"south-east-pocket",x:736,y:616,radius:78,vein:{from:{x:654,y:606},to:{x:820,y:638},width:56},richness:1.5,remaining:7.5}],ridges:[{id:"left-horizon",from:{x:88,y:404},to:{x:188,y:382}},{id:"upper-horizon",from:{x:604,y:238},to:{x:806,y:288}},{id:"lower-boundary",from:{x:596,y:658},to:{x:808,y:676}}],beats:[{id:"runway",label:"opening seam",x:310,y:500},{id:"upper-shelf",label:"upper shelf",x:444,y:288},{id:"temptation",label:"rich far seam",x:640,y:354},{id:"recovery",label:"lower recovery",x:386,y:618},{id:"east-saddle",label:"east saddle",x:786,y:500},{id:"south-east",label:"south-east pocket",x:736,y:616}]};function Dl(n,e=26){const t=[];for(let i=0;i<n.length-1;i+=1){const r=n[i],s=n[i+1],a=Math.max(1,Math.round(Math.hypot(s.x-r.x,s.y-r.y)/e));for(let o=0;o<a;o+=1)t.push({x:r.x+(s.x-r.x)*o/a,y:r.y+(s.y-r.y)*o/a})}return t.push(n[n.length-1]),t}const lx=Dl([{x:876,y:552},{x:700,y:604},{x:520,y:638},{x:356,y:626}]),cx=Dl([{x:878,y:526},{x:792,y:502}]),dx=[{x:900,y:535},{x:800,y:518},{x:700,y:505},{x:634,y:494}],hx={id:"last-light-return",label:"Last Light Return",description:"A round trip from the depot into the seam field and back. Every second outbound is a second you also have to spend coming home.",start:{x:900,y:535},startHeading:Math.PI-.2,extraction:{id:"extraction-home",label:"depot",x:900,y:535,radius:52,oreRequired:12},safePath:dx,solarWindowSeconds:36,starterFieldPoints:[...cx,...lx],fertileZones:[{id:"depot-flats",x:700,y:505,radius:54,vein:{from:{x:766,y:516},to:{x:634,y:494},width:40},richness:.85,remaining:7},{id:"north-shelf",x:812,y:268,radius:52,vein:{from:{x:860,y:330},to:{x:764,y:208},width:38},richness:.95,remaining:7},{id:"south-bench",x:552,y:512,radius:52,vein:{from:{x:620,y:494},to:{x:484,y:528},width:38},richness:1,remaining:7},{id:"west-cut",x:452,y:396,radius:72,vein:{from:{x:516,y:340},to:{x:388,y:452},width:50},richness:1.7,remaining:14},{id:"north-lobe",x:606,y:282,radius:70,vein:{from:{x:682,y:302},to:{x:530,y:262},width:48},richness:1.5,remaining:13},{id:"far-shelf",x:330,y:290,radius:86,vein:{from:{x:398,y:232},to:{x:262,y:350},width:58},richness:3.1,remaining:24},{id:"deep-south",x:250,y:640,radius:84,vein:{from:{x:320,y:600},to:{x:182,y:688},width:56},richness:3.2,remaining:23}],ridges:[{id:"north-shelf-shadow",from:{x:872,y:168},to:{x:690,y:196}},{id:"west-cut-wall",from:{x:520,y:330},to:{x:372,y:352}},{id:"far-shelf-rim",from:{x:330,y:132},to:{x:158,y:158}},{id:"south-divide",from:{x:500,y:700},to:{x:336,y:690}}],beats:[{id:"start",label:"depot",x:900,y:535},{id:"depot-flats",label:"near flats",x:640,y:500},{id:"north-shelf",label:"north shelf",x:830,y:250},{id:"south-bench",label:"south bench",x:660,y:660},{id:"west-cut",label:"west cut",x:450,y:470},{id:"north-lobe",label:"north lobe",x:600,y:280},{id:"far-shelf",label:"far shelf",x:250,y:250},{id:"deep-south",label:"deep south",x:230,y:640}]},ux={"first-run-readable":_h,"first-run-tight":ox,"last-light-return":hx},fx="last-light-return";function px(n=fx){return ux[n]}function mx(n,e){var i;if(e===1)return n;const t=r=>({x:r.x*e,y:r.y*e});return{...n,start:t(n.start),extraction:n.extraction?{...n.extraction,x:n.extraction.x*e,y:n.extraction.y*e}:void 0,safePath:(i=n.safePath)==null?void 0:i.map(t),starterFieldPoints:n.starterFieldPoints.map(t),fertileZones:n.fertileZones.map(r=>({...r,x:r.x*e,y:r.y*e,vein:r.vein?{...r.vein,from:t(r.vein.from),to:t(r.vein.to)}:r.vein})),ridges:n.ridges.map(r=>({...r,from:t(r.from),to:t(r.to)})),beats:n.beats.map(r=>({...r,x:r.x*e,y:r.y*e}))}}function gx(n,e,t,i){const r=[],s=new Set;for(const a of n.starterFieldPoints){const o=pa(a.x,a.y,t),l=es(o.q,o.r);if(s.has(l))continue;s.add(l);const c=Pl(o.q,o.r,t);r.push({id:r.length+1,x:c.x,y:c.y,radius:i,value:e,age:5.4-r.length*.18})}return r}const io=["scatter","ridge","clusters","belt"],_x={spread:1,layout:0,count:1,amount:1,poolSize:1};function xx(n,e,t=1,i=_x){const r=vx(`${e}:${n.id}:layout-v3`),s=Math.max(1,t),a={minX:90*s,maxX:905*s,minY:150*s,maxY:675*s},o=n.start,l=n.extraction,c=(ie,se,Me,ve)=>Math.hypot(ie-Me,se-ve),u=ie=>Math.min(a.maxX,Math.max(a.minX,ie)),f=ie=>Math.min(a.maxY,Math.max(a.minY,ie)),h=l?{x:l.x,y:l.y}:{x:o.x,y:o.y},p=(a.minX+a.maxX)/2,g=(a.minY+a.maxY)/2,M=Math.min(a.maxX-a.minX,a.maxY-a.minY),m=io[Math.floor(r()*io.length)],d=i.layout>=1&&i.layout<=4?io[Math.round(i.layout)-1]:m,E=r()*Math.PI*2,A=M*.55,v={x:p-Math.cos(E)*A,y:g-Math.sin(E)*A},w={x:p+Math.cos(E)*A,y:g+Math.sin(E)*A},b=r()*Math.PI*2,R=b+Math.PI*(.55+r()*.9),_=(l?l.radius:0)+150,T={x:u(h.x+Math.cos(b)*_),y:f(h.y+Math.sin(b)*_)},C={x:u(h.x+Math.cos(R)*M*.5),y:f(h.y+Math.sin(R)*M*.5)},D=_+40+r()*(M*.28);function O(){switch(d){case"ridge":{const ie=r(),se=(r()-.5)*150;return{x:v.x+(w.x-v.x)*ie-Math.sin(E)*se,y:v.y+(w.y-v.y)*ie+Math.cos(E)*se}}case"clusters":{const ie=r()<.5?T:C;return{x:ie.x+(r()-.5)*190,y:ie.y+(r()-.5)*190}}case"belt":{const ie=r()*Math.PI*2,se=D+(r()-.5)*130;return{x:h.x+Math.cos(ie)*se,y:h.y+Math.sin(ie)*se}}default:return{x:a.minX+r()*(a.maxX-a.minX),y:a.minY+r()*(a.maxY-a.minY)}}}const H=n.fertileZones,F=Math.max(1,Math.round(H.length*i.count)),k=Array.from({length:F},(ie,se)=>{const Me=H[se%H.length];return se<H.length?Me:{...Me,id:`${Me.id}~x${se}`}}),X=[];for(const ie of k){let se=ie.x,Me=ie.y,ve=-1;for(let Ue=0;Ue<120;Ue+=1){const{x:Y,y:Z}=O();if(Y<a.minX||Y>a.maxX||Z<a.minY||Z>a.maxY||c(Y,Z,o.x,o.y)<180||l&&c(Y,Z,l.x,l.y)<l.radius+110)continue;const le=X.reduce((De,_e)=>Math.min(De,c(Y,Z,_e.x,_e.y)),1/0);if(le>=155){se=Y,Me=Z,ve=le;break}le>ve&&(ve=le,se=Y,Me=Z)}X.push({x:se,y:Me})}if(i.spread!==1)for(const ie of X)ie.x=u(p+(ie.x-p)*i.spread),ie.y=f(g+(ie.y-g)*i.spread);const S=ie=>{ie.x=u(ie.x),ie.y=f(ie.y);const se=c(ie.x,ie.y,o.x,o.y);if(se<186){const Me=se||1;ie.x=u(o.x+(ie.x-o.x)/Me*186),ie.y=f(o.y+(ie.y-o.y)/Me*186)}if(l){const Me=c(ie.x,ie.y,l.x,l.y),ve=l.radius+116;if(Me<ve){const Ue=Me||1;ie.x=u(l.x+(ie.x-l.x)/Ue*ve),ie.y=f(l.y+(ie.y-l.y)/Ue*ve)}}},Q=160;for(let ie=0;ie<80;ie+=1){let se=!1;for(let Me=0;Me<X.length;Me+=1)for(let ve=Me+1;ve<X.length;ve+=1){const Ue=X[ve].x-X[Me].x,Y=X[ve].y-X[Me].y,Z=Math.hypot(Ue,Y)||.01;if(Z<Q){const le=(Q-Z)/2,De=Ue/Z,_e=Y/Z;X[Me].x-=De*le,X[Me].y-=_e*le,X[ve].x+=De*le,X[ve].y+=_e*le,se=!0}}for(const Me of X)S(Me);if(!se)break}const W=X.map((ie,se)=>se),j=k.map((ie,se)=>se);l&&(W.sort((ie,se)=>c(X[ie].x,X[ie].y,l.x,l.y)-c(X[se].x,X[se].y,l.x,l.y)),j.sort((ie,se)=>k[ie].richness-k[se].richness));const ee=k.map(ie=>({...ie}));return W.forEach((ie,se)=>{const Me=k[j[se]],ve=X[ie];let Ue=Me.vein;if(Me.vein){const Y=Math.hypot(Me.vein.to.x-Me.vein.from.x,Me.vein.to.y-Me.vein.from.y)*i.poolSize,Z=d==="ridge"?E+(r()-.5)*.5:r()*Math.PI*2,le=Math.cos(Z)*Y/2,De=Math.sin(Z)*Y/2;Ue={from:{x:ve.x-le,y:ve.y-De},to:{x:ve.x+le,y:ve.y+De},width:Me.vein.width*i.poolSize}}ee[j[se]]={...Me,x:ve.x,y:ve.y,radius:Me.radius*i.poolSize,richness:Me.richness*i.amount,remaining:Me.remaining*i.amount,vein:Ue}}),ee}function vx(n){let e=2166136261;for(let t=0;t<n.length;t+=1)e^=n.charCodeAt(t),e=Math.imul(e,16777619);return()=>{e+=1831565813;let t=e;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}const Sx=.42,Mx=6,yx=1040,bx=720,ci=7,xh=.4,Ex=20,il=1,wx=ci+il,Ur=2.25,Tx=.62,vh=4.6,Ll=.9,Ax=.12,Rx={startingNanobots:6,maxNanobots:32,targetOre:42,startingSolarSeconds:165,preparedSpeed:132,fabricatingSpeed:74,crawlSpeed:16,fabricateCostPerSecond:1.48,crawlRecoveryPerSecond:.1,crawlRecoveryCeiling:2.6,droneSpeed:430,dronePickupRadius:170,mineRate:.32,preparedFieldMinAgeSeconds:1.25,startingFieldValue:.85,fieldRadius:44,tileSize:16,fieldEmitDistance:28,crawlFieldEmitDistance:12,normalFieldPatchMinValue:.12,crawlFieldPatchMinValue:.025,fieldValueMultiplierFromSpentStock:1,reclaimMinFieldAgeSeconds:2.2,reclaimMinFieldValue:.08,reclaimMinClusterPayload:1.8,droneLaunchCost:2.2,droneLaunchCooldownSeconds:9,reclaimMinDistanceFromRover:26,reclaimRouteHomeCorridor:40,reclaimLookaheadSeconds:3,reclaimClaimBreakRadius:120,reclaimPathClearance:70,reclaimYieldMultiplier:1,overnightOreRegrowth:.35,miningFlowSpeedCap:1.45,overnightFieldDecay:.94,overnightFieldSurvivalValue:.1,droneRailRelayMaxPatches:6,reclaimLockSeconds:Sx,allowCloseReclaim:!1,allowLowPayloadLaunch:!1,minReclaimClusterPayload:.08,minReclaimCandidateCount:1,reclaimProtectLoop:!1,droneTetherRange:1e9,reclaimAimBias:0,preparedCoverageThreshold:.24,preparedFieldMinValue:.08,preparedMagnetInfluenceMultiplier:1.35,preparedMagnetCenterPull:.92,preparedMagnetPassiveTurnRate:2.25,preparedMagnetActiveTurnRate:1.35,preparedMagnetCorrectionRange:.7,railSpeed:236,railCaptureDistance:40,railCaptureAlignment:.5,railBreakSteer:.34,railReleaseSeconds:.55,railHeadingSnap:9,railCenterSnap:4.2,railRunwayForFullSpeed:210,gripFloor:.2,gripActiveSteerFactor:.5,railGrip:1500,turnRate:Ur,steerRamp:vh,carryBreakSteer:Ll,lowStockWarningRatio:.18,droneUrgencyRatio:.32,preparedRefillPerSecond:0,ribbonEconomy:!1,oreSpread:1,oreLayout:0,oreCount:1,oreAmount:1,orePoolSize:1,trackSpine:!1,railTricklePerSecond:0,railTricklePerSlurp:0,railCapacityGrowthPerMinute:0,railCapacityMax:0},Cx={...Rx,startingNanobots:9,maxNanobots:24,fabricateCostPerSecond:.85,fieldEmitDistance:26,fieldRadius:46,tileSize:16,fieldValueMultiplierFromSpentStock:1,reclaimMinFieldAgeSeconds:4,reclaimMinDistanceFromRover:90,reclaimMinFieldValue:.06,reclaimMinClusterPayload:1.8,minReclaimClusterPayload:.12,allowCloseReclaim:!1,allowLowPayloadLaunch:!1,droneSpeed:260,dronePickupRadius:70,reclaimLockSeconds:.35,lowStockWarningRatio:.14,droneUrgencyRatio:.24,preparedCoverageThreshold:.22,preparedFieldMinAgeSeconds:1,preparedFieldMinValue:.06,preparedMagnetInfluenceMultiplier:1.5,preparedMagnetCenterPull:1.05,preparedMagnetPassiveTurnRate:2.1,preparedMagnetActiveTurnRate:1.25,preparedMagnetCorrectionRange:.85,railSpeed:236,railCaptureDistance:40,railCaptureAlignment:.5,railBreakSteer:.34,railReleaseSeconds:.55,railHeadingSnap:9,railCenterSnap:4.2,railRunwayForFullSpeed:210,gripFloor:.2,gripActiveSteerFactor:.5,railGrip:1500,turnRate:Ur,steerRamp:vh,carryBreakSteer:Ll,crawlRecoveryPerSecond:.45,crawlRecoveryCeiling:3.6,crawlSpeed:34,fabricatingSpeed:74,preparedSpeed:96,preparedRefillPerSecond:0,ribbonEconomy:!1},Sh=Cx;function Il(n={}){return{...Sh,...n}}function od(n="apollo-17",e={},t="first-run-readable",i=[],r={},s=1){const a=Il(e),o=mx(px(t),s),l=o.solarWindowSeconds??a.startingSolarSeconds,c=gx(o,a.startingFieldValue,a.tileSize,a.fieldRadius),u=[...c,...i.map((p,g)=>({...p,id:c.length+1+g}))],f=u.length+1,h={seed:n,arenaId:t,arena:o,width:yx*s,height:bx*s,tuning:a,rover:{...o.start,heading:o.startHeading,turnRate:0,steerInput:0,speed:0,ore:0},drone:{status:"ready",x:o.start.x,y:o.start.y,payload:0,etaSeconds:0,reclaimSeconds:0,liftedPatches:0},fields:u,fertileZones:Nx(xx(o,n,s,{spread:a.oreSpread,layout:a.oreLayout,count:a.oreCount,amount:a.oreAmount,poolSize:a.orePoolSize}),r),nanobots:a.startingNanobots,maxNanobots:a.maxNanobots,railCapacityGrown:0,targetOre:a.targetOre,solarSeconds:l,solarWindowSeconds:l,elapsedSeconds:0,lastDroneLaunchAtSeconds:-1e3,dronePendingLaunchCost:0,phase:"playing",speedState:"fabricating",arms:al("fabricating",!1,!1,"ready"),lastYieldRate:0,message:o.extraction?"Shift is over. Follow the safe road home, or risk one more seam before sunset.":u.length>0?"Prepared field online. Keep the machine supplied before sunset.":"Raw field start. Drive to lay your first line, then reclaim it.",nextFieldId:f,fieldEmitDistance:0,pendingFieldValue:0,railReleaseRemaining:0,leftExtraction:!1,returnedUnderQuota:!1};return h.speedState=Rh(h),h.arms=al(h.speedState,!!ma(h,h.rover),!1,h.drone.status),h.leftExtraction=!bh(h),h}function Px(n,e,t){let i=Eh(n);const r=mv(e);let s=Math.max(0,t);for(;s>1e-6;){const a=Math.min(s,.05);Bx(i,r,a),s-=a}return i}function Dx(n){if(n.phase!=="playing")return Us(n,"Run is over.");if(n.drone.status!=="ready")return Us(n,"Drone is already committed.");const e=iv(n),t=rl(n);if(!t)return Us(n,e.blockedReason??"No reclaimable field yet.");const i=Mh(n),r=Eh(n);r.lastDroneLaunchAtSeconds=n.elapsedSeconds,r.dronePendingLaunchCost=i;const s=r.fields.find(a=>a.id===t.targetPatchId);return s?(s.reservedByDrone=!0,r.drone={status:"outbound",x:r.rover.x,y:r.rover.y,target:{x:s.x,y:s.y},targetPatchId:s.id,payload:0,etaSeconds:t.etaSeconds,reclaimSeconds:0,liftedPatches:0},r.message="Drone committed to old field. Keep the rover close enough for a clean return.",gv(r,r.message)):Us(n,"No old field is far enough to reclaim.")}function Mh(n){const e=n.elapsedSeconds-n.lastDroneLaunchAtSeconds,t=Math.max(.001,n.tuning.droneLaunchCooldownSeconds);return n.tuning.droneLaunchCost*Dt(1-e/t,0,1)}function rl(n){if(n.phase!=="playing"||n.drone.status!=="ready")return;const e=Ph(n);if(!e)return;const t=Mh(n);return{target:{...e.target},targetPatchId:e.targetPatchId,payload:e.payload,surcharge:t,netPayload:e.payload-t,fieldCount:e.fieldCount,etaSeconds:e.refillEtaSeconds}}function Lx(n){var r,s;const e=!!n.arena.extraction;if(n.phase==="won")return{objective:"Run complete",nudge:n.message};if(n.phase==="lost")return{objective:"Run failed",nudge:n.message};if(n.elapsedSeconds<7)return e?{objective:`Mine ${((r=n.arena.extraction)==null?void 0:r.oreRequired)??0} ore, then reach extraction before sunset`,nudge:"W drives, A/D steer, S reverses. S+A or S+D swings you round."}:{objective:`Mine ${n.targetOre} ore before sunset`,nudge:"W drives, A/D steer. Gold rock is ore."};if(n.speedState==="crawl")return n.drone.status!=="ready"?{objective:"Out of road",nudge:"Drone is inbound. It meets you wherever you are."}:rl(n)?{objective:"Out of road",nudge:"Crawling. Space sends the drone."}:{objective:"Out of road",nudge:"Nothing loose to lift. Branch off and leave an end."};const t=n.solarWindowSeconds>0?n.solarSeconds/n.solarWindowSeconds:1;if(e){const o=(((s=n.arena.extraction)==null?void 0:s.oreRequired)??0)-n.rover.ore;if(t<.25&&o>0)return{objective:`Need ${o.toFixed(1)} more ore`,nudge:"And you still have to get home."};if(t<.25)return{objective:"Get to extraction now",nudge:"You have the ore. Do not lose it to the dark."}}if(n.drone.status!=="ready")return{objective:"Drone is out",nudge:"It comes back to wherever you are."};const i=rl(n);return n.nanobots/n.maxNanobots<n.tuning.droneUrgencyRatio?i?{objective:"Nanobots low",nudge:`Space sends the drone. +${i.netPayload.toFixed(1)} net.`}:{objective:"Nanobots low",nudge:"Every tile is mid-route. Branch off to leave a loose end."}:e&&t<.5?{objective:"Start heading home",nudge:"S+A or S+D to swing round. Your road is free to drive."}:ma(n,n.rover)?{objective:"Mining this seam",nudge:"Keep rolling along it. Speed and line are the yield."}:!e&&n.rover.ore>=n.targetOre?{objective:"Quota met",nudge:"Keep the machine supplied."}:{objective:e?"Find ore on the way home":"Find ore",nudge:"Drive onto a gold seam. Road lays behind you."}}function Ix(n){const e={};for(const t of n)e[t.id]=Number(t.remaining.toFixed(4));return e}function Nx(n,e){return n.map(t=>{const i=e[t.id];if(i===void 0)return t;const r=i+t.remaining*Sh.overnightOreRegrowth;return{...t,remaining:Dt(r,0,t.remaining)}})}function Ux(n,e){return n.map(t=>({...t,value:t.value*e.overnightFieldDecay,age:Math.max(t.age,e.preparedFieldMinAgeSeconds),reservedByDrone:void 0})).filter(t=>t.value>=e.overnightFieldSurvivalValue)}function yh(n,e){let t=0;for(const i of n.fields){if(i.age<n.tuning.preparedFieldMinAgeSeconds||i.value<n.tuning.preparedFieldMinValue)continue;const r=ot(e,i);r>=i.radius||(t=Math.max(t,1-r/i.radius))}return t}function ma(n,e){return n.fertileZones.find(t=>t.remaining>0&&pv(t,e))}function bh(n){const e=n.arena.extraction;return!!(e&&ot(n.rover,e)<=e.radius)}function Eh(n){var e;return{...n,rover:{...n.rover},drone:{...n.drone,target:n.drone.target?{...n.drone.target}:void 0},fields:n.fields.map(t=>({...t})),fertileZones:n.fertileZones.map(t=>({...t})),arms:{...n.arms,helper:{...n.arms.helper}},tuning:{...n.tuning},arena:{...n.arena,start:{...n.arena.start},extraction:n.arena.extraction?{...n.arena.extraction}:void 0,safePath:(e=n.arena.safePath)==null?void 0:e.map(t=>({...t})),starterFieldPoints:n.arena.starterFieldPoints.map(t=>({...t})),fertileZones:n.arena.fertileZones.map(t=>({...t,vein:t.vein?{...t.vein,from:{...t.vein.from},to:{...t.vein.to}}:void 0})),ridges:n.arena.ridges.map(t=>({...t,from:{...t.from},to:{...t.to}})),beats:n.arena.beats.map(t=>({...t}))}}}function Fx(n,e){n.speedState==="prepared"?n.nanobots=Math.min(n.maxNanobots,n.nanobots+n.tuning.preparedRefillPerSecond*e):n.speedState==="crawl"&&(n.nanobots=Math.min(n.tuning.crawlRecoveryCeiling,n.nanobots+n.tuning.crawlRecoveryPerSecond*e))}function sl(n){const e=n.tuning.maxNanobots,t=e+Math.max(0,n.railCapacityGrown??0),i=n.tuning.railCapacityMax;return i>0?Math.max(e,Math.min(i,t)):t}function wh(n){n.maxNanobots=sl(n),n.nanobots=Math.min(n.nanobots,n.maxNanobots)}function Th(n,e){e<=0||(n.nanobots=Math.min(n.maxNanobots,n.nanobots+e))}function Ox(n,e){const t=n.tuning;t.railCapacityGrowthPerMinute>0&&((t.railCapacityMax<=0||sl(n)<t.railCapacityMax)&&(n.railCapacityGrown=(n.railCapacityGrown??0)+t.railCapacityGrowthPerMinute*e/60),n.maxNanobots=sl(n)),t.railTricklePerSecond>0&&n.lastYieldRate>0&&Th(n,t.railTricklePerSecond*e)}function Bx(n,e,t){if(n.phase!=="playing")return;n.elapsedSeconds+=t,n.solarSeconds=Math.max(0,n.solarSeconds-t);for(const o of n.fields)o.age+=t;n.speedState=Rh(n,e.onRoad),Fx(n,t);const i=!!e.driveIntent,r=kx(n,e,t),s=!i&&Math.abs(e.steer)>.001;zx(n,i,s,!!e.reverseIntent,r,t);const a=ma(n,n.rover);n.arms=al(n.speedState,!!a,i,n.drone.status),Hx(n,a,i,t),Ox(n,t),Xx(n,t),nv(n)}function kx(n,e,t){var b;if(!e.driveIntent){const R=n.speedState==="prepared"?1:n.speedState==="crawl"?.54:.82;if(Math.abs(e.steer)>.001)return n.rover.heading=ol(n.rover.heading+e.steer*n.tuning.turnRate*R*t),n.rover.turnRate=e.steer*n.tuning.turnRate*R,n.rover.speed=0,n.message=e.reverseIntent?"Swinging on the spot.":"Chassis pivoting in place. Field fabrication is idle.",0;if(e.reverseIntent){const T=n.tuning.fabricatingSpeed*Tx;return n.rover.x=Dt(n.rover.x-Math.cos(n.rover.heading)*T*t,34,n.width-34),n.rover.y=Dt(n.rover.y-Math.sin(n.rover.heading)*T*t,76,n.height-34),n.rover.turnRate=0,n.rover.speed=T,n.message="Backing up. A or D to swing round.",0}return n.rover.speed=0,n.rover.turnRate=0,0}const i=n.speedState==="prepared"?.86:n.speedState==="crawl"?.56:.95,r=Math.max(.01,n.tuning.steerRamp)*t;n.rover.steerInput=Dt(n.rover.steerInput+Dt(e.steer-n.rover.steerInput,-r,r),-1,1);const s=n.rover.steerInput*n.tuning.turnRate*i;Math.abs(e.steer)>=n.tuning.railBreakSteer?n.railReleaseRemaining=n.tuning.railReleaseSeconds:n.railReleaseRemaining=Math.max(0,n.railReleaseRemaining-t),n.lastRoadPatchId=((b=Qx(n))==null?void 0:b.id)??n.lastRoadPatchId,n.rail=n.railReleaseRemaining>0?void 0:Jx(n,!!n.rail);const o=Math.abs(e.steer)>.06?n.tuning.gripActiveSteerFactor:1,l=Kx(n);let u=Dt(l.correction*n.tuning.railHeadingSnap,-Ur,Ur)*l.strength*o,f=1;if(e.assistSteer!==void 0)if(e.onRoad){const R=Math.abs(e.steer)>=n.tuning.carryBreakSteer,_=Math.min(Ur*12,Math.max(0,n.tuning.railGrip)/Math.max(40,n.rover.speed));u=R?0:Dt(e.assistSteer,-_,_),f=R?1:0}else u=0;const h=s*f;n.rover.turnRate=n.rover.turnRate*.7+(h+u)*.3,n.rover.heading=ol(n.rover.heading+(h+u)*t);const p=n.rail?Dt(n.rail.runwayAhead/n.tuning.railRunwayForFullSpeed,0,1):0;let g=n.rail?n.tuning.preparedSpeed+(n.tuning.railSpeed-n.tuning.preparedSpeed)*p:n.speedState==="prepared"?n.tuning.preparedSpeed:n.speedState==="fabricating"?n.tuning.fabricatingSpeed:n.tuning.crawlSpeed;e.roadRunway!==void 0&&(g=n.speedState==="crawl"?n.tuning.crawlSpeed:n.tuning.fabricatingSpeed+(n.tuning.railSpeed-n.tuning.fabricatingSpeed)*Dt(e.roadRunway,0,1));const M=e.brake?.28:.38+e.throttle*.62,m=g*M;n.rover.speed=m;const d=n.rover.x,E=n.rover.y;n.rover.x+=Math.cos(n.rover.heading)*m*t,n.rover.y+=Math.sin(n.rover.heading)*m*t;const A=34,v=Dt(n.rover.x,A,n.width-A),w=Dt(n.rover.y,A+42,n.height-A);return(v!==n.rover.x||w!==n.rover.y)&&(n.rover.x=v,n.rover.y=w,n.rover.heading=Math.atan2(n.height/2-n.rover.y,n.width/2-n.rover.x),n.message="Survey boundary. The chassis is steering back into the field."),d===n.rover.x&&E===n.rover.y&&(n.rover.speed=0),Math.hypot(n.rover.x-d,n.rover.y-E)}function zx(n,e,t,i,r,s){if(n.speedState==="prepared"){n.fieldEmitDistance=0,n.pendingFieldValue=0,n.layingChainId=void 0;return}if(!e){n.fieldEmitDistance=0,n.pendingFieldValue=0,n.layingChainId=void 0,i||(n.message=t?"Chassis pivoting in place. Field fabrication is idle.":n.speedState==="crawl"?"Crawl protocol standing by. Drag to scrape residue.":"Drive idle. Drag to fabricate field.");return}if(n.speedState==="fabricating"){const o=n.tuning.fabricateCostPerSecond*r/n.tuning.fabricatingSpeed,l=Math.min(n.nanobots,o);n.nanobots=Math.max(0,n.nanobots-l),n.pendingFieldValue+=l*n.tuning.fieldValueMultiplierFromSpentStock,n.message="Arms are fabricating field just in time. Mining capacity is constrained."}else n.speedState==="crawl"&&(n.pendingFieldValue+=n.tuning.crawlFieldPatchMinValue*s,n.message="Emergency crawl: local reclaim legs are scraping enough residue to keep moving.");n.layingChainId===void 0&&(n.fieldEmitDistance=n.tuning.fieldEmitDistance),n.fieldEmitDistance+=r;const a=n.speedState==="crawl"?n.tuning.crawlFieldEmitDistance:n.tuning.fieldEmitDistance;if(n.fieldEmitDistance>=a){const o=Math.max(n.speedState==="crawl"?n.tuning.crawlFieldPatchMinValue:n.tuning.normalFieldPatchMinValue,n.pendingFieldValue);$x(n,o),n.fieldEmitDistance=0,n.pendingFieldValue=0}}function Gx(n,e){return Math.max(0,n)*ci*e.mineRate*xh}function Hx(n,e,t,i){if(n.lastYieldRate=0,n.arms.helper.miningAssistRate=0,n.arms.helper.lastAssistYield=0,n.speedState==="crawl"||!e||n.arms.mining<=0)return;const r=e.richness*n.arms.mining*n.tuning.mineRate*xh,s=Math.min(e.remaining,r*i);e.remaining-=s,n.rover.ore+=s;const a=Vx(n,s,i),o=Math.min(e.remaining,a*i);if(o>0&&(e.remaining-=o,n.rover.ore+=o,n.arms.helper.miningAssistRate=o/i,n.arms.helper.lastAssistYield=o),n.lastYieldRate=(s+o)/i,s+o>0&&!t&&n.speedState==="prepared"){n.message="Mining arms harvesting while parked on prepared field.";return}if(s+o>0&&!t){n.message="Mining arms extracting from the seam while parked.";return}s+o>0&&n.speedState==="prepared"&&(n.message="Prepared field frees the arms. Mining rate is high.")}function Vx(n,e,t){return e<=0||t<=0||n.arms.helper.duty!=="miningAssist"?0:e/t*Ax}function Wx(n){if(!n.drone.target||ot(n.rover,n.drone.target)>n.tuning.reclaimClaimBreakRadius)return!1;const e=n.fields.find(r=>r.id===n.drone.targetPatchId);e&&(e.reservedByDrone=void 0);const t=Ph(n);if(!t)return n.drone.status="returning",n.drone.payload=0,n.drone.liftedPatches=0,n.drone.target=void 0,n.drone.targetPatchId=void 0,n.drone.reclaimSeconds=0,n.message="You closed on that rail. Drone let go and is coming back empty.",!0;const i=n.fields.find(r=>r.id===t.targetPatchId);return i&&(i.reservedByDrone=!0),n.drone.status="outbound",n.drone.target={...t.target},n.drone.targetPatchId=t.targetPatchId,n.drone.reclaimSeconds=0,n.message="You got there first. Drone let go and picked older rail.",!0}function Xx(n,e){if(n.drone.status==="ready"){n.drone.x=n.rover.x,n.drone.y=n.rover.y,n.drone.etaSeconds=0;return}if((n.drone.status==="outbound"||n.drone.status==="reclaiming")&&Wx(n),n.drone.status==="outbound"&&n.drone.target){ld(n,n.drone.target,e),n.drone.etaSeconds=fv(n),ot(n.drone,n.drone.target)<=8&&(n.drone.status="reclaiming",n.drone.reclaimSeconds=n.tuning.reclaimLockSeconds,n.drone.etaSeconds=n.drone.reclaimSeconds+ot(n.drone,n.rover)/n.tuning.droneSpeed);return}if(n.drone.status==="reclaiming"){if(n.drone.reclaimSeconds=Math.max(0,n.drone.reclaimSeconds-e),n.drone.etaSeconds=n.drone.reclaimSeconds+ot(n.drone,n.rover)/n.tuning.droneSpeed,n.drone.reclaimSeconds<=0){const t=qx(n,n.drone.target??n.drone);n.drone.payload=t.payload,n.drone.liftedPatches=t.count,n.drone.status="returning",n.drone.etaSeconds=ot(n.drone,n.rover)/n.tuning.droneSpeed,n.message=`Drone lifted ${t.count} lengths of rail. Bringing them to you.`}return}if(n.drone.status==="returning"&&(ld(n,n.rover,e),n.drone.etaSeconds=ot(n.drone,n.rover)/n.tuning.droneSpeed,ot(n.drone,n.rover)<=16)){const t=n.drone.payload-n.dronePendingLaunchCost;n.nanobots=Dt(n.nanobots+t,0,n.maxNanobots);const i=Yx(n,n.drone.liftedPatches);n.drone={status:"ready",x:n.rover.x,y:n.rover.y,payload:0,etaSeconds:0,reclaimSeconds:0,liftedPatches:0},n.message=i>0?`Drone relaid ${i} lengths ahead of you, and topped you up ${t.toFixed(1)}.`:`Drone delivered ${t.toFixed(1)} nanobots.`}}function ld(n,e,t){const i=n.tuning.droneSpeed*t,r=e.x-n.drone.x,s=e.y-n.drone.y,a=Math.hypot(r,s);if(a<=i||a===0){n.drone.x=e.x,n.drone.y=e.y;return}n.drone.x+=r/a*i,n.drone.y+=s/a*i}function qx(n,e){const t=new Set(Uh(n,e).map(s=>s.id)),i=[],r=[];for(const s of n.fields)t.has(s.id)?i.push(s):r.push({...s,reservedByDrone:void 0});return n.fields=r,{payload:Fh(i,n.tuning.reclaimYieldMultiplier),count:i.length}}function Yx(n,e){if(e<=0)return 0;const t=n.tuning.fieldEmitDistance,i=Math.min(e,n.tuning.droneRailRelayMaxPatches);let r=n.rover.x,s=n.rover.y,a=n.rover.heading;const o=n.rover.speed>0?t/n.rover.speed:0,l=ts(n.fields,n.tuning.tileSize);let c=0;for(let u=0;u<i;u+=1){a+=n.rover.turnRate*o,r+=Math.cos(a)*t,s+=Math.sin(a)*t;const f=pa(r,s,n.tuning.tileSize),h=es(f.q,f.r);if(l.has(h))continue;const p=Pl(f.q,f.r,n.tuning.tileSize),g={id:n.nextFieldId,x:p.x,y:p.y,radius:n.tuning.fieldRadius,value:n.tuning.preparedFieldMinValue*2,age:n.tuning.preparedFieldMinAgeSeconds};n.fields.push(g),l.set(h,g),n.nextFieldId+=1,c+=1}return c}function $x(n,e){const t=n.speedState==="crawl"?6:14,i=n.rover.x-Math.cos(n.rover.heading)*t,r=n.rover.y-Math.sin(n.rover.heading)*t,s=pa(i,r,n.tuning.tileSize),o=ts(n.fields,n.tuning.tileSize).get(es(s.q,s.r));if(o){o.value=Math.max(o.value,e),n.layingChainId=o.id;return}const l=Pl(s.q,s.r,n.tuning.tileSize);n.fields.push({id:n.nextFieldId,x:l.x,y:l.y,radius:n.tuning.fieldRadius,value:e,age:0}),n.layingChainId=n.nextFieldId,n.nextFieldId+=1}function Ah(n,e){return pa(n.x,n.y,e)}const cd=new WeakMap;function ts(n,e){const t=cd.get(n);if(t&&t.length===n.length&&t.tileSize===e)return t.index;const i=new Map;for(const r of n){const s=Ah(r,e);i.set(es(s.q,s.r),r)}return cd.set(n,{length:n.length,tileSize:e,index:i}),i}function ga(n,e,t){const i=Ah(n,t);return ax(i.q,i.r).map(r=>e.get(es(r.q,r.r))).filter(r=>r!==void 0&&r.id!==n.id)}function Rh(n,e){if(n.tuning.ribbonEconomy&&e!==void 0){if(e)return"prepared";const i=n.speedState==="crawl"?2:.85;return n.nanobots>=i?"fabricating":"crawl"}if(yh(n,n.rover)>=n.tuning.preparedCoverageThreshold)return"prepared";const t=n.speedState==="crawl"?2:.85;return n.nanobots>=t?"fabricating":"crawl"}function Kx(n){if(n.speedState!=="prepared"&&!n.rail)return{correction:0,strength:0};const e=Zx(n);if(!e)return{correction:0,strength:0};const t=Math.max(n.tuning.gripFloor,e.strength);if(!n.rail)return{correction:e.correction,strength:t};const i=Dt(n.rail.runwayAhead/n.tuning.railRunwayForFullSpeed,0,1);return{correction:e.correction,strength:t+(1-t)*i}}function Zx(n){const e=n.fields.filter(h=>h.age>=n.tuning.preparedFieldMinAgeSeconds&&h.value>=n.tuning.preparedFieldMinValue).sort((h,p)=>h.id-p.id);if(e.length===0)return;const t={x:Math.cos(n.rover.heading),y:Math.sin(n.rover.heading)};let i=0,r=0,s=0,a=0,o=0;for(let h=0;h<e.length;h+=1){const p=e[h],g=ot(n.rover,p),M=p.radius*n.tuning.preparedMagnetInfluenceMultiplier;if(g>=M)continue;const m=(1-g/M)*Dt(p.value/n.tuning.startingFieldValue,.4,1.4),d=ev(e,h);if(d){const E=t.x*d.x+t.y*d.y>=0?1:-1;r+=d.x*E*m,s+=d.y*E*m}g>.001&&(a+=(p.x-n.rover.x)/g*m,o+=(p.y-n.rover.y)/g*m),i+=m}if(i<=.001)return;const l=Math.hypot(r,s),c=l>.001?{x:r/l,y:s/l}:t,u={x:a/i*n.tuning.preparedMagnetCenterPull,y:o/i*n.tuning.preparedMagnetCenterPull},f={x:c.x+u.x,y:c.y+u.y};if(!(Math.hypot(f.x,f.y)<=.001))return{correction:xv(Math.atan2(f.y,f.x),n.rover.heading),strength:Dt(i,.12,1)}}function Jx(n,e=!1){const t=n.tuning.railCaptureDistance*(e?1.7:1),i=n.tuning.railCaptureAlignment*(e?.45:1),r=n.fields.filter(C=>Ch(n,C)),s=ts(r,n.tuning.tileSize);let a,o=t,l=[];for(const C of r){const D=ot(n.rover,C);if(D>o)continue;const O=ga(C,s,n.tuning.tileSize);O.length!==0&&(a=C,o=D,l=O)}if(!a)return;const c={x:Math.cos(n.rover.heading),y:Math.sin(n.rover.heading)};let u,f,h=-1/0,p=1/0;for(const C of l){const D=(C.x-a.x)*c.x+(C.y-a.y)*c.y;D>h&&(h=D,u=C),D<p&&(p=D,f=C)}const g=f&&f.id!==(u==null?void 0:u.id)?f:a,M=u??a,m=M.x-g.x,d=M.y-g.y,E=Math.hypot(m,d);if(E<=.001)return;const A=c.x*m+c.y*d>=0?1:-1,v={x:m/E*A,y:d/E*A};if(c.x*v.x+c.y*v.y<i)return;const w=n.rover.x-a.x,b=n.rover.y-a.y,R=w*v.x+b*v.y,_={x:a.x+v.x*R,y:a.y+v.y*R},T=(n.rover.x-_.x)*-v.y+(n.rover.y-_.y)*v.x;return{tangent:v,center:_,offset:T,runwayAhead:jx(s,n.tuning.tileSize,a,v)}}function Qx(n){let e,t=n.tuning.fieldRadius;for(const i of n.fields){if(!Ch(n,i))continue;const r=ot(n.rover,i);r>t||(e=i,t=r)}return e}function Ch(n,e){return e.age>=n.tuning.preparedFieldMinAgeSeconds&&e.value>=n.tuning.preparedFieldMinValue}function jx(n,e,t,i){const r=new Set([t.id]);let s={...i},a=t,o=0;for(let l=0;l<400;l+=1){let c,u=0;for(const h of ga(a,n,e)){if(r.has(h.id))continue;const p=h.x-a.x,g=h.y-a.y,M=Math.hypot(p,g);if(M<=.001)continue;const m=p/M*s.x+g/M*s.y;m<=u||(u=m,c=h)}if(!c)break;const f=ot(a,c);s={x:(c.x-a.x)/f,y:(c.y-a.y)/f},o+=f,r.add(c.id),a=c}return o}function ev(n,e){const t=n[e],i=n[e-1],r=n[e+1],s=t.radius*2.8,a=i&&ot(i,t)<=s?i:void 0,o=r&&ot(t,r)<=s?r:void 0,l=o&&a?o.x-a.x:o?o.x-t.x:a?t.x-a.x:0,c=o&&a?o.y-a.y:o?o.y-t.y:a?t.y-a.y:0,u=Math.hypot(l,c);if(!(u<=.001))return{x:l/u,y:c/u}}function al(n,e,t,i="ready"){return n==="crawl"?Rr(0,0,0,ci,"emergency","reclaim legs are dragging the machine along"):t?n==="fabricating"?Rr(ci,0,0,0,"fabricationSupport","every arm is laying track"):Rr(0,0,ci,0,"scan","cruising on road, arms stowed"):e?Rr(0,ci,0,0,i==="returning"?"droneDocking":"systems",i==="returning"?"utility arm is braced for drone docking":"utility arm is managing seam systems"):Rr(0,0,ci,0,i==="returning"?"droneDocking":"scan",i==="returning"?"utility arm is braced for drone docking":"stopped, arms stowed")}function Rr(n,e,t,i,r,s){return{total:wx,industrialTotal:ci,utilityTotal:il,building:n,mining:e,stabilizing:t,emergency:i,helper:{count:il,duty:r,status:s,miningAssistRate:0,lastAssistYield:0}}}function tv(n,e){return n>=1&&e<5?"Loaded to the roof and cutting it that fine is the whole game.":n>=1?"A heavy load brought home with room. You could have pushed further.":e<5?"Barely. Another seam and the dark would have had you.":"Clean and early. There was more out there."}function nv(n){if(n.arena.extraction){const e=n.arena.extraction.oreRequired,t=bh(n);if(t||(n.leftExtraction=!0),t&&n.leftExtraction){n.phase="won";const i=n.solarSeconds;if(n.rover.ore>=e){n.returnedUnderQuota=!1;const r=n.rover.ore-e;n.message=`${n.rover.ore.toFixed(1)} ore delivered, ${r.toFixed(1)} over quota, ${i.toFixed(1)}s of light left. ${tv(r/Math.max(1,e),i)}`}else{n.returnedUnderQuota=!0;const r=e-n.rover.ore;n.message=`Back under quota: ${n.rover.ore.toFixed(1)} of ${e} ore, ${r.toFixed(1)} short. The company takes its processing fee on what you did bring.`}return}n.solarSeconds<=0&&(n.phase="lost",n.message=n.rover.ore<e?`Sunset. Only ${n.rover.ore.toFixed(1)} of ${e} ore mined, and you never made it back.`:"Sunset closed the extraction window before the rover got home.");return}if(n.rover.ore>=n.targetOre){n.phase="won",n.message="Extraction quota met before sunset.";return}n.solarSeconds<=0&&(n.phase="lost",n.message="Solar window closed before the extraction quota.")}function iv(n){const t=Dh(n).filter(u=>u.payload>=n.tuning.reclaimMinClusterPayload),i=t.length>0?t:[],r=[...i].sort(Lh).slice(0,3),s=r[0],a=n.fields.reduce((u,f)=>Math.max(u,f.age),0),o=n.fields.filter(u=>!u.reservedByDrone&&u.age>=n.tuning.reclaimMinFieldAgeSeconds&&u.value>=n.tuning.reclaimMinFieldValue),l=o.length>0?Math.min(...o.map(u=>ot(u,n.rover))):void 0,c=i.reduce((u,f)=>Math.max(u,f.payload),0);return{blockedReason:rv(n,i,a,l,c),candidateCount:i.length,rejectedCount:Math.max(0,n.fields.length-i.length),bestTarget:s,topCandidates:r,oldestFieldAge:a,nearestEligibleFieldDistance:s==null?void 0:s.distanceFromRover,nearestNearEligibleFieldDistance:l,bestClusterPayload:c,currentPreparedCoverage:yh(n,n.rover),currentSpeedState:n.speedState,tuning:{...n.tuning}}}function Ph(n){const e=n.tuning.reclaimAimBias;return Dh(n).sort((t,i)=>Lh(t,i,e))[0]}function rv(n,e,t,i,r){if(n.phase!=="playing")return"Run is over";if(n.drone.status!=="ready")return"Drone already committed";if(!(e.length>=n.tuning.minReclaimCandidateCount&&e.length>0))return n.fields.length===0?"No reclaimable field yet":t<n.tuning.reclaimMinFieldAgeSeconds?`Oldest field age ${t.toFixed(1)}s / need ${n.tuning.reclaimMinFieldAgeSeconds.toFixed(1)}s`:n.fields.some(s=>!s.reservedByDrone)?n.fields.some(s=>!s.reservedByDrone&&s.value>=n.tuning.reclaimMinFieldValue)?!n.tuning.allowCloseReclaim&&i!==void 0&&i<n.tuning.reclaimMinDistanceFromRover?`Nearest old field ${i.toFixed(0)} / need ${n.tuning.reclaimMinDistanceFromRover.toFixed(0)}`:!n.tuning.allowLowPayloadLaunch&&r<n.tuning.minReclaimClusterPayload?`Best cluster payload ${r.toFixed(2)} / need ${n.tuning.minReclaimClusterPayload.toFixed(2)}`:e.length<n.tuning.minReclaimCandidateCount?`Candidate count ${e.length} / need ${n.tuning.minReclaimCandidateCount}`:"No unreserved reclaim target":`Best cluster payload ${r.toFixed(2)} / need ${n.tuning.minReclaimClusterPayload.toFixed(2)}`:"No unreserved reclaim target"}function Dh(n){const e=[];for(const t of n.fields){if(!ov(n,t))continue;const i=Uh(n,t),r=Fh(i,n.tuning.reclaimYieldMultiplier);!n.tuning.allowLowPayloadLaunch&&r<n.tuning.minReclaimClusterPayload||e.push(sv(n,t,i,r))}return e}function sv(n,e,t,i){const r=dv(t,i),s=hv(t,e,i),a=uv(n,e),o=ot(e,n.rover),l=Mx-Nh(n,e),c=Math.atan2(e.y-n.rover.y,e.x-n.rover.x),u=Math.cos(c-n.rover.heading);return{targetPatchId:e.id,target:{x:e.x,y:e.y},payload:i,fieldCount:t.length,distanceFromRover:o,weightedAge:r,spread:s,refillEtaSeconds:a.totalSeconds,eta:a,score:l,aimAlignment:u}}function Lh(n,e,t=0){const i=e.score+t*e.aimAlignment-(n.score+t*n.aimAlignment);if(Math.abs(i)>1e-6)return i;const r=n.distanceFromRover-e.distanceFromRover;if(Math.abs(r)>1e-6)return r;const s=e.payload-n.payload;return Math.abs(s)>1e-6?s:n.targetPatchId-e.targetPatchId}function Ih(n,e){return e.value>=n.tuning.reclaimMinFieldValue}function av(n){return n.arena.extraction??n.arena.start}function ov(n,e){return!(e.reservedByDrone||!Ih(n,e)||!(n.tuning.allowCloseReclaim||ot(e,n.rover)>=n.tuning.reclaimMinDistanceFromRover)||ot(e,av(n))>n.tuning.droneTetherRange||n.tuning.reclaimProtectLoop&&Nh(n,e)>1)}function Nh(n,e,t){const i=ts(n.fields,n.tuning.tileSize);return ga(e,i,n.tuning.tileSize).length}function Uh(n,e){const t=n.fields.filter(i=>cv(n,i,e));return lv(n,t)}function lv(n,e){if(!n.tuning.reclaimProtectLoop||e.length<=1)return e;const t=new Set(e.map(a=>a.id)),i=new Map(n.fields.map(a=>[a.id,a])),r=[];let s=!0;for(;s;){s=!1;const a=ts([...i.values()],n.tuning.tileSize);for(const o of i.values())if(t.has(o.id)&&ga(o,a,n.tuning.tileSize).length<=1){i.delete(o.id),r.push(o),s=!0;break}}return r}function cv(n,e,t){return Ih(n,e)&&ot(e,t)<=n.tuning.dronePickupRadius}function Fh(n,e=1){return n.reduce((t,i)=>t+i.value,0)*e}function dv(n,e){return e<=0?0:n.reduce((t,i)=>t+i.age*i.value,0)/e}function hv(n,e,t){return t<=0?0:n.reduce((i,r)=>i+ot(r,e)*r.value,0)/t}function uv(n,e){const t=ot(n.rover,e),i=t/n.tuning.droneSpeed,r=t/n.tuning.droneSpeed;return{outboundSeconds:i,reclaimLockSeconds:n.tuning.reclaimLockSeconds,returnSeconds:r,totalSeconds:i+n.tuning.reclaimLockSeconds+r}}function fv(n){return n.drone.target?ot(n.drone,n.drone.target)/n.tuning.droneSpeed+n.tuning.reclaimLockSeconds+ot(n.drone.target,n.rover)/n.tuning.droneSpeed:0}function pv(n,e){return n.vein?_v(e,n.vein.from,n.vein.to)<=n.vein.width/2+Ex:ot(e,n)<=n.radius}function mv(n){const e=Dt(n.throttle,0,1),t=!!n.brake,i=!!n.reverseIntent,r=Dt(n.steer,-1,1),s=n.driveIntent??(e>0||t);return{steer:r,throttle:e,brake:t,reverseIntent:i,driveIntent:s,pivotIntent:n.pivotIntent??(!s&&Math.abs(r)>.001),assistSteer:n.assistSteer,roadRunway:n.roadRunway,onRoad:n.onRoad}}function gv(n,e){return{ok:!0,message:e,state:n}}function Us(n,e){return{ok:!1,message:e,state:n}}function ot(n,e){return Math.hypot(n.x-e.x,n.y-e.y)}function _v(n,e,t){const i=t.x-e.x,r=t.y-e.y,s=i*i+r*r;if(s===0)return ot(n,e);const a=Dt(((n.x-e.x)*i+(n.y-e.y)*r)/s,0,1);return ot(n,{x:e.x+i*a,y:e.y+r*a})}function Dt(n,e,t){return Math.min(t,Math.max(e,n))}function ol(n){const e=Math.PI*2;return((n+Math.PI)%e+e)%e-Math.PI}function xv(n,e){return ol(n-e)}const Fs=54,ro=6,dd=1.2,vv=.6,hd=2.4,Sv=.45,Mv=1,so=8e3,yv=1.25,bv=.5,Ev=9,ud=.1,wv=900,Tv=3,Av=1,fd=.75,Rv=.85,Cv=1.2,Pv=.75,pt={roadWidthCars:1.4,slurpBandPct:.34,slurpMinBoost:.55,slurpChargeSeconds:1.6,laneGapCars:.3,railAccel:100,cornerBraking:1,reclaimBite:150,lockAlign:vv,lockHoldWidth:yv,lockReleaseSeconds:bv,trackRate:Ev,railBrakeMult:Tv,cornerGripReserve:Rv,slurpChargeDrain:Av,junctionReach:1.5,cannibalGuard:1.2,cannibalGuardAhead:5,eraserReach:320,eraserRadius:70,eraserAimDelay:.8};function ao(n,e){const t=Math.PI*2;return((n-e+Math.PI)%t+t)%t-Math.PI}function yi(n,e,t,i,r,s){const a=r-t,o=s-i,l=a*a+o*o||1;let c=((n-t)*a+(e-i)*o)/l;c=Math.max(0,Math.min(1,c));const u=t+a*c,f=i+o*c;return{d:Math.hypot(n-u,e-f),qx:u,qy:f}}class Dv{constructor(e=pt){at(this,"pts",[]);at(this,"segs",[]);at(this,"last",null);at(this,"tipJoined",!1);at(this,"blocked",!1);at(this,"boost",0);at(this,"locked",!1);at(this,"releaseTimer",0);at(this,"cornerTimer",0);at(this,"cornerConstraints",[]);at(this,"charge",0);at(this,"config");this.config={...e}}brakeMult(){return Math.max(.1,this.config.railBrakeMult)}halfWidth(){return this.config.roadWidthCars*Fs/2}noLayDistance(){return this.halfWidth()*(1+this.config.laneGapCars)}recentPointCount(){return Math.min(120,Math.max(14,Math.round(this.noLayDistance()*2.5/ro)))}reset(){this.pts.length=0,this.segs.length=0,this.last=null,this.tipJoined=!1,this.blocked=!1,this.boost=0,this.charge=0,this.locked=!1,this.releaseTimer=0,this.cornerTimer=0,this.cornerConstraints=[]}edgeCount(){return this.segs.length}edgesForPaint(){return this.segs.map(e=>({ax:e.ax,ay:e.ay,bx:e.bx,by:e.by}))}reclaimPlan(e,t,i,r){const s=this.peelRun(!0,e,t,i);if(!r||r.bias<=0)return s;const a=this.peelRun(!1,e,t,i);if(!s)return a;if(!a)return s;const o=Math.cos(r.heading),l=Math.sin(r.heading),c=h=>{const p=h.point.x-e.x,g=h.point.y-e.y,M=Math.hypot(p,g)||1;return p/M*o+g/M*l},u=.5+r.bias*c(s);return r.bias*c(a)>u?a:s}peelRun(e,t,i,r){const s=[],a=[];let o=0;const l=this.segs.length;for(let f=0;f<l&&o<r;f+=1){const h=e?f:l-1-f,p=this.segs[h],g=(p.ax+p.bx)/2,M=(p.ay+p.by)/2;if(Math.hypot(g-t.x,M-t.y)>i)break;s.push(h),a.push({ax:p.ax,ay:p.ay,bx:p.bx,by:p.by}),o+=Math.hypot(p.bx-p.ax,p.by-p.ay)}if(s.length===0)return null;let c=null,u=-1;for(const f of a)for(const[h,p]of[[f.ax,f.ay],[f.bx,f.by]]){const g=Math.hypot(h-t.x,p-t.y);g>u&&(u=g,c={x:h,y:p})}return c?{edges:a,length:o,point:c,indices:s}:null}removeSegments(e){const t=new Set(e);this.segs=this.segs.filter((i,r)=>!t.has(r)),this.pts=[];for(const i of this.segs)this.pts.push({x:i.ax,y:i.ay,t:i.t},{x:i.bx,y:i.by,t:i.t})}canCannibalise(e){const t=this.segs.length-this.recentPointCount();if(t<=0)return!1;if(!e)return!0;for(let i=0;i<t;i+=1)if(!this.cannibalGuarded(this.segs[i],e))return!0;return!1}cannibalGuarded(e,t){const i=t.rover,r=yi(i.x,i.y,e.ax,e.ay,e.bx,e.by);if(r.d<=Math.max(0,this.config.cannibalGuard)*Fs)return!0;const s=Math.max(0,this.config.cannibalGuardAhead)*Fs;if(r.d>s)return!1;const a=Math.cos(i.heading),o=Math.sin(i.heading);for(const[l,c]of[[r.qx,r.qy],[e.ax,e.ay],[e.bx,e.by]]){const u=l-i.x,f=c-i.y,h=Math.hypot(u,f)||1;if(h<=s&&(u*a+f*o)/h>=.82)return!0}return!1}emergencyAdvance(e){const t={x:e.rover.x,y:e.rover.y};if(!this.last||Math.hypot(t.x-this.last.x,t.y-this.last.y)<ro)return{laid:[],advanced:!1};const i=this.segs.length-this.recentPointCount();if(i<=0)return{laid:[],advanced:!1};const r=[];for(let l=0;l<i;l+=1){const c=this.segs[l];this.cannibalGuarded(c,e)||r.push({i:l,d:yi(t.x,t.y,c.ax,c.ay,c.bx,c.by).d})}if(r.length===0)return{laid:[],advanced:!1};r.sort((l,c)=>l.d-c.d);const s=r.slice(0,Math.min(2,r.length)).map(l=>l.i),a=this.last,o={ax:a.x,ay:a.y,bx:t.x,by:t.y,t:e.elapsedSeconds};return this.segs.push(o),this.last=t,this.removeSegments(s),{laid:[{ax:o.ax,ay:o.ay,bx:o.bx,by:o.by}],advanced:!0}}sample(e){if(e.speedState==="crawl")return[];const t={x:e.rover.x,y:e.rover.y};if(this.last&&Math.hypot(t.x-this.last.x,t.y-this.last.y)<ro)return[];const i=this.last,r=this.segs.length-this.recentPointCount(),s=Math.cos(e.rover.heading),a=Math.sin(e.rover.heading);if(r>0){const c=this.noLayDistance();for(let u=0;u<r;u+=1){const f=this.segs[u];if(yi(t.x,t.y,f.ax,f.ay,f.bx,f.by).d<c){if(this.blocked=!0,!this.tipJoined&&i){this.tipJoined=!0;const h=this.joinSeg(i,i.x+s*this.halfWidth(),i.y+a*this.halfWidth(),r,e.elapsedSeconds,!0);if(h)return[h]}return[]}}}const o={x:t.x,y:t.y,t:e.elapsedSeconds};this.pts.push(o),this.pts.length>so&&this.pts.shift();const l=[];if(i&&Math.hypot(t.x-i.x,t.y-i.y)<=this.halfWidth()*3){const c={ax:i.x,ay:i.y,bx:t.x,by:t.y,t:e.elapsedSeconds};this.segs.push(c),this.segs.length>so&&this.segs.shift(),l.push({ax:c.ax,ay:c.ay,bx:c.bx,by:c.by})}else if(this.blocked&&r>0){const c=this.joinSeg(t,t.x-s*this.halfWidth(),t.y-a*this.halfWidth(),r,e.elapsedSeconds,!1);c&&l.push(c)}return this.tipJoined=!1,this.blocked=!1,this.last=t,l}joinSeg(e,t,i,r,s,a){const o=this.noLayDistance()+Math.max(0,this.config.junctionReach)*this.halfWidth();if(this.config.junctionReach<=0)return null;let l=null;for(let f=0;f<r;f+=1){const h=this.segs[f],p=yi(t,i,h.ax,h.ay,h.bx,h.by);(!l||p.d<l.d)&&(l=p)}if(!l)return null;const c=Math.hypot(l.qx-e.x,l.qy-e.y);if(c<1||c>o)return null;const u=a?{ax:e.x,ay:e.y,bx:l.qx,by:l.qy,t:s}:{ax:l.qx,ay:l.qy,bx:e.x,by:e.y,t:s};return this.segs.push(u),this.segs.length>so&&this.segs.shift(),this.pts.push({x:l.qx,y:l.qy,t:s}),{ax:u.ax,ay:u.ay,bx:u.bx,by:u.by}}eraserPlan(e,t,i,r){const s=Math.max(0,this.config.eraserReach),a=Math.max(1,this.config.eraserRadius);if(s<=0||this.segs.length===0)return null;const o=this.halfWidth(),l=Math.cos(t),c=Math.sin(t);let u=null;for(let g=Fs*.6;g<=s&&!u;g+=o*.5){const M=e.x+l*g,m=e.y+c*g;let d=o;for(const E of this.segs){const A=yi(M,m,E.ax,E.ay,E.bx,E.by);A.d<d&&(d=A.d,u={x:A.qx,y:A.qy})}}if(!u)return null;const f=[],h=[];let p=0;return this.segs.forEach((g,M)=>{yi(u.x,u.y,g.ax,g.ay,g.bx,g.by).d>a||Math.hypot((g.ax+g.bx)/2-i.x,(g.ay+g.by)/2-i.y)>r||(f.push(M),h.push({ax:g.ax,ay:g.ay,bx:g.bx,by:g.by}),p+=Math.hypot(g.bx-g.ax,g.by-g.ay))}),f.length===0?null:{edges:h,length:p,point:u,indices:f}}serialize(){return this.segs.map(e=>[e.ax,e.ay,e.bx,e.by])}seed(e){this.reset();for(const t of e){if(!Array.isArray(t)||t.length<4)continue;const[i,r,s,a]=t;this.segs.push({ax:i,ay:r,bx:s,by:a,t:0}),this.pts.push({x:i,y:r,t:0},{x:s,y:a,t:0})}}nearestCuredSeg(e,t){let i=1/0,r=null;for(const s of this.segs){if(t-s.t<dd)continue;const{d:a,qx:o,qy:l}=yi(e.x,e.y,s.ax,s.ay,s.bx,s.by);if(a<i){i=a;const c=Math.hypot(s.bx-s.ax,s.by-s.ay)||1;r={dist:a,px:o,py:l,tx:(s.bx-s.ax)/c,ty:(s.by-s.ay)/c}}}return r}lineAt(e,t,i,r,s,a=this.halfWidth()*hd){const o=a,l=this.halfWidth();let c=0,u=0,f=0,h=0,p=0,g=1/0;for(const M of this.segs){if(s-M.t<dd)continue;const m=(M.ax+M.bx)/2-e,d=(M.ay+M.by)/2-t;if(Math.abs(m)>o||Math.abs(d)>o)continue;const E=Math.hypot(m,d);if(E>o||Math.abs(m*-r+d*i)>l)continue;const A=Math.hypot(M.bx-M.ax,M.by-M.ay)||1;let v=(M.bx-M.ax)/A,w=(M.by-M.ay)/A;const b=v*i+w*r;if(Math.abs(b)<.5)continue;b<0&&(v=-v,w=-w);const R=(1-E/o)*A;E<g&&(g=E),c+=v*R,u+=w*R,f+=(M.ax+M.bx)/2*R,h+=(M.ay+M.by)/2*R,p+=R}return p<=0||c*c+u*u<=1e-9?null:{tangent:Math.atan2(u,c),lx:f/p,ly:h/p,nearest:g}}carrySteer(e,t=1/60,i=!1){const r=e.rover,s=this.nearestCuredSeg(r,e.elapsedSeconds),a=this.halfWidth();if(!s||s.dist>=a*(i?this.config.lockHoldWidth:1))return 0;const o=Math.cos(r.heading),l=Math.sin(r.heading),c=s.tx*o+s.ty*l;if(!i&&Math.abs(c)<this.config.lockAlign)return 0;const u=c<0?-1:1,f=this.lineAt(s.px,s.py,s.tx*u,s.ty*u,e.elapsedSeconds),h=a*hd,p=f?f.tangent:Math.atan2(s.ty*u,s.tx*u),g=f?f.lx:s.px,M=f?f.ly:s.py;let m=0;const d=this.lineAt(g+Math.cos(p)*h,M+Math.sin(p)*h,Math.cos(p),Math.sin(p),e.elapsedSeconds);d&&(m=ao(d.tangent,p)/h*Math.max(0,r.speed));const E=(r.x-g)*-Math.sin(p)+(r.y-M)*Math.cos(p),A=p-Math.atan2(E,h),v=1-Math.exp(-Math.max(0,this.config.trackRate)*t/.18);return m+ao(A,r.heading)*v/Math.max(.001,t)}isOnLaidRoad(e){const t=this.nearestCuredSeg(e.rover,e.elapsedSeconds);return!t||t.dist>=this.halfWidth()?!1:Math.abs(t.tx*Math.cos(e.rover.heading)+t.ty*Math.sin(e.rover.heading))>=this.config.lockAlign}update(e,t,i,r=!0){const s=e.tuning.fabricatingSpeed,a=Math.max(s,e.tuning.railSpeed),o=Math.max(1,a-s);if(this.releaseTimer>0&&(this.releaseTimer-=i),!r||Math.abs(t)>=(e.tuning.carryBreakSteer??Ll))this.locked&&(this.releaseTimer=this.config.lockReleaseSeconds),this.locked=!1;else if(this.locked){const c=this.nearestCuredSeg(e.rover,e.elapsedSeconds);(!c||c.dist>=this.halfWidth()*this.config.lockHoldWidth)&&(this.locked=!1)}else this.releaseTimer<=0&&this.isOnLaidRoad(e)&&(this.locked=!0,this.cornerTimer=0);let l=s+o*this.boost;if(this.locked){this.cornerTimer-=i,this.cornerTimer<=0&&(this.cornerConstraints=this.cornerConstraintsAhead(e,s,a),this.cornerTimer=ud);const c=Math.max(0,e.rover.speed)*i,u=Math.max(1,this.config.railAccel)*this.brakeMult()*fd;let f=1/0;for(const M of this.cornerConstraints)M.s-=c,f=Math.min(f,Math.sqrt(M.v*M.v+2*u*Math.max(0,M.s)));const h=Math.max(0,Math.min(1,this.config.cornerBraking)),p=a+(Math.min(a,f)-a)*h,g=Math.max(1,this.config.railAccel);l=l<p?Math.min(p,l+g*i):Math.max(p,l-g*this.brakeMult()*i)}else l=Math.max(s,l-o*i/Sv);this.boost=Math.max(0,Math.min(Mv,(l-s)/o))}cornerConstraintsAhead(e,t,i){const r=Math.max(1,e.tuning.railGrip)*Math.max(.05,Math.min(1,this.config.cornerGripReserve)),s=Math.max(1,this.config.railAccel)*this.brakeMult()*fd,a=this.halfWidth()*Pv,o=this.halfWidth()*Cv,l=Math.min(wv,(i*i-t*t)/(2*s)+a*3+i*ud),c=[];let u=e.rover.x,f=e.rover.y,h=Math.cos(e.rover.heading),p=Math.sin(e.rover.heading),g=null;for(let M=0;M<=l;M+=a){const m=this.lineAt(u,f,h,p,e.elapsedSeconds,o);if(!m||m.nearest>a){c.push({v:t,s:Math.max(0,M-a)});break}if(g!==null){const E=Math.abs(ao(m.tangent,g))/a;if(E>1e-5){const A=Math.sqrt(r/E);A<i&&c.push({v:A,s:Math.max(0,M-a)})}}g=m.tangent,h=Math.cos(m.tangent),p=Math.sin(m.tangent);const d=(m.lx-u)*-p+(m.ly-f)*h;u+=h*a-p*d,f+=p*a+h*d}return c}updateCharge(e,t){this.charge=t?Math.min(this.config.slurpChargeSeconds+1,this.charge+e):Math.max(0,this.charge-e*Math.max(0,this.config.slurpChargeDrain))}slurpArmed(){return this.config.slurpBandPct>0&&this.locked&&this.charge>=this.config.slurpChargeSeconds}slurp(e){const t=this.config.slurpBandPct;if(!this.slurpArmed())return null;const i=e.rover,r=.5-t/2,s=.5+t/2,a=this.halfWidth()*.6;for(const o of e.fertileZones){if(o.remaining<=0||!o.vein)continue;const{from:l,to:c}=o.vein,u=c.x-l.x,f=c.y-l.y,h=u*u+f*f;if(h<=1e-4)continue;const p=((i.x-l.x)*u+(i.y-l.y)*f)/h;if(p<r||p>s)continue;const g=l.x+u*p,M=l.y+f*p;if(Math.hypot(i.x-g,i.y-M)>o.vein.width/2+a)continue;const m=o.remaining;return e.rover.ore+=m,o.remaining=0,{x:g,y:M,gained:m}}return null}}const bi=[{name:"First haul",teaches:"Lay road out to a seam, park on it to mine, then ride your own road home.",seams:1,quotaShare:.8,sunSlack:2.4,stockSlack:1.7,ore:{layout:3,count:.6}},{name:"Two stops",teaches:"Chain two seams on one road, then ride the whole thing home on the rail.",seams:2,quotaShare:.8,sunSlack:2,stockSlack:1.5,ore:{count:.8}},{name:"The long lode",teaches:"Seams strung along a line: lay it once, ride it fast. Charge the slurp (Rail ⚡) and blast a seam on the way back.",seams:3,quotaShare:.85,sunSlack:1.7,stockSlack:1.4,ore:{layout:2}},{name:"Branch lines",teaches:"Your road is a network: branch off it (it joins itself) and any branch rides you home.",seams:3,quotaShare:.85,sunSlack:1.6,stockSlack:1.3,ore:{layout:1}},{name:"Rich and far",teaches:"The rich seams are the far ones. Get there, get paid, get home before sunset.",seams:2,target:"richest",quotaShare:.85,sunSlack:1.45,stockSlack:1.2,ore:{layout:3}},{name:"Last light",teaches:"Everything, tight. Every second out is a second back.",seams:4,quotaShare:.9,sunSlack:1.3,stockSlack:1,ore:{layout:4}}];function Nl(n){const e=Math.max(0,Math.floor(n));if(e<bi.length)return bi[e];const t=bi[bi.length-1],i=e-(bi.length-1);return{...t,name:`Last light +${i}`,teaches:"Tighter again. Same moon, less daylight.",seams:Math.min(6,t.seams+Math.floor(i/3)),sunSlack:Math.max(1.1,t.sunSlack-.03*i),stockSlack:Math.max(.85,t.stockSlack-.02*i),ore:{}}}function Lv(n,e,t,i,r="nearest"){const s=e.filter(p=>p.remaining>0),a=Math.max(1,Math.min(Math.floor(t),s.length)),o=r==="richest"?[...s].sort((p,g)=>g.remaining-p.remaining).slice(0,a):[...s].sort((p,g)=>Math.hypot(p.x-n.x,p.y-n.y)-Math.hypot(g.x-n.x,g.y-n.y)).slice(0,10);let l=null;const c=new Array(o.length).fill(!1),u=[],f=(p,g)=>{if(!(l&&g>=l.length)){if(u.length===a){l={order:[...u],length:g};return}for(let M=0;M<o.length;M+=1)c[M]||(c[M]=!0,u.push(o[M]),f(o[M],g+Math.hypot(o[M].x-p.x,o[M].y-p.y)),u.pop(),c[M]=!1)}};f(n,0);const h=l;return h?{seams:h.order.map(p=>p.id),length:h.length,ore:h.order.reduce((p,g)=>p+g.remaining,0),mineSeconds:h.order.reduce((p,g)=>p+g.remaining/Math.max(1e-6,Gx(g.richness,i)),0)}:{seams:[],length:0,ore:0,mineSeconds:0}}const Iv={sun:1,stock:1,quota:1},Nv=.75,Uv=1.35,Fv=5,Ov=4;function Bv(n,e,t,i=Iv){const r=Math.max(1,t.fabricatingSpeed),s=Math.max(r,t.railSpeed*Nv),a=e.length*Uv,o=Fv+a/r+e.mineSeconds+a/s,l=t.fabricateCostPerSecond/r,c=e.seams.length>0?1/e.seams.length:1,u=Math.max(0,t.railTricklePerSecond)*e.mineSeconds*(1-c),f=Math.max(a*l*.5,a*l-u);return{quota:Math.max(1,Math.round(e.ore*kv(n.quotaShare*i.quota,.05,1))),sunSeconds:Math.max(10,Math.ceil(o*n.sunSlack*i.sun)),startStock:Math.max(Ov,Math.ceil(f*n.stockSlack*i.stock)),parSeconds:o,parStock:f,par:e}}function kv(n,e,t){return Math.max(e,Math.min(t,n))}const zv=["Reset each shift","Decay at shift","Persist"],Gv=["Levels","Sandbox"],Wt={mode:0,levelSunSlack:1,levelStockSlack:1,levelQuotaShare:1,daysPerShift:3,shiftsPerGame:4,arenaRegenShifts:2,quota:12,underQuotaFeePct:.5,hardFailRoadResetPct:0,arenaScale:2,networkPersistence:1,shiftDecayPct:.4},oo="mm3d-campaign-v1",lo="mm3d-seed-v1",pd="mm3d-level-v1";function md(n){return Math.max(0,Math.min(1,n))}class Hv{constructor(e=Wt){at(this,"config");at(this,"arenaId","last-light-return");at(this,"dayNumber",1);at(this,"gameSeed","apollo-17");at(this,"bankedOre",0);at(this,"carriedFields",[]);at(this,"carriedDepletion",{});at(this,"carriedRoad",[]);at(this,"carriedRailGrowth",0);at(this,"bankedBonus",0);at(this,"tuningOverrides",{});at(this,"levelIndex",0);at(this,"lastLevelCleared",!1);at(this,"level",null);this.config={...e},this.gameSeed=this.loadSeed(),this.loadSave(),this.levelIndex=this.loadLevel()}levelsMode(){return Math.round(this.config.mode??0)===0}setLevel(e){this.levelIndex=Math.max(0,Math.floor(e)),this.saveLevel()}clampInt(e){return Math.max(1,Math.floor(e))}shiftOfDay(e=this.dayNumber){return Math.floor((e-1)/this.clampInt(this.config.daysPerShift))+1}dayInShiftOf(e=this.dayNumber){return(e-1)%this.clampInt(this.config.daysPerShift)+1}blockOfShift(e){return Math.floor((e-1)/this.clampInt(this.config.arenaRegenShifts))}worldSeedFor(e){return`${this.gameSeed}:blk${this.blockOfShift(this.shiftOfDay(e))}`}gameComplete(){return this.levelsMode()?!1:this.dayNumber>=this.config.daysPerShift*this.config.shiftsPerGame}buildWorld(){if(this.levelsMode())return this.buildLevel();this.level=null;const e=od(this.worldSeedFor(this.dayNumber),this.tuningOverrides,this.arenaId,this.carriedFields,this.carriedDepletion,this.config.arenaScale);return e.arena.extraction&&(e.arena={...e.arena,extraction:{...e.arena.extraction,oreRequired:this.config.quota}}),this.carriedRailGrowth>0&&(e.railCapacityGrown=this.carriedRailGrowth,wh(e),e.nanobots=Math.min(e.maxNanobots,e.nanobots+this.carriedRailGrowth)),{state:e,road:this.carriedRoad.map(t=>[...t])}}buildLevel(){const e=Nl(this.levelIndex),t=this.tuningOverrides,i={...t,oreLayout:(t.oreLayout??0)>=1?t.oreLayout:e.ore.layout??0,oreCount:(t.oreCount??1)*(e.ore.count??1),oreAmount:(t.oreAmount??1)*(e.ore.amount??1),orePoolSize:(t.orePoolSize??1)*(e.ore.poolSize??1),oreSpread:(t.oreSpread??1)*(e.ore.spread??1)},r=od(`${this.gameSeed}:L${this.levelIndex}`,i,this.arenaId,[],{},this.config.arenaScale),s=r.arena.extraction??r.arena.start,a=Lv(s,r.fertileZones,e.seams,r.tuning,e.target),o=Bv(e,a,r.tuning,{sun:this.config.levelSunSlack??1,stock:this.config.levelStockSlack??1,quota:this.config.levelQuotaShare??1});return r.arena.extraction&&(r.arena={...r.arena,extraction:{...r.arena.extraction,oreRequired:o.quota}}),r.maxNanobots=Math.max(r.maxNanobots,o.startStock),r.nanobots=o.startStock,r.solarWindowSeconds=o.sunSeconds,r.solarSeconds=o.sunSeconds,this.level={index:this.levelIndex,spec:e,budget:o},{state:r,road:[]}}endRun(e,t,i=0){const r=e.phase==="won";if(this.levelsMode()){const p=r&&!e.returnedUnderQuota;p&&(this.bankedOre+=e.rover.ore,this.bankedBonus+=i,this.setLevel(this.levelIndex+1)),this.lastLevelCleared=p;return}const s=e.returnedUnderQuota?1-this.config.underQuotaFeePct:1;if(this.bankedOre+=r?e.rover.ore*s:0,this.bankedBonus+=r?i:0,this.carriedRailGrowth=Math.max(0,e.railCapacityGrown??0),this.gameComplete()){this.persist(this.dayNumber,[],{},[]);return}const a=this.dayNumber+1,o=this.shiftOfDay(a)===this.shiftOfDay(this.dayNumber),l=this.worldSeedFor(a)===this.worldSeedFor(this.dayNumber);let c=1;if(!l)c=0;else if(!o){const p=Math.round(this.config.networkPersistence??0);c=p>=2?1:p===1?1-md(this.config.shiftDecayPct??0):0}!r&&this.config.hardFailRoadResetPct>0&&(c*=1-md(this.config.hardFailRoadResetPct));const u=c>0?Ux(e.fields,e.tuning):[],f=u.slice(0,Math.round(u.length*c)),h=t.slice(0,Math.round(t.length*c));this.persist(a,f,Ix(e.fertileZones),h)}advance(){if(!this.levelsMode()){if(this.gameComplete()){this.newGame();return}this.loadSave()}}newGame(){this.gameSeed=this.mintSeed(),this.dayNumber=1,this.setLevel(0),this.bankedOre=0,this.carriedFields=[],this.carriedDepletion={},this.carriedRoad=[],this.carriedRailGrowth=0,this.bankedBonus=0;try{window.localStorage.setItem(lo,this.gameSeed),window.localStorage.removeItem(oo)}catch{}}loadLevel(){try{const e=Number(window.localStorage.getItem(pd));return Number.isFinite(e)&&e>=0?Math.floor(e):0}catch{return 0}}saveLevel(){try{window.localStorage.setItem(pd,String(this.levelIndex))}catch{}}mintSeed(){return`g-${Date.now().toString(36)}-${Math.floor(Math.random()*1e6).toString(36)}`}loadSeed(){try{const e=window.localStorage.getItem(lo);if(e)return e;const t=this.mintSeed();return window.localStorage.setItem(lo,t),t}catch{return"apollo-17"}}loadSave(){try{const e=window.localStorage.getItem(oo),t=e?JSON.parse(e):void 0;this.dayNumber=typeof(t==null?void 0:t.day)=="number"&&t.day>=1?t.day:1,this.carriedFields=Array.isArray(t==null?void 0:t.fields)?t.fields:[],this.carriedDepletion=t!=null&&t.depletion&&typeof t.depletion=="object"?t.depletion:{},this.bankedOre=typeof(t==null?void 0:t.banked)=="number"?t.banked:0,this.carriedRoad=Array.isArray(t==null?void 0:t.road)?t.road:[],this.carriedRailGrowth=typeof(t==null?void 0:t.railGrowth)=="number"?t.railGrowth:0,this.bankedBonus=typeof(t==null?void 0:t.bonus)=="number"?t.bonus:0}catch{this.dayNumber=1,this.carriedFields=[],this.carriedDepletion={},this.bankedOre=0,this.carriedRoad=[],this.carriedRailGrowth=0,this.bankedBonus=0}}persist(e,t,i,r){this.carriedFields=t,this.carriedDepletion=i,this.carriedRoad=r;try{window.localStorage.setItem(oo,JSON.stringify({day:e,fields:t,depletion:i,banked:this.bankedOre,road:r,railGrowth:this.carriedRailGrowth,bonus:this.bankedBonus}))}catch{}}}const Vv=.85;function Wv(n,e){let t=!1;for(const i of e){if(!i.block)continue;const r=i.r*Vv,s=n.x-i.x,a=n.y-i.y,o=Math.hypot(s,a);if(o>=r)continue;const l=o>1e-6?s/o:Math.cos(n.heading+Math.PI),c=o>1e-6?a/o:Math.sin(n.heading+Math.PI);n.x=i.x+l*r,n.y=i.y+c*r;const u=-(Math.cos(n.heading)*l+Math.sin(n.heading)*c);u>0&&(n.speed*=1-u*.6),t=!0}return t}const co=900,Xv=.8,qv=.1,Ul=-2.3,Yv=1.1,$v={startElev:Xv,endElev:qv,sweep:Yv};function Kv(n,e=$v){const t=Math.max(0,Math.min(1,n)),i=e.startElev+(e.endElev-e.startElev)*t,r=Ul+e.sweep*t,s=Math.pow(t,1.3);return{elev:i,bearing:r,dusk:s,intensity:.85-.7*t,ambientIntensity:.5-.3*t,offset:{x:Math.cos(r)*Math.cos(i)*co,y:Math.sin(i)*co,z:Math.sin(r)*Math.cos(i)*co}}}const Zv=1,Jv="[run-data]",Qv="moon-miner-runs",Oh="mm3d-runs-v1",Bh=50,jv=7500;function kh(n){return{seconds:{prepared:0,fabricating:0,crawl:0},miningSeconds:0,droneLaunches:0,minStock:n,distance:0}}function eS(n,e,t,i){e.phase==="playing"&&(n.seconds[e.speedState]+=t,e.arms.mining>0&&(n.miningSeconds+=t),n.minStock=Math.min(n.minStock,e.nanobots),n.distance+=i)}function tS(n){const e={};for(const[t,{current:i,defaults:r}]of Object.entries(n)){const s=i,a=r,o={};for(const l of Object.keys(s)){const c=s[l],u=a[l];(typeof c=="number"&&typeof u=="number"?Math.abs(c-u)<1e-6:JSON.stringify(c)===JSON.stringify(u))||(o[l]=typeof c=="number"?fn(c,4):c)}Object.keys(o).length&&(e[t]=o)}return e}function nS(n){var o;const{state:e,stats:t,level:i}=n,r=n.now??new Date,s=((o=e.arena.extraction)==null?void 0:o.oreRequired)??e.targetOre,a=n.mode==="levels"?n.cleared?"cleared":e.phase==="won"?"under-quota":"lost":e.phase==="won"?"won":"sandbox-lost";return{v:Zv,id:`${r.getTime().toString(36)}-${e.seed}`.slice(0,64),at:r.toISOString(),build:n.build,seed:e.seed,mode:n.mode,level:i?i.index+1:null,levelName:(i==null?void 0:i.name)??null,day:n.day,result:a,ore:fn(e.rover.ore,2),quota:s,sunLeft:fn(e.solarSeconds,1),sunWindow:fn(e.solarWindowSeconds,1),elapsed:fn(e.elapsedSeconds,1),startStock:i?fn(i.startStock,1):null,parSeconds:i?fn(i.parSeconds,1):null,parSeams:(i==null?void 0:i.parSeams)??null,bonus:Math.floor(n.bonus),slide:Math.round(n.slide),secs:{prepared:fn(t.seconds.prepared,1),fabricating:fn(t.seconds.fabricating,1),crawl:fn(t.seconds.crawl,1),mining:fn(t.miningSeconds,1)},droneLaunches:t.droneLaunches,minStock:fn(t.minStock,2),distance:Math.round(t.distance),device:n.device,knobs:n.knobs}}function _a(n){try{const e=n==null?void 0:n.getItem(Oh),t=e?JSON.parse(e):[];return Array.isArray(t)?t:[]}catch{return[]}}function zh(n,e){try{return n==null||n.setItem(Oh,JSON.stringify(e.slice(-Bh))),!!n}catch{return!1}}function iS(n,e){return[...n,e].slice(-Bh)}function Gh(n){return n.filter(e=>!e.sent)}function rS(n){const e=n.map(({sent:i,...r})=>r);return`${n.map(i=>`- ${i.at.slice(0,16).replace("T"," ")} · ${i.mode==="levels"?`L${i.level} ${i.levelName}`:`day ${i.day}`} · ${i.result} · ${i.ore}/${i.quota} ore · ${i.sunLeft}s sun left`).join(`
`)}

\`\`\`json ${Qv}
${JSON.stringify(e)}
\`\`\`
`}function sS(n){const e=n[n.length-1],t=n.length===1&&e?`${e.mode==="levels"?`L${e.level}`:`day ${e.day}`} ${e.result}`:`${n.length} runs`;return`${Jv} ${t}`}function Hh(n,e){let t=e.slice();for(;;){const i=`https://github.com/${n}/issues/new?title=${encodeURIComponent(sS(t))}&body=${encodeURIComponent(rS(t))}`;if(i.length<=jv||t.length<=1)return{url:i,count:t.length};t=t.slice(1)}}function fn(n,e){const t=10**e;return Math.round(n*t)/t}function aS(n,e,t,i=1/0){const r=e-n,s={toValue:d=>n+r*Cr(d),toSlider:d=>r>0?Cr((d-n)/r):0,curved:!1};if(!(r>0)||i<=12||t===void 0||!Number.isFinite(t)||t<=n||t>=e)return s;const a=(t-n)/r;if(a>=.3&&a<=.7)return s;const o=a<.5,l=o?n:-e,c=o?e:-n,u=o?t:-t,f=(l*c-u*u)/(2*u-l-c),h=l+f,p=(c+f)/h;if(!(h>0)||!(p>1))return s;const g=Math.log(p),M=d=>h*Math.pow(p,Cr(d))-f,m=d=>Cr(Math.log(Math.max(h,d+f)/h)/g);return{toValue:d=>o?M(d):-M(1-Cr(d)),toSlider:d=>o?m(d):1-m(-d),curved:!0}}function Cr(n){return Math.max(0,Math.min(1,n))}const di={dist:210,height:190,fov:55,horizon:0,overhead:!1,lag:.145},hi={stickRadius:66,steerDead:.2,forwardCone:20,throttleDead:.2,steerCurve:1},vt={relief:.7,craterDensity:.6,craterSize:1,craterSpread:1,craterBlockSize:45,roadBrightness:.8,roadShadow:.6,daylight:5,sunGain:3,sunHigh:.8,sunLow:.1,sunSweep:1.1,sunDiskSize:420,ambient:1,rimLight:.9,shadows:1,bloom:.55,bloomThreshold:.72,stars:1};function oS(n){const e=`
  #gear{position:fixed;left:10px;bottom:56px;z-index:9;width:40px;height:40px;border-radius:20px;
    border:1px solid #2b3a4d;background:rgba(12,16,24,0.8);color:#cfe0ee;font-size:20px;cursor:pointer}
  #panel{position:fixed;top:0;right:0;bottom:0;z-index:10;width:290px;max-width:86vw;overflow-y:auto;
    display:none;padding:12px 12px 40px;background:rgba(8,11,17,0.94);border-left:1px solid #223;
    font:12px/1.3 ui-monospace,monospace;color:#dfe8f2}
  #panel .top{display:flex;align-items:center;gap:8px;margin-bottom:4px}
  #panel .top b{flex:1;font-size:12px;letter-spacing:0.08em;color:#8fd9c9}
  #panel .help-btn{flex:none;min-width:0;width:30px;height:30px;padding:0;border-radius:15px;font-weight:bold}
  #panel.help .help-btn{background:#8fd9c9;color:#08111a}
  #panel details{border-top:1px solid #1c2735;padding:2px 0}
  #panel summary{cursor:pointer;padding:9px 0 5px;font-size:11px;letter-spacing:0.08em;color:#8fd9c9;
    text-transform:uppercase;list-style:none;user-select:none}
  #panel summary::-webkit-details-marker{display:none}
  #panel summary::before{content:'▸ ';color:#4f6a80}
  #panel details[open] summary::before{content:'▾ '}
  #panel .blurb,#panel .hint{display:none;color:#7f93a8;font-size:11px;line-height:1.35}
  #panel .blurb{margin:0 0 4px}
  #panel .hint{grid-column:1/3;margin-top:1px}
  #panel.help .blurb,#panel.help .hint{display:block}
  #panel .row{display:grid;grid-template-columns:1fr auto;gap:2px 8px;align-items:center;margin:7px 0}
  #panel .row label{color:#cfe0ee}
  #panel .row .val{color:#8fa3ba;text-align:right;min-width:44px}
  #panel .row input[type=range]{grid-column:1/3;width:100%}
  #panel .btns{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}
  #panel button{flex:1;min-width:80px;padding:8px;border:1px solid #2b3a4d;border-radius:8px;
    background:#12202b;color:#d7fff3;cursor:pointer}`,t=document.createElement("style");t.textContent=e,document.head.appendChild(t);const i=document.createElement("button");i.id="gear",i.textContent="⚙",i.title="Tuning panel",document.body.appendChild(i);const r=document.createElement("aside");r.id="panel",document.body.appendChild(r);const s=1e3,a=[],o=document.createElement("div");o.className="top";const l=document.createElement("b");l.textContent="TUNING";const c=document.createElement("button");c.className="help-btn",c.textContent="?",c.title="Show what every knob does";const u="mm3d-panel-help",f="mm3d-panel-open",h=(S,Q)=>{try{const W=window.localStorage.getItem(S);return W?JSON.parse(W):Q}catch{return Q}},p=(S,Q)=>{try{window.localStorage.setItem(S,JSON.stringify(Q))}catch{}};h(u,!1)&&r.classList.add("help"),c.addEventListener("click",()=>p(u,r.classList.toggle("help"))),o.append(l,c),r.appendChild(o);const g=h(f,{});let M=r;function m(S,Q){const W=document.createElement("details");W.open=g[S]??!0,W.addEventListener("toggle",()=>{g[S]=W.open,p(f,g)});const j=document.createElement("summary");if(j.textContent=S,W.appendChild(j),Q){const ee=document.createElement("div");ee.className="blurb",ee.textContent=Q,W.appendChild(ee)}r.appendChild(W),M=W}function d(S){const Q=document.createElement("label");Q.className="row",S.hint&&(Q.title=S.hint);const W=document.createElement("label");W.textContent=S.label;const j=document.createElement("span");j.className="val";const ee=document.createElement("input");ee.type="range";const ie=aS(S.min,S.max,S.mid,(S.max-S.min)/S.step),se=ve=>{if(!ie.curved)return ve;const Ue=ie.toValue(ve/s),Y=S.min+Math.round((Ue-S.min)/S.step)*S.step;return Math.max(S.min,Math.min(S.max,Number(Y.toFixed(6))))},Me=ve=>ie.curved?Math.round(ie.toSlider(ve)*s):ve;if(ee.min=ie.curved?"0":String(S.min),ee.max=ie.curved?String(s):String(S.max),ee.step=ie.curved?"1":String(S.step),ee.addEventListener("input",()=>{const ve=se(Number(ee.value));S.set(ve),j.textContent=(S.fmt??String)(S.get()),n.save()}),S.commit&&ee.addEventListener("change",()=>S.commit()),Q.append(W,j,ee),S.hint){const ve=document.createElement("div");ve.className="hint",ve.textContent=S.hint,Q.appendChild(ve)}M.appendChild(Q),a.push({def:S,range:ee,val:j,toRaw:Me})}function E(){for(const S of a){const Q=S.def.get();S.range.value=String(S.toRaw(Q)),S.val.textContent=(S.def.fmt??String)(Q)}}const A=n.campaign.config,v=n.road.config,w=S=>String(Math.round(S)),b=S=>S.toFixed(2),R=S=>()=>n.getState().tuning[S],_=S=>Q=>n.applyTuning({[S]:Q}),T=n.cam,C=n.terrain,D=n.controls,O=S=>`${Math.round(S*180/Math.PI)}°`,H=["Auto","Scatter","Ridge","Clusters","Belt"];m("Levels","Levels pose one route question each; quota, sun and starting stock come from a par route on the map, so Level size and every speed knob keep them fair. Sandbox is the open day/shift loop."),d({label:"Mode",min:0,max:1,step:1,fmt:S=>Gv[Math.round(S)]??"Levels",hint:"Levels: clear a level (home with the quota) to go on; miss and you retry the same map. Sandbox: the open day → shift → game loop where every number is a knob. Switching rebuilds the day.",get:()=>A.mode,set:S=>A.mode=Math.round(S),commit:()=>{n.rebuildDay(),E()}}),d({label:"Level",min:1,max:30,step:1,fmt:S=>`${Math.round(S)} · ${Nl(Math.round(S)-1).name}`,hint:"Jump to a level (Levels mode). Past the authored set, levels keep tightening.",get:()=>n.campaign.levelIndex+1,set:S=>n.campaign.setLevel(Math.round(S)-1),commit:()=>{n.campaign.levelsMode()&&n.rebuildDay()}}),d({mid:Wt.levelSunSlack,label:"Sun slack",min:.3,max:5,step:.05,fmt:S=>`${S.toFixed(2)}×`,hint:"Multiplies every level's daylight (which is already derived from its par route). Above 1 = more time; below 1 = harder than authored. Applies on the next level build.",get:()=>A.levelSunSlack,set:S=>A.levelSunSlack=S,commit:()=>{n.campaign.levelsMode()&&n.rebuildDay()}}),d({mid:Wt.levelStockSlack,label:"Stock slack",min:.3,max:5,step:.05,fmt:S=>`${S.toFixed(2)}×`,hint:"Multiplies every level's starting nanobots (derived from the road its par route needs).",get:()=>A.levelStockSlack,set:S=>A.levelStockSlack=S,commit:()=>{n.campaign.levelsMode()&&n.rebuildDay()}}),d({mid:Wt.levelQuotaShare,label:"Quota share",min:.1,max:1.5,step:.05,fmt:S=>`${S.toFixed(2)}×`,hint:"Multiplies every level's quota (a share of the ore on its par seams; capped at all of it).",get:()=>A.levelQuotaShare,set:S=>A.levelQuotaShare=S,commit:()=>{n.campaign.levelsMode()&&n.rebuildDay()}}),m("Controls","How the stick and wheel feel. Touch: drag anywhere for a stick; the stick knobs change nothing on a keyboard."),d({mid:hi.stickRadius,label:"Stick size",min:30,max:200,step:1,fmt:S=>`${Math.round(S)}px`,hint:"How far your thumb travels from centre to full deflection. Bigger = finer control, more travel.",get:()=>D.stickRadius,set:S=>D.stickRadius=S}),d({mid:hi.forwardCone,label:"Forward cone",min:0,max:60,step:1,fmt:S=>`±${Math.round(S)}°`,hint:"Pushing forward within this angle of straight ahead drives dead straight: sideways drift in your thumb never steers. Wider = easier to drive straight, but you must swing further over to turn while driving.",get:()=>D.forwardCone,set:S=>D.forwardCone=S}),d({mid:hi.steerDead,label:"Steer dead zone",min:0,max:.8,step:.02,fmt:b,hint:"Sideways travel (fraction of the stick) ignored before steering starts, even when not pushing forward. Steering then ramps smoothly from zero, no jump.",get:()=>D.steerDead,set:S=>D.steerDead=S}),d({mid:hi.throttleDead,label:"Throttle dead zone",min:0,max:.8,step:.02,fmt:b,hint:"Forward/back travel (fraction of the stick) ignored before you drive or reverse. A resting thumb does nothing.",get:()=>D.throttleDead,set:S=>D.throttleDead=S}),d({mid:hi.steerCurve,label:"Steer curve",min:.5,max:3,step:.05,fmt:b,hint:"1 = linear. Above 1 = gentle near the middle for fine corrections, still full lock at the edge. Below 1 = twitchy.",get:()=>D.steerCurve,set:S=>D.steerCurve=S}),d({mid:n.tuningDefaults.turnRate,label:"Turn rate",min:.3,max:8,step:.05,fmt:S=>`${O(S)}/s`,hint:"How fast the rover turns at full lock when you are steering yourself (off the rail, and pivoting in place).",get:R("turnRate"),set:_("turnRate")}),d({mid:n.tuningDefaults.steerRamp,label:"Wheel speed",min:.5,max:40,step:.1,fmt:S=>`${(1/S).toFixed(2)}s`,hint:"Time for the wheel to travel from centre to full lock. Longer = heavier machine; shorter = snappier.",get:R("steerRamp"),set:_("steerRamp")}),d({mid:n.tuningDefaults.carryBreakSteer,label:"Break-off steer",min:.3,max:1,step:.01,fmt:b,hint:"How far over (0..1) you must push the stick to come OFF the rail. Below this the rail owns the wheel. Keyboard A/D is always full (1).",get:R("carryBreakSteer"),set:_("carryBreakSteer")}),m("World","Size + ground. Terrain applies live; Level size rebuilds the day on release."),d({mid:Wt.arenaScale,label:"Level size",min:.4,max:12,step:.1,fmt:b,hint:"How big the moon is — ground, seam spread and haul length all scale together. Rebuilds the day when you release the slider (New Game for a clean slate). Range runs past usable both ways so you can bracket the sweet spot.",get:()=>A.arenaScale,set:S=>A.arenaScale=S,commit:()=>n.rebuildDay()}),d({mid:vt.relief,label:"Relief",min:0,max:6,step:.05,fmt:b,hint:"Height of craters/rolling ground. 0 = flat painted only.",get:()=>C.relief,set:S=>{C.relief=S,n.applyTerrain()}}),d({mid:vt.craterDensity,label:"Crater density",min:0,max:8,step:.1,fmt:b,hint:"How many craters/rilles the ground carries.",get:()=>C.craterDensity,set:S=>{C.craterDensity=S,n.applyTerrain()}}),d({mid:vt.craterSize,label:"Crater size",min:.05,max:12,step:.1,fmt:b,hint:"Scales how big each crater is. 1 = current; higher = broader craters.",get:()=>C.craterSize,set:S=>{C.craterSize=S,n.applyTerrain()}}),d({mid:vt.craterSpread,label:"Crater spread",min:.05,max:4,step:.05,fmt:b,hint:"How far craters scatter from the map centre. 1 = spread evenly; lower clusters them mid-map; higher pushes them to the edges.",get:()=>C.craterSpread,set:S=>{C.craterSpread=S,n.applyTerrain()}}),d({mid:vt.craterBlockSize,label:"Crater walls from",min:5,max:400,step:1,fmt:S=>S>=400?"off":`r ${Math.round(S)}`,hint:"Craters at least this big (radius) are walls: you can’t drive into the bowl, you slide round the rim and your rail follows it. They carry a bright full rim and never land on home or an ore pool. Lower = more walls; max = off.",get:()=>C.craterBlockSize,set:S=>{C.craterBlockSize=S,n.applyTerrain()}}),m("Ore pools","Reshape the day's map, so they rebuild it on release (New Game for a fresh seed). All identity at 1 / Auto."),d({mid:n.tuningDefaults.oreLayout,label:"Layout",min:0,max:4,step:1,fmt:S=>H[Math.round(S)]??"Auto",hint:"Shape of the ore layout. Auto = a seeded shape per map; or force Scatter / Ridge / Clusters / Belt.",get:R("oreLayout"),set:_("oreLayout"),commit:()=>n.rebuildDay()}),d({mid:n.tuningDefaults.oreSpread,label:"Ore spread",min:.05,max:8,step:.05,fmt:b,hint:"How widely the pools scatter from the map centre, on top of Level size. 1 = current; lower packs them in, higher flings them out.",get:R("oreSpread"),set:_("oreSpread"),commit:()=>n.rebuildDay()}),d({mid:n.tuningDefaults.oreCount,label:"Ore count",min:.1,max:15,step:.1,fmt:b,hint:"How many pools, as a multiple of the authored set. Extra pools reuse the authored richness profiles. 1 = current.",get:R("oreCount"),set:_("oreCount"),commit:()=>n.rebuildDay()}),d({mid:n.tuningDefaults.oreAmount,label:"Ore amount",min:.05,max:15,step:.1,fmt:b,hint:"Scales how much ore each pool holds (richness + remaining). 1 = current. A real economy lever.",get:R("oreAmount"),set:_("oreAmount"),commit:()=>n.rebuildDay()}),d({mid:n.tuningDefaults.orePoolSize,label:"Pool size",min:.05,max:10,step:.1,fmt:b,hint:"Scales each pool’s footprint (radius + vein). 1 = current.",get:R("orePoolSize"),set:_("orePoolSize"),commit:()=>n.rebuildDay()}),m("Rover & rail","The rail is one physical idea: GRIP. The lock carries you along your laid road and the rail sets your speed: it winds up toward top speed and brakes for bends so grip holds. Steer hard to leave."),d({label:"Track-spine (no off-road)",min:0,max:1,step:1,fmt:S=>S>=.5?"on":"off",hint:"On = you are always on your own track. Out of stock enters EMERGENCY: you crawl forward while the arms cannibalise your own laid rail to build ahead (network shrinks, camera judders), never a silent bare-ground roll. Off = classic driving.",get:()=>n.getState().tuning.trackSpine?1:0,set:S=>n.applyTuning({trackSpine:S>=.5})}),d({mid:pt.cannibalGuard,label:"Emergency guard",min:0,max:5,step:.1,fmt:S=>`${S.toFixed(1)} cars`,hint:"In an emergency the arms never eat rail within this many car lengths of you (under you and just behind).",get:()=>v.cannibalGuard,set:S=>v.cannibalGuard=S}),d({mid:pt.cannibalGuardAhead,label:"Emergency guard ahead",min:0,max:20,step:.5,fmt:S=>`${S.toFixed(1)} cars`,hint:"Nor any rail straight ahead of you out to this many car lengths: the road you are about to need. Everything else is fair game.",get:()=>v.cannibalGuardAhead,set:S=>v.cannibalGuardAhead=S}),d({mid:n.tuningDefaults.fabricatingSpeed,label:"Laying speed",min:5,max:1500,step:1,fmt:w,hint:"Speed while laying fresh ribbon at the frontier — the strategic pace. Tune for decisions, not reflexes.",get:R("fabricatingSpeed"),set:_("fabricatingSpeed")}),d({mid:n.tuningDefaults.railSpeed,label:"Road top speed",min:10,max:3e3,step:5,fmt:w,hint:"Top speed once you are rolling on ribbon you already laid — the ceiling you wind up toward. Max is deliberately silly.",get:R("railSpeed"),set:_("railSpeed")}),d({mid:pt.railAccel,label:"Acceleration",min:5,max:2e3,step:5,fmt:w,hint:"How fast the rail winds you up toward top speed on laid road (units/s²). It brakes harder than this by Brake strength (3× by default). ~100 = about a second to full speed.",get:()=>v.railAccel,set:S=>v.railAccel=S}),d({mid:n.tuningDefaults.railGrip,label:"Grip",min:50,max:2e4,step:50,fmt:w,hint:"The rail's grip: the most sideways force it can hold (units/s²). This ONE number sets how sharply you can corner at any speed: turn limit = grip ÷ speed, and the rail slows for bends to √(grip ÷ curvature). Higher = tighter corners, faster.",get:R("railGrip"),set:_("railGrip")}),d({mid:pt.cornerBraking,label:"Corner braking",min:0,max:1,step:.05,fmt:b,hint:"How much the rail slows itself for bends ahead. 1 = it always slows enough that grip holds — you never get flung off. 0 = no braking: go into a bend too fast and you slide off. Lower it for a harder level.",get:()=>v.cornerBraking,set:S=>v.cornerBraking=S}),d({mid:pt.railBrakeMult,label:"Brake strength",min:.5,max:10,step:.1,fmt:S=>`${S.toFixed(1)}×`,hint:"How much harder the rail brakes than it accelerates. Lower = it starts slowing for bends earlier and more gently.",get:()=>v.railBrakeMult,set:S=>v.railBrakeMult=S}),d({mid:pt.cornerGripReserve,label:"Grip reserve",min:.3,max:1,step:.05,fmt:b,hint:"Share of grip the rail plans bends at. The rest is kept for the lock's own corrections. Lower = slower, safer corners; 1 = right at the limit.",get:()=>v.cornerGripReserve,set:S=>v.cornerGripReserve=S}),d({mid:pt.lockAlign,label:"Lock-on angle",min:0,max:.98,step:.02,fmt:S=>`≤${O(Math.acos(Math.max(-1,Math.min(1,S))))}`,hint:"How closely you must be driving ALONG cured road for the rail to grab you. Wider angle = it grabs you even when you cut across at a slant.",get:()=>v.lockAlign,set:S=>v.lockAlign=S}),d({mid:pt.lockHoldWidth,label:"Lock hold width",min:1,max:4,step:.05,fmt:S=>`${S.toFixed(2)}×`,hint:"Once locked, you stay on until you are this many half-road-widths off the line. Higher = stickier.",get:()=>v.lockHoldWidth,set:S=>v.lockHoldWidth=S}),d({mid:pt.lockReleaseSeconds,label:"Re-grab delay",min:0,max:3,step:.05,fmt:S=>`${S.toFixed(2)}s`,hint:"After you steer off, the rail will not grab you again for this long, so leaving actually leaves.",get:()=>v.lockReleaseSeconds,set:S=>v.lockReleaseSeconds=S}),d({mid:pt.trackRate,label:"Line tracking",min:1,max:30,step:.5,fmt:b,hint:"How quickly the lock pulls you back to the road's centre line. Higher = tighter; lower = floatier.",get:()=>v.trackRate,set:S=>v.trackRate=S}),d({mid:pt.roadWidthCars,label:"Road width (cars)",min:.5,max:20,step:.1,fmt:S=>S.toFixed(1),hint:"Width of the laid road, in car-widths. Applies live.",get:()=>v.roadWidthCars,set:S=>v.roadWidthCars=S}),d({mid:pt.junctionReach,label:"Junction reach",min:0,max:6,step:.1,fmt:S=>S<=0?"off":`${S.toFixed(1)}×`,hint:"When your new road runs into existing road (and stops laying, so it doesn't stack), or you drive off existing road onto fresh ground, the two are joined into a junction the rail can carry you through. This is how big a gap still counts as an implied junction, in half road-widths past the no-restack margin. 0 = never join.",get:()=>v.junctionReach,set:S=>v.junctionReach=S}),d({mid:pt.laneGapCars,label:"No-restack margin",min:0,max:10,step:.1,fmt:S=>S.toFixed(1),hint:"How close a new lane may come to existing road before it stops laying (double-stack guard), beyond the road width. Higher = new lanes keep more clearance; you still lay freely everywhere else. Applies live.",get:()=>v.laneGapCars,set:S=>v.laneGapCars=S}),m("Economy","Mining, stock drain/recovery and the day's clock + quota."),d({mid:n.tuningDefaults.mineRate,label:"Mining yield",min:.01,max:20,step:.01,fmt:b,hint:"Ore per second while parked in a seam.",get:R("mineRate"),set:_("mineRate")}),d({mid:n.tuningDefaults.fabricateCostPerSecond,label:"Fabrication drain",min:0,max:30,step:.05,fmt:b,hint:"Nanobots per second spent laying road on bare ground.",get:R("fabricateCostPerSecond"),set:_("fabricateCostPerSecond")}),d({mid:n.tuningDefaults.crawlSpeed,label:"Crawl speed",min:5,max:400,step:1,fmt:w,hint:"How fast you limp when out of stock (crawl).",get:R("crawlSpeed"),set:_("crawlSpeed")}),d({mid:n.tuningDefaults.maxNanobots,label:"Base max stock",min:4,max:400,step:1,fmt:w,hint:"Nanobot capacity before any capacity climb. Higher = longer runs of fresh road before you run dry.",get:R("maxNanobots"),set:_("maxNanobots")}),d({mid:n.tuningDefaults.crawlRecoveryPerSecond,label:"Crawl recovery",min:0,max:20,step:.01,fmt:b,hint:"Nanobots per second regained while crawling (out of stock).",get:R("crawlRecoveryPerSecond"),set:_("crawlRecoveryPerSecond")}),d({mid:n.tuningDefaults.startingNanobots,label:"Start stock",min:0,max:600,step:1,fmt:w,hint:"Sandbox (levels derive their own). Nanobots you begin each day with. Applies next day.",get:R("startingNanobots"),set:_("startingNanobots")}),d({mid:n.tuningDefaults.startingSolarSeconds,label:"Sun window",min:5,max:3e3,step:5,fmt:w,hint:"Sandbox (levels derive their own). Seconds of daylight per day. Applies next day.",get:R("startingSolarSeconds"),set:_("startingSolarSeconds")}),d({mid:Wt.quota,label:"Daily quota",min:1,max:600,step:1,fmt:w,hint:"Sandbox (levels derive their own). Ore you must bank per day. Return under it and you pay the fee below.",get:()=>A.quota,set:S=>{A.quota=Math.round(S);const Q=n.getState().arena.extraction;Q&&!n.campaign.levelsMode()&&(Q.oreRequired=A.quota)}}),d({mid:Wt.underQuotaFeePct,label:"Under-quota fee",min:0,max:1,step:.05,fmt:b,hint:"Fraction of the haul skimmed when you return under quota.",get:()=>A.underQuotaFeePct,set:S=>A.underQuotaFeePct=S}),m("Rail growth (independent of ore)","Background reach growth. Never reads ore amount."),d({mid:n.tuningDefaults.railTricklePerSecond,label:"Mining trickle /s",min:0,max:10,step:.05,fmt:b,hint:"Flat nanobots per second while actively mining. Never scaled by how much ore you pull. 0 = off.",get:R("railTricklePerSecond"),set:_("railTricklePerSecond")}),d({mid:n.tuningDefaults.railTricklePerSlurp,label:"Slurp refuel",min:0,max:60,step:.5,fmt:b,hint:"Flat nanobots added per rail slurp. 0 = off.",get:R("railTricklePerSlurp"),set:_("railTricklePerSlurp")}),d({mid:n.tuningDefaults.railCapacityGrowthPerMinute,label:"Capacity climb /min",min:0,max:120,step:.5,fmt:b,hint:"How fast max stock grows per minute of play. Carries across days and shifts (reset on New Game) — the quiet escalation that lets you push further later. 0 = off.",get:R("railCapacityGrowthPerMinute"),set:_("railCapacityGrowthPerMinute")}),d({mid:n.tuningDefaults.railCapacityMax,label:"Capacity cap",min:0,max:2e3,step:1,fmt:S=>S<=0?"none":S.toFixed(0),hint:"Max stock the climb stops at. 0 = no cap.",get:R("railCapacityMax"),set:_("railCapacityMax")}),m("Network & campaign","What your laid rail survives: day to day it always carries within a shift; the shift-end mode decides the rest."),d({mid:Wt.daysPerShift,label:"Days / shift",min:1,max:30,step:1,fmt:w,hint:"Days in one shift. Your laid rail always carries day to day within a shift.",get:()=>A.daysPerShift,set:S=>A.daysPerShift=Math.round(S)}),d({mid:Wt.shiftsPerGame,label:"Shifts / game",min:1,max:30,step:1,fmt:w,hint:"Shifts in one game. The game ends after days/shift × shifts/game days.",get:()=>A.shiftsPerGame,set:S=>A.shiftsPerGame=Math.round(S)}),d({mid:Wt.arenaRegenShifts,label:"Regen every N",min:1,max:30,step:1,fmt:w,hint:"Map regenerates this often + on New Game.",get:()=>A.arenaRegenShifts,set:S=>A.arenaRegenShifts=Math.round(S)}),d({mid:Wt.networkPersistence,label:"Network at shift end",min:0,max:2,step:1,fmt:S=>zv[Math.round(S)]??"Reset each shift",hint:"What your laid rail does when a shift ends (it always carries day-to-day within a shift). Reset = wipe; Decay = lose the fringe, keep the trunk from home; Persist = carry it all. A map regen always starts clean.",get:()=>A.networkPersistence,set:S=>A.networkPersistence=Math.round(S)}),d({mid:Wt.shiftDecayPct,label:"Shift decay",min:0,max:1,step:.05,fmt:b,hint:"Decay mode only: fraction of the network lost at a shift boundary, shed from the newest (outermost) rail first.",get:()=>A.shiftDecayPct,set:S=>A.shiftDecayPct=S}),d({mid:Wt.hardFailRoadResetPct,label:"Sunset road wipe",min:0,max:1,step:.05,fmt:b,hint:"Fraction of laid road lost if you miss a sunset.",get:()=>A.hardFailRoadResetPct,set:S=>A.hardFailRoadResetPct=S}),m("Slurp","Fast rail passes grab whole seams."),d({mid:pt.slurpBandPct,label:"Slurp band",min:0,max:1,step:.02,fmt:b,hint:"Central fraction of a seam a fast pass slurps whole. 0 = slurp off.",get:()=>v.slurpBandPct,set:S=>v.slurpBandPct=S}),d({mid:pt.slurpMinBoost,label:"Slurp min boost",min:0,max:1,step:.05,fmt:b,hint:"Rail momentum (0..1 of the way from laying speed to top speed) you must be riding at for the slurp to charge.",get:()=>v.slurpMinBoost,set:S=>v.slurpMinBoost=S}),d({mid:pt.slurpChargeSeconds,label:"Slurp charge (s)",min:0,max:30,step:.1,fmt:S=>S.toFixed(1),hint:"Seconds of riding the rail at speed to arm the slurp (the HUD shows Rail ⚡). Dips drain it rather than reset it; once armed it stays armed while you are on the rail. Higher = must earn a longer run first.",get:()=>v.slurpChargeSeconds,set:S=>v.slurpChargeSeconds=S}),d({mid:pt.slurpChargeDrain,label:"Slurp drain",min:0,max:5,step:.1,fmt:S=>`${S.toFixed(1)}×`,hint:"How fast the charge drains when you are off the rail or slow (seconds lost per second). 0 = never drains; higher = one dip costs more.",get:()=>v.slurpChargeDrain,set:S=>v.slurpChargeDrain=S}),m("Drone (cleanup / reclaim)","Lifts a run off ONE END of the ribbon, so the network never splits. Tether = reach; Aim bias = your facing picks which end."),d({mid:n.tuningDefaults.droneTetherRange,label:"Tether range",min:20,max:12e3,step:20,fmt:w,hint:"How far out from home the drone will reach. It lifts a run off one end of the ribbon whose midpoint is within this radius, and never a middle piece, so the network never splits. Max ≈ whole map.",get:R("droneTetherRange"),set:_("droneTetherRange")}),d({mid:n.tuningDefaults.reclaimAimBias,label:"Aim bias",min:0,max:60,step:.5,fmt:b,hint:"How hard the way you FACE at launch picks which end the drone reclaims. 0 = always the oldest road nearest home (pure cleanup); high = it grabs from whichever end you point toward.",get:R("reclaimAimBias"),set:_("reclaimAimBias")}),d({mid:n.tuningDefaults.droneSpeed,label:"Drone speed",min:20,max:3e3,step:10,fmt:w,hint:"How fast the drone flies out to the road it reclaims and back to you.",get:R("droneSpeed"),set:_("droneSpeed")}),d({mid:pt.eraserReach,label:"Eraser reach",min:0,max:1500,step:10,fmt:S=>S<=0?"off":w(S),hint:"Stop and aim (pivot in place): after the aim delay a red ring marks the road straight ahead (up to this far) and Launch becomes Erase — the drone erases that patch instead of peeling an end, for clearing a malformed bit. It can cut your network. A tap while driving or just after stopping is the usual reclaim. 0 = eraser off.",get:()=>v.eraserReach,set:S=>v.eraserReach=S}),d({mid:pt.eraserAimDelay,label:"Eraser aim delay",min:0,max:5,step:.05,fmt:S=>`${S.toFixed(2)}s`,hint:"How long you must be stopped before the eraser target appears. Shorter = quicker to aim; longer = fewer accidental erases when you stop and launch.",get:()=>v.eraserAimDelay,set:S=>v.eraserAimDelay=S}),d({mid:pt.eraserRadius,label:"Eraser size",min:10,max:400,step:5,fmt:w,hint:"Radius of the patch the eraser lifts around the road it hits.",get:()=>v.eraserRadius,set:S=>v.eraserRadius=S}),d({mid:pt.reclaimBite,label:"Reclaim bite",min:10,max:6e3,step:20,fmt:w,hint:"World units of road one drone flight lifts. Lower = takes a small chunk; higher = reels in more per trip.",get:()=>v.reclaimBite,set:S=>v.reclaimBite=S}),m("Light & sky","Presentation only. The road glows steadily; the sun lights the terrain and sinks toward sunset, so the ground tells the time."),d({mid:vt.roadBrightness,label:"Road brightness",min:.1,max:1,step:.05,fmt:b,hint:"How bright the laid road glows. Steady all day: the sun never brightens or dims it. 1 = full neon.",get:()=>C.roadBrightness,set:S=>{C.roadBrightness=S,n.applyLook()}}),d({mid:vt.daylight,label:"Daylight strength",min:0,max:12,step:.25,fmt:b,hint:"How strongly the sun lights the ground. Mornings are brightest; it fades to the dark moon by sunset, so the ground tells you the time. 0 = no day/night change.",get:()=>C.daylight,set:S=>{C.daylight=S,n.applyLook()}}),d({mid:vt.sunGain,label:"Sun intensity",min:0,max:8,step:.1,fmt:b,hint:"How strongly the sun lights the rover, drone and beacon, and how dark their shadows read against the lit ground.",get:()=>C.sunGain,set:S=>C.sunGain=S}),d({mid:vt.sunHigh,label:"Sun at first light",min:.05,max:1.5,step:.01,fmt:O,hint:"How high the sun starts the day. Lower = long shadows all day; near 90° the rover's shadow tucks underneath it.",get:()=>C.sunHigh,set:S=>C.sunHigh=S}),d({mid:vt.sunLow,label:"Sun at sunset",min:0,max:1.5,step:.01,fmt:O,hint:"How high the sun is at last light. Near 0° = shadows stretch right across the field as time runs out.",get:()=>C.sunLow,set:S=>C.sunLow=S}),d({mid:vt.sunSweep,label:"Sun sweep",min:0,max:3.14,step:.02,fmt:O,hint:"How far the sun travels across the sky over the day. More = shadows visibly swing round, a stronger clock.",get:()=>C.sunSweep,set:S=>C.sunSweep=S}),d({mid:vt.sunDiskSize,label:"Sun disk size",min:0,max:1500,step:10,fmt:S=>S<=0?"hidden":w(S),hint:"Size of the visible sun in the sky (tilt the camera up with Look angle to see it).",get:()=>C.sunDiskSize,set:S=>{C.sunDiskSize=S,n.applyLook()}}),d({mid:vt.shadows,label:"Shadows",min:0,max:1,step:1,fmt:S=>S>=.5?"on":"off",hint:"Real cast shadows from the sun. Off is cheaper on a slow phone.",get:()=>C.shadows,set:S=>{C.shadows=S,n.applyLook()}}),d({mid:vt.roadShadow,label:"Shadow on road",min:0,max:1,step:.05,fmt:b,hint:"How dark a cast shadow falls across the road at full sun. It fades with the sun, so dusk shadows are faint. 0 = the road glows through shadows.",get:()=>C.roadShadow,set:S=>{C.roadShadow=S}}),d({mid:vt.ambient,label:"Fill light",min:0,max:3,step:.05,fmt:b,hint:"Ambient fill on the rover and props. Lower = darker, moodier shadow sides.",get:()=>C.ambient,set:S=>C.ambient=S}),d({mid:vt.rimLight,label:"Rim light",min:0,max:3,step:.05,fmt:b,hint:"The cool back light that edges the rover and drone so they read against the dark.",get:()=>C.rimLight,set:S=>{C.rimLight=S,n.applyLook()}}),d({mid:vt.bloom,label:"Glow",min:0,max:2,step:.05,fmt:b,hint:"Neon bloom strength on the road, seams and cab. 0 = no glow.",get:()=>C.bloom,set:S=>{C.bloom=S,n.applyLook()}}),d({mid:vt.bloomThreshold,label:"Glow threshold",min:0,max:1,step:.02,fmt:b,hint:"How bright something must be to glow. Lower = more of the scene blooms; higher = only the brightest neon.",get:()=>C.bloomThreshold,set:S=>{C.bloomThreshold=S,n.applyLook()}}),d({mid:vt.stars,label:"Stars",min:0,max:2,step:.05,fmt:S=>S<=0?"off":b(S),hint:"Starfield brightness. The stars sit at infinity above the horizon.",get:()=>C.stars,set:S=>{C.stars=S,n.applyLook()}}),m("Camera","Presentation only."),d({mid:di.dist,label:"Distance",min:40,max:2e3,step:10,fmt:w,hint:"Also: mouse wheel / pinch to zoom.",get:()=>T.dist,set:S=>T.dist=S}),d({mid:di.height,label:"Height",min:20,max:2e3,step:10,fmt:w,hint:"How high the chase camera rides above the rover.",get:()=>T.height,set:S=>T.height=S}),d({mid:di.fov,label:"Field of view",min:15,max:130,step:1,fmt:w,hint:"Lens angle. Wide = more in frame + faster/vaster feel; narrow = telephoto, flatter. (Distance moves the camera; FOV changes the lens.)",get:()=>T.fov,set:S=>T.fov=S}),d({mid:di.horizon,label:"Look angle",min:0,max:1.3,step:.05,fmt:b,hint:"Tilt the chase camera up toward the horizon. 0 = look down at the ground; higher lifts the view to reveal the horizon and Earth (past 1 over-tilts).",get:()=>T.horizon,set:S=>T.horizon=S}),d({mid:di.lag,label:"Follow lag",min:0,max:1,step:.01,fmt:S=>`${S.toFixed(2)}s`,hint:"How long the chase camera takes to catch up with the rover. 0 = rigidly locked; higher = a floatier, cinematic follow that shows speed.",get:()=>T.lag,set:S=>T.lag=S});const F=document.createElement("div");F.className="btns";const k=(S,Q)=>{const W=document.createElement("button");return W.textContent=S,W.addEventListener("click",Q),W},X=k("View: Chase",()=>{T.overhead=!T.overhead,X.textContent=T.overhead?"View: Overhead":"View: Chase",n.save()});X.textContent=T.overhead?"View: Overhead":"View: Chase",F.append(X,k("New Game",()=>{n.newGame(),E()}),k("Reset Day",()=>{n.rebuildDay(),E()}),k("Send saved runs",()=>{n.sendAllRuns()||alert("No runs saved in this browser yet.")}),k("Close",()=>{r.style.display="none"})),r.appendChild(F),i.addEventListener("click",()=>{const S=r.style.display!=="block";r.style.display=S?"block":"none",S&&E()}),E()}function lS(n,e,t){const i=Math.max(1,t.stickRadius),r=p=>Math.max(0,Math.min(1,p)),s=i*r(t.throttleDead),a=Math.max(1,i-s),o=r((-e-s)/a),l=r((e-s)/a),c=Math.tan(Math.max(0,Math.min(80,t.forwardCone))*Math.PI/180),u=Math.min(i*.95,Math.max(i*r(t.steerDead),Math.max(0,-e)*c)),f=Math.abs(n);let h=0;if(f>u){const p=r((f-u)/Math.max(1,i-u));h=Math.sign(n)*Math.pow(p,Math.max(.1,t.steerCurve))}return{steer:h,throttle:o,reverse:l>0&&o===0}}const Vh="mm3d-config-v1";function cS(){try{const n=window.localStorage.getItem(Vh),e=n?JSON.parse(n):{};return{loop:{...Wt,...e.loop??{}},road:{...pt,...e.road??{}},tuning:e.tuning??{},cam:{...di,...e.cam??{}},terrain:{...vt,...e.terrain??{}},controls:{...hi,...e.controls??{}}}}catch{return{loop:{...Wt},road:{...pt},tuning:{},cam:{...di},terrain:{...vt},controls:{...hi}}}}const gr=cS(),Ot=gr.cam,ut=gr.terrain,ns=gr.controls;function Wh(){try{window.localStorage.setItem(Vh,JSON.stringify({loop:Ge.config,road:Be.config,tuning:Ge.tuningOverrides,cam:Ot,terrain:ut,controls:ns}))}catch{}}let tt=1040,nt=720;const Xh=1.5,dS=2600;let tn=Xh,ia=!1,gd=0;const hS=33,Di="#0e1520",Be=new Dv(gr.road),Ge=new Hv(gr.loop),Fl={reclaimProtectLoop:!0,droneTetherRange:560,reclaimAimBias:3,ribbonEconomy:!0,trackSpine:!0,railTricklePerSecond:.3,railTricklePerSlurp:2,railCapacityGrowthPerMinute:3,railCapacityMax:72,fabricatingSpeed:130,startingSolarSeconds:75};Ge.tuningOverrides={...Fl,...gr.tuning};let $,ll=!1,dr=0,Wr=kh(0);const qh="Levi-Anthony/moon-miner";function hr(){try{return window.localStorage}catch{return}}const uS=50,fS=5;function cl(){var e;const n=((e=$.arena.extraction)==null?void 0:e.oreRequired)??$.targetOre;return Math.max(0,$.rover.ore-n)}function Xr(){return dr/uS+cl()*fS}const pS=document.getElementById("app3d"),Bn=new K_({antialias:!0});Bn.setPixelRatio(Math.min(window.devicePixelRatio,2));Bn.setSize(window.innerWidth,window.innerHeight);Bn.shadowMap.enabled=!0;Bn.shadowMap.type=Ir;pS.appendChild(Bn.domElement);const Mt=new Ef;Mt.background=new Le(197642);Mt.fog=new ca(197642,520,1500);const Xt=new pn(55,window.innerWidth/window.innerHeight,1,4e3),dl=new Yf(2766160,.5);Mt.add(dl);const Rt=new ah(12570879,.7);Rt.position.set(-300,500,-260);Rt.castShadow=!0;Rt.shadow.mapSize.set(2048,2048);Rt.shadow.normalBias=.6;Rt.shadow.camera.near=1;Rt.shadow.camera.far=3e3;const xa=520;Rt.shadow.camera.left=-xa;Rt.shadow.camera.right=xa;Rt.shadow.camera.top=xa;Rt.shadow.camera.bottom=-xa;Rt.shadow.bias=-.002;Mt.add(Rt);Mt.add(Rt.target);const Ol=new ah(8382975,.9);Ol.position.set(220,60,420);Mt.add(Ol);const _d=new Le(12570879),xd=new Le(16751188),mS=new Le(2766160),gS=new Le(1709350),Yh=1;let hl=Ul;const _S=3200,qr=(()=>{const n=document.createElement("canvas");n.width=n.height=128;const e=n.getContext("2d"),t=e.createRadialGradient(64,64,0,64,64,64);t.addColorStop(0,"rgba(255,255,255,1)"),t.addColorStop(.18,"rgba(255,255,255,1)"),t.addColorStop(.3,"rgba(255,255,255,0.35)"),t.addColorStop(1,"rgba(255,255,255,0)"),e.fillStyle=t,e.fillRect(0,0,128,128);const i=new da(n);i.colorSpace=Qt;const r=new Zd({map:i,blending:Xs,depthWrite:!1,fog:!1,transparent:!0}),s=new Lf(r);return s.scale.setScalar(420),s})();Mt.add(qr);const vd=new I;function xS(n){const e=Kv(n,{startElev:ut.sunHigh,endElev:ut.sunLow,sweep:ut.sunSweep}),t=$.rover.x-tt/2,i=$.rover.y-nt/2;Rt.position.set(t+e.offset.x,e.offset.y,i+e.offset.z),Rt.target.position.set(t,0,i),Rt.target.updateMatrixWorld(),Rt.color.copy(_d).lerp(xd,e.dusk),Rt.intensity=e.intensity*Math.max(0,ut.sunGain),Qh.value=Math.max(0,Math.min(1,ut.roadShadow))*Math.min(1,e.intensity/.85)*(Rt.intensity>0?1:0),vd.set(e.offset.x,e.offset.y,e.offset.z).normalize(),qr.position.copy(Xt.position).addScaledVector(vd,_S),qr.material.color.copy(_d).lerp(xd,e.dusk).multiplyScalar(.6+.8*e.intensity),dl.color.copy(mS).lerp(gS,e.dusk),dl.intensity=e.ambientIntensity*Math.max(0,ut.ambient),Math.abs(e.bearing-hl)>.12&&(hl=e.bearing,Zn={...Zn,sun:e.bearing},_r(Be.edgesForPaint()))}function vS(){const n=Math.max(1,$.solarWindowSeconds);return 1-Math.max(0,Math.min(1,$.solarSeconds/n))}const ho=3e3,SS=.035,$h=new Le(10467032),Kh=new Ct,Zh=900,Vs=new Float32Array(Zh*3);for(let n=0;n<Zh;n+=1){const e=Math.sin(SS),t=Math.asin(e+Math.random()*(1-e)),i=Math.random()*Math.PI*2;Vs[n*3]=ho*Math.cos(t)*Math.cos(i),Vs[n*3+1]=ho*Math.sin(t),Vs[n*3+2]=ho*Math.cos(t)*Math.sin(i)}Kh.setAttribute("position",new Tn(Vs,3));const Jh=new jd({color:$h,size:3,sizeAttenuation:!1,fog:!1,depthWrite:!1}),ur=new Of(Kh,Jh);ur.frustumCulled=!1;ur.renderOrder=-1;Mt.add(ur);const is=new tx(Bn);is.addPass(new nx(Mt,Xt));const ra=new cr(new Ae(window.innerWidth,window.innerHeight),.55,.5,.72);is.addPass(ra);is.setSize(window.innerWidth,window.innerHeight);const gn=document.createElement("canvas");gn.width=Math.round(tt*tn);gn.height=Math.round(nt*tn);const on=gn.getContext("2d");on.fillStyle=Di;on.fillRect(0,0,gn.width,gn.height);const va=new da(gn);va.colorSpace=Qt;const Yr=.5,_n=document.createElement("canvas");_n.width=Math.max(1,Math.round(tt*tn*Yr));_n.height=Math.max(1,Math.round(nt*tn*Yr));const Fr=_n.getContext("2d");Fr.fillStyle=Di;Fr.fillRect(0,0,_n.width,_n.height);const Bl=new da(_n);Bl.colorSpace=Qt;const kl=new ih({map:Bl,color:new Le().setScalar(ut.daylight),emissiveMap:va,emissive:16777215,emissiveIntensity:Yh}),Qh={value:0};kl.onBeforeCompile=n=>{n.uniforms.uRoadShadow=Qh,n.fragmentShader=n.fragmentShader.replace("#include <common>",`#include <common>
uniform float uRoadShadow;`).replace("#include <lights_fragment_begin>",`#include <lights_fragment_begin>
#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
  // Shadow-casting lights sort first, so shadow 0 is the sun (the rim casts none).
  float sunShadow = receiveShadow ? getShadow( directionalShadowMap[ 0 ], directionalLightShadows[ 0 ].shadowMapSize, directionalLightShadows[ 0 ].shadowIntensity, directionalLightShadows[ 0 ].shadowBias, directionalLightShadows[ 0 ].shadowRadius, vDirectionalShadowCoord[ 0 ] ) : 1.0;
  totalEmissiveRadiance *= mix( 1.0, sunShadow, uRoadShadow );
#endif`)};const $r=new bt(new Fi(tt,nt),kl);$r.rotation.x=-Math.PI/2;$r.receiveShadow=!0;Mt.add($r);const Li=new bt(new Oi(500,12e3,96),new ih({color:new Le(Di).multiplyScalar(ut.daylight),emissive:new Le(Di),emissiveIntensity:Yh,side:ln})),MS=Li.material;Li.rotation.x=-Math.PI/2;Li.position.y=-.3;Mt.add(Li);const zl=new bt(new Cl(340,40,40),new Qr({color:2841750,emissive:1785702,emissiveIntensity:1.15,roughness:.85,metalness:0}));zl.material.fog=!1;zl.position.set(-1500,1200,-3200);Mt.add(zl);function jh(){const n=Math.max(tt,nt),e=Math.min(tt,nt)*.42,t=Math.max(12e3,n*6);Li.geometry.dispose(),Li.geometry=new Oi(e,t,96),Xt.far=Math.max(6e3,n*3.4),Xt.updateProjectionMatrix(),Mt.fog instanceof ca&&(Mt.fog.near=n*1.3,Mt.fog.far=Xt.far*.92)}jh();function yS(n){let e=2166136261;for(let t=0;t<n.length;t+=1)e=Math.imul(e^n.charCodeAt(t),16777619);return e>>>0}function bS(n){let e=n>>>0;return()=>{e=e+1831565813|0;let t=Math.imul(e^e>>>15,1|e);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}function eu(n){if(!n)return[];const e=[{x:n.arena.start.x,y:n.arena.start.y,r:160}];n.arena.extraction&&e.push({x:n.arena.extraction.x,y:n.arena.extraction.y,r:n.arena.extraction.radius+140});for(const t of n.fertileZones)e.push({x:t.x,y:t.y,r:t.radius+70});return e}function Gl(n,e=[]){const t=bS(yS(`${n}:terrain-v1`)),i=Math.max(0,ut.craterDensity),r=Math.max(0,ut.craterSize??1),s=Math.max(0,ut.craterSpread??1),a=ut.craterBlockSize??vt.craterBlockSize,o=[],l=Math.max(.25,tt*nt/(1040*720)),c=Math.round((10+t()*10)*i*l);for(let g=0;g<c;g+=1){const M=()=>({x:Math.max(0,Math.min(tt,tt/2+(t()-.5)*tt*s)),y:Math.max(0,Math.min(nt,nt/2+(t()-.5)*nt*s))});let{x:m,y:d}=M();const E=(14+t()*t()*84)*r,A=E>=a;let v=!A||e.every(w=>Math.hypot(m-w.x,d-w.y)>w.r+E);for(let w=0;!v&&w<8;w+=1)({x:m,y:d}=M()),v=e.every(b=>Math.hypot(m-b.x,d-b.y)>b.r+E);o.push({x:m,y:d,r:E,block:A&&v})}const u=[],f=4+Math.floor(t()*4);for(let g=0;g<f;g+=1)u.push({x:t()*tt,y:t()*nt,r:150+t()*260,light:t()-.5});const h=[],p=Math.round((2+t()*3)*Math.min(1.5,i));for(let g=0;g<p;g+=1){const M=[];let m=t()*tt,d=t()*nt,E=t()*Math.PI*2;const A=8+Math.floor(t()*12);for(let v=0;v<A;v+=1){M.push({x:m,y:d}),E+=(t()-.5)*.9;const w=26+t()*46;m+=Math.cos(E)*w,d+=Math.sin(E)*w}h.push(M)}return{craters:o,rilles:h,blotches:u,sun:-2.3}}let Zn=Gl("init");function ES(){return Wv($.rover,Zn.craters)}function Sd(n,e=on,t=tn){for(const i of n.blotches){const r=e.createRadialGradient(i.x*t,i.y*t,0,i.x*t,i.y*t,i.r*t),s=i.light>0?"38,50,72":"5,8,15";r.addColorStop(0,`rgba(${s},${.06+Math.abs(i.light)*.16})`),r.addColorStop(1,`rgba(${s},0)`),e.fillStyle=r,e.beginPath(),e.arc(i.x*t,i.y*t,i.r*t,0,Math.PI*2),e.fill()}e.lineCap="round",e.lineJoin="round";for(const i of n.rilles){e.strokeStyle="rgba(3,5,10,0.75)",e.lineWidth=2.4*t,e.beginPath(),e.moveTo(i[0].x*t,i[0].y*t);for(let r=1;r<i.length;r+=1)e.lineTo(i[r].x*t,i[r].y*t);e.stroke()}for(const i of n.craters){const r=i.x*t,s=i.y*t,a=i.r*t,o=e.createRadialGradient(r,s,a*.1,r,s,a);o.addColorStop(0,"rgba(4,7,13,0.62)"),o.addColorStop(.7,"rgba(7,11,19,0.34)"),o.addColorStop(1,"rgba(20,28,42,0)"),e.fillStyle=o,e.beginPath(),e.arc(r,s,a,0,Math.PI*2),e.fill(),e.lineWidth=a*.2,e.strokeStyle="rgba(2,4,8,0.7)",e.beginPath(),e.arc(r,s,a*.86,n.sun+.5,n.sun+Math.PI*2-.5),e.stroke(),e.lineWidth=a*.1,e.strokeStyle="rgba(90,105,130,0.22)",e.beginPath(),e.arc(r,s,a*.95,n.sun-.9,n.sun+.9),e.stroke(),i.block&&(e.lineWidth=Math.max(3*t,a*.09),e.strokeStyle="rgba(130,145,172,0.55)",e.beginPath(),e.arc(r,s,a*.9,0,Math.PI*2),e.stroke(),e.strokeStyle="rgba(190,205,230,0.75)",e.beginPath(),e.arc(r,s,a*.9,n.sun-1.3,n.sun+1.3),e.stroke())}}const wS=150,TS=104;function tu(n){const e=new Fi(tt,nt,wS,TS),t=e.attributes.position,i=Math.max(0,ut.relief);let r=0;for(let s=0;s<t.count;s+=1){const a=t.getX(s)+tt/2,o=nt/2-t.getY(s);let l=Math.sin(a*.011+1.3)*2.4+Math.sin(o*.013-.7)*2.2+Math.sin((a+o)*.006)*1.6;l-=3;for(const u of n.craters){const f=Math.hypot(a-u.x,o-u.y);f<u.r?l-=Math.cos(f/u.r*(Math.PI/2))*u.r*(u.block?.28:.16):u.block&&f<u.r*1.25&&(l+=Math.sin((f-u.r)/(u.r*.25)*Math.PI)*u.r*.05)}const c=Math.min(4,l)*i;c<r&&(r=c),t.setZ(s,c)}Li.position.y=Math.min(-.3,r-1.5),t.needsUpdate=!0,e.computeVertexNormals(),$r.geometry.dispose(),$r.geometry=e}const AS=[55,242,216];function RS(){const n=Math.max(0,Math.min(1,ut.roadBrightness));return`rgb(${AS.map(e=>Math.round(e*n)).join(",")})`}function CS(n,e,t,i){on.strokeStyle=RS(),on.lineWidth=Be.halfWidth()*2*tn,on.lineCap="round",on.lineJoin="round",on.beginPath(),on.moveTo(n*tn,e*tn),on.lineTo(t*tn,i*tn),on.stroke(),ia=!0}function nu(n){CS(n.ax,n.ay,n.bx,n.by)}const sa=new Ti;Mt.add(sa);const Lr=new Ti;Mt.add(Lr);function PS(){const n=document.createElement("canvas");n.width=n.height=128;const e=n.getContext("2d"),t=e.createRadialGradient(64,64,0,64,64,64);return t.addColorStop(0,"rgba(255,255,255,0.95)"),t.addColorStop(.6,"rgba(255,255,255,0.8)"),t.addColorStop(.82,"rgba(255,255,255,0.85)"),t.addColorStop(.9,"rgba(255,255,255,1)"),t.addColorStop(.94,"rgba(255,255,255,0)"),t.addColorStop(1,"rgba(255,255,255,0)"),e.fillStyle=t,e.fillRect(0,0,128,128),new da(n)}const DS=PS();function Md(n){for(const e of n.children){const t=e;t.geometry.dispose(),t.material.dispose()}n.clear()}function LS(){Md(sa);for(const n of $.fertileZones){const e=Math.max(40,n.radius*1.05),t=new bt(new Fi(e*2,e*2),new mi({map:DS,color:16756768,transparent:!0,opacity:.95,depthWrite:!1}));t.rotation.x=-Math.PI/2,t.position.set(n.x-tt/2,4,n.y-nt/2),t.userData.zoneId=n.id,sa.add(t)}if(Md(Lr),$.arena.extraction){const n=$.arena.extraction,e=n.x-tt/2,t=n.y-nt/2,i=new bt(new wl(n.radius,40),new mi({color:1707818,transparent:!0,opacity:.9}));i.rotation.x=-Math.PI/2,i.position.set(e,3.5,t),Lr.add(i);const r=new bt(new Oi(n.radius-6,n.radius,40),new mi({color:12610815,transparent:!0,opacity:.95,side:ln}));r.rotation.x=-Math.PI/2,r.position.set(e,4,t),Lr.add(r);const s=new bt(new Tl(3,3,150,8),new Qr({color:12610815,emissive:11025407,emissiveIntensity:1.4,roughness:.5}));s.position.set(e,75,t),s.castShadow=!0,Lr.add(s)}}function _r(n){on.fillStyle=Di,on.fillRect(0,0,gn.width,gn.height),Sd(Zn);for(const e of n)nu(e);va.needsUpdate=!0,ia=!1,Fr.fillStyle=Di,Fr.fillRect(0,0,_n.width,_n.height),Sd(Zn,Fr,tn*Yr),Bl.needsUpdate=!0}function aa(n){$=n.state,tt=$.width,nt=$.height,tn=Math.min(Xh,dS/Math.max(tt,nt));const e=Math.max(1,Math.round(tt*tn)),t=Math.max(1,Math.round(nt*tn));(gn.width!==e||gn.height!==t)&&(gn.width=e,gn.height=t);const i=Math.max(1,Math.round(e*Yr)),r=Math.max(1,Math.round(t*Yr));if((_n.width!==i||_n.height!==r)&&(_n.width=i,_n.height=r),jh(),hl=Ul,!Ge.level)$.solarWindowSeconds=$.tuning.startingSolarSeconds,$.solarSeconds=$.tuning.startingSolarSeconds;else{const s=Ge.level;xn={text:`Level ${s.index+1} · ${s.spec.name} — ${s.spec.teaches}`,until:performance.now()+9e3}}Be.seed(n.road),Be.boost=0,Be.locked=!1,Zn=Gl($.seed,eu($)),tu(Zn),_r(Be.edgesForPaint()),LS(),ll=!1,dr=0,Wr=kh($.nanobots)}const Kr=new Ti,Hl=new bt(new Ui(40,18,54),new Qr({color:13803588,roughness:.7}));Hl.position.y=12;Hl.castShadow=!0;Kr.add(Hl);const Vl=new bt(new Ui(20,12,14),new Qr({color:9428213,emissive:3126998,emissiveIntensity:1.1,roughness:.5}));Vl.position.set(0,18,22);Vl.castShadow=!0;Kr.add(Vl);Mt.add(Kr);const dn=new bt(new Rl(12),new Qr({color:7927775,emissive:1863516,roughness:.4}));dn.visible=!1;dn.castShadow=!0;Mt.add(dn);const ui=new Ff(new Ct().setFromPoints([new I,new I]),new Qd({color:5887684,transparent:!0,opacity:.5}));ui.visible=!1;Mt.add(ui);const fi=new bt(new Oi(.86,1,56),new mi({color:16738893,transparent:!0,opacity:.8,depthTest:!1,depthWrite:!1,side:ln,fog:!1}));fi.rotation.x=-Math.PI/2;fi.renderOrder=5;fi.visible=!1;Mt.add(fi);let uo=0,Wn=null,fo=0;const Ws=[];function IS(n,e,t,i,r,s){const a=new bt(new Oi(i,i+4,32),new mi({color:t,transparent:!0,opacity:.9,side:ln}));a.rotation.x=-Math.PI/2,a.position.set(n-tt/2,3,e-nt/2),Mt.add(a),Ws.push({mesh:a,born:performance.now(),ttl:s,grow:r})}function NS(n){for(let e=Ws.length-1;e>=0;e-=1){const t=Ws[e],i=(n-t.born)/t.ttl;if(i>=1){Mt.remove(t.mesh),t.mesh.geometry.dispose(),t.mesh.material.dispose(),Ws.splice(e,1);continue}t.mesh.scale.setScalar(1+i*t.grow),t.mesh.material.opacity=.9*(1-i)}}const bn=new Set;window.addEventListener("keydown",n=>{const e=n.key.toLowerCase();["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright"].includes(e)&&n.preventDefault(),bn.add(e)});window.addEventListener("keyup",n=>bn.delete(n.key.toLowerCase()));const oi=document.getElementById("stick"),iu=oi.querySelector(".knob");function ru(){return Math.max(1,ns.stickRadius)}const yt={active:!1,id:-1,ox:0,oy:0,dx:0,dy:0},Ii=new Map;let Or=0;const su=()=>{const[n,e]=[...Ii.values()];return Math.hypot(n.x-e.x,n.y-e.y)};function au(){yt.active=!1,yt.id=-1,yt.dx=0,yt.dy=0,oi.style.display="none"}function US(n){if(Ii.set(n.pointerId,{x:n.clientX,y:n.clientY}),Ii.size>=2){au(),Or=su();return}yt.active=!0,yt.id=n.pointerId,yt.ox=n.clientX,yt.oy=n.clientY,yt.dx=0,yt.dy=0;const e=ru();oi.style.width=oi.style.height=`${e*2}px`,oi.style.margin=`${-e}px 0 0 ${-e}px`,oi.style.left=`${n.clientX}px`,oi.style.top=`${n.clientY}px`,oi.style.display="block",iu.style.transform="translate(0px, 0px)"}function FS(n){const e=Ii.get(n.pointerId);if(e&&(e.x=n.clientX,e.y=n.clientY),Ii.size>=2){const s=su();Or>0&&s>0&&cu(Or/s),Or=s;return}if(!yt.active||n.pointerId!==yt.id)return;yt.dx=n.clientX-yt.ox,yt.dy=n.clientY-yt.oy;const t=ru(),i=Math.max(-t,Math.min(t,yt.dx)),r=Math.max(-t,Math.min(t,yt.dy));iu.style.transform=`translate(${i}px, ${r}px)`}function ou(n){Ii.delete(n.pointerId),Ii.size<2&&(Or=0),n.pointerId===yt.id&&au()}Bn.domElement.addEventListener("pointerdown",US);Bn.domElement.addEventListener("pointermove",FS);window.addEventListener("pointerup",ou);window.addEventListener("pointercancel",ou);function OS(){const n=bn.has("w")||bn.has("arrowup"),e=bn.has("s")||bn.has("arrowdown"),t=bn.has("a")||bn.has("arrowleft"),i=bn.has("d")||bn.has("arrowright");let r=0;t&&(r-=1),i&&(r+=1);let s=n?1:0,a=e&&!n;if(yt.active){const l=lS(yt.dx,yt.dy,ns);l.steer!==0&&(r=l.steer),l.throttle>0&&(s=l.throttle),a=l.reverse}const o=s>0;return{steer:r,throttle:s,reverseIntent:a&&!o,driveIntent:o,pivotIntent:!o&&!a&&r!==0}}const yd=new I(0,220,320),bd=new I;let Ai=0,lu=!1;function BS(n){const e=$.rover.x-tt/2,t=$.rover.y-nt/2,i=Math.max(0,Ot.lag??di.lag),r=i<=0?1:1-Math.exp(-n/i);let s,a;if(Ot.overhead)s=new I(e,Ot.height+Ot.dist,t+.001),a=new I(e,0,t);else{const o=Math.cos($.rover.heading),l=Math.sin($.rover.heading);s=new I(e-o*Ot.dist,Ot.height,t-l*Ot.dist);const c=Ot.horizon??0,u=120+c*360,f=8+c*Ot.height*.95;a=new I(e+o*u,f,t+l*u)}if(yd.lerp(s,r),Xt.position.copy(yd),Ai>.001){const o=Ai*Ai*6;Xt.position.x+=(Math.random()-.5)*o,Xt.position.y+=(Math.random()-.5)*o*.6,Xt.position.z+=(Math.random()-.5)*o}bd.lerp(a,r),Xt.lookAt(bd),Xt.fov!==Ot.fov&&(Xt.fov=Ot.fov,Xt.updateProjectionMatrix())}function cu(n){const e=520*Math.max(1,Ge.config.arenaScale);Ot.dist=Math.max(80,Math.min(e,Ot.dist*n)),Ot.height=Math.max(60,Math.min(e,Ot.height*n)),Wh()}Bn.domElement.addEventListener("wheel",n=>{n.preventDefault(),cu(n.deltaY>0?1.08:.925)},{passive:!1});const Vt=n=>document.getElementById(n),_t={nano:Vt("hud-nano"),nanoBar:Vt("hud-nano-bar"),ore:Vt("hud-ore"),oreBar:Vt("hud-ore-bar"),sun:Vt("hud-sun"),sunBar:Vt("hud-sun-bar"),day:Vt("hud-day"),bonus:Vt("hud-bonus"),mode:Vt("hud-mode"),line:Vt("line"),banner:Vt("banner"),bannerTitle:Vt("banner-title"),bannerBody:Vt("banner-body")},kS={fabricating:"Building",prepared:"Prepared",crawl:"Crawl"},du=Vt("hud");function Wl(){_t.line.style.top=`${Math.round(du.getBoundingClientRect().bottom)+6}px`}Wl();new ResizeObserver(Wl).observe(du);window.addEventListener("resize",Wl);function zS(){var i;const n=((i=$.arena.extraction)==null?void 0:i.oreRequired)??$.targetOre;_t.nano.textContent=`${$.nanobots.toFixed(1)}/${Math.floor($.maxNanobots)}`,_t.nanoBar.style.width=`${Math.min(100,$.nanobots/$.maxNanobots*100)}%`,_t.nanoBar.style.background=$.nanobots/$.maxNanobots<.18?"#ff765f":"#78f7df",_t.ore.textContent=`${$.rover.ore.toFixed(1)}/${n}`,_t.oreBar.style.width=`${Math.min(100,$.rover.ore/Math.max(1,n)*100)}%`,_t.sun.textContent=`${Math.ceil($.solarSeconds)}s`,_t.sunBar.style.width=`${Math.min(100,$.solarSeconds/Math.max(1,$.solarWindowSeconds)*100)}%`,_t.sunBar.style.background=$.solarSeconds/$.solarWindowSeconds<.25?"#ffb066":"#8fb2ff",_t.day.previousElementSibling.textContent=Ge.level?"LEVEL":"SHIFT",_t.day.textContent=Ge.level?Ge.level.index<bi.length?`${Ge.level.index+1}/${bi.length}`:`${Ge.level.index+1}`:`D${Ge.dayInShiftOf()}/${Ge.config.daysPerShift} · S${Ge.shiftOfDay()}/${Ge.config.shiftsPerGame}`,_t.bonus.textContent=`+${Math.floor(Xr())}`;const e=Be.locked;_t.mode.textContent=$.arms.mining>0?"Mining":lu?"Emergency ⚠":$.speedState==="crawl"?"Crawl":e&&Be.boost>.5?Be.slurpArmed()?"Rail ⚡":"Rail":kS[$.speedState]??$.speedState;const t=xn&&performance.now()<xn.until;_t.line.textContent=t?xn.text:$.phase==="playing"?Lx($).objective:"",Br.disabled=$.phase!=="playing"||($.tuning.ribbonEconomy?Yn!==null:$.drone.status!=="ready")}const Ed=_t.banner.querySelector(".cta");function GS(){const n=$.phase==="won",e=Ge.gameComplete();_t.banner.className=n?"win":"lose",_t.banner.style.display="flex",_t.bannerTitle.textContent=e?"GAME OVER":n?"EXTRACTION REACHED":"RUN OVER";const t=Ge.level;if(t){const r=Ge.lastLevelCleared;_t.banner.className=r?"win":"lose",_t.bannerTitle.textContent=r?`LEVEL ${t.index+1} CLEARED`:n?"UNDER QUOTA":"RUN OVER";const s=t.budget,a=`par ${Math.round(s.parSeconds)}s · ${s.par.seams.length} seam${s.par.seams.length===1?"":"s"}`,o=r?`  ·  bonus +${Math.floor(Xr())} (${cl().toFixed(1)} surplus ore, ${Math.round(dr)} hands-off rail)`:"";_t.bannerBody.textContent=`${$.message}  ·  ${a}${o}`;const l=Nl(Ge.levelIndex);Ed.textContent=r?`Tap for level ${Ge.levelIndex+1}: ${l.name}`:`Tap to retry level ${t.index+1}`;return}const i=n?`  ·  bonus +${Math.floor(Xr())} (${cl().toFixed(1)} surplus ore, ${Math.round(dr)} hands-off rail) · ${Math.floor(Ge.bankedBonus)} total`:"";_t.bannerBody.textContent=`${$.message}  ·  ${Ge.bankedOre.toFixed(0)} ore banked${i}`,Ed.textContent=e?"Tap for a new game":"Tap for the next day"}function hu(){$.phase!=="playing"&&(Ge.advance(),aa(Ge.buildWorld()),_t.banner.style.display="none")}window.addEventListener("keydown",n=>{n.key.toLowerCase()==="r"&&hu()});_t.banner.addEventListener("pointerdown",hu);const fr=Vt("send-runs"),uu=Vt("runs-note");let En=[];function HS(n){const e=nS({state:$,stats:Wr,build:"5599a46",mode:n?"levels":"sandbox",level:n?{index:n.index,name:n.spec.name,startStock:n.budget.startStock,parSeconds:n.budget.parSeconds,parSeams:n.budget.par.seams.length}:null,cleared:Ge.lastLevelCleared,day:Ge.dayNumber,bonus:Xr(),slide:dr,device:{w:window.innerWidth,h:window.innerHeight,touch:navigator.maxTouchPoints>0},knobs:tS({loop:{current:Ge.config,defaults:Wt},road:{current:Be.config,defaults:pt},tuning:{current:Ge.tuningOverrides,defaults:Fl},terrain:{current:ut,defaults:vt},controls:{current:ns,defaults:hi}})}),t=iS(_a(hr()),e),i=zh(hr(),t);En=Gh(t),i||(En=[e]);const r=En.length;uu.textContent=i?`${r} run${r===1?"":"s"} not yet sent. Opens GitHub; press Submit there.`:"This browser can't save run history; send this run now or it is lost.",fr.textContent=r===1?"Send run data":`Send ${r} runs`,fr.disabled=!1}function fu(){if(!En.length)return;const{url:n,count:e}=Hh(qh,En),t=new Set(En.slice(-e).map(a=>a.id)),i=window.open(n,"_blank");i?i.opener=null:window.location.href=n;const r=_a(hr()).map(a=>t.has(a.id)?{...a,sent:!0}:a);zh(hr(),r),En=Gh(r);const s=En.length;uu.textContent=s?`Opened GitHub with the newest ${e}; press Submit there. ${s} older run${s===1?"":"s"} still to send.`:"Opened GitHub. Press Submit there to store it.",fr.disabled=s===0,fr.textContent=s?`Send ${s} more`:"Opened on GitHub"}fr.addEventListener("pointerdown",n=>n.stopPropagation());fr.addEventListener("click",n=>{n.stopPropagation(),fu()});let xn=null;const Br=document.getElementById("launch");let Yn=null;function VS(){if(Yn){xn={text:"Drone is already out.",until:performance.now()+1500};return}const n=$.arena.extraction??$.arena.start,e=Wn?Be.eraserPlan($.rover,$.rover.heading,n,$.tuning.droneTetherRange):null;Wn=null;const t=e??Be.reclaimPlan(n,$.tuning.droneTetherRange,Be.config.reclaimBite,{heading:$.rover.heading,bias:$.tuning.reclaimAimBias});if(!t){xn={text:"No road within tether range to reclaim.",until:performance.now()+1800};return}const i=$.tuning.fabricateCostPerSecond/Math.max(1,$.tuning.fabricatingSpeed);Yn={phase:"out",pos:{x:n.x,y:n.y},home:{x:n.x,y:n.y},plan:t,refund:t.length*i,lifted:!1},xn={text:e?`Drone erasing ${t.length.toFixed(0)} of road ahead…`:`Drone reclaiming ${t.length.toFixed(0)} of road…`,until:performance.now()+2e3}}function WS(n){if(!Yn){dn.visible=!1,ui.visible=!1;return}const e=Yn,t=e.phase==="out"?e.plan.point:e.home,i=t.x-e.pos.x,r=t.y-e.pos.y,s=Math.hypot(i,r),a=$.tuning.droneSpeed*n;if(s<=a||s===0)if(e.pos.x=t.x,e.pos.y=t.y,e.phase==="out")e.lifted||(Be.removeSegments(e.plan.indices),_r(Be.edgesForPaint()),e.lifted=!0),e.phase="back";else{$.nanobots=Math.min($.maxNanobots,$.nanobots+e.refund),xn={text:`Drone delivered ${e.refund.toFixed(1)} nanobots.`,until:performance.now()+1800},Yn=null,dn.visible=!1,ui.visible=!1;return}else e.pos.x+=i/s*a,e.pos.y+=r/s*a;dn.visible=!0,ui.visible=!0,dn.position.set(e.pos.x-tt/2,60,e.pos.y-nt/2),dn.rotation.y+=n*3,ui.geometry.setFromPoints([new I(e.home.x-tt/2,8,e.home.y-nt/2),new I(e.pos.x-tt/2,60,e.pos.y-nt/2)])}function XS(n,e){if(uo=e||$.rover.speed>1?0:uo+n,!($.phase==="playing"&&!Yn&&Be.config.eraserReach>0&&uo>=Be.config.eraserAimDelay))Wn=null,fo=0;else if((fo-=n)<=0){fo=.1;const r=$.arena.extraction??$.arena.start;Wn=Be.eraserPlan($.rover,$.rover.heading,r,$.tuning.droneTetherRange)}fi.visible=!!Wn,Wn&&(fi.position.set(Wn.point.x-tt/2,6,Wn.point.y-nt/2),fi.scale.setScalar(Math.max(1,Be.config.eraserRadius)),fi.material.opacity=.55+.3*Math.sin(performance.now()/160));const i=Wn?"Erase":"Launch";Br.firstChild&&Br.firstChild.textContent!==i&&(Br.firstChild.textContent=i)}function pu(){if($.phase!=="playing")return;if($.tuning.ribbonEconomy){const t=Yn!==null;VS(),!t&&Yn!==null&&(Wr.droneLaunches+=1);return}const n=$.drone.status==="ready",e=Dx($);n&&e.state.drone.status!=="ready"&&(Wr.droneLaunches+=1),$=e.state,xn={text:e.message,until:performance.now()+2e3}}Br.addEventListener("pointerdown",n=>{n.preventDefault(),pu()});window.addEventListener("keydown",n=>{n.key===" "&&(n.preventDefault(),pu())});let wd=performance.now();function mu(n){const e=Math.min((n-wd)/1e3,.05);wd=n;const t=OS(),i=!!t.reverseIntent,r=!!($.tuning.trackSpine&&$.tuning.ribbonEconomy&&!i&&t.driveIntent&&$.speedState==="crawl"&&!Be.locked),s=r&&!Be.canCannibalise($);lu=r;let a=i?t:{...t,assistSteer:Be.locked?Be.carrySteer($,e,!0):0,roadRunway:Be.boost,onRoad:Be.locked};s&&(a={...a,throttle:0,driveIntent:!1},(!xn||performance.now()>xn.until)&&(xn={text:"Out of rail — mine or reclaim to move",until:performance.now()+1200}));const o=$.rover.x,l=$.rover.y;if($=Px($,a,e),ES(),t.steer===0&&!i&&Be.locked&&Be.boost>.5&&(dr+=Math.hypot($.rover.x-o,$.rover.y-l)),eS(Wr,$,e,Math.hypot($.rover.x-o,$.rover.y-l)),r&&!s)Be.emergencyAdvance($).advanced&&_r(Be.edgesForPaint()),Ai=Math.min(1,Ai+e*.9);else{for(const p of Be.sample($))nu(p);Ai=Math.max(0,Ai-e*2.5)}ia&&n-gd>=hS&&(va.needsUpdate=!0,ia=!1,gd=n),Be.update($,t.steer,e,!i);const c=Be.locked;Be.updateCharge(e,c&&!!t.driveIntent&&Be.boost>=Be.config.slurpMinBoost);const u=t.driveIntent?Be.slurp($):null;u&&(Th($,$.tuning.railTricklePerSlurp),IS(u.x,u.y,16770666,20,6,700));const f=$.arms.mining>0?ma($,$.rover):void 0,h=.5+Math.sin(n/140)*.5;for(const p of sa.children){const g=p,M=$.fertileZones.find(E=>E.id===g.userData.zoneId);g.visible=!!M&&M.remaining>.01;const m=g.material,d=!!f&&(M==null?void 0:M.id)===f.id;m.opacity=d?.7+h*.55:.9,g.scale.setScalar(d?1+h*.14:1)}if($.tuning.ribbonEconomy)WS(e),XS(e,!!t.driveIntent||i);else if(dn.visible=$.drone.status!=="ready",ui.visible=dn.visible,dn.visible){dn.position.set($.drone.x-tt/2,60,$.drone.y-nt/2),dn.rotation.y+=e*3;const p=$.arena.extraction??$.arena.start;ui.geometry.setFromPoints([new I(p.x-tt/2,8,p.y-nt/2),new I($.drone.x-tt/2,60,$.drone.y-nt/2)])}if(NS(n),Kr.position.set($.rover.x-tt/2,0,$.rover.y-nt/2),Kr.rotation.y=-$.rover.heading+Math.PI/2,$.phase!=="playing"&&!ll){ll=!0;const p=Ge.level;Ge.endRun($,Be.serialize(),Xr()),HS(p),GS()}zS(),xS(vS()),BS(e),ur.position.copy(Xt.position),ur.rotation.y+=e*.005,is.render(),requestAnimationFrame(mu)}function qS(n){if(Ge.tuningOverrides={...Ge.tuningOverrides,...n},$.tuning=Il({...$.tuning,...n}),wh($),Ge.level){$.maxNanobots=Math.max($.maxNanobots,Ge.level.budget.startStock);return}$.solarWindowSeconds=$.tuning.startingSolarSeconds,$.solarSeconds=Math.min($.solarSeconds,$.solarWindowSeconds)}aa(Ge.buildWorld());function YS(){Zn=Gl($.seed,eu($)),tu(Zn),_r(Be.edgesForPaint())}function gu(n=!0){const e=Math.max(0,ut.daylight);kl.color.setScalar(e),MS.color.set(Di).multiplyScalar(e),Rt.castShadow=ut.shadows>=.5,Ol.intensity=Math.max(0,ut.rimLight),ra.strength=Math.max(0,ut.bloom),ra.threshold=Math.max(0,Math.min(1,ut.bloomThreshold)),Jh.color.copy($h).multiplyScalar(Math.max(0,ut.stars)),ur.visible=ut.stars>0,qr.scale.setScalar(Math.max(0,ut.sunDiskSize)),qr.visible=ut.sunDiskSize>0,n&&_r(Be.edgesForPaint())}gu(!1);oS({campaign:Ge,road:Be,cam:Ot,terrain:ut,controls:ns,tuningDefaults:Il(Fl),getState:()=>$,applyTuning:qS,rebuildDay:()=>aa(Ge.buildWorld()),newGame:()=>{Ge.newGame(),aa(Ge.buildWorld())},sendAllRuns:()=>{const n=_a(hr());return n.length?(En=n,fu(),n.length):0},applyTerrain:YS,applyLook:()=>gu(),save:Wh});requestAnimationFrame(mu);window.addEventListener("resize",()=>{Xt.aspect=window.innerWidth/window.innerHeight,Xt.updateProjectionMatrix(),Bn.setSize(window.innerWidth,window.innerHeight),is.setSize(window.innerWidth,window.innerHeight),ra.setSize(window.innerWidth,window.innerHeight)});window.__mm3d={getState:()=>$,road:Be,keys:bn,runs:()=>_a(hr()),pendingRuns:()=>En,runIssue:()=>Hh(qh,En)};
