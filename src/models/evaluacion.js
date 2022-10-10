module.exports = (sequelize, type) => {
    return sequelize.define(
      "evaluacion",
      {
        id: {
          type: type.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        fecha_evaluacion: type.DATE,
        dni: type.INTEGER,
        puesto: type.STRING,
        contrato_id: type.INTEGER,
        capacitacion_sso: type.INTEGER,
        capacitacion_gema: type.INTEGER,
        evaluacion_laboral: type.INTEGER,
        presion_arterial: type.FLOAT,
        temperatura: type.FLOAT,
        saturacion: type.FLOAT,
        imc: type.FLOAT,
        pulso: type.FLOAT,
        diabetes: type.STRING,
        antecendentes: type.TEXT('long'),
        emo: type.BLOB
      },
      {
        tableName: "evaluacion",
        timestamp: false,
      }
    );
  };