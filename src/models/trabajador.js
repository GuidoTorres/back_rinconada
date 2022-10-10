module.exports = (sequelize, type) => {
    return sequelize.define(
      "trabajador",
      {
        id: {
          type: type.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        dni: type.INTEGER,
        codigo_trabajador: type.INTEGER,
        fecha_nacimiento: type.DATE,
        telefono: type.INTEGER,
        apellido_paterno: type.STRING,
        apellido_materno: type.STRING,
        email: type.STRING,
        estado_civil: type.STRING,
        genero: type.STRING,
        direccion: type.STRING,
        tipo_trabajador: type.STRING
      },
      {
        tableName: "trabajador",
        timestamp: false,
      }
    );

  
  };
  