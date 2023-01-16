const {
  transferencia,
  almacen,
  producto,
  transferencia_producto,
} = require("../../config/db");

const getTransferenciaRealizada = async (req, res, next) => {
  let id = req.params.id;
  try {
    const get = await transferencia.findAll({
      where: { almacen_id: id },
      include: [
        {model:almacen, as:"origen"},{model:almacen, as:"destino"},
        {
          model: transferencia_producto,
          include: [
            { model: producto, attributes: { exclude: ["categoria_id"] } },
          ],
        },
      ],
    });

    res.status(200).json({ data: get });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

const getTransferenciaRecibida = async (req, res, next) => {
  let id = req.params.id;
  try {
    const get = await transferencia.findAll({
      where: { almacen_destino: id },
      include: [
        {model:almacen, as:"origen"},{model:almacen, as:"destino"},
        {
          model: transferencia_producto,
          include: [
            { model: producto, attributes: { exclude: ["categoria_id"] } },
          ],
        },
      ],
    });

    res.status(200).json({ data: get });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};


const updateTransferencia = async(req,res,next) => {
  let id = req.params.id;

  console.log(req.body);

  try {

    const update = await transferencia.update(req.body,{
      where:{id:id}
    })


    res.status(200).json({msg:"Actualizado con éxito.", status:200})
    next()
  } catch (error) {
    console.log(error);
    res.status(200).json({msg:"No se pudo actualizar.", status:500})

  }

}



module.exports = { getTransferenciaRealizada, getTransferenciaRecibida, updateTransferencia };
