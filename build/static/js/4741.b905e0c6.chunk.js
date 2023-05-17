"use strict";(self.webpackChunkrinconada=self.webpackChunkrinconada||[]).push([[4741],{95152:function(e,t,n){n.r(t),n.d(t,{default:function(){return R}});var a=n(74165),o=n(15861),i=n(29439),r=n(72791),l=n(38411),s=n(83188),c=n(43513),u=(n(51279),n(45180)),d=n(1333),v=n(34664),f=n(68406),p=n(91082),m=n(78820),x=n(39126),h=n(99763),Z=n(80184),g=function(e){var t=e.data,n=e.setModalHistorial,i=e.setId,s=e.actualizarTabla,u=(0,r.useContext)(l.s),d=u.setDataToEdit,g=u.setModal,j=u.deleteData,b=(u.currentPage,u.setCurrentPage,[{id:"nro",name:"Nro",sortable:!0,center:!0,width:"80px",selector:function(e){return null===e||void 0===e?void 0:e.nro}},{id:"codigo",name:"C\xf3digo",sortable:!0,center:!0,width:"140px",selector:function(e){return null===e||void 0===e?void 0:e.codigo_trabajador}},{id:"foto",name:"Foto",center:!0,width:"120px",selector:function(e){return(0,Z.jsx)("div",{style:{padding:"8px"},children:(0,Z.jsx)(f.Z,{src:(null===e||void 0===e?void 0:e.foto)||"https://via.placeholder.com/60",style:{height:"60px",width:"60px",borderRadius:"10%"}})})}},{id:"Trabajador",name:"Apellidos y Nombres",selector:function(e){return(null===e||void 0===e?void 0:e.apellido_paterno)+" "+(null===e||void 0===e?void 0:e.apellido_materno)+" "+(null===e||void 0===e?void 0:e.nombre)},width:"300px",sortable:!0},{id:"Campamento",name:"Campamento",selector:function(e){return null!==e&&void 0!==e&&e.campamento?null===e||void 0===e?void 0:e.campamento:"Por asignar"},sortable:!0},{id:"Dni",name:"Dni",selector:function(e){return null===e||void 0===e?void 0:e.dni},sortable:!0},{id:"telefono",name:"Tel\xe9fono",selector:function(e){return null===e||void 0===e?void 0:e.telefono},sortable:!0},{id:"Evaluaci\xf3n",name:"Evaluaci\xf3n",selector:function(e){return null===e||void 0===e?void 0:e.id},button:!0,cell:function(e,t){var n,a,o,i,r,l,s,c,u,d,v,f,p,x,h,g,j,b;return(0,Z.jsxs)(Z.Fragment,{children:[(0,Z.jsx)(m.w8I,{style:{cursor:"pointer"},onClick:function(){return E(e)}}),"si"!==(null===e||void 0===e||null===(n=e.evaluacions)||void 0===n||null===(a=n.at(-1))||void 0===a?void 0:a.fiscalizador_aprobado)||"si"!==(null===e||void 0===e||null===(o=e.evaluacions)||void 0===o||null===(i=o.at(-1))||void 0===i?void 0:i.control)||"si"!==(null===e||void 0===e||null===(r=e.evaluacions)||void 0===r||null===(l=r.at(-1))||void 0===l?void 0:l.topico)||"si"!==(null===e||void 0===e||null===(s=e.evaluacions)||void 0===s||null===(c=s.at(-1))||void 0===c?void 0:c.seguridad)||"si"!==(null===e||void 0===e||null===(u=e.evaluacions)||void 0===u||null===(d=u.at(-1))||void 0===d?void 0:d.medio_ambiente)||"si"!==(null===e||void 0===e||null===(v=e.evaluacions)||void 0===v||null===(f=v.at(-1))||void 0===f?void 0:f.recursos_humanos)||null!==e&&void 0!==e&&null!==(p=e.evaluacions)&&void 0!==p&&null!==(x=p.at(-1))&&void 0!==x&&x.finalizado?null===e||void 0===e||null===(h=e.evaluacions)||void 0===h||null===(g=h.at(-1))||void 0===g||!g.id||null!==e&&void 0!==e&&null!==(j=e.evaluacions)&&void 0!==j&&null!==(b=j.at(-1))&&void 0!==b&&b.finalizado?"":(0,Z.jsx)(m.oHP,{style:{color:"red",fontWeigth:"bold",fontSize:"16px"}}):(0,Z.jsx)(m.bzc,{style:{color:"green",fontWeigth:"bold",fontSize:"16px"}})]})}},{id:"Acciones",name:"Acciones",button:!0,cell:function(e){return(0,Z.jsxs)("div",{className:"acciones",children:[(0,Z.jsx)(x.jox,{onClick:function(){return w(e)}}),(0,Z.jsx)(p.Z,{title:"Eliminar trabajador",description:"\xbfEstas seguro de eliminar?",onConfirm:function(){return C(e.dni)},okText:"Si",cancelText:"No",placement:"topRight",children:(0,Z.jsx)(x.yvY,{})})]})}}]),w=function(e){d(e),g(!0)},C=function(){var e=(0,o.Z)((0,a.Z)().mark((function e(t){var n;return(0,a.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,j("trabajador",t);case 2:(n=e.sent)&&((0,h.q)(n.status,n.msg),s());case 4:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),E=function(e){n(!0),i(e)};return(0,Z.jsx)("div",{children:(0,Z.jsx)(c.ZP,{columns:b,data:t.trabajador,noDataComponent:(0,Z.jsx)(v.Z,{image:v.Z.PRESENTED_IMAGE_SIMPLE,description:(0,Z.jsx)("span",{children:"No hay registros para mostrar."})}),paginationComponentOptions:{rowsPerPageText:"Filas por p\xe1gina",rangeSeparatorText:"de",selectAllRowsItem:!0,selectAllRowsItemText:"Todos"},paginationRowsPerPageOptions:[5,10,15,20]})})},j=function(e){var t=e.columns,n=e.table,a=e.actualizarTabla,o=(e.filterText,(0,r.useContext)(l.s)),s=o.setModal,f=o.modal,p=(0,r.useState)(""),m=(0,i.Z)(p,2),x=m[0],h=m[1],j=(0,r.useState)(!1),b=(0,i.Z)(j,2),w=b[0],C=b[1];return(0,Z.jsxs)("div",{className:"table-container",children:[(0,Z.jsx)(c.ZP,{columns:t,data:n,pagination:!0,fixedHeader:!0,striped:!0,expandableRows:!0,expandableRowsComponent:function(e){var t=e.data;return(0,Z.jsx)("div",{style:{padding:"5px 5px 5px 5px",backgroundColor:"#DFE4E4"},children:(0,Z.jsx)(g,{data:t,setModalHistorial:C,setId:h,actualizarTabla:a})})},expandableRowDisabled:function(e){var t;return 0===(null===e||void 0===e||null===(t=e.trabajador)||void 0===t?void 0:t.length)},paginationComponentOptions:{rowsPerPageText:"Filas por p\xe1gina",rangeSeparatorText:"de",selectAllRowsItem:!0,selectAllRowsItemText:"Todos"},responsive:!0,noHeader:!0,conditionalRowStyles:[{when:function(e){return null===e||void 0===e?void 0:e.contrato},style:function(e){var t;return{backgroundColor:(null===e||void 0===e||null===(t=e.contrato)||void 0===t?void 0:t.length)>0?"#87b07bf6":"",fontSize:"15px"}}}],noDataComponent:(0,Z.jsx)(v.Z,{image:v.Z.PRESENTED_IMAGE_SIMPLE,description:(0,Z.jsx)("span",{children:"No hay registros para mostrar."})})}),f&&(0,Z.jsx)(u.Z,{actualizarTabla:a,modal:f,setModal:s}),w&&(0,Z.jsx)(d.Z,{selected:x,actualizarTrabajador:a,modal1:w,setModal1:C})]})},b=n(22552),w=n(1413),C=n(4942),E=n(17615),y=n(87309),T=n(63998),S=n(69967),_=function(e){var t=e.actualizarTabla,n=(e.selected,e.modal),s=e.setModal,c=E.Z.useForm(),u=(0,i.Z)(c,1)[0],d="asociacion",v={nombre:"",codigo:"",tipo:""},f=(0,r.useState)(v),p=(0,i.Z)(f,2),x=p[0],g=p[1],j=(0,r.useContext)(l.s),b=j.createData,_=j.updateData,z=j.setDataToEdit,F=j.dataToEdit,D=j.cargando,N=j.setCargando;(0,r.useEffect)((function(){F?(g(F),u.setFieldsValue(F)):g(v)}),[F]);var k=function(){s(!1),z(null),g(v),N(!1)},M=function(){var e=(0,o.Z)((0,a.Z)().mark((function e(n){var o,i;return(0,a.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(null!==F){e.next=6;break}return N(!0),e.next=4,b(x,d);case 4:(o=e.sent)&&((0,h.q)(o.status,o.msg),k(),t(),N(!1));case 6:if(!F){e.next=12;break}return N(!0),e.next=10,_(x,F.id,d);case 10:(i=e.sent)&&((0,h.q)(i.status,i.msg),k(),t(),N(!1));case 12:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),I=(0,T.sy)(x,(function(e,t){if(!t&&e.target){var n=e.target,a=n.name,o=n.value;u.setFieldsValue((0,C.Z)({},a,o)),g((function(e){return(0,w.Z)((0,w.Z)({},e),{},(0,C.Z)({},a,o))}))}else u.setFieldsValue((0,C.Z)({},t,e)),g((function(n){return(0,w.Z)((0,w.Z)({},n),{},(0,C.Z)({},t,e))}))}));return(0,Z.jsx)(S.Z,{className:"modal-registrar-asociacion",title:F?"Editar Cooperatativa/asociaci\xf3n":"Registrar Cooperatativa/asociaci\xf3n",open:n,width:400,closeModal:k,children:(0,Z.jsxs)(E.Z,{form:u,className:"modal-body",onFinish:M,layout:"horizontal",children:[I.splice(0,2).map((function(e,t){return(0,Z.jsx)(E.Z.Item,{name:e.name,rules:e.rules,style:{marginBottom:"8px"},children:(0,Z.jsxs)(Z.Fragment,{children:[e.label,e.type]})},t)})),(0,Z.jsx)(E.Z.Item,{className:"button-container",children:(0,Z.jsx)(y.ZP,{htmlType:"submit",icon:(0,Z.jsx)(m.lFz,{}),loading:!!D,children:F?"Editar":"Registrar"})})]})})},z=n(4808),F=n(86717),D=(n(81837),n(16026)),N=n(86281),k=(n(138),function(e){var t,n=e.actualizarTabla,s=(e.selected,e.data),c=(e.evaluaciones,e.actualizarAsociacion),u=e.modal2,d=e.setModal2,v=(e.dataContrato,E.Z.useForm()),f=(0,i.Z)(v,1)[0],p=null===s||void 0===s||null===(t=s.trabajador)||void 0===t?void 0:t.map((function(e){var t;return null===e||void 0===e||null===(t=e.evaluacions)||void 0===t?void 0:t.id})).filter((function(e){return void 0!==e})),x=(0,D.eJ)(s,p),g=(0,r.useContext)(l.s),j=g.createData,b=g.updateData,_=g.getData,z=g.setDataToEdit,F=g.dataToEdit,k=g.cargando,M=g.setCargando,I=(0,r.useState)(x),P=(0,i.Z)(I,2),R=P[0],A=P[1],L=(0,r.useState)([]),q=(0,i.Z)(L,2),H=q[0],V=q[1],B=(0,r.useState)([]),G=(0,i.Z)(B,2),O=G[0],W=G[1],Y=(0,r.useState)([]),J=(0,i.Z)(Y,2),U=J[0],$=J[1],K=(0,r.useState)([]),Q=(0,i.Z)(K,2),X=Q[0],ee=Q[1],te=(0,r.useState)([]),ne=(0,i.Z)(te,2),ae=(ne[0],ne[1]),oe=(0,r.useState)([]),ie=(0,i.Z)(oe,2),re=ie[0],le=ie[1],se=function(){var e=(0,o.Z)((0,a.Z)().mark((function e(){var t,n,o,i,r,l,s;return(0,a.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t=_("cargo"),n=_("campamento"),o=_("gerencia"),i=_("area"),r=_("socio"),l=_("contrato/last/id"),e.next=8,Promise.all([t,n,o,i,r,l]);case 8:s=e.sent,V(s[0].data),W(s[1].data),$(s[2].data),ee(s[3].data),ae(s[4].data),le(s[5].data);case 15:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}();(0,r.useEffect)((function(){se()}),[]);var ce=function(){var e=(0,o.Z)((0,a.Z)().mark((function e(t){var o,i;return(0,a.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(null!==F){e.next=6;break}return M(!0),e.next=4,j(R,"contrato/asociacion");case 4:(o=e.sent)&&((0,h.q)(o.status,o.msg),ue(),c(),n(),M(!1));case 6:if(!F){e.next=12;break}return M(!0),e.next=10,b(R,F.id,"contrato");case 10:(i=e.sent)&&((0,h.q)(i.status,i.msg),ue(),c(),n(),M(!1));case 12:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),ue=function(){d(!1),z(null),A(x),M(!1)};(0,r.useEffect)((function(){A(F||x)}),[F]),(0,r.useEffect)((function(){null===F&&A((function(e){return(0,w.Z)((0,w.Z)({},e),{},{codigo_contrato:re})}))}),[re]),(0,r.useEffect)((function(){if(""!==R.fecha_inicio&&""!==R.periodo_trabajo){var e=R.fecha_inicio,t=(0,N.E)(e,R.periodo_trabajo,R.tareo);A((function(e){return(0,w.Z)((0,w.Z)({},e),{},{fecha_fin:t})}))}else A((function(e){return(0,w.Z)((0,w.Z)({},e),{},{fecha_fin:""})}))}),[R.fecha_inicio,R.periodo_trabajo,R.tareo]),console.log("===================================="),console.log(F),console.log("====================================");var de=(0,T.qj)(R,(function(e,t){if(!t&&e.target){var n=e.target,a=n.name,o=n.value;f.setFieldsValue((0,C.Z)({},a,o)),A((function(e){return(0,w.Z)((0,w.Z)({},e),{},(0,C.Z)({},a,o))}))}else f.setFieldsValue((0,C.Z)({},t,e)),A((function(n){return(0,w.Z)((0,w.Z)({},n),{},(0,C.Z)({},t,e))}))}),H,O,U,X,re,F);return(0,Z.jsx)(S.Z,{className:"modal-contrato-empresa",title:F?"Editar contrato":"Registrar contrato",open:u,width:920,closeModal:ue,children:(0,Z.jsxs)(E.Z,{form:f,className:"modal-body",onFinish:ce,layout:"horizontal",children:[(0,Z.jsx)("div",{className:"contrato",style:{pointerEvents:null!==F&&null!==F&&void 0!==F&&F.finalizado?"none":"auto"},children:de.splice(0,13).map((function(e,t){return(0,Z.jsx)(E.Z.Item,{className:"item",name:e.name,rules:e.rules,style:{marginBottom:"8px"},children:(0,Z.jsxs)(Z.Fragment,{children:[e.label,e.type]})},t)}))}),(0,Z.jsx)("div",{className:"finalizacion",children:de.map((function(e,t){return(0,Z.jsx)(E.Z.Item,{name:e.name,rules:e.rules,style:{marginBottom:"8px"},children:(0,Z.jsxs)(Z.Fragment,{children:[e.label,e.type]})},t)}))}),(0,Z.jsx)(E.Z.Item,{className:"button-container",children:(0,Z.jsx)(y.ZP,{htmlType:"submit",icon:(0,Z.jsx)(m.lFz,{}),loading:!!k,children:F?" Editar":" Registrar"})})]})})}),M=n(82339),I=function(e){var t=e.selected,n=e.evaluaciones,s=e.actualizarAsociacion,c=e.modal1,u=e.setModal1,d=(0,r.useContext)(l.s),f=(d.getDataById,d.deleteData),m=d.data1,g=d.setData1,j=d.getData,b=d.setDataToEdit,w=(d.modal2,d.setModal2,(0,r.useState)("")),C=(0,i.Z)(w,2),E=C[0],y=C[1],T=(0,r.useState)(!1),_=(0,i.Z)(T,2),D=_[0],N=_[1],I=function(){var e=(0,o.Z)((0,a.Z)().mark((function e(){var n,o;return(0,a.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n="contrato/asociacion/".concat(t.id),e.next=3,j(n);case 3:o=e.sent,g(o.data);case 5:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}(),P=function(){var e=(0,o.Z)((0,a.Z)().mark((function e(t){var n;return(0,a.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return"contrato",e.next=3,f("contrato",t.id);case 3:(n=e.sent)&&((0,h.q)(n.status,n.msg),I());case 5:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}();(0,r.useEffect)((function(){I()}),[]);var R=[{id:"Id ",name:"Id",width:"80px",selector:function(e){return null===e||void 0===e?void 0:e.id}},{id:"Tipo de Contrato",name:"Tipo de Contrato",width:"18%",selector:function(e){return null===e||void 0===e?void 0:e.tipo_contrato}},{id:"Fecha de inicio",name:"Fecha de inicio",width:"16%",selector:function(e){return null===e||void 0===e?void 0:e.fecha_inicio_tabla}},{id:"Fecha de fin",name:"Fecha de fin",selector:function(e){return null===e||void 0===e?void 0:e.fecha_fin_tabla}},{id:"Estado",name:"Estado",selector:function(e){return null!==e&&void 0!==e&&e.finalizado?(0,Z.jsx)(M.Z,{color:"green",children:"Finalizado"}):(0,Z.jsx)(M.Z,{color:"blue",children:"Activo"})}},{id:"Nota",name:"Nota",selector:function(e){return null===e||void 0===e?void 0:e.nota_contrato}},{id:"Acciones",name:"Acciones",button:!0,cell:function(e){return(0,Z.jsx)(Z.Fragment,{children:(0,Z.jsxs)("div",{className:"acciones",children:[(0,Z.jsx)(x.jox,{onClick:function(){return function(e){b(e),N(!0),y(e)}(e)}}),(0,Z.jsx)(p.Z,{title:"Eliminar trabajador",description:"\xbfEstas seguro de eliminar?",onConfirm:function(){return P(e)},okText:"Si",cancelText:"No",placement:"topRight",children:(0,Z.jsx)(x.yvY,{})})]})})}}];return(0,Z.jsxs)(S.Z,{title:"Historial de contratos",open:c,width:900,closeModal:function(){u(!1),b(null)},children:[(0,Z.jsx)(F.Z,{abrirModal:N,registrar:!0}),m.length>0?(0,Z.jsx)("section",{className:"tabla",children:(0,Z.jsx)(z.Z,{columns:R,table:m})}):(0,Z.jsx)(v.Z,{image:v.Z.PRESENTED_IMAGE_SIMPLE,description:(0,Z.jsx)("span",{children:"No hay registros para mostrar."})}),D&&(0,Z.jsx)(k,{actualizarTabla:I,selected:E,data:t,evaluaciones:n,actualizarAsociacion:s,modal2:D,setModal2:N,dataContrato:m})]})},P=n(53939),R=function(){var e="asociacion",t=(0,r.useRef)(null),n=(0,r.useContext)(l.s),c=n.getData,u=n.deleteData,d=n.data,v=(n.setData,n.setDataToEdit),f=n.setCargando,p=(0,r.useState)(),m=(0,i.Z)(p,2),x=m[0],g=m[1],w=(0,r.useState)(""),C=(0,i.Z)(w,2),E=C[0],y=C[1],T=(0,r.useState)([]),S=(0,i.Z)(T,2),z=S[0],F=S[1],D=(0,r.useState)([]),N=(0,i.Z)(D,2),k=N[0],M=N[1],R=(0,r.useState)(!1),A=(0,i.Z)(R,2),L=A[0],q=A[1],H=(0,r.useState)(!1),V=(0,i.Z)(H,2),B=V[0],G=V[1],O=(0,r.useState)(""),W=(0,i.Z)(O,2),Y=W[0],J=W[1],U=function(){var t=(0,o.Z)((0,a.Z)().mark((function t(){var n;return(0,a.Z)().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return f(!0),t.next=3,c(e);case 3:(n=t.sent)&&(M(n.data),f(!1));case 5:case"end":return t.stop()}}),t)})));return function(){return t.apply(this,arguments)}}();(0,r.useEffect)((function(){U()}),[]);var $=function(){var t=(0,o.Z)((0,a.Z)().mark((function t(n){var o;return(0,a.Z)().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,u(e,n);case 2:(o=t.sent)&&((0,h.q)(o.status,o.msg),U());case 4:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}();(0,r.useEffect)((function(){var e=k&&k.map((function(e){var t;return[{codigo:null===e||void 0===e?void 0:e.codigo,id:null===e||void 0===e?void 0:e.id,nombre:null===e||void 0===e?void 0:e.nombre,campamento:null===e||void 0===e?void 0:e.campamento,tipo:null===e||void 0===e?void 0:e.tipo,contrato:null===e||void 0===e?void 0:e.contrato,trabajador:null===e||void 0===e||null===(t=e.trabajadors)||void 0===t?void 0:t.filter((function(e){var t,n,a,o,i,r;return(null===(t="".concat(null===e||void 0===e?void 0:e.apellido_paterno," ").concat(null===e||void 0===e?void 0:e.apellido_materno," ").concat(null===e||void 0===e?void 0:e.nombre))||void 0===t||null===(n=t.toLowerCase())||void 0===n?void 0:n.includes(null===Y||void 0===Y?void 0:Y.toLowerCase()))||(null===e||void 0===e||null===(a=e.dni)||void 0===a||null===(o=a.toLowerCase())||void 0===o?void 0:o.includes(null===Y||void 0===Y?void 0:Y.toLowerCase()))||(null===e||void 0===e||null===(i=e.codigo_trabajador)||void 0===i||null===(r=i.toLowerCase())||void 0===r?void 0:r.includes(null===Y||void 0===Y?void 0:Y.toLowerCase()))}))}]})).flat().filter((function(e){var t,n,a,o,i,r;return(null===e||void 0===e||null===(t=e.codigo_trabajador)||void 0===t||null===(n=t.toLowerCase())||void 0===n?void 0:n.includes(null===Y||void 0===Y?void 0:Y.toLowerCase()))||(null===e||void 0===e||null===(a=e.nombre)||void 0===a||null===(o=a.toLowerCase())||void 0===o?void 0:o.includes(null===Y||void 0===Y?void 0:Y.toLowerCase()))||(null===e||void 0===e||null===(i=e.dni)||void 0===i||null===(r=i.toLowerCase())||void 0===r?void 0:r.includes(null===Y||void 0===Y?void 0:Y.toLowerCase()))||e.trabajador.length}));F(e)}),[Y,k]);var K=function(){var e=(0,o.Z)((0,a.Z)().mark((function e(n){var o,i,r;return(0,a.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return(o=new FormData).append("myFile",n.target.files[0]),e.next=4,fetch("".concat("http://13.58.131.42:3000/api/v1","/asociacion/upload/").concat(x),{method:"post",body:o});case 4:return i=e.sent,e.next=7,i.json();case 7:(r=e.sent)&&((0,h.q)(r.status,r.msg),U()),t.current.value=null;case 10:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),Q=(0,P.$g)((function(e){t.current.click(),g(e.id)}),(function(e){G(!0),y(e)}),(function(e){v(e),q(!0)}),$);return(0,Z.jsxs)(Z.Fragment,{children:[(0,Z.jsx)("input",{type:"file",ref:t,onChange:K,style:{display:"none"},accept:".xlsx, .xls, .csv"}),(0,Z.jsx)(s.Z,{text:"Asociaciones",user:"Usuario",ruta:"/personal"}),(0,Z.jsxs)("div",{className:"margenes",children:[(0,Z.jsx)(b.Z,{abrirModal:q,registrar:!0,setFilterText:J}),(0,Z.jsx)(j,{columns:Q,table:z,actualizarTabla:U,filterText:Y})]}),L&&(0,Z.jsx)(_,{actualizarTabla:U,modal:L,setModal:q}),B&&(0,Z.jsx)(I,{selected:E,evaluaciones:d,actualizarAsociacion:U,modal1:B,setModal1:G})]})}}}]);
//# sourceMappingURL=4741.b905e0c6.chunk.js.map