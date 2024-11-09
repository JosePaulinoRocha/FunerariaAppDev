import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, AlertController } from "@ionic/angular";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PresupuestoMensualFrecuenciaServices } from 'src/app/Servicios/Presupuesto-mensual-frecuencia.service';
import { PresupuestoMensualCuentasServices } from 'src/app/Servicios/Presupuesto-mensual-cuenta.service';
import { PresupuestoCuentasModalComponent } from './modal/presupuesto-cuenta-modal.component';
import { Router } from '@angular/router'
import { PresupuestoServices } from 'src/app/Servicios/Presupuesto.service';
import { IngresosServices } from 'src/app/Servicios/Ingresos.service';


interface PresupuestoSemanal {
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
  PeriodoID: number | null;
  PeriodoCongelado: string | null;
  [key: string]: any; // Permite la extensión de la interfaz con otros campos si es necesario
}


interface GastoMensualPorFrecuencia {
  SegmentoID: number;
  NombreSegmento: string;
  CategoriaID: number;
  NombreCategoria: string;
  SubcategoriaID: number;
  NombreSubcategoria: string;
  ConceptoID: number;
  NombreConcepto: string;
  MontoDictaminado: number;
  FrecuenciaDictaminada: number;
  CuentaID: number | null;
  NombreCuenta: string | null;
  CajaChica: { data: number[]; type: string; };
  DiaLimite: number | null;
  PromedioMonto: number | null;
  PromedioPiezas: number | null;
  FrecuenciaPromedio: number | null;
  UltimaFecha: string | null;  // Fecha en formato ISO
  FechaSiguienteGasto: string | null;  // Fecha en formato ISO
  DiasPendientes: number | null;
  PeriodoID: number | null;
  PeriodoCongelado: string | null; // Rango de fecha como "YYYY-MM-DD al YYYY-MM-DD"
  Guardado: number;
  [key: string]: any;
}

interface Gastos {
  GastoID: number;
  FechaPreautorizada: string;
  Concepto: string;
  Monto: number;
  ProveedorID: number;
  NombreProveedor: string;
  SegmentoID: number;
  NombreSegmento: string;
  EstatusPresupuestoID: number;
  Estatus: string;
  CuentaID: number;
  TipoCuentaID: number;
  TipoCuenta: string;
  NombreCuenta: string;
  RFC: string;
  Fecha: string;
  CategoriaID: number;
  NombreCategoria: string;
  SubcategoriaID: number;
  NombreSubcategoria: string;
  ConceptoID: number;
  NombreConcepto: string;
  [key: string]: any;
}


interface GastoPresupuestoFrecuenciaGuardados {
  GastoFrecuenciaID: number;
  SegmentoID: number;
  CategoriaID: number;
  SubcategoriaID: number;
  ConceptoID: number;
  PromedioMonto: number;
  FrecuenciaPromedio: number;
  FrecuenciaDictaminada: number;
  MontoDictaminado: number;
  CuentaID: number;
  CajaChica: { data: number[]; type: string; }; 
  UltimaFecha: string;  
  DiaLimite: number;
  DiasPendientes: number;
  PeriodoID: number;
}


interface Cuenta {
  CuentaID: number;
  TipoCuentaID: number;
  NombreCuenta: string;
  RFC: string;
}



