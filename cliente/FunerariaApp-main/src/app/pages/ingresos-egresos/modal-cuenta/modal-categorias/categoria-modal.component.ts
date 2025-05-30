import { Component, OnInit } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IngresosServices } from '../../../../Servicios/Ingresos.service';

interface Categoria {
  CategoriaID: number;
  NombreCategoria: string;
}

@Component({
  selector: 'app-categoria-modal',
  templateUrl: './categoria-modal.component.html',
  styleUrls: ['./categoria-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class CategoriasModalComponent implements OnInit {
  categorias: Categoria[] = [];
  filteredCategorias: Categoria[] = [];
  searchTerm: string = '';

  constructor(
    public modalController: ModalController,
    private categoriasService: IngresosServices
  ) {}

  ngOnInit() {
    this.loadCategorias();
  }

  loadCategorias() {
    this.categoriasService.getCategorias().subscribe((data: any[]) => {
      this.categorias = data.map(c => ({
        CategoriaID: c.CategoriaID,
        NombreCategoria: c.Nombre 
      })).sort((a, b) => a.NombreCategoria.localeCompare(b.NombreCategoria)); // Orden alfabético

      this.filteredCategorias = [...this.categorias];
    });
  }

  filterCategorias() {
    const term = this.searchTerm.toLowerCase();
    this.filteredCategorias = this.categorias.filter(c =>
      c.NombreCategoria.toLowerCase().includes(term)
    );
  }

  selectCategoria(categoria: Categoria) {
    this.modalController.dismiss(categoria);
  }
}
