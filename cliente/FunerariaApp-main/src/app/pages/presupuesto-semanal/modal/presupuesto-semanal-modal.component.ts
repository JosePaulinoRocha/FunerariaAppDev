import { Component } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SegmentoModalComponent } from './segmento-modal/segmento-modal.component';
import { CategoriasModalComponent } from './categoria-modal/categoria-modal.component';
import { PresupuestoSemanalService, PresupuestoSemanal } from '../../../Servicios/Presupuesto-semanal.service';
import { ToastController } from '@ionic/angular';

interface Segmento {
  SegmentoID: number;
  NombreSegmento: string;
}

interface Categoria {
  CategoriaID: number;
  NombreCategoria: string;
}

@Component({
  selector: 'app-presupuesto-semanal-modal',
  templateUrl: './presupuesto-semanal-modal.component.html',
  styleUrls: ['./presupuesto-semanal-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PresupuestoSemanalModalComponent {
  segmentoSeleccionado: Segmento | null = null;
  categoriaSeleccionada: Categoria | null = null;
  fechaInicio: string = '';
  fechaFin: string = '';
  monto: number | null = null;

  constructor(public modalController: ModalController, private presupuestoService: PresupuestoSemanalService, private toastController: ToastController) {}

  async openSegmentoModal() {
    const modal = await this.modalController.create({
      component: SegmentoModalComponent
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.segmentoSeleccionado = data;
    }
  }

  async openCategoriaModal() {
    const modal = await this.modalController.create({
      component: CategoriasModalComponent
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.categoriaSeleccionada = data;
    }
  }

  async mostrarToast(mensaje: string, color: 'success' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color
    });
    toast.present();
  }

  guardarPresupuesto() {
    if (!this.segmentoSeleccionado || !this.categoriaSeleccionada || !this.fechaInicio || !this.fechaFin || !this.monto || this.monto <= 0) {
      this.mostrarToast('Completa todos los campos y asegúrate de que el monto sea mayor a 0', 'danger');
      return;
    }

    const nuevoPresupuesto: PresupuestoSemanal = {
      SegmentoID: this.segmentoSeleccionado.SegmentoID,
      CategoriaID: this.categoriaSeleccionada.CategoriaID,
      FechaInicio: this.fechaInicio,
      FechaFin: this.fechaFin,
      Monto: this.monto
    };

    this.presupuestoService.addPresupuesto(nuevoPresupuesto).subscribe({
      next: async (res) => {
        await this.mostrarToast('Presupuesto guardado correctamente', 'success');
        this.modalController.dismiss(nuevoPresupuesto);
      },
      error: async (err) => {
        console.error('Error al guardar presupuesto:', err);
        await this.mostrarToast('Ocurrió un error al guardar el presupuesto', 'danger');
      }
    });
  }
  
}
