"use strict";(self.webpackChunkrinconada=self.webpackChunkrinconada||[]).push([[227],{93883:function(e,a,n){n.r(a),n.d(a,{default:function(){return y}});var o=n(74165),t=n(15861),r=n(34664),i=n(72791),c=n(38411),s=n(53939),u=n(99763),d=n(95579),l=n(83188),f=n(4808),p=n(49389),m=n(87309),_=n(78820),g=n(80184),h=p.Z.Search,v=function(e){var a=e.abrirModal,n=(0,i.useContext)(c.s).setFilterText;return(0,g.jsxs)("div",{className:"buscador-almacen",children:[(0,g.jsx)(h,{placeholder:"Ingresa un almacen aqui...",onChange:function(e){return n(e.target.value)},style:{width:300}}),(0,g.jsx)("div",{className:"button-container",children:(0,g.jsx)(m.ZP,{onClick:function(){return a(!0)},icon:(0,g.jsx)(_.lFz,{}),children:"Registrar"})})]})},b=n(1413),x=n(4942),j=n(29439),Z=n(16026),w=n(17615),D=n(63998),T=n(69967),E=function(e){var a=e.actualizarTabla,n=w.Z.useForm(),r=(0,j.Z)(n,1)[0],s=(0,i.useState)(Z.kb),d=(0,j.Z)(s,2),l=d[0],f=d[1],p=(0,i.useContext)(c.s),h=p.dataToEdit,v=p.createData,E=p.updateData,y=p.setModal,S=p.setDataToEdit,F=p.modal,C=p.cargando,M=p.setCargando;(0,i.useEffect)((function(){null!==h?(f(h),r.setFieldsValue(h)):f(Z.kb)}),[h]);var k=function(){y(!1),S(null),f(Z.kb),r.resetFields()},P=function(){var e=(0,t.Z)((0,o.Z)().mark((function e(n){var t,r,i;return(0,o.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(t="almacen",null!==h){e.next=9;break}return M(!0),e.next=5,v(l,t);case 5:(r=e.sent)&&((0,u.q)(r.status,r.msg),k(),a(),M(!1)),e.next=14;break;case 9:return M(!0),e.next=12,E(l,h.id,t);case 12:(i=e.sent)&&((0,u.q)(i.status,i.msg),k(),a(),M(!1));case 14:case"end":return e.stop()}}),e)})));return function(a){return e.apply(this,arguments)}}(),N=(0,D.NH)(l,(function(e){var a=e.target,n=a.name,o=a.value;r.setFieldsValue((0,x.Z)({},n,o)),f((function(e){return(0,b.Z)((0,b.Z)({},e),{},(0,x.Z)({},n,o))}))}));return(0,g.jsx)(g.Fragment,{children:(0,g.jsx)(T.Z,{className:"modal-almacen",title:h?"Editar almac\xe9n":"Registrar almac\xe9n",open:F,width:400,closeModal:k,children:(0,g.jsxs)(w.Z,{form:r,className:"modal-body",onFinish:P,layout:"horizontal",children:[N.map((function(e){return(0,g.jsx)(w.Z.Item,{name:e.name,rules:e.rules,style:{marginBottom:"8px"},children:(0,g.jsxs)(g.Fragment,{children:[e.label,e.type]})})})),(0,g.jsx)(w.Z.Item,{className:"button-container",children:(0,g.jsx)(m.ZP,{htmlType:"submit",icon:(0,g.jsx)(_.lFz,{}),loading:!!C,children:h?"Editar":"Registrar"})})]})})})},y=function(){var e=(0,i.useContext)(c.s),a=e.getData,n=e.data,p=e.setData,m=(e.dataToEdit,e.setDataToEdit),_=(e.modal,e.setModal),h=e.deleteData,b=(0,d.Z)(n).result,x=function(){var e=(0,t.Z)((0,o.Z)().mark((function e(){var n;return(0,o.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return"almacen",e.next=3,a("almacen");case 3:n=e.sent,p(n.data);case 5:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}();(0,i.useEffect)((function(){x()}),[]);var j=function(){var e=(0,t.Z)((0,o.Z)().mark((function e(a){var n;return(0,o.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return"almacen",e.next=3,h("almacen",a);case 3:(n=e.sent)&&((0,u.q)(n.status,n.msg),x());case 5:case"end":return e.stop()}}),e)})));return function(a){return e.apply(this,arguments)}}(),Z=(0,s.iF)((function(e){m(e),_(!0)}),j);return(0,g.jsxs)(g.Fragment,{children:[(0,g.jsx)(l.Z,{text:"Almacenes",user:"Usuario",ruta:"/logistica"}),(0,g.jsxs)("div",{className:"margenes",children:[(0,g.jsx)(v,{abrirModal:_}),(null===b||void 0===b?void 0:b.length)>0?(0,g.jsx)(f.Z,{columns:Z,table:b}):(0,g.jsx)(r.Z,{image:r.Z.PRESENTED_IMAGE_SIMPLE,description:(0,g.jsx)("span",{children:"No hay registros para mostrar."})})]}),(0,g.jsx)(E,{actualizarTabla:x})]})}},69967:function(e,a,n){n(72791);var o=n(49998),t=n(80184);a.Z=function(e){var a=e.className,n=e.title,r=e.open,i=e.width,c=e.closeModal,s=e.children;return(0,t.jsx)(o.Z,{destroyOnClose:!0,className:a,title:n,open:r,centered:!0,onCancel:c,footer:null,width:i,children:s})}},4808:function(e,a,n){var o=n(29439),t=n(72791),r=n(43513),i=n(34664),c=(n(51279),n(76487),n(80184));a.Z=function(e){var a=e.columns,n=e.table,s=e.filas,u=t.useState(!0),d=(0,o.Z)(u,2),l=(d[0],d[1]),f=t.useState([]),p=(0,o.Z)(f,2),m=(p[0],p[1]);t.useEffect((function(){var e=setTimeout((function(){m(n),l(!1)}),2e3);return function(){return clearTimeout(e)}}),[]);var _=s?[s,2*s,3*s,4*s,5*s]:[10,20,30,40,50];return(0,c.jsx)("div",{className:"table-container",children:(0,c.jsx)(r.ZP,{columns:a,data:n,pagination:!0,striped:!0,highlightOnHover:!0,responsive:!0,paginationComponentOptions:{rowsPerPageText:"Filas por p\xe1gina",rangeSeparatorText:"de",selectAllRowsItem:!1,selectAllRowsItemText:"Todos",preserveSelectedOnPageChange:!0},paginationPerPage:s||10,paginationRowsPerPageOptions:_,noDataComponent:(0,c.jsx)(i.Z,{image:i.Z.PRESENTED_IMAGE_SIMPLE,description:(0,c.jsx)("span",{children:"No hay registros para mostrar."})})})})}},16026:function(e,a,n){n.d(a,{Bq:function(){return m},FH:function(){return t},FN:function(){return o},JL:function(){return r},LR:function(){return u},Md:function(){return l},Oj:function(){return i},TT:function(){return g},Tc:function(){return h},XK:function(){return v},bf:function(){return Z},cB:function(){return x},d_:function(){return d},eJ:function(){return s},eT:function(){return b},g5:function(){return c},kb:function(){return p},n4:function(){return j},s:function(){return f},v2:function(){return _}});var o={nombre:"",usuario:"",contrasenia:"",estado:""},t={nombre:""},r={nombre:"",direccion:""},i=function(){return{dni:"",codigo_trabajador:"",fecha_nacimiento:"",telefono:"",nombre:"",apellido_paterno:"",apellido_materno:"",email:"",estado_civil:"",genero:"",direccion:"",asociacion_id:null,eliminar:!1}},c=function(e){return{fecha_evaluacion:"",capacitacion_sso:"",capacitacion_gema:"",evaluacion_laboral:"",presion_arterial:"",temperatura:"",saturacion:"",imc:"",pulso:"",diabetes:"",antecedentes:"",emo:"",trabajador_id:e.dni,aprobado:"",recomendado_por:"",cooperativa:"",condicion_cooperativa:"",fiscalizador:"",fiscalizador_aprobado:"no",control:"no",topico:"no",seguridad:"no",medio_ambiente:"no",recursos_humanos:"no",topico_observacion:"",control_observacion:"",seguridad_observacion:"",medio_ambiente_observacion:"",recursos_humanos_observacion:"",finalizado:!1,gerencia_id:"",area_id:"",puesto_id:"",campamento_id:""}},s=function(e,a){var n;return{fecha_inicio:"",codigo_contrato:"",tipo_contrato:"",recomendado_por:"",cooperativa:"",condicion_cooperativa:"",periodo_trabajo:"",fecha_fin:"",gerencia_id:"",area_id:"",jefe_directo:"",base:"",termino_contrato:"",campamento_id:"",nota_contrato:"",asociacion_id:e&&(null===e||void 0===e?void 0:e.id),estado:!1,evaluacion_id:a,trabajadores:null===e||void 0===e||null===(n=e.trabajador)||void 0===n?void 0:n.map((function(e){return e.dni})),tareo:""}},u=function(e){return{fecha_inicio:"",codigo_contrato:"",tipo_contrato:"",recomendado_por:"",cooperativa:"",condicion_cooperativa:"",periodo_trabajo:"",fecha_fin:"",gerencia:"",area:"",jefe_directo:"",base:"",termino_contrato:"",campamento_id:"",nota_contrato:"",puesto:"",estado:!1,empresa_id:e}},d=function(e){return{sucursal_id:e,fecha:"",movimiento:"",forma_pago:"",encargado:"",area:"",cantidad:"",medida:"",descripcion:"",monto:"",proveedor:"",comprobante:"",dni:"",sucursal_transferencia:"",precio:""}},l={nombre:""},f={nombre:"",codigo:"",descripcion:"",saldo_inicial:""},p={nombre:"",codigo:"",descripcion:""},m=function(e,a){return{codigo:parseInt(a)+1,nombre:"",codigo_interno:"",codigo_barras:"",descripcion:"",categoria_id:"",unidad_id:"",precio:"",fecha:"",observacion:"",almacen_id:"",stock:"0",costo_total:""}},_=function(e){return{codigo:"",motivo:"",fecha:"",encargado:"",codigo_compra:"",boleta:"",codigo_requerimiento:"",producto_id:"",categoria:"",cantidad:"",unidad:"",tipo:e,producto:"",almacen_id:"",codigo_pedido:"",costo:"",dni:"",costo_total:"",area_id:"",personal:"",retornable:""}},g=function(e,a){return{codigo:"",fecha_pedido:"",fecha_entrega:"",solicitante:"",area:"",celular:"",proyecto:"",producto_id:"",cantidad:"",unidad:"",estado:"",producto:"",personal:"",dni:""}},h=function(){return{id:"",nombre:"",contrato_id:"",observacion:"",fecha_pago:new Date,teletrans:"",tipo:"incentivo",trabajador_dni:""}},v=function(){return{id:"",observacion:"",fecha_pago:new Date,teletrans:"",tipo:"incentivo",trabajadores:[]}},b=function(){return{id:"",razon_social:"",contrato_id:"",observacion:"",fecha_pago:new Date,teletrans:"",volquetes:"",tipo:"casa"}},x=function(){return{id:"",nombre:"",trabajador_dni:"",observacion:"",fecha_pago:new Date,hora:new Date,placa:"",propietario:"",trapiche:"",volquetes:"",teletrans:"",tipo:"extraordinario"}},j=function(){return{id:"",hora:new Date,placa:"",propietario:"",trapiche:"",volquetes:"",teletrans:""}},Z=function(){return{id:"",observacion:"",fecha_pago:new Date,teletrans:"",volquetes:"",tipo:"asociacion",contrato_id:"",asociacion:[]}}},95579:function(e,a,n){var o=n(72791),t=n(38411);a.Z=function(e){var a=(0,o.useContext)(t.s),n=a.filterText,r=(a.filterTextModal,a.result),i=a.setResult;return(0,o.useEffect)((function(){if(""!==n){var a=e.filter((function(e){return Object.values(e).join("").toLowerCase().includes(n.toLowerCase())}));i(a)}else i(e)}),[n,e]),{result:r}}},35790:function(e,a,n){n.d(a,{Z:function(){return r}});var o={locale:"es_ES",today:"Hoy",now:"Ahora",backToToday:"Volver a hoy",ok:"Aceptar",clear:"Limpiar",month:"Mes",year:"A\xf1o",timeSelect:"Seleccionar hora",dateSelect:"Seleccionar fecha",monthSelect:"Elegir un mes",yearSelect:"Elegir un a\xf1o",decadeSelect:"Elegir una d\xe9cada",yearFormat:"YYYY",dateFormat:"D/M/YYYY",dayFormat:"D",dateTimeFormat:"D/M/YYYY HH:mm:ss",monthBeforeYear:!0,previousMonth:"Mes anterior (PageUp)",nextMonth:"Mes siguiente (PageDown)",previousYear:"A\xf1o anterior (Control + left)",nextYear:"A\xf1o siguiente (Control + right)",previousDecade:"D\xe9cada anterior",nextDecade:"D\xe9cada siguiente",previousCentury:"Siglo anterior",nextCentury:"Siglo siguiente"},t={placeholder:"Seleccionar hora"},r={lang:Object.assign({placeholder:"Seleccionar fecha",rangePlaceholder:["Fecha inicial","Fecha final"]},o),timePickerLocale:Object.assign({},t)}}}]);
//# sourceMappingURL=227.b629b3b2.chunk.js.map