module.exports = (sequelize, type) => {
  return sequelize.define(
    "campamento",
    {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nombre: type.STRING,
      direccion: type.STRING,
      trabajador_id: { type: type.INTEGER, allowNull: false },
    },
    {
      tableName: "campamento",
      timestamp: false,
    }
  );
};
