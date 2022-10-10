module.exports = (sequelize, type) => {
     const gerencia = sequelize.define(
      "gerencia",
      {
        id: {
          type: type.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        nombre: type.STRING,
      },
      {
        tableName: "gerencia",
        timestamp: false,
      }
    );

    return gerencia
  };
  