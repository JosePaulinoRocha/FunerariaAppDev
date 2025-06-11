import { Component, OnDestroy  } from '@angular/core';
import { IonicModule, MenuController, AlertController } from "@ionic/angular";
import { RouterModule, Router } from '@angular/router';
import { folder, folderOutline , barChart ,calendar, layers, pricetag, pricetags, clipboard, cube, construct, wallet, calendarClear, personAdd, refresh, chatboxEllipses, business, home, analytics, images, personCircle, person, mail, call, shieldCheckmark, addCircleOutline, close, accessibility, logOut, document, cash, checkmarkDone, time, alertCircle, warning, trash, create, cashOutline, peopleOutline, trashSharp, searchSharp, personCircleSharp, checkbox, gitCompare, closeCircleSharp, notificationsOutline, alertCircleOutline, arrowBackOutline, arrowForwardOutline, keySharp, closeCircleOutline, checkmarkCircleOutline, swapHorizontalOutline, trailSign, card, createOutline, walletOutline, chevronForward, cardOutline, saveOutline, calendarOutline, barChartOutline, eyeOff, cloudDownloadOutline, cloudUploadOutline } from "ionicons/icons";
import { addIcons } from 'ionicons';
import { AuthService } from 'src/app/Servicios/AuthService';
import { CommonModule } from '@angular/common';
import { NotificacionesServices } from 'src/app/Servicios/Notificaciones.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IngresosApiServices } from 'src/app/Servicios/Ingresos-api.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { forkJoin } from 'rxjs';
import { LoadingController } from '@ionic/angular';




interface Combinacion {
  CombinacionID: number;
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
  EstatusComprobacionID: number;
  ReconciliacionID: number
}

interface Historial_Ingresos {
  ImportacionID: number;
  FechaInicio: string;
  FechaCierre: string;
  FechaImportacion: string;
  NumeroRegistrosImportados : string;
}

interface Ingreso_Importado {
  collection?: string;
  service_ref?: string;
  agent?: string;
  date_affect?: string;
  date_ref?: string;
  transactions: number;
  total_amount: number;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, CommonModule],
})
export class AppComponent {

  isMobileDevice: boolean = false;

  readonly BATCH_SIZE = 100;

  isLoading: boolean = false;

  historial_ingresos: Historial_Ingresos[] = [];
  afectaciones_ingresos: Ingreso_Importado[] = [];
  funeraria_ingresos: Ingreso_Importado[] = [];
  pagos_iniciales: Ingreso_Importado[] = [];

  private unsubscribe$ = new Subject<void>();

  isAdmin: boolean = false;
  isLoggedIn: boolean = false;
  isNotificationsOpen: boolean = false;
  combinaciones: Combinacion[] = [];
  reconciliaciones: Reconciliacion[] = [];
  ingresos: Ingreso[] = [];
  notifications: { message: string, icon: string, route: string }[] = [];

  errorMessage: string | null = null;

  getIconColor(iconName: string): string {
    switch (iconName) {
      case 'git-compare':
        return 'purple';
      case 'alert-circle-outline':
        return 'red';
      case 'document':
        return 'blue';
      case 'warning':
        return 'orange'; 
      case 'time':
        return 'green'; 
      default:
        return 'black';
    }
  }

