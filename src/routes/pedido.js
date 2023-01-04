const router = require("express").Router();
const pedido = require("../controllers/pedido")



router.get("/", pedido.getPedido)
router.get("/:id", pedido.getPedidoById)
router.post("/", pedido.postPedido)
router.put("/:id", pedido.updatePedido)
router.delete("/:id", pedido.deletePedido)
module.exports = router