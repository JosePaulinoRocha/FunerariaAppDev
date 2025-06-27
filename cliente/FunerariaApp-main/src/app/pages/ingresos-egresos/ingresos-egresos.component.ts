import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from "@ionic/angular";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IngresosServices } from 'src/app/Servicios/Ingresos.service';
import { IngresosArchivoServices } from 'src/app/Servicios/Importar-ingresos-archivo.service';
import { IngresosEgresosModalComponent } from './modal/ingresos-egresos-modal.component';
import { IngresosEgresosArchivoModalComponent } from './modal-archivo/ingresos-egresos-archivo-modal.component';
import { IngresosEgresosCuentaModalComponent } from './modal-cuenta/ingresos-egresos-cuenta-modal.component';
import { IngresosArchivoModalComponent } from './modal-ingresos-archivo/ingresos-archivo-modal.component';
import { LoadingController } from '@ionic/angular';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { DescripcionesModalComponent } from './modal-descripcion/modal-descripcion.component'; // ajusta la ruta si es diferente
import { ObservacionesModalComponent } from './modal-observaciones/modal-observaciones.component';
import { ReconciliacionesServices } from 'src/app/Servicios/Reconciliaciones.service';




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

  ReconciliacionID: number;

  CuentaContable: number;

  MontoParcial: number;

  MontoParcialBandera: number;


  [key: string]: any; // Para permitir acceso dinámico
}


