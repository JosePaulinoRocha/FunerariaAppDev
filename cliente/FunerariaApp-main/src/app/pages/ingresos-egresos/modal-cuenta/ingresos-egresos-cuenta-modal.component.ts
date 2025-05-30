import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule, AlertController  } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IngresosServices } from 'src/app/Servicios/Ingresos.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CategoriasModalComponent } from '../modal-cuenta/modal-categorias/categoria-modal.component';
import { SubcategoriasModalComponent } from '../modal-cuenta/modal-subcategorias/subcategoria-modal.component';
import { CuentaModalComponent } from '../modal-cuenta/modal-cuentas/cuenta-modal.component';


declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
    lastAutoTable: { finalY: number };
  }
}


interface Ingreso {
  IngresoID: number;
  TipoCuentaID: number;
  CuentaID: number;
  RFC: string;
  TipoCuenta2ID: number;
  Cuenta2ID: number;
  RFC2: string;
  Monto: number;
  MontoParcial: number;
  CategoriaID: number;
  SubcategoriaID: number;
  Fecha: string;
  SegmentoID: number;
  Descripcion: string;
  TipoIngreso: { data: number[]; type: string; };
  NombreSegmento : string;
  NombreCategoria : string;
  NombreSubcategoria : string;
  NombreCuentaEnvia : string;
  NombreCuentaRecibe : string;
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
  IngresosBit: number;
  EgresoBit: number;
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
    TipoCuenta2ID: 0,
    CuentaID: 0,
    Cuenta2ID: 0,
    RFC: '',
    RFC2: '',
    Monto: 0,
    MontoParcial: 0,
    CategoriaID: 0,
    SubcategoriaID: 0,

