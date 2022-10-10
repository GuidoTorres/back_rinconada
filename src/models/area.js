module.exports = (sequelize, type) => {
  const area =  sequelize.define(
    "area",
    {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nombre: type.STRING,
      gerencia_id: { type: type.INTEGER, allowNull: false },
    },
    {
      tableName: "area",
      timestamp: false,
    }
  );

  return area
};
