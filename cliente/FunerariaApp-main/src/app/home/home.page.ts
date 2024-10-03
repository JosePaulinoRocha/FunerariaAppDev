import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Servicios/AuthService';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})

export class HomePage implements OnInit {
  isAdmin: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.authService.isAdminSubject.subscribe((isAdmin) => {
      this.isAdmin = isAdmin;
    });
  }

  navigateTo(route: string) {
    if (route === 'usuarios' && !this.isAdmin) {
      alert('No tienes permiso para acceder a esta sección');
      return;
    }
    this.router.navigate([route]);
  }
}
