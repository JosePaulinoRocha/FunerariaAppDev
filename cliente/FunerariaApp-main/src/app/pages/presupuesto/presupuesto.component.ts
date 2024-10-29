import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, AlertController } from "@ionic/angular";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PresupuestoServices } from 'src/app/Servicios/Presupuesto.service';
import { PresupuestoModalComponent } from './modal/presupuesto-modal.component';
import { PresupuestoCuentaModalComponent } from './modal-cuenta/presupuesto-cuenta-modal.component';
import { Router } from '@angular/router'
import { trigger, state, style, animate, transition } from '@angular/animations';



interface Presupuesto {
  SegmentoID: number;
  NombreSegmento: string;
  CategoriaID: number;
  NombreCategoria: string;
  SubcategoriaID: number;
  NombreSubcategoria: string;
  ConceptoID: number;
  NombreConcepto: string;
  PromedioMonto: number;
  PromedioPiezas: number;
  FrecuenciaPromedio: number;
  UltimaFecha: string;
  FrecuenciaDictaminada: number;
  MontoDictaminado: number;
  CuentaID: number;
  NombreCuenta: string;
  DiaLimite: number;
  [key: string]: any; // Permite la extensión de la interfaz con otros campos si es necesario
}

 interface PasoUsuario {
  UserID: number;
  NumeroPaso: number;
}

