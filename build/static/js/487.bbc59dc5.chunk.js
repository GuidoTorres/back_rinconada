(self.webpackChunkrinconada=self.webpackChunkrinconada||[]).push([[487],{96202:function(e,t,n){"use strict";n.r(t),n.d(t,{default:function(){return h}});var a=n(4942),r=n(74165),s=n(15861),o=n(29439),i=n(97892),u=n.n(i),c=n(72791),d=n(38411),l=n(53939),m=n(99763),p=n(83188),_=n(34664),f=n(43513),M=n(80184),Y=function(e){var t=e.columns,n=e.table;e.set;return(0,M.jsx)("div",{className:"table-container",children:(0,M.jsx)(f.ZP,{columns:t,data:n,pagination:!0,fixedHeader:!0,striped:!0,highlightOnHover:!0,paginationComponentOptions:{rowsPerPageText:"Filas por p\xe1gina",rangeSeparatorText:"de",selectAllRowsItem:!1,selectAllRowsItemText:"Todos"},responsive:!0,noHeader:!0,noDataComponent:(0,M.jsx)(_.Z,{image:_.Z.PRESENTED_IMAGE_SIMPLE,description:(0,M.jsx)("span",{children:"No hay registros para mostrar."})})})})},h=(n(50657),function(){var e=(0,c.useState)([]),t=(0,o.Z)(e,2),n=t[0],i=t[1],_=(0,c.useContext)(d.s),f=_.getData,h=_.updateData,v=function(){var e=(0,s.Z)((0,r.Z)().mark((function e(){var t;return(0,r.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,f("planilla/aprobacion");case 2:(t=e.sent)&&i(t.data);case 4:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}();(0,c.useEffect)((function(){v()}),[]);var L=function(){var e=(0,s.Z)((0,r.Z)().mark((function e(t,n){var s,o,i,c,d;return(0,r.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return"planilla/asistencia",t.target.checked&&(o=JSON.parse(localStorage.getItem("firma"))),s={},(0,a.Z)(s,t.target.name,o||null),(0,a.Z)(s,"contrato_id",n.contrato_id),(0,a.Z)(s,"subarray_id",n.subArray_id),(0,a.Z)(s,"fecha",u()(new Date).format("DD-MM-YYYY")),i=s,c=n.aprobacion_id?n.aprobacion_id:0,e.next=6,h(i,c,"planilla/asistencia");case 6:(d=e.sent)&&((0,m.q)(d.status,d.msg),v());case 8:case"end":return e.stop()}}),e)})));return function(t,n){return e.apply(this,arguments)}}(),g=(0,l.x6)(L);return(0,M.jsxs)(M.Fragment,{children:[(0,M.jsx)(p.Z,{text:"Aprobaciones",user:"Usuario",ruta:"/planillas"}),(0,M.jsx)("div",{className:"margenes",children:(0,M.jsx)(Y,{columns:g,table:n})})]})})},52563:function(e,t,n){e.exports=function(e){"use strict";function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var n=t(e),a={name:"es",monthsShort:"ene_feb_mar_abr_may_jun_jul_ago_sep_oct_nov_dic".split("_"),weekdays:"domingo_lunes_martes_mi\xe9rcoles_jueves_viernes_s\xe1bado".split("_"),weekdaysShort:"dom._lun._mar._mi\xe9._jue._vie._s\xe1b.".split("_"),weekdaysMin:"do_lu_ma_mi_ju_vi_s\xe1".split("_"),months:"enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre".split("_"),weekStart:1,formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD/MM/YYYY",LL:"D [de] MMMM [de] YYYY",LLL:"D [de] MMMM [de] YYYY H:mm",LLLL:"dddd, D [de] MMMM [de] YYYY H:mm"},relativeTime:{future:"en %s",past:"hace %s",s:"unos segundos",m:"un minuto",mm:"%d minutos",h:"una hora",hh:"%d horas",d:"un d\xeda",dd:"%d d\xedas",M:"un mes",MM:"%d meses",y:"un a\xf1o",yy:"%d a\xf1os"},ordinal:function(e){return e+"\xba"}};return n.default.locale(a,null,!0),a}(n(97892))},99893:function(e){e.exports=function(){"use strict";var e={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"};return function(t,n,a){var r=n.prototype,s=r.format;a.en.formats=e,r.format=function(t){void 0===t&&(t="YYYY-MM-DDTHH:mm:ssZ");var n=this.$locale().formats,a=function(t,n){return t.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g,(function(t,a,r){var s=r&&r.toUpperCase();return a||n[r]||e[r]||n[s].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,(function(e,t,n){return t||n.slice(1)}))}))}(t,void 0===n?{}:n);return s.call(this,a)}}}()}}]);
//# sourceMappingURL=487.bbc59dc5.chunk.js.map