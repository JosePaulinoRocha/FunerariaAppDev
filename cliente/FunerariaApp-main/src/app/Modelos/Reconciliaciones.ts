export interface Ingreso {
  IngresoID: number;
  Fecha: string;
  ConceptoID: number;
  NombreConcepto: string;
  Descripcion: string;
  Proveedor: string;
  Piezas: number;
  Monto: number;
  Saldo: number;
  Comprobante: string;
  SegmentoID: number;
  NombreSegmento: string;
  CategoriaID: number;
  NombreCategoria: string;
  SubcategoriaID: number;
  NombreSubcategoria: string;
  EstatusComprobacionID: number;
  NombreEstatus: string;
  FechaAutorizacion: string;
  UsuarioAutorizaID: number;
  NombreUsuarioAutoriza: string;
  UsuarioRecibeID: number;
  NombreUsuarioRecibe: string;
  FechaConciliacion: string;
  ObservacionesDifConciliacion: string;
  CuentaID: number;
  TipoCuentaID: number;
  NombreCuenta?: string;
  RFC?: string;
  Reconciliado: boolean;
}


export interface Reconciliacion {
  ReconciliacionID: number;
  Fecha: string;
  Saldo: number;
  CuentaID: number;
  NombreCuenta: string;
  NombreTipoCuenta: string;
}