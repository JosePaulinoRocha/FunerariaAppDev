import { Component, Input, OnInit } from '@angular/core';
import { IngresosServices } from '../../../../Servicios/Ingresos.service';
import { ModalController, IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Concepto {
  ConceptoID: number;
  NombreConcepto: string;
}

@Component({
  selector: 'app-concepto-modal',
  templateUrl: './concepto-modal.component.html',
  styleUrls: ['./concepto-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ConceptosModalComponent implements OnInit {
  filteredConceptos: Concepto[] = [];
  conceptos: Concepto[] = [];
  searchTerm: string = '';

  constructor(
    public modalController: ModalController,
    private _ingresoServ: IngresosServices,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadConceptos();
  }

  loadConceptos() {
    this._ingresoServ.getConceptos().subscribe((conceptos: any[]) => {
      // console.log('Respuesta del servicio:', conceptos);
  
      this.conceptos = conceptos.map(concepto => ({
        ConceptoID: concepto.ConceptoID,
        NombreConcepto: concepto.Nombre, // Cambia el mapeo al campo correcto
      }));
      this.filteredConceptos = [...this.conceptos];
    });
  }
  
  

  filterCombinaciones() {
    const term = this.searchTerm.toLowerCase();
    this.filteredConceptos = this.conceptos.filter(concepto =>
      concepto.NombreConcepto.toLowerCase().includes(term)
    );
  }

  selectCombination(concepto: Concepto) {
    this.modalController.dismiss(concepto);
    // console.log('Concepto seleccionado: ', concepto);
  }
}
