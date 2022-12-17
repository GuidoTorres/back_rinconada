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
                  include: [
                    { model: teletrans },
                    { model: campamento, include: [{ model: asistencia }] },
                  ],
                },
              ],
            },
          ],
        },
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
    const mapAsociacion = filterAsociacion.map((item, i) => {
      return {
        id: item?.id,
        nombre: item?.nombre,
        codigo: item?.codigo,
        fecha_inicio: item?.contratos?.map((data) =>
          data?.fecha_inicio?.toLocaleDateString("en-GB", {
            timeZone: "UTC",
          })
        ).toString(),
        fecha_fin: item?.contratos?.map((data) =>
          data?.fecha_fin?.toLocaleDateString("en-GB", {
            timeZone: "UTC",
          })
        ).toString(),
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

    const formatTrabajador = traba.map((item) => {
      return {
        trabajador: {
          id: item?.id,
          dni: item?.dni,
          codigo_trabajador: item?.codigo_trabajador,
          fecha_nacimiento: item?.fecha_nacimiento,
          telefono: item?.telefono,
          apellido_paterno: item?.apellido_paterno,
          apellido_materno: item?.apellido_materno,
          nombre: item?.nombre,
          email: item?.email,
          estado_civil: item?.estado_civil,
          genero: item?.genero,
          direccion: item?.direccion,
          asociacion_id: item?.asociacion_id,
          deshabilitado: item?.deshabilitado,
          asistencia: item?.trabajador_asistencia?.filter(
            (item) => item?.asistencia === "Asistio"
          ).length,
        },
        evaluaciones: {
          id: item?.evaluacions?.map((data) => data?.id).toString(),
          fecha_evaluacion: item?.evaluacions?.map(
            (data) => data?.fecha_evaluacion
          ),
          puesto: item?.evaluacions.map((data) => data?.puesto).toString(),
          capacitacion_sso: item?.evaluacions
            .map((data) => data?.capacitacion_sso)
            .toString(),
          capacitacion_gema: item?.evaluacions
            ?.map((data) => data?.capacitacion_gema)
            .toString(),
          evaluacion_laboral: item.evaluacions
            ?.map((data) => data.evaluacion_laboral)
            .toString(),
          presion_arterial: item?.evaluacions
            ?.map((data) => data?.presion_arterial)
            .toString(),
          temperatura: item?.evaluacions
            ?.map((data) => data?.temperatura)
            .toString(),
          saturacion: item?.evaluacions
            ?.map((data) => data?.saturacion)
            .toString(),
          imc: item?.evaluacions?.map((data) => data?.imc).toString(),
          pulso: item?.evaluacions?.map((data) => data?.pulso).toString(),
          diabetes: item?.evaluacions.map((data) => data?.diabetes).toString(),
          antecedentes: item?.evaluacions
            .map((data) => data?.antecedentes)
            .toString(),
          emo: item?.evaluacions?.map((data) => data?.emo).toString(),
          trabajador_id: item?.evaluacions
            ?.map((data) => data?.trabajador_id)
            .toString(),
          aprobado: item?.evaluacions?.map((data) => data?.aprobado).toString(),
        },
        contrato: item?.evaluacions
          .map(
            (data) =>
              data?.contrato_evaluacions[data.contrato_evaluacions.length - 1]
                ?.contrato
          )
          .flat(),
        // teletrans: item.evaluacions
        //   .map((data) =>
        //     data.contrato_evaluacions.map((dat) => dat.contrato.teletran)
        //   )
        //   .flat(),
      };
    });

    const finalTrabajador = formatTrabajador.map((item) => {
      return {
        id: item?.trabajador?.id,
        nombre:
          item?.trabajador?.nombre +
          " " +
          item?.trabajador?.apellido_paterno +
          " " +
          item?.trabajador?.apellido_materno,
        dni: item?.trabajador?.dni,
        telefono: item?.trabajador?.telefono,
        asistencia: item?.trabajador?.asistencia,
        asociacion: item?.trabajador?.asociacion_id,
        deshabilitado: item?.trabajador?.deshabilitado,
        evaluacion_id: item?.evaluaciones?.id,
        fecha_inicio: item?.contrato[
          item.contrato.length - 1
        ]?.fecha_inicio.toLocaleDateString("en-GB", {
          timeZone: "UTC",
        }),
        fecha_fin: item?.contrato[
          item.contrato.length - 1
        ]?.fecha_fin.toLocaleDateString("en-GB", {
          timeZone: "UTC",
        }),
        contrato: item?.contrato[item.contrato.length - 1],
        volquete: parseInt(item?.contrato[item.contrato.length - 1]?.volquete),
        teletran: parseInt(
          item?.contrato[item.contrato.length - 1]?.teletrans.map(
            (data) => data?.teletrans
          )
        ),
        total: parseInt(
          item?.contrato[item.contrato.length - 1]?.teletrans.map(
            (item) => item?.total
          )
        ),
        saldo: parseInt(
          item?.contrato[item.contrato.length - 1]?.teletrans.map(
            (item) => item?.saldo
          )
        ),

        estado: item?.contrato[item.contrato.length - 1]?.estado,
      };
    });

    const filterTrabajador = finalTrabajador.filter(
      (item) =>
        item?.contrato?.length !== 0 &&
        item?.contrato !== null &&
        item?.contrato &&
        item?.contrato?.finalizado === false
    );

    const final = mapAsociacion.concat(filterTrabajador);
    res.status(200).json({ data: final });
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
          contrato_id:item?.evaluacions[item.evaluacions.length - 1]
          ?.contrato_evaluacions.map(item => item.contrato_id).toString()
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

module.exports = {
  getPlanilla,
  campamentoPlanilla,
  getTareoTrabajador,
  getTareoAsociacion,
  juntarTeletrans,
};
