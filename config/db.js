const { Sequelize, DataTypes } = require("sequelize");

const DB_URI = process.env.DB_URI;

const sequelize = new Sequelize({
  // database: "heroku_30cfe8f0814e57f",
  // username: "bcbf9d2c2227ee",
  // password: "011e52da",
  // host: "us-cdbr-east-06.cleardb.net",
  // dialect: "mysql",
  // port: 3306,
  database: "heroku_30cfe8f0814e57f",
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
    dni: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
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
    deshabilitado: DataTypes.BOOLEAN,
    foto: DataTypes.STRING,
    eliminar: DataTypes.BOOLEAN
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
    trabajador_id: DataTypes.INTEGER,
    aprobado: DataTypes.STRING,
    control: DataTypes.STRING,
    topico: DataTypes.STRING,
    seguridad: DataTypes.STRING,
    medio_ambiente: DataTypes.STRING,
    recomendado_por: DataTypes.STRING,
    cooperativa: DataTypes.STRING,
    condicion_cooperativa: DataTypes.STRING,
    fiscalizador: DataTypes.STRING,
    fiscalizador_aprobado: DataTypes.STRING,
    topico_observacion: DataTypes.STRING,
    control_observacion: DataTypes.STRING,
    seguridad_observacion: DataTypes.STRING,
    medio_ambiente_observacion: DataTypes.STRING,
    recursos_humanos: DataTypes.STRING,
    recursos_humanos_observacion: DataTypes.STRING,
    finalizado: DataTypes.BOOLEAN,
    eliminar: DataTypes.BOOLEAN
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
    periodo_trabajo: DataTypes.STRING,
    fecha_fin: DataTypes.DATE,
    gerencia: DataTypes.STRING,
    area: DataTypes.STRING,
    jefe_directo: DataTypes.STRING,
    base: DataTypes.STRING,
    termino_contrato: DataTypes.STRING,
    nota_contrato: DataTypes.STRING,
    puesto: DataTypes.STRING,
    campamento_id: DataTypes.INTEGER,
    empresa_id: DataTypes.INTEGER,
    asociacion_id: DataTypes.INTEGER,
    estado: DataTypes.BOOLEAN,
    volquete: DataTypes.STRING,
    teletran: DataTypes.STRING,
    suspendido: DataTypes.BOOLEAN,
    finalizado: DataTypes.BOOLEAN,
    eliminar: DataTypes.BOOLEAN
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
    tipo: DataTypes.STRING,
  },
  {
    tableName: "asociacion",
    timestamp: false,
  }
);

const contratoEvaluacion = sequelize.define(
  "contrato_evaluacion",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    contrato_id: DataTypes.INTEGER,
    evaluacion_id: DataTypes.INTEGER,
  },
  {
    tableName: "contrato_evaluacion",
    timestamp: false,
  }
);

const asistencia = sequelize.define(
  "asistencia",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    fecha: DataTypes.STRING,
    campamento_id: DataTypes.INTEGER,
    hora_ingreso: DataTypes.STRING,
  },
  {
    tableName: "asistencia",
    timestamp: false,
  }
);

const teletrans = sequelize.define(
  "teletrans",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    volquete: DataTypes.STRING,
    total: DataTypes.STRING,
    saldo: DataTypes.STRING,
    contrato_id: DataTypes.INTEGER,
    teletrans: DataTypes.STRING,
  },
  {
    tableName: "teletrans",
    timestamp: false,
  }
);

const trabajadorAsistencia = sequelize.define(
  "trabajador_asistencia",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    asistencia_id: DataTypes.INTEGER,
    trabajador_id: DataTypes.INTEGER,
    asistencia: DataTypes.STRING,
    observacion: DataTypes.STRING,
    hora_ingreso: DataTypes.STRING,
    tarde: DataTypes.STRING,
  },
  {
    tableName: "trabajador_asistencia",
    timestamp: false,
  }
);

const socio = sequelize.define(
  "socio",

  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nombre: DataTypes.STRING,
    dni: DataTypes.STRING,
    telefono: DataTypes.STRING,
    cooperativa: DataTypes.STRING,
  },
  {
    tableName: "socio",
    timestamp: false,
  }
);

