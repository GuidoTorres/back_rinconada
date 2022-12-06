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
            ? getSaldo[getSaldo.length - 1]?.saldo_inicial +
              parseInt(req.body.monto)
            : getSaldo[getSaldo.length - 1]?.saldo_final +
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
      let saldoInicial = parseInt(getSaldo[getSaldo.length - 1]?.saldo_inicial);
      let saldoFinal = parseInt(getSaldo[getSaldo.length - 1]?.saldo_final);
      let ingresoActual = parseInt(getSaldo[getSaldo.length - 1]?.ingresos);
      let montoAnterior = parseInt(getIngresos[getIngresos.length - 1]?.monto);
      let montoNuevo = parseInt(req.body.monto);
      let newSaldoIngreso = {
        saldo_inicial: saldoInicial,
        ingresos: ingresoActual - montoAnterior + montoNuevo,
        saldo_final:
          getSaldo[getSaldo.length - 1]?.saldo_final === 0
            ? saldoInicial - montoAnterior + montoNuevo
            : saldoFinal - montoAnterior + montoNuevo,
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
      let newSaldoEgreso = {
        saldo_inicial: getSaldo[getSaldo.length - 1]?.saldo_inicial,
        egresos:
          parseInt(getSaldo[getSaldo.length - 1]?.egresos) -
          parseInt(getIngresos[getIngresos.length - 1]?.egresos) +
          parseInt(req.body.monto),
        saldo_final:
          getSaldo[getSaldo.length - 1]?.saldo_final === 0
            ? getSaldo[getSaldo.length - 1]?.saldo_inicial -
              getIngresos[getIngresos.length - 1]?.monto +
              parseInt(req.body.monto)
            : parseInt(getSaldo[getSaldo.length - 1]?.saldo_final) +
              parseInt(getIngresos[getIngresos.length - 1]?.monto) -
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
    let getIngresos = await ingresos_egresos.findAll({
      where: { id: id },
    });

    let getSaldo = await saldo.findAll({
      where: { sucursal_id: getIngresos[getIngresos.length - 1]?.sucursal_id },
    });

    let movimiento = getIngresos[getIngresos.length - 1]?.movimiento;
    if (movimiento === "Ingreso") {
      newSaldoIngreso = {
        ingresos:
          parseInt(getSaldo[getSaldo.length - 1]?.ingresos) -
          parseInt(getSaldo[getSaldo.length - 1]?.monto),
        saldo_final:
          parseInt(getSaldo[getSaldo.length - 1]?.saldo_final) -
          parseInt(getSaldo[getSaldo.length - 1]?.monto),
      };
      let destroy = await ingresos_egresos.destroy({ where: { id: id } });
      const updateSaldo = await saldo.update(newSaldoIngreso, {
        where: {
          sucursal_id: getIngresos[getIngresos.length - 1]?.sucursal_id,
        },
      });
      res.status(200).json({
        msg: "Movimiento eliminado con éxito!",
        status: 200,
      });
      next();
    }

    if (movimiento === "Egreso") {
      newSaldoEgreso = {
        egresos:
          parseInt(getSaldo[getSaldo.length - 1]?.egresos) +
          parseInt(getSaldo[getSaldo.length - 1]?.monto),
        saldo_final:
          parseInt(getSaldo[getSaldo.length - 1]?.saldo_final) +
          parseInt(getSaldo[getSaldo.length - 1]?.monto),
      };

      let destroy = await ingresos_egresos.destroy({ where: { id: id } });
      const updateSaldo = await saldo.update(newSaldoEgreso, {
        where: {
          sucursal_id: getIngresos[getIngresos.length - 1]?.sucursal_id,
        },
      });
      res.status(200).json({
        msg: "Movimiento eliminado con éxito!",
        status: 200,
      });
      next();
    }
  } catch (error) {
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
              ? (item.monto = parseInt(item.monto) + parseInt(value.monto))
              : acc.push(value);
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
      data: getLabels.map((item, i) =>
        final3
          .filter((data, index) => data.movimiento === "Ingreso")
          .filter((dat) => dat.fecha === item).length === 0
          ? 0
          : parseInt(
              final3
                .filter((data, index) => data.movimiento === "Ingreso")
                .filter((dat) => dat.fecha === item)
                .map((da) => da.monto)
            )
      ),
      fill: false,
      borderColor: "rgb(75, 110, 185)",
      tension: 0.1,
    };

    let egresos = {
      label: "Egresos",
      type: "line",
      data: getLabels.map((item, i) =>
        final3
          .filter((data, index) => data.movimiento === "Egreso")
          .filter((dat) => dat.fecha === item).length === 0
          ? 0
          : parseInt(
              final3
                .filter((data, index) => data.movimiento === "Egreso")
                .filter((dat) => dat.fecha === item)
                .map((da) => da.monto)
            )
      ),
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
    });
    console.log(getIngresos);
    const consejoAdministracion = getIngresos
      .filter((item) => item.area === "Consejo de Administración")
      .map((item) => {
        return [
          item.fecha,
          item.comprobante,
          item.nro_comprobante,
          item.proveedor,
          item.descripcion,
          item.area,
          item.area,
          item.movimiento,
          "Tesorería",
          item.ingresos ? item.monto : "",
          item.egresos ? item.monto : "",
          item.saldo_final,
        ];
      });

    const administracionMina = getIngresos
      .filter((item) => item.area === "Administración Mina ")
      .map((item) => {
        return [
          item.fecha,
          item.comprobante,
          item.nro_comprobante,
          item.proveedor,
          item.descripcion,
          item.area,
          item.area,
          item.movimiento,
          "Tesorería",
          item.ingresos ? item.monto : "",
          item.egresos ? item.monto : "",
          item.saldo_final,
        ];
      });

    const operacionMina = getIngresos
      .filter((item) => item.area === "Operaciones Mina")
      .map((item) => {
        return [
          item.fecha,
          item.comprobante,
          item.nro_comprobante,
          item.proveedor,
          item.descripcion,
          item.area,
          item.area,
          item.movimiento,
          "Tesorería",
          item.ingresos ? item.monto : "",
          item.egresos ? item.monto : "",
          item.saldo_final,
        ];
      });
    const despachos = getIngresos
      .filter((item) => item.area === "Despachos")
      .map((item) => {
        return [
          item.fecha,
          item.comprobante,
          item.nro_comprobante,
          item.proveedor,
          item.descripcion,
          item.area,
          item.area,
          item.movimiento,
          "Tesorería",
          item.ingresos ? item.monto : "",
          item.egresos ? item.monto : "",
          item.saldo_final,
        ];
      });

    const planeamiento = getIngresos
      .filter((item) => item.area === "Planeamiento")
      .map((item) => {
        return [
          item.fecha,
          item.comprobante,
          item.nro_comprobante,
          item.proveedor,
          item.descripcion,
          item.area,
          item.area,
          item.movimiento,
          "Tesorería",
          item.ingresos ? item.monto : "",
          item.egresos ? item.monto : "",
          item.saldo_final,
        ];
      });

    const planta = getIngresos
      .filter((item) => item.area === "Planta")
      .map((item) => {
        return [
          item.fecha,
          item.comprobante,
          item.nro_comprobante,
          item.proveedor,
          item.descripcion,
          item.area,
          item.area,
          item.movimiento,
          "Tesorería",
          item.ingresos ? item.monto : "",
          item.egresos ? item.monto : "",
          item.saldo_final,
        ];
      });

    const sso = getIngresos
      .filter((item) => item.area === "SSO")
      .map((item) => {
        return [
          item.fecha,
          item.comprobante,
          item.nro_comprobante,
          item.proveedor,
          item.descripcion,
          item.area,
          item.area,
          item.movimiento,
          "Tesorería",
          item.ingresos ? item.monto : "",
          item.egresos ? item.monto : "",
          item.saldo_final,
        ];
      });

    const medioAmbiente = getIngresos
      .filter((item) => item.area === "Medio Ambiente")
      .map((item) => {
        return [
          item.fecha,
          item.comprobante,
          item.nro_comprobante,
          item.proveedor,
          item.descripcion,
          item.area,
          item.area,
          item.movimiento,
          "Tesorería",
          item.ingresos ? item.monto : "",
          item.egresos ? item.monto : "",
          item.saldo_final,
        ];
      });

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
    const workSheetData1 = [workSheetColumnsName, ...consejoAdministracion];
    const workSheet1 = XLSX.utils.aoa_to_sheet(workSheetData1);
    XLSX.utils.book_append_sheet(
      workBook,
      workSheet1,
      "Consejo de Administración"
    );

    //Administracion mina
    const workSheetData2 = [workSheetColumnsName, ...administracionMina];
    const workSheet2 = XLSX.utils.aoa_to_sheet(workSheetData2);
    XLSX.utils.book_append_sheet(workBook, workSheet2, "Administración mina");

    //Operaciones mina
    const workSheetData3 = [workSheetColumnsName, ...operacionMina];
    const workSheet3 = XLSX.utils.aoa_to_sheet(workSheetData3);
    XLSX.utils.book_append_sheet(workBook, workSheet3, "Operaciones mina");

    //Despachos
    const workSheetData4 = [workSheetColumnsName, ...despachos];
    const workSheet4 = XLSX.utils.aoa_to_sheet(workSheetData4);
    XLSX.utils.book_append_sheet(workBook, workSheet4, "Despachos");

    //Planeamiento
    const workSheetData5 = [workSheetColumnsName, ...planeamiento];
    const workSheet5 = XLSX.utils.aoa_to_sheet(workSheetData5);
    XLSX.utils.book_append_sheet(workBook, workSheet5, "Planeamiento");

    //Planta
    const workSheetData6 = [workSheetColumnsName, ...planta];
    const workSheet6 = XLSX.utils.aoa_to_sheet(workSheetData6);
    XLSX.utils.book_append_sheet(workBook, workSheet6, "Planta");

    //SSO
    const workSheetData7 = [workSheetColumnsName, ...sso];
    const workSheet7 = XLSX.utils.aoa_to_sheet(workSheetData7);
    XLSX.utils.book_append_sheet(workBook, workSheet7, "SSO");

    //SSO
    const workSheetData8 = [workSheetColumnsName, ...medioAmbiente];
    const workSheet8 = XLSX.utils.aoa_to_sheet(workSheetData8);
    XLSX.utils.book_append_sheet(workBook, workSheet8, "Medio Ambiente");

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
