module.exports = (sequelize, type) => {
    return sequelize.define(
      "rol",
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
        tableName: "rol",
        timestamp: false,
      }
    );
  };