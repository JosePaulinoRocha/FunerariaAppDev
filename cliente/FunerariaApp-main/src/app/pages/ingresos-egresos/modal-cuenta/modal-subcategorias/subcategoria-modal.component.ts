import { Component, OnInit } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IngresosServices } from '../../../../Servicios/Ingresos.service';

interface Subcategoria {
  SubcategoriaID: number;
  NombreSubcategoria: string;
}

@Component({
  selector: 'app-subcategoria-modal',
  templateUrl: './subcategoria-modal.component.html',
  styleUrls: ['./subcategoria-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class SubcategoriasModalComponent implements OnInit {
  subcategorias: Subcategoria[] = [];
  filteredSubcategorias: Subcategoria[] = [];
  searchTerm: string = '';

  constructor(
    public modalController: ModalController,
    private ingresosService: IngresosServices
  ) {}

  ngOnInit() {
    this.loadSubcategorias();
  }

  loadSubcategorias() {
    this.ingresosService.getSubcategorias().subscribe((data: any[]) => {
      this.subcategorias = data.map(s => ({
        SubcategoriaID: s.SubcategoriaID,
        NombreSubcategoria: s.Nombre
      })).sort((a, b) => a.NombreSubcategoria.localeCompare(b.NombreSubcategoria));

      this.filteredSubcategorias = [...this.subcategorias];
    });
  }

  filterSubcategorias() {
    const term = this.searchTerm.toLowerCase();
    this.filteredSubcategorias = this.subcategorias.filter(s =>
      s.NombreSubcategoria.toLowerCase().includes(term)
    );
  }

  selectSubcategoria(subcategoria: Subcategoria) {
    this.modalController.dismiss(subcategoria);
  }
}
