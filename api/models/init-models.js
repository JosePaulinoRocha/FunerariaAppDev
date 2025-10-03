var DataTypes = require("sequelize").DataTypes;
var _categorias = require("./categorias");
var _combinaciones = require("./combinaciones");
var _conceptos = require("./conceptos");
var _cuentas = require("./cuentas");
var _estatuscomprobacion = require("./estatuscomprobacion");
var _estatuspresupuesto = require("./estatuspresupuesto");
var _gastos_frecuencia_mensuales_cuentas = require("./gastos_frecuencia_mensuales_cuentas");
var _gastos_presupuesto = require("./gastos_presupuesto");
var _gastos_presupuesto_frecuencia = require("./gastos_presupuesto_frecuencia");
var _gastos_semanales_mensuales_cuentas = require("./gastos_semanales_mensuales_cuentas");
var _historial_ingresos_importados = require("./historial_ingresos_importados");
var _historialegresosproveedores = require("./historialegresosproveedores");
var _ingresos = require("./ingresos");
var _ingresos_externos = require("./ingresos_externos");
var _paso_usuario_presupuesto = require("./paso_usuario_presupuesto");
var _periodos_congelados = require("./periodos_congelados");
var _permisos = require("./permisos");
var _presupuesto_manual = require("./presupuesto_manual");
var _presupuesto_semanal = require("./presupuesto_semanal");
var _proveedores = require("./proveedores");
var _reasignaciones = require("./reasignaciones");
var _reconciliaciones = require("./reconciliaciones");
var _rol_permisos = require("./rol_permisos");
var _roles = require("./roles");
var _segmentos = require("./segmentos");
var _sequelizemeta = require("./sequelizemeta");
var _subcategorias = require("./subcategorias");
var _temp_egresos_import = require("./temp_egresos_import");
var _tipos_cuenta = require("./tipos_cuenta");
var _transferencias = require("./transferencias");
var _usuarios = require("./usuarios");