@Component({
  selector: 'app-presupuesto',
  templateUrl: './presupuesto.component.html',
  styleUrls: ['./presupuesto.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
  animations: [
    trigger('buttonAnimation', [
      state('void', style({ opacity: 0 })),
      transition(':enter', [
        animate('0.5s ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.5s ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class PresupuestoComponent  implements OnInit {

  currentStep: number = 0;
  totalSteps: number = 4;

  selectedCardIndex: number = 0;

  showInitialCard = true;
  showStepCards = false;
  showTable = false;


  nextStep() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    
    if (user && user.userId) {
      const userId = user.userId;
  
      // Si estamos en el último paso
      if (this.currentStep === this.totalSteps - 1) {
        // Insertar el paso como 0 y redirigir a /home
        this._presupuestoServ.insertPasoUsuario(userId, 0).subscribe(
          () => {
            this.router.navigate(['/home']); // Redirigir al usuario a la ruta /home
            this.currentStep = 0; // Restablecer el paso actual a 0
            this.showInitialCard = true;
            this.showStepCards = false;
            this.showTable = false;
            this.selectedCardIndex = 0;
          },
          (error) => {
            this.presentAlert('Error al actualizar el paso del usuario');
          }
        );
      } else {
        // Continuar con la lógica actual para avanzar al siguiente paso
        this._presupuestoServ.insertPasoUsuario(userId, this.currentStep + 1).subscribe(
          () => {
            this.currentStep++; // Avanza al siguiente paso
            this.selectedCardIndex = this.currentStep; // Actualiza el índice del card seleccionado
            this.onRadioChange(null); // Llama a onRadioChange para aplicar los cambios
          },
          (error) => {
            this.presentAlert('Error al insertar el paso del usuario');
          }
        );
      }
    }
  }
  

  steps = [
    {
      title: '1. Dictaminar monto y frecuencia de egresos semestrales',
      totalLabel: 'egresos sin dictaminar',
      total: 15,
      assignedLabel: 'Egresos dictaminados',
      assigned: 5,
    },
    {
      title: '2. Asignar cuenta de banco o efectivo a egresos semanales',
      totalLabel: 'cuentas sin asignar',
      total: 20,
      assignedLabel: 'Cuentas asignadas',
      assigned: 12,
    },
    {
      title: '3. Asignar cuenta de banco o efectivo y día límite a egresos periódicos',
      totalLabel: 'egresos sin cuenta y día límite',
      total: 25,
      assignedLabel: 'Cuentas con día límite asignado',
      assigned: 18,
    },
    {
      title: '4. Asignar cuenta de banco o efectivo a egresos extraordinarios',
      totalLabel: 'cuentas extraordinarias sin asignar',
      total: 10,
      assignedLabel: 'Cuentas asignadas',
      assigned: 7,
    }
  ];

  getStepTitle(step: number): string {
    switch (step) {
      case 0:
        return '1. Dictaminar monto y frecuencia de egresos semestrales';
      case 1:
        return '2. Asignar cuenta de banco o efectivo a egresos semanales';
      case 2:
        return '3. Asignar cuenta de banco o efectivo y día límite a egresos periódicos';
      case 3:
        return '4. Asignar cuenta de banco o efectivo a egresos extraordinarios';
      default:
        return '';
    }
  }
  

  showStepCard() {
    this.showInitialCard = false;
    this.showStepCards = true;
  }

  goToTable() {
    this.showStepCards = false;
    this.showTable = true;
  }

  presupuesto: Presupuesto[] = [];
  pasoUsuario: PasoUsuario[] = [];
  paginatedPresupuesto: Presupuesto[] = [];
  currentPage: number = 1;
  itemsPerPageOptions: number[] = [10, 20, 50, 100, 200, 500, 1000, 2000];
  itemsPerPage: number = 10;
  totalPages: number = 0;
  isAdmin: boolean = false;

  filtroSeleccionado: 'all' | 'asignados' | 'noAsignados' = 'noAsignados'; 

  filtroAsignarCuenta: 'semanal' | 'periodico' | 'extraordinario' | null = 'semanal';
  modoFiltro: 'dictaminar' | 'asignarCuenta' | 'presupuestoMensual' = 'dictaminar';


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
    { value: 'UltimaFecha', label: 'Ultima Fecha' },
    { value: 'NombreSegmento', label: 'Segmento' },
    { value: 'NombreCategoria', label: 'Categoria' },
    { value: 'NombreSubcategoria', label: 'Subcategoria' },
    { value: 'NombreConcepto', label: 'Concepto' },
    { value: 'PromedioMonto', label: 'Monto Promedio' },
    { value: 'PromedioPiezas', label: 'Promedio Piezas' },
    { value: 'FrecuenciaPromedio', label: 'Frecuencia Promedio' },
    { value: 'MontoDictaminado', label: 'Monto Dictaminado' },
    { value: 'FrecuenciaDictaminada', label: 'Frecuencia Dictaminada' },
  ];
  selectedFields: string[] = [];
  searchValues: { [key: string]: string } = {};
  dateSearchValues: { [key: string]: { startDate: string, endDate: string } } = {};

  constructor(private modalController: ModalController, private _presupuestoServ: PresupuestoServices, private alertController: AlertController, private router: Router) {}

  ngOnInit() {
    this.loadPresupuesto();
    this.checkAdminStatus();

    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (user && user.userId) {
      console.log('User ID:', user.userId);
      this.loadPasoUsuario(user.userId); // Pasar userId a la función
    } else {
      console.log('No se encontró el userId.');
    }

  }

  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }


  loadPasoUsuario(userId: number) { // Aceptar userId como parámetro
    this._presupuestoServ.getPasoUsuario(userId).subscribe(
      (data: PasoUsuario[]) => {
        console.log('Esta es mi data en paso usuario: ', data);
        this.pasoUsuario = data;

        // Asigna el paso correspondiente al selectedCardIndex
        if (data.length > 0) {
          this.selectedCardIndex = data[0].NumeroPaso; // Ajusta el índice (si es 1-indexed en la base de datos)
        }

        this.onRadioChange(null);

      },
      (error) => {
        this.presentAlert('Error fetching paso usuario');
      }
    );
  }


  checkAdminStatus() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.isAdmin = user.isAdmin === 1;
  }


  onRadioChange(event: any) {
    const selectedValue = this.selectedCardIndex; // Usa el índice del card seleccionado
    
    console.log("esta cambiando de card: ", selectedValue);
    
    // Cambiar el paso actual
    this.currentStep = selectedValue; // Cambia al paso correspondiente
  
    // Cambiar valores según el paso actual
    switch (selectedValue) {
      case 0: // Paso 1
        this.modoFiltro = 'dictaminar';
        this.filtroSeleccionado = 'noAsignados';
        break;
      case 1: // Paso 2
        this.modoFiltro = 'asignarCuenta';
        this.filtroAsignarCuenta = 'semanal';
        break;
      case 2: // Paso 3
        this.modoFiltro = 'asignarCuenta';
        this.filtroAsignarCuenta = 'periodico';
        break;
      case 3: // Paso 4
        this.modoFiltro = 'asignarCuenta';
        this.filtroAsignarCuenta = 'extraordinario';
        break;
    }
    
    // Cargar la tabla con el nuevo filtro
    this.loadPresupuesto();
    
    console.log('Modo Filtro:', this.modoFiltro);
    console.log('Filtro Asignar Cuenta:', this.filtroAsignarCuenta);
    console.log('Paso actual:', this.currentStep);
  }


  loadPresupuesto() {
    this._presupuestoServ.getPresupuesto().subscribe((data: Presupuesto[]) => {
      // Transformar la fecha y asignar la data inicial
      this.presupuesto = data.map(proveedor => ({
        ...proveedor,
        UltimaFecha: new Date(proveedor.UltimaFecha).toISOString().split('T')[0],
      }));

    // 1. Card: Egresos sin dictaminar (Monto o Frecuencia no asignados) y los ya dictaminados
    const totalSinDictaminar = this.presupuesto.filter(presupuesto => 
      presupuesto.MontoDictaminado === null || presupuesto.FrecuenciaDictaminada === null
    ).length;
    
    const totalDictaminados = this.presupuesto.filter(presupuesto => 
      presupuesto.MontoDictaminado !== null && presupuesto.FrecuenciaDictaminada !== null
    ).length;

    this.steps[0].total = totalSinDictaminar;
    this.steps[0].assigned = totalDictaminados;

    // 2. Card: Egresos semanales (FrecuenciaDictaminada == 7) sin cuenta y con cuenta
    const totalSinCuentaSemanales = this.presupuesto.filter(presupuesto => 
      
    (presupuesto.FrecuenciaDictaminada) == 7 && 
      (presupuesto.NombreCuenta === null && (presupuesto['CajaChica'].data?.[0] === 0))
    ).length;

    const totalConCuentaSemanales = this.presupuesto.filter(presupuesto => 
      
    (presupuesto.FrecuenciaDictaminada) == 7 && 
      (presupuesto.NombreCuenta !== null || (presupuesto['CajaChica'].data?.[0] === 1))
    ).length;

    this.steps[1].total = totalSinCuentaSemanales;
    this.steps[1].assigned = totalConCuentaSemanales;


    // 3. Card: Egresos periódicos (FrecuenciaDictaminada entre 14 y 180 días) sin cuenta y día límite, y con cuenta y día límite
    const totalSinCuentaDiaLimitePeriodicos = this.presupuesto.filter(presupuesto => 
      presupuesto.FrecuenciaDictaminada >= 14 && presupuesto.FrecuenciaDictaminada <= 180 && 
      !presupuesto.DiaLimite
    ).length;
    
    const totalConCuentaDiaLimitePeriodicos = this.presupuesto.filter(presupuesto => 
      presupuesto.FrecuenciaDictaminada >= 14 && presupuesto.FrecuenciaDictaminada <= 180 && 
      presupuesto.DiaLimite
    ).length;

    this.steps[2].total = totalSinCuentaDiaLimitePeriodicos;
    this.steps[2].assigned = totalConCuentaDiaLimitePeriodicos;

    // 4. Card: Egresos extraordinarios (FrecuenciaDictaminada == -1) sin cuenta y con cuenta
    const totalSinCuentaExtraordinarios = this.presupuesto.filter(presupuesto => 
      presupuesto.FrecuenciaDictaminada == -1 && 
      (presupuesto.NombreCuenta === null && (!presupuesto['CajaChica']?.data?.[0] || presupuesto['CajaChica']?.data?.[0] === 0))
    ).length;
    
    const totalConCuentaExtraordinarios = this.presupuesto.filter(presupuesto => 
      presupuesto.FrecuenciaDictaminada == -1 && 
      (presupuesto.NombreCuenta !== null || (presupuesto['CajaChica']?.data?.[0] === 1))
    ).length;

    this.steps[3].total = totalSinCuentaExtraordinarios;
    this.steps[3].assigned = totalConCuentaExtraordinarios;
      
      // Filtrar según el modo de filtro seleccionado
      if (this.modoFiltro === 'dictaminar') {
        // Filtrar según el filtro seleccionado para Dictaminar
        this.presupuesto = this.presupuesto.filter(presupuesto => {
          if (this.filtroSeleccionado === 'all') {
            return true; // Mostrar todos
          } else if (this.filtroSeleccionado === 'asignados') {
            return presupuesto.MontoDictaminado !== null && presupuesto.FrecuenciaDictaminada !== null;
          } else if (this.filtroSeleccionado === 'noAsignados') {
            return presupuesto.MontoDictaminado === null || presupuesto.FrecuenciaDictaminada === null;
          }
          return false;
        });
      } else if (this.modoFiltro === 'asignarCuenta') {
        // Filtrar por registros que tienen Monto y Frecuencia Dictaminados
        this.presupuesto = this.presupuesto.filter(presupuesto => 
          presupuesto.MontoDictaminado !== null && presupuesto.FrecuenciaDictaminada !== null
        );

          // Filtrar por tipo de cuenta según filtroSeleccionado
          this.presupuesto = this.presupuesto.filter(presupuesto => {
            if (this.filtroSeleccionado === 'all') {
              return true; // Mostrar todos
            } else if (this.filtroSeleccionado === 'asignados') {
              return (presupuesto.NombreCuenta !== null || (presupuesto['CajaChica'].data?.[0] === 1));
            } else if (this.filtroSeleccionado === 'noAsignados') {
              return (presupuesto.NombreCuenta === null && (presupuesto['CajaChica'].data?.[0] === 0));
            }
            return false;
          });
  
        // Aplicar subfiltros para Asignar Cuenta
        if (this.filtroAsignarCuenta === 'semanal') {
          this.presupuesto = this.presupuesto.filter(presupuesto => presupuesto.FrecuenciaDictaminada == 7);
        } else if (this.filtroAsignarCuenta === 'periodico') {
          this.presupuesto = this.presupuesto.filter(presupuesto => presupuesto.FrecuenciaDictaminada >= 14 && presupuesto.FrecuenciaDictaminada <= 180);
        } else if (this.filtroAsignarCuenta === 'extraordinario') {
          this.presupuesto = this.presupuesto.filter(presupuesto => presupuesto.FrecuenciaDictaminada == -1);
        }
      } else if (this.modoFiltro === 'presupuestoMensual') {
        this.router.navigate(['/presupuesto-mensual']);
      }
  
      console.log("esta es la data de presupuesto: ", this.presupuesto);
      this.totalPages = Math.ceil(this.presupuesto.length / this.itemsPerPage);
      this.updatePaginated();
    }, (error) => {
      console.error('Error fetching presupuesto', error); 
    });
  }
  
  
  setFilter(filtro: 'all' | 'asignados' | 'noAsignados') {
    this.filtroSeleccionado = filtro;
    this.currentPage = 1;
    this.loadPresupuesto();
  }

  setFilterCuenta(filtro: 'semanal' | 'periodico' | 'extraordinario') {
    this.filtroAsignarCuenta = filtro;
    this.currentPage = 1;
    this.loadPresupuesto();
  }
  

  updatePaginated() {
    this.totalPages = Math.ceil(this.presupuesto.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedPresupuesto = this.presupuesto.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onItemsPerPageChange() {
    this.currentPage = 1;  // Reiniciar a la página 1 cuando cambie los registros por página
    this.updatePaginatedRegistros();  // Actualizar la paginación
  }

  updatePaginatedRegistros() {
    this.totalPages = Math.ceil(this.presupuesto.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedPresupuesto = this.presupuesto.slice(startIndex, startIndex + this.itemsPerPage);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginated();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginated();
    }
  }

  applySearch() {
    this.currentPage = 1;
    
    // Asegurar que los campos de fecha están configurados correctamente
    for (let field of this.selectedFields) {
      if (this.isDateField(field) && !this.dateSearchValues[field]) {
        this.dateSearchValues[field] = { startDate: '', endDate: '' };
      }
    }
  
    this._presupuestoServ.getPresupuesto().subscribe((data: Presupuesto[]) => {
      let filteredData = data;
  
      // Filtrar según el botón seleccionado
      if (this.filtroSeleccionado === 'asignados') {
        // Filtrar solo los registros con MontoDictaminado y FrecuenciaDictaminada no nulos
        filteredData = data.filter(presupuesto => 
          presupuesto.MontoDictaminado !== null && 
          presupuesto.FrecuenciaDictaminada !== null
        );
      } else if (this.filtroSeleccionado === 'noAsignados') {
        // Filtrar solo los registros con MontoDictaminado o FrecuenciaDictaminada nulos
        filteredData = data.filter(presupuesto => 
          presupuesto.MontoDictaminado === null || 
          presupuesto.FrecuenciaDictaminada === null
        );
      }
  
      // Filtro adicional para "Asignar Cuenta"
      if (this.modoFiltro === 'asignarCuenta') {
        // Filtrar por registros que tienen Monto y Frecuencia Dictaminados
        filteredData = filteredData.filter(presupuesto => 
          presupuesto.MontoDictaminado !== null && presupuesto.FrecuenciaDictaminada !== null
        );
  
        // Aplicar subfiltros para Asignar Cuenta
        if (this.filtroAsignarCuenta === 'semanal') {
          filteredData = filteredData.filter(presupuesto => presupuesto.FrecuenciaDictaminada == 7);
        } else if (this.filtroAsignarCuenta === 'periodico') {
          filteredData = filteredData.filter(presupuesto => 
            presupuesto.FrecuenciaDictaminada >= 14 && presupuesto.FrecuenciaDictaminada <= 180
          );
        } else if (this.filtroAsignarCuenta === 'extraordinario') {
          filteredData = filteredData.filter(presupuesto => presupuesto.FrecuenciaDictaminada == -1);
        }
      }
  
      // Aplicar la búsqueda adicional
      this.presupuesto = filteredData
        .filter(presupuesto => this.matchesSearch(presupuesto))
        .map(presupuesto => ({
          ...presupuesto,
          UltimaFecha: new Date(presupuesto.UltimaFecha).toISOString().split('T')[0],
        }));
  
      console.log("Esta es la data de presupuesto después del filtro: ", this.presupuesto);
      this.totalPages = Math.ceil(this.presupuesto.length / this.itemsPerPage);
      this.updatePaginated();
    }, (error) => {
      console.error('Error fetching presupuesto', error);
    });
  }
  
  

  resetSearch() {
    this.searchValues = {};
    this.dateSearchValues = {};
    this.selectedFields = [];
    this.loadPresupuesto();
  }

  matchesSearch(presupuesto: Presupuesto): boolean {
    for (let field of this.selectedFields) {
      if (this.isDateField(field)) {
        const dateRange = this.dateSearchValues[field];
        const presupuestoDate = new Date(presupuesto[field] as string);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        
        if (endDate) {
          endDate.setDate(endDate.getDate() + 1);
        }
  
        if (startDate && presupuestoDate < startDate) {
          return false;
        }
        if (endDate && presupuestoDate >= endDate) {
          return false;
        }
      } else {
        const searchValue = this.searchValues[field];
        if (searchValue && !((presupuesto[field] as string)?.toString().includes(searchValue))) {
          return false;
        }
      }
    }
    return true;
  }

  isDateField(field: string): boolean {
    return ['UltimaFecha'].includes(field);
  }

  getFieldLabel(field: string): string {
    return this.searchFields.find(f => f.value === field)?.label || field;
  }


  getEmptyIncome(): Presupuesto {
    return {
      SegmentoID: 0,
      NombreSegmento: '',
      CategoriaID: 0,
      NombreCategoria: '',
      SubcategoriaID: 0,
      NombreSubcategoria: '',
      ConceptoID: 0,
      NombreConcepto: '',
      PromedioMonto: 0,
      PromedioPiezas: 0,
      FrecuenciaPromedio: 0,
      UltimaFecha: '',
      FrecuenciaDictaminada: 0,
      MontoDictaminado: 0,
      CuentaID: 0,
      NombreCuenta: '',
      DiaLimite: 0,
    };
  }


  async asignarMonto_Frecuencia(presupuesto?: Presupuesto) {

    console.log("estos son los datos de edicion: ", presupuesto)

    const modal = await this.modalController.create({
      component: PresupuestoModalComponent,
      componentProps: {
        presupuesto: presupuesto ? { ...presupuesto } : this.getEmptyIncome(),
        isEditMode: !!presupuesto
      }
    });
  
    modal.onDidDismiss().then((result) => {
      if (result.data && result.role === 'success') {
        this.loadPresupuesto();
      }
    });
  
    return await modal.present();
  }


  async asignarCuenta_DiaLimite(presupuesto?: Presupuesto) {

    console.log("estos son los datos de edicion en cuenta y dia limite: ", presupuesto)

    const modal = await this.modalController.create({
      component: PresupuestoCuentaModalComponent,
      componentProps: {
        presupuesto: presupuesto ? { ...presupuesto } : this.getEmptyIncome(),
        isEditMode: !!presupuesto,
        esPeriodico: this.filtroAsignarCuenta === 'periodico'
      }
    });
  
    modal.onDidDismiss().then((result) => {
      if (result.data && result.role === 'success') {
        this.loadPresupuesto();
      }
    });
  
    return await modal.present();
  }


  setModoFiltro(modo: 'dictaminar' | 'asignarCuenta' | 'presupuestoMensual') {
    this.modoFiltro = modo;
    this.filtroAsignarCuenta = 'semanal'; // Reiniciar el subfiltro
    this.currentPage = 1;
    this.loadPresupuesto();
  }
  
  setFiltroAsignarCuenta(filtro: 'semanal' | 'periodico' | 'extraordinario') {
    this.filtroAsignarCuenta = filtro;
    this.currentPage = 1;
    this.loadPresupuesto();
  }



}

