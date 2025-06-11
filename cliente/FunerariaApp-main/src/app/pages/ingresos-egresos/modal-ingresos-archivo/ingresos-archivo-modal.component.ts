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
  SegmentoID: number;
  CategoriaID: number;
  SubcategoriaID: number;
  ConceptoID: number;
  CuentaContable: number;
}

interface Cuenta {
  CuentaID: number;
  TipoCuentaID: number;
  NombreCuenta: string;
  RFC: string;
}

interface Segmento {
  SegmentoID: number;
  Nombre: string;
}

interface Categoria {
  CategoriaID: number;
  Nombre: string;
}

interface Subcategoria {
  SubcategoriaID: number;
  Nombre: string;
}

interface Concepto {
  ConceptoID: number;
  Nombre: string;
}

interface CuentaContable {
  IngresoID: number;
  SegmentoID: number;
  NombreSegmento: string;
  CategoriaID: number;
  NombreCategoria: string;
  SubcategoriaID: number;
  NombreSubcategoria: string;
  ConceptoID: number;
  NombreConcepto: string;
  CuentaContable: number;
}

@Component({
  selector: 'app-ingresos-archivo-modal',
  templateUrl: './ingresos-archivo-modal.component.html',
  styleUrls: ['./ingresos-archivo-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class IngresosArchivoModalComponent implements OnInit {
  @Input() ingreso: Ingreso = {
    IngresoID: 0,
    TipoCuentaID: 0,
    CuentaID: 0,
    RFC: '',
    SegmentoID: 0,
    CategoriaID: 0,
    SubcategoriaID: 0,
    ConceptoID: 0,
    CuentaContable: 0,
  };

  @Input() isMassiveAssignMode: boolean = false;
  @Input() selectedRecords: number[] = [];

  @Input() incomeIDs: number[] = [];
  @Input() bulkAssignment: boolean = false;

  segmento: Segmento[] = [];
  categoria: Categoria[] = [];
  subcategoria: Subcategoria[] = [];
  concepto: Concepto[] = [];

  isNewSegmento = false;
  isNewCategoria = false;
  isNewSubcategoria = false;
  isNewConcepto = false;

  newSegmento = '';
  newCategoria = '';
  newSubcategoria = '';
  newConcepto = '';

  cuenta: Cuenta[] = [];

  cuentacontable: CuentaContable[] = [];


  filteredCuentas: Cuenta[] = [];
  isCuentaEnabled = false;
  showRFC = false;

  isNewCuenta = false;
  newNombreCuenta = '';
  newRFC = '';

  @Input() isEditMode: boolean = false;

  constructor(private modalController: ModalController, private _ingresoServ: IngresosServices, private alertController: AlertController) {}

  ngOnInit() {
    // console.log('IngresoID recibido en el modal:', this.ingreso.IngresoID);
  
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
    this.loadConceptos();
    this.loadSegmentos();
    this.loadCuentasContables();

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
        // console.log('Esta es mi data en cuentas: ', data);
        this.cuenta = data;
        this.onTipoCuentaChange();
      },
      (error) => {
        this.presentAlert('Error fetching combinations');
      }
    );
  }

  loadCuentasContables() {
    this._ingresoServ.getCuentasContables().subscribe(
      (data: CuentaContable[]) => {
        // console.log('Esta es mi data en Combinaciones de cuentas contables: ', data);
        this.cuentacontable = data;
      },
      (error) => {
        this.presentAlert('Error fetching combinations');
      }
    );
  }

  loadConceptos() {
    this._ingresoServ.getConceptos().subscribe((data: Concepto[]) => {
      this.concepto = data;
    }, (error) => {
      this.presentAlert('Error fetching concepts');
    });
  }

  loadSegmentos() {
    this._ingresoServ.getSegmentos().subscribe((data: Segmento[]) => {
      this.segmento = data;
    }, (error) => {
      this.presentAlert('Error fetching segments');
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

  filterNumbers(event: any) {
    const inputValue = event.target.value;
    const filteredValue = inputValue.replace(/[^0-9]/g, ''); // Elimina todo lo que no sea un número
    this.ingreso.CuentaContable = filteredValue; // Actualiza el valor en el modelo
  }
  

  async asignarCuenta() {

    // console.log("entro en asignacion de cuenta contable");

    // Validar si la CuentaContable ya existe en otro ingreso
    const cuentaExistente = this.cuentacontable.find(cuenta =>
      cuenta.CuentaContable.toString() === this.ingreso.CuentaContable.toString() &&
      cuenta.IngresoID !== this.ingreso.IngresoID
    );

    // Validar si la combinación SegmentoID, CategoriaID, SubcategoriaID, ConceptoID ya existe en otro ingreso
    const combinacionExistente = this.cuentacontable.find(cuenta =>
      cuenta.SegmentoID === this.ingreso.SegmentoID &&
      cuenta.CategoriaID === this.ingreso.CategoriaID &&
      cuenta.SubcategoriaID === this.ingreso.SubcategoriaID &&
      cuenta.ConceptoID === this.ingreso.ConceptoID &&
      cuenta.IngresoID !== this.ingreso.IngresoID
    );

    if (cuentaExistente) {
      // console.log("Ya existe un ingreso con la misma cuenta contable", cuentaExistente);
      this.presentAlert(
        `No se puede guardar: ya existe un ingreso con la misma Cuenta Contable (${cuentaExistente.CuentaContable}). ` +
        `IngresoID: ${cuentaExistente.IngresoID}, ` +
        `Segmento: ${cuentaExistente.NombreSegmento}, ` +
        `Categoría: ${cuentaExistente.NombreCategoria}, ` +
        `Subcategoría: ${cuentaExistente.NombreSubcategoria}, ` +
        `Concepto: ${cuentaExistente.NombreConcepto}`
      );
      return;
    }
    
    if (combinacionExistente) {
      // console.log("Ya existe un ingreso con la misma combinación de segmento, categoría, subcategoría y concepto", combinacionExistente);
      this.presentAlert(
        `No se puede guardar: ya existe un ingreso con la misma combinación de Segmento, Categoría, Subcategoría y Concepto. ` +
        `IngresoID: ${combinacionExistente.IngresoID}, ` +
        `Segmento: ${combinacionExistente.NombreSegmento}, ` +
        `Categoría: ${combinacionExistente.NombreCategoria}, ` +
        `Subcategoría: ${combinacionExistente.NombreSubcategoria}, ` +
        `Concepto: ${combinacionExistente.NombreConcepto}`
      );
      return;
    }
    
    const incomeData = {
      IngresoID: this.ingreso.IngresoID,
      TipoCuentaID: this.ingreso.TipoCuentaID,
      CuentaID: this.isNewCuenta ? this.newNombreCuenta : this.ingreso.CuentaID,
      RFC: this.ingreso.TipoCuentaID === 2 ? (this.newRFC || this.ingreso.RFC || '') : '',
      SegmentoID: this.isNewSegmento ? this.newSegmento : this.ingreso.SegmentoID,
      CategoriaID: this.isNewCategoria ? this.newCategoria : this.ingreso.CategoriaID,
      SubcategoriaID: this.isNewSubcategoria ? this.newSubcategoria : this.ingreso.SubcategoriaID,
      ConceptoID: this.isNewConcepto ? this.newConcepto : this.ingreso.ConceptoID,
      CuentaContable: this.ingreso.CuentaContable,
    };

    // console.log("Informacion de la actualizacion de cuenta y datos: ", incomeData);


    this._ingresoServ.actualizarCuentaContable(incomeData).subscribe(
      () => {
        this.presentAlert('Datos guardados correctamente.');
        this.closeModal(true);
      },
      () => {
        this.presentAlert('Error al asignar cuenta. Inténtalo de nuevo.');
      }
    );

  }
  
  

  closeModal(success: boolean = false) {
    this.modalController.dismiss({ success });
  }
}
