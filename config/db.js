const { Sequelize, DataTypes } = require("sequelize");

const DB_URI = process.env.DB_URI;

const sequelize = new Sequelize({
  database: "rinconada",
  username: "root",
  password: "root",
  host: "localhost",
  dialect: "mysql",
  port: "3306",
  define: { timestamps: false, freezeTableName: true },
  dialectOptions: { decimalNumbers: true },
});
const dbConnect = async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexión con bd exitosa!!");
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
    nombre: DataTypes.STRING,
    contrasenia: DataTypes.STRING,
    usuario: DataTypes.STRING,
    estado: DataTypes.BOOLEAN,
    rol_id: DataTypes.INTEGER,
    cargo_id: DataTypes.INTEGER,
    trabajador_dni: DataTypes.INTEGER,
    foto: DataTypes.STRING,
  },
  {
    tableName: "usuario",
    timestamp: false,
  }
);

const trabajador = sequelize.define(
  "trabajador",
  {
    dni: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    codigo_trabajador: DataTypes.STRING,
    fecha_nacimiento: DataTypes.STRING,
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
    eliminar: DataTypes.BOOLEAN,
  },
  {
    tableName: "trabajador",
    timestamp: false,
  }
);

const trabajador_contrato = sequelize.define(
  "trabajador_contrato",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    contrato_id: DataTypes.INTEGER,
    trabajador_dni: DataTypes.STRING,
  },
  {
    tableName: "trabajador_contrato",
    timestamp: false,
  }
);

const aprobacion_contrato_pago = sequelize.define(
  "aprobacion_contrato_pago",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    firma_jefe: DataTypes.STRING,
    firma_gerente: DataTypes.STRING,
    huella: DataTypes.STRING,
    estado: DataTypes.BOOLEAN,
    contrato_id: DataTypes.INTEGER,
    fecha: DataTypes.STRING,
    subarray_id: DataTypes.STRING,
    pagado: DataTypes.BOOLEAN,
  },
  {
    tableName: "aprobacion_contrato_pago",
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
    descripcion: DataTypes.STRING,
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
    trabajador_id: DataTypes.STRING,
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
    eliminar: DataTypes.BOOLEAN,
    gerencia_id: DataTypes.INTEGER,
    area_id: DataTypes.INTEGER,
    puesto_id: DataTypes.INTEGER,
    campamento_id: DataTypes.INTEGER,
    suspendido: DataTypes.BOOLEAN,
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
    jefe_directo: DataTypes.STRING,
    base: DataTypes.STRING,
    termino_contrato: DataTypes.STRING,
    nota_contrato: DataTypes.STRING,
    campamento_id: DataTypes.INTEGER,
    empresa_id: DataTypes.INTEGER,
    asociacion_id: DataTypes.INTEGER,
    estado: DataTypes.BOOLEAN,
    volquete: DataTypes.STRING,
    teletran: DataTypes.STRING,
    suspendido: DataTypes.BOOLEAN,
    finalizado: DataTypes.BOOLEAN,
    eliminar: DataTypes.BOOLEAN,
    tareo: DataTypes.STRING,
    gerencia_id: DataTypes.INTEGER,
    area_id: DataTypes.INTEGER,
    puesto_id: DataTypes.INTEGER,
    suspendido: DataTypes.BOOLEAN,
    fecha_fin_estimada: DataTypes.BOOLEAN,
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
    trabajador_id: DataTypes.STRING,
    asistencia: DataTypes.STRING,
    observacion: DataTypes.STRING,
    hora_ingreso: DataTypes.STRING,
    tarde: DataTypes.STRING,
    firma_gerente: DataTypes.STRING,
    firma_jefe: DataTypes.STRING,
    foto: DataTypes.STRING,
    revisada: DataTypes.BOOLEAN,
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

    teletrans: DataTypes.STRING,
    observacion: DataTypes.STRING,
    fecha_pago: DataTypes.STRING,
    estado: DataTypes.BOOLEAN,
    tipo: DataTypes.STRING,
    volquetes: DataTypes.STRING,
  },
  {
    tableName: "pago",
    timestamp: false,
  }
);

