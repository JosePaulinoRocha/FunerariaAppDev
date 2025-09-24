import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from "@ionic/angular";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { UserModalComponent } from './modal/user-modal.component';
import { SeccionModalComponent } from './seccion-modal/seccion-modal.component';
import { UsuariosServices } from 'src/app/Servicios/Usuarios.service';
import { PermisosService, Rol, Seccion } from 'src/app/Servicios/Permisos.service';
import { RolModalComponent } from './rol-modal/rol-modal.component';


interface User {
  userId: number;
  fullName: string;
  phone: string;
  email: string;
  isAdmin: boolean;
  RolID: number;
  NombreRol: string;
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
  roles: Rol[] = [];
  secciones: Seccion[] = [];
  currentPage: number = 1;
  usersPerPage: number = 8;
  currentView: string = 'usuarios';

  constructor(
    private modalController: ModalController,
    private _userServ: UsuariosServices,
    private _permisosServ: PermisosService
  ) { }

  ngOnInit() {
    this.loadUsers();
    this.loadRoles();
    this.loadSecciones();
  }

  loadUsers() {
    this._userServ.getUsers().subscribe((data: User[]) => {
      this.users = data;
    }, (error) => console.error('Error fetching users', error));
  }

  loadRoles() {
    this._permisosServ.getRoles().subscribe((data: Rol[]) => {
      this.roles = data;
    }, (error) => console.error('Error fetching roles', error));
  }

  loadSecciones() {
    this._permisosServ.getSecciones().subscribe((data: Seccion[]) => {
      this.secciones = data;
    }, (error) => console.error('Error fetching secciones', error));
  }

  filteredUsers(): User[] {
    const filtered = this.users.filter(user => {
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

    return filtered.slice((this.currentPage - 1) * this.usersPerPage, this.currentPage * this.usersPerPage);
  }

  totalPages(): number {
    return Math.ceil(this.users.length / this.usersPerPage);
  }

  nextPage() { if (this.currentPage < this.totalPages()) this.currentPage++; }
  previousPage() { if (this.currentPage > 1) this.currentPage--; }

  async openModal(user?: User) {
    const modal = await this.modalController.create({
      component: UserModalComponent,
      componentProps: {
        user: user || { userId: 0, fullName: '', phone: '', email: '', isAdmin: false },
        isEditMode: !!user
      }
    });

    modal.onDidDismiss().then((data) => {
      if (data.data) this.loadUsers();
    });

    return await modal.present();
  }

  async openSeccionModal(sec?: Seccion) {
    const modal = await this.modalController.create({
      component: SeccionModalComponent,
      componentProps: {
        seccion: sec || { PermisoID: 0, NombrePermiso: '', Ruta: '' },
        isEditMode: !!sec
      }
    });

    modal.onDidDismiss().then((data) => {
      if (data.data) {
        this.loadSecciones();
      }
    });

    return await modal.present();
  }

  async openRolModal(rol?: Rol) {
    const modal = await this.modalController.create({
      component: RolModalComponent,
      componentProps: {
        rol: rol || { RolID: 0, NombreRol: '' },
        isEditMode: !!rol
      }
    });

    modal.onDidDismiss().then((data) => {
      if (data.data) {
        this.loadRoles(); 
      }
    });

    return await modal.present();
  }


}
