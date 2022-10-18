const { Sequelize, DataTypes } = require("sequelize");

const DB_URI = process.env.DB_URI;

const sequelize = new Sequelize({
  database: "rinconada",
  username: "root",
  password: "Tupapi00",
  host: "localhost",
  dialect: "mysql",
  port: 3306,
  define: { timestamps: false, freezeTableName: true },
});

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
    codigo_trabajador: DataTypes.STRING,
    fecha_nacimiento: DataTypes.DATE,
    telefono: DataTypes.INTEGER,
    apellido_paterno: DataTypes.STRING,
    apellido_materno: DataTypes.STRING,
    nombre: DataTypes.STRING,
    email: DataTypes.STRING,
    estado_civil: DataTypes.STRING,
    genero: DataTypes.STRING,
    direccion: DataTypes.STRING,
    asociacion_id: DataTypes.INTEGER,
    deshabilitado: DataTypes.BOOLEAN
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
    puesto: DataTypes.STRING,
    capacitacion_sso: DataTypes.INTEGER,
    capacitacion_gema: DataTypes.INTEGER,
    evaluacion_laboral: DataTypes.INTEGER,
    presion_arterial: DataTypes.FLOAT,
    temperatura: DataTypes.FLOAT,
    saturacion: DataTypes.FLOAT,
    imc: DataTypes.FLOAT,
    pulso: DataTypes.FLOAT,
    diabetes: DataTypes.STRING,
    antecedentes: DataTypes.STRING,
    emo: DataTypes.STRING,
    contrato_id: DataTypes.INTEGER
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
    periodo_trabajo: DataTypes.STRING,
    fecha_fin: DataTypes.DATE,
    gerencia: DataTypes.STRING,
    area: DataTypes.STRING,
    jefe_directo: DataTypes.STRING,
    base: DataTypes.STRING,
    termino_contrato: DataTypes.STRING,
    nota_contrato: DataTypes.STRING,
    puesto: DataTypes.STRING,
    trabajador_id: DataTypes.INTEGER,
    campamento_id: DataTypes.INTEGER,
    empresa_id: DataTypes.INTEGER,
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

const empresa = sequelize.define(
  "empresa",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    razon_social: DataTypes.STRING,
    ruc: DataTypes.STRING,
  },
  {
    tableName: "empresa",
    timestamp: false,
  }
);

const asociacion = sequelize.define(
  "asociacion",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nombre: DataTypes.STRING,
    codigo: DataTypes.STRING,
  },
  {
    tableName: "asociacion",
    timestamp: false,
  }
);



gerencia.hasMany(area, { foreignKey: "gerencia_id" });
area.belongsTo(gerencia, { foreignKey: "gerencia_id" });

area.hasMany(cargo, { foreignKey: "area_id" });
cargo.belongsTo(area, { foreignKey: "area_id" });

usuario.hasMany(rolPuesto, { foreignKey: "usuario_id", onDelete: "cascade" });
rolPuesto.belongsTo(usuario, { foreignKey: "usuario_id", onDelete: "cascade" });

cargo.hasMany(rolPuesto, { foreignKey: "cargo_id" });
rolPuesto.belongsTo(cargo, { foreignKey: "cargo_id" });

rol.hasMany(rolPuesto, { foreignKey: "rol_id" });
rolPuesto.belongsTo(rol, { foreignKey: "rol_id" });

usuario.belongsToMany(trabajador, { through: "trabajador_usuario" });
trabajador.belongsToMany(usuario, { through: "trabajador_usuario" });

asociacion.hasMany(trabajador, { foreignKey: "asociacion_id" });
trabajador.belongsTo(asociacion, { foreignKey: "asociacion_id" });

empresa.hasMany(contrato, { foreignKey: "empresa_id" });
contrato.belongsTo(empresa, { foreignKey: "empresa_id" });


campamento.hasMany(contrato, { foreignKey: "campamento_id" });
contrato.belongsTo(campamento, { foreignKey: "campamento_id" });

asociacion.hasMany(trabajador, {as:"trabajador", foreignKey: "asociacion_id"})
trabajador.belongsTo(asociacion, {as:"trabajador", foreignKey: "asociacion_id"})


//trabajador contrato evaluacion

trabajador.hasMany(contrato, { foreignKey: "trabajador_id" });
contrato.belongsTo(trabajador, { foreignKey: "trabajador_id" });

contrato.hasMany(evaluacion, { foreignKey: "contrato_id" });
evaluacion.belongsTo(contrato, { foreignKey: "contrato_id" });



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
  empresa,
  asociacion,
};
