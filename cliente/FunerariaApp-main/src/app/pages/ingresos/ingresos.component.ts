import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from "@ionic/angular";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IncomeModalComponent } from './modal/income-modal.component';
import { HttpClientModule } from '@angular/common/http';
import { IngresosServices } from 'src/app/Servicios/Ingresos.service';
import { LoadingController } from '@ionic/angular';
import { IngresosArchivoServices } from 'src/app/Servicios/Importar-ingresos-archivo.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


interface Income {
  IngresoID: number;
  Fecha: string;
  ConceptoID: number;
  NombreConcepto: string;
  Descripcion: string;
  Proveedor: string;
  ProveedorEstatus: { data: number[]; type: string; };
  Piezas: number;
  CajaChica: boolean;
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
  NombreUsuarioAutoriza: string;
  UsuarioRecibeID: number;
  NombreUsuarioRecibe: string;
  FechaConciliacion: string;
  ObservacionesDifConciliacion: string;
  NombreCajaChica?: string;
  RFC?: string;
  NombreDuenoCuenta?: string;
  SaldoReconciliacion: number;
  TipoCuenta: string;
  NombreCuenta: string;
  Reconciliado: number;
  TipoIngreso: { data: number[]; type: string; };
  ReconciliacionID: number,
  CuentaID: number;
  [key: string]: any;
}

