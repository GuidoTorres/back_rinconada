require("dotenv").config();
const express = require("express");
const cors = require("cors");
const trabajadorRouter = require("./src/routes/trabajador");
const usuarioRouter = require("./src/routes/usuario");
const campamentoRouter = require("./src/routes/campamento");
const rolRouter = require("./src/routes/rol");

const app = express();

const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

app.use("/api/v1/trabajor", trabajadorRouter);
app.use("/api/v1/usuario", usuarioRouter);
app.use("/api/v1/campamento", campamentoRouter);
app.use("/api/v1/rol", rolRouter);

app.listen(PORT, () => {
  console.log("server funcionando en puerto", PORT);
});