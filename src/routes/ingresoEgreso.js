const router = require("express").Router();
const ingresoEgreso = require("../controllers/ingresoEgreso");

router.get("/", ingresoEgreso.getIngresoEgresos);
router.get("/trabajador", ingresoEgreso.getTrabajadorFinanza);
router.get("/saldo/:id", ingresoEgreso.getSaldoMensual)
router.post("/reporte/:id", ingresoEgreso.reporteIngreso);
router.get("/sucursal/:id", ingresoEgreso.getIngresoEgresosById);
router.post("/", ingresoEgreso.postIngresoEgreso);
router.put("/:id", ingresoEgreso.updateIngresoEgreso);
router.delete("/:id", ingresoEgreso.deleteIngresoEgreso);
router.get("/excel/:id", ingresoEgreso.convertJsonToExcel);
module.exports = router;
