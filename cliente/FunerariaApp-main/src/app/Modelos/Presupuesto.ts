export interface Presupuesto {
    SegmentoID: number;
    NombreSegmento: string;
    CategoriaID: number;
    NombreCategoria: string;
    SubcategoriaID: number;
    NombreSubcategoria: string;
    ConceptoID: number;
    NombreConcepto: string;
    PromedioMonto: number;
    PromedioPiezas: number;
    FrecuenciaPromedio: number;
    UltimaFecha: string;
    FrecuenciaDictaminada: number;
    MontoDictaminado: number;
    CuentaID: number;
    NombreCuenta: string;
    DiaLimite: number;
    [key: string]: any; // Permite la extensión de la interfaz con otros campos si es necesario
  }

  export interface PresupuestoMensualSemanal {
    SegmentoID: number;
    NombreSegmento: string;
    CategoriaID: number;
    NombreCategoria: string;
    SubcategoriaID: number;
    NombreSubcategoria: string;
    ConceptoID: number;
    NombreConcepto: string;
    PromedioMonto: number;
    PromedioPiezas: number;
    FrecuenciaPromedio: number;
    UltimaFecha: string;
    FrecuenciaDictaminada: number;
    MontoDictaminado: number;
    CuentaID: number;
    NombreCuenta: string;
    DiaLimite: number;
    PeriodoID: number | null;
    PeriodoCongelado: string | null;
    [key: string]: any; // Permite la extensión de la interfaz con otros campos si es necesario
  }

export interface Gastos {
    GastoID: number;
    FechaPreautorizada: string;
    Concepto: string;
    Monto: number;
    ProveedorID: number;
    NombreProveedor: string;
    SegmentoID: number;
    NombreSegmento: string;
    EstatusPresupuestoID: number;
    Estatus: string;
    CuentaID: number;
    TipoCuentaID: number;
    TipoCuenta: string;
    NombreCuenta: string;
    RFC: string;
    Fecha: string;
    CategoriaID: number;
    NombreCategoria: string;
    SubcategoriaID: number;
    NombreSubcategoria: string;
    ConceptoID: number;
    NombreConcepto: string;
    [key: string]: any; // Permite la extensión de la interfaz con otros campos si es necesario
  }
  

  export interface Estatus {
    EstatusPresupuestoID: number;
    Nombre: string;
  }

  export interface PasoUsuario {
    UserID: number;
    NumeroPaso: number;
  }


  export interface Periodos {
    PeriodoID: number;
    FechaInicio: string;
    FechaFin: string;
    FechaCongelacion: string;
  }




  export interface GastoMensualPorFrecuencia {
    SegmentoID: number;
    NombreSegmento: string;
    CategoriaID: number;
    NombreCategoria: string;
    SubcategoriaID: number;
    NombreSubcategoria: string;
    ConceptoID: number;
    NombreConcepto: string;
    MontoDictaminado: number;
    FrecuenciaDictaminada: number;
    CuentaID: number | null;
    NombreCuenta: string | null;
    CajaChica: { data: number[]; type: string; };
    DiaLimite: number | null;
    PromedioMonto: number | null;
    PromedioPiezas: number | null;
    FrecuenciaPromedio: number | null;
    UltimaFecha: string | null;  // Fecha en formato ISO
    FechaSiguienteGasto: string | null;  // Fecha en formato ISO
    DiasPendientes: number | null;
    PeriodoID: number | null;
    PeriodoCongelado: string | null; // Rango de fecha como "YYYY-MM-DD al YYYY-MM-DD"
    Guardado: number;
  }


  export interface GastoMensualPorFrecuenciaAprobados {
    GastoFrecuenciaID: number;
    SegmentoID: number;
    NombreSegmento: string;
    CategoriaID: number;
    NombreCategoria: string;
    SubcategoriaID: number;
    NombreSubcategoria: string;
    ConceptoID: number;
    NombreConcepto: string;
    MontoDictaminado: number;
    FrecuenciaDictaminada: number;
    CuentaID: number | null;
    NombreCuenta: string | null;
    CajaChica: { data: number[]; type: string; };
    DiaLimite: number | null;
    PromedioMonto: number | null;
    PromedioPiezas: number | null;
    FrecuenciaPromedio: number | null;
    UltimaFecha: string | null;  // Fecha en formato ISO
    FechaSiguienteGasto: string | null;  // Fecha en formato ISO
    DiasPendientes: number | null;
    PeriodoID: number | null;
    PeriodoCongelado: string | null; // Rango de fecha como "YYYY-MM-DD al YYYY-MM-DD"
    Guardado: number;
  }

  export interface GastoPresupuestoFrecuenciaGuardados {
    GastoFrecuenciaID: number;
    SegmentoID: number;
    CategoriaID: number;
    SubcategoriaID: number;
    ConceptoID: number;
    PromedioMonto: number;
    FrecuenciaPromedio: number;
    FrecuenciaDictaminada: number;
    MontoDictaminado: number;
    CuentaID: number;
    CajaChica: { data: number[]; type: string; }; 
    UltimaFecha: string;  
    DiaLimite: number;
    DiasPendientes: number;
    PeriodoID: number;
  }




  export interface Ingreso {
    IngresoID: number;
    Fecha: string;
    ConceptoID: number;
    NombreConcepto: string;
    Descripcion: string;
    Proveedor: string;
    ProveedorEstatus: { data: number[]; type: string; };
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
  
    ReconciliacionID: number;
  
    CuentaContable: number;
  
    [key: string]: any; // Para permitir acceso dinámico
  }