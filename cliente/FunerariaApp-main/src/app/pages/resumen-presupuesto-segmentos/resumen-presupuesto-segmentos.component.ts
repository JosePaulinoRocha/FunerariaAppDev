import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from "@ionic/angular";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ResumenPresupuestoServices } from 'src/app/Servicios/Resumen-presupuesto.service';
import { SegmentDetailModalComponent } from './modal/segment-detail-modal.component';

@Component({
  selector: 'app-resumen-presupuesto-segmentos',
  templateUrl: './resumen-presupuesto-segmentos.component.html',
  styleUrls: ['./resumen-presupuesto-segmentos.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class ResumenPresupuestoSegmentosComponent implements OnInit {

  segmentos: any[] = []; // Inicializamos el array vacío

  isLoading: boolean = false;

  constructor(
    private _resumenPresupuesto_Serv: ResumenPresupuestoServices,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.loadResumenEgresosSegmentos();
  }

  loadResumenEgresosSegmentos() {
    this.isLoading = true;
    this._resumenPresupuesto_Serv.getResumenSegmentos().subscribe(
      (data: any[]) => {
        console.log("Resumen de egresos por segmento: ", data);
        this.segmentos = data.map(seg => ({
          segmentoID: seg.SegmentoID,
          nombre: seg.NombreSegmento,
          presupuesto: parseFloat(seg.MontoEsperado),
          actual: parseFloat(seg.MontoActual),
          desfase: parseFloat(seg.MontoEsperado) - parseFloat(seg.MontoActual)
        })).sort((a, b) => a.desfase - b.desfase); // Ordenar por desfase ascendente
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching presupuesto', error);
      }
    );
  }
  

  async openSegmentDetail(segmento: any) {
    console.log("Segmento seleccionado:", segmento);
    const modal = await this.modalController.create({
      component: SegmentDetailModalComponent,
      componentProps: { segmento } 
    });
  
    return await modal.present();
  }
  
  
}
