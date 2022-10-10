const { Sequelize, DataTypes } = require("sequelize");

const DB_URI = process.env.DB_URI;

const sequelize = new Sequelize({
  database: "rinconada",
  username: "root",
  password: "Tupapi00",
  host: "localhost",
  dialect: "mysql",
  define: { timestamps: false },
});

// const trabajador = trabajadorModel(sequelize, DataTypes);
// const campamento = campamentoModel(sequelize, DataTypes);
// const cargo = cargoModel(sequelize, DataTypes);
// const contrato = contratoModel(sequelize, DataTypes);
// const evaluacion = evaluacionModel(sequelize, DataTypes);
// // const usuario = usuarioModel(sequelize, DataTypes);
// const gerencia = gerenciaModel(sequelize, DataTypes);
// const rol = rolModel(sequelize, DataTypes);
// // const rolPuesto = rolPuestoModel(sequelize, DataTypes);
// const area = areaModel(sequelize, DataTypes);

const dbConnect = async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexion con bd exitosa!!");
  } catch (error) {
    console.log(error);
  }
};

dbConnect();

const usuario = sequelize.define(
  "usuario",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nombre: { type: DataTypes.STRING },
    contrasenia: { type: DataTypes.STRING },
    usuario: { type: DataTypes.STRING },
    estado: { type: DataTypes.BOOLEAN },
  },
  {
    tableName: "usuario",
    timestamp: false,
  }
);

const rolPuesto = sequelize.define(
  "rol_puesto",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    cargo_id: { type: DataTypes.INTEGER, allowNull: false },
    rol_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: "rol_puesto",
    timestamp: false,
  }
);

const trabajador = sequelize.define(
  "trabajador",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    dni: DataTypes.INTEGER,
    codigo_trabajador: DataTypes.INTEGER,
    fecha_nacimiento: DataTypes.DATE,
    telefono: DataTypes.INTEGER,
    apellido_paterno: DataTypes.STRING,
    apellido_materno: DataTypes.STRING,
    email: DataTypes.STRING,
    estado_civil: DataTypes.STRING,
    genero: DataTypes.STRING,
    direccion: DataTypes.STRING,
    tipo_trabajador: DataTypes.STRING,
  },
  {
    tableName: "trabajador",
    timestamp: false,
  }
);

const rol = sequelize.define(
  "rol",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nombre: DataTypes.STRING,
  },
  {
    tableName: "rol",
    timestamp: false,
  }
);

const gerencia = sequelize.define(
  "gerencia",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nombre: DataTypes.STRING,
  },
  {
    tableName: "gerencia",
    timestamp: false,
  }
);

const evaluacion = sequelize.define(
  "evaluacion",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    fecha_evaluacion: DataTypes.DATE,
    dni: DataTypes.INTEGER,
    puesto: DataTypes.STRING,
    contrato_id: DataTypes.INTEGER,
    capacitacion_sso: DataTypes.INTEGER,
    capacitacion_gema: DataTypes.INTEGER,
    evaluacion_laboral: DataTypes.INTEGER,
    presion_arterial: DataTypes.FLOAT,
    temperatura: DataTypes.FLOAT,
    saturacion: DataTypes.FLOAT,
    imc: DataTypes.FLOAT,
    pulso: DataTypes.FLOAT,
    diabetes: DataTypes.STRING,
    antecendentes: DataTypes.TEXT("long"),
    emo: DataTypes.BLOB,
  },
  {
    tableName: "evaluacion",
    timestamp: false,
  }
);

const contrato = sequelize.define(
  "contrato",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    fecha_inicio: DataTypes.DATE,
    codigo_contrato: DataTypes.INTEGER,
    tipo_contrato: DataTypes.STRING,
    recomendado_por: DataTypes.STRING,
    cooperativa: DataTypes.STRING,
    condicion_cooperativa: DataTypes.STRING,
    id_campamento: DataTypes.INTEGER,
    periodo_trabajo: DataTypes.STRING,
    fecha_fin: DataTypes.DATE,
    gerencia: DataTypes.STRING,
    area: DataTypes.STRING,
    jefe_directo: DataTypes.STRING,
    base: DataTypes.STRING,
    termino_contrato: DataTypes.TEXT("long"),
  },
  {
    tableName: "contrato",
    timestamp: false,
  }
);

const cargo = sequelize.define(
  "cargo",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nombre: DataTypes.STRING,
    area_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: "cargo",
    timestamp: false,
  }
);

const campamento = sequelize.define(
  "campamento",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nombre: DataTypes.STRING,
    direccion: DataTypes.STRING,
    trabajador_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: "campamento",
    timestamp: false,
  }
);

const area = sequelize.define(
  "area",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nombre: DataTypes.STRING,
    gerencia_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: "area",
    timestamp: false,
  }
);

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



module.exports = {
  trabajador,
  campamento,
  usuario,
  cargo,
  contrato,
  evaluacion,
  gerencia,
  rol,
  area,
  rolPuesto,
};
