import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule, AlertController  } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IngresosServices } from 'src/app/Servicios/Ingresos.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


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
  CategoriaID: number;
  SubcategoriaID: number;
  Fecha: string;
  SegmentoID: number;
  Descripcion: string;
  TipoIngreso: { data: number[]; type: string; };
  NombreSegmento : string;
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
    TipoCuenta2ID: 0,
    CuentaID: 0,
    Cuenta2ID: 0,
    RFC: '',
    RFC2: '',
    Monto: 0,
    CategoriaID: 0,
    SubcategoriaID: 0,

    Fecha: '',
    SegmentoID: 0,
    Descripcion: '',
    TipoIngreso: { data: [], type: '' },
    NombreSegmento: '',
  };

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

    this.initialMonto = this.ingreso.Monto;
  
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
      this.categoria = data.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
    }, (error) => {
      this.presentAlert('Error fetching categories');
    });
  }

  loadSubcategorias() {
    this._ingresoServ.getSubcategorias().subscribe((data: Subcategoria[]) => {
      this.subcategoria = data.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
    }, (error) => {
      this.presentAlert('Error fetching subcategories');
    });
  }

  onTipoCuentaChange(tipo: 'envia' | 'recibe') {
    if (tipo === 'envia' && this.ingreso.TipoCuentaID) {
      this.filteredCuentasEnvia = this.cuenta.filter(
        (c) => c.TipoCuentaID === this.ingreso.TipoCuentaID
      );
      this.ingreso.CuentaID = 0;
    } else if (tipo === 'recibe' && this.ingreso.TipoCuenta2ID) {
      this.filteredCuentasRecibe = this.cuenta.filter(
        (c) => c.TipoCuentaID === this.ingreso.TipoCuenta2ID
      );
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
           this.generatePDF(); 
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
