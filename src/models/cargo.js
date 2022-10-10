module.exports = (sequelize, type) => {
    return sequelize.define(
      "cargo",
      {
        id: {
          type: type.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        nombre: type.STRING,
        area_id: { type: type.INTEGER, allowNull: false },
      },
      {
        tableName: "cargo",
        timestamp: false,
      }
    );
  };
  