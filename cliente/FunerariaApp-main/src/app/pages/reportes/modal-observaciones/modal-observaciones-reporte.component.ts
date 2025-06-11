import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReportesServices } from 'src/app/Servicios/Reportes.service';

@Component({
  selector: 'app-observaciones-modal',
  templateUrl: './modal-observaciones-reporte.component.html',
  styleUrls: ['./modal-observaciones-reporte.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class ObservacionesModalComponent implements OnInit {
  @Input() segmentoID!: number;
  @Input() categoriaID!: number;
  @Input() subcategoriaID!: number;
  @Input() conceptoID!: number;
  
  observacion: string = '';

  constructor(
    private modalController: ModalController,
    private reportesService: ReportesServices
  ) {}

  ngOnInit() {
    // console.log('SegmentoID:', this.segmentoID);
    // console.log('CategoriaID:', this.categoriaID);
    // console.log('SubcategoriaID:', this.subcategoriaID);
    // console.log('ConceptoID:', this.conceptoID);
  }

  dismiss() {
    this.modalController.dismiss();
  }

  saveObservacion() {
    this.reportesService
      .updateObservacion(
        this.segmentoID,
        this.categoriaID,
        this.subcategoriaID,
        this.conceptoID,
        this.observacion
      )
      .subscribe(
        (response) => {
          // console.log('Observación guardada:', response);
          this.modalController.dismiss({ success: true });
        },
        (error) => {
          console.error('Error al guardar la observación:', error);
        }
      );
  }
}
