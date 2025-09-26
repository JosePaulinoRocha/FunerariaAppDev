import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Servicios/AuthService';
import { CommonModule } from '@angular/common';
import { ChangePasswordModalComponent } from './modal/modal.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class HomePage implements OnInit, OnDestroy {
  isAdmin: boolean = false;
  user: any;
  isMobileDevice: boolean = false;
  userLoaded: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.isMobileDevice = this.isMobile();

    // Suscribirse al usuario reactivo
    const userSub = this.authService.user$.subscribe(user => {
      this.user = user;
      this.userLoaded = !!user;
      if (user) {
        this.checkPasswordChange();
      }
    });
    this.subscriptions.push(userSub);

    // Suscribirse a cambios de admin
    const adminSub = this.authService.isAdmin$.subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });
    this.subscriptions.push(adminSub);
  }

  ngOnDestroy() {
    // Limpiar todas las suscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  tienePermiso(ruta: string): boolean {
    if (!this.user) return false;
    if (this.isAdmin) return true;
    return Array.isArray(this.user.permisos) && this.user.permisos.includes(`/${ruta}`);
  }

  private isMobile(): boolean {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
  }

  async checkPasswordChange() {
    const isDefaultPassword = this.user?.CambioContra?.data[0] === 0;

    if (isDefaultPassword) {
      const modal = await this.modalController.create({
        component: ChangePasswordModalComponent,
        componentProps: { userId: this.user.userId },
      });
      await modal.present();

      const { data: updated } = await modal.onDidDismiss();
      if (updated) {
        this.user.CambioContra.data[0] = 1;
        this.authService.setUser(this.user);
      }
    }
  }

  navigateTo(route: string) {
    if (route === 'usuarios' && !this.isAdmin) {
      alert('No tienes permiso para acceder a esta sección');
      return;
    }
    this.router.navigate([route]);
  }
}