function initModels(sequelize) {
  var categorias = _categorias(sequelize, DataTypes);
  var combinaciones = _combinaciones(sequelize, DataTypes);
  var conceptos = _conceptos(sequelize, DataTypes);
  var cuentas = _cuentas(sequelize, DataTypes);
  var estatuscomprobacion = _estatuscomprobacion(sequelize, DataTypes);
  var estatuspresupuesto = _estatuspresupuesto(sequelize, DataTypes);
  var gastos_frecuencia_mensuales_cuentas = _gastos_frecuencia_mensuales_cuentas(sequelize, DataTypes);
  var gastos_presupuesto = _gastos_presupuesto(sequelize, DataTypes);
  var gastos_presupuesto_frecuencia = _gastos_presupuesto_frecuencia(sequelize, DataTypes);
  var gastos_semanales_mensuales_cuentas = _gastos_semanales_mensuales_cuentas(sequelize, DataTypes);
  var historial_ingresos_importados = _historial_ingresos_importados(sequelize, DataTypes);
  var historialegresosproveedores = _historialegresosproveedores(sequelize, DataTypes);
  var ingresos = _ingresos(sequelize, DataTypes);
  var ingresos_externos = _ingresos_externos(sequelize, DataTypes);
  var paso_usuario_presupuesto = _paso_usuario_presupuesto(sequelize, DataTypes);
  var periodos_congelados = _periodos_congelados(sequelize, DataTypes);
  var permisos = _permisos(sequelize, DataTypes);
  var presupuesto_manual = _presupuesto_manual(sequelize, DataTypes);
  var presupuesto_semanal = _presupuesto_semanal(sequelize, DataTypes);
  var proveedores = _proveedores(sequelize, DataTypes);
  var reasignaciones = _reasignaciones(sequelize, DataTypes);
  var reconciliaciones = _reconciliaciones(sequelize, DataTypes);
  var rol_permisos = _rol_permisos(sequelize, DataTypes);
  var roles = _roles(sequelize, DataTypes);
  var segmentos = _segmentos(sequelize, DataTypes);
  var sequelizemeta = _sequelizemeta(sequelize, DataTypes);
  var subcategorias = _subcategorias(sequelize, DataTypes);
  var temp_egresos_import = _temp_egresos_import(sequelize, DataTypes);
  var tipos_cuenta = _tipos_cuenta(sequelize, DataTypes);
  var transferencias = _transferencias(sequelize, DataTypes);
  var usuarios = _usuarios(sequelize, DataTypes);

  permisos.belongsToMany(roles, { as: 'RolID_roles', through: rol_permisos, foreignKey: "PermisoID", otherKey: "RolID" });
  roles.belongsToMany(permisos, { as: 'PermisoID_permisos', through: rol_permisos, foreignKey: "RolID", otherKey: "PermisoID" });
  combinaciones.belongsTo(categorias, { as: "Categorium", foreignKey: "CategoriaID"});
  categorias.hasMany(combinaciones, { as: "combinaciones", foreignKey: "CategoriaID"});
  gastos_presupuesto.belongsTo(categorias, { as: "Categorium", foreignKey: "CategoriaID"});
  categorias.hasMany(gastos_presupuesto, { as: "gastos_presupuestos", foreignKey: "CategoriaID"});
  historialegresosproveedores.belongsTo(categorias, { as: "Categorium", foreignKey: "CategoriaID"});
  categorias.hasMany(historialegresosproveedores, { as: "historialegresosproveedores", foreignKey: "CategoriaID"});
  ingresos.belongsTo(categorias, { as: "Categorium", foreignKey: "CategoriaID"});
  categorias.hasMany(ingresos, { as: "ingresos", foreignKey: "CategoriaID"});
  ingresos_externos.belongsTo(categorias, { as: "Categorium", foreignKey: "CategoriaID"});
  categorias.hasMany(ingresos_externos, { as: "ingresos_externos", foreignKey: "CategoriaID"});
  presupuesto_manual.belongsTo(categorias, { as: "Categorium", foreignKey: "CategoriaID"});
  categorias.hasMany(presupuesto_manual, { as: "presupuesto_manuals", foreignKey: "CategoriaID"});
  presupuesto_semanal.belongsTo(categorias, { as: "Categorium", foreignKey: "CategoriaID"});
  categorias.hasMany(presupuesto_semanal, { as: "presupuesto_semanals", foreignKey: "CategoriaID"});
  proveedores.belongsTo(categorias, { as: "Categorium", foreignKey: "CategoriaID"});
  categorias.hasMany(proveedores, { as: "proveedores", foreignKey: "CategoriaID"});
  combinaciones.belongsTo(conceptos, { as: "Concepto", foreignKey: "ConceptoID"});
  conceptos.hasMany(combinaciones, { as: "combinaciones", foreignKey: "ConceptoID"});
  gastos_presupuesto.belongsTo(conceptos, { as: "Concepto", foreignKey: "ConceptoID"});
  conceptos.hasMany(gastos_presupuesto, { as: "gastos_presupuestos", foreignKey: "ConceptoID"});
  ingresos.belongsTo(conceptos, { as: "Concepto", foreignKey: "ConceptoID"});
  conceptos.hasMany(ingresos, { as: "ingresos", foreignKey: "ConceptoID"});
  presupuesto_manual.belongsTo(conceptos, { as: "Concepto", foreignKey: "ConceptoID"});
  conceptos.hasMany(presupuesto_manual, { as: "presupuesto_manuals", foreignKey: "ConceptoID"});
  gastos_frecuencia_mensuales_cuentas.belongsTo(cuentas, { as: "Cuentum", foreignKey: "CuentaID"});
  cuentas.hasMany(gastos_frecuencia_mensuales_cuentas, { as: "gastos_frecuencia_mensuales_cuenta", foreignKey: "CuentaID"});
  gastos_presupuesto.belongsTo(cuentas, { as: "Cuentum", foreignKey: "CuentaID"});
  cuentas.hasMany(gastos_presupuesto, { as: "gastos_presupuestos", foreignKey: "CuentaID"});
  gastos_semanales_mensuales_cuentas.belongsTo(cuentas, { as: "Cuentum", foreignKey: "CuentaID"});
  cuentas.hasMany(gastos_semanales_mensuales_cuentas, { as: "gastos_semanales_mensuales_cuenta", foreignKey: "CuentaID"});
  ingresos.belongsTo(cuentas, { as: "Cuentum", foreignKey: "CuentaID"});
  cuentas.hasMany(ingresos, { as: "ingresos", foreignKey: "CuentaID"});
  presupuesto_manual.belongsTo(cuentas, { as: "Cuentum", foreignKey: "CuentaID"});
  cuentas.hasMany(presupuesto_manual, { as: "presupuesto_manuals", foreignKey: "CuentaID"});
  reconciliaciones.belongsTo(cuentas, { as: "Cuentum", foreignKey: "CuentaID"});
  cuentas.hasMany(reconciliaciones, { as: "reconciliaciones", foreignKey: "CuentaID"});
  transferencias.belongsTo(cuentas, { as: "CuentaEnvium", foreignKey: "CuentaEnviaID"});
  cuentas.hasMany(transferencias, { as: "transferencia", foreignKey: "CuentaEnviaID"});
  transferencias.belongsTo(cuentas, { as: "CuentaRecibe", foreignKey: "CuentaRecibeID"});
  cuentas.hasMany(transferencias, { as: "CuentaRecibe_transferencia", foreignKey: "CuentaRecibeID"});
  ingresos.belongsTo(estatuscomprobacion, { as: "EstatusComprobacion", foreignKey: "EstatusComprobacionID"});
  estatuscomprobacion.hasMany(ingresos, { as: "ingresos", foreignKey: "EstatusComprobacionID"});
  gastos_presupuesto.belongsTo(estatuspresupuesto, { as: "EstatusPresupuesto", foreignKey: "EstatusPresupuestoID"});
  estatuspresupuesto.hasMany(gastos_presupuesto, { as: "gastos_presupuestos", foreignKey: "EstatusPresupuestoID"});
  gastos_frecuencia_mensuales_cuentas.belongsTo(periodos_congelados, { as: "Periodo", foreignKey: "PeriodoID"});
  periodos_congelados.hasMany(gastos_frecuencia_mensuales_cuentas, { as: "gastos_frecuencia_mensuales_cuenta", foreignKey: "PeriodoID"});
  gastos_semanales_mensuales_cuentas.belongsTo(periodos_congelados, { as: "Periodo", foreignKey: "PeriodoID"});
  periodos_congelados.hasMany(gastos_semanales_mensuales_cuentas, { as: "gastos_semanales_mensuales_cuenta", foreignKey: "PeriodoID"});
  rol_permisos.belongsTo(permisos, { as: "Permiso", foreignKey: "PermisoID"});
  permisos.hasMany(rol_permisos, { as: "rol_permisos", foreignKey: "PermisoID"});
  gastos_presupuesto.belongsTo(proveedores, { as: "Proveedor", foreignKey: "ProveedorID"});
  proveedores.hasMany(gastos_presupuesto, { as: "gastos_presupuestos", foreignKey: "ProveedorID"});
  historialegresosproveedores.belongsTo(proveedores, { as: "Proveedor", foreignKey: "ProveedorID"});
  proveedores.hasMany(historialegresosproveedores, { as: "historialegresosproveedores", foreignKey: "ProveedorID"});
  ingresos.belongsTo(proveedores, { as: "Proveedor", foreignKey: "ProveedorID"});
  proveedores.hasMany(ingresos, { as: "ingresos", foreignKey: "ProveedorID"});
  ingresos.belongsTo(reconciliaciones, { as: "Reconciliacion", foreignKey: "ReconciliacionID"});
  reconciliaciones.hasMany(ingresos, { as: "ingresos", foreignKey: "ReconciliacionID"});
  rol_permisos.belongsTo(roles, { as: "Rol", foreignKey: "RolID"});
  roles.hasMany(rol_permisos, { as: "rol_permisos", foreignKey: "RolID"});
  usuarios.belongsTo(roles, { as: "Rol", foreignKey: "RolID"});
  roles.hasMany(usuarios, { as: "usuarios", foreignKey: "RolID"});
  combinaciones.belongsTo(segmentos, { as: "Segmento", foreignKey: "SegmentoID"});
  segmentos.hasMany(combinaciones, { as: "combinaciones", foreignKey: "SegmentoID"});
  gastos_presupuesto.belongsTo(segmentos, { as: "Segmento", foreignKey: "SegmentoID"});
  segmentos.hasMany(gastos_presupuesto, { as: "gastos_presupuestos", foreignKey: "SegmentoID"});
  ingresos.belongsTo(segmentos, { as: "Segmento", foreignKey: "SegmentoID"});
  segmentos.hasMany(ingresos, { as: "ingresos", foreignKey: "SegmentoID"});
  ingresos_externos.belongsTo(segmentos, { as: "Segmento", foreignKey: "SegmentoID"});
  segmentos.hasMany(ingresos_externos, { as: "ingresos_externos", foreignKey: "SegmentoID"});
  presupuesto_manual.belongsTo(segmentos, { as: "Segmento", foreignKey: "SegmentoID"});
  segmentos.hasMany(presupuesto_manual, { as: "presupuesto_manuals", foreignKey: "SegmentoID"});
  presupuesto_semanal.belongsTo(segmentos, { as: "Segmento", foreignKey: "SegmentoID"});
  segmentos.hasMany(presupuesto_semanal, { as: "presupuesto_semanals", foreignKey: "SegmentoID"});
  reasignaciones.belongsTo(segmentos, { as: "Segmento", foreignKey: "SegmentoID"});
  segmentos.hasMany(reasignaciones, { as: "reasignaciones", foreignKey: "SegmentoID"});
  combinaciones.belongsTo(subcategorias, { as: "Subcategorium", foreignKey: "SubcategoriaID"});
  subcategorias.hasMany(combinaciones, { as: "combinaciones", foreignKey: "SubcategoriaID"});
  gastos_presupuesto.belongsTo(subcategorias, { as: "Subcategorium", foreignKey: "SubcategoriaID"});
  subcategorias.hasMany(gastos_presupuesto, { as: "gastos_presupuestos", foreignKey: "SubcategoriaID"});
  historialegresosproveedores.belongsTo(subcategorias, { as: "Subcategorium", foreignKey: "SubcategoriaID"});
  subcategorias.hasMany(historialegresosproveedores, { as: "historialegresosproveedores", foreignKey: "SubcategoriaID"});
  ingresos.belongsTo(subcategorias, { as: "Subcategorium", foreignKey: "SubcategoriaID"});
  subcategorias.hasMany(ingresos, { as: "ingresos", foreignKey: "SubcategoriaID"});
  presupuesto_manual.belongsTo(subcategorias, { as: "Subcategorium", foreignKey: "SubcategoriaID"});
  subcategorias.hasMany(presupuesto_manual, { as: "presupuesto_manuals", foreignKey: "SubcategoriaID"});
  proveedores.belongsTo(subcategorias, { as: "Subcategorium", foreignKey: "SubcategoriaID"});
  subcategorias.hasMany(proveedores, { as: "proveedores", foreignKey: "SubcategoriaID"});
  cuentas.belongsTo(tipos_cuenta, { as: "TipoCuentum", foreignKey: "TipoCuentaID"});
  tipos_cuenta.hasMany(cuentas, { as: "cuenta", foreignKey: "TipoCuentaID"});
  ingresos.belongsTo(tipos_cuenta, { as: "TipoCuentum", foreignKey: "TipoCuentaID"});
  tipos_cuenta.hasMany(ingresos, { as: "ingresos", foreignKey: "TipoCuentaID"});
  ingresos.belongsTo(usuarios, { as: "UsuarioAutoriza", foreignKey: "UsuarioAutorizaID"});
  usuarios.hasMany(ingresos, { as: "ingresos", foreignKey: "UsuarioAutorizaID"});
  ingresos.belongsTo(usuarios, { as: "UsuarioRecibe", foreignKey: "UsuarioRecibeID"});
  usuarios.hasMany(ingresos, { as: "UsuarioRecibe_ingresos", foreignKey: "UsuarioRecibeID"});
  paso_usuario_presupuesto.belongsTo(usuarios, { as: "User", foreignKey: "UserID"});
  usuarios.hasOne(paso_usuario_presupuesto, { as: "paso_usuario_presupuesto", foreignKey: "UserID"});

  return {
    categorias,
    combinaciones,
    conceptos,
    cuentas,
    estatuscomprobacion,
    estatuspresupuesto,
    gastos_frecuencia_mensuales_cuentas,
    gastos_presupuesto,
    gastos_presupuesto_frecuencia,
    gastos_semanales_mensuales_cuentas,
    historial_ingresos_importados,
    historialegresosproveedores,
    ingresos,
    ingresos_externos,
    paso_usuario_presupuesto,
    periodos_congelados,
    permisos,
    presupuesto_manual,
    presupuesto_semanal,
    proveedores,
    reasignaciones,
    reconciliaciones,
    rol_permisos,
    roles,
    segmentos,
    sequelizemeta,
    subcategorias,
    temp_egresos_import,
    tipos_cuenta,
    transferencias,
    usuarios,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
