const { where } = require("sequelize");
const date = require("date-and-time");
const {
  trabajador,
  asociacion,
  contrato,
  evaluacion,
  campamento,
  contratoEvaluacion,
  teletrans,
  asistencia,
  trabajadorAsistencia,
  fecha_pago,
} = require("../../config/db");
const { Op } = require("sequelize");

const getPlanilla = async (req, res, next) => {
  try {
    const traba = await trabajador.findAll({
      where: {
        [Op.and]: [
          { asociacion_id: { [Op.is]: null } },
          { deshabilitado: { [Op.not]: true } },
        ],
      },
      attributes: { exclude: ["usuarioId"] },
      include: [
        {
          model: trabajadorAsistencia,
          attributes: {
            exclude: ["trabajadorId", "asistenciumId", "trabajadorDni"],
          },
        },
        {
          model: contrato,
          attributes: { exclude: ["contrato_id"] },
          where: {
            [Op.and]: [{ finalizado: { [Op.not]: true } }],
          },
          include: [
            { model: teletrans },
            { model: campamento, include: [{ model: asistencia }] },
          ],
        },
        {model:evaluacion}
      ],
    });

    const asoci = await asociacion.findAll({
      include: [
        {
          model: contrato,
          attributes: { exclude: ["contrato_id"] },
          include: [
            { model: teletrans },
            { model: campamento, include: [{ model: asistencia }] },
          ],
        },
      ],
    });

    const filterAsociacion = asoci?.filter(
      (item) => item?.contratos?.length !== 0
    );
    const filterTrabajador = traba?.filter(
      (item) => item?.contratos?.length !== 0
    );
    const mapAsociacion = filterAsociacion.map((item, i) => {
      return {
        id: item?.id,
        nombre: item?.nombre,
        codigo: item?.codigo,
        fecha_inicio: item?.contratos
          ?.map((data) =>
            data?.fecha_inicio?.toLocaleDateString("en-GB", {
              timeZone: "UTC",
            })
          )
          .toString(),
        fecha_fin: item?.contratos
          ?.map((data) =>
            data?.fecha_fin?.toLocaleDateString("en-GB", {
              timeZone: "UTC",
            })
          )
          .toString(),
        contrato: item?.contratos[item.contratos.length - 1],
        volquete: item?.contratos[item.contratos.length - 1]?.volquete,
        teletran: parseInt(
          item?.contratos[item.contratos.length - 1]?.teletrans.map(
            (item) => item?.teletrans
          )
        ),
        total: parseInt(
          item?.contratos[item.contratos.length - 1]?.teletrans.map(
            (item) => item?.total
          )
        ),
        saldo: parseInt(
          item?.contratos[item.contratos.length - 1]?.teletrans.map(
            (item) => item?.saldo
          )
        ),

        estado: item?.contratos[item.contratos.length - 1]?.teletrans,
      };
    });

    const mapTrabajador = filterTrabajador.map((item) => {
      return {
        dni: item.dni,
        codigo_trabajador: item.codigo_trabajador,
        fecha_nacimiento: item.fecha_nacimiento,
        telefono: item.telefono,
        apellido_paterno: item.apellido_paterno,
        apellido_materno: item.apellido_materno,
        nombre: item.nombre,
        email: item.email,
        estado_civil: item.estado_civil,
        genero: item.genero,
        direccion: item.direccion,
        asociacion_id: item.asociacion_id,
        deshabilitado: item.deshabilitado,
        eliminar: item.e,
        contratos: item.contratos,
        asistencia: item.trabajador_asistencia.filter(
          (data) => data.asistencia === "Asistio"
        ).length,
        evaluacion: item.evaluacions
      };
    });

    const final = mapAsociacion.concat(mapTrabajador);

    res.status(200).json({ data: final });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

const getPlanillaPago = async (req, res, next) => {
  try {
    const getPlanilla = await trabajador.findAll({
      where: {
        [Op.and]: [
          { asociacion_id: { [Op.is]: null } },
          { deshabilitado: { [Op.not]: true } },
        ],
      },
      attributes: { exclude: ["usuarioId"] },
      include: [
        {
          model: trabajadorAsistencia,
          attributes: {
            exclude: ["trabajadorId", "asistenciumId", "trabajadorDni"],
          },
        },
        {
          model: contrato,
          attributes: { exclude: ["contrato_id"] },
          where: {
            [Op.and]: [{ finalizado: { [Op.not]: true } }],
          },
          include: [{ model: teletrans }],
        },

      ],
    });

    const filterAsistencia = getPlanilla
      ?.map((item) => {
        if (
          item.trabajador_asistencia.filter(
            (item) => item.asistencia === "Asistio"
          ).length >= 15
        ) {
          return item;
        }
      })
      .flat();

    res.status(200).json({ data: filterAsistencia });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

const campamentoPlanilla = async (req, res, next) => {
  try {
    const trabajadoresCapamento = await campamento.findAll({});

    res.status(200).json({ data: trabajadoresCapamento });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

const getTareoTrabajador = async (req, res, next) => {
  id = req.params.id;

  try {
    const getTareo = await trabajador.findAll({
      where: { dni: id },
      attributes: {
        exclude: ["usuarioId"],
      },
      include: [
        {
          model: trabajadorAsistencia,
          attributes: {
            exclude: ["trabajadorId", "asistenciumId", "trabajadorDni"],
          },
          where: { trabajador_id: id },
          include: [{ model: asistencia }],
        },
      ],
    });

    const obj = getTareo.map((item) => item.trabajador_asistencia).flat();

    res.status(200).json({ data: obj });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

const getTareoAsociacion = async (req, res, next) => {
  id = req.params.id;
  try {
    const getAsociacionTareo = await trabajador.findAll({
      where: { asociacion_id: id },
      include: [
        {
          model: trabajadorAsistencia,
          attributes: {
            exclude: ["trabajadorId", "asistenciumId", "trabajadorDni"],
          },
          include: [{ model: asistencia }],
        },
      ],
    });

    const getContrato = await asociacion.findAll({
      where: { id: id },
      include: [
        {
          model: contrato,
          attributes: {
            exclude: ["contrato_id"],
          },
        },
      ],
    });

    const fecha_inicio = getContrato
      .map((item) => item.contratos[item.contratos.length - 1].fecha_inicio)
      .flat()
      .toLocaleString("sv-SE", {
        timeZone: "UTC",
      });

    const fecha_fin = getContrato
      .map((item) => item.contratos[item.contratos.length - 1].fecha_fin)
      .flat()
      .toLocaleString("sv-SE", {
        timeZone: "UTC",
      });

    let fechas = [];

    const formatFechas = getAsociacionTareo.map((item) => {
      return {
        fecha: item.trabajador_asistencia.map((data) =>
          fechas.push(data.asistencium.fecha)
        ),
      };
    });

    const fecha_final = [...new Set(fechas)];
    const fecha1 = {
      fecha: fecha_final,
    };
    const finalJson = getAsociacionTareo.map((item) => {
      return {
        dni: item.dni,
        codigo_trabajador: item.codigo_trabajador,
        fecha_nacimiento: item.fecha_nacimiento,
        telefono: item.telefono,
        apellido_materno: item.apellido_materno,
        apellido_paterno: item.apellido_paterno,
        nombre: item.nombre,
        email: item.email,
        trabajador_asistencia: item.trabajador_asistencia,
      };
    });

    const concat = finalJson.concat(fecha1);
    res.status(200).json({ data: concat });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

const juntarTeletrans = async (req, res, next) => {
  try {
    const getTrabajador = await trabajador.findAll({
      where: { asociacion_id: { [Op.is]: null } },
      include: [
        {
          model: trabajadorAsistencia,
          attributes: {
            exclude: ["trabajadorId", "asistenciumId", "trabajadorDni"],
          },
        },
        {
          model: evaluacion,
          include: [
            {
              model: contratoEvaluacion,
              include: [
                {
                  model: contrato,
                  attributes: { exclude: ["contrato_id"] },
                  include: [{ model: teletrans }],
                },
              ],
            },
          ],
        },
      ],
    });

    const filter = getTrabajador
      .map((item) => {
        return {
          nombre: item?.nombre,
          apellido_materno: item?.apellido_materno,
          apellido_paterno: item?.apellido_paterno,
          telefono: item?.telefono,
          dni: item?.dni,
          volquete: parseInt(
            item?.evaluacions[
              item?.evaluacions.length - 1
            ]?.contrato_evaluacions.map((data) =>
              data?.contrato?.teletrans.map((dat) => dat?.volquete)
            )
          ),
          teletrans: parseInt(
            item?.evaluacions[
              item?.evaluacions.length - 1
            ]?.contrato_evaluacions?.map((data) =>
              data?.contrato?.teletrans.map((dat) => dat?.teletrans)
            )
          ),
          saldo: parseInt(
            item?.evaluacions[
              item?.evaluacions.length - 1
            ]?.contrato_evaluacions?.map((data) =>
              data?.contrato?.teletrans?.map((dat) => dat?.saldo)
            )
          ),
          dias_laborados: item?.trabajador_asistencia.filter(
            (data) => data?.asistencia === "Asistio"
          ).length,
          contrato:
            item?.evaluacions[item.evaluacions.length - 1]
              ?.contrato_evaluacions,
          contrato_id: item?.evaluacions[
            item.evaluacions.length - 1
          ]?.contrato_evaluacions
            .map((item) => item.contrato_id)
            .toString(),
        };
      })
      .flat();

    const filterTrabajador = filter.filter(
      (item) => item?.contrato?.length > 0
    );

    const filterTeletrans = filterTrabajador.filter(
      (item) => parseInt(item.saldo) % 4 !== 0
    );

    res.status(200).json({ data: filterTeletrans });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

const updateFechaPago = async (req, res, next) => {
  id = req.params.id;

  try {
    const get = await fecha_pago.update({ where: { contrato_id: id } });

    res.status(500).json({ msg: "Actualizado con éxito!", status: 200 });
    next();
  } catch (error) {
    res.status(500).json({ msg: "No se pudo actualizar.", status: 500 });
  }
};

module.exports = {
  getPlanilla,
  campamentoPlanilla,
  getTareoTrabajador,
  getTareoAsociacion,
  juntarTeletrans,
  getPlanillaPago,
};