const pago = sequelize.define(
  "pago",

  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    conductor: DataTypes.STRING,
    dni: DataTypes.STRING,
    telefono: DataTypes.STRING,
    placa: DataTypes.STRING,
    teletrans: DataTypes.STRING,
    lugar: DataTypes.STRING,
    contrato_id: DataTypes.INTEGER,
  },
  {
    tableName: "pago",
    timestamp: false,
  }
);

const proveedor = sequelize.define(
  "proveedor",

  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nombre: DataTypes.STRING,
    dni: DataTypes.STRING,
    direccion: DataTypes.STRING,
    telefono: DataTypes.STRING,
    descripcion: DataTypes.STRING
  },
  {
    tableName: "proveedor",
    timestamp: false,
  }
);

const sucursal = sequelize.define(
  "sucursal",

  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nombre: DataTypes.STRING,
    codigo: DataTypes.STRING,
    descripcion: DataTypes.STRING,
    saldo_inicial: DataTypes.STRING,
  },
  {
    tableName: "sucursal",
    timestamp: false,
  }
);

const ingresos_egresos = sequelize.define(
  "ingresos_egresos",

  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    fecha: DataTypes.STRING,
    movimiento: DataTypes.STRING,
    forma_pago: DataTypes.STRING,
    encargado: DataTypes.STRING,
    area: DataTypes.STRING,
    cantidad: DataTypes.STRING,
    medida: DataTypes.STRING,
    descripcion: DataTypes.STRING,
    monto: DataTypes.STRING,
    proveedor: DataTypes.STRING,
    comprobante: DataTypes.STRING,
    sucursal_id: DataTypes.INTEGER,
    saldo_inicial: DataTypes.STRING,
    ingresos: DataTypes.STRING,
    egresos: DataTypes.STRING,
    saldo_final: DataTypes.STRING,
    dni: DataTypes.STRING,
    sucursal_transferencia: DataTypes.STRING,
    nro_comprobante: DataTypes.STRING
  },
  {
    tableName: "ingresos_egresos",
    timestamp: false,
  }
);

const saldo = sequelize.define(
  "saldo",

  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    saldo_inicial: DataTypes.STRING,
    ingresos: DataTypes.STRING,
    egresos: DataTypes.STRING,
    saldo_final: DataTypes.STRING,
    sucursal_id: DataTypes.INTEGER,
  },
  {
    tableName: "saldo",
    timestamp: false,
  }
);

const almacen = sequelize.define(
  "almacen",

  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nombre: DataTypes.STRING,
    codigo: DataTypes.STRING,
    descripcion: DataTypes.STRING,
  },
  {
    tableName: "almacen",
    timestamp: false,
  }
);

const producto = sequelize.define(
  "producto",

  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    codigo: DataTypes.STRING,
    codigo_interno: DataTypes.STRING,
    codigo_barras: DataTypes.STRING,
    descripcion: DataTypes.STRING,
    categoria: DataTypes.STRING,
    img: DataTypes.STRING,
    almacen_id: DataTypes.INTEGER,
    nombre: DataTypes.STRING,
    stock: DataTypes.STRING
  },
  {
    tableName: "producto",
    timestamp: false,
  }
);

gerencia.hasMany(area, {
  foreignKey: "gerencia_id",
  onDelete: "CASCADE",
  hooks: true,
});
area.belongsTo(gerencia, {
  foreignKey: "gerencia_id",
  onDelete: "CASCADE",
  hooks: true,
});

area.hasMany(cargo, {
  foreignKey: "area_id",
  onDelete: "CASCADE",
  hooks: true,
});
cargo.belongsTo(area, {
  foreignKey: "area_id",
  onDelete: "CASCADE",
  hooks: true,
});

usuario.hasMany(rolPuesto, {
  foreignKey: "usuario_id",
  onDelete: "CASCADE",
  hooks: true,
});
rolPuesto.belongsTo(usuario, {
  foreignKey: "usuario_id",
  onDelete: "CASCADE",
  hooks: true,
});

cargo.hasMany(rolPuesto, {
  foreignKey: "cargo_id",
  onDelete: "CASCADE",
  hooks: true,
});
rolPuesto.belongsTo(cargo, {
  foreignKey: "cargo_id",
  onDelete: "CASCADE",
  hooks: true,
});

