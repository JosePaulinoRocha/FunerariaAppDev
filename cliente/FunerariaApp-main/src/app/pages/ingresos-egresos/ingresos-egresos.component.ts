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

  readonly BATCH_SIZE = 100;

  selectedIncomes: number[] = []; // Almacena los IDs seleccionados
  selectAll: boolean = false;     // Controla si todos los registros están seleccionados

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


  toggleSelectAll(event: any) {
    const isChecked = event.target.checked;
    this.selectedIncomes = [];

    this.paginatedIncomes.forEach(income => {
      income['selected'] = isChecked; // Acceso dinámico con corchetes
      if (isChecked) {
        this.selectedIncomes.push(income.IngresoID);
      }
    });
  }

  onSelectIncome(income: any) {
    if (income['selected']) {  // Acceso dinámico con corchetes
      this.selectedIncomes.push(income.IngresoID);
    } else {
      const index = this.selectedIncomes.indexOf(income.IngresoID);
      if (index > -1) {
        this.selectedIncomes.splice(index, 1);
      }
    }
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
    { value: 'FechaConciliacion', label: 'Fecha Conciliacion' },
    { value: 'ObservacionesDifConciliacion', label: 'Observaciones' },
  ];
  selectedFields: string[] = [];
  searchValues: { [key: string]: string } = {};
  dateSearchValues: { [key: string]: { startDate: string, endDate: string } } = {};

  constructor(private modalController: ModalController, private _ingresoServ: IngresosServices, private ingresosArchivoServices: IngresosArchivoServices, private loadingController: LoadingController) { }

  async openAssignAccountsModal() {
    // Obtener los IDs de todos los ingresos filtrados y paginados (no solo los de la página actual)
    const selectedIncomeIDs = this.selectedIncomes;

    console.log("estos son los ID's :", selectedIncomeIDs);

    // Abrir el modal para asignar cuentas
    const modal = await this.modalController.create({
      component: IngresosEgresosCuentaModalComponent,
      componentProps: {
        incomeIDs: selectedIncomeIDs,  // Pasar los IDs de ingresos al modal
        bulkAssignment: true  // Indicamos que es una asignación masiva
      }
    });

    modal.onDidDismiss().then((data) => {
      if (data.data?.success) {
        this.loadIngresos();

        // Vaciar el arreglo de IDs después de la asignación
        this.selectedIncomes = [];

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
    this.loadIngresos();
    this.checkAdminStatus();
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

    console.log("Datos procesados:", processedData);

    // Llamar al servicio para enviar los datos a la API
    this.ingresosArchivoServices.importarIngresosArchivo(processedData).subscribe(
      (response) => {
        console.log('Datos enviados exitosamente:', response);
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

    console.log("Datos procesados de egresos:", processedData);

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
        console.log('Todos los registros han sido importados.');
        this.isLoading = false;
        this.loadIngresos(); // Actualizar la tabla al finalizar la importación
        return;
      }

      // Enviar el batch al endpoint
      this.ingresosArchivoServices.importarEgresosArchivo(batch).subscribe(
        () => {
          console.log(`Batch de ${batch.length} registros importados correctamente`);
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

    // Verificar si hay registros no reconciliados
    const noReconciliados = selectedEgresos.filter(egreso => egreso.Reconciliado !== 1);
    if (noReconciliados.length > 0) {
      // Mostrar un mensaje con los IngresoID de los registros no reconciliados
      const idsNoReconciliados = noReconciliados.map(egreso => egreso.IngresoID).join(', ');
      alert(`Los siguientes registros no están reconciliados: ${idsNoReconciliados}. No se puede exportar el archivo.`);
      return; // Detener la ejecución si hay registros no reconciliados
    }

    // Filtrar solo los registros reconciliados
    const egresosReconciliados = selectedEgresos.filter(egreso => egreso.Reconciliado === 1);

    // Verificar si hay registros con cuenta contable inválida o combinación incompleta
    const cuentaContableInvalida = egresosReconciliados.filter(egreso =>
      egreso.CuentaContable !== null &&
      (egreso.CuentaContable <= 0 ||
      egreso.SegmentoID === null ||
      egreso.CategoriaID === null ||
      egreso.SubcategoriaID === null ||
      egreso.ConceptoID === null ||
      egreso['CuentaID'] === null)
    );

    if (cuentaContableInvalida.length > 0) {
      // Mostrar un mensaje con los IngresoID de los registros con cuenta contable inválida
      const idsCuentaInvalida = cuentaContableInvalida.map(egreso => egreso.IngresoID).join(', ');
      alert(`Los siguientes registros tienen una cuenta contable inválida o falta completar la combinación: ${idsCuentaInvalida}. No se puede exportar el archivo.`);
      return; // Detener la ejecución si hay registros con cuenta contable inválida
    }

    console.log("Estos son los registros seleccionados y reconciliados que se exportarán: ", egresosReconciliados);


    // Mapear solo los campos que deseas exportar
    const exportData = egresosReconciliados.map(egreso => ({
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

    // Crear la hoja de Excel a partir del array de egresos reconciliados
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = { Sheets: { 'Capturas': worksheet }, SheetNames: ['Capturas'] };

    // Generar el archivo Excel y descargarlo
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'Capturas_reconciliados.xlsx');
  }


  checkAdminStatus() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.isAdmin = user.isAdmin === 1;
  }

  loadIngresos() {
    this.isLoading = true;
    this._ingresoServ.getIngresosPorFiltro(this.filtroSeleccionado, this.currentPage, this.itemsPerPage)
      .subscribe((data: any) => {
        console.log(data.ingresos)

        this.sortAndFormatData(data.ingresos);
        this.updatePagination(data.ingresos.length);

        // Already received totalPages from the API, so no need to recalculate
        this.totalPages = data.totalPages;
        this.pagesRemaining = this.totalPages - this.currentPage;

        this.isLoading = false;
      }, (error) => {
        this.isLoading = false;
        console.error('Error fetching incomes', error);
        // Optionally show a user-friendly message
        alert('Error fetching data. Please try again later.');
      });
  }
  sortAndFormatData(data: Income[]) {
    this.incomes = data

      .sort((a, b) => new Date(b.Fecha).getTime() - new Date(a.Fecha).getTime())
      .map(income => ({
        ...income,
        Fecha: new Date(income.Fecha).toISOString().split('T')[0],
        FechaAutorizacion: new Date(income.FechaAutorizacion).toISOString().split('T')[0],
        FechaConciliacion: new Date(income.FechaConciliacion).toISOString().split('T')[0]
      }));
      console.log("sort ",data)
    this.mostrarIngresos = this.filtroSeleccionado === 'ingresos' || this.filtroSeleccionado === 'cuentaContable';
  }

  updatePagination(totalRecords: number) {
    // This method is no longer necessary for recalculating totalPages, but we will use it to update pagination
    this.updatePaginatedIncomes();
  }

  onItemsPerPageChange() {
    // Reset to page 1 when the number of items per page changes
    this.currentPage = 1;
    this.updatePaginatedIncomes();
    this.loadIngresos();  // Ensure data is reloaded with the new items per page
  }

  updatePaginatedIncomes() {
    // Asegúrate de que currentPage sea mayor que 0 y que paginación no esté causando un índice fuera de rango.
    const startIndex = 0
    console.log("startIndex", startIndex);

    // Verifica que this.incomes tenga la cantidad de elementos correcta para la paginación.
    console.log("Total Incomes: ", this.incomes.length);

    // Actualiza los ingresos paginados de acuerdo al startIndex y itemsPerPage.
    this.paginatedIncomes = this.incomes.slice(startIndex, startIndex + this.itemsPerPage);
    console.log("paginatedIncomes", this.paginatedIncomes, startIndex, this.itemsPerPage);

    // Si los datos aún no se están mostrando, puede ser que `startIndex` esté fuera de rango de `this.incomes`.
    if (this.paginatedIncomes.length === 0) {
      console.warn('No hay ingresos para mostrar en esta página, revisa el valor de startIndex y la longitud de this.incomes');
    }

    // Actualiza las páginas restantes.
    this.pagesRemaining = Math.max(0, this.totalPages - this.currentPage);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      console.log('Página anterior:', this.currentPage);
      this.loadIngresos();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      console.log('Página siguiente:', this.currentPage);
      this.loadIngresos();
    }
  }


  setFilter(filtro: 'all' | 'ingresos' | 'ingresosSinCuenta' | 'ingresosConCuenta' | 'egresos' | 'cuentaContable' | 'sinCuentaContable' | 'reconciliados') {
    this.filtroSeleccionado = filtro;
    this.currentPage = 1;  // Reset to page 1 when the filter changes
    this.loadIngresos();  // Reload the data based on the selected filter
  }
  applySearch() {
    this.isLoading = true;  // Iniciar el estado de carga
    this.currentPage = 1;

    for (let field of this.selectedFields) {
      if (this.isDateField(field) && !this.dateSearchValues[field]) {
        this.dateSearchValues[field] = { startDate: '', endDate: '' };
      }
    }

    // Llamar al servicio de ingresos con el filtro seleccionado
    this._ingresoServ.getIngresosPorFiltro(this.filtroSeleccionado, this.currentPage, this.itemsPerPage).subscribe((data: Income[]) => {
      let filteredData = data;

      // Filtrar por búsqueda
      filteredData = filteredData.filter(income => this.matchesSearch(income));

      // Ordenar los registros por Fecha de más reciente a más antiguo
      filteredData.sort((a, b) => new Date(b.Fecha).getTime() - new Date(a.Fecha).getTime());

      // Mapear los datos a un formato adecuado
      this.incomes = filteredData.map(income => ({
        ...income,
        Fecha: new Date(income.Fecha).toISOString().split('T')[0],
        FechaAutorizacion: new Date(income.FechaAutorizacion).toISOString().split('T')[0],
        FechaConciliacion: new Date(income.FechaConciliacion).toISOString().split('T')[0]
      }));

      this.isLoading = false; // Finalizar el estado de carga

      console.log("Esta es la data de ingresos/egresos después del filtro y búsqueda: ", this.incomes);

      // Actualizar la paginación
      this.totalPages = Math.ceil(this.incomes.length / this.itemsPerPage);
      this.updatePaginatedIncomes();
    }, (error) => {
      this.isLoading = false; // Finalizar el estado de carga en caso de error
      console.error('Error fetching incomes for search', error);
    });
  }


  resetSearch() {
    this.currentPage = 1;
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

        // Incrementar la fecha final en 1 día para incluir el último día en el rango
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


  // downloadFile(fileUrl: string) {
  //   const baseUrl = 'http://localhost:8081/api/';
  //   const fullUrl = `${baseUrl}${fileUrl}`;
  //   window.open(fullUrl, '_blank');
  // }

  downloadFile(fileUrl: string) {
    const baseUrl = 'https://systemabmxli.com/';
    const fullUrl = `${baseUrl}${fileUrl}`;
    window.open(fullUrl, '_blank');
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