@Component({
  selector: 'app-presupuesto-mensual-cuentas',
  templateUrl: './presupuesto-mensual-cuentas.component.html',
  styleUrls: ['./presupuesto-mensual-cuentas.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class PresupuestoMensualCuentasComponent  implements OnInit {

  cuentaIDTemporal: number | null = null;

  private resumenInicialCuenta: any = null;

  gastosSeleccionados: any[] = []; // Lista de gastos seleccionados

  cuentaSeleccionada: any | null = null;

  showBancosView = false;
  cuentasBancarias: any[] = [];

  selectedCardIndex: number = 0;

  currentStep: number = 3;
  totalSteps: number = 4;

  cuenta: Cuenta[] = [];
  presupuestoSemanal: PresupuestoSemanal[] = [];
  gastos: Gastos[] = [];
  gastoPresupuestoFrecuenciaGuardados: GastoPresupuestoFrecuenciaGuardados[] = [];
  gastoMensualFrecuencia: GastoMensualPorFrecuencia[] = [];
  paginatedGastos: GastoMensualPorFrecuencia[] = [];
  paginatedPresupuestoSemanal: PresupuestoSemanal[] = [];
  paginatedPresupuestoExtraordinario: Gastos[] = [];
  currentPageSemanales: number = 1;
  currentPage: number = 1;
  currentPageExtraodrinarios: number = 1;
  itemsPerPageSemanales: number = 10;
  itemsPerPage: number = 10;
  itemsPerPageExtraordinarios: number = 10;
  totalPages: number = 0;
  totalPagesExtraordinario: number = 0;
  totalPagesSemanales: number = 0;
  isAdmin: boolean = false;
  reintegracionesData: any[] = [];
  itemsPerPageOptionsSemanales: number[] = [10, 20, 50, 100, 200, 500, 1000, 2000];
  itemsPerPageOptions: number[] = [10, 20, 50, 100, 200, 500, 1000, 2000];
  itemsPerPageOptionsExtraordinarios: number[] = [10, 20, 50, 100, 200, 500, 1000, 2000];

  filtroSeleccionado: 'all' | 'guardados' | 'noGuardados' = 'all'; 

  setFilter(filtro: 'all' | 'guardados' | 'noGuardados' ) {
    this.filtroSeleccionado = filtro;
    this.currentPage = 1;
    this.loadGastosMensualesFrecuencia();
  }


  onCheckboxChange(gastos: Gastos, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    const { CategoriaID, NombreCategoria, Monto } = gastos;

    if (isChecked) {
        // Añadir el gasto al resumen
        this.gastosSeleccionados.push(gastos);
    } else {
        // Eliminar el gasto del resumen
        this.gastosSeleccionados = this.gastosSeleccionados.filter(
            g => g.GastoID !== gastos.GastoID
        );
    }

    // Actualizar el resumen del banco seleccionado después del cambio
    this.actualizarResumenBancoSeleccionado();
  }


  actualizarResumenBancoSeleccionado() {
    if (!this.cuentaSeleccionada) return;

    // Clonar profundamente las categorías de los gastos seleccionados en un mapa
    const categoriasMap: { [key: number]: { NombreCategoria: string; Presupuesto: number } } = {};

    // Primero, agregar o actualizar las categorías de los gastos seleccionados
    this.gastosSeleccionados.forEach(gasto => {
        const { CategoriaID, NombreCategoria, Monto } = gasto;
        const montoNumerico = parseFloat(Monto);

        if (!CategoriaID) {
            console.warn(`Gasto sin CategoriaID: ${NombreCategoria}`);
        }

        console.log(`Procesando gasto: CategoriaID = ${CategoriaID}, NombreCategoria = ${NombreCategoria}, Monto = ${Monto}`);

        // Si la categoría ya existe en el mapa, sumamos el monto; si no, la creamos
        if (categoriasMap[CategoriaID]) {
            categoriasMap[CategoriaID].Presupuesto += montoNumerico;
        } else {
            categoriasMap[CategoriaID] = {
                NombreCategoria,
                Presupuesto: montoNumerico
            };
        }
    });

    // Luego, agregar las categorías del resumen inicial (sin reemplazar las ya existentes)
    if (this.resumenInicialCuenta) {
        this.resumenInicialCuenta.categorias.forEach((categoria: any) => {
            console.log(`Procesando categoria inicial: CategoriaID = ${categoria.CategoriaID}, NombreCategoria = ${categoria.NombreCategoria}, Presupuesto = ${categoria.Presupuesto}`);

            // Si la categoría ya existe, no la sobreescribimos, solo sumamos el presupuesto
            if (!categoriasMap[categoria.CategoriaID]) {
                categoriasMap[categoria.CategoriaID] = {
                    NombreCategoria: categoria.NombreCategoria,
                    Presupuesto: categoria.Presupuesto
                };
            } else {
                // Si la categoría ya existe en el mapa, sumamos los presupuestos
                categoriasMap[categoria.CategoriaID].Presupuesto += categoria.Presupuesto;
            }
        });
    }

    // Convertir el mapa de categorías a un arreglo y asignarlo a la cuenta seleccionada
    this.cuentaSeleccionada.categorias = Object.values(categoriasMap);

    // Calcular el total del presupuesto sumando los montos de todas las categorías
    this.cuentaSeleccionada.totalPresupuesto = this.cuentaSeleccionada.categorias.reduce(
        (total: any, categoria: any) => total + categoria.Presupuesto,
        0
    );

    console.log('Categorías finales:', this.cuentaSeleccionada.categorias);
    console.log('Total presupuesto:', this.cuentaSeleccionada.totalPresupuesto);
  }


  onCuentaChange() {
    if (this.cuentaSeleccionada) {
        // Guardar el CuentaID seleccionado temporalmente
        this.cuentaIDTemporal = this.cuentaSeleccionada.CuentaID;

        // Generar y guardar el resumen inicial de la cuenta seleccionada
        this.generarResumenCuentaSeleccionada(this.cuentaSeleccionada.CuentaID);
        this.resumenInicialCuenta = JSON.parse(JSON.stringify(this.cuentaSeleccionada)); // Clonar el resumen inicial
    }
  }
  

  generarResumenCuentaSeleccionada(cuentaID: number) {
    console.log("Generating resumen for cuentaID:", cuentaID);
    const cuentasMap: { [key: string]: any } = {};

    // Solo combinar los datos de las cuentas relacionadas con esta cuenta seleccionada
    const dataCombinada = [...this.presupuestoSemanal, ...this.gastos, ...this.gastoMensualFrecuencia].filter((item) => item.CuentaID === cuentaID);

    dataCombinada.forEach((item) => {
        console.log("Processing item for cuenta:", item);
        if (item.CuentaID && item.NombreCuenta) {
            if (!cuentasMap[item.CuentaID]) {
                cuentasMap[item.CuentaID] = {
                    NombreCuenta: item.NombreCuenta,
                    categorias: {},
                    totalPresupuesto: 0
                };
            }
            const cuenta = cuentasMap[item.CuentaID];

            // Verificamos que CategoriaID esté presente antes de seguir adelante
            if (!item.CategoriaID) {
                console.warn(`El item no tiene CategoriaID: ${item.NombreCategoria}`);
            }

            // Aseguramos que la categoría tenga un CategoriaID
            if (!cuenta.categorias[item.CategoriaID]) {
                cuenta.categorias[item.CategoriaID] = {
                    CategoriaID: item.CategoriaID, // Aseguramos que el CategoriaID esté aquí
                    NombreCategoria: item.NombreCategoria,
                    Presupuesto: 0
                };
            }

            const monto = parseFloat(item.Monto ?? item.MontoDictaminado) || 0;
            cuenta.categorias[item.CategoriaID].Presupuesto += monto;
            cuenta.totalPresupuesto += monto;
            console.log(`Updated Presupuesto for categoria ${item.CategoriaID}:`, cuenta.categorias[item.CategoriaID].Presupuesto);
        }
    });

    const cuentaSeleccionada = Object.values(cuentasMap).find(cuenta => cuenta.NombreCuenta === this.cuentaSeleccionada.NombreCuenta);

    if (cuentaSeleccionada) {
        this.cuentaSeleccionada = {
            ...cuentaSeleccionada,
            categorias: Object.values(cuentaSeleccionada.categorias)
        };
        console.log("Resumen para la cuenta seleccionada:", this.cuentaSeleccionada);
    } else {
        console.warn(`No se encontró cuenta con NombreCuenta: ${this.cuentaSeleccionada.NombreCuenta}`);
    }
  }


  toggleBancosView() {
    this.showBancosView = !this.showBancosView;
    if (this.showBancosView) {
      this.generarResumenCuentasBancarias();
    }
  }


  generarResumenCuentasBancarias() {
    const cuentasMap: { [key: string]: any } = {};

    const dataCombinada = [...this.presupuestoSemanal, ...this.gastos, ...this.gastoMensualFrecuencia];

    dataCombinada.forEach((item) => {
      if (item.CuentaID && item.NombreCuenta) {
        if (!cuentasMap[item.CuentaID]) {
          cuentasMap[item.CuentaID] = {
            NombreCuenta: item.NombreCuenta,
            categorias: {},
            totalPresupuesto: 0
          };
        }
        const cuenta = cuentasMap[item.CuentaID];

        if (!cuenta.categorias[item.CategoriaID]) {
          cuenta.categorias[item.CategoriaID] = {
            NombreCategoria: item.NombreCategoria,
            Presupuesto: 0
          };
        }

        // Convertir a número antes de sumar
        const monto = Number('Monto' in item ? item.Monto : item.MontoDictaminado) || 0;

        // Actualizar el presupuesto de la categoría y el total de la cuenta
        cuenta.categorias[item.CategoriaID].Presupuesto += monto;
        cuenta.totalPresupuesto += monto;
      }
    });

    this.cuentasBancarias = Object.values(cuentasMap).map(cuenta => ({
      ...cuenta,
      categorias: Object.values(cuenta.categorias)
    }));
  }

  nextStep() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    
    if (user && user.userId) {
      const userId = user.userId;
  
      // Si estamos en el último paso
      if (this.currentStep === this.totalSteps - 1) {
        // Insertar el paso como 0 y redirigir a /home
        // this._presupuestoServ.insertPasoUsuario(userId, 0).subscribe(
        //   () => {
            this.router.navigate(['/home']); // Redirigir al usuario a la ruta /home
            this.currentStep = 0; // Restablecer el paso actual a 0
            this.selectedCardIndex = 0;
        //   },
        //   (error) => {
        //     this.presentAlert('Error al actualizar el paso del usuario');
        //   }
        // );
      } else {
        // Continuar con la lógica actual para avanzar al siguiente paso
        // this._presupuestoServ.insertPasoUsuario(userId, this.currentStep + 1).subscribe(
        //   () => {
            this.currentStep++; // Avanza al siguiente paso
            this.selectedCardIndex = this.currentStep; // Actualiza el índice del card seleccionado
        //   },
        //   (error) => {
        //     this.presentAlert('Error al insertar el paso del usuario');
        //   }
        // );
      }
    }
  }

  onItemsPerPageChangeSemanales() {
    this.currentPageSemanales = 1;  // Reiniciar a la página 1 cuando cambie los registros por página
    this.updatePaginatedRegistrosSemanales();  // Actualizar la paginación de gastos de frecuencia
  }

  onItemsPerPageChange() {
    this.currentPage = 1;  // Reiniciar a la página 1 cuando cambie los registros por página
    this.updatePaginatedGastos();  // Actualizar la paginación de gastos de frecuencia
  }

  onItemsPerPageChangeExtraordinarios() {
    this.currentPageExtraodrinarios = 1;  // Reiniciar a la página 1 cuando cambie los registros por página
    this.updatePaginatedRegistros();  // Actualizar la paginación de gastos extraordinarios
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

  getStepTitle(step: number): string {
    switch (step) {
      case 0:
        return '1. Congelar semanas del mes';
      case 1:
        return '2. Asignar presupuesto extraordinario mensual';
      case 2:
        return '3. Asignar gastos mensuales por frecuencia';
      case 3:
        return '4. Asignacion de cuentas bancarias';
      default:
        return '';
    }
  }

  // Search variables
  searchFields = [
    { value: 'NombreSegmento', label: 'Segmento' },
    { value: 'NombreCategoria', label: 'Categoria' },
    { value: 'NombreSubcategoria', label: 'Subcategoria' },
    { value: 'NombreConcepto', label: 'Concepto' },
    { value: 'PromedioMonto', label: 'Monto Promedio' },
    { value: 'FrecuenciaPromedio', label: 'Frecuencia Promedio' },
    { value: 'FrecuenciaDictaminada', label: 'Frecuencia Dictaminada' },
    { value: 'MontoDictaminado', label: 'Monto Dictaminado' },
    { value: 'UltimaFecha', label: 'Fecha Ultimo Gasto' },
    { value: 'DiaLimite', label: 'Dia Limite' },
    { value: 'DiasPendientes', label: 'Dias Pendientes' },
  ];

  getEmptyIncome(): GastoMensualPorFrecuencia {
    return {
      SegmentoID: 0,
      NombreSegmento: '',
      CategoriaID: 0,
      NombreCategoria: '',
      SubcategoriaID: 0,
      NombreSubcategoria: '',
      ConceptoID: 0,
      NombreConcepto: '',
      MontoDictaminado: 0,
      FrecuenciaDictaminada: 0,
      CuentaID: 0,
      NombreCuenta: '',
      CajaChica: { data: [], type: '' },
      DiaLimite: 0,
      PromedioMonto: 0,
      PromedioPiezas: 0,
      FrecuenciaPromedio: 0,
      UltimaFecha: '',  // Fecha en formato ISO
      FechaSiguienteGasto: '',  // Fecha en formato ISO
      DiasPendientes: 0,
      PeriodoID: 0,
      PeriodoCongelado: '',
      Guardado: 0,
    };
  }

  selectedFields: string[] = [];
  searchValues: { [key: string]: string } = {};
  dateSearchValues: { [key: string]: { startDate: string, endDate: string } } = {};

  constructor( private alertController: AlertController ,private _presupuestoMensualCuentasServ: PresupuestoMensualCuentasServices ,private modalController: ModalController, private _presupuestoMensualFrecuenciaServ: PresupuestoMensualFrecuenciaServices, private router: Router, private _presupuestoServ: PresupuestoServices, private _ingresoServ: IngresosServices) {}


  ngOnInit() {
    this.loadGastosMensualesFrecuencia();
    this.checkAdminStatus();
    this.loadGastoMensualExtraordinario();
    this.loadPresupuestoSemanal();
    this.loadCuentas();
  }


  loadCuentas() {
    this._ingresoServ.getCuentas().subscribe(
      (data: Cuenta[]) => {
        this.cuenta = data.filter(cuenta => cuenta.TipoCuentaID === 2);
        console.log('Esta es mi data en cuentas: ', this.cuenta);
      },
      (error) => {
        console.error('Error fetching cuentas', error);
      }
    );
  }
  


  loadPresupuestoSemanal() {
    this._presupuestoServ.getPresupuestoSemanal().subscribe((data: PresupuestoSemanal[]) => {
      // Transformar la fecha y asignar la data inicial
      this.presupuestoSemanal = data.map(presupuestoSemanal => ({
        ...presupuestoSemanal,
        UltimaFecha: new Date(presupuestoSemanal.UltimaFecha).toISOString().split('T')[0],
        PeriodoCongelado: presupuestoSemanal.PeriodoCongelado ? this.formatPeriodoCongelado(presupuestoSemanal.PeriodoCongelado) : null
      }));
  
      console.log("esta es la data de presupuesto semanal: ", this.presupuestoSemanal);
      this.totalPagesSemanales = Math.ceil(this.presupuestoSemanal.length / this.itemsPerPage);
      this.updatePaginatedRegistrosSemanales();
    }, (error) => {
      console.error('Error fetching presupuesto', error); 
    });
  }


  loadGastoMensualExtraordinario() {
    this._presupuestoServ.getGastoMensualSemanalAprobado().subscribe((data: Gastos[]) => {
  
      // Ordenar y formatear los datos
      data.sort((a, b) => b.GastoID - a.GastoID);
      this.gastos = data.map(gastos => ({
        ...gastos,
        FechaPreautorizada: new Date(gastos.FechaPreautorizada).toISOString().split('T')[0],
        Fecha: new Date(gastos.Fecha).toISOString().split('T')[0],
      }));
  
      console.log("Esta es la data de gastos mensuales extraordinarios: ", this.gastos);
      this.totalPagesExtraordinario = Math.ceil(this.gastos.length / this.itemsPerPage);
      this.updatePaginatedRegistros();
    }, (error) => {
      console.error('Error fetching presupuesto', error);
    });
  }

  checkAdminStatus() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.isAdmin = user.isAdmin === 1;
  }


  loadGastosMensualesFrecuencia() {
    this._presupuestoMensualFrecuenciaServ.getPresupuestoMensualFrecuenciaAprobados().subscribe((data: GastoMensualPorFrecuencia[]) => {
  
      // Formatear datos
      this.gastoMensualFrecuencia = data.map(gasto => ({
        ...gasto,
        UltimaFecha: gasto.UltimaFecha ? new Date(gasto.UltimaFecha).toISOString().split('T')[0] : null,
        PeriodoCongelado: gasto.PeriodoCongelado ? this.formatPeriodoCongelado(gasto.PeriodoCongelado) : null
      }));
  
      console.log("Esta es la data de gastos mensuales por frecuencia: ", this.gastoMensualFrecuencia);
      this.totalPages = Math.ceil(this.gastoMensualFrecuencia.length / this.itemsPerPage);
      this.updatePaginatedGastos();
    }, (error) => {
      console.error('Error fetching incomes', error);
    });
  }
  
  
  formatPeriodoCongelado(periodo: string): string {
    const [start, end] = periodo.split(' al ');
  
    let fechaInicio = new Date(start);
    let fechaFin = new Date(end);
  
    // Ajustamos las fechas sumando un día
    fechaInicio.setDate(fechaInicio.getDate() + 1);
    fechaFin.setDate(fechaFin.getDate() + 1);
  
    // Formato manual para cada fecha
    const fechaInicioFormateada = `${this.getDiaSemana(fechaInicio)}, ${fechaInicio.getDate()} de ${this.getMesNombre(fechaInicio)} del ${fechaInicio.getFullYear()}`;
    const fechaFinFormateada = `${this.getDiaSemana(fechaFin)}, ${fechaFin.getDate()} de ${this.getMesNombre(fechaFin)} del ${fechaFin.getFullYear()}`;
  
    return `${fechaInicioFormateada} a ${fechaFinFormateada}`;
  }
  
  // Función para obtener el nombre del día en español
  getDiaSemana(fecha: Date): string {
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return dias[fecha.getDay()];
  }
  
  // Función para obtener el nombre del mes en español
  getMesNombre(fecha: Date): string {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return meses[fecha.getMonth()];
  }


 
  // --------------------------paginado de gastos semanales--------------------------------
  
  updatePaginatedRegistrosSemanales() {
    this.totalPagesSemanales = Math.ceil(this.presupuestoSemanal.length / this.itemsPerPageSemanales);
    const startIndex = (this.currentPageSemanales - 1) * this.itemsPerPageSemanales;
    this.paginatedPresupuestoSemanal = this.presupuestoSemanal.slice(startIndex, startIndex + this.itemsPerPageSemanales);
  }

  prevPageSemanales() {
    if (this.currentPageSemanales > 1) {
      this.currentPageSemanales--;
      this.updatePaginatedRegistrosSemanales();
    }
  }

  nextPageSemanales() {
    if (this.currentPageSemanales < this.totalPagesSemanales) {
      this.currentPageSemanales++;
      this.updatePaginatedRegistrosSemanales();
    }
  }

  // --------------------------paginado de gastos semanales--------------------------------


  // --------------------------paginado de gastos extraorinarios--------------------------------
  

  updatePaginatedRegistros() {
    this.totalPagesExtraordinario = Math.ceil(this.gastos.length / this.itemsPerPageExtraordinarios);
    const startIndex = (this.currentPageExtraodrinarios - 1) * this.itemsPerPageExtraordinarios;
    this.paginatedPresupuestoExtraordinario = this.gastos.slice(startIndex, startIndex + this.itemsPerPageExtraordinarios);
  }

  prevPageExtraordinarios() {
    if (this.currentPageExtraodrinarios > 1) {
      this.currentPageExtraodrinarios--;
      this.updatePaginatedRegistros();
    }
  }

  nextPageExtraordinarios() {
    if (this.currentPageExtraodrinarios < this.totalPages) {
      this.currentPageExtraodrinarios++;
      this.updatePaginatedRegistros();
    }
  }

  // --------------------------paginado de gastos extraorinarios--------------------------------


  // --------------------------paginado de gastos por frecuencia--------------------------------

  updatePaginatedGastos() {
    this.totalPages = Math.ceil(this.gastoMensualFrecuencia.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedGastos = this.gastoMensualFrecuencia.slice(startIndex, startIndex + this.itemsPerPage);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedGastos();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedGastos();
    }
  }

  // --------------------------paginado de gastos por frecuencia--------------------------------


applySearch() {
  this.currentPage = 1;
  
  // Asegurar que los campos de fecha están configurados correctamente
  for (let field of this.selectedFields) {
    if (this.isDateField(field) && !this.dateSearchValues[field]) {
      this.dateSearchValues[field] = { startDate: '', endDate: '' };
    }
  }

  this._presupuestoMensualFrecuenciaServ.getPresupuestoMensualFrecuencia().subscribe((data: GastoMensualPorFrecuencia[]) => {
    let filteredData = data
      .filter(gasto => {
        switch (this.filtroSeleccionado) {
          case 'guardados':
            return gasto.Guardado === 1;
          case 'noGuardados':
            return gasto.Guardado === 0;
          case 'all':
          default:
            return true;
        }
      })
      .filter(gastoMensualFrecuencia => this.matchesSearch(gastoMensualFrecuencia)); // Filtrar según criterios adicionales de búsqueda

      if (this.filtroSeleccionado === 'all') {
        filteredData.sort((a, b) => a.Guardado - b.Guardado);
      }

      // Formatear datos
      this.gastoMensualFrecuencia = filteredData.map(gastoMensualFrecuencia => ({
        ...gastoMensualFrecuencia,
        UltimaFecha: gastoMensualFrecuencia.UltimaFecha ? new Date(gastoMensualFrecuencia.UltimaFecha).toISOString().split('T')[0] : null,
        PeriodoCongelado: gastoMensualFrecuencia.PeriodoCongelado ? this.formatPeriodoCongelado(gastoMensualFrecuencia.PeriodoCongelado) : null
      }));

      console.log("Esta es la data de gastos después del filtro: ", this.gastoMensualFrecuencia);
      this.totalPages = Math.ceil(this.gastoMensualFrecuencia.length / this.itemsPerPage);
      this.updatePaginatedGastos();
    }, (error) => {
      console.error('Error fetching presupuesto', error);
    });
  }


  resetSearch() {
    this.searchValues = {};
    this.dateSearchValues = {};
    this.selectedFields = [];
    this.loadGastosMensualesFrecuencia();
  }

  matchesSearch(gastoMensualFrecuencia: GastoMensualPorFrecuencia): boolean {
    for (let field of this.selectedFields) {
      if (this.isDateField(field)) {
        const dateRange = this.dateSearchValues[field];
        const gastosDate = new Date(gastoMensualFrecuencia[field] as string);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        
        // Incrementar la fecha final en 1 día para incluir el último día en el rango
        if (endDate) {
          endDate.setDate(endDate.getDate() + 1);
        }
  
        if (startDate && gastosDate < startDate) {
          return false;
        }
        if (endDate && gastosDate >= endDate) {
          return false;
        }
      } else {
        const searchValue = this.searchValues[field];
        if (searchValue && !((gastoMensualFrecuencia[field] as string)?.toString().includes(searchValue))) {
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

  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }


  async actualizarCuentaSeleccionada() {
    const cuentaID = this.cuentaIDTemporal ?? this.cuentaSeleccionada?.CuentaID;
  
    if (!cuentaID || this.gastosSeleccionados.length === 0) {
      console.warn('Cuenta seleccionada no válida o no hay gastos seleccionados');
      await this.presentAlert('Cuenta seleccionada no válida o no hay gastos seleccionados.');
      return;
    }
  
    this._presupuestoMensualCuentasServ.actualizarGastosSeleccionados(this.gastosSeleccionados, cuentaID)
      .subscribe(
        async response => {
          console.log('Respuesta del servidor:', response);
          this.loadGastoMensualExtraordinario();  // Recargar los datos

          this.cuentaSeleccionada = null;
          this.cuentaIDTemporal = null; 
  
          const alert = await this.alertController.create({
            header: 'Éxito',
            message: 'Se han actualizado las cuentas correctamente.',
            buttons: ['OK']
          });
          await alert.present();
        },
        async error => {
          console.error('Error al actualizar los gastos:', error);
          await this.presentAlert('Error al actualizar los gastos. Por favor, inténtalo de nuevo.');
        }
      );
  }
  
  
}
