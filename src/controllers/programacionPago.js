const { Op } = require("sequelize");
const {
  aprobacion_contrato_pago,
  contrato,
  cargo,
  teletrans,
  trabajador_contrato,
  trabajador,
  pago,
  contrato_pago,
} = require("../../config/db");

const getAprobacion = async (req, res, next) => {
  try {
    const all = await aprobacion_contrato_pago.findAll({
      where: { asociacion_id: { [Op.is]: null } },
      include: [
        {
          model: contrato,
          attributes: { exclude: ["contrato_id"] },
          include: [
            { model: cargo, attributes: { exclude: ["cargo_id"] } },
            { model: teletrans },
            {
              model: trabajador_contrato,
              include: [
                { model: trabajador, attributes: { exclude: ["usuarioId"] } },
              ],
            },
            { model: contrato_pago, include: [{ model: pago }] },
          ],
        },
      ],
    });

    const format = all
      .map((item) => {
        const saldoFinal = item.contrato.contrato_pagos.filter(
          (item) => item.pago.tipo === "pago"
        );

        const totalTeletrans = sumarTeletransYVolquete(saldoFinal);
        console.log(totalTeletrans);
        console.log(item.contrato.teletrans.at(-1).saldo);
        if (
          parseFloat(totalTeletrans) <=
          parseFloat(item.contrato.teletrans.at(-1).saldo)
        ) {
          return {
            nombre: item?.nombre,
            cargo: item?.contrato?.cargo?.nombre,
            volquetes: item?.contrato?.teletrans?.at(-1)?.volquete,
            teletrans: item?.contrato?.teletrans?.at(-1)?.teletrans,
            saldo: item?.contrato?.teletrans?.at(-1)?.saldo,
            fecha_inicio: item?.fecha_inicio,
            fecha_fin: item?.fecha_fin,
            contrato_id: item?.contrato_id,
            dni: item?.dni,
            telefono: item.contrato.trabajador_contratos
              ?.map((data) => data.trabajador.telefono)
              .toString(),
            saldoFinal: totalTeletrans,
          };
        }
      })
      .filter((item) => item !== undefined);

    return res.status(200).json({ data: format });
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

function sumarTeletransYVolquete(saldoFinal) {
  let totalTeletrans = 0;

  for (const item of saldoFinal) {
    let teletrans = parseInt(item.teletrans);
    let volquetes = parseInt(item.volquetes);

    if (!isNaN(teletrans) && !isNaN(volquetes)) {
      if (volquetes > 0 && teletrans >= 4) {
        totalTeletrans += teletrans;
      } else if (volquetes > 0 && teletrans < 4) {
        totalTeletrans += volquetes * 4 + teletrans;
      } else if (volquetes > 0) {
        totalTeletrans += volquetes * 4;
      } else {
        totalTeletrans += teletrans;
      }
    } else if (!isNaN(teletrans)) {
      totalTeletrans += teletrans;
    } else if (!isNaN(volquetes)) {
      totalTeletrans += volquetes * 4;
    }
  }

  return totalTeletrans;
}

module.exports = { getAprobacion };
