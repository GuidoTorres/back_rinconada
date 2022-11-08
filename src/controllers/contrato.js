const {
  contrato,
  trabajador,
  evaluacion,
  contratoEvaluacion,
  teletrans,
} = require("../../config/db");
const date = require("date-and-time");

const getContrato = async (req, res, next) => {
  try {
    const get = await contrato.findAll();
    res.status(200).json({ data: get });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json();
  }
};

const getContratoById = async (req, res, next) => {
  let id = req.params.id;
  // obtener contrato de trabajador con el id de trabajador
  try {
    const user = await trabajador.findAll({
      where: { id: id },
      include: [
        {
          model: evaluacion,
          include: [
            {
              model: contratoEvaluacion,
              include: [
                { model: contrato, attributes: { exclude: ["contrato_id"] } },
              ],
            },
          ],
        },
      ],
    });

    const obj = user.map((item) => {
      return {
        id: item.id,
        contrato: item.evaluacions
          .map((data) => data.contrato_evaluacions)
          .flat(),
      };
    });

    const obj2 = obj
      .map((item) => item.contrato.map((data) => data.contrato))
      .flat();

    res.status(200).json({ data: obj2 });

    next();
  } catch (error) {
    res.status(500).json(error);
  }
};
const getContratoAsociacionById = async (req, res, next) => {
  let id = req.params.id;

  try {
    const user = await contrato.findAll({
      attributes: { exclude: ["contrato_id"] },
      where: { asociacion_id: id },
    });

    // const obj = user

    res.status(200).json({ data: user });

    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

const postContrato = async (req, res, next) => {
  let info = {
    fecha_inicio: req.body.fecha_inicio,
    codigo_contrato: req.body.codigo_contrato,
    tipo_contrato: req.body.tipo_contrato,
    recomendado_por: req.body.recomendado_por,
    cooperativa: req.body.cooperativa,
    condicion_cooperativa: req.body.condicion_cooperativa,
    periodo_trabajo: req.body.periodo_trabajo,
    fecha_fin: req.body.fecha_fin,
    gerencia: req.body.gerencia,
    area: req.body.area,
    jefe_directo: req.body.jefe_directo,
    base: req.body.base,
    termino_contrato: req.body.termino_contrato,
    nota_contrato: req.body.nota_contrato,
    puesto: req.body.puesto,
    campamento_id: req.body.campamento_id,
    estado: req.body.estado,
  };

  try {
    const post = await contrato.create(info);

    // creacion de campos teletrans una vez creado el contrato
    let ttransTotal;
    let ttranSaldo;
    let ttransResult;
    let descuento = 4;

    const ttrans = parseInt(
      date
        .subtract(new Date(info.fecha_fin), new Date(info.fecha_inicio))
        .toDays()
    );

    console.log(ttrans);
    ttransTotal = (ttrans / 15) * 4;

    if (ttransTotal >= 4) {
      ttranSaldo = ttransTotal - descuento;
      ttransResult = ttransTotal;
    } else if (ttransTotal < 4) {
      ttranSaldo = ttransTotal - ttransTotal;
      ttransResult = ttransTotal;
    } else if (ttransTotal === 0) {
      ttranSaldo = 0;
      ttransResult = 0;
    }
    const createtTrans = await teletrans.create({
      total: ttransResult,
      saldo: ttranSaldo,
      contrato_id: post.id,
    });

    const tablaIntermedia = await contratoEvaluacion.create({
      contrato_id: post.id,
      evaluacion_id: req.body.evaluacion_id,
    });

    console.log(createtTrans);
    res.status(200).json(info);
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

// terminar
const postContratoAsociacion = async (req, res, next) => {
  let info = {
    fecha_inicio: req.body.fecha_inicio,
    codigo_contrato: req.body.codigo_contrato,
    tipo_contrato: req.body.tipo_contrato,
    recomendado_por: req.body.recomendado_por,
    cooperativa: req.body.cooperativa,
    condicion_cooperativa: req.body.condicion_cooperativa,
    periodo_trabajo: req.body.periodo_trabajo,
    fecha_fin: req.body.fecha_fin,
    gerencia: req.body.gerencia,
    area: req.body.area,
    jefe_directo: req.body.jefe_directo,
    base: req.body.base,
    termino_contrato: req.body.termino_contrato,
    nota_contrato: req.body.nota_contrato,
    puesto: req.body.puesto,
    campamento_id: req.body.campamento_id,
    asociacion_id: req.body.asociacion_id,
    evaluacion_id: req.body.evaluacion_id
  };

  console.log(req.body.evaluacion_id);
  console.log(info.evaluacion_id);
  try {
    if (req.body.evaluacion_id.length > 0) {
      const post = await contrato.create(info);
      const createEvaluacionContrato = req.body.evaluacion_id.map((item) => {
        return {
          contrato_id: post.id,
          evaluacion_id: item,
        };
      });
      console.log(createEvaluacionContrato);
      const tablaIntermedia = await contratoEvaluacion.bulkCreate(
        createEvaluacionContrato
      );

      // creacion de campos teletrans una vez creado el contrato
      let ttransTotal;
      let ttranSaldo;
      let ttransResult;
      let descuento = 4;
      const ttrans = parseInt(
        date
          .subtract(new Date(info.fecha_fin), new Date(info.fecha_inicio))
          .toDays()
      );
      ttransTotal = ((ttrans / 15) * 4 ) * createEvaluacionContrato.length;

      if (ttransTotal >= 4) {
        ttranSaldo = ttransTotal - descuento;
        ttransResult = ttransTotal;
      } else if (ttransTotal < 4) {
        ttranSaldo = ttransTotal - ttransTotal;
        ttransResult = ttransTotal;
      } else if (ttransTotal === 0) {
        ttranSaldo = 0;
        ttransResult = 0;
      }
      const ttransInfo = {
        total: ttransResult,
        saldo: ttranSaldo,
        contrato_id: post.id,
      };
      const createtTrans = await teletrans.create(ttransInfo);
      res.status(200).json(createtTrans);
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const updateContrato = async (req, res, next) => {
  let id = req.params.id;

  try {
    const put = await contrato.update(req.body, {
      where: { id: id },
    });

    console.log(put);
    res.status(200).json({ msg: "Contrato actualizado con éxito" });
    next();
  } catch (error) {
    res.status(500).json({ msg: error, status: 500 });
  }
};

const deleteContrato = async (req, res, next) => {
  let id = req.params.id;
  try {
    let remove = await contrato.destroy({ where: { id: id } });
    res.status(200).json({ msg: "Contrato eliminado con éxito", status: 200 });
    next();
  } catch (error) {
    res.status(500).json({ msg: error, status: 500 });
  }
};

module.exports = {
  getContrato,
  updateContrato,
  postContrato,
  deleteContrato,
  getContratoById,
  postContratoAsociacion,
  getContratoAsociacionById,
};
