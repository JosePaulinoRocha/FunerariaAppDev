import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuariosServices } from 'src/app/Servicios/Usuarios.service';

interface User {
  userId: number;
  fullName: string;
  phone: string;
  email: string;
  isAdmin: boolean;
  RolID: number;
  NombreRol: string;
}

interface Rol {
  RolID: number;
  NombreRol: string;
}

@Component({
  selector: 'app-user-modal',
  templateUrl: './user-modal.component.html',
  styleUrls: ['./user-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class UserModalComponent implements OnInit {
  @Input() user: User = {
    userId: 0,
    fullName: '',
    phone: '',
    email: '',
    isAdmin: false,
    RolID: 0,
    NombreRol: '',
  };

  rol: Rol[] = [];

  @Input() isEditMode: boolean = false;

  constructor(private modalController: ModalController, private userService: UsuariosServices, private alertController: AlertController) {}

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.userService.getRoles().subscribe((data: Rol[]) => {
      this.rol = data;
      console.log("estos son los roles: ", this.rol)
    }, (error) => {
      this.presentAlert('Error fetching rols');
    });
  }

  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }

  closeModal() {
    this.modalController.dismiss();
  }

  saveUser() {
    if (this.isEditMode) {
      this.userService.updateUser(this.user).subscribe(response => {
        console.log('User updated:', response);
        console.log("estos son los datos: ", this.user)
        this.modalController.dismiss(this.user, 'edit');
      }, error => {
        console.error('Error updating user:', error);
      });
    } else {
      this.userService.addUser(this.user).subscribe(response => {
        console.log('User added:', response);
        console.log("estos son los datos: ", this.user)
        this.modalController.dismiss(this.user, 'add');
      }, error => {
        console.error('Error adding user:', error);
      });
    }
  }
}