    Fecha: '',
    SegmentoID: 0,
    Descripcion: '',
    TipoIngreso: { data: [], type: '' },
    NombreSegmento: '',
    NombreCategoria: '',
    NombreSubcategoria: '',
    NombreCuentaEnvia: '',
    NombreCuentaRecibe: '',

  };

  isMontoParcial: boolean = false;

  ingresoParcial = {
    MontoParcial: 0,
    // Agrega otros campos si es necesario
  };

  initialMontoParcial: number = 0;

  @Input() isMassiveAssignMode: boolean = false;
  @Input() selectedRecords: number[] = [];

  @Input() incomesData: Ingreso[] = []; // Recibimos los datos completos
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
  isNewCuenta2 = false;

  newNombreCuenta = '';
  newNombreCuenta2 = '';

  newRFC = '';
  newRFC2 = '';


  filteredCuentasEnvia: Cuenta[] = [];
  filteredCuentasRecibe: Cuenta[] = [];

  initialMonto: number = 0;

  totalMontoSeleccionado: number = 0;

  @Input() isEditMode: boolean = false;

  constructor(private modalController: ModalController, private _ingresoServ: IngresosServices, private alertController: AlertController) {}

  ngOnInit() {
    console.log('IngresoID recibido en el modal:', this.ingreso.IngresoID);
    console.log('Ingreso datos:', this.ingreso);

    this.initialMonto = this.ingreso.Monto;

    this.ingreso.MontoParcial = this.initialMonto;
  
    if (this.bulkAssignment) {
      this.isMassiveAssignMode = true;
      this.updateModalMode();
      this.calcularTotalMontos();
      console.log('Datos para generar PDF:', this.incomesData);
    } else {
      this.isMassiveAssignMode = false;
      this.updateModalMode();
    }
  
    this.loadCuentas();
    this.loadCategorias();
    this.loadSubcategorias();
    // this.onTipoCuentaChange();

  }

  calcularTotalMontos() {
    this.totalMontoSeleccionado = this.incomesData.reduce((total, ingreso) => {
      // Convertir Monto a número si es cadena
      const monto = typeof ingreso.Monto === 'string' ? parseFloat(ingreso.Monto) : ingreso.Monto;
      return total + (isNaN(monto) ? 0 : monto); // Sumar solo si es válido
    }, 0);
  }
  

  generatePDF() {
    const doc = new jsPDF();
  
    // Obtener la fecha y hora actual
    const currentDate = new Date().toLocaleString();
  
    // Aseguramos que Monto sea un número en el mapeo
    const tableData = this.incomesData.map(income => [
      income.IngresoID,
      income.Descripcion || 'Sin descripción', // Manejar descripción nula o indefinida
      income.Monto !== null && income.Monto !== undefined 
        ? `$${parseFloat(income.Monto.toString()).toFixed(2)}`  // Convertir Monto a número explícitamente
        : 'Sin monto',
      income.NombreSegmento,  // Puedes cambiar este campo por el nombre si lo tienes cargado
      income.Fecha || 'Sin fecha'
    ]);
  
    // Aseguramos que Monto sea un número en la sumatoria total
    const total = this.incomesData.reduce((sum, income) => 
      sum + (typeof income.Monto === 'number' ? income.Monto : parseFloat(income.Monto || '0')),  // Convertir Monto a número si es cadena
      0
    );
  
    // Título del PDF
    doc.text('Asignación Masiva de Cuentas', 10, 10);
    
    // Encabezado de la tabla con Segmento y Fecha
    doc.autoTable({
      head: [['IngresoID', 'Descripción', 'Monto', 'Segmento', 'Fecha']],
      body: tableData
    });
  
    // Total y fecha de creación del PDF
    doc.text(`Total: $${total.toFixed(2)}`, 10, doc.lastAutoTable.finalY + 10);
    doc.text(`Generado el: ${currentDate}`, 10, doc.lastAutoTable.finalY + 20);
  
    // Guardar el archivo PDF
    doc.save('AsignacionMasiva.pdf');
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
    this._ingresoServ.getCuentas().subscribe((data: Cuenta[]) => {
      console.log("esta es la info de cuentas: ", data);
      this.cuenta = data;
      this.onTipoCuentaChange('envia');
      this.onTipoCuentaChange('recibe');
    }, (error) => {
      this.presentAlert('Error fetching categories');
    });
  }

  loadCategorias() {
    this._ingresoServ.getCategorias().subscribe((data: Categoria[]) => {
      const tipoIngreso = this.ingreso.TipoIngreso?.data?.[0]; // 0 = egreso, 1 = ingreso
      this.categoria = data
        .filter(cat => tipoIngreso === 1 ? cat.EgresoBit === 1 : cat.IngresosBit === 1)
        .sort((a, b) => a.Nombre.localeCompare(b.Nombre));
    }, (error) => {
      this.presentAlert('Error fetching categories');
    });
  }

  async onCategoriaSelectorClick() {
    const modal = await this.modalController.create({
      component: CategoriasModalComponent,
    });

    modal.onDidDismiss().then((data) => {
      if (data.data) {
        this.ingreso.CategoriaID = data.data.CategoriaID;
        this.ingreso.NombreCategoria = data.data.NombreCategoria;
      }
    });

    await modal.present();
  }
  

  loadSubcategorias() {
    this._ingresoServ.getSubcategorias().subscribe((data: Subcategoria[]) => {
      this.subcategoria = data.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
    }, (error) => {
      this.presentAlert('Error fetching subcategories');
    });
  }

  async onSubcategoriaSelectorClick() {
    const modal = await this.modalController.create({
      component: SubcategoriasModalComponent,
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
        this.ingreso.SubcategoriaID = data.SubcategoriaID;
        this.ingreso.NombreSubcategoria = data.NombreSubcategoria;
    }
  }

  onTipoCuentaChange(tipo: 'envia' | 'recibe') {
    const nombresPermitidos = ['PABS Caja Chica', 'Pabs Caja chica SLRC', 'Perdida'];

    if (tipo === 'envia' && this.ingreso.TipoCuentaID) {
      this.filteredCuentasEnvia = this.cuenta.filter((c) => {
        if (this.ingreso.TipoCuentaID === 1) {
          return c.TipoCuentaID === 1 && nombresPermitidos.includes(c.NombreCuenta);
        }
        return c.TipoCuentaID === this.ingreso.TipoCuentaID;
      });
      this.ingreso.CuentaID = 0;
    } else if (tipo === 'recibe' && this.ingreso.TipoCuenta2ID) {
      this.filteredCuentasRecibe = this.cuenta.filter((c) => {
        if (this.ingreso.TipoCuenta2ID === 1) {
          return c.TipoCuentaID === 1 && nombresPermitidos.includes(c.NombreCuenta);
        }
        return c.TipoCuentaID === this.ingreso.TipoCuenta2ID;
      });
      this.ingreso.Cuenta2ID = 0;
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

  async openBuscadorCuenta(modo: 'envia' | 'recibe') {
    const tipoCuentaID = modo === 'envia' ? this.ingreso.TipoCuentaID : this.ingreso.TipoCuenta2ID;

    const modal = await this.modalController.create({
      component: CuentaModalComponent,
      componentProps: {
        cuentas: this.cuenta,
        tipoCuentaID,
        modo
      }
    });

    modal.onDidDismiss().then(({ data }) => {
      if (data?.cuenta) {
        const { CuentaID, NombreCuenta } = data.cuenta;
        if (modo === 'envia') {
          this.ingreso.CuentaID = CuentaID;
          this.ingreso.NombreCuentaEnvia = NombreCuenta;
        } else {
          this.ingreso.Cuenta2ID = CuentaID;
          this.ingreso.NombreCuentaRecibe = NombreCuenta;
        }
      }
    });

    await modal.present();
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
        Fecha: this.ingreso.Fecha
      };
    
      console.log("Informacion de la actualizacion de cuenta y datos: ", cuentaData);
      console.log("Income IDs en el modal: ", this.incomeIDs);
      
      this._ingresoServ.actualizarCuentasIngresoMasivas({
        ids: this.incomeIDs,  // Aquí usamos `this.incomeIDs`
         cuenta: cuentaData
       }).subscribe(
         () => {
           this.presentAlert('Cuentas asignadas correctamente a los registros seleccionados.');
          //  this.generatePDF(); 
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
        TipoCuenta2ID: this.ingreso.TipoCuenta2ID,
        CuentaID: this.isNewCuenta ? this.newNombreCuenta : this.ingreso.CuentaID,
        CuentaID2: this.isNewCuenta2 ? this.newNombreCuenta2 : this.ingreso.Cuenta2ID,
        RFC: this.ingreso.TipoCuentaID === 2 ? (this.newRFC || this.ingreso.RFC || '') : '',
        RFC2: this.ingreso.TipoCuenta2ID === 2 ? (this.newRFC2 || this.ingreso.RFC2 || '') : '',
        Monto: this.ingreso.Monto,
        CategoriaID: this.isNewCategoria ? this.newCategoria : this.ingreso.CategoriaID,
        SubcategoriaID: this.isNewSubcategoria ? this.newSubcategoria : this.ingreso.SubcategoriaID,
        Fecha: this.ingreso.Fecha,
        SegmentoID: this.ingreso.SegmentoID,
        Descripcion: this.ingreso.Descripcion,
        TipoIngreso: this.ingreso.TipoIngreso.data,

        // Nuevos campos para manejar montos parciales
        EsMontoParcial: this.isMontoParcial,  // true si es parcial, false si es total
        MontoParcial: this.isMontoParcial ? this.ingreso.MontoParcial : 0, // Solo envía el monto parcial si se eligió esa opción
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
