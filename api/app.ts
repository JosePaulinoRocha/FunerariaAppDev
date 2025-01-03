import cors from 'cors';
import express, { Application } from 'express';
import morgan from 'morgan';
import path from 'path';

// Importar rutas
import Usuarios from './routes/Usuarios.routes';
import Ingresos from './routes/Ingresos.routes';
import Reconciliaciones from './routes/Reconciliaciones.routes';
import Combinaciones from './routes/Combinaciones.routes';
import Notificaciones from './routes/Notificaciones.routes';
import ImportarIngresos from './routes/Importar-Ingresos.routes';
import ImportarIngresosArchivo from './routes/Importar-Ingresos-Archivo.routes';
import Proveedores from './routes/Proveedores.routes';
import Presupuesto from './routes/Presupuesto.routes';
import PresupuestoMensualFrecuencia from './routes/Presupuesto-Mensual-Frecuencia.routes';
import PresupuestoMensualCuentas from './routes/Presupuesto-Mensual-Cuentas.routes';
import Transferencias from './routes/Transferencias.routes';
import Proyeccion from './routes/Proyeccion.routes';

export class App {
    private app: Application;

    constructor(private port?: number | string) {
        this.app = express();
        this.settings();
        this.middlewares();
        this.routes();
    }

    private settings() {
        this.app.set('port', this.port || process.env.PORT || 3000);
    }

    private middlewares() {
        this.app.use(morgan('dev'));
        this.app.use(cors({
            origin: '*', // Cambia '*' al dominio de tu cliente en producción
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true
        }));
        this.app.use(express.json({ limit: '1mb' }));
        this.app.use(express.urlencoded({ extended: true }));

        // Configuración para servir archivos estáticos
        this.app.use(express.static(path.resolve(__dirname, '../../cliente/DirectoriCliente')));
    }

    private routes() {
        // Registrar rutas
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
        this.app.use('/api/proyeccion', Proyeccion);

        // Fallback para aplicaciones SPA
        this.app.get('*', (req, res) => {
            res.sendFile(path.resolve(__dirname, '../../cliente/DirectoriCliente'));
        });
    }

    async listen() {
        this.app.listen(this.app.get('port'), () => {
            console.log(`Server on port: ${this.app.get('port')}`);
        });
    }
}
