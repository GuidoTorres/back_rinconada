module.exports = (sequelize, type) => {
   const rolPuesto =  sequelize.define(
    "rol_puesto",
    {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      usuario_id: { type: type.INTEGER, allowNull: false },
      cargo_id: { type: type.INTEGER, allowNull: false },
      rol_id: { type: type.INTEGER, allowNull: false },
    },
    {
      tableName: "rol_puesto",
      timestamp: false,
    }
  );
  return rolPuesto
};
