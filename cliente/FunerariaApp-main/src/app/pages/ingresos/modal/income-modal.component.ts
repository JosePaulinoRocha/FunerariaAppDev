import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IngresosServices } from 'src/app/Servicios/Ingresos.service';

interface Ingreso {
  IngresoID: number;
  Fecha: string;
  ConceptoID: number;
  NombreConcepto: string;
  Descripcion: string;
  Proveedor: string;
  Piezas: number;
  Monto: number;
  Saldo: number;
  Comprobante: string;
  SegmentoID: number;
  NombreSegmento: string;
  CategoriaID: number;
  NombreCategoria: string;
  SubcategoriaID: number;
  NombreSubcategoria: string;
  EstatusComprobacionID: number;
  NombreEstatus: string;
  FechaAutorizacion: string;
  UsuarioAutorizaID: number;
  UsuarioRecibeID: number;
  FechaConciliacion: string;
  ObservacionesDifConciliacion: string;
  TipoIngreso: number;
  TipoCuentaID: number;
  CuentaID: number;
  RFC: string;
}

interface Concepto {
  ConceptoID: number;
  Nombre: string;
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

interface Usuario {
  userId: number;
  fullName: string;
  phone: string;
  email: string;
  isAdmin: boolean;
  password: string;
}

interface Combinacion {
  CombinacionID: number;
  ConceptoID: number;
  SegmentoID: number;
  CategoriaID: number;
  SubcategoriaID: number;
}

interface Estatus {
  EstatusID: number;
  Descripcion: string;
}

interface Cuenta {
  CuentaID: number;
  TipoCuentaID: number;
  NombreCuenta: string;
  RFC: string;
}

@Component({
  selector: 'app-income-modal',
  templateUrl: './income-modal.component.html',
  styleUrls: ['./income-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class IncomeModalComponent implements OnInit {
  @Input() ingreso: Ingreso = {
    IngresoID: 0,
    Fecha: '',
    ConceptoID: 0,
    NombreConcepto: '',
    Descripcion: '',
    Proveedor: '',
    Piezas: 0,
    Monto: 0,
    Saldo: 0,
    Comprobante: '',
    SegmentoID: 0,
    NombreSegmento: '',
    CategoriaID: 0,
    NombreCategoria: '',
    SubcategoriaID: 0,
    NombreSubcategoria: '',
    EstatusComprobacionID: 0,
    NombreEstatus: '',
    FechaAutorizacion: '',
    UsuarioAutorizaID: 0,
    UsuarioRecibeID: 0,
    FechaConciliacion: '',
    ObservacionesDifConciliacion: '',
    TipoIngreso: 0,
    TipoCuentaID: 1,
    CuentaID: 0,
    RFC: '',
  };

  selectedFile: File | null = null;

  concepto: Concepto[] = [];
  segmento: Segmento[] = [];
  categoria: Categoria[] = [];
  subcategoria: Subcategoria[] = [];
  usuario: Usuario[] = [];
  combinacion: Combinacion[] = [];
  estatus: Estatus[] = [];
  cuenta: Cuenta[] = [];

  isNewConcepto = false;
  isNewSegmento = false;
  isNewCategoria = false;
  isNewSubcategoria = false;

  newConcepto = '';
  newSegmento = '';
  newCategoria = '';
  newSubcategoria = '';

  filteredCuentas: Cuenta[] = [];
  isCuentaEnabled = false;
  showRFC = false;

  isNewCuenta = false;
  newNombreCuenta = '';
  newRFC = '';

  @Input() isEditMode = false;

  constructor(
    private modalController: ModalController,
    private _ingresoServ: IngresosServices,
    private alertController: AlertController
  ) {}

  updateCombinations() {
    // Filtrar combinaciones que incluyan el ConceptoID seleccionado
    const filteredCombinations = this.combinacion.filter(
      (c) => c.ConceptoID === this.ingreso.ConceptoID
    );

    if (filteredCombinations.length > 0) {
      // Encontrar la combinación con el mayor CombinacionID
      const latestCombination = filteredCombinations.reduce((prev, current) =>
        prev.CombinacionID > current.CombinacionID ? prev : current
      );

      // Actualizar los campos correspondientes
      this.ingreso.SegmentoID = latestCombination.SegmentoID;
      this.ingreso.CategoriaID = latestCombination.CategoriaID;
      this.ingreso.SubcategoriaID = latestCombination.SubcategoriaID;
    }
  }

  ngOnInit() {
    this.loadConceptos();
    this.loadSegmentos();
    this.loadCategorias();
    this.loadSubcategorias();
    this.loadUsuarios();
    this.loadCombinaciones();
    this.loadEstatus();
    this.loadCuentas();

    this.onTipoCuentaChange();
  }

  onTipoCuentaChange() {
    this.filteredCuentas = this.cuenta.filter(
      (c) => c.TipoCuentaID === this.ingreso.TipoCuentaID
    );

    this.isNewCuenta = false;
    this.ingreso.CuentaID = 0;
    this.ingreso.RFC = '';
    this.newNombreCuenta = '';
    this.newRFC = '';
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

  loadConceptos() {
    this._ingresoServ.getConceptos().subscribe(
      (data: Concepto[]) => {
        this.concepto = data;
      },
      (error) => {
        this.presentAlert('Error fetching concepts');
      }
    );
  }

  loadSegmentos() {
    this._ingresoServ.getSegmentos().subscribe(
      (data: Segmento[]) => {
        this.segmento = data;
      },
      (error) => {
        this.presentAlert('Error fetching segments');
      }
    );
  }

  loadCategorias() {
    this._ingresoServ.getCategorias().subscribe(
      (data: Categoria[]) => {
        this.categoria = data;
      },
      (error) => {
        this.presentAlert('Error fetching categories');
      }
    );
  }

  loadSubcategorias() {
    this._ingresoServ.getSubcategorias().subscribe(
      (data: Subcategoria[]) => {
        this.subcategoria = data;
      },
      (error) => {
        this.presentAlert('Error fetching subcategories');
      }
    );
  }

  loadUsuarios() {
    this._ingresoServ.getUsuarios().subscribe(
      (data: Usuario[]) => {
        this.usuario = data;
      },
      (error) => {
        this.presentAlert('Error fetching users');
      }
    );
  }

  loadCombinaciones() {
    this._ingresoServ.getCombinaciones().subscribe(
      (data: Combinacion[]) => {
        console.log('Esta es mi data en combinaciones: ', data);
        this.combinacion = data;
      },
      (error) => {
        this.presentAlert('Error fetching combinations');
      }
    );
  }

  loadEstatus() {
    this._ingresoServ.getEstatus().subscribe(
      (data: Estatus[]) => {
        this.estatus = data;
      },
      (error) => {
        this.presentAlert('Error fetching statuses');
      }
    );
  }

  loadCuentas() {
    this._ingresoServ.getCuentas().subscribe(
      (data: Cuenta[]) => {
        console.log('Esta es mi data en cuentas: ', data);
        this.cuenta = data;
      },
      (error) => {
        this.presentAlert('Error fetching combinations');
      }
    );
  }

  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }
  

  saveIncome() {
    const formData = new FormData();

    // Agregar los datos del ingreso al FormData con validaciones para evitar undefined
    formData.append('IngresoID', this.ingreso.IngresoID != null ? this.ingreso.IngresoID.toString() : '');
    formData.append('TipoIngreso', this.ingreso.TipoIngreso != null ? this.ingreso.TipoIngreso.toString() : '');
    formData.append('ConceptoID', this.isNewConcepto ? this.newConcepto : (this.ingreso.ConceptoID != null ? this.ingreso.ConceptoID.toString() : ''));
    formData.append('SegmentoID', this.isNewSegmento ? this.newSegmento : (this.ingreso.SegmentoID != null ? this.ingreso.SegmentoID.toString() : ''));
    formData.append('CategoriaID', this.isNewCategoria ? this.newCategoria : (this.ingreso.CategoriaID != null ? this.ingreso.CategoriaID.toString() : ''));
    formData.append('SubcategoriaID', this.isNewSubcategoria ? this.newSubcategoria : (this.ingreso.SubcategoriaID != null ? this.ingreso.SubcategoriaID.toString() : ''));
    formData.append('Proveedor', this.ingreso.Proveedor != null ? this.ingreso.Proveedor : '');
    formData.append('TipoCuentaID', this.ingreso.TipoCuentaID != null ? this.ingreso.TipoCuentaID.toString() : '');
    formData.append('CuentaID', this.isNewCuenta ? this.newNombreCuenta : (this.ingreso.CuentaID != null ? this.ingreso.CuentaID.toString() : ''));
    formData.append('RFC', this.ingreso.TipoCuentaID === 2 ? (this.newRFC || this.ingreso.RFC || '') : '');

    // Agregar el archivo seleccionado al FormData si existe, en el campo 'Comprobante'
    if (this.selectedFile) {
        formData.append('Comprobante', this.selectedFile);
    } else {
        formData.append('Comprobante', this.ingreso.Comprobante != null ? this.ingreso.Comprobante : '');
    }

    formData.append('Fecha', this.ingreso.Fecha != null ? this.ingreso.Fecha : '');
    formData.append('FechaAutorizacion', this.ingreso.FechaAutorizacion != null ? this.ingreso.FechaAutorizacion : '');
    formData.append('FechaConciliacion', this.ingreso.FechaConciliacion != null ? this.ingreso.FechaConciliacion : '');
    formData.append('Descripcion', this.ingreso.Descripcion != null ? this.ingreso.Descripcion : '');
    formData.append('Piezas', this.ingreso.Piezas != null ? this.ingreso.Piezas.toString() : '0');
    formData.append('Monto', this.ingreso.Monto != null ? this.ingreso.Monto.toString() : '0');
    formData.append('EstatusComprobacionID', this.ingreso.EstatusComprobacionID != null ? this.ingreso.EstatusComprobacionID.toString() : '');
    formData.append('UsuarioAutorizaID', this.ingreso.UsuarioAutorizaID != null ? this.ingreso.UsuarioAutorizaID.toString() : '');
    formData.append('UsuarioRecibeID', this.ingreso.UsuarioRecibeID != null ? this.ingreso.UsuarioRecibeID.toString() : '');
    formData.append('ObservacionesDifConciliacion', this.ingreso.ObservacionesDifConciliacion != null ? this.ingreso.ObservacionesDifConciliacion : '');

    // Mostrar los datos que se están enviando
    console.log("Datos para guardar:");
    formData.forEach((value, key) => {
        console.log(key, value);
    });

     this._ingresoServ.addIngreso(formData).subscribe(
       response => {
         console.log('Ingreso guardado correctamente:', response);
       },
       error => {
         console.error('Error al guardar el ingreso:', error);
       }
     );
}

  closeModal() {
    this.modalController.dismiss(null, 'close');
  }
}
