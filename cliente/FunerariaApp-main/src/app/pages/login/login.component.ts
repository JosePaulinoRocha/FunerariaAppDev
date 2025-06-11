import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/Servicios/AuthService';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, ReactiveFormsModule],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.redirectToDefaultRoute();
    }
  }

  private redirectToDefaultRoute() {
    if (this.isMobile()) {
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/home']);
    }
  }


  private isMobile(): boolean {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
  }

  login() {
    if (this.loginForm.invalid) {
      return;
    }

    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe(
      (response) => {
        // console.log(response)
        if (response.success) {
          this.authService.setSession(response); // Guarda la sesión
          this.authService.loggedInSubject.next(true); // Actualiza el estado de loggedIn
          this.authService.isAdminSubject.next(this.authService.isAdmin()); // Actualiza el estado de admin

          // Redirige según el dispositivo
          this.redirectToDefaultRoute();
        } else {
          alert('Usuario o contraseña incorrectos');
        }
      },
      (error) => {
        alert('Error en la autenticación');
      }
    );
  }


}
