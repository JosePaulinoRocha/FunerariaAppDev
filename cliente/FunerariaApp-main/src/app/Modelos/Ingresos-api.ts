export interface Ingresos_api {
  collection?: string;
  service_ref?: string;
  agent?: string;
  date_affect?: string;
  date_ref?: string;
  transactions: number;
  total_amount: number;
  }


  export interface Historial_Ingresos {
    ImportacionID: number;
    FechaInicio: string;
    FechaCierre: string;
    FechaImportacion: string;
    NumeroRegistrosImportados : string;
  }