const contrato_pago = sequelize.define(
  "contrato_pago",

  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    contrato_id: DataTypes.INTEGER,
    pago_id: DataTypes.INTEGER,
    teletrans: DataTypes.STRING,
    volquetes: DataTypes.STRING,
  },
  {
    tableName: "contrato_pago",
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
    descripcion: DataTypes.STRING,
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
    saldo_inicial: DataTypes.FLOAT,
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
    saldo_inicial: DataTypes.DECIMAL(10, 2),
    ingresos: DataTypes.DECIMAL(10, 2),
    egresos: DataTypes.DECIMAL(10, 2),
    saldo_final: DataTypes.DECIMAL(10, 2),
    dni: DataTypes.STRING,
    sucursal_transferencia: DataTypes.STRING,
    nro_comprobante: DataTypes.STRING,
    precio: DataTypes.STRING,
    categoria: DataTypes.STRING,
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
    saldo_inicial: DataTypes.DECIMAL(10, 2),
    ingresos: DataTypes.DECIMAL(10, 2),
    egresos: DataTypes.DECIMAL(10, 2),
    saldo_final: DataTypes.DECIMAL(10, 2),
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
    categoria_id: DataTypes.INTEGER,
    foto: DataTypes.STRING,
    almacen_id: DataTypes.INTEGER,
    nombre: DataTypes.STRING,
    stock: DataTypes.STRING,
    unidad_id: DataTypes.INTEGER,
    precio: DataTypes.STRING,
    fecha: DataTypes.STRING,
    observacion: DataTypes.STRING,
    costo_total: DataTypes.STRING,
  },
  {
    tableName: "producto",
    timestamp: false,
  }
);

const entrada_salida = sequelize.define(
  "entrada_salida",

  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    codigo: DataTypes.STRING,
    motivo: DataTypes.STRING,
    fecha: DataTypes.STRING,
    encargado: DataTypes.STRING,
    codigo_compra: DataTypes.STRING,
    tipo: DataTypes.STRING,
    almacen_id: DataTypes.INTEGER,
    boleta: DataTypes.STRING,
    codigo_requerimiento: DataTypes.STRING,
    area_id: DataTypes.INTEGER,
    dni: DataTypes.STRING,
    costo_total: DataTypes.STRING,
    codigo_pedido: DataTypes.STRING,
    retornable: DataTypes.BOOLEAN,
  },
  {
    tableName: "entrada_salida",
    timestamp: false,
  }
);

const producto_entrada_salida = sequelize.define(
  "producto_entrada_salida",

  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    entrada_salida_id: DataTypes.INTEGER,
    producto_id: DataTypes.INTEGER,
    categoria: DataTypes.STRING,
    cantidad: DataTypes.STRING,
    costo: DataTypes.STRING,
  },
  {
    tableName: "producto_entrada_salida",
    timestamp: false,
  }
);

const requerimiento = sequelize.define(
  "requerimiento",

  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    fecha_pedido: DataTypes.STRING,
    fecha_entrega: DataTypes.STRING,
    solicitante: DataTypes.STRING,
    area: DataTypes.STRING,
    celular: DataTypes.STRING,
    proyecto: DataTypes.STRING,
    codigo_requerimiento: DataTypes.STRING,
    almacen_id: DataTypes.INTEGER,
    estado: DataTypes.STRING,
    aprobacion_jefe: DataTypes.BOOLEAN,
    aprobacion_gerente: DataTypes.BOOLEAN,
    aprobacion_superintendente: DataTypes.BOOLEAN,
    completado: DataTypes.STRING,
    dni: DataTypes.STRING,
    firma_gerente: DataTypes.STRING,
    firma_jefe: DataTypes.STRING,
    firma_superintendente: DataTypes.STRING,
  },
  {
    tableName: "requerimiento",
    timestamp: false,
  }
);

const requerimiento_producto = sequelize.define(
  "requerimiento_producto",

  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    requerimiento_id: DataTypes.INTEGER,
    producto_id: DataTypes.INTEGER,
    cantidad: DataTypes.STRING,
  },
  {
    tableName: "requerimiento_producto",
    timestamp: false,
  }
);

const unidad = sequelize.define(
  "unidad",

  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    codigo: DataTypes.STRING,
    nombre: DataTypes.STRING,
  },
  {
    tableName: "unidad",
    timestamp: false,
  }
);

const pedido = sequelize.define(
  "pedido",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    fecha: DataTypes.STRING,
    estado: DataTypes.STRING,
    area: DataTypes.STRING,
    celular: DataTypes.STRING,
    proyecto: DataTypes.STRING,
    solicitante: DataTypes.STRING,
  },
  {
    tableName: "pedido",
    timestamp: false,
  }
);

