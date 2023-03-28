const {
  ingresos_egresos,
  saldo,
  trabajador,
  sucursal,
} = require("../../config/db");
const { Op, Sequelize } = require("sequelize");
const path = require("path");
const XLSX = require("xlsx");
const fs = require("fs");
const _ = require("lodash");
const { log } = require("console");

const getIngresoEgresos = async (req, res, next) => {
  try {
    const get = await ingresos_egresos.findAll();
    res.status(200).json({ data: get });
    next();
  } catch (error) {
    res.status(500).json();
  }
};

const getIngresoEgresosById = async (req, res, next) => {
  let id = req.params.id;

  try {
    const getById = await ingresos_egresos.findAll({
      where: { sucursal_id: id },
    });
    res.status(200).json({ data: getById });
    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

const postIngresoEgreso = async (req, res, next) => {
  let newSaldo;
  let info;
  try {
    const getSaldo = await saldo.findAll({
      where: { sucursal_id: req.body.sucursal_id },
    });
    const getSaldoEgreso = await saldo.findAll({
      where: { sucursal_id: req.body.sucursal_transferencia },
    });

    let objIngreso = {
      sucursal_id: req.body.sucursal_id,
      fecha: req.body.fecha,
      movimiento: "Ingreso",
      forma_pago: req.body.forma_pago,
      encargado: req.body.encargado,
      area: req.body.area,
      cantidad: req.body.cantidad,
      medida: req.body.medida,
      descripcion: req.body.descripcion,
      monto: parseFloat(req.body.monto).toFixed(2),
      proveedor: req.body.proveedor,
      comprobante: req.body.comprobante,
      sucursal_transferencia: req.body.sucursal_transferencia,
      dni: req.body.dni,
      precio: req.body.precio,
      categoria: req.body.categoria,
      nro_comprobante: req.body.nro_comprobante,
      ingresos:
        parseFloat(getSaldo?.at(-1)?.ingresos) + parseFloat(req.body.monto),
      saldo_final:
        parseFloat(getSaldo?.at(-1)?.saldo_final) + parseFloat(req.body.monto),
    };
    let objEgreso = {
      sucursal_id: req.body.sucursal_id,
      fecha: req.body.fecha,
      movimiento: "Egreso",
      forma_pago: req.body.forma_pago,
      encargado: req.body.encargado,
      area: req.body.area,
      cantidad: req.body.cantidad,
      medida: req.body.medida,
      descripcion: req.body.descripcion,
      monto: parseFloat(req.body.monto),
      proveedor: req.body.proveedor,
      comprobante: req.body.comprobante,
      dni: req.body.dni,
      precio: req.body.precio,
      categoria: req.body.categoria,
      nro_comprobante: req.body.nro_comprobante,
      sucursal_transferencia: req.body.sucursal_transferencia,
      egresos:
        parseFloat(getSaldo?.at(-1)?.egresos) + parseFloat(req.body.monto),
      saldo_final:
        parseFloat(getSaldo?.at(-1)?.saldo_final) - parseFloat(req.body.monto),
    };
    let newSaldoIngreso = {
      saldo_inicial: parseFloat(parseFloat(getSaldo?.at(-1)?.saldo_inicial)),
      ingresos:
        parseFloat(getSaldo?.at(-1)?.ingresos) + parseFloat(req.body.monto),
      saldo_final:
        parseFloat(getSaldo?.at(-1)?.saldo_final) + parseFloat(req.body.monto),
    };
    console.log(newSaldoIngreso);

    let newSaldoEgreso = {
      saldo_inicial: parseFloat(getSaldo?.at(-1)?.saldo_inicial),
      egresos:
        parseFloat(getSaldo?.at(-1)?.egresos) + parseFloat(req.body.monto),
      saldo_final:
        parseFloat(getSaldo?.at(-1)?.saldo_final) - parseFloat(req.body.monto),
    };
    console.log(newSaldoEgreso);
    // para registrar ingresos y egresos
    if (!req.body.sucursal_transferencia && req.body.sucursal_id) {
      if (req.body.movimiento === "Ingreso") {
        const post = await ingresos_egresos.create(objIngreso);
        const updateSaldo = await saldo.update(newSaldoIngreso, {
          where: { sucursal_id: req.body.sucursal_id },
        });
        return res
          .status(200)
          .json({ msg: "Movimiento registrado con éxito!", status: 200 });
      } else {
        const post = await ingresos_egresos.create(objEgreso);
        const updateSaldo = await saldo.update(newSaldoEgreso, {
          where: { sucursal_id: req.body.sucursal_id },
        });
        return res
          .status(200)
          .json({ msg: "Movimiento registrado con éxito!", status: 200 });
      }
    }

    // para registrar las transferencias y actualizar el saldo de cada sucursal
    if (
      req.body.movimiento === "Egreso" &&
      req.body.sucursal_transferencia &&
      req.body.sucursal_transferencia !== req.body.sucursal_id
    ) {
      let objEgresoTransferencia = {
        sucursal_id: req.body.sucursal_id,
        fecha: req.body.fecha,
        movimiento: req.body.movimiento,
        forma_pago: req.body.forma_pago,
        encargado: req.body.encargado,
        area: req.body.area,
        cantidad: req.body.cantidad,
        medida: req.body.medida,
        descripcion: req.body.descripcion,
        monto: req.body.monto,
        proveedor: req.body.proveedor,
        comprobante: req.body.comprobante,
        sucursal_transferencia: req.body.sucursal_transferencia,
        dni: req.body.dni,
        saldo_inicial: getSaldo[getSaldo.length - 1?.saldo_inicial],
        ingresos: null,
        egresos:
          parseFloat(getSaldo[getSaldo.length - 1]?.egresos) +
          parseFloat(req.body.monto),
        saldo_final:
          getSaldo[getSaldo.length - 1]?.saldo_final === 0
            ? parseFloat(getSaldo[getSaldo.length - 1]?.saldo_inicial) -
              parseFloat(req.body.monto)
            : parseFloat(getSaldo[getSaldo.length - 1]?.saldo_final) -
              parseFloat(req.body.monto),
      };
      let objIngresoTransferencia = {
        sucursal_id: req.body.sucursal_transferencia,
        fecha: req.body.fecha,
        movimiento: "Ingreso",
        forma_pago: req.body.forma_pago,
        encargado: req.body.encargado,
        area: req.body.area,
        cantidad: req.body.cantidad,
        medida: req.body.medida,
        descripcion: req.body.descripcion,
        monto: req.body.monto,
        proveedor: req.body.proveedor,
        comprobante: req.body.comprobante,
        sucursal_transferencia: req.body.sucursal_transferencia,
        dni: req.body.dni,
        saldo_inicial: getSaldoEgreso[getSaldoEgreso.length - 1]?.saldo_inicial,
        ingresos:
          parseFloat(getSaldoEgreso[getSaldoEgreso.length - 1]?.ingresos) +
          parseInt(req.body.monto),
        egresos: null,
        saldo_final:
          getSaldoEgreso[getSaldoEgreso.length - 1]?.saldo_final === 0
            ? parseFloat(
                getSaldoEgreso[getSaldoEgreso.length - 1]?.saldo_inicial
              ) + parseFloat(req.body.monto)
            : parseFloat(
                getSaldoEgreso[getSaldoEgreso.length - 1]?.saldo_final
              ) + parseFloat(req.body.monto),
      };
      let newSaldoEgresoTransferencia = {
        saldo_inicial: parseFloat(getSaldo[getSaldo.length - 1]?.saldo_inicial),
        egresos:
          parseFloat(getSaldo[getSaldo.length - 1]?.egresos) +
          parseFloat(req.body.monto),
        saldo_final:
          getSaldo[getSaldo.length - 1]?.saldo_final === 0
            ? parseFloat(getSaldo[getSaldo.length - 1]?.saldo_inicial) -
              parseFloat(req.body.monto)
            : parseFloat(getSaldo[getSaldo.length - 1]?.saldo_final) -
              parseFloat(req.body.monto),
      };
      let newSaldoIngresoTransferencia = {
        saldo_inicial: parseFloat(
          getSaldoEgreso[getSaldoEgreso.length - 1]?.saldo_inicial
        ),
        ingresos:
          parseFloat(getSaldoEgreso[getSaldoEgreso.length - 1]?.ingresos) +
          parseFloat(req.body.monto),
        saldo_final:
          getSaldoEgreso[getSaldoEgreso.length - 1]?.saldo_final === 0
            ? parseFloat(
                getSaldoEgreso[getSaldoEgreso.length - 1]?.saldo_inicial
              ) + parseFloat(req.body.monto)
            : parseFloat(
                getSaldoEgreso[getSaldoEgreso.length - 1]?.saldo_final
              ) + parseFloat(req.body.monto),
      };
      const postEgreso = await ingresos_egresos.create(objEgresoTransferencia);
      const postIngreso = await ingresos_egresos.create(
        objIngresoTransferencia
      );

      const updateSaldoEgreso = await saldo.update(
        newSaldoEgresoTransferencia,
        {
          where: { sucursal_id: req.body.sucursal_id },
        }
      );
      const updateSaldoIngreso = await saldo.update(
        newSaldoIngresoTransferencia,
        {
          where: { sucursal_id: req.body.sucursal_transferencia },
        }
      );

      return res
        .status(200)
        .json({ msg: "Movimiento registrado con éxito!", status: 200 });
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo crear.", status: 500 });
  }
};

const updateIngresoEgreso = async (req, res, next) => {
  let id = req.params.id;
  try {
    let getIngresos = await ingresos_egresos.findAll({
      where: { id: req.body.id },
    });
    let getSaldo = await saldo.findAll({
      where: { sucursal_id: id },
    });

    if (req.body.movimiento === "Ingreso") {
      let saldoInicial = parseFloat(getSaldo?.at(-1)?.saldo_inicial);
      let saldoFinal = parseFloat(getSaldo?.at(-1)?.saldo_final);
      let ingresoActual = parseFloat(getSaldo?.at(-1)?.ingresos);
      let montoAnterior = parseFloat(getIngresos?.at(-1)?.monto);
      let montoNuevo = parseFloat(req.body.monto);
      let newSaldoIngreso = {
        ingresos: ingresoActual - montoAnterior + montoNuevo,
        saldo_final: saldoFinal - montoAnterior + montoNuevo,
      };

      let update = await ingresos_egresos.update(req.body, {
        where: { id: req.body.id },
      });
      const updateSaldo = await saldo.update(newSaldoIngreso, {
        where: { sucursal_id: req.body.sucursal_id },
      });
      res
        .status(200)
        .json({ msg: "Movimiento actualizado con éxito!", status: 200 });
      next();
    }
    if (req.body.movimiento === "Egreso") {
      let saldoInicial = parseFloat(getSaldo?.at(-1)?.saldo_inicial);
      let saldoFinal = parseFloat(getSaldo?.at(-1)?.saldo_final);
      let egresoActual = parseFloat(getSaldo?.at(-1)?.egresos);
      let montoAnterior = parseFloat(getIngresos?.at(-1)?.monto);
      let montoNuevo = parseFloat(req.body.monto);
      let newSaldoEgreso = {
        egresos: egresoActual - montoAnterior + montoNuevo,
        saldo_final: saldoFinal + montoAnterior - montoNuevo,
      };

      let update = await ingresos_egresos.update(req.body, {
        where: { id: req.body.id },
      });
      const updateSaldo = await saldo.update(newSaldoEgreso, {
        where: { sucursal_id: req.body.sucursal_id },
      });
      res
        .status(200)
        .json({ msg: "Movimiento actualizado con éxito!", status: 200 });
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo actualizar.", status: 500 });
  }
};

const deleteIngresoEgreso = async (req, res, next) => {
  let id = req.params.id;
  try {
    let getIngresos = await ingresos_egresos.findAll({
      where: { id: id },
    });

    let getSaldo = await saldo.findAll({
      where: { sucursal_id: getIngresos?.at(-1)?.sucursal_id },
    });
    let movimiento = getIngresos?.at(-1)?.movimiento;
    if (movimiento === "Ingreso") {
      newSaldoIngreso = {
        ingresos:
          parseInt(getSaldo?.at(-1)?.ingresos) -
          parseInt(getIngresos?.at(-1)?.monto),
        saldo_final:
          parseInt(getSaldo?.at(-1)?.saldo_final) -
          parseInt(getIngresos?.at(-1)?.monto),
      };
      let destroy = await ingresos_egresos.destroy({ where: { id: id } });
      const updateSaldo = await saldo.update(newSaldoIngreso, {
        where: {
          sucursal_id: getIngresos?.at(-1)?.sucursal_id,
        },
      });
      return res.status(200).json({
        msg: "Movimiento eliminado con éxito!",
        status: 200,
      });
    }

    if (
      movimiento === "Egreso" &&
      !getIngresos?.at(-1)?.sucursal_transferencia
    ) {
      newSaldoEgreso = {
        egresos:
          parseInt(getSaldo?.at(-1)?.egresos) -
          parseInt(getIngresos?.at(-1)?.monto),
        saldo_final:
          parseInt(getSaldo?.at(-1)?.saldo_final) +
          parseInt(getIngresos?.at(-1)?.monto),
      };
      let destroy = await ingresos_egresos.destroy({ where: { id: id } });
      const updateSaldo = await saldo.update(newSaldoEgreso, {
        where: {
          sucursal_id: getIngresos?.at(-1)?.sucursal_id,
        },
      });
      return res.status(200).json({
        msg: "Movimiento eliminado con éxito!",
        status: 200,
      });
    }
    if (
      movimiento === "Egreso" &&
      getIngresos?.at(-1)?.sucursal_transferencia
    ) {
      newSaldoEgreso = {
        egresos:
          parseInt(getSaldo?.at(-1)?.egresos) +
          parseInt(getIngresos?.at(-1)?.monto),

        saldo_final:
          parseInt(getSaldo?.at(-1)?.saldo_final) +
          parseInt(getIngresos?.at(-1)?.monto),
      };

      console.log(getIngresos?.at(-1)?.sucursal_transferencia);

      let destroyTranferencia = await ingresos_egresos.destroy({
        where: {
          sucursal_transferencia: getIngresos?.at(-1)?.sucursal_transferencia,
        },
      });

      const updateSaldo = await saldo.update(newSaldoEgreso, {
        where: {
          sucursal_id: getIngresos?.at(-1)?.sucursal_id,
        },
      });
      return res.status(200).json({
        msg: "Movimiento eliminado con éxito!",
        status: 200,
      });
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "No se pudo eliminar.", status: 500 });
  }
};

const reporteIngreso = async (req, res, next) => {
  let id = req.params.id;

  try {
    let filter;
    if (!req.body.area || req.body.area === "-1") {
      filter = {
        sucursal_id: id,
        fecha: { [Op.between]: [req.body.fecha_inicio, req.body.fecha_fin] },
      };
    } else {
      filter = {
        sucursal_id: id,
        area: req.body.area,
        fecha: { [Op.between]: [req.body.fecha_inicio, req.body.fecha_fin] },
      };
    }

    const getIngresoEgresos = await ingresos_egresos.findAll({
      where: filter,
    });

    const newObj = getIngresoEgresos.reduce(function (acc, currentValue) {
      if (!acc[currentValue["fecha"]]) {
        acc[currentValue["fecha"]] = [];
      }
      acc[currentValue["fecha"]].push(currentValue);
      return acc;
    }, {});
    const final2 = [newObj].map((item) => Object.values(item)).flat();

    const final3 = final2
      .map((item) =>
        item
          .map((data) => data)
          .reduce((acc, value) => {
            const item = acc.find((it) => it.movimiento === value.movimiento);
            item
              ? (item.monto = parseFloat(item.monto) + parseFloat(value.monto))
              : acc.push(value);
            return acc;
          }, [])
      )
      .flat()
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    const getLabels = [...new Set(final3.map((item) => item.fecha))];

    let labels = getLabels;
    // terminar falta agregar 0 a los ingresos y egresos cuando no hay nada en el dia

    let ingresos = {
      label: "Ingresos",
      type: "line",
      data: getLabels.map((item, i) => {
        let result = final3.find(
          (data, index) => data.movimiento === "Ingreso" && data.fecha === item
        );
        if (result) {
          return parseInt(
            final3
              .filter((data, index) => data.movimiento === "Ingreso")
              .filter((dat) => dat.fecha === item)
              .map((da) => da.monto)
          );
        } else {
          return 0;
        }
      }),
      fill: false,
      borderColor: "rgb(75, 110, 185)",
      tension: 0.1,
    };

    let egresos = {
      label: "Egresos",
      type: "line",
      data: getLabels.map((item, i) => {
        let result = final3.find(
          (data, index) => data.movimiento === "Egreso" && data.fecha === item
        );
        if (result) {
          return parseInt(
            final3
              .filter((data, index) => data.movimiento === "Egreso")
              .filter((dat) => dat.fecha === item)
              .map((da) => da.monto)
          );
        } else {
          return 0;
        }
      }),
      fill: false,
      borderColor: "rgb(222, 101, 92)",
      tension: 0.1,
    };

    const concat = { labels: labels, ingresos: ingresos, egresos: egresos };
    res.status(200).json({ data: concat });
    next();
  } catch (error) {
    res.status(500).json(error);
  }
};

const convertJsonToExcel = async (req, res, next) => {
  let id = req.params.id;
  try {
    const getIngresos = await ingresos_egresos.findAll({
      where: {
        sucursal_id: id,
        fecha: {
          [Op.between]: [req.query.fecha_inicio, req.query.fecha_fin],
        },
      },
      include: [{ model: sucursal }],
    });
    // const consejoAdministracion = getIngresos
    //   .filter((item) => item.area === "Consejo de Administración")
    //   .map((item) => {
    //     return [
    //       item.fecha,
    //       item.comprobante,
    //       item.nro_comprobante,
    //       item.proveedor,
    //       item.descripcion,
    //       item.area,
    //       item.area,
    //       item.movimiento,
    //       "Tesorería",
    //       item.ingresos ? item.monto : "",
    //       item.egresos ? item.monto : "",
    //       item.saldo_final,
    //     ];
    //   });

    // const administracionMina = getIngresos
    //   .filter((item) => item.area === "Administración Mina ")
    //   .map((item) => {
    //     return [
    //       item.fecha,
    //       item.comprobante,
    //       item.nro_comprobante,
    //       item.proveedor,
    //       item.descripcion,
    //       item.area,
    //       item.area,
    //       item.movimiento,
    //       "Tesorería",
    //       item.ingresos ? item.monto : "",
    //       item.egresos ? item.monto : "",
    //       item.saldo_final,
    //     ];
    //   });

    // const operacionMina = getIngresos
    //   .filter((item) => item.area === "Operaciones Mina")
    //   .map((item) => {
    //     return [
    //       item.fecha,
    //       item.comprobante,
    //       item.nro_comprobante,
    //       item.proveedor,
    //       item.descripcion,
    //       item.area,
    //       item.area,
    //       item.movimiento,
    //       "Tesorería",
    //       item.ingresos ? item.monto : "",
    //       item.egresos ? item.monto : "",
    //       item.saldo_final,
    //     ];
    //   });
    // const despachos = getIngresos
    //   .filter((item) => item.area === "Despachos")
    //   .map((item) => {
    //     return [
    //       item.fecha,
    //       item.comprobante,
    //       item.nro_comprobante,
    //       item.proveedor,
    //       item.descripcion,
    //       item.area,
    //       item.area,
    //       item.movimiento,
    //       "Tesorería",
    //       item.ingresos ? item.monto : "",
    //       item.egresos ? item.monto : "",
    //       item.saldo_final,
    //     ];
    //   });

    // const planeamiento = getIngresos
    //   .filter((item) => item.area === "Planeamiento")
    //   .map((item) => {
    //     return [
    //       item.fecha,
    //       item.comprobante,
    //       item.nro_comprobante,
    //       item.proveedor,
    //       item.descripcion,
    //       item.area,
    //       item.area,
    //       item.movimiento,
    //       "Tesorería",
    //       item.ingresos ? item.monto : "",
    //       item.egresos ? item.monto : "",
    //       item.saldo_final,
    //     ];
    //   });

    // const planta = getIngresos
    //   .filter((item) => item.area === "Planta")
    //   .map((item) => {
    //     return [
    //       item.fecha,
    //       item.comprobante,
    //       item.nro_comprobante,
    //       item.proveedor,
    //       item.descripcion,
    //       item.area,
    //       item.area,
    //       item.movimiento,
    //       "Tesorería",
    //       item.ingresos ? item.monto : "",
    //       item.egresos ? item.monto : "",
    //       item.saldo_final,
    //     ];
    //   });

    // const sso = getIngresos
    //   .filter((item) => item.area === "SSO")
    //   .map((item) => {
    //     return [
    //       item.fecha,
    //       item.comprobante,
    //       item.nro_comprobante,
    //       item.proveedor,
    //       item.descripcion,
    //       item.area,
    //       item.area,
    //       item.movimiento,
    //       "Tesorería",
    //       item.ingresos ? item.monto : "",
    //       item.egresos ? item.monto : "",
    //       item.saldo_final,
    //     ];
    //   });

    // const medioAmbiente = getIngresos
    //   .filter((item) => item.area === "Medio Ambiente")
    //   .map((item) => {
    //     return [
    //       item.fecha,
    //       item.comprobante,
    //       item.nro_comprobante,
    //       item.proveedor,
    //       item.descripcion,
    //       item.area,
    //       item.area,
    //       item.movimiento,
    //       "Tesorería",
    //       item.ingresos ? item.monto : "",
    //       item.egresos ? item.monto : "",
    //       item.saldo_final,
    //     ];
    //   });

    const allMovimientos = getIngresos.map((item) => {
      return [
        item?.fecha,
        item?.comprobante,
        item?.nro_comprobante,
        item?.proveedor,
        item?.descripcion,
        item?.sucursal?.nombre,
        item?.area,
        item?.movimiento,
        "Tesorería",
        item?.ingresos ? parseFloat(item?.monto).toFixed(2) : "",
        item?.egresos ? parseFloat(item?.monto).toFixed(2) : "",
        parseFloat(item?.saldo_final).toFixed(2),
      ];
    });

    console.log(allMovimientos.flat().at(-1));

    const workSheetColumnsName = [
      "FECHA",
      "COMPROBANTE",
      "NÚMERO",
      "PROVEEDOR",
      "CONCEPTO",
      "CAJA",
      "ÁREA",
      "TIPO DE GASTO",
      "RESP. DE GASTO",
      "INGRESO",
      "EGRESO",
      "SALDO",
    ];

    const workBook = XLSX.utils.book_new();

    //Consejo administracion
    const workSheetData1 = [workSheetColumnsName, ...allMovimientos];
    const workSheet1 = XLSX.utils.aoa_to_sheet(workSheetData1);
    XLSX.utils.book_append_sheet(
      workBook,
      workSheet1,
      "Reporte de movimientos"
    );

    // //Administracion mina
    // const workSheetData2 = [workSheetColumnsName, ...administracionMina];
    // const workSheet2 = XLSX.utils.aoa_to_sheet(workSheetData2);
    // XLSX.utils.book_append_sheet(workBook, workSheet2, "Administración mina");

    // //Operaciones mina
    // const workSheetData3 = [workSheetColumnsName, ...operacionMina];
    // const workSheet3 = XLSX.utils.aoa_to_sheet(workSheetData3);
    // XLSX.utils.book_append_sheet(workBook, workSheet3, "Operaciones mina");

    // //Despachos
    // const workSheetData4 = [workSheetColumnsName, ...despachos];
    // const workSheet4 = XLSX.utils.aoa_to_sheet(workSheetData4);
    // XLSX.utils.book_append_sheet(workBook, workSheet4, "Despachos");

    // //Planeamiento
    // const workSheetData5 = [workSheetColumnsName, ...planeamiento];
    // const workSheet5 = XLSX.utils.aoa_to_sheet(workSheetData5);
    // XLSX.utils.book_append_sheet(workBook, workSheet5, "Planeamiento");

    // //Planta
    // const workSheetData6 = [workSheetColumnsName, ...planta];
    // const workSheet6 = XLSX.utils.aoa_to_sheet(workSheetData6);
    // XLSX.utils.book_append_sheet(workBook, workSheet6, "Planta");

    // //SSO
    // const workSheetData7 = [workSheetColumnsName, ...sso];
    // const workSheet7 = XLSX.utils.aoa_to_sheet(workSheetData7);
    // XLSX.utils.book_append_sheet(workBook, workSheet7, "SSO");

    // //SSO
    // const workSheetData8 = [workSheetColumnsName, ...medioAmbiente];
    // const workSheet8 = XLSX.utils.aoa_to_sheet(workSheetData8);
    // XLSX.utils.book_append_sheet(workBook, workSheet8, "Medio Ambiente");

    XLSX.write(workBook, { bookType: "xlsx", type: "binary" });
    XLSX.writeFile(workBook, "reporte.xlsx");

    res.status(200).sendFile("reporte.xlsx", { root: "." });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const getTrabajadorFinanza = async (req, res, next) => {
  try {
    const get = await trabajador.findAll({
      attributes: { exclude: ["usuarioId"] },
    });
    res.status(200).json({ data: get });
    next();
  } catch (error) {
    console.log("===============================");
    console.log(error);
    res.status(500).json(error);
  }
};

const getSaldoMensual = async (req, res, next) => {
  let id = req.params.id;

  try {
    const getById = await ingresos_egresos.findAll({
      where: { sucursal_id: id },
      attributes: [
        "movimiento",
        "area",
        "ingresos",
        "egresos",
        "monto",
        [Sequelize.literal(`MONTH(fecha)`), "fecha"],
      ],
    });
    const egresos = getById
      ?.filter((item) => item.movimiento === "Egreso")
      .reduce((acc, curr) => {
        const findData = acc.find((ele) => ele.fecha === curr.fecha);
        if (findData) {
          findData.monto = parseFloat(findData.monto) + parseFloat(curr.monto);
        } else {
          acc.push({
            area: curr.area,
            egresos: curr.egresos,
            fecha: curr.fecha,
            monto: parseFloat(curr.monto),
            movimiento: curr.movimiento,
          });
        }

        return acc;
      }, [])
      .map((item) => {
        return {
          ...item,
          monto: item.monto * -1,
        };
      });

    const ingresos = getById
      ?.filter((item) => item.movimiento === "Ingreso")
      .reduce((acc, curr) => {
        const findData = acc.find((ele) => ele.fecha === curr.fecha);

        if (findData) {
          findData.monto = parseFloat(findData.monto) + parseFloat(curr.monto);
        } else {
          acc.push({
            area: curr.area,
            egresos: curr.egresos,
            fecha: curr.fecha,
            monto: parseFloat(curr.monto),
            movimiento: curr.movimiento,
          });
        }

        return acc;
      }, []);

    const concat = ingresos?.concat(egresos);

    res.status(200).json({ data: concat });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

module.exports = {
  getIngresoEgresos,
  getIngresoEgresosById,
  postIngresoEgreso,
  updateIngresoEgreso,
  deleteIngresoEgreso,
  reporteIngreso,
  convertJsonToExcel,
  getTrabajadorFinanza,
  getSaldoMensual,
};
