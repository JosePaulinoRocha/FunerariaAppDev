export interface Transferencia {
    TransferenciaID: number;
    CuentaEnviaID: number;
    EnviaTipoCuentaID: number;
    EnviaNombreCuenta: string;
    EnviaRFC: string;
    CuentaRecibeID: number;
    RecibeTipoCuentaID: number;
    RecibeNombreCuenta: string;
    RecibeRFC: string;
    Descripcion: string;
    Monto: number;
    Fecha: string;
}
