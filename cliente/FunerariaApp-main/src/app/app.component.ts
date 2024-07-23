import { Component } from '@angular/core';
import { IonicModule, MenuController } from "@ionic/angular";
import { RouterModule, Router } from '@angular/router';
import { folder, folderOutline , barChart ,calendar, layers, pricetag, pricetags, clipboard, cube, construct, wallet, calendarClear, personAdd, refresh, chatboxEllipses, business, home, analytics, images, personCircle, person, mail, call, shieldCheckmark, addCircleOutline, close, accessibility, logOut, document, cash, checkmarkDone, time, alertCircle, warning, trash, create, cashOutline, peopleOutline } from "ionicons/icons";
import { addIcons } from 'ionicons';
import { AuthService } from 'src/app/Servicios/AuthService';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonicModule, RouterModule, CommonModule],
})
export class AppComponent {

  isAdmin: boolean = false;

  constructor(private menu: MenuController, private router: Router, private authService: AuthService) {
    addIcons({ 
      barChart , home, analytics, images, personCircle, person, mail, call, shieldCheckmark, 
      addCircleOutline, close, accessibility, logOut, document, cash, checkmarkDone, 
      time, alertCircle, warning, trash, create, calendar, business, layers, pricetag, 
      pricetags, clipboard, cube, construct, wallet, calendarClear, personAdd, refresh, 
      chatboxEllipses, cashOutline, peopleOutline, folderOutline, folder
    });
  }

  ngOnInit() {
    this.isAdmin = this.authService.isAdmin();
  }

  navigateTo(route: string) {
    if (route === 'usuarios' && !this.isAdmin) {
      alert('No tienes permiso para acceder a esta sección');
      return;
    }
    this.router.navigate([route]);
  }

  logout() {
    sessionStorage.removeItem('user'); // Eliminar usuario de sessionStorage
    this.menu.close(); // Cerrar el menú lateral si está abierto
    this.router.navigate(['/login']); // Redirigir a la pantalla de login
  }
}
