import { Component } from '@angular/core';
import { IonicModule, MenuController } from "@ionic/angular";
import { RouterModule, Router } from '@angular/router';
import { folder, folderOutline , barChart ,calendar, layers, pricetag, pricetags, clipboard, cube, construct, wallet, calendarClear, personAdd, refresh, chatboxEllipses, business, home, analytics, images, personCircle, person, mail, call, shieldCheckmark, addCircleOutline, close, accessibility, logOut, document, cash, checkmarkDone, time, alertCircle, warning, trash, create, cashOutline, peopleOutline, trashSharp, searchSharp, personCircleSharp, checkbox, gitCompare, closeCircleSharp, notificationsOutline, alertCircleOutline, arrowBackOutline, arrowForwardOutline, keySharp, closeCircleOutline, checkmarkCircleOutline } from "ionicons/icons";
import { addIcons } from 'ionicons';
import { AuthService } from 'src/app/Servicios/AuthService';
import { CommonModule } from '@angular/common';
import { NotificacionesServices } from 'src/app/Servicios/Notificaciones.service';

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

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, CommonModule],
})
export class AppComponent {

  isAdmin: boolean = false;
  isLoggedIn: boolean = false;
  isNotificationsOpen: boolean = false;
  combinaciones: Combinacion[] = [];
  reconciliaciones: Reconciliacion[] = [];
  ingresos: Ingreso[] = [];
  notifications: { message: string, icon: string, route: string }[] = [];

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

  constructor(private menu: MenuController, private router: Router, private authService: AuthService, private _notificacionServ: NotificacionesServices) {
    addIcons({ 
      barChart , home, analytics, images, personCircle, person, mail, call, shieldCheckmark, 
      addCircleOutline, close, accessibility, logOut, document, cash, checkmarkDone, 
      time, alertCircle, warning, trash, create, calendar, business, layers, pricetag, 
      pricetags, clipboard, cube, construct, wallet, calendarClear, personAdd, refresh, 
      chatboxEllipses, cashOutline, peopleOutline, folderOutline, folder, trashSharp, searchSharp, personCircleSharp,
      checkbox, gitCompare, closeCircleSharp, notificationsOutline, alertCircleOutline, arrowBackOutline, arrowForwardOutline,
      keySharp, closeCircleOutline, checkmarkCircleOutline
    });
  }

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
    if (this.isLoggedIn) {
      this.loadCombinacionesNotificaciones();
    }
    if (this.isLoggedIn) {
      this.loadReconciliacionesNotificaciones();
    }
    if (this.isLoggedIn) {
      this.loadIngresosNotificaciones();
    }
  }


  loadIngresosNotificaciones() {
    this._notificacionServ.loadIngresosNotificaciones().subscribe((data: Ingreso[]) => {
        this.ingresos = data;
        console.log("Esta es la información de mis ingresos/egresos con comprobantes y proveedores no autorizados:", data);
  
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
        console.log("esta es la info de mis notificaciones de reconciliaciones atrasadas:", data);
        
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
          console.log("esta es la info de mis notificaciones de combinaciones a validar:", data);
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

  logout() {
    sessionStorage.removeItem('user'); 
    sessionStorage.removeItem('token');
    this.menu.close(); 
    this.isLoggedIn = false;  
    this.router.navigate(['/login']); 
  }
}
