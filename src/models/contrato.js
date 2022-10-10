module.exports = (sequelize, type) => {
    return sequelize.define(
      "contrato",
      {
        id: {
          type: type.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        fecha_inicio: type.DATE,
        codigo_contrato: type.INTEGER,
        tipo_contrato: type.STRING,
        recomendado_por: type.STRING,
        cooperativa: type.STRING,
        condicion_cooperativa: type.STRING,
        id_campamento: type.INTEGER,
        periodo_trabajo: type.STRING,
        fecha_fin: type.DATE,
        gerencia: type.STRING,
        area: type.STRING,
        jefe_directo: type.STRING,
        base: type.STRING,
        termino_contrato: type.TEXT('long')
      },
      {
        tableName: "contrato",
        timestamp: false,
      }
    );
  };
  