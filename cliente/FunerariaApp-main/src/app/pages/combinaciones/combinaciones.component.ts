import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from "@ionic/angular";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CombinacionesServices } from 'src/app/Servicios/Combinaciones.service';

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
  FechaModificacion: string;
  validado: boolean;
  [key: string]: any;
}

@Component({
  selector: 'app-combinaciones',
  templateUrl: './combinaciones.component.html',
  styleUrls: ['./combinaciones.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class CombinacionesComponent  implements OnInit {
  combinaciones: Combinacion[] = [];
  paginatedCombinaciones: Combinacion[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 0;
  isAdmin: boolean = false;

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

  // Search variables
  searchFields = [
    { value: 'CombinacionID', label: 'ID' },
    { value: 'NombreConcepto', label: 'Concepto' },
    { value: 'NombreSegmento', label: 'Segmento' },
    { value: 'NombreCategoria', label: 'Categoria' },
    { value: 'NombreSubcategoria', label: 'Subcategoria' },
    { value: 'FechaModificacion', label: 'Fecha' },
    { value: 'validado', label: 'Validado' },
  ];
  selectedFields: string[] = [];
  searchValues: { [key: string]: string } = {};
  dateSearchValues: { [key: string]: { startDate: string, endDate: string } } = {};

  constructor(private modalController: ModalController, private _combinacionServ: CombinacionesServices) {}

  ngOnInit() {
    this.loadCombinaciones();
    this.checkAdminStatus();
  }

  checkAdminStatus() {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.isAdmin = user.isAdmin === 1;
  }

  loadCombinaciones() {
    this._combinacionServ.getCombinaciones().subscribe((data: Combinacion[]) => {
      // Ordenar los datos por IngresoID en orden descendente
      data.sort((a, b) => b.CombinacionID - a.CombinacionID);
  
      this.combinaciones = data.map(combinacion => ({
        ...combinacion,
        FechaModificacion: new Date(combinacion.FechaModificacion).toISOString().split('T')[0], // Formatear la fecha
      }));
      
      console.log("esta es la data de combinaciones: ", this.combinaciones);
      this.totalPages = Math.ceil(this.combinaciones.length / this.itemsPerPage);
      this.updatePaginatedCombinaciones();
    }, (error) => {
      console.error('Error fetching incomes', error); 
    });
  }

  updatePaginatedCombinaciones() {
    this.totalPages = Math.ceil(this.combinaciones.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedCombinaciones = this.combinaciones.slice(startIndex, startIndex + this.itemsPerPage);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedCombinaciones();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedCombinaciones();
    }
  }

  applySearch() {
    // Asegurarse de que dateSearchValues tenga valores predeterminados para campos de fecha
    for (let field of this.selectedFields) {
      if (this.isDateField(field) && !this.dateSearchValues[field]) {
        this.dateSearchValues[field] = { startDate: '', endDate: '' };
      }
    }
  
    this._combinacionServ.getCombinaciones().subscribe((data: Combinacion[]) => {
      this.combinaciones = data
        .filter(combinacion => this.matchesSearch(combinacion))
        .sort((a, b) => b.CombinacionID - a.CombinacionID) // Ordenar los datos por IngresoID en orden descendente
        .map(combinacion => ({
          ...combinacion,
          Fecha: new Date(combinacion.FechaModificacion).toISOString().split('T')[0], // Formatear la fecha
        }));
      this.totalPages = Math.ceil(this.combinaciones.length / this.itemsPerPage);
      this.updatePaginatedCombinaciones();
    });
  }

  resetSearch() {
    this.searchValues = {};
    this.dateSearchValues = {};
    this.selectedFields = [];
    this.loadCombinaciones();
  }

  matchesSearch(combinacion: Combinacion): boolean {
    for (let field of this.selectedFields) {
      if (this.isDateField(field)) {
        const dateRange = this.dateSearchValues[field];
        const combinacionDate = new Date(combinacion[field] as string);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        
        // Incrementar la fecha final en 1 día para incluir el último día en el rango
        if (endDate) {
          endDate.setDate(endDate.getDate() + 1);
        }
  
        if (startDate && combinacionDate < startDate) {
          return false;
        }
        if (endDate && combinacionDate >= endDate) {
          return false;
        }
      } else {
        const searchValue = this.searchValues[field];
        if (searchValue && !((combinacion[field] as string)?.toString().includes(searchValue))) {
          return false;
        }
      }
    }
    return true;
  }

  isDateField(field: string): boolean {
    return ['FechaModificacion'].includes(field);
  }

  getFieldLabel(field: string): string {
    return this.searchFields.find(f => f.value === field)?.label || field;
  }

  validarCombinacion(combinacionID: number, validado: boolean) {
    const mensaje = validado 
      ? '¿Desea anular esta combinación?' 
      : '¿Desea validar esta combinación?';
  
    if (confirm(mensaje)) {
      this._combinacionServ.updateCombinacionValidado(combinacionID, !validado).subscribe({
        next: () => {
          // Actualizar la lista de combinaciones después de la validación/anulación
          this.combinaciones = this.combinaciones.map(combinacion => 
            combinacion.CombinacionID === combinacionID ? { ...combinacion, validado: !validado } : combinacion
          );
          this.updatePaginatedCombinaciones();
          console.log(`Combinación ${!validado ? 'validada' : 'anulada'} exitosamente.`);
        },
        error: (err) => {
          console.error(`Error al ${!validado ? 'validar' : 'anular'} la combinación:`, err);
        }
      });
    }
  }

  eliminarCombinacion(combinacionID: number) {
    const mensaje = "Desea eliminar esta combinacion?";
  
    if (confirm(mensaje)) {
      this._combinacionServ.deleteCombinaciones(combinacionID).subscribe({
        next: () => {
          this.loadCombinaciones();
          this.updatePaginatedCombinaciones();
          alert('Se realizó la eliminacion exitosamente');
          console.log(`Combinación eliminada exitosamente.`);
        },
        error: (err: any) => {
          console.error(`Error al eliminar la combinación:`, err);
          alert('Error: Algo salio mal');
        }
      });
    }
  }
  
  
}
