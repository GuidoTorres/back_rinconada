"use strict";(self.webpackChunkrinconada=self.webpackChunkrinconada||[]).push([[233],{84664:function(n,a,o){o.r(a),o.d(a,{default:function(){return g}});var s=o(74165),i=o(15861),e=o(29439),l=o(300),r=o(87309),t=o(72791),d=o(57689),c=o(38411),u=o(49278),v=o(37530),m=(o.p,o(87690),o(80184)),g=function(){var n=(0,d.s0)(),a=(0,t.useContext)(c.s),o=a.createData,g=(a.setUser,a.setPermisos),f=(a.user,a.permisos,a.cargando),p=(a.setCargando,(0,t.useState)("")),h=(0,e.Z)(p,2),x=h[0],j=h[1],N=(0,t.useState)(""),S=(0,e.Z)(N,2),C=S[0],Z=S[1],k=function(){var n=(0,i.Z)((0,s.Z)().mark((function n(){var a,i,e,l,r,t,d,c,v,m,f;return(0,s.Z)().wrap((function(n){for(;;)switch(n.prev=n.next){case 0:return a={user:x,contrasenia:C},n.next=3,o(a,"auth");case 3:i=n.sent,console.log("===================================="),console.log(i.data),console.log("===================================="),200===i.status?(localStorage.setItem("user",JSON.stringify(null===(e=i.data)||void 0===e?void 0:e.nombre)),localStorage.setItem("cargo",JSON.stringify(null===(l=i.data)||void 0===l?void 0:l.cargo_id)),localStorage.setItem("permisos",JSON.stringify(null===i||void 0===i||null===(r=i.data)||void 0===r||null===(t=r.rol)||void 0===t?void 0:t.permisos[0])),localStorage.setItem("firma",JSON.stringify(null===(d=i.data)||void 0===d?void 0:d.foto)),g(null===i||void 0===i||null===(c=i.data)||void 0===c||null===(v=c.rol)||void 0===v?void 0:v.permisos),(0,u.q)(i.status,i.msg),b(null===i||void 0===i||null===(m=i.data)||void 0===m||null===(f=m.rol)||void 0===f?void 0:f.permisos)):(0,u.q)(i.status,i.msg);case 8:case"end":return n.stop()}}),n)})));return function(){return n.apply(this,arguments)}}(),b=function(a){var o,s,i,e,l;return!0===(null===(o=a[0])||void 0===o?void 0:o.administracion)?n("/administracion"):!0===(null===(s=a[0])||void 0===s?void 0:s.personal)?n("/personal"):!0===(null===(i=a[0])||void 0===i?void 0:i.planillas)?n("/planilla"):!0===(null===(e=a[0])||void 0===e?void 0:e.logistica)?n("/logistica"):!0===(null===(l=a[0])||void 0===l?void 0:l.finanzas)?n("/finanzas"):void 0};return(0,m.jsx)("div",{className:"fondo-login",children:(0,m.jsx)("div",{className:"login",children:(0,m.jsxs)("section",{className:"login-form",children:[(0,m.jsx)("div",{className:"logo",children:(0,m.jsx)("img",{src:v,alt:""})}),(0,m.jsxs)("div",{className:"inputs",children:[(0,m.jsxs)("div",{children:[(0,m.jsx)("label",{htmlFor:"",children:"Usuario"}),(0,m.jsx)(l.Z,{className:"input-form",name:"user",placeholder:"Usuario",onChange:function(n){return j(n.target.value)}})]}),(0,m.jsxs)("div",{children:[(0,m.jsx)("label",{htmlFor:"",children:"Contrase\xf1a"}),(0,m.jsx)(l.Z.Password,{className:"input-form",name:"contrasenia",placeholder:"Contrase\xf1a",onChange:function(n){return Z(n.target.value)}})]})]}),(0,m.jsx)(r.ZP,{onClick:k,loading:!!f,children:"Iniciar Sesi\xf3n"})]})})})}}}]);
//# sourceMappingURL=233.739ba067.chunk.js.map