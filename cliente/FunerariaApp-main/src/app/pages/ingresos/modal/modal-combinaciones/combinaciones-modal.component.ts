import { Component, Input, OnInit } from '@angular/core';
import { IngresosServices } from '../../../../Servicios/Ingresos.service';
import { ModalController, IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

@Component({
  selector: 'app-combinaciones-modal',
  templateUrl: './combinaciones-modal.component.html',
  styleUrls: ['./combinaciones-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class CombinacionesModalComponent implements OnInit {
    
    @Input() segmentoId: number = 0;
    filteredCombinaciones: Combinacion[] = [];
    combinaciones: Combinacion[] = [];
    searchTerm: string = '';

    constructor(
        public modalController: ModalController,
        private _ingresoServ: IngresosServices,
        private alertController: AlertController
    ) {}
       

  ngOnInit() {
    this.loadCombinacionesSegmento();

    // console.log("SegmentoID recibido en el modal: ", this.segmentoId);
  }

  loadCombinacionesSegmento() {
    this._ingresoServ.getCombinacionesSegmento(this.segmentoId).subscribe(combinaciones => {
      this.combinaciones = combinaciones;
      this.filteredCombinaciones = combinaciones;
      // console.log('Combinaciones filtradas por segmentoId en el submodal: ', combinaciones);
    });
  }

  filterCombinaciones() {
    const term = this.searchTerm.toLowerCase();
    this.filteredCombinaciones = this.combinaciones.filter(combinacion => 
      combinacion.NombreCategoria.toLowerCase().includes(term) || 
      combinacion.NombreSubcategoria.toLowerCase().includes(term) || 
      combinacion.NombreConcepto.toLowerCase().includes(term)
    );
  }

  selectCombination(combination: any) {
    this.modalController.dismiss(combination);
    // console.log("esta es la combinacion seleccionada: ", combination)
  }

}