rol.hasMany(rolPuesto, {
  foreignKey: "rol_id",
  onDelete: "CASCADE",
  hooks: true,
});
rolPuesto.belongsTo(rol, {
  foreignKey: "rol_id",
  onDelete: "CASCADE",
  hooks: true,
});

usuario.belongsToMany(trabajador, {
  through: "trabajador_usuario",
  onDelete: "CASCADE",
  hooks: true,
});
trabajador.belongsToMany(usuario, {
  through: "trabajador_usuario",
  onDelete: "CASCADE",
  hooks: true,
});

empresa.hasMany(contrato, {
  foreignKey: "empresa_id",
  onDelete: "CASCADE",
  hooks: true,
});
contrato.belongsTo(empresa, {
  foreignKey: "empresa_id",
  onDelete: "CASCADE",
  hooks: true,
});

campamento.hasMany(contrato, {
  foreignKey: "campamento_id",
  onDelete: "CASCADE",
  hooks: true,
});
contrato.belongsTo(campamento, {
  foreignKey: "campamento_id",
  onDelete: "CASCADE",
  hooks: true,
});

//trabajador contrato evaluacion
asociacion.hasMany(trabajador, {
  foreignKey: "asociacion_id",
  onDelete: "CASCADE",
  hooks: true,
});
trabajador.belongsTo(asociacion, {
  foreignKey: "asociacion_id",
  onDelete: "CASCADE",
  hooks: true,
});

trabajador.hasMany(evaluacion, { foreignKey: "trabajador_id" });
evaluacion.belongsTo(trabajador, { foreignKey: "trabajador_id" });

// contrato evaluacion
contrato.belongsToMany(evaluacion, {
  through: contratoEvaluacion,
  foreignKey: "contrato_id",
});
evaluacion.belongsToMany(contrato, {
  through: contratoEvaluacion,
  foreignKey: "contrato_id",
});

contrato.hasMany(contratoEvaluacion, { foreignKey: "contrato_id" });
contratoEvaluacion.belongsTo(contrato, { foreignKey: "contrato_id" });
evaluacion.hasMany(contratoEvaluacion, { foreignKey: "evaluacion_id" });
contratoEvaluacion.belongsTo(evaluacion, { foreignKey: "evaluacion_id" });

//asociacion contrato

asociacion.hasMany(contrato, { foreignKey: "asociacion_id" });
contrato.belongsTo(asociacion, { foreignKey: "asociacion_id" });

contrato.hasMany(teletrans, { foreignKey: "contrato_id" });
teletrans.hasMany(contrato, { foreignKey: "contrato_id" });

trabajador.belongsToMany(asistencia, { through: trabajadorAsistencia });
asistencia.belongsToMany(trabajador, { through: trabajadorAsistencia });

campamento.hasMany(asistencia, { foreignKey: "campamento_id" });
asistencia.belongsTo(campamento, { foreignKey: "campamento_id" });

asistencia.hasMany(trabajadorAsistencia, { foreignKey: "asistencia_id" });
trabajadorAsistencia.belongsTo(asistencia, { foreignKey: "asistencia_id" });

trabajador.hasMany(trabajadorAsistencia, { foreignKey: "trabajador_id" });
trabajadorAsistencia.belongsTo(trabajador, { foreignKey: "trabajador_id" });

contrato.hasOne(pago, { foreignKey: "contrato_id" }),
pago.belongsTo(contrato, { foreignKey: "contrato_id" });

sucursal.hasMany(ingresos_egresos, { foreignKey: "sucursal_id" });
ingresos_egresos.belongsTo(sucursal, { foreignKey: "sucursal_id" });

sucursal.hasMany(saldo, { foreignKey: "sucursal_id" });
saldo.belongsTo(sucursal, { foreignKey: "sucursal_id" });

almacen.hasMany(producto, {foreignKey:"almacen_id"})
producto.belongsTo(almacen, {foreignKey:"almacen_id"})

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
  contratoEvaluacion,
  asistencia,
  teletrans,
  trabajadorAsistencia,
  socio,
  pago,
  proveedor,
  sucursal,
  ingresos_egresos,
  saldo,
  almacen,
  producto
};
