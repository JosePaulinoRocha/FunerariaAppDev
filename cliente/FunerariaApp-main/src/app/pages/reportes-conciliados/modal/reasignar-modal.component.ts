import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CompilacionesServices } from 'src/app/Servicios/Compilaciones.service';
import { ToastController } from '@ionic/angular';

@Component({
    selector: 'app-reasignar-modal',
    templateUrl: './reasignar-modal.component.html',
    styleUrls: ['./reasignar-modal.component.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, HttpClientModule, FormsModule],
})
export class ReasignarModalComponent implements OnInit {
  @Input() segmentoId!: number;
  @Input() nombreSegmento!: string;
  @Input() totalMonto!: number;
  @Input() tipoMovimiento!: number; 
  @Input() fechaInicio!: string;
  @Input() fechaFin!: string;
  @Input() filtroSegmento!: string;

  opcionesVariantes: { clave: string; nombre: string }[] = [];
  varianteSeleccionada!: string;
  montoReasignar!: number;

  constructor(
    private modalCtrl: ModalController,
    private compilacionServ: CompilacionesServices,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.cargarOpciones();
  }

  cargarOpciones() {
    const todasLasVariantes = [
      { clave: 'cobranza', nombre: 'Cobranza' },
      { clave: 'funeraria', nombre: 'Funeraria' },
      { clave: 'ventas', nombre: 'Ventas (Sala)' },
    ];

    const nombreLower = this.nombreSegmento.toLowerCase();
    const filtroLower = this.filtroSegmento?.toLowerCase();

    this.opcionesVariantes = todasLasVariantes.filter(v => {
      // No mostrar la variante de origen
      if (nombreLower.includes(v.clave)) return false;

      // No mostrar la variante que está actualmente filtrada
      if (v.clave === filtroLower) return false;

      // No mostrar ventas si el segmento tiene "sala" en el nombre
      if (v.clave === 'ventas' && nombreLower.includes('sala')) return false;

      return true;
    });
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  async confirmarReasignacion() {
    if (!this.varianteSeleccionada) {
      const toast = await this.toastCtrl.create({
        message: 'Debes seleccionar una variante destino.',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    if (!this.montoReasignar || this.montoReasignar <= 0) {
      const toast = await this.toastCtrl.create({
        message: 'El monto debe ser mayor a 0.',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    if (this.montoReasignar > this.totalMonto) {
      const toast = await this.toastCtrl.create({
        message: 'El monto no puede superar el máximo disponible.',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    // Llamada al servicio para guardar la reasignación
    this.compilacionServ
      .crearReasignacion({
        segmentoIdOriginal: this.segmentoId,
        varianteDestino: this.varianteSeleccionada,
        totalMonto: this.totalMonto,
        montoReasignado: this.montoReasignar,
        fechaInicio: this.fechaInicio,
        fechaFin: this.fechaFin,
        tipoMovimiento: this.tipoMovimiento,
        filtroSegmento: this.filtroSegmento
      })
      .subscribe({
        next: async (res: any) => {
          const toast = await this.toastCtrl.create({
            message: 'Reasignación realizada correctamente',
            duration: 2000,
            color: 'success'
          });
          await toast.present();

          this.modalCtrl.dismiss({
            segmentoIdOriginal: this.segmentoId,
            varianteDestino: this.varianteSeleccionada,
            totalMonto: this.totalMonto,
            montoReasignado: this.montoReasignar,
            fechaInicio: this.fechaInicio,
            fechaFin: this.fechaFin,
            tipoMovimiento: this.tipoMovimiento
          });
        },
        error: async (err) => {
          const toast = await this.toastCtrl.create({
            message: 'Error al realizar la reasignación',
            duration: 2000,
            color: 'danger'
          });
          await toast.present();
          console.error('Error reasignando:', err);
        }
      });
  }


}
