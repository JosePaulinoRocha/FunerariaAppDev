export interface Ingreso {
  IngresoID: number;
  Fecha: string;
  ConceptoID: number;
  NombreConcepto: string;
  Descripcion: string;
  Proveedor: string;
  Piezas: number;
  CajaChica: boolean;
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
  NombreCajaChica?: string;
  RFC?: string;
  NombreDuenoCuenta?: string;
  SaldoReconciliacion: number;
  TipoCuenta: string;
  NombreCuenta: string;
  Reconciliado: number;
  TipoIngreso: { data: number[]; type: string; };
  ReconciliacionID: number
}

export interface Concepto {
  ConceptoID: number;
  Nombre: string;
}

export interface Segmento {
  SegmentoID: number;
  Nombre: string;
}

export interface Categoria {
  CategoriaID: number;
  Nombre: string;
}

export interface Subcategoria {
  SubcategoriaID: number;
  Nombre: string;
}

export interface Usuario {
  userId: number;
  fullName: string;
  phone: string;
  email: string;
  isAdmin: boolean;
  password: string;
}

export interface Combinacion {
  CombinacionID: number;
  ConceptoID: number;
  SegmentoID: number;
  CategoriaID: number;
  SubcategoriaID: number;
}


export interface Estatus {
  EstatusID: number;
  Descripcion: string;
}

export interface Cuenta {
  CuentaID: number;
  TipoCuentaID: number;
  NombreCuenta: string;
  RFC: string;
}