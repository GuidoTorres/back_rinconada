const { ingresos_egresos, saldo, trabajador } = require("../../config/db");
const { Op } = require("sequelize");
const path = require("path");
const XLSX = require("xlsx");
const fs = require("fs");
const _ = require("lodash");
const { Blob } = require("buffer");

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

    if (
      req.body.movimiento === "Egreso" &&
      req.body.sucursal_transferencia &&
      req.body.sucursal_transferencia !== req.body.sucursal_id
    ) {
      let objEgreso = {
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
        ingresos: "",
        egresos:
          getSaldo[getSaldo.length - 1]?.egresos + parseInt(req.body.monto),
        saldo_final:
          getSaldo[getSaldo.length - 1]?.saldo_final === 0
            ? getSaldo[getSaldo.length - 1]?.saldo_inicial -
              parseInt(req.body.monto)
            : getSaldo[getSaldo.length - 1]?.saldo_final -
              parseInt(req.body.monto),
      };

      let objIngreso = {
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
          getSaldoEgreso[getSaldoEgreso.length - 1]?.ingresos +
          parseInt(req.body.monto),
        egresos: "",
        saldo_final:
          getSaldoEgreso[getSaldoEgreso.length - 1]?.saldo_final === 0
            ? getSaldoEgreso[getSaldoEgreso.length - 1]?.saldo_inicial +
              parseInt(req.body.monto)
            : getSaldoEgreso[getSaldoEgreso.length - 1]?.saldo_final +
              parseInt(req.body.monto),
      };
      let newSaldoEgreso = {
        saldo_inicial: getSaldo[getSaldo.length - 1]?.saldo_inicial,
        egresos:
          getSaldo[getSaldo.length - 1]?.egresos + parseInt(req.body.monto),
        saldo_final:
          getSaldo[getSaldo.length - 1]?.saldo_final === 0
            ? getSaldo[getSaldo.length - 1]?.saldo_inicial -
              parseInt(req.body.monto)
            : getSaldo[getSaldo.length - 1]?.saldo_final -
              parseInt(req.body.monto),
      };
      let newSaldoIngreso = {
        saldo_inicial: getSaldoEgreso[getSaldoEgreso.length - 1]?.saldo_inicial,
        ingresos:
          getSaldoEgreso[getSaldoEgreso.length - 1]?.ingresos +
          parseInt(req.body.monto),
        saldo_final:
          getSaldoEgreso[getSaldoEgreso.length - 1]?.saldo_final === 0
            ? getSaldoEgreso[getSaldoEgreso.length - 1]?.saldo_inicial +
              parseInt(req.body.monto)
            : getSaldoEgreso[getSaldoEgreso.length - 1]?.saldo_final +
              parseInt(req.body.monto),
      };

      const postEgreso = await ingresos_egresos.create(objEgreso);
      const postIngreso = await ingresos_egresos.create(objIngreso);

      const updateSaldoEgreso = await saldo.update(newSaldoEgreso, {
        where: { sucursal_id: req.body.sucursal_id },
      });
      const updateSaldoIngreso = await saldo.update(newSaldoIngreso, {
        where: { sucursal_id: req.body.sucursal_transferencia },
      });

      res
        .status(200)
        .json({ msg: "Movimiento registrado con éxito!", status: 200 });

      next();
    }

    if (req.body.movimiento === "Ingreso" && !req.body.sucursal_transferencia) {
      newSaldo = {
        saldo_inicial: getSaldo[getSaldo.length - 1]?.saldo_inicial,
        ingresos:
          getSaldo[getSaldo.length - 1]?.ingresos + parseInt(req.body.monto),
        saldo_final:
          getSaldo[getSaldo.length - 1]?.saldo_final === 0
            ? getSaldo[getSaldo.length - 1]?.saldo_inicial +
              parseInt(req.body.monto)
            : getSaldo[getSaldo.length - 1]?.saldo_final +
              parseInt(req.body.monto),
      };
      info = {
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
        dni: req.body.dni,
        saldo_inicial: getSaldo[getSaldo.length - 1?.saldo_inicial],
        ingresos:
          getSaldo[getSaldo.length - 1]?.ingresos + parseInt(req.body.monto),
        egresos: "",
        saldo_final:
          getSaldo[getSaldo.length - 1]?.saldo_final === 0
            ? getSaldo[getSaldo.length - 1]?.saldo_inicial -
              parseInt(req.body.monto)
            : getSaldo[getSaldo.length - 1]?.saldo_final -
              parseInt(req.body.monto),
      };
      const post = await ingresos_egresos.create(info);
      const updateSaldo = await saldo.update(newSaldo, {
        where: { sucursal_id: req.body.sucursal_id },
      });

      res
        .status(200)
        .json({ msg: "Movimiento registrado con éxito!", status: 200 });

      next();
    } else if (
      req.body.movimiento === "Egreso" &&
      !req.body.sucursal_transferencia
    ) {
      newSaldo = {
        saldo_inicial: getSaldo[getSaldo.length - 1]?.saldo_inicial,
        egresos:
          getSaldo[getSaldo.length - 1]?.egresos + parseInt(req.body.monto),
        saldo_final:
          getSaldo[getSaldo.length - 1]?.saldo_final === 0
            ? getSaldo[getSaldo.length - 1]?.saldo_inicial -
              parseInt(req.body.monto)
            : getSaldo[getSaldo.length - 1]?.saldo_final -
              parseInt(req.body.monto),
      };
      info = {
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
        dni: req.body.dni,
        saldo_inicial: getSaldo[getSaldo.length - 1]?.saldo_inicial,
        ingresos: "",
        egresos:
          getSaldo[getSaldo.length - 1]?.egresos + parseInt(req.body.monto),
        saldo_final:
          getSaldo[getSaldo.length - 1]?.saldo_final === 0
            ? getSaldo[getSaldo.length - 1]?.saldo_inicial -
              parseInt(req.body.monto)
            : getSaldo[getSaldo.length - 1]?.saldo_final -
              parseInt(req.body.monto),
      };

      const post = await ingresos_egresos.create(info);
      const updateSaldo = await saldo.update(newSaldo, {
        where: { sucursal_id: req.body.sucursal_id },
      });

      res
        .status(200)
        .json({ msg: "Movimiento registrado con éxito!", status: 200 });

      next();
    }
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
      let newSaldoIngreso = {
        saldo_inicial: getSaldo[getSaldo.length - 1]?.saldo_inicial,
        ingresos:
          getSaldo[getSaldo.length - 1]?.ingresos -
          getIngresos[getIngresos.length - 1]?.monto +
          parseInt(req.body.monto),
        saldo_final:
          getSaldo[getSaldo.length - 1]?.saldo_final === 0
            ? getSaldo[getSaldo.length - 1]?.saldo_inicial -
              getIngresos[getIngresos.length - 1]?.monto +
              parseInt(req.body.monto)
            : getSaldo[getSaldo.length - 1]?.saldo_final -
              getIngresos[getIngresos.length - 1]?.monto +
              parseInt(req.body.monto),
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
    } else if (req.body.movimiento === "Egreso") {
      let newSaldoEgreso = {
        saldo_inicial: getSaldo[getSaldo.length - 1]?.saldo_inicial,
        egresos:
          getSaldo[getSaldo.length - 1]?.ingresos +
          getIngresos[getIngresos.length - 1]?.monto +
          parseInt(req.body.monto),
        saldo_final:
          getSaldo[getSaldo.length - 1]?.saldo_final === 0
            ? getSaldo[getSaldo.length - 1]?.saldo_inicial -
              getIngresos[getIngresos.length - 1]?.monto +
              parseInt(req.body.monto)
            : getSaldo[getSaldo.length - 1]?.saldo_final +
              getIngresos[getIngresos.length - 1]?.monto +
              parseInt(req.body.monto),
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
    // let getIngresos = await ingresos_egresos.findAll({
    //   where: { id: id },
    // });
    let destroy = await ingresos_egresos.destroy({ where: { id: id } });
    // console.log(getIngresos);
    res.status(200).json({
      msg: "Movimiento eliminado con éxito!",
      status: 200,
      data: getIngresos,
    });
    next();
  } catch (error) {
    res.status(500).json({ msg: "No se pudo eliminar.", status: 500 });
  }
};

