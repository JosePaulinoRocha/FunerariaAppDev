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
    [key: string]: any; // Permite la extensión de la interfaz con otros campos si es necesario
  }