export interface Combinacion {
    CombinacionID: number;
    ConceptoID: number;
    NombreConcepto: string;
    SegmentoID: number;
    NombreSegmento: string;
    CategoriaID: number;
    NombreCategoria: string;
    SubcategoriaID: number;
    NombreSubcategoria: string;
    FechaModificacion: string;
    validado: boolean;
  }

  export interface Reconciliacion {
    ReconciliacionID: number;
    Fecha: string;
    Saldo: number;
    CuentaID: number;
    NombreCuenta: string;
    NombreTipoCuenta: string;
  }

  export interface Ingreso {
    IngresoID: number;
    Fecha: string;
    ConceptoID: number;
    NombreConcepto: string;
    Descripcion: string;
    ProveedorID: number;
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