const reporteIngreso = async (req, res, next) => {
  let id = req.params.id;

  try {
    const getIngresoEgresos = await ingresos_egresos.findAll({
      where: {
        sucursal_id: id,
        area: req.body.area,
        fecha: { [Op.between]: [req.body.fecha_inicio, req.body.fecha_fin] },
      },
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
            console.log(item?.monto);
            item
              ? (item.monto = parseInt(item.monto) + parseInt(value.monto))
              : // : item=== undefined
                // ? item.monto =0
                acc.push(value);
            return acc;
          }, [])
      )
      .flat();

    const getLabels = [...new Set(final3.map((item) => item.fecha))];

    let labels = getLabels;
    // terminar falta agregar 0 a los ingresos y egresos cuando no hay nada en el dia
    let ingresos = {
      label: "Ingresos",
      type: "line",
      data: final3
        .filter((item) => item.movimiento === "Ingreso")
        .map((item) => item.monto),
      fill: false,
      borderColor: "rgb(75, 110, 185)",
      tension: 0.1,
    };

    let egresos = {
      label: "Egresos",
      type: "line",
      data:
        // getLabels.map((item,i) => {
        //   return {
        //     fecha: item,
        //     monto: final3
        //       .filter((data, index) => data.movimiento === "Egresos")
        //       .map((dat, index) => dat.monto)[i]

        //   }
        // })
        final3
          .filter((item, i) => item.movimiento === "Egreso")
          .map((item, i) => item.monto),

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
          [Op.between]: [req.params.fecha_inicio, req.params.fecha_fin],
        },
      },
    });
    const excelData = getIngresos.map((item) => {
      return [
        item.fecha,
        item.comprobante,
        item.proveedor,
        item.descripcion,
        item.sucursal_id,
        item.area,
        item.movimiento,
        item.encargado,
        item.monto,
        item.monto,
      ];
    });

    const workSheetColumnsName = [
      "Fecha",
      "Comprobante",
      "Proveedor",
      "Concepto",
      "Caja",
      "Área",
      "Tipo de Gasto",
      "Resp. de Gasto",
      "Ingreso",
      "Egreso",
      "Saldo",
    ];

    const workBook = XLSX.utils.book_new();
    const workSheetData = [workSheetColumnsName, ...excelData];

    const workSheet = XLSX.utils.aoa_to_sheet(workSheetData);
    XLSX.utils.book_append_sheet(
      workBook,
      workSheet,
      "Consejo de Administración"
    );
    XLSX.utils.book_append_sheet(workBook, workSheet, "Administración mina");
    XLSX.utils.book_append_sheet(workBook, workSheet, "Operaciones mina");
    XLSX.utils.book_append_sheet(workBook, workSheet, "Despachos");
    XLSX.utils.book_append_sheet(workBook, workSheet, "Planeamiento");
    XLSX.utils.book_append_sheet(workBook, workSheet, "Planta");

    XLSX.utils.book_append_sheet(workBook, workSheet, "SSO");
    XLSX.utils.book_append_sheet(workBook, workSheet, "Medio Ambiente");

    const filePath = path.resolve("./reporte.xlsx");
    const file = new Blob([filePath], { type: "application/vnd.ms-excel" });
    console.log(file);
    res.status(200).download(filePath);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const getTrabajadorFinanza = async (req, res, next) => {
  try {
    const get = await trabajador.findAll();
    res.status(200).json({ data: get });
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
};
