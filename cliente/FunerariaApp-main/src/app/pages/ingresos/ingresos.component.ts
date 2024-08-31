import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from "@ionic/angular";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IncomeModalComponent } from './modal/income-modal.component';
import { HttpClientModule } from '@angular/common/http';
import { IngresosServices } from 'src/app/Servicios/Ingresos.service';

interface Income {
  IngresoID: number;
  Fecha: string;
  ConceptoID: number;
  NombreConcepto: string;
  Descripcion: string;
  Proveedor: string;
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
  UsuarioRecibeID: number;
  FechaConciliacion: string;
  ObservacionesDifConciliacion: string;
}

@Component({
  selector: 'app-ingresos',
  templateUrl: './ingresos.component.html',
  styleUrls: ['./ingresos.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, IncomeModalComponent, HttpClientModule],
})
export class IngresosComponent implements OnInit {
  searchTerm: string = '';
  incomes: Income[] = [];

  constructor(private modalController: ModalController, private _ingresoServ: IngresosServices) { }

  ngOnInit() {
    this.loadIngresos();
  }

  loadIngresos() {
    this._ingresoServ.getIngresos().subscribe((data: Income[]) => {
      this.incomes = data
        .map(income => ({
          ...income,
          Fecha: new Date(income.Fecha).toISOString().split('T')[0], // Formatear la fecha
          FechaAutorizacion: new Date(income.FechaAutorizacion).toISOString().split('T')[0], // Formatear la fecha
          FechaConciliacion: new Date(income.FechaConciliacion).toISOString().split('T')[0] // Formatear la fecha
        }))
        .sort((a, b) => b.IngresoID - a.IngresoID); // Ordenar de más reciente a más antiguo
  
      console.log("esta es la data de ingresos: ", this.incomes);
    }, (error) => {
      console.error('Error fetching incomes', error); 
    });
  }
  
  

  filteredIncomes(): Income[] {
    return this.incomes.filter(income => {
      const searchTermLower = this.searchTerm.toLowerCase();
      const NombreConcepto = income.NombreConcepto ? income.NombreConcepto.toLowerCase() : '';
      const Proveedor = income.Proveedor ? income.Proveedor.toLowerCase() : '';
      const Descripcion = income.Descripcion ? income.Descripcion.toLowerCase() : '';
      const NombreSegmento = income.NombreSegmento ? income.NombreSegmento.toLowerCase() : '';
      const NombreCategoria = income.NombreCategoria ? income.NombreCategoria.toLowerCase() : '';
      const NombreSubcategoria = income.NombreSubcategoria ? income.NombreSubcategoria.toLowerCase() : '';
      const NombreEstatus = income.NombreEstatus ? income.NombreEstatus.toLowerCase() : '';

      return (
        NombreConcepto.includes(searchTermLower) ||
        Proveedor.includes(searchTermLower) ||
        Descripcion.includes(searchTermLower) ||
        NombreSegmento.includes(searchTermLower) ||
        NombreCategoria.includes(searchTermLower) ||
        NombreSubcategoria.includes(searchTermLower) ||
        NombreEstatus.includes(searchTermLower) ||
        income.Fecha.includes(this.searchTerm) ||
        income.Monto.toString().includes(this.searchTerm) ||
        income.Saldo.toString().includes(this.searchTerm)
      );
    });
  }

  async openModal(income?: Income) {
    const modal = await this.modalController.create({
      component: IncomeModalComponent,
      componentProps: {
        ingreso: income ? { ...income } : this.getEmptyIncome(),
        isEditMode: !!income
      }
    });
  
    modal.onDidDismiss().then((result) => {
      if (result.data && result.role === 'success') {
        this.loadIngresos();
      }
    });
  
    return await modal.present();
  }
  
  
  getEmptyIncome(): Income {
    return {
      IngresoID: 0,
      Fecha: '',
      ConceptoID: 0,
      NombreConcepto: '',
      Descripcion: '',
      Proveedor: '',
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
      UsuarioRecibeID: 0,
      FechaConciliacion: '',
      ObservacionesDifConciliacion: ''
    };
  }
}
