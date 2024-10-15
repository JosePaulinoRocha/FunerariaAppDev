import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule, AlertController  } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IngresosServices } from 'src/app/Servicios/Ingresos.service';
import { ProveedoresServices } from 'src/app/Servicios/Proveedores.service';


interface Proveedor {
  ProveedorID: number;
  Proveedor: string;
  Estatus: { data: number[]; type: string; };
  CostoPorPieza: number;
  CategoriaID: number;
  NombreCategoria: string;
  SubcategoriaID: number;
  NombreSubcategoria: string;
  FechaRegistro: string;
  Rentabilidad: string;
  [key: string]: any;
}

interface Categoria {
  CategoriaID: number;
  Nombre: string;
}

interface Subcategoria {
  SubcategoriaID: number;
  Nombre: string;
}


@Component({
  selector: 'app-presupuesto-modal',
  templateUrl: './presupuesto-modal.component.html',
  styleUrls: ['./presupuesto-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class PresupuestoModalComponent implements OnInit {
  @Input() proveedor: Proveedor = {
    ProveedorID: 0,
    Proveedor: '',
    Estatus: { data: [], type: '' },
    CostoPorPieza: 0,
    CategoriaID: 0,
    NombreCategoria: '',
    SubcategoriaID: 0,
    NombreSubcategoria: '',
    FechaRegistro: '',
    Rentabilidad: '',
  };

  proveedorCatalogo: Proveedor[] = [];
  categoria: Categoria[] = [];
  subcategoria: Subcategoria[] = [];

  isNewProveedor = false;
  isNewCategoria = false;
  isNewSubcategoria = false;

  newProveedor = '';
  newCategoria = '';
  newSubcategoria = '';

  @Input() isEditMode: boolean = false;

  constructor(private modalController: ModalController, private _proveedorServ: ProveedoresServices, private _ingresoServ: IngresosServices, private alertController: AlertController) {}


  ngOnInit() {
    console.log("Proveedor recibido en el modal:", this.proveedor);
    console.log("Modo edición:", this.isEditMode);

    this.loadProveedores();
    this.loadCategorias();
    this.loadSubcategorias();
  }

  loadProveedores() {
    this._proveedorServ.getProveedores().subscribe((data: Proveedor[]) => {
      // Filtrar los proveedores únicos basados en el campo 'Proveedor'
      const uniqueProveedores = data.filter((value, index, self) =>
        index === self.findIndex((t) => (
          t.Proveedor === value.Proveedor
        ))
      );
      
      this.proveedorCatalogo = uniqueProveedores;
    }, (error) => {
      this.presentAlert('Error fetching proveedores');
    });
  }
  

  loadCategorias() {
    this._ingresoServ.getCategorias().subscribe((data: Categoria[]) => {
      this.categoria = data;
    }, (error) => {
      this.presentAlert('Error fetching categories');
    });
  }

  loadSubcategorias() {
    this._ingresoServ.getSubcategorias().subscribe((data: Subcategoria[]) => {
      this.subcategoria = data;
    }, (error) => {
      this.presentAlert('Error fetching subcategories');
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

  async agregarProveedor() {
    const nuevoProveedor = {
      ProveedorID: this.proveedor.ProveedorID,
      Proveedor: this.isNewProveedor ? this.newProveedor : this.proveedor.Proveedor,
      CategoriaID: this.isNewCategoria ? this.newCategoria : this.proveedor.CategoriaID,
      SubcategoriaID: this.isNewSubcategoria ? this.newSubcategoria : this.proveedor.SubcategoriaID,
      CostoPorPieza: this.proveedor.CostoPorPieza,
    };
  
    console.log("Datos del nuevo proveedor:", nuevoProveedor);


    if (this.isEditMode) {

      console.log("entro a agregar proveedor")

      this._proveedorServ.updateProveedor(nuevoProveedor).subscribe(async response => {
        console.log('Proveedor actualizado exitosamente:', response);
  
        const alert = await this.alertController.create({
          header: 'Éxito',
          message: 'El proveedor ha sido actualizado correctamente.',
          buttons: ['OK']
        });
        await alert.present();
  
        this.closeModal(true);
      }, error => {
        console.error('Error al actualizar el proveedor:', error);
        const alert = this.alertController.create({
          header: 'Error',
          message: 'Hubo un error al actualizar el proveedor.',
          buttons: ['OK']
        });
      });

    } else {

      console.log("entro a agregar proveedor")

      this._proveedorServ.addProveedor(nuevoProveedor).subscribe(async response => {
        console.log('Proveedor agregado exitosamente:', response);
    
        const alert = await this.alertController.create({
          header: 'Éxito',
          message: 'El proveedor ha sido agregado correctamente.',
          buttons: ['OK']
        });
        await alert.present();
    
        this.closeModal(true);
      }, error => {
        console.error('Error al agregar el proveedor:', error);
        const alert = this.alertController.create({
          header: 'Error',
          message: 'Algo salio mal.',
          buttons: ['OK']
        });
      });

    }

  }
  

  closeModal(success: boolean) {
    this.modalController.dismiss({ success }, success ? 'success' : 'error');
  }

}
