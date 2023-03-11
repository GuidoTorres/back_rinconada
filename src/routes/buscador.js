const router = require("express").Router();
const buscador = require("../controllers/buscador");

router.get("/", buscador.BusquedaPagos)



module.exports = router;