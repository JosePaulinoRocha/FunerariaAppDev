import cors from 'cors';
import express, { Application } from 'express';
import morgan from 'morgan';
import path from 'path';

import Usuarios from "./routes/Usuarios.routes"
import Ingresos from "./routes/Ingresos.routes"
import Reconciliaciones from "./routes/Reconciliaciones.routes"
import Combinaciones from "./routes/Combinaciones.routes"
import Notificaciones from "./routes/Notificaciones.routes"
import ImportarIngresos from "./routes/Importar-Ingresos.routes"
import ImportarIngresosArchivo from "./routes/Importar-Ingresos-Archivo.routes"
import Proveedores from "./routes/Proveedores.routes"
import Presupuesto from "./routes/Presupuesto.routes"
import PresupuestoMensualFrecuencia from "./routes/Presupuesto-Mensual-Frecuencia.routes"
import PresupuestoMensualCuentas from "./routes/Presupuesto-Mensual-Cuentas.routes"
import Transferencias from "./routes/Transferencias.routes"
import Reportes from "./routes/Reportes.routes"
import ResumenPresupuesto from "./routes/Resumen-Presupuesto.routes"
import Proyeccion from "./routes/Proyeccion.routes"



const dir = '../../cliente/DirectoriCliente/';


export class App {
    private app: Application;

    constructor(private port?: number | string) {
        this.app = express();
        this.settings();
        this.middlewares();
        this.routes();
    }

    settings() {
        this.app.set('port', this.port || process.env.PORT || 3000);
        this.app.set('path', dir);
    }

    allowCrossDomain(req: any, res: any, next: any) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Cache-Control, Authorization, Content-Length');
        if ('OPTIONS' == req.method) res.send(200);
        else next();
    }

    middlewares() {
        this.app.use(morgan('dev'));
        this.app.use(cors({
            origin: '*', // Asegúrate de cambiar esto al dominio de tu cliente
            methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
            credentials: true // Si necesitas enviar cookies
        }));
        this.app.use(this.allowCrossDomain);
        this.app.use(express.json({ limit: '1mb' }));
        this.app.use(express.urlencoded({ extended: true }));
        // this.app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));
        this.app.use('/uploads', express.static(path.join(__dirname, '../../uploads/')));
    }


    routes() {
       
        this.app.use('/api/usuarios', Usuarios);
        this.app.use('/api/ingresos', Ingresos);
        this.app.use('/api/reconciliaciones', Reconciliaciones);
        this.app.use('/api/combinaciones', Combinaciones);
        this.app.use('/api/notificaciones', Notificaciones);
        this.app.use('/api/importar-ingresos', ImportarIngresos);
        this.app.use('/api/importar-ingresos-archivo', ImportarIngresosArchivo);
        this.app.use('/api/proveedores', Proveedores);
        this.app.use('/api/presupuesto', Presupuesto);
        this.app.use('/api/presupuesto-mensual-frecuencia', PresupuestoMensualFrecuencia);
        this.app.use('/api/presupuesto-mensual-cuentas', PresupuestoMensualCuentas);
        this.app.use('/api/transferencias', Transferencias);
        this.app.use('/api/reportes', Reportes);
        this.app.use('/api/resumen-presupuesto', ResumenPresupuesto);
        this.app.use('/api/proyeccion', Proyeccion);


        this.app.get('*',function (req,res){
            res.sendFile(path.join(dir, 'index.html'));
        });
    }


    async listen() {
        this.app.listen(this.app.get('port'));
        console.log('server on port:', this.app.get('port'));
    }
}
