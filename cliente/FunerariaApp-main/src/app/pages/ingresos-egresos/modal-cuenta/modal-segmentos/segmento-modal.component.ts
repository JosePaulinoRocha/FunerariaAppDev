import { Component, OnInit } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IngresosServices } from 'src/app/Servicios/Ingresos.service';

interface Segmento {
  SegmentoID: number;
  NombreSegmento: string;
}

@Component({
  selector: 'app-segmento-modal',
  templateUrl: './segmento-modal.component.html',
  styleUrls: ['./segmento-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class SegmentoModalComponent implements OnInit {
  segmentos: Segmento[] = [];
  filteredSegmentos: Segmento[] = [];
  searchTerm: string = '';

  constructor(
    public modalController: ModalController,
    private ingresosService: IngresosServices
  ) {}

  ngOnInit() {
    this.loadSegmentos();
  }

  loadSegmentos() {
    this.ingresosService.getSegmentos().subscribe((data: any[]) => {
      this.segmentos = data.map(s => ({
        SegmentoID: s.SegmentoID,
        NombreSegmento: s.Nombre
      })).sort((a, b) => a.NombreSegmento.localeCompare(b.NombreSegmento));

      this.filteredSegmentos = [...this.segmentos];
    });
  }

  filterSegmentos() {
    const term = this.searchTerm.toLowerCase();
    this.filteredSegmentos = this.segmentos.filter(s =>
      s.NombreSegmento.toLowerCase().includes(term)
    );
  }

  selectSegmento(segmento: Segmento) {
    this.modalController.dismiss(segmento);
  }
}
