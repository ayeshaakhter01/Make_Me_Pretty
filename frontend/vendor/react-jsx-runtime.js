var d=Object.create;var n=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var k=Object.getOwnPropertyNames;var T=Object.getPrototypeOf,a=Object.prototype.hasOwnProperty;var u=(e,r)=>()=>{try{return r||e((r={exports:{}}).exports,r),r.exports}catch(t){throw r=0,t}};var _=(e,r,t,o)=>{if(r&&typeof r=="object"||typeof r=="function")for(let s of k(r))!a.call(e,s)&&s!==t&&n(e,s,{get:()=>r[s],enumerable:!(o=v(r,s))||o.enumerable});return e};var c=(e,r,t)=>(t=e!=null?d(T(e)):{},_(r||!e||!e.__esModule?n(t,"default",{value:e,enumerable:!0}):t,e));var p=u(l=>{"use strict";var f=Symbol.for("react.transitional.element"),m=Symbol.for("react.fragment");function j(e,r,t){var o=null;if(t!==void 0&&(o=""+t),r.key!==void 0&&(o=""+r.key),"key"in r){t={};for(var s in r)s!=="key"&&(t[s]=r[s])}else t=r;return r=t.ref,{$$typeof:f,type:e,key:o,ref:r!==void 0?r:null,props:t}}l.Fragment=m;l.jsx=j;l.jsxs=j});var i=u((M,E)=>{"use strict";E.exports=p()});var x=c(i()),P=x.default,R=x.default.Fragment,q=x.default.jsx,C=x.default.jsxs;export{R as Fragment,P as default,q as jsx,C as jsxs};
/*! Bundled license information:

react/cjs/react-jsx-runtime.production.js:
  (**
   * @license React
   * react-jsx-runtime.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
