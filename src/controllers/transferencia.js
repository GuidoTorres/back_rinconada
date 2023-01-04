const {
  transferencia,
  almacen_transferencia,
  almacen,
  producto,
} = require("../../config/db");

const getTransferencia = async (req, res, next) => {
  try {
    const all = await transferencia.findAll({
      include: [
        {
          model: almacen_transferencia,
          include: [{ model: almacen }, { model: producto }],
        },
      ],
    });

    const getAlmacen = await almacen.findAll();

    const formatData = all.map((item) => {
      return {
        id: item.id,
        fecha: item.fecha,
        transferencia: item.almacen_transferencia.map((data) => {
          return {
            cantidad: data.cantidad,
            almacen_origen: (getAlmacen.filter((item2) =>
            data.almacen_origen == item2.id ? item2.nombre : ""
          ).map(dat=> dat.nombre)).toString(),
            producto: data.producto.nombre,
            almacen_destino: (getAlmacen.filter((item2) =>
              data.almacen_destino == item2.id ? item2.nombre : ""
            ).map(dat=> dat.nombre)).toString(),
          };
        }),

        // producto: item.producto.nombre,
      };
    });
    res.status(200).json({ data: formatData });
    next();
  } catch (error) {
    res.status(500).json();
  }
};

module.exports = { getTransferencia };