  constructor(private menu: MenuController, private router: Router, private authService: AuthService, private _notificacionServ: NotificacionesServices, private _ingresoApiServ: IngresosApiServices, private alertController: AlertController, private loadingController: LoadingController) {
    addIcons({ 
      barChart , home, analytics, images, personCircle, person, mail, call, shieldCheckmark, calendarOutline ,
      addCircleOutline, close, accessibility, logOut, document, cash, checkmarkDone, eyeOff,
      time, alertCircle, warning, trash, create, calendar, business, layers, pricetag, cloudDownloadOutline, cloudUploadOutline,
      pricetags, clipboard, cube, construct, wallet, calendarClear, personAdd, refresh, barChartOutline,
      chatboxEllipses, cashOutline, peopleOutline, folderOutline, folder, trashSharp, searchSharp, personCircleSharp,
      checkbox, gitCompare, closeCircleSharp, notificationsOutline, alertCircleOutline, arrowBackOutline, arrowForwardOutline,
      keySharp, closeCircleOutline, checkmarkCircleOutline, swapHorizontalOutline, trailSign, card, createOutline, walletOutline, chevronForward, cardOutline, saveOutline
    });

    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });

    this.authService.isAdmin$.subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });

  }

  ngOnInit() {
    this.isMobileDevice = this.isMobile();

    this.authService.isLoggedIn$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(isLoggedIn => {
        this.isLoggedIn = isLoggedIn;
        if (this.isLoggedIn) {
          this.loadCombinacionesNotificaciones();
          this.loadReconciliacionesNotificaciones();
          this.loadIngresosNotificaciones();
          this.loadHistorialIngresos();
        }
      });
  
    this.authService.isAdmin$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(isAdmin => {
        this.isAdmin = isAdmin;
    });
  }


  private isMobile(): boolean {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
  }
  

  loadHistorialIngresos() {
    this._ingresoApiServ.getHistorialIngresos().subscribe(
      (data: Historial_Ingresos[]) => {
        // console.log('Esta es mi data del historial de importaciones de ingresos: ', data);
        this.historial_ingresos = data;
  
        // Verificar si el historial tiene registros
        if (this.historial_ingresos.length > 0) {
          // Obtener el registro más reciente
          const ultimoHistorial = this.historial_ingresos[0];
          const fechaCierre = new Date(ultimoHistorial.FechaCierre);
          // console.log("Esta es la fecha de cierre: ", fechaCierre);

          const fechaCierreUTC = new Date(fechaCierre.getUTCFullYear(), fechaCierre.getUTCMonth(), fechaCierre.getUTCDate());
          // console.log("Esta es la fecha de cierre en UTC: ", fechaCierreUTC);
          
          const fechaActual = new Date();
  
          // Normalizar ambas fechas (tomar solo año, mes y día)
          const fechaCierreSinHora = new Date(fechaCierreUTC.getFullYear(), fechaCierreUTC.getMonth(), fechaCierreUTC.getDate());
          const fechaActualSinHora = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate());
  
          // Si la FechaCierre es menor a la fecha actual, hacer la importación
          if (fechaCierreSinHora < fechaActualSinHora) {
            // console.log("La fecha de cierre es menor al día actual: ", fechaCierreSinHora, fechaActualSinHora);
            this.getAfectacionesDesdeFecha(fechaCierreSinHora);
          } else {
            // console.log('No es necesaria una nueva importación, la FechaCierre es más reciente o igual a hoy. ', ' Fecha de cierre: ',fechaCierreSinHora, 'Fecha actual: ',fechaActualSinHora);
          }
        } else {
          // Si el historial está vacío, traer registros desde el 1 de enero del 2000
          // console.log('Se hará la importación masiva.');
          this.getAfectacionesDesde2000();
        }
      },
      (error) => {
        this.presentAlert('Error al buscar el historial de importaciones');
      }
    );
  }
  


  getAfectacionesDesdeFecha(fechaCierreSinHora: Date) {
    this.errorMessage = null;

    // No redefinimos fechaCierreSinHora, usamos el argumento directamente
    const fechaInicio = new Date(fechaCierreSinHora);
    fechaInicio.setDate(fechaInicio.getDate() - 1); // Restar un día
    const fechaInicioStr = fechaInicio.toISOString().split('T')[0]; // Convertir a string
    // console.log("esta es la nueva fecha de inicio: ", fechaInicioStr);

    const fechaFin = new Date().toISOString().split('T')[0]; // Fecha actual
  
    // Obtener el token para la API
    this._ingresoApiServ.getToken('test', '1234').pipe(
      catchError(err => {
        this.errorMessage = 'Error al obtener el token';
        return throwError(err);
      })
    ).subscribe((tokenResponse: any) => {
      const token = tokenResponse.token;
  
      let responsesCount = 0; // Contador para las respuestas
  
      // Traer datos de afectaciones (primer ingreso)
      this._ingresoApiServ.getPaidsAffected(token, fechaInicioStr, fechaFin).pipe(
        catchError(err => {
          this.errorMessage = 'Error al obtener ingresos de Afectaciones';
          return throwError(err);
        })
      ).subscribe((data: Ingreso_Importado[]) => {
        this.afectaciones_ingresos = data;
        // console.log('Datos de Afectaciones:', data);
        responsesCount++;
        this.checkImportarIngresos(responsesCount);
      });
  
      // Traer datos de pagos funerarios
      forkJoin([
        this._ingresoApiServ.getFunerariaPayments(token, 'Mexicali', fechaInicioStr, fechaFin),
        this._ingresoApiServ.getFunerariaPayments(token, 'San Luis Río Colorado', fechaInicioStr, fechaFin)
      ])
      .pipe(
        catchError(err => {
          this.errorMessage = 'Error al obtener pagos funerarios';
          return throwError(err);
        })
      ).subscribe((results: [Ingreso_Importado[], Ingreso_Importado[]]) => {
        this.funeraria_ingresos = [...results[0], ...results[1]];
        // console.log('Datos de Funeraria:', this.funeraria_ingresos);
        responsesCount++;
        this.checkImportarIngresos(responsesCount);
      });
  
      // Traer datos de pagos iniciales
      this._ingresoApiServ.getPagosIniciales(token, fechaInicioStr, fechaFin).pipe(
        catchError(err => {
          this.errorMessage = 'Error al obtener pagos iniciales';
          return throwError(err);
        })
      ).subscribe((data: Ingreso_Importado[]) => {
        this.pagos_iniciales = data;
        // console.log('Datos de Pagos Iniciales:', data);
        responsesCount++;
        this.checkImportarIngresos(responsesCount);
      });
    });
  }
  
  
  
  getAfectacionesDesde2000() {
    this.errorMessage = null;
    const fechaInicio = '2024-10-01'; // Fecha de inicio: 1 de enero de 2000
    const fechaFin = new Date().toISOString().split('T')[0]; // Fecha actual

    // Obtener el token para la API
    this._ingresoApiServ.getToken('test', '1234').pipe(
        catchError(err => {
            this.errorMessage = 'Error al obtener el token';
            return throwError(err);
        })
    ).subscribe((tokenResponse: any) => {
        const token = tokenResponse.token;

        let responsesCount = 0; // Contador para las respuestas

        // Traer datos de afectaciones (primer ingreso)
        this._ingresoApiServ.getPaidsAffected(token, fechaInicio, fechaFin).pipe(
            catchError(err => {
                this.errorMessage = 'Error al obtener ingresos de Afectaciones';
                return throwError(err);
            })
        ).subscribe((data: Ingreso_Importado[]) => {
            this.afectaciones_ingresos = data;
            // console.log('Datos de Afectaciones:', data);
            responsesCount++; // Incrementar el contador
            this.checkImportarIngresos(responsesCount); // Verificar si se debe llamar a importarIngresos
        });

        // Traer datos de pagos funerarios para Mexicali y San Luis Río Colorado
        forkJoin([
            this._ingresoApiServ.getFunerariaPayments(token, 'Mexicali', fechaInicio, fechaFin),
            this._ingresoApiServ.getFunerariaPayments(token, 'San Luis Río Colorado', fechaInicio, fechaFin)
        ])
        .pipe(
            catchError(err => {
                this.errorMessage = 'Error al obtener pagos funerarios';
                return throwError(err);
            })
        ).subscribe((results: [Ingreso_Importado[], Ingreso_Importado[]]) => {
            this.funeraria_ingresos = [...results[0], ...results[1]];
            // console.log('Datos de Funeraria:', this.funeraria_ingresos);
            responsesCount++; // Incrementar el contador
            this.checkImportarIngresos(responsesCount); // Verificar si se debe llamar a importarIngresos
        });

        // Traer datos de pagos iniciales (tercer ingreso)
        this._ingresoApiServ.getPagosIniciales(token, fechaInicio, fechaFin).pipe(
            catchError(err => {
                this.errorMessage = 'Error al obtener pagos iniciales';
                return throwError(err);
            })
        ).subscribe((data: Ingreso_Importado[]) => {
            this.pagos_iniciales = data;
            // console.log('Datos de Pagos Iniciales:', data);
            responsesCount++; // Incrementar el contador
            this.checkImportarIngresos(responsesCount); // Verificar si se debe llamar a importarIngresos
        });
    });
  }

  // Método para verificar si se deben importar ingresos
  checkImportarIngresos(responsesCount: number) {
      if (responsesCount === 3) {
          this.importarIngresos(); // Llamar a importarIngresos solo si se han recuperado los 3 tipos de ingresos
      }
  }