@Component({
  selector: 'app-ingresos-egresos',
  templateUrl: './ingresos-egresos.component.html',
  styleUrls: ['./ingresos-egresos.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule, IngresosEgresosModalComponent, IngresosEgresosCuentaModalComponent, IngresosArchivoModalComponent],
})
export class IngresosEgresosComponent implements OnInit {

  selectedDate: string = new Date().toISOString().split('T')[0];
  sortOrder: 'ASC' | 'DESC' = 'DESC';

  selectedColumns: string[] = [
    'Cuenta', 'Combinacion', 'Fecha', 'Segmento', 'Categoria', 'Subcategoria', 
    'Concepto', 'CuentaContable', 'Descripcion', 'Proveedor', 'Monto'
  ];
  
  columnasVisibles: { [key: string]: boolean } = {};

  fontSize: number = 10;

  readonly BATCH_SIZE = 100;

  isSearchActive: boolean = false;

  selectedIncomes: number[] = [];
  selectAll: boolean = false;    

  isLoading: boolean = false;

  pagesRemaining :number = 0
  incomes: Income[] = [];
  paginatedIncomes: Income[] = [];
  currentPage: number = 1;
  itemsPerPageOptions: number[] = [10, 20, 50, 100, 200, 500, 1000, 2000];
  itemsPerPage: number = 10;
  totalPages: number = 0;
  isAdmin: boolean = false;
  mostrarIngresos: boolean = true;
  filtroSeleccionado: 'all' | 'ingresos' | 'ingresosSinCuenta' | 'ingresosConCuenta' | 'egresos' | 'cuentaContable' | 'sinCuentaContable' | 'reconciliados' = 'ingresosSinCuenta';
  segmentoSeleccionado: string = 'todos';

  comprobanteSeleccionado: string = 'todos';

  sortField: string = '';

  sortDirection: 'asc' | 'desc' = 'asc';

  periodoFiltro = '3m';
  periodosDisponibles = [
    { label: '3 meses', valor: '3m' },
    { label: '6 meses', valor: '6m' },
    { label: '1 año', valor: '1y' },
    { label: '2 años', valor: '2y' },
    { label: '3 años', valor: '3y' },
    { label: '5 años', valor: '5y' },
    { label: 'Todos', valor: 'all' }
  ];

  fechaDesdeFiltro = '';

  masterCheckbox: boolean = false;

  onPeriodoFiltroChange() {
    const today = new Date();
    let fechaDesde = '';

    switch (this.periodoFiltro) {
      case '3m':
        today.setMonth(today.getMonth() - 3);
        break;
      case '6m':
        today.setMonth(today.getMonth() - 6);
        break;
      case '1y':
        today.setFullYear(today.getFullYear() - 1);
        break;
      case '2y':
        today.setFullYear(today.getFullYear() - 2);
        break;
      case '3y':
        today.setFullYear(today.getFullYear() - 3);
        break;
      case '5y':
        today.setFullYear(today.getFullYear() - 5);
        break;
      case 'all':
        this.fechaDesdeFiltro = ''; 
        this.currentPage = 1;
        this.loadIngresos();
        return;
    }

    fechaDesde = today.toISOString().split('T')[0];
    this.fechaDesdeFiltro = fechaDesde;
    this.currentPage = 1;
    this.loadIngresos();
  }

  onSegmentoChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.segmentoSeleccionado = selectElement.value;
    this.currentPage = 1;

    this.masterCheckbox = false;
    this.paginatedIncomes.forEach(income => income['selected'] = false);
    this.selectedIncomes = [];

    this.loadIngresos();
  }

  onComprobanteChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.comprobanteSeleccionado = selectElement.value;
    this.currentPage = 1;

    this.masterCheckbox = false;
    this.paginatedIncomes.forEach(income => income['selected'] = false);
    this.selectedIncomes = [];

    this.loadIngresos();
  }


  sortTable(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  
    this.incomes.sort((a, b) => {
      const valueA = a[field];
      const valueB = b[field];
  
      if (valueA == null || valueB == null) return 0;
      if (this.sortDirection === 'asc') {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
      }
    });
  
    this.updatePaginatedIncomes();
  }
  

  toggleSelectAll(event: any) {
    const isChecked = event.target.checked;
    this.masterCheckbox = isChecked;  // ← Marca el estado del maestro
    this.selectedIncomes = [];

    this.paginatedIncomes.forEach(income => {
      income['selected'] = isChecked;
      if (isChecked) {
        this.selectedIncomes.push(income.IngresoID);
      }
    });
  }

  onSelectIncome(income: any) {
    if (income['selected']) {  
      this.selectedIncomes.push(income.IngresoID);
    } else {
      const index = this.selectedIncomes.indexOf(income.IngresoID);
      if (index > -1) {
        this.selectedIncomes.splice(index, 1);
      }
    }
    this.masterCheckbox = this.paginatedIncomes.every(i => i['selected']);
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
    { value: 'FechaConciliacion', label: 'Fecha Conciliacion' },
    { value: 'NombreSegmento', label: 'Segmento' },
    { value: 'NombreCategoria', label: 'Categoria' },
    { value: 'NombreSubcategoria', label: 'Subcategoria' },
    { value: 'NombreConcepto', label: 'Concepto' },
    { value: 'CuentaContable', label: 'Cuenta Contable' },
    { value: 'Descripcion', label: 'Descripcion' },
    { value: 'Proveedor', label: 'Proveedor' },
    { value: 'Piezas', label: 'Piezas' },
    { value: 'TipoCuenta', label: 'Tipo de ingreso' },
    { value: 'NombreCuenta', label: 'Nombre Cuenta' },
    { value: 'RFC', label: 'RFC' },
    { value: 'Monto', label: 'Monto' },
    { value: 'SaldoReconciliacion', label: 'Saldo' },
    { value: 'Comprobante', label: 'Comprobante' },
    { value: 'NombreEstatus', label: 'Estatus' },
    { value: 'FechaAutorizacion', label: 'Fecha Autorizacion' },
    { value: 'NombreUsuarioAutoriza', label: 'Usuario Autoriza' },
    { value: 'NombreUsuarioRecibe', label: 'Usuario Recibe' },
    { value: 'ObservacionesDifConciliacion', label: 'Observaciones' },
  ];
  selectedFields: string[] = [];
  searchValues: { [key: string]: string } = {};
  dateSearchValues: { [key: string]: { startDate: string, endDate: string } } = {};

  constructor(private _reconciliacionServ: ReconciliacionesServices, private modalController: ModalController, private _ingresoServ: IngresosServices, private ingresosArchivoServices: IngresosArchivoServices, private loadingController: LoadingController) { }

  async openAssignAccountsModal() {
    // Filtrar los ingresos seleccionados para obtener los IDs
    const selectedIncomesData = this.incomes.filter(income => this.selectedIncomes.includes(income.IngresoID));
  
    // Asegúrate de que hay datos seleccionados
    if (selectedIncomesData.length === 0) {
      console.error('No se han seleccionado ingresos para la asignación masiva');
      return;
    }
  
    const modal = await this.modalController.create({
      component: IngresosEgresosCuentaModalComponent,
      componentProps: {
        incomesData: selectedIncomesData,  // Datos completos para el modal
        incomeIDs: selectedIncomesData.map(income => income.IngresoID), // Pasar solo los IDs
        bulkAssignment: true
      }
    });
  
    modal.onDidDismiss().then((data) => {
      if (data.data?.success) {
        this.loadIngresos();
        this.selectedIncomes = []; // Vaciar la selección
      }
    });
  
    await modal.present();
  }


  async asignarCuenta(ingresoID: number) {
    const ingreso = this.incomes.find(i => i.IngresoID === ingresoID);
    const modal = await this.modalController.create({
      component: IngresosEgresosCuentaModalComponent,
      componentProps: {
        ingreso: ingreso,
        bulkAssignment: false  // Indicamos que es una asignación individual
      }
    });

    modal.onDidDismiss().then((data) => {
      if (data.data?.success) {
        this.loadIngresos();
      }
    });

    await modal.present();
  }

  async asignarCuentaContable(ingresoID: number) {
    const ingreso = this.incomes.find(i => i.IngresoID === ingresoID);
    const modal = await this.modalController.create({
      component: IngresosArchivoModalComponent,
      componentProps: {
        ingreso: ingreso,
        bulkAssignment: false  // Indicamos que es una asignación individual
      }
    });

    modal.onDidDismiss().then((data) => {
      if (data.data?.success) {
        this.loadIngresos();
      }
    });

    await modal.present();
  }

  async editarCombinacion(ingresoID: number) {
    const ingreso = this.incomes.find(i => i.IngresoID === ingresoID);
    const modal = await this.modalController.create({
      component: IngresosEgresosModalComponent,
      componentProps: {
        ingreso: ingreso
      }
    });

    modal.onDidDismiss().then((data) => {
      if (data.data?.success) {
        this.loadIngresos();
      }
    });

    return await modal.present();
  }

  ngOnInit() {
    this.setDefaultPeriodoFiltro();
    this.loadIngresos();
    this.checkAdminStatus();
    this.updateFontSize();

  }

  setDefaultPeriodoFiltro() {
    const today = new Date();
    let fechaDesde = '';

    switch (this.periodoFiltro) {
      case '3m':
        today.setMonth(today.getMonth() - 3);
        break;
      case '6m':
        today.setMonth(today.getMonth() - 6);
        break;
      case '1y':
        today.setFullYear(today.getFullYear() - 1);
        break;
      case '2y':
        today.setFullYear(today.getFullYear() - 2);
        break;
      case '3y':
        today.setFullYear(today.getFullYear() - 3);
        break;
      case '5y':
        today.setFullYear(today.getFullYear() - 5);
        break;
      case 'all':
        this.fechaDesdeFiltro = ''; 
        return;
    }

    fechaDesde = today.toISOString().split('T')[0];
    this.fechaDesdeFiltro = fechaDesde;
  }

  async abrirModalDescripcion(income: any) {
    // console.log('Abriendo modal para IngresoID:', income?.IngresoID);
    // console.log('Registro completo:', income);
  
    const modal = await this.modalController.create({
      component: DescripcionesModalComponent,
      componentProps: {
        income: income
      }
    });
  
    await modal.present();
  
    const { data } = await modal.onDidDismiss();
  
    if (data?.observacion) {
      // console.log('Descripción recibida:', data.observacion);
  
      // Pasa income para que se actualice en la tabla
      this.updateDescripcion(income.IngresoID, data.observacion, income);
    }
  }
  
  
  updateDescripcion(ingresoID: number, descripcion: string, income?: any) {
    // console.log("este es mi id y descripcion: ", ingresoID, descripcion)
    this._ingresoServ.updateDescripcion(ingresoID, descripcion).subscribe(() => {
      // console.log('Descripción actualizada exitosamente');
      alert('Se realizó la descripción exitosamente');
  
      // Actualizar localmente el objeto en pantalla
      if (income) {
        income.Descripcion = descripcion;
      }
  
    }, (error) => {
      console.error('Error actualizando la descripción', error);
      alert('Error: Algo salió mal');
    });
  }


  async abrirModalObservacion(income: any) {
    // console.log('Abriendo modal para IngresoID:', income?.IngresoID);
    // console.log('Registro completo:', income);
  
    const modal = await this.modalController.create({
      component: ObservacionesModalComponent,
      componentProps: {
        income: income
      }
    });
  
    await modal.present();
  
    const { data } = await modal.onDidDismiss();
  
    if (data?.observacion) {
      // console.log('Observacion recibida:', data.observacion);
  
      // Pasa income para que se actualice en la tabla
      this.updateObservacion(income.IngresoID, data.observacion, income);
    }
  }
  
  
  updateObservacion(ingresoID: number, observacion: string, income?: any) {
    // console.log("este es mi id y observacion: ", ingresoID, observacion )
    this._reconciliacionServ.updateObservacion(ingresoID, observacion).subscribe(() => {
      // console.log('Observación actualizada exitosamente');
      alert('Se realizó la observacion exitosamente');
      if (income) {
        income.ObservacionesDifConciliacion = observacion;
      }
    }, (error) => {
      console.error('Error actualizando la observación', error);
      alert('Error: Algo salio mal');
    });
  }
  

  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

  triggerFileInputEgresos() {
    const fileInput = document.getElementById('fileInputEgresos') as HTMLInputElement;
    fileInput.click();
  }

  onFileChange(event: any) {
    const file = event.target.files[0];

    if (file) {
      const fileReader = new FileReader();

      fileReader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Asumimos que el primer sheet es el correcto
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

        // Convertir los datos a formato JSON
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        // Aquí manejamos los datos extraídos del Excel
        this.processExcelData(jsonData);
      };

      fileReader.readAsArrayBuffer(file);
    }

    event.target.value = '';

  }


  onFileChangeEgresos(event: any) {
    const file = event.target.files[0];

    if (file) {
      const fileReader = new FileReader();

      fileReader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Asumimos que el primer sheet es el correcto
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

        // Convertir los datos a formato JSON
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        // Aquí manejamos los datos extraídos del Excel
        this.processExcelDataEgresos(jsonData);
      };

      fileReader.readAsArrayBuffer(file);
    }

    event.target.value = '';

  }


  processExcelData(data: any[]) {
    // Asumiendo que la primera fila tiene los encabezados
    const headers = data[0];

    // Procesar el resto de las filas
    const rows = data.slice(1);

    const processedData = rows.map((row) => ({
      Segmento: row[0] || '',
      Categoria: row[1] || '',
      Subcategoria: row[2] || '',
      Concepto: row[3] || '',
      Cuenta: row[4] || '',
      RFC: row[5] || '',
      CuentaContpaq: row[6] || 0,
    }));

    // console.log("Datos procesados:", processedData);

    // Llamar al servicio para enviar los datos a la API
    this.ingresosArchivoServices.importarIngresosArchivo(processedData).subscribe(
      (response) => {
        // console.log('Datos enviados exitosamente:', response);
        this.loadIngresos();
      },
      (error) => {
        console.error('Error al enviar los datos:', error);
      }
    );

  }


  processExcelDataEgresos(data: any[]) {
    // Asumiendo que la primera fila tiene los encabezados
    const headers = data[0];

    // Procesar el resto de las filas
    const rows = data.slice(1);

    const processedData = rows.map((row) => ({
      Fecha: this.excelDateToJSDate(row[0]) || '',
      Segmento: row[1] || '',
      Categoria: row[2] || '',
      Subcategoria: row[3] || '',
      Concepto: row[4] || '',
      Descripcion: row[5] || '',
      Monto: row[7] || 0,
      Cuenta: row[8] || '',
    }));

    // console.log("Datos procesados de egresos:", processedData);

    // Enviar registros en batches
    this.sendEgresosInBatches(processedData);
  }



  sendEgresosInBatches(registros: any[]) {
    const totalRegistros = registros.length;
    let offset = 0;

    const sendNextBatch = () => {
      // Obtener el batch actual de registros
      const batch = registros.slice(offset, offset + this.BATCH_SIZE);

      // Si no hay más registros, finalizar
      if (batch.length === 0) {
        // console.log('Todos los registros han sido importados.');
        this.isLoading = false;
        this.loadIngresos(); // Actualizar la tabla al finalizar la importación
        return;
      }

      // Enviar el batch al endpoint
      this.ingresosArchivoServices.importarEgresosArchivo(batch).subscribe(
        () => {
          // console.log(`Batch de ${batch.length} registros importados correctamente`);
          offset += this.BATCH_SIZE; // Incrementar el offset para el siguiente batch
          sendNextBatch(); // Llamar de nuevo para enviar el siguiente batch
        },
        (error: any) => {
          console.error('Error al importar el batch de registros', error);
          this.isLoading = false; // Finaliza el indicador de carga en caso de error
        }
      );
    };

    // Iniciar el proceso de envío
    this.isLoading = true;
    sendNextBatch();
  }



  excelDateToJSDate(serial: number): string {
    const utc_days = Math.floor(serial - 25569) + 1; // Número base de días de Excel
    const date_info = utc_days * 86400; // Convertir días a segundos
    const date = new Date(date_info * 1000); // Crear la fecha en milisegundos

    // Formatear la fecha a "yyyy-mm-dd" o al formato que necesites
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  exportEgresos() {
    // Filtrar los ingresos seleccionados
    const selectedEgresos = this.incomes.filter(egreso =>
      this.selectedIncomes.includes(egreso.IngresoID)
    );

    // Verificar si hay registros con cuenta contable inválida o combinación incompleta
    const cuentaContableInvalida = selectedEgresos.filter(egreso =>
      egreso.CuentaContable !== null &&
      (egreso.CuentaContable <= 0 ||
        egreso.SegmentoID === null ||
        egreso.CategoriaID === null ||
        egreso.SubcategoriaID === null ||
        egreso.ConceptoID === null ||
        egreso['CuentaID'] === null)
    );

    if (cuentaContableInvalida.length > 0) {
      const idsCuentaInvalida = cuentaContableInvalida.map(egreso => egreso.IngresoID).join(', ');
      alert(`Los siguientes registros tienen una cuenta contable inválida o falta completar la combinación: ${idsCuentaInvalida}. No se puede exportar el archivo.`);
      return;
    }

    // console.log("Estos son los registros seleccionados que se exportarán: ", selectedEgresos);

    // Mapear los campos que deseas exportar
    const exportData = selectedEgresos.map(egreso => ({
      ID: egreso.IngresoID,
      Fecha: egreso.Fecha,
      Tipo: egreso.TipoIngreso.data[0] === 1 ? 'Egreso' : 'Ingreso',
      Segmento: egreso.NombreSegmento,
      Categoria: egreso.NombreCategoria,
      Subcategoria: egreso.NombreSubcategoria,
      Concepto: egreso.NombreConcepto,
      CuentaContable: egreso.CuentaContable,
      Descripcion: egreso.Descripcion,
      Proveedor: egreso.Proveedor,
      Proveedor_Estatus: egreso.ProveedorEstatus,
      Piezas: egreso.Piezas,
      Tipo_Cuenta: egreso.TipoCuenta,
      Cuenta: egreso.NombreCuenta,
      RFC: egreso.RFC,
      Monto: egreso.Monto,
      Saldo: egreso.Saldo,
      Estatus: egreso.NombreEstatus,
      Fecha_Autorizacion: egreso.FechaAutorizacion,
      Nombre_Usuario_Autoriza: egreso.NombreUsuarioAutoriza,
      Nombre_Usuario_Recibe: egreso.NombreUsuarioRecibe,
      Fecha_Conciliacion: egreso.FechaConciliacion,
      Reconciliado: egreso.Reconciliado,
      ReconciliacionID: egreso.ReconciliacionID,
      Observaciones: egreso.ObservacionesDifConciliacion,
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = { Sheets: { 'Capturas': worksheet }, SheetNames: ['Capturas'] };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    saveAs(blob, 'Capturas.xlsx'); // Cambié el nombre para reflejar que ya no es solo de reconciliados
  }


  checkAdminStatus() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.isAdmin = user.isAdmin === 1;
  }

  getDefaultFechaDesde(): string {
    const today = new Date();
    today.setMonth(today.getMonth() - 3);
    return today.toISOString().split('T')[0];
  }

  loadIngresos() {

    this.masterCheckbox = false;  // Desmarca el maestro
    this.paginatedIncomes.forEach(income => income['selected'] = false);
    this.selectedIncomes = [];

    this.isLoading = true;

    this._ingresoServ.getIngresosPorFiltro(
      this.filtroSeleccionado,
      this.currentPage,
      this.itemsPerPage,
      this.selectedDate,
      (this.fechaDesdeFiltro !== '' ? this.fechaDesdeFiltro : undefined),
      this.sortOrder,
      this.segmentoSeleccionado,
      this.comprobanteSeleccionado
    ).subscribe((data: any) => {
      this.sortAndFormatData(data.ingresos);
      this.updatePagination(data.ingresos.length);
      this.totalPages = data.totalPages;
      this.pagesRemaining = this.totalPages - this.currentPage;
      this.isLoading = false;
    }, (error) => {
      this.isLoading = false;
      console.error('Error fetching incomes', error);
      alert('Error fetching data. Please try again later.');
    });
  }

  onDateChange() {
    this.currentPage = 1;
    this.loadIngresos();
  }

  toggleSortOrder() {
    this.sortOrder = this.sortOrder === 'DESC' ? 'ASC' : 'DESC';
    this.currentPage = 1;
    this.loadIngresos();
  }
  
  sortAndFormatData(data: Income[]) {
    this.incomes = data

      .map(income => ({
        ...income,
        Fecha: new Date(income.Fecha).toISOString().split('T')[0],
        FechaAutorizacion: new Date(income.FechaAutorizacion).toISOString().split('T')[0],
        FechaConciliacion: new Date(income.FechaConciliacion).toISOString().split('T')[0]
      }));
      // console.log("sort ",data) 
    this.mostrarIngresos = this.filtroSeleccionado === 'ingresos' || this.filtroSeleccionado === 'cuentaContable' || this.filtroSeleccionado === 'ingresosSinCuenta' || this.filtroSeleccionado === 'ingresosConCuenta';
  }

  updatePagination(totalRecords: number) {
    this.updatePaginatedIncomes();
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
    // this.updatePaginatedIncomes();
    this.loadDataBasedOnContext();
  }

  updatePaginatedIncomes() {
    let startIndex: number;
    if (this.isSearchActive) {
      startIndex = (this.currentPage - 1) * this.itemsPerPage;
    } else {
      startIndex = 0;
    }
    // console.log("startIndex", startIndex);
    // console.log("Total Incomes: ", this.incomes.length);
    this.paginatedIncomes = this.incomes.slice(startIndex, startIndex + this.itemsPerPage);
    // console.log("paginatedIncomes", this.paginatedIncomes, startIndex, this.itemsPerPage);
    if (this.paginatedIncomes.length === 0) {
      console.warn('No hay ingresos para mostrar en esta página, revisa el valor de startIndex y la longitud de this.incomes');
    }
    this.pagesRemaining = Math.max(0, this.totalPages - this.currentPage);
  }
  

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      // console.log('Página anterior:', this.currentPage);
      this.loadDataBasedOnContext();
      this.masterCheckbox = false;  // Desmarca el maestro
      this.paginatedIncomes.forEach(income => income['selected'] = false);
      this.selectedIncomes = [];
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      // console.log('Página siguiente:', this.currentPage);
      this.loadDataBasedOnContext();
      this.masterCheckbox = false;  // Desmarca el maestro
      this.paginatedIncomes.forEach(income => income['selected'] = false);
      this.selectedIncomes = [];
    }
  }

  loadDataBasedOnContext() {
    if (this.isSearchActive) {
      this.applySearch(); 
    } else {
      this.loadIngresos();
    }
  }

  setFilter(filtro: 'all' | 'ingresos' | 'ingresosSinCuenta' | 'ingresosConCuenta' | 'egresos' | 'cuentaContable' | 'sinCuentaContable' | 'reconciliados') {
    this.filtroSeleccionado = filtro;
    this.currentPage = 1;
    this.segmentoSeleccionado = 'todos'; 
    
    this.masterCheckbox = false;  // Desmarca el maestro
    this.paginatedIncomes.forEach(income => income['selected'] = false);
    this.selectedIncomes = [];

    this.loadIngresos(); 
  }

  applySearch() {

    this.masterCheckbox = false;  // Desmarca el maestro
    this.paginatedIncomes.forEach(income => income['selected'] = false);
    this.selectedIncomes = [];

    this.isLoading = true;
    this.isSearchActive = true;

    const filtros: { [key: string]: string | number } = { filtro: this.filtroSeleccionado };

    filtros['segmento'] = this.segmentoSeleccionado || 'todos';

    let tieneFiltroFecha = false;

    for (let field of this.selectedFields) {
      if (this.isDateField(field)) {
        const startDate = this.dateSearchValues[field]?.startDate;
        const endDate = this.dateSearchValues[field]?.endDate;

        if (startDate) {
          filtros[`${field}Desde`] = startDate;
          tieneFiltroFecha = true;
        }
        if (endDate) {
          const adjustedEndDate = new Date(endDate);
          adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
          filtros[`${field}Hasta`] = adjustedEndDate.toISOString().split('T')[0];
          tieneFiltroFecha = true;
        }
      } else if (this.searchValues[field]) {
        filtros[field] = this.searchValues[field];
      }
    }

    // 👉 Si no hay filtros de fecha, aplica el rango de 3 meses por defecto
    if (!tieneFiltroFecha) {
      const today = new Date();
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(today.getMonth() - 3);

      filtros['FechaDesde'] = threeMonthsAgo.toISOString().split('T')[0];
      filtros['FechaHasta'] = today.toISOString().split('T')[0];
    }

    this._ingresoServ.getIngresosParametros(filtros).subscribe(
      (data: Income[]) => {
        this.incomes = data
          .sort((a, b) => new Date(b.Fecha).getTime() - new Date(a.Fecha).getTime())
          .map(income => ({
            ...income,
            Fecha: income.Fecha ? new Date(income.Fecha).toISOString().split('T')[0] : '',
            FechaAutorizacion: income.FechaAutorizacion
              ? new Date(income.FechaAutorizacion).toISOString().split('T')[0]
              : '',
            FechaConciliacion: income.FechaConciliacion
              ? new Date(income.FechaConciliacion).toISOString().split('T')[0]
              : '',
          }));

        this.totalPages = Math.ceil(this.incomes.length / this.itemsPerPage);
        this.currentPage = Math.min(this.currentPage, this.totalPages);
        this.updatePaginatedIncomes();
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching filtered incomes:', error);
        this.isLoading = false;
      }
    );
  }

  
  resetSearch() {
    this.currentPage = 1;
    this.searchValues = {};
    this.dateSearchValues = {};
    this.selectedFields = [];
    this.isSearchActive = false; 
    this.loadIngresos();
  }

  matchesSearch(income: Income): boolean {
    for (let field of this.selectedFields) {
      if (this.isDateField(field)) {
        const dateRange = this.dateSearchValues[field];
        const incomeDate = new Date(income[field] as string);
        const startDate = dateRange.startDate ? new Date(dateRange.startDate) : null;
        const endDate = dateRange.endDate ? new Date(dateRange.endDate) : null;
  
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
    return ['Fecha', 'FechaAutorizacion', 'FechaConciliacion'].includes(field);
  }

  getFieldLabel(field: string): string {
    return this.searchFields.find(f => f.value === field)?.label || field;
  }

  async handleButtonClick(filePath: string, ingresoID: number) {
    if (filePath) {
      this.downloadFile(filePath);
    } else {
      const modal = await this.modalController.create({
        component: IngresosEgresosArchivoModalComponent,
        componentProps: { ingreso: { IngresoID: ingresoID } },
      });

      modal.onDidDismiss().then((data) => {
        if (data.data?.success) {
          this.loadIngresos();
        }
      });

      await modal.present();
    }
  }


  downloadFile(fileUrl: string) {
    const cleanFileUrl = fileUrl.replace(/^\/?root\/Api_Funeraria_Git\/Api_Funeraria_Git\//, ''); 
    const baseUrl = 'https://systemabmxlifuneraria.com';
    const fullUrl = `${baseUrl}/${cleanFileUrl}`;
    window.open(fullUrl, '_blank');
  }


  async presentLoading(message: string) {
    const loading = await this.loadingController.create({
      message: message,
      spinner: 'crescent', 
    });
    await loading.present();
    return loading;
  }

  async dismissLoading(loading: HTMLIonLoadingElement) {
    await loading.dismiss();
  }

  updateFontSize() {
    const tabla = document.querySelector('.mi-tabla') as HTMLElement;
    if (tabla) {
      tabla.style.fontSize = `${this.fontSize}px`;
  
      const celdas = tabla.querySelectorAll('td, th');
      celdas.forEach((celda) => {
        if (celda instanceof HTMLElement) {
          celda.title = celda.innerText;
        }
      });
      
    }
  }

  confirmDeleteComprobante(ingresoID: number) {
    if (confirm('¿Estás seguro de que deseas eliminar el comprobante de este egreso?')) {
      this._ingresoServ.deleteComprobante(ingresoID).subscribe({
        next: () => {
          alert('Comprobante eliminado correctamente.');
          this.loadIngresos(); // refresca la tabla
        },
        error: (err) => {
          console.error('Error al eliminar comprobante', err);
          alert('Ocurrió un error al eliminar el comprobante.');
        }
      });
    }
  }
  
}
