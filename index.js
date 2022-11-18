require("dotenv").config();
const express = require("express");
const cors = require("cors");
const trabajadorRouter = require("./src/routes/trabajador");
const usuarioRouter = require("./src/routes/usuario");
const campamentoRouter = require("./src/routes/campamento");
const rolRouter = require("./src/routes/rol");
const cargoRouter = require("./src/routes/cargo");
const puestoRouter = require("./src/routes/puesto");
const contratoRouter = require("./src/routes/contrato");
const evaluacioRouter = require("./src/routes/evaluacion");
const gerenciaRouter = require("./src/routes/gerencia");
const areaRouter = require("./src/routes/area");
const empresaRouter = require("./src/routes/empresa");
const asociacionRouter = require("./src/routes/asociacion");
const planillaRouter = require("./src/routes/planilla");
const asistenciaRouter = require("./src/routes/asistencia");
const socioRouter = require("./src/routes/socio");
const pagoRouter = require("./src/routes/pagos");

const app = express();

const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

app.use(express.static("images"));
app.use("/api/v1/trabajador", trabajadorRouter);
app.use("/api/v1/usuario", usuarioRouter);
app.use("/api/v1/campamento", campamentoRouter);
app.use("/api/v1/rol", rolRouter);
app.use("/api/v1/cargo", cargoRouter);
app.use("/api/v1/puesto", puestoRouter);
app.use("/api/v1/contrato", contratoRouter);
app.use("/api/v1/evaluacion", evaluacioRouter);
app.use("/api/v1/gerencia", gerenciaRouter);
app.use("/api/v1/area", areaRouter);
app.use("/api/v1/empresa", empresaRouter);
app.use("/api/v1/asociacion", asociacionRouter);
app.use("/api/v1/planilla", planillaRouter);
app.use("/api/v1/asistencia", asistenciaRouter);
app.use("/api/v1/socio", socioRouter);
app.use("/api/v1/pago", pagoRouter);

app.listen(PORT, () => {
  console.log("server funcionando en puerto", PORT);
});
