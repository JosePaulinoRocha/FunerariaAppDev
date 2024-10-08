export interface Proveedor {
  ProveedorID: number;
  Proveedor: string;
  Estatus: { data: number[]; type: string; };
  CostoPorPieza: number;
  CategoriaID: number;
  NombreCategoria: string;
  SubcategoriaID: number;
  NombreSubcategoria: string;
  FechaRegistro: string;
  Rentabilidad: string;
  RentabilidadCostoPeriodo: number;
  }