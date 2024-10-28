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