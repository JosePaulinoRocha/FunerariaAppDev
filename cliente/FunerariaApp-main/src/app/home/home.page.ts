import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController  } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Servicios/AuthService';
import { CommonModule } from '@angular/common';
import { ChangePasswordModalComponent } from './modal/modal.component';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})

export class HomePage implements OnInit {
  isAdmin: boolean = false;
  user: any;
  isMobileDevice: boolean = false;

  constructor(private router: Router, private authService: AuthService, private modalController: ModalController) {}

  ngOnInit() {

    this.isMobileDevice = this.isMobile();

    this.authService.isAdminSubject.subscribe((isAdmin) => {
      this.isAdmin = isAdmin;
    });


    this.user = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.checkPasswordChange();

  }

  private isMobile(): boolean {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
  }

  async checkPasswordChange() {
    const isDefaultPassword = this.user.CambioContra?.data[0] === 0;

    if (isDefaultPassword) {
      const modal = await this.modalController.create({
        component: ChangePasswordModalComponent,
        componentProps: { userId: this.user.userId },
      });
      await modal.present();

      const { data: updated } = await modal.onDidDismiss();
      if (updated) {
        this.user.CambioContra.data[0] = 1;
        sessionStorage.setItem('user', JSON.stringify(this.user));
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