importarIngresos() {
    // Asegúrate de que hay registros para importar
    if (this.afectaciones_ingresos.length === 0 && this.funeraria_ingresos.length === 0 && this.pagos_iniciales.length === 0) {
        console.warn('No hay registros para importar.');
        return;
    }

    // Prepara los datos para enviar en una sola solicitud
    const registrosParaImportar = [
        ...this.afectaciones_ingresos.map(ingreso => ({
            tipoIngreso: 'afectaciones',
            collection: ingreso.collection,
            service_ref: ingreso.service_ref,
            agent: ingreso.agent,
            date_affect: ingreso.date_affect,
            date_ref: ingreso.date_ref,
            transactions: ingreso.transactions,
            total_amount: ingreso.total_amount
        })),
        ...this.funeraria_ingresos.map(ingreso => ({
            tipoIngreso: 'funeraria',
            collection: ingreso.collection,
            service_ref: ingreso.service_ref,
            agent: ingreso.agent,
            date_affect: ingreso.date_affect,
            date_ref: ingreso.date_ref,
            transactions: ingreso.transactions,
            total_amount: ingreso.total_amount
        })),
        ...this.pagos_iniciales.map(ingreso => ({
            tipoIngreso: 'pagos-iniciales',
            collection: ingreso.collection,
            service_ref: ingreso.service_ref,
            agent: ingreso.agent,
            date_affect: ingreso.date_affect,
            date_ref: ingreso.date_ref,
            transactions: ingreso.transactions,
            total_amount: ingreso.total_amount
        }))
    ];

    // console.log("Estos son los registros a importar: ", registrosParaImportar);
    
    // Inicia el indicador de carga
    this.isLoading = true;

    // Enviar registros en batches
    this.sendBatches(registrosParaImportar);
} 




  sendBatches(registros: any[]) {
    const totalRegistros = registros.length;
    let offset = 0;

    const fechaInicio = '2000-01-01'; // Fecha de inicio predefinida

    // Formatear las fechas en los registros antes de enviarlos
    const registrosFormateados = registros.map((registro) => {
        if (registro.date_affect) {
            registro.date_affect = registro.date_affect.split('T')[0]; // Extrae solo la fecha (YYYY-MM-DD)
        }
        if (registro.date_ref) {
            registro.date_ref = registro.date_ref.split('T')[0]; // Extrae solo la fecha (YYYY-MM-DD)
        }
        return registro;
    });

    const sendNextBatch = () => {
        // Obtiene el batch actual de registros
        const batch = registrosFormateados.slice(offset, offset + this.BATCH_SIZE);

        // Si no hay más registros que enviar, finaliza
        if (batch.length === 0) {
            // console.log('Todos los registros han sido importados.');

            const fechaCierre = new Date(); // Almacena la fecha de cierre de la importación
            const fechaCierreFormateada = fechaCierre.toISOString().split('T')[0]; // Formatear fecha de cierre (YYYY-MM-DD)

            // Llama a crearHistorial con las fechas formateadas
            this._ingresoApiServ.crearHistorial(fechaInicio, fechaCierre, totalRegistros).subscribe(
              () => {
                  // console.log('Historial de importación creado con éxito.');
              },
              (error) => {
                  console.error('Error al crear el historial de importación:', error);
              }
          );

            // Finaliza el indicador de carga
            this.isLoading = false;
            return;
        }

        // Enviar el batch al endpoint
        this._ingresoApiServ.importarIngresos(batch).subscribe(
            () => {
                // console.log(`Batch de ${batch.length} registros importados correctamente`);
                offset += this.BATCH_SIZE; // Incrementar el offset para el siguiente batch
                sendNextBatch(); // Llamar de nuevo para enviar el siguiente batch
            },
            (error: any) => {
                console.error('Error al importar el batch de registros', error);
                // Aquí podrías manejar errores específicos o realizar un reintento si es necesario
                this.isLoading = false; // Finaliza el indicador de carga en caso de error
            }
        );
    };

    // Iniciar el proceso de envío
    sendNextBatch();
  }

  

  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }

  async presentSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'El registro se ha guardado correctamente.',
      buttons: ['OK']
    });
    await alert.present();
  }
  
  async presentErrorAlert() {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'Hubo un problema al guardar el registro. Inténtalo nuevamente.',
      buttons: ['OK']
    });
    await alert.present();
  }

  loadIngresosNotificaciones() {
    this._notificacionServ.loadIngresosNotificaciones().subscribe((data: Ingreso[]) => {
        this.ingresos = data;
        // console.log("Esta es la información de mis ingresos/egresos con comprobantes y proveedores no autorizados:", data);
  
        const comprobacionManual = this.ingresos.filter(ingreso => ingreso.EstatusComprobacionID === 2).length;
        const proveedorNoAutorizado = this.ingresos.filter(ingreso => ingreso.EstatusComprobacionID === 3).length;
        const pendienteImportacion = this.ingresos.filter(ingreso => ingreso.EstatusComprobacionID === 4).length;
  
        if (comprobacionManual > 0) {
            this.notifications.push({
                message: `Comprobaciones manuales pendientes: ${comprobacionManual}`,
                icon: 'document',
                route: '/ingresos-egresos'
            });
        }
  
        if (proveedorNoAutorizado > 0) {
            this.notifications.push({
                message: `Proveedores no autorizados: ${proveedorNoAutorizado}`,
                icon: 'warning',
                route: '/ingresos-egresos'
            });
        }
  
        if (pendienteImportacion > 0) {
            this.notifications.push({
                message: `Comprobantes pendientes de importación: ${pendienteImportacion}`,
                icon: 'time',
                route: '/ingresos-egresos'
            });
        }
    }, (error: any) => {
        console.error('Error fetching ingresos', error); 
    });
  }
  
  loadReconciliacionesNotificaciones() {
    this._notificacionServ.getReconciliacionesNotificaciones().subscribe((data: Reconciliacion[]) => {
        this.reconciliaciones = data;
        // console.log("esta es la info de mis notificaciones de reconciliaciones atrasadas:", data);
        
        if (this.reconciliaciones.length > 0) {
            this.notifications.push({
                message: `Reconciliaciones pendientes: ${this.reconciliaciones.length}`,
                icon: 'alert-circle-outline',
                route: '/reconciliaciones-historial'
            });
        }
        
    }, (error: any) => {
        console.error('Error fetching reconciliaciones', error); 
    });
  }
  
  loadCombinacionesNotificaciones() {
      this._notificacionServ.getCombinacionesNotificaciones().subscribe((data: Combinacion[]) => {
          this.combinaciones = data;
          // console.log("esta es la info de mis notificaciones de combinaciones a validar:", data);
          const pendientes = this.combinaciones.filter(combinacion => !combinacion.validado).length;
          
          if (pendientes > 0) {
            this.notifications.push({
                message: `Combinaciones a validar: ${pendientes}`,
                icon: 'git-compare',
                route: '/combinaciones'
            });
          }
      }, (error: any) => {
          console.error('Error fetching combinaciones', error); 
      });
  }

  navigateTo(route: string) {
    if (route === 'usuarios' && !this.isAdmin) {
      alert('No tienes permiso para acceder a esta sección');
      return;
    }
    this.router.navigate([route]);
  }

  toggleNotifications() {
    this.isNotificationsOpen = !this.isNotificationsOpen;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  logout() {
    sessionStorage.removeItem('user'); 
    sessionStorage.removeItem('token');
    this.menu.close(); 
    this.isLoggedIn = false;  
    this.router.navigate(['/login']); 
    this.authService.logout();
    this.unsubscribe$.next();  // Desuscribir inmediatamente al cerrar sesión
    this.isLoggedIn = false;
  }


  async presentLoading(message: string) {
    const loading = await this.loadingController.create({
      message: message,
      spinner: 'crescent', // Puedes cambiar el spinner a 'lines', 'bubbles', etc.
    });
    await loading.present();
    return loading;
  }
  
  async dismissLoading(loading: HTMLIonLoadingElement) {
    await loading.dismiss();
  }
  

  
}
