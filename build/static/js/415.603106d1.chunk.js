(self.webpackChunkrinconada=self.webpackChunkrinconada||[]).push([[415],{32163:function(e,t,a){"use strict";var n=a(49389),r=a(87309),o=a(72791),s=a(38411),i=a(71368),l=a(80184),c=n.Z.Search;t.Z=function(e){e.abrirModal;var t=e.registrar,a=(0,o.useContext)(i.c).setJuntarTeletrans,n=(0,o.useContext)(s.s).setFilterText;return(0,l.jsxs)("div",{className:"buscador-container",style:{display:"flex",alignItems:"center"},children:[(0,l.jsx)(c,{placeholder:"Ingresa un termino aqui...",onChange:function(e){return n(e.target.value)},style:{width:300}}),(0,l.jsx)("div",{style:{display:"flex",alignItems:"flex-end"},children:(0,l.jsx)("div",{children:!1!==t?(0,l.jsx)(r.ZP,{onClick:function(){a(!0)},style:{width:"150px"},children:"Juntar teletrans"}):""})})]})}},85530:function(e,t,a){"use strict";a.d(t,{Z:function(){return Z}});var n=a(74165),r=a(15861),o=a(29439),s=a(72791),i=a(38411),l=a(71368),c=a(4808),d=a(50657),u=a(53939),f=(a(95579),a(69967)),m=a(17615),h=a(87309),p=a(99763),x=a(72966),v=a(80184),j=function(e){var t=e.modal,a=e.setModal,i=e.data,l=e.actualizarTabla,c=(0,s.useState)(null),d=(0,o.Z)(c,2),u=d[0],j=d[1],Z=function(){a(!1)},g=function(){var e=(0,r.Z)((0,n.Z)().mark((function e(){var t,a,r;return(0,n.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t=new FormData,(null===u||void 0===u?void 0:u.file)&&t.set("image",u.file||""),e.next=4,fetch("".concat("http://13.58.131.42:3000/api/v1","/planilla/huella/").concat(null===i||void 0===i?void 0:i.aprobacion_id),{method:"PUT",body:t});case 4:return a=e.sent,e.next=7,a.json();case 7:(r=e.sent)&&((0,p.q)(r.status,r.msg),Z(),l());case 9:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}();return(0,v.jsx)(f.Z,{title:"Validaci\xf3n del trabajador",className:"modal-validacion",open:t,width:400,closeModal:Z,children:(0,v.jsxs)(m.Z,{onFinish:g,layout:"horizontal",children:[(0,v.jsx)(m.Z.Item,{children:(0,v.jsx)("div",{className:"drag-container",children:(0,v.jsx)(x.Z,{avatar:u,setAvatar:j,selected:i})})}),(0,v.jsx)("div",{className:"button-container",children:(0,v.jsx)(h.ZP,{htmlType:"submit",children:"Guardar"})})]})})},Z=function(e){var t,a=e.data,m=e.modal,h=e.setModal,p=e.actualizarTabla,x=(0,s.useContext)(l.c),Z=(x.verificacion,x.setVerificacion,(0,s.useContext)(i.s)),g=(Z.getDataById,Z.data2,(0,s.useState)()),b=(0,o.Z)(g,2),_=(b[0],b[1],(0,s.useState)([])),M=(0,o.Z)(_,2),Y=M[0],y=(M[1],(0,s.useState)(!1)),D=(0,o.Z)(y,2),T=D[0],w=D[1],F=function(){var e=(0,r.Z)((0,n.Z)().mark((function e(){return(0,n.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:"planilla/tareo";case 1:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}();(0,s.useEffect)((function(){F()}),[]);var S=(0,u.MK)();return(0,v.jsxs)(f.Z,{className:"modal-validacion",title:"Hoja de tareo",open:m,width:900,closeModal:function(){h(!1)},children:[(0,v.jsxs)("div",{className:"tareo-container",children:[(0,v.jsxs)("section",{className:"tareo-datos",children:[(0,v.jsx)("div",{children:(0,v.jsxs)("label",{htmlFor:"",children:[(0,v.jsx)("strong",{children:"Nombre: "}),null===a||void 0===a?void 0:a.nombre]})}),(0,v.jsx)("div",{children:(0,v.jsxs)("label",{htmlFor:"",children:[(0,v.jsx)("strong",{children:"Dni: "}),null===a||void 0===a?void 0:a.dni]})}),(0,v.jsx)("div",{children:(0,v.jsxs)("label",{htmlFor:"",children:[(0,v.jsx)("strong",{children:"Tel\xe9fono: "}),null===a||void 0===a?void 0:a.celular]})}),(0,v.jsx)("div",{children:(0,v.jsxs)("label",{htmlFor:"",children:[(0,v.jsx)("strong",{children:"Cargo:"})," ",null===a||void 0===a?void 0:a.cargo]})}),(0,v.jsx)("div",{children:(0,v.jsxs)("label",{htmlFor:"",children:[(0,v.jsx)("strong",{children:"Total de d\xedas asistidos: "}),null===a||void 0===a?void 0:a.asistencia]})})]}),(0,v.jsx)("section",{className:"tareo-boton",children:(0,v.jsx)(d.Z,{registrar:!1,crear:!1,exportar:!0,validacion:!0,cargar:!1,data1:a,data2:Y,modal:w})})]}),(0,v.jsx)(c.Z,{columns:S,table:null===a||void 0===a||null===(t=a.asistencia_completa)||void 0===t?void 0:t.reverse()}),T&&(0,v.jsx)(j,{modal:T,setModal:w,data:a,actualizarTabla:p})]})}},38316:function(e,t,a){"use strict";a.d(t,{Z:function(){return d}});var n=a(29439),r=a(72791),o=a(38411),s=a(50657),i=(a(4808),a(71368)),l=a(69967),c=a(80184),d=function(e){var t=e.data,a=e.modal,d=e.setModal,u=(0,r.useContext)(i.c),f=(u.setValidacionPagosAsociacion,u.setFechas,u.fechas,u.verificacion,u.setVerificacion,(0,r.useContext)(o.s)),m=(f.getData,f.data3,f.setData3,f.data2,f.dataToEdit,(0,r.useState)()),h=(0,n.Z)(m,2);h[0],h[1];return(0,c.jsxs)(l.Z,{className:"modal-validacion",title:"Hoja de tareo asociacion",open:a,width:950,closeModal:function(){d(!1)},children:[(0,c.jsxs)("section",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[(0,c.jsxs)("section",{children:[(0,c.jsx)("div",{children:(0,c.jsxs)("label",{htmlFor:"",children:[(0,c.jsx)("strong",{children:" Nombre: "})," ",t&&null!==t&&void 0!==t&&t.nombre?t.nombre:"---"]})}),(0,c.jsx)("div",{children:(0,c.jsx)("div",{children:(0,c.jsxs)("label",{htmlFor:"",children:[(0,c.jsx)("strong",{children:"Tel\xe9fono:"})," ",t&&null!==t&&void 0!==t&&t.telefono?t.telefono:"---"]})})})]}),(0,c.jsx)("section",{className:"tareo-boton",children:(0,c.jsx)(s.Z,{registrar:!1,crear:!1,exportar:!1,validacion:!1,cargar:!1,data1:t,data2:null,modal:null,descargar:!0})})]}),(0,c.jsx)("section",{className:"table-container",children:(0,c.jsxs)("table",{children:[(0,c.jsx)("thead",{children:(0,c.jsxs)("tr",{children:[(0,c.jsx)("th",{children:"Nro"}),(0,c.jsx)("th",{children:"Apellidos y nombres"}),t.trabajadores.length>0&&Object.keys(t.trabajadores[0]).filter((function(e){return/^\d{4}-\d{2}-\d{2}$/.test(e)})).map((function(e,t){return(0,c.jsx)("th",{style:{writingMode:"vertical-lr",transform:"scale(-1)"},children:(0,c.jsx)("span",{children:e})},t)}))]})}),(0,c.jsx)("tbody",{children:t.trabajadores.map((function(e,t){return(0,c.jsxs)("tr",{children:[(0,c.jsx)("td",{children:t+1}),(0,c.jsx)("td",{children:e.nombres}),Object.entries(e).filter((function(e){var t=(0,n.Z)(e,1)[0];return/^\d{4}-\d{2}-\d{2}$/.test(t)})).map((function(e,t){var a=(0,n.Z)(e,2),r=(a[0],a[1]);return(0,c.jsx)("td",{children:r},t)}))]},t)}))})]})})]})}},3239:function(e,t,a){"use strict";a.r(t),a.d(t,{default:function(){return q}});var n=a(4942),r=a(1413),o=a(74165),s=a(15861),i=a(29439),l=a(34664),c=a(97892),d=a.n(c),u=a(72791),f=a(38411),m=(a(71368),a(53939)),h=a(99763),p=a(64941),x=a(83188),v=a(4808),j=(a(32163),a(50657),a(97603),a(27813),a(85530),a(38316),a(43513),a(51279),a(80184)),Z=a(49389),g=(Z.Z.Search,a(95579),a(69967)),b=a(17615),_=a(83099),M=a(87309),Y=a(16026),y=a(78820),D=a(63998),T=a(93433),w=a(53655),F=a(77128),S=a(80458),C=a(58848),L=a(68588),k=a(36473),N=a(78792),E=a(66106),z=a(30914),I=a(2964),P=a(35790);var A=function(e){var t=e.open,a=e.closeModal,l=e.trabajadores,c=e.actualizarTabla,m=e.closeModalSubmit,p=void 0===m?function(){}:m,x=e.dataToEdit,v=e.setDataToEdit,D=void 0===v?function(){}:v,A=b.Z.useForm(),V=(0,i.Z)(A,1)[0],q=w.Z.Text,H=(0,u.useContext)(f.s),O=H.updateData,R=H.createData,J=H.cargando,$=H.setCargando,B=l.map((function(e){return{value:e.contrato_id,label:e.nombre}})),G=(0,u.useState)([]),K=(0,i.Z)(G,2),U=K[0],X=K[1],Q=(0,u.useState)([]),W=(0,i.Z)(Q,2),ee=W[0],te=W[1];(0,u.useEffect)((function(){if(U.length>0){var e=l.filter((function(e){return U.includes(e.contrato_id)}));te(e)}}),[U]);var ae=(0,u.useState)(Y.XK),ne=(0,i.Z)(ae,2),re=ne[0],oe=ne[1],se=function(e,t){if(!t&&e.target){var a=e.target,o=a.name,s=a.value;V.setFieldsValue((0,n.Z)({},o,s)),oe((function(e){return(0,r.Z)((0,r.Z)({},e),{},(0,n.Z)({},o,s))}))}else V.setFieldsValue((0,n.Z)({},t,e)),oe((function(a){return(0,r.Z)((0,r.Z)({},a),{},(0,n.Z)({},t,e))}))},ie=(0,u.useState)([]),le=(0,i.Z)(ie,2),ce=le[0],de=le[1];(0,u.useEffect)((function(){if(ee.length>0){var e=ee.map((function(e){return{nombre:e.nombre,contrato_id:e.contrato_id,teletrans:e.teletrans||""}}));de(x?re.trabajadores.map((function(e){return(0,r.Z)((0,r.Z)({},e),{},{teletrans:parseFloat(e.teletrans)})})):e)}}),[ee]);var ue=function(){var e=0;return ce.forEach((function(t){e+=t.teletrans})),e},fe=function(){var e=(0,s.Z)((0,o.Z)().mark((function e(){var t,a,n,r;return(0,o.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(t="pago/programacion/multiple",$(!0),a={observacion:re.observacion,fecha_pago:d()(re.fecha_pago).format("YYYY-MM-DD")||"",teletrans:ue(),tipo:"pago",trabajadores:ce.map((function(e){return{contrato_id:e.contrato_id,teletrans:e.teletrans}}))},!x){e.next=10;break}return e.next=6,O(a,re.pago_id,"pago/multiple");case 6:(n=e.sent)&&((0,h.q)(n.status,n.msg),c(),me()),e.next=14;break;case 10:return e.next=12,R(a,t);case 12:(r=e.sent)&&((0,h.q)(r.status,r.msg),c(),me());case 14:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}();(0,u.useEffect)((function(){x&&(oe((0,r.Z)((0,r.Z)({},x),{},{fecha_pago:d()(x.fecha_pago).format("YYYY-MM-DD")})),X(x.trabajadores.map((function(e){return e.contrato_id}))),de(x.trabajadores))}),[x]);var me=function(){D(null),a(),p()};return(0,j.jsx)(g.Z,{open:t,closeModal:x?me:a,title:"Juntar Teletrans",width:800,children:(0,j.jsxs)(b.Z,{form:V,className:"modal-body",onFinish:fe,layout:"vertical",children:[(0,j.jsx)(F.Z,{orientation:"left",children:"Datos"}),(0,j.jsxs)(_.Z,{direction:"vertical",style:{width:"100%"},children:[(0,j.jsx)(b.Z.Item,{label:"Seleccione trabajadores",children:(0,j.jsx)(S.Z,{mode:"multiple",placeholder:"Seleccione trabajadores",style:{width:"100%"},allowClear:!0,onChange:function(e){X(e)},options:B,disabled:!!x})}),(0,j.jsx)(b.Z.Item,{label:"Observaci\xf3n",children:(0,j.jsx)(Z.Z,{name:"observacion",value:re.observacion,placeholder:"Observaci\xf3n",onChange:function(e){return se(e)}})}),(0,j.jsx)(b.Z.Item,{label:"Fecha",children:(0,j.jsx)(C.ZP,{locale:P.Z,children:(0,j.jsx)(L.Z,{allowClear:!1,value:d()(re.fecha_pago),name:"fecha_pago",placeholder:"Fecha de Pago",picker:"day",onChange:function(e){return se(e,"fecha_pago")},style:{width:"100%"},format:"YYYY-MM-DD"})})})]}),(0,j.jsx)(F.Z,{orientation:"left",children:"Trabajadores"}),(0,j.jsx)("div",{style:{display:"flex",flexDirection:"column",gap:4},children:(0,j.jsxs)(k.Z,{style:{width:"100%"},children:[(0,j.jsx)(N.ZP,{itemLayout:"horizontal",dataSource:ce,renderItem:function(e){return(0,j.jsx)(N.ZP.Item,{children:(0,j.jsxs)(E.Z,{style:{width:"100%"},children:[(0,j.jsx)(z.Z,{span:18,children:(0,j.jsx)(_.Z,{direction:"vertical",children:e.nombre})}),(0,j.jsx)(z.Z,{span:6,children:(0,j.jsx)(_.Z,{direction:"vertical",children:(0,j.jsx)(Z.Z,{value:e.teletrans,placeholder:"Teletrans",type:"number",min:0,onChange:function(t){return function(e,t){var a=ce.findIndex((function(e){return e.contrato_id===t}));ce[a]=(0,r.Z)((0,r.Z)({},ce[a]),{},{teletrans:parseFloat(e.target.value)}),de((0,T.Z)(ce))}(t,e.contrato_id)},required:!0})})})]},e.contrato_id)})}}),(0,j.jsxs)(_.Z,{direction:"horizontal",style:{width:"100%",justifyContent:"end",alignItems:"center",padding:24},children:[(0,j.jsx)(q,{type:ue()%4===0?"success":"danger",children:"TOTAL DE TELETRANS"}),(0,j.jsx)(I.Z,{message:ue(),type:ue()%4===0?"success":"error"})]})]})}),(0,j.jsxs)(_.Z,{direction:"horizontal",style:{width:"100%",marginTop:20,justifyContent:"end"},children:[(0,j.jsx)(M.ZP,{onClick:a,children:"Cancelar"}),(0,j.jsx)(M.ZP,{type:"primary",htmlType:"submit",icon:(0,j.jsx)(y.lFz,{}),loading:!!J,children:"Registrar"})]})]})})};var V=function(e){var t=e.actualizarTabla,a=e.modal,l=e.setModal,c=b.Z.useForm(),m=(0,i.Z)(c,1)[0],x=(0,u.useContext)(f.s),v=x.createData,Z=x.getData,T=x.cargando,w=x.setCargando,F=x.setDataToEdit,S=x.dataToEdit,C=x.updateData,L=(0,u.useState)(Y.Tc),k=(0,i.Z)(L,2),N=k[0],E=k[1],z=(0,u.useState)([]),I=(0,i.Z)(z,2),P=I[0],V=I[1],q=function(){var e=(0,s.Z)((0,o.Z)().mark((function e(){var t;return(0,o.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,Z("trabajador/aprobado");case 2:t=e.sent,V(t.data);case 4:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}();(0,u.useEffect)((function(){q()}),[]),(0,u.useEffect)((function(){S?(E((0,r.Z)((0,r.Z)({},S),{},{nombre:S.trabajadores[0].nombre,teletrans:parseFloat(S.trabajadores[0].teletrans),observacion:S.observacion,fecha_pago:d()(S.fecha_pago).format("YYYY-MM-DD")})),m.setFieldsValue((0,r.Z)((0,r.Z)({},S),{},{nombre:S.trabajadores[0].nombre,teletrans:parseFloat(S.trabajadores[0].teletrans),observacion:S.observacion,fecha_pago:d()(S.fecha_pago).format("YYYY-MM-DD")}))):E(Y.Tc)}),[S]);var H=function(){var e=(0,s.Z)((0,o.Z)().mark((function e(){var a,n,r,s;return(0,o.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(a="pago/programacion",w(!0),n={contrato_id:N.contrato_id||"",observacion:N.observacion||"",fecha_pago:d()(N.fecha_pago).format("YYYY-MM-DD")||"",teletrans:parseFloat(N.teletrans)||0,tipo:"pago"},!S){e.next=10;break}return e.next=6,C(n,S.pago_id,"pago");case 6:(r=e.sent)&&((0,h.q)(r.status,r.msg),t(),O()),e.next=14;break;case 10:return e.next=12,v(n,a);case 12:(s=e.sent)&&((0,h.q)(s.status,s.msg),t(),O());case 14:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}(),O=function(){l(!1),F(null),w(!1),E(Y.Tc)},R=(0,D.PA)(N,(function(e,t){if(!t&&e.target){var a=e.target,o=a.name,s=a.value;m.setFieldsValue((0,n.Z)({},o,s)),E((function(e){return(0,r.Z)((0,r.Z)({},e),{},(0,n.Z)({},o,s))}))}else m.setFieldsValue((0,n.Z)({},t,e)),E((function(a){return(0,r.Z)((0,r.Z)({},a),{},(0,n.Z)({},t,e))}))}),P,S),J=(0,u.useState)(!1),$=(0,i.Z)(J,2),B=$[0],G=$[1];return(0,j.jsxs)(j.Fragment,{children:[(0,j.jsxs)(g.Z,{className:"modal-usuario",title:S?"Editar programaci\xf3n":"Registrar programaci\xf3n",open:a,width:400,closeModal:O,children:[!S&&(0,j.jsx)(_.Z,{direction:"horizontal",style:{width:"100%",justifyContent:"end"},children:(0,j.jsx)(p.Z,{title:"Juntar Teletrans",onClick:function(){G(!0)},icon:(0,j.jsx)(y.FDz,{})})}),(0,j.jsxs)(b.Z,{form:m,className:"modal-body",onFinish:H,layout:"horizontal",children:[R.map((function(e,t){return(0,j.jsx)(b.Z.Item,{className:e.className,name:e.name,rules:e.rules,style:{marginBottom:"8px"},children:(0,j.jsxs)(j.Fragment,{children:[e.label,e.type]})},t)})),(0,j.jsx)(b.Z.Item,{className:"button-container",children:(0,j.jsx)(M.ZP,{htmlType:"submit",icon:(0,j.jsx)(y.lFz,{}),loading:!!T,children:S?"Editar":"Registrar"})})]})]}),B&&(0,j.jsx)(A,{open:B,closeModal:function(){G(!1)},trabajadores:P,actualizarTabla:t,closeModalSubmit:O})]})},q=function(){var e=(0,u.useContext)(f.s),t=e.getData,a=e.createData,c=(0,u.useState)([]),p=(0,i.Z)(c,2),Z=p[0],g=p[1],b=(0,u.useState)(!1),_=(0,i.Z)(b,2),M=_[0],Y=_[1],y=(0,u.useState)(!1),D=(0,i.Z)(y,2),T=(D[0],D[1],(0,u.useState)({observacion:"",fecha_pago:"",contrato_id:"",id:"",teletrans:""})),w=(0,i.Z)(T,2);w[0],w[1];console.log(Z);var F=function(){var e=(0,s.Z)((0,o.Z)().mark((function e(){var a,n;return(0,o.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,t("planilla/pagos");case 2:(a=e.sent)&&(n=a.data.filter((function(e){return null!==e})),g(n));case 4:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}();(0,u.useEffect)((function(){F()}),[]);var S=function(){var e=(0,s.Z)((0,o.Z)().mark((function e(t){var n,r;return(0,o.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return console.log(t),n={observacion:t.observacion,fecha_pago:d()(new Date).format("DD-MM-YYYY"),teletrans:t.teletrans,tipo:"pago",trabajadores:[{teletrans:t.teletrans,contrato_id:t.contrato.map((function(e){return e.contrato_id})),trabajador_dni:t.contrato.map((function(e){return e.trabajador_dni}))}]},e.next=4,a(n,"pago/programacion/multiple");case 4:(r=e.sent)&&((0,h.q)(r.status,r.msg),F());case 6:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),C=(0,m.lF)((function(e,t,a){var o=e.target,s=o.name,i=o.value;g((function(e){return e.map((function(e,o){var l,c,d,u;return o===a?(0,r.Z)((0,r.Z)({},e),{},(u={},(0,n.Z)(u,s,i),(0,n.Z)(u,"contrato_id",null===t||void 0===t?void 0:t.contrato_id),(0,n.Z)(u,"id",(null===t||void 0===t||null===(l=t.pagos)||void 0===l||null===(c=l.pagos)||void 0===c||null===(d=c.at(-1))||void 0===d?void 0:d.id)||""),u)):e}))}))}),S);return(0,j.jsxs)(j.Fragment,{children:[(0,j.jsx)(x.Z,{text:"Programaci\xf3n de pagos",ruta:"/planilla"}),(0,j.jsx)("div",{className:"margenes",children:(null===Z||void 0===Z?void 0:Z.length)>0?(0,j.jsx)(v.Z,{columns:C,table:Z}):(0,j.jsx)(l.Z,{image:l.Z.PRESENTED_IMAGE_SIMPLE,description:(0,j.jsx)("span",{children:"No hay registros para mostrar."})})}),M&&(0,j.jsx)(V,{open:M,closeModal:function(){Y(!1)},actualizarTabla:F})]})}},52563:function(e,t,a){e.exports=function(e){"use strict";function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var a=t(e),n={name:"es",monthsShort:"ene_feb_mar_abr_may_jun_jul_ago_sep_oct_nov_dic".split("_"),weekdays:"domingo_lunes_martes_mi\xe9rcoles_jueves_viernes_s\xe1bado".split("_"),weekdaysShort:"dom._lun._mar._mi\xe9._jue._vie._s\xe1b.".split("_"),weekdaysMin:"do_lu_ma_mi_ju_vi_s\xe1".split("_"),months:"enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre".split("_"),weekStart:1,formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD/MM/YYYY",LL:"D [de] MMMM [de] YYYY",LLL:"D [de] MMMM [de] YYYY H:mm",LLLL:"dddd, D [de] MMMM [de] YYYY H:mm"},relativeTime:{future:"en %s",past:"hace %s",s:"unos segundos",m:"un minuto",mm:"%d minutos",h:"una hora",hh:"%d horas",d:"un d\xeda",dd:"%d d\xedas",M:"un mes",MM:"%d meses",y:"un a\xf1o",yy:"%d a\xf1os"},ordinal:function(e){return e+"\xba"}};return a.default.locale(n,null,!0),n}(a(97892))},99893:function(e){e.exports=function(){"use strict";var e={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"};return function(t,a,n){var r=a.prototype,o=r.format;n.en.formats=e,r.format=function(t){void 0===t&&(t="YYYY-MM-DDTHH:mm:ssZ");var a=this.$locale().formats,n=function(t,a){return t.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g,(function(t,n,r){var o=r&&r.toUpperCase();return n||a[r]||e[r]||a[o].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,(function(e,t,a){return t||a.slice(1)}))}))}(t,void 0===a?{}:a);return o.call(this,n)}}}()},97603:function(){}}]);
//# sourceMappingURL=415.603106d1.chunk.js.map