const requerimiento_pedido = sequelize.define(
  "requerimiento_pedido",

  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    requerimiento_id: DataTypes.INTEGER,
    pedido_id: DataTypes.INTEGER,
    estado: DataTypes.STRING,
  },
  {
    tableName: "requerimiento_pedido",
    timestamp: false,
  }
);

const transferencia = sequelize.define(
  "transferencia",

  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    fecha: DataTypes.STRING,
    almacen_id: DataTypes.INTEGER,
    almacen_origen: DataTypes.STRING,
    almacen_destino: DataTypes.STRING,
    estado_origen: DataTypes.STRING,
    estado_destino: DataTypes.STRING,
  },
  {
    tableName: "transferencia",
    timestamp: false,
  }
);

const transferencia_producto = sequelize.define(
  "transferencia_producto",

  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    transferencia_id: DataTypes.INTEGER,
    producto_origen: DataTypes.INTEGER,
    producto_destino: DataTypes.INTEGER,
    producto_id: DataTypes.INTEGER,

    cantidad: DataTypes.STRING,
    stock_origen: DataTypes.STRING,
    stock_destino: DataTypes.STRING,
  },
  {
    tableName: "transferencia_producto",
    timestamp: false,
  }
);

const categoria = sequelize.define(
  "categoria",

  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    abreviatura: DataTypes.INTEGER,
    descripcion: DataTypes.INTEGER,
  },
  {
    tableName: "categoria",
    timestamp: false,
  }
);

const permisos = sequelize.define(
  "permisos",

  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    administracion: DataTypes.BOOLEAN,
    administracion_usuario: DataTypes.BOOLEAN,
    administracion_campamento: DataTypes.BOOLEAN,
    administracion_rol: DataTypes.BOOLEAN,
    personal: DataTypes.BOOLEAN,
    personal_trabajador: DataTypes.BOOLEAN,
    personal_grupal: DataTypes.BOOLEAN,
    personal_empresa: DataTypes.BOOLEAN,
    personal_socio: DataTypes.BOOLEAN,
    planillas: DataTypes.BOOLEAN,
    planillas_asistencia: DataTypes.BOOLEAN,
    planillas_control: DataTypes.BOOLEAN,
    logistica: DataTypes.BOOLEAN,
    logistica_inventario: DataTypes.BOOLEAN,
    logistica_almacen: DataTypes.BOOLEAN,
    logistica_requerimiento: DataTypes.BOOLEAN,
    logistica_aprobacion: DataTypes.BOOLEAN,
    logistica_transferencia: DataTypes.BOOLEAN,
    logistica_categoria: DataTypes.BOOLEAN,
    logistica_estadistica: DataTypes.BOOLEAN,
    finanzas: DataTypes.BOOLEAN,
    finanzas_ingreso: DataTypes.BOOLEAN,
    finanzas_proveedor: DataTypes.BOOLEAN,
    finanzas_sucursal: DataTypes.BOOLEAN,
    rol_id: DataTypes.INTEGER,
    personal_contrato: DataTypes.BOOLEAN,
    personal_evaluacion: DataTypes.BOOLEAN,
    personal_trapiche: DataTypes.BOOLEAN,
    personal_volquete: DataTypes.BOOLEAN,
    planillas_programacion: DataTypes.BOOLEAN,
    planillas_realizar_pagos: DataTypes.BOOLEAN,
    planillas_historial: DataTypes.BOOLEAN,
    planillas_incentivos: DataTypes.BOOLEAN,
    planillas_casa: DataTypes.BOOLEAN,
    planillas_asociacion: DataTypes.BOOLEAN,
    logistica_aprobacion_jefe: DataTypes.BOOLEAN,
    logistica_aprobacion_gerente: DataTypes.BOOLEAN,
    logistica_aprobacion_superintendente: DataTypes.BOOLEAN,
  },
  {
    tableName: "permisos",
    timestamp: false,
  }
);

const volquete = sequelize.define(
  "volquete",

  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    placa: DataTypes.STRING,
    propietario: DataTypes.STRING,
  },
  {
    tableName: "volquete",
    timestamp: false,
  }
);

const trapiche = sequelize.define(
  "trapiche",

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
    tableName: "trapiche",
    timestamp: false,
  }
);

const ayuda_pago = sequelize.define(
  "ayuda_pago",

  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    trabajador_dni: DataTypes.STRING,
    pago_id: DataTypes.INTEGER,
    teletrans: DataTypes.STRING,
  },
  {
    tableName: "ayuda_pago",
    timestamp: false,
  }
);

const destino = sequelize.define(
  "destino",

  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    hora: DataTypes.STRING,
    placa: DataTypes.STRING,
    propietario: DataTypes.STRING,
    trapiche: DataTypes.STRING,
    volquetes: DataTypes.STRING,
    teletrans: DataTypes.STRING,
  },
  {
    tableName: "destino",
    timestamp: false,
  }
);
const destino_pago = sequelize.define(
  "destino_pago",

  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    pago_id: DataTypes.INTEGER,
    destino_id: DataTypes.INTEGER,
    estado: DataTypes.BOOLEAN,
  },
  {
    tableName: "destino_pago",
    timestamp: false,
  }
);

const pago_asociacion = sequelize.define(
  "pago_asociacion",

  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    teletrans: DataTypes.STRING,
    contrato_pago_id: DataTypes.STRING,
    trabajador_dni: DataTypes.INTEGER,
  },
  {
    tableName: "pago_asociacion",
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

rol.hasMany(usuario, { foreignKey: "rol_id" });
usuario.belongsTo(rol, { foreignKey: "rol_id" });

usuario.hasOne(cargo, { foreignKey: "cargo_id" });
cargo.belongsTo(usuario, { foreignKey: "cargo_id" });

gerencia.hasMany(contrato, { foreignKey: "gerencia_id" });
contrato.belongsTo(gerencia, { foreignKey: "gerencia_id" });
area.hasMany(contrato, { foreignKey: "area_id" });
contrato.belongsTo(area, { foreignKey: "area_id" });
cargo.hasMany(contrato, { foreignKey: "puesto_id" });
contrato.belongsTo(cargo, { foreignKey: "puesto_id" });

// contrato.hasOne(campamento, { foreignKey: "campamento_id" });
// campamento.belongsTo(contrato, { foreignKey: "campamento_id" });
gerencia.hasMany(evaluacion, { foreignKey: "gerencia_id" });
evaluacion.belongsTo(gerencia, { foreignKey: "gerencia_id" });
area.hasMany(evaluacion, { foreignKey: "area_id" });
evaluacion.belongsTo(area, { foreignKey: "area_id" });

cargo.hasMany(evaluacion, { foreignKey: "puesto_id" });
evaluacion.belongsTo(area, { foreignKey: "puesto_id" });

evaluacion.hasOne(campamento, { foreignKey: "campamento_id" });
campamento.belongsTo(evaluacion, { foreignKey: "campamento_id" });

usuario.hasOne(trabajador, {
  through: "trabajador_usuario",
  onDelete: "CASCADE",
  hooks: true,
});
trabajador.belongsTo(usuario, {
  through: "trabajador_usuario",
  onDelete: "CASCADE",
  hooks: true,
});

empresa.hasMany(contrato, {
  foreignKey: "empresa_id",
});
contrato.belongsTo(empresa, {
  foreignKey: "empresa_id",
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

trabajador.hasMany(trabajador_contrato, { foreignKey: "trabajador_dni" });
trabajador_contrato.belongsTo(trabajador, { foreignKey: "trabajador_dni" });

contrato.hasMany(trabajador_contrato, { foreignKey: "contrato_id" });
trabajador_contrato.belongsTo(contrato, { foreignKey: "contrato_id" });

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

sucursal.hasMany(ingresos_egresos, { foreignKey: "sucursal_id" });
ingresos_egresos.belongsTo(sucursal, { foreignKey: "sucursal_id" });

sucursal.hasMany(saldo, { foreignKey: "sucursal_id" });
saldo.belongsTo(sucursal, { foreignKey: "sucursal_id" });

almacen.hasMany(producto, { foreignKey: "almacen_id" });
producto.belongsTo(almacen, { foreignKey: "almacen_id" });

almacen.hasMany(entrada_salida, { foreignKey: "almacen_id" });
entrada_salida.belongsTo(almacen, { foreignKey: "almacen_id" });

producto.hasMany(producto_entrada_salida, { foreignKey: "producto_id" });
producto_entrada_salida.belongsTo(producto, { foreignKey: "producto_id" });

entrada_salida.hasMany(producto_entrada_salida, {
  foreignKey: "entrada_salida_id",
});
producto_entrada_salida.belongsTo(entrada_salida, {
  foreignKey: "entrada_salida_id",
});
almacen.hasMany(requerimiento, { foreignKey: "almacen_id" });
requerimiento.belongsTo(almacen, { foreignKey: "almacen_id" });

requerimiento.hasMany(requerimiento_producto, {
  foreignKey: "requerimiento_id",
});
requerimiento_producto.belongsTo(requerimiento, {
  foreignKey: "requerimiento_id",
});

producto.hasMany(requerimiento_producto, { foreignKey: "producto_id" });
requerimiento_producto.belongsTo(producto, { foreignKey: "producto_id" });

requerimiento.hasMany(requerimiento_pedido, { foreignKey: "requerimiento_id" });
requerimiento_pedido.belongsTo(requerimiento, {
  foreignKey: "requerimiento_id",
});

pedido.hasMany(requerimiento_pedido, { foreignKey: "pedido_id" });
requerimiento_pedido.belongsTo(pedido, { foreignKey: "pedido_id" });

categoria.hasMany(producto, { foreignKey: "categoria_id" });
producto.belongsTo(categoria, { foreignKey: "categoria_id" });

transferencia.hasMany(transferencia_producto, {
  foreignKey: "transferencia_id",
});
transferencia_producto.belongsTo(transferencia, {
  foreignKey: "transferencia_id",
});

almacen.hasMany(transferencia, { foreignKey: "almacen_id" });
transferencia.belongsTo(almacen, { foreignKey: "almacen_id" });

almacen.hasMany(transferencia, { foreignKey: "almacen_id" });
transferencia.belongsTo(almacen, {
  as: "origen",
  foreignKey: "almacen_origen",
});

almacen.hasMany(transferencia, { foreignKey: "almacen_id" });
transferencia.belongsTo(almacen, {
  as: "destino",
  foreignKey: "almacen_destino",
});

producto.hasMany(transferencia_producto, { foreignKey: "producto_id" });
transferencia_producto.belongsTo(producto, { foreignKey: "producto_id" });

unidad.hasMany(producto, { foreignKey: "unidad_id" });
producto.belongsTo(unidad, { foreignKey: "unidad_id" });

categoria.hasMany(producto, { foreignKey: "categoria_id" });
producto.belongsTo(categoria, { foreignKey: "categoria_id" });

area.hasMany(entrada_salida, { foreignKey: "area_id" });
entrada_salida.belongsTo(area, { foreignKey: "area_id" });

rol.hasMany(permisos, { foreignKey: "rol_id" });
permisos.belongsTo(rol, { foreignKey: "rol_id" });

contrato.hasMany(contrato_pago, { foreignKey: "contrato_id" });
contrato_pago.belongsTo(contrato, { foreignKey: "contrato_id" });

pago.hasMany(contrato_pago, { foreignKey: "pago_id" });
contrato_pago.belongsTo(pago, { foreignKey: "pago_id" });

trabajador.hasMany(ayuda_pago, { foreignKey: "trabajador_dni" });
ayuda_pago.belongsTo(trabajador, { foreignKey: "trabajador_dni" });

pago.hasMany(ayuda_pago, { foreignKey: "pago_id" });
ayuda_pago.belongsTo(pago, { foreignKey: "pago_id" });

pago.hasMany(destino_pago, { foreignKey: "pago_id" });
destino_pago.belongsTo(pago, { foreignKey: "pago_id" });

destino.hasMany(destino_pago, { foreignKey: "destino_id" });
destino_pago.belongsTo(destino, { foreignKey: "destino_id" });

trabajador.hasMany(pago_asociacion, { foreignKey: "trabajador_dni" });
pago_asociacion.belongsTo(trabajador, { foreignKey: "trabajador_dni" });

contrato_pago.hasMany(pago_asociacion, { foreignKey: "contrato_pago_id" });
pago_asociacion.hasMany(contrato_pago, { foreignKey: "contrato_pago_id" });

contrato.hasMany(aprobacion_contrato_pago, { foreignKey: "contrato_id" });
contrato.belongsTo(contrato, { foreignKey: "contrato_id" });

module.exports = {
  sequelize,
  DataTypes,
  trabajador,
  campamento,
  usuario,
  cargo,
  contrato,
  evaluacion,
  gerencia,
  rol,
  area,
  empresa,
  asociacion,
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
  producto,
  entrada_salida,
  producto_entrada_salida,
  requerimiento,
  requerimiento_producto,
  unidad,
  pedido,
  requerimiento_pedido,
  transferencia,
  categoria,
  transferencia_producto,
  permisos,
  trapiche,
  volquete,
  contrato_pago,
  ayuda_pago,
  destino,
  destino_pago,
  pago_asociacion,
  trabajador_contrato,
  aprobacion_contrato_pago,
};
