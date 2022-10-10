require("dotenv").config();
const express = require("express");
const cors = require("cors");
const trabajadorRouter = require("./src/routes/trabajador");
const usuarioRouter = require("./src/routes/usuario");
const campamentoRouter = require("./src/routes/campamento");
const rolRouter = require("./src/routes/rol");
const { usuario, rolPuesto, gerencia, area, cargo, rol, trabajador } = require("./config/db");

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


usuario.hasMany(rolPuesto, { foreignKey: "usuario_id" });
rolPuesto.belongsTo(usuario, { foreignKey: "usuario_id" });

gerencia.hasMany(area, { foreignKey: "gerencia_id" });
area.belongsTo(gerencia, { foreignKey: "gerencia_id" });

area.hasMany(cargo, { foreignKey: "area_id" });
cargo.belongsTo(area, { foreignKey: "area_id" });

cargo.hasMany(rolPuesto, { foreignKey: "cargo_id" });
rolPuesto.belongsTo(cargo, { foreignKey: "cargo_id" });

rol.hasMany(rolPuesto, { foreignKey: "rol_id" });
rolPuesto.belongsTo(rol, { foreignKey: "rol_id" });

usuario.belongsToMany(trabajador, { through: "trabajador_usuario" });
trabajador.belongsToMany(usuario, { through: "trabajador_usuario" });


