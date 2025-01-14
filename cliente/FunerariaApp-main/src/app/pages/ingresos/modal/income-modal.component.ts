import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule, AlertController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IngresosServices } from 'src/app/Servicios/Ingresos.service';
import { CombinacionesModalComponent } from './modal-combinaciones/combinaciones-modal.component';
import { ConceptosModalComponent } from './modal-conceptos/concepto-modal.component';


interface Ingreso {
  IngresoID: number;
  Fecha: string;
  ConceptoID: number;
  NombreConcepto: string;
  Descripcion: string;
  Proveedor: string;
  ProveedorID: number;
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
  TipoIngreso: { data: any[] } | number | null;
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
  NombreConcepto: string;
  SegmentoID: number;
  NombreSegmento: string;
  CategoriaID: number;
  NombreCategoria: string;
  SubcategoriaID: number;
  NombreSubcategoria: string;
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

interface Proveedor {
  ProveedorID: number;
  Proveedor: string;
  CategoriaID: number;
  NombreCategoria: string;
  SubcategoriaID: number;
  NombreSubcategoria: string;
  Rentabilidad: string;
  Estatus: { data: number[]; type: string; };
}

@Component({
  selector: 'app-income-modal',
  templateUrl: './income-modal.component.html',
  styleUrls: ['./income-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule, ReactiveFormsModule],
})
export class IncomeModalComponent implements OnInit {

  form: FormGroup = this.fb.group({});

  @Input() ingreso: Ingreso = {
    IngresoID: 0,
    Fecha: '',
    ConceptoID: 0,
    NombreConcepto: '',
    Descripcion: '',
    Proveedor: '',
    ProveedorID: 0,
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
    EstatusComprobacionID: 2,
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
  proveedor: Proveedor[] = [];


  isNewConcepto = false;
  isNewSegmento = false;
  isNewCategoria = false;
  isNewSubcategoria = false;
  isNewProveedor = true;

  newProveedor = '';
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

  allProveedores: Proveedor[] = [];

  excludedSegmentos: string[] = [
    'Cobranza',
    'Cuentas Establecidas',
    'Sala ventas',
    'Inversiones Iniciales',
    'Funeraria Anahuac',
    'Ingreso Funeraria',
    'Reembolso',
    'Prestamo Foraneo'
  ];


  @Input() isEditMode = false;

  constructor(
    private modalController: ModalController,
    private _ingresoServ: IngresosServices,
    private alertController: AlertController,
    private fb: FormBuilder
  ) {}

  ngOnInit() {

    console.log("Ingreso recibido en el modal:", this.ingreso);
    console.log("Modo edición:", this.isEditMode);

    this.newProveedor = this.ingreso.Proveedor || '';

    if (typeof this.ingreso.TipoIngreso === 'object' && this.ingreso.TipoIngreso?.data) {
      // Si es un objeto con propiedad 'data', asigna el primer valor del arreglo
      this.ingreso.TipoIngreso = this.ingreso.TipoIngreso.data[0];
    } else {
      // Si es un número o nulo, asigna el valor por defecto
      this.ingreso.TipoIngreso = this.ingreso.TipoIngreso || 0;
    }

    console.log("Valor de TipoIngreso antes de inicializar el formulario:", this.ingreso.TipoIngreso);

    this.form = this.fb.group({
      CategoriaID: [null, Validators.required],
      SubcategoriaID: [null, Validators.required],
      ConceptoID: [null, Validators.required],
      Monto: [this.ingreso.Monto, [Validators.required, Validators.min(1)]],
    });

    this.loadCuentas();
    this.loadConceptos();
    this.loadSegmentos();
    this.loadCategorias();
    this.loadSubcategorias();
    this.loadProveedores();
    this.loadUsuarios();
    this.loadCombinaciones();
    this.loadEstatus();

    this.onTipoCuentaChange();
  }

  onTipoIngresoChange() {

  }

  getFilteredSegmentos(): Segmento[] {
    if (this.ingreso.TipoIngreso === 1) { // Egreso
      return this.segmento.filter(segment => !this.excludedSegmentos.includes(segment.Nombre));
    }
    return this.segmento; // Devuelve todos los segmentos si es ingreso
  }


  onSegmentSelected(event: any) {
    const segmentoId = event.detail.value;
    if (segmentoId) {
      this.openCombinacionesModal(segmentoId);
    }
  }

  async onConceptSelectorClick() {
    const modal = await this.modalController.create({
      component: ConceptosModalComponent,
    });

    modal.onDidDismiss().then((data) => {
      if (data.data) {
        console.log('Concepto seleccionado: ', data.data);
        this.ingreso.ConceptoID = data.data.ConceptoID;
        this.ingreso.NombreConcepto = data.data.NombreConcepto; // Muestra el nombre seleccionado
      }
    });

    return await modal.present();
  }



  preventOpen(event: Event) {
    event.preventDefault(); // Previene que el selector se abra
  }



  async openCombinacionesModal(segmentoId: number) {
    console.log("este es el segmento ID que estoy enviando a las combinaciones: " ,segmentoId)
    const modal = await this.modalController.create({
      component: CombinacionesModalComponent,
      componentProps: {
        segmentoId: segmentoId
      }
    });

    modal.onDidDismiss().then((data) => {
      if (data.data) {
        console.log("esta es la data en el componente principal con la combinacion: ", data.data)
        this.fillFormWithCombination(data.data);
        this.filterProveedoresByCombinacion();
      }
    });

    return await modal.present();
  }


  fillFormWithCombination(combinacion: Combinacion) {
    if (combinacion) {
      // Actualiza el formulario con los valores de la combinación
      this.form.patchValue({
        SegmentoID: combinacion.SegmentoID,
        ConceptoID: combinacion.ConceptoID,
        CategoriaID: combinacion.CategoriaID,
        SubcategoriaID: combinacion.SubcategoriaID
      });

      // Asegúrate de actualizar la propiedad 'NombreConcepto' también
      this.ingreso.SegmentoID = combinacion.SegmentoID;
      this.ingreso.ConceptoID = combinacion.ConceptoID;
      this.ingreso.CategoriaID = combinacion.CategoriaID;
      this.ingreso.SubcategoriaID = combinacion.SubcategoriaID;
      this.ingreso.NombreConcepto = combinacion.NombreConcepto; // Actualiza el nombre del concepto

      console.log("Datos del formulario actualizados con la combinación:", this.form.value);
    }
  }




  onCategoriaChange(event: any) {
    const categoriaId = event.detail.value;
    this.filterProveedoresByCombinacion();
  }

  onSubcategoriaChange(event: any) {
    const subcategoriaId = event.detail.value;
    this.filterProveedoresByCombinacion();
  }

  onConceptoChange(event: any) {
    const conceptoId = event.detail.value;
  }

  onTipoCuentaChange() {
    if (this.isEditMode) {
      this.filteredCuentas = this.cuenta.filter(
        (c) => c.TipoCuentaID === this.ingreso.TipoCuentaID
      );
    }
    if (!this.isEditMode) {
      this.filteredCuentas = this.cuenta.filter(
        (c) => c.TipoCuentaID === this.ingreso.TipoCuentaID
      );

      this.isNewCuenta = false;
      this.ingreso.CuentaID = 0;
      this.ingreso.RFC = '';
      this.newNombreCuenta = '';
      this.newRFC = '';
    }
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
        // Ordenar los segmentos alfabéticamente por el campo 'Nombre'
        this.segmento = data.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
      },
      (error) => {
        this.presentAlert('Error fetching segments');
      }
    );
  }
  
  loadCategorias() {
    this._ingresoServ.getCategorias().subscribe(
      (data: Categoria[]) => {
        // Ordenar las categorías alfabéticamente por el campo 'Nombre'
        this.categoria = data.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
      },
      (error) => {
        this.presentAlert('Error fetching categories');
      }
    );
  }
  
  loadSubcategorias() {
    this._ingresoServ.getSubcategorias().subscribe(
      (data: Subcategoria[]) => {
        // Ordenar las subcategorías alfabéticamente por el campo 'Nombre'
        this.subcategoria = data.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
      },
      (error) => {
        this.presentAlert('Error fetching subcategories');
      }
    );
  }

  loadProveedores() {
    this._ingresoServ.getProveedores().subscribe(
      (data: Proveedor[]) => {
        console.log('Esta es mi data en proveedores: ', data);
        this.allProveedores = data;
        this.proveedor = [...this.allProveedores];
      },
      (error) => {
        this.presentAlert('Error fetching providers');
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
        this.onTipoCuentaChange();
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

  async presentSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'El registro se ha guardado correctamente.',
      buttons: ['OK']
    });
    await alert.present();
  }

  async presentErrorAlert() {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'Hubo un problema al guardar el registro. Inténtalo nuevamente.',
      buttons: ['OK']
    });
    await alert.present();
  }



  saveIncome() {

    const user = JSON.parse(sessionStorage.getItem('user') || '{}');

    let estatusComprobacionID: number;

    if (this.selectedFile) {
      estatusComprobacionID = 2; // Si selectedFile está vacío
  } else if (this.ingreso.TipoIngreso === 0) {
      estatusComprobacionID = 3; // Si TipoIngreso es 0
  } else {
      estatusComprobacionID = 4; // Si hay algo en selectedFile
  }

    const incomeData = {
        IngresoID: this.ingreso.IngresoID,
        TipoIngreso: this.ingreso.TipoIngreso,
        ConceptoID: this.isNewConcepto ? this.newConcepto : this.ingreso.ConceptoID,
        SegmentoID: this.isNewSegmento ? this.newSegmento : this.ingreso.SegmentoID,
        CategoriaID: this.isNewCategoria ? this.newCategoria : this.ingreso.CategoriaID,
        SubcategoriaID: this.ingreso.TipoIngreso === 0 ? null : (this.isNewSubcategoria ? this.newSubcategoria : this.ingreso.SubcategoriaID),
        ProveedorID: this.isNewProveedor ? this.newProveedor : this.ingreso.ProveedorID,
        TipoCuentaID: this.ingreso.TipoCuentaID,
        CuentaID: this.isNewCuenta ? this.newNombreCuenta : this.ingreso.CuentaID,
        RFC: this.ingreso.TipoCuentaID === 2 ? (this.newRFC || this.ingreso.RFC || '') : '',
        Fecha: this.ingreso.Fecha,
        // FechaAutorizacion: this.ingreso.FechaAutorizacion,
        // FechaConciliacion: this.ingreso.FechaConciliacion,
        Descripcion: this.ingreso.Descripcion,
        Piezas: this.ingreso.Piezas,
        Monto: this.ingreso.Monto,
        EstatusComprobacionID: estatusComprobacionID,
        UsuarioAutorizaID: user ? user.userId : null,
        UsuarioRecibeID: this.ingreso.UsuarioRecibeID,
        ObservacionesDifConciliacion: this.ingreso.ObservacionesDifConciliacion
    };

    console.log("Estos son los datos que estoy mandando Ingreso / Egreso: ", incomeData);


    if (this.isEditMode) {
        // Lógica para actualizar ingreso
        this._ingresoServ.UpdateIngresos(incomeData).subscribe(
            response => {
                console.log('Ingreso actualizado correctamente:', response);
                this.presentSuccessAlert();

                if (this.selectedFile) {
                    const formData = new FormData();
                    formData.append('Comprobante', this.selectedFile);

                    // Usamos el IngresoID del incomeData en lugar del response
                    this._ingresoServ.uploadComprobante(incomeData.IngresoID, formData).subscribe(
                        fileResponse => {
                            console.log('Archivo guardado correctamente:', fileResponse);
                            this.closeModal(true);
                        },
                        fileError => {
                            console.error('Error al guardar el archivo:', fileError);
                        }
                    );
                } else {
                    this.closeModal(true);
                }
            },
            error => {
                console.error('Error al actualizar el ingreso:', error);
                this.presentErrorAlert();
            }
        );
    } else {
        // Lógica para crear un nuevo ingreso
        this._ingresoServ.addIngreso(incomeData).subscribe(
            response => {
                console.log('Ingreso guardado correctamente:', response);
                this.presentSuccessAlert();

                if (this.selectedFile) {
                    const formData = new FormData();
                    formData.append('Comprobante', this.selectedFile);

                    // Usamos el IngresoID del response, ya que es nuevo
                    this._ingresoServ.uploadComprobante(response.IngresoID, formData).subscribe(
                        fileResponse => {
                            console.log('Archivo guardado correctamente:', fileResponse);
                            this.closeModal(true);
                        },
                        fileError => {
                            console.error('Error al guardar el archivo:', fileError);
                        }
                    );
                } else {
                    this.closeModal(true);
                }
            },
            error => {
                console.error('Error al guardar el ingreso:', error);
                this.presentErrorAlert();
            }
        );
    }

  }

  closeModal(success: boolean) {
    this.modalController.dismiss({ success }, success ? 'success' : 'error');
  }


  filterProveedoresByCombinacion() {
    const categoriaId = this.ingreso.CategoriaID;
    const subcategoriaId = this.ingreso.SubcategoriaID;

    console.log('CategoriaID:', categoriaId);
    console.log('SubcategoriaID:', subcategoriaId);

    // Verifica si CategoriaID y SubcategoriaID son mayores que 0
    if (categoriaId > 0 && subcategoriaId > 0) {
      // Filtra proveedores que coincidan con CategoriaID y SubcategoriaID
      const filteredProveedores = this.allProveedores.filter(p =>
        p.CategoriaID === categoriaId &&
        p.SubcategoriaID === subcategoriaId
      );

      console.log('Filtered Proveedores:', filteredProveedores);

      // Actualiza la lista de proveedores
      this.proveedor = filteredProveedores;
    } else {
      // Si CategoriaID o SubcategoriaID no son mayores que 0, carga todos los proveedores
      console.log("Se fue al else de proveedores");
      this.proveedor = [...this.allProveedores];
    }
  }




}