@Component({
  selector: 'app-ingresos',
  templateUrl: './ingresos.component.html',
  styleUrls: ['./ingresos.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, IncomeModalComponent, HttpClientModule],
})
export class IngresosComponent implements OnInit {

  readonly BATCH_SIZE = 100;

  isLoading: boolean = false;

  incomes: Income[] = [];
  paginatedIncomes: Income[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  itemsPerPageOptions: number[] = [10, 20, 50, 100, 500, 1000];

  updateTotalPages() {
    this.totalPages = Math.ceil(this.incomes.length / this.itemsPerPage);
  }

  onItemsPerPageChange() {
    this.currentPage = 1; // Resetea la paginación al cambiar los registros por página
    this.updateTotalPages();
    this.updatePaginated();
  }

  getStartDate(field: string): string {
    return this.dateSearchValues[field]?.startDate || '';
  }

  getEndDate(field: string): string {
    return this.dateSearchValues[field]?.endDate || '';
  }

  onStartDateChange(event: Event, field: string): void {
    const input = event.target as HTMLInputElement;
    const startDate = input.value;
    if (!this.dateSearchValues[field]) {
      this.dateSearchValues[field] = { startDate: '', endDate: '' };
    }
    this.dateSearchValues[field].startDate = startDate;
  }

  onEndDateChange(event: Event, field: string): void {
    const input = event.target as HTMLInputElement;
    const endDate = input.value;
    if (!this.dateSearchValues[field]) {
      this.dateSearchValues[field] = { startDate: '', endDate: '' };
    }
    this.dateSearchValues[field].endDate = endDate;
  }

  searchFields = [
    { value: 'IngresoID', label: 'ID' },
    { value: 'Fecha', label: 'Fecha' },
    { value: 'NombreSegmento', label: 'Segmento' },
    { value: 'NombreCategoria', label: 'Categoria' },
    { value: 'NombreSubcategoria', label: 'Subcategoria' },
    { value: 'NombreConcepto', label: 'Concepto' },
    { value: 'Descripcion', label: 'Descripcion' },
    { value: 'Proveedor', label: 'Proveedor' },
    { value: 'Piezas', label: 'Piezas' },
    { value: 'TipoCuenta', label: 'Tipo Cuenta' },
    { value: 'RFC', label: 'RFC' },
    { value: 'Monto', label: 'Monto' },
    { value: 'NombreUsuarioRecibe', label: 'Usuario Recibe' },

  ];
  selectedFields: string[] = [];
  searchValues: { [key: string]: string } = {};
  dateSearchValues: { [key: string]: { startDate: string, endDate: string } } = {};

  constructor( private ingresosArchivoServices: IngresosArchivoServices, private modalController: ModalController, private _ingresoServ: IngresosServices, private loadingController: LoadingController) { }




  ngOnInit() {
    this.loadIngresos();
  }


  triggerFileInputEgresosNuevo() {
    const fileInput = document.getElementById('fileInputEgresosNuevo') as HTMLInputElement;
    fileInput.click();
  }

  triggerFileInputIngresos() {
    const fileInput = document.getElementById('fileInputIngresos') as HTMLInputElement;
    fileInput.click();
  }

  triggerFileInputEgresosViejo() {
    const fileInput = document.getElementById('fileInputEgresosViejo') as HTMLInputElement;
    fileInput.click();
  }

  triggerFileInputIngresosViejo() {
    const fileInput = document.getElementById('fileInputIngresosViejo') as HTMLInputElement;
    fileInput.click();
  }


  onFileChangeIngresos(event: any) {
      const file = event.target.files[0];

      if (file) {
          const fileReader = new FileReader();

          fileReader.onload = (e: any) => {
              const data = new Uint8Array(e.target.result);
              const workbook = XLSX.read(data, { type: 'array' });
              const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
              const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
              this.processExcelDataIngresos(jsonData);
          };

          fileReader.readAsArrayBuffer(file);
      }
      event.target.value = '';
  }

  processExcelDataIngresos(data: any[]) {
      const headers = data[0];
      const rows = data.slice(1);

      const processedData = rows.map((row) => ({
          Fecha: this.excelDateToJSDate(row[0]) || '',
          Segmento: row[1] || '',
          Categoria: row[2] || '',
          Concepto: row[3] || '',
          Descripcion: row[4] || '',
          Monto: row[5] || 0,
          Cuenta: row[6] || ''
      }));

      // console.log("Datos procesados de ingresos:", processedData);
      this.sendIngresosInBatches(processedData);
  }

  sendIngresosInBatches(registros: any[]) {
      const totalRegistros = registros.length;
      let offset = 0;

      const sendNextBatch = () => {
          const batch = registros.slice(offset, offset + this.BATCH_SIZE);
          if (batch.length === 0) {
              // console.log('Todos los ingresos han sido importados.');
              this.isLoading = false;
              this.loadIngresos();
              return;
          }

          this.ingresosArchivoServices.importarIngresosArchivoImportado(batch).subscribe(
              () => {
                  // console.log(`Batch de ${batch.length} ingresos importados correctamente`);
                  offset += this.BATCH_SIZE;
                  sendNextBatch();
              },
              (error: any) => {
                  console.error('Error al importar el batch de ingresos', error);
                  this.isLoading = false;
              }
          );
      };

      this.isLoading = true;
      sendNextBatch();
  } 

  onFileChangeEgresos(event: any) {
    const file = event.target.files[0];

    if (file) {
      const fileReader = new FileReader();

      fileReader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        this.processExcelDataEgresos(jsonData);
      };

      fileReader.readAsArrayBuffer(file);
    }
    event.target.value = '';
  }

  processExcelDataEgresos(data: any[]) {
    const headers = data[0];
    const rows = data.slice(1);

    const processedData = rows.map((row) => ({
      Fecha: this.excelDateToJSDate(row[0]) || '',
      Segmento: row[1] || '',
      Categoria: row[2] || '',
      Subcategoria: row[3] || '',
      Concepto: row[4] || '',
      Descripcion: row[5] || '',
      Monto: row[6] || 0,
      Cuenta: row[7] || '',
      Proveedor: row[8] || '',
      Piezas: row[9] || 0,
    }));

    // console.log("Datos procesados de egresos con proveedor y piezas:", processedData);
    this.sendEgresosInBatches(processedData);
  }

  sendEgresosInBatches(registros: any[]) {
    const totalRegistros = registros.length;
    let offset = 0;

    const sendNextBatch = () => {
      const batch = registros.slice(offset, offset + this.BATCH_SIZE);
      if (batch.length === 0) {
        // console.log('Todos los registros han sido importados.');
        this.isLoading = false;
        this.loadIngresos();
        return;
      }

      this.ingresosArchivoServices.importarEgresosArchivoImportacion(batch).subscribe(
        () => {
          // console.log(`Batch de ${batch.length} registros importados correctamente`);
          offset += this.BATCH_SIZE;
          sendNextBatch();
        },
        (error: any) => {
          console.error('Error al importar el batch de registros', error);
          this.isLoading = false;
        }
      );
    };

    this.isLoading = true;
    sendNextBatch();
  }

  excelDateToJSDate(value: any): string {
    if (typeof value === 'number') {
      // Manejo del número de serie de Excel
      const utc_days = Math.floor(value - 25569) + 1; // Ajuste para fechas en Excel
      const date_info = utc_days * 86400; // Convertir días a segundos
      const date = new Date(date_info * 1000); // Crear la fecha en milisegundos
      return this.formatDate(date);
    } else if (typeof value === 'string') {
      // Normalizar separadores a "/"
      const normalizedValue = value.replace(/-/g, '/');
  
      // Intentar convertirlo directamente
      let date = new Date(normalizedValue);
      if (!isNaN(date.getTime())) {
        return this.formatDate(date);
      }
  
      // Intentar con formato DD/MM/YYYY o DD-MM-YYYY
      const dateParts = normalizedValue.split('/');
      if (dateParts.length !== 3) return ''; // Si no tiene tres partes, no es una fecha válida
  
      let [part1, part2, part3] = dateParts.map(part => parseInt(part, 10));
  
      // Determinar si está en formato YYYY/MM/DD o DD/MM/YYYY
      if (part1 > 31) {
        // Es YYYY/MM/DD
        date = new Date(part1, part2 - 1, part3);
      } else {
        // Es DD/MM/YYYY o DD-MM-YYYY, intercambiamos el año y el día
        date = new Date(part3, part2 - 1, part1);
      }
  
      return isNaN(date.getTime()) ? '' : this.formatDate(date);
    }
    return ''; // Retornar vacío si la conversión falla
  }
  
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }



  onFileChangeEgresosViejo(event: any) {
    const file = event.target.files[0];

    if (file) {
      const fileReader = new FileReader();

      fileReader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        this.processExcelDataEgresosViejo(jsonData);
      };

      fileReader.readAsArrayBuffer(file);
    }
    event.target.value = '';
  }

  processExcelDataEgresosViejo(data: any[]) {
    const rows = data.slice(1); // Ignoramos encabezados

    const processedData = rows.map((row) => ({
      Fecha: this.excelDateToJSDate(row[1]) || '',
      Segmento: row[2] || '',
      Categoria: row[3] || '',
      Subcategoria: row[4] || '',
      Concepto: row[5] || '',
      Descripcion: row[6] || '',
      Monto: row[7] || 0,
      Cuenta: row[8] || '',
      FechaConciliacion: this.excelDateToJSDate(row[10]) || '',
      Saldo: row[11] || 0
    }));

    console.log("Datos procesados:", processedData);
    this.sendEgresosViejoInBatches(processedData);
  }

  sendEgresosViejoInBatches(registros: any[]) {
    const totalRegistros = registros.length;
    let offset = 0;

    const sendNextBatch = () => {
      const batch = registros.slice(offset, offset + this.BATCH_SIZE);
      if (batch.length === 0) {
        console.log('Todos los registros han sido importados.');
        this.isLoading = false;
        this.loadIngresos();
        return;
      }

      this.ingresosArchivoServices.importarEgresosSistemaViejo(batch).subscribe(
        () => {
          console.log(`Batch de ${batch.length} registros importados correctamente`);
          offset += this.BATCH_SIZE;
          sendNextBatch();
        },
        (error: any) => {
          console.error('Error al importar el batch de registros (sistema viejo)', error);
          this.isLoading = false;
        }
      );
    };

    this.isLoading = true;
    sendNextBatch();
  }


    onFileChangeIngresosViejo(event: any) {
    const file = event.target.files[0];

    if (file) {
      const fileReader = new FileReader();

      fileReader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        this.processExcelDataIngresosViejo(jsonData);
      };

      fileReader.readAsArrayBuffer(file);
    }
    event.target.value = '';
  }

  processExcelDataIngresosViejo(data: any[]) {
    const rows = data.slice(1); // Ignoramos encabezados

    const processedData = rows.map((row) => ({
      Fecha: this.excelDateToJSDate(row[1]) || '',
      Segmento: row[2] || '',
      Categoria: row[3] || '',
      Descripcion: row[4] || '',
      Monto: row[5] || 0,
      Cuenta: row[6] || '',
      FechaConciliacion: this.excelDateToJSDate(row[8]) || '',
      Saldo: row[9] || 0
    }));

    console.log("Datos procesados (ingresos viejo):", processedData);
    this.sendIngresosViejoInBatches(processedData);
  }

  sendIngresosViejoInBatches(registros: any[]) {
    const totalRegistros = registros.length;
    let offset = 0;

    const sendNextBatch = () => {
      const batch = registros.slice(offset, offset + this.BATCH_SIZE);
      if (batch.length === 0) {
        console.log('Todos los registros de ingresos viejo han sido importados.');
        this.isLoading = false;
        this.loadIngresos();
        return;
      }

      this.ingresosArchivoServices.importarIngresosSistemaViejo(batch).subscribe(
        () => {
          console.log(`Batch de ${batch.length} registros importados correctamente`);
          offset += this.BATCH_SIZE;
          sendNextBatch();
        },
        (error: any) => {
          console.error('Error al importar el batch de registros (ingresos viejo)', error);
          this.isLoading = false;
        }
      );
    };

    this.isLoading = true;
    sendNextBatch();
  }


  loadIngresos() {
    this.isLoading = true;

    this._ingresoServ.getIngresosNoReconciliados(this.currentPage, this.itemsPerPage).subscribe((response: any) => {
        const data = response.data;

        this.incomes = data.map((income:any) => ({
            ...income,
            Fecha: new Date(income.Fecha).toISOString().split('T')[0],
        }));

        // console.log("estos son mis registros de ingresos: ", data);

        this.totalPages = response.totalPages;  // Actualizar el número total de páginas
        this.currentPage = response.currentPage;  // Actualizar la página actual
        this.itemsPerPage = response.itemsPerPage;  // Actualizar los ítems por página

        this.updatePaginated();
        this.isLoading = false;
    }, (error) => {
        console.error('Error fetching incomes', error);
        this.isLoading = false;
    });
}


  async openModal(income?: Income) {

    // console.log("estos son los datos de edicion: ", income)

    const modal = await this.modalController.create({
      component: IncomeModalComponent,
      componentProps: {
        ingreso: income ? { ...income } : this.getEmptyIncome(),
        isEditMode: !!income
      },
      cssClass: 'modal-grande' // ← AQUI agregas la clase
    });

    modal.onDidDismiss().then((result) => {
      if (result.data && result.role === 'success') {
        this.loadIngresos();
      }
    });

    return await modal.present();
  }

  updatePaginated() {
    const startIndex = 0;
    this.paginatedIncomes = this.incomes.slice(startIndex, startIndex + this.itemsPerPage);
    // console.log(this.paginatedIncomes)
  }


  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginated();
      this.loadIngresos()
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginated();
      this.loadIngresos()
    }
  }

  applySearch() {
    for (let field of this.selectedFields) {
      if (this.isDateField(field) && !this.dateSearchValues[field]) {
        this.dateSearchValues[field] = { startDate: '', endDate: '' };
      }
    }

    this._ingresoServ.getIngresos().subscribe((data: Income[]) => {
      this.incomes = data
        .filter(income => income.Reconciliado === 0) // Filtrar registros donde Reconciliado es igual a 0
        .filter(income => this.matchesSearch(income)) // Mantener la búsqueda
        .sort((a, b) => b.IngresoID - a.IngresoID)
        .map(transferencia => ({
          ...transferencia,
          Fecha: new Date(transferencia.Fecha).toISOString().split('T')[0],
        }));

      this.totalPages = Math.ceil(this.incomes.length / this.itemsPerPage);
      this.updatePaginated();
    });
  }


  resetSearch() {
    this.searchValues = {};
    this.dateSearchValues = {};
    this.selectedFields = [];
    this.loadIngresos();
  }

  matchesSearch(income: Income): boolean {
    for (let field of this.selectedFields) {
      if (this.isDateField(field)) {
        const dateRange = this.dateSearchValues[field];
        const incomeDate = new Date(income[field] as string);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);

        if (endDate) {
          endDate.setDate(endDate.getDate() + 1);
        }

        if (startDate && incomeDate < startDate) {
          return false;
        }
        if (endDate && incomeDate >= endDate) {
          return false;
        }
      } else {
        const searchValue = this.searchValues[field];
        if (searchValue && !((income[field] as string)?.toString().includes(searchValue))) {
          return false;
        }
      }
    }
    return true;
  }


  isDateField(field: string): boolean {
    return ['Fecha'].includes(field);
  }

  getFieldLabel(field: string): string {
    return this.searchFields.find(f => f.value === field)?.label || field;
  }


  getEmptyIncome(): Income {
    return {
      IngresoID: 0,
      Fecha: '',
      ConceptoID: 0,
      NombreConcepto: '',
      Descripcion: '',
      Proveedor: '',
      ProveedorEstatus: { data: [], type: '' },
      Piezas: 0,
      CajaChica: false,
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
      NombreUsuarioAutoriza: '',
      UsuarioRecibeID: 0,
      NombreUsuarioRecibe: '',
      FechaConciliacion: '',
      ObservacionesDifConciliacion: '',
      NombreCajaChica: '',
      RFC: '',
      NombreDuenoCuenta: '',
      SaldoReconciliacion: 0,
      TipoCuenta: '',
      NombreCuenta: '',
      Reconciliado: 0,
      TipoIngreso: { data: [], type: '' },
      ReconciliacionID: 0,
      CuentaID: 0,
    };
  }


  async presentLoading(message: string) {
    const loading = await this.loadingController.create({
      message: message,
      spinner: 'crescent', // Puedes cambiar el spinner a 'lines', 'bubbles', etc.
    });
    await loading.present();
    return loading;
  }

  async dismissLoading(loading: HTMLIonLoadingElement) {
    await loading.dismiss();
  }



}
