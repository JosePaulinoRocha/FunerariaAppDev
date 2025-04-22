import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule, AlertController  } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IngresosServices } from 'src/app/Servicios/Ingresos.service';

interface Ingreso {
  IngresoID: number;
  ConceptoID: number;
  NombreConcepto: string;
  SegmentoID: number;
  NombreSegmento: string;
  CategoriaID: number;
  NombreCategoria: string;
  SubcategoriaID: number;
  NombreSubcategoria: string;
  TipoIngreso: { data: number[]; type: string; };
}

interface Concepto {
  ConceptoID: number;
  Nombre: string;
}

interface Segmento {
  SegmentoID: number;
  Nombre: string;
}

interface Categoria {
  CategoriaID: number;
  Nombre: string;
  IngresosBit: number;
  EgresoBit: number;
}

interface Subcategoria {
  SubcategoriaID: number;
  Nombre: string;
}

interface Combinacion {
  CombinacionID: number;
  ConceptoID: number;
  SegmentoID: number;
  CategoriaID: number;
  SubcategoriaID: number;
}

@Component({
  selector: 'app-ingresos-egresos-modal',
  templateUrl: './ingresos-egresos-modal.component.html',
  styleUrls: ['./ingresos-egresos-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, HttpClientModule],
})
export class IngresosEgresosModalComponent implements OnInit {
  @Input() ingreso: Ingreso = {
    IngresoID: 0,
    ConceptoID: 0,
    NombreConcepto: '',
    SegmentoID: 0,
    NombreSegmento: '',
    CategoriaID: 0,
    NombreCategoria: '',
    SubcategoriaID: 0,
    NombreSubcategoria: '',
    TipoIngreso: { data: [], type: '' },
  };

  concepto: Concepto[] = [];
  segmento: Segmento[] = [];
  categoria: Categoria[] = [];
  subcategoria: Subcategoria[] = [];
  combinacion: Combinacion[] = [];

  isNewConcepto = false;
  isNewSegmento = false;
  isNewCategoria = false;
  isNewSubcategoria = false;

  newConcepto = '';
  newSegmento = '';
  newCategoria = '';
  newSubcategoria = '';
  
  @Input() isEditMode: boolean = false;

  constructor(private modalController: ModalController, private _ingresoServ: IngresosServices, private alertController: AlertController) {}

  updateCombinations() {
    // Filtrar combinaciones que incluyan el ConceptoID seleccionado
    const filteredCombinations = this.combinacion.filter(c => c.ConceptoID === this.ingreso.ConceptoID);
    
    if (filteredCombinations.length > 0) {
      // Encontrar la combinación con el mayor CombinacionID
      const latestCombination = filteredCombinations.reduce((prev, current) => {
        return (prev.CombinacionID > current.CombinacionID) ? prev : current;
      });
  
      // Actualizar los campos correspondientes
      this.ingreso.SegmentoID = latestCombination.SegmentoID;
      this.ingreso.CategoriaID = latestCombination.CategoriaID;
      this.ingreso.SubcategoriaID = latestCombination.SubcategoriaID;
    }
  }
  

  ngOnInit() {
    console.log('registro datos:', this.ingreso);

    this.loadConceptos();
    this.loadSegmentos();
    this.loadCategorias();
    this.loadSubcategorias();
    this.loadCombinaciones();
  }

  loadConceptos() {
    this._ingresoServ.getConceptos().subscribe((data: Concepto[]) => {
      this.concepto = data;
    }, (error) => {
      this.presentAlert('Error fetching concepts');
    });
  }

  loadSegmentos() {
    this._ingresoServ.getSegmentos().subscribe((data: Segmento[]) => {
      this.segmento = data.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
    }, (error) => {
      this.presentAlert('Error fetching segments');
    });
  }

  loadCategorias() {
    this._ingresoServ.getCategorias().subscribe((data: Categoria[]) => {
      const tipoIngreso = this.ingreso.TipoIngreso?.data?.[0]; // 0 = egreso, 1 = ingreso
      this.categoria = data
        .filter(cat => tipoIngreso === 0 ? cat.IngresosBit === 1 : cat.EgresoBit === 1)
        .sort((a, b) => a.Nombre.localeCompare(b.Nombre));
    }, (error) => {
      this.presentAlert('Error fetching categories');
    });
  }

  loadSubcategorias() {
    this._ingresoServ.getSubcategorias().subscribe((data: Subcategoria[]) => {
      this.subcategoria = data.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
    }, (error) => {
      this.presentAlert('Error fetching subcategories');
    });
  }

  loadCombinaciones() {
    this._ingresoServ.getCombinaciones().subscribe((data: Combinacion[]) => {
      console.log("esta es mi data en combinaciones: ", data)
      this.combinacion = data;
    }, (error) => {
      this.presentAlert('Error fetching combinations');
    });
  }

  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }

  async editarCombinacion() {
    const updatedIngreso = {
      IngresoID: this.ingreso.IngresoID,
      ConceptoID: this.isNewConcepto ? this.newConcepto : this.ingreso.ConceptoID,
      SegmentoID: this.isNewSegmento ? this.newSegmento : this.ingreso.SegmentoID,
      CategoriaID: this.isNewCategoria ? this.newCategoria : this.ingreso.CategoriaID,
      SubcategoriaID: this.isNewSubcategoria ? this.newSubcategoria : this.ingreso.SubcategoriaID,
    };
  
    console.log("esta es mi info de cambio de combinacion: ", updatedIngreso);
  
    this._ingresoServ.updateCombination(updatedIngreso).subscribe(async response => {
      console.log('Ingreso actualizado:', response);
  
      const alert = await this.alertController.create({
        header: 'Éxito',
        message: 'Se han actualizado los campos correctamente.',
        buttons: ['OK']
      });
      await alert.present();
  
      this.closeModal(true);
      
    }, error => {
      console.error('Error al actualizar ingreso:', error);
      this.closeModal(false);
    });
  }

  closeModal(success: boolean = false) {
    this.modalController.dismiss({ success });
  }
}
