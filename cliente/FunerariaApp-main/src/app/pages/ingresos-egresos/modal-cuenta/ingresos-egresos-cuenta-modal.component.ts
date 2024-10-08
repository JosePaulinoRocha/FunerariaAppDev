import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule, AlertController  } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IngresosServices } from 'src/app/Servicios/Ingresos.service';

interface Ingreso {
  IngresoID: number;
  TipoCuentaID: number;
  CuentaID: number;
  RFC: string;
  CategoriaID: number;
  SubcategoriaID: number;
}

interface Cuenta {
  CuentaID: number;
  TipoCuentaID: number;
  NombreCuenta: string;
  RFC: string;
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
  selector: 'app-ingresos-egresos-cuenta-modal',
  templateUrl: './ingresos-egresos-cuenta-modal.component.html',
  styleUrls: ['./ingresos-egresos-cuenta-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class IngresosEgresosCuentaModalComponent implements OnInit {
  @Input() ingreso: Ingreso = {
    IngresoID: 0,
    TipoCuentaID: 0,
    CuentaID: 0,
    RFC: '',
    CategoriaID: 0,
    SubcategoriaID: 0,
  };

  @Input() isMassiveAssignMode: boolean = false;
  @Input() selectedRecords: number[] = [];

  @Input() incomeIDs: number[] = [];
  @Input() bulkAssignment: boolean = false;

  categoria: Categoria[] = [];
  subcategoria: Subcategoria[] = [];

  isNewCategoria = false;
  isNewSubcategoria = false;

  newCategoria = '';
  newSubcategoria = '';

  cuenta: Cuenta[] = [];

  filteredCuentas: Cuenta[] = [];
  isCuentaEnabled = false;
  showRFC = false;

  isNewCuenta = false;
  newNombreCuenta = '';
  newRFC = '';

  @Input() isEditMode: boolean = false;

  constructor(private modalController: ModalController, private _ingresoServ: IngresosServices, private alertController: AlertController) {}

  ngOnInit() {
    console.log('IngresoID recibido en el modal:', this.ingreso.IngresoID);
  
    if (this.bulkAssignment) {
      this.isMassiveAssignMode = true;
      this.updateModalMode();
    } else {
      this.isMassiveAssignMode = false;
      this.updateModalMode();
    }
  
    this.loadCuentas();
    this.loadCategorias();
    this.loadSubcategorias();
    this.onTipoCuentaChange();

  }
  

  updateModalMode() {
    if (this.isMassiveAssignMode) {
      this.ingreso.CuentaID = 0; // No aplicable en modo masivo
    }
  }

  toggleMassiveAssignMode() {
    this.isMassiveAssignMode = !this.isMassiveAssignMode;
    this.updateModalMode();
  }

  loadCuentas() {
    this._ingresoServ.getCuentas().subscribe(
      (data: Cuenta[]) => {
        console.log('Esta es mi data en cuentas: ', data);
        this.cuenta = data;
        this.onTipoCuentaChange();
      },
      (error) => {
        this.presentAlert('Error fetching combinations');
      }
    );
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

  onTipoCuentaChange() {

    this.filteredCuentas = this.cuenta.filter(
      (c) => c.TipoCuentaID === this.ingreso.TipoCuentaID
    );
    
  }

  onCuentaChange(event: any) {
    const cuentaID = event.detail.value;
    const selectedCuenta = this.cuenta.find((c) => c.CuentaID === cuentaID);

    if (selectedCuenta && this.ingreso.TipoCuentaID === 2) {
      this.ingreso.RFC = selectedCuenta.RFC;
    }
  }

  onCuentaSelection(isNew: boolean) {
    this.isNewCuenta = isNew;

    if (!isNew) {
      this.ingreso.CuentaID = 0;
    }
  }

  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Mensaje',
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }

  async asignarCuenta() {
    if (this.isMassiveAssignMode) {
      console.log("entro en asignacion masiva");
      const cuentaData = {
        TipoCuentaID: this.ingreso.TipoCuentaID,
        CuentaID: this.isNewCuenta ? this.newNombreCuenta : this.ingreso.CuentaID,
        RFC: this.ingreso.TipoCuentaID === 2 ? (this.newRFC || this.ingreso.RFC || '') : '',
        CategoriaID: this.isNewCategoria ? this.newCategoria : this.ingreso.CategoriaID,
        SubcategoriaID: this.isNewSubcategoria ? this.newSubcategoria : this.ingreso.SubcategoriaID,
      };
    
      console.log("Informacion de la actualizacion de cuenta y datos: ", cuentaData);
      console.log("Income IDs en el modal: ", this.incomeIDs);
      
      this._ingresoServ.actualizarCuentasIngresoMasivas({
        ids: this.incomeIDs,  // Aquí usamos `this.incomeIDs`
         cuenta: cuentaData
       }).subscribe(
         () => {
           this.presentAlert('Cuentas asignadas correctamente a los registros seleccionados.');
           this.closeModal(true);
         },
         (error) => {
           console.error('Error al asignar cuentas: ', error);
           this.presentAlert('Error al asignar cuentas. Inténtalo de nuevo.');
           this.closeModal(false);
         }
       );
    } else {
      console.log("entro en asignacion individual");
      const incomeData = {
        IngresoID: this.ingreso.IngresoID,
        TipoCuentaID: this.ingreso.TipoCuentaID,
        CuentaID: this.isNewCuenta ? this.newNombreCuenta : this.ingreso.CuentaID,
        RFC: this.ingreso.TipoCuentaID === 2 ? (this.newRFC || this.ingreso.RFC || '') : '',
        CategoriaID: this.isNewCategoria ? this.newCategoria : this.ingreso.CategoriaID,
        SubcategoriaID: this.isNewSubcategoria ? this.newSubcategoria : this.ingreso.SubcategoriaID,
      };

      console.log("Informacion de la actualizacion de cuenta y datos: ", incomeData);

  
      this._ingresoServ.actualizarCuentaIngreso(incomeData).subscribe(
        () => {
          this.presentAlert('Cuenta asignada correctamente.');
          this.closeModal(true);
        },
        () => {
          this.presentAlert('Error al asignar cuenta. Inténtalo de nuevo.');
          this.closeModal(false);
        }
      );
    }
  }
  
  

  closeModal(success: boolean = false) {
    this.modalController.dismiss({ success });
  }
}
