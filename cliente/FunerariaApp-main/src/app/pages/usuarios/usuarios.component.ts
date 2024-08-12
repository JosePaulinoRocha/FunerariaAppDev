import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from "@ionic/angular";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserModalComponent } from './modal/user-modal.component';
import { UsuariosServices } from 'src/app/Servicios/Usuarios.service';
import { HttpClientModule } from '@angular/common/http';

interface User {
  userId: number;
  fullName: string;
  phone: string;
  email: string;
  isAdmin: boolean;
  RolID : number;
  NombreRol: string
}

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, UserModalComponent, HttpClientModule],
})
export class UsuariosComponent implements OnInit {
  
  searchTerm: string = '';
  users: User[] = [];

  constructor(private modalController: ModalController, private _userServ: UsuariosServices ) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this._userServ.getUsers().subscribe((data: User[]) => {
      this.users = data;
      console.log("esta es la data de usuarios: ", data);
    }, (error) => {
      console.error('Error fetching users', error);
    });
  }

  filteredUsers(): User[] {
    return this.users.filter(user => {
      const searchTermLower = this.searchTerm.toLowerCase();
      const isAdminMatch = user.isAdmin && 'administrador'.includes(searchTermLower);
      const userIdMatch = user.userId.toString().includes(searchTermLower);
  
      return (
        user.fullName.toLowerCase().includes(searchTermLower) ||
        user.phone.includes(this.searchTerm) ||
        user.email.toLowerCase().includes(searchTermLower) ||
        isAdminMatch ||
        userIdMatch
      );
    });
  }

  async openModal(user?: User) {
    const modal = await this.modalController.create({
      component: UserModalComponent,
      componentProps: {
        user: user || { userId: 0, fullName: '', phone: '', email: '', isAdmin: false },
        isEditMode: !!user
      }
    });

    modal.onDidDismiss().then((data) => {
      if (data.data) {
        this.loadUsers();
      }
    });

    return await modal.present();
  }
}
