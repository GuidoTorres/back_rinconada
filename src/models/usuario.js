const { DataTypes } = require("sequelize");

const usuarioModel = (sequelize) => {
  const usuario = sequelize.define(
    "usuario",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nombre: { type: DataTypes.STRING },
      contrasenia: { type: DataTypes.STRING },
      usuario: { type: DataTypes.STRING },
      estado: { type: DataTypes.BOOLEAN },
    },
    {
      tableName: "usuario",
      timestamp: false,
    }
  );


  return usuario;
};

module.exports = {usuarioModel};

// module.exports = (sequelize, type) => {
//   const usuario = sequelize.define(
//     "usuario",
//     {
//       id: {
//         type: type.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//         allowNull: false,
//       },
//       nombre: { type: type.STRING },
//       contrasenia: { type: type.STRING },
//       usuario: { type: type.STRING },
//       estado: { type: type.BOOLEAN },
//     },
//     {
//       tableName: "usuario",
//       timestamp: false,
//     }
//   );

// usuario.associate = function (models) {
//   // models.stock is correct
//   usuario.hasMany(models.rolPuesto, { foreignKey: "usuario_id" });
// };
// rolPuesto.associate = function (models) {
//   // models.stock is correct
//   rolPuesto.belongsTo(models.usuario, { foreignKey: "usuario_id" });
// };

// return usuario;
// };
