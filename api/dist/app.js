"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const Usuarios_routes_1 = __importDefault(require("./routes/Usuarios.routes"));
const Ingresos_routes_1 = __importDefault(require("./routes/Ingresos.routes"));
const Reconciliaciones_routes_1 = __importDefault(require("./routes/Reconciliaciones.routes"));
const dir = '../../cliente/DirectoriCliente/';
class App {
    constructor(port) {
        this.port = port;
        this.app = (0, express_1.default)();
        this.settings();
        this.middlewares();
        this.routes();
    }
    settings() {
        this.app.set('port', this.port || process.env.PORT || 3080);
        this.app.set('path', dir);
    }
    allowCrossDomain(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Cache-Control, Authorization, Content-Length');
        if ('OPTIONS' == req.method)
            res.send(200);
        else
            next();
    }
    middlewares() {
        this.app.use((0, morgan_1.default)('dev'));
        this.app.use((0, cors_1.default)());
        this.app.use(this.allowCrossDomain);
        this.app.use(express_1.default.json({ limit: '1mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use(express_1.default.static(dir));
    }
    routes() {
        this.app.use('/api/usuarios', Usuarios_routes_1.default);
        this.app.use('/api/ingresos', Ingresos_routes_1.default);
        this.app.use('/api/reconciliaciones', Reconciliaciones_routes_1.default);
        this.app.get('*', function (req, res) {
            res.sendfile(path_1.default.join(dir, 'index.html'));
        });
    }
    async listen() {
        this.app.listen(this.app.get('port'));
        console.log('server on port:', this.app.get('port'));
    }
}
exports.App = App;
