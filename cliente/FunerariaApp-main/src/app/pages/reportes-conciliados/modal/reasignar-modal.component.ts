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
    console.log('segmento variante', this.filtroSegmento)
  }

  cargarOpciones() {
    const todasLasVariantes = [
      { clave: 'cobranza', nombre: 'Cobranza' },
      { clave: 'funeraria', nombre: 'Funeraria' },
      { clave: 'ventas', nombre: 'Ventas (Sala)' },
    ];

    const nombreLower = (this.nombreSegmento || '').toLowerCase();
    const filtroLower = (this.filtroSegmento || 'Todos').toString().toLowerCase();

    // Determina explícitamente la variante "origen" basada en el nombre del segmento
    let originKey: string | null = null;
    if (nombreLower.includes('cobranza')) originKey = 'cobranza';
    else if (nombreLower.includes('funeraria')) originKey = 'funeraria';
    else if (nombreLower.includes('sala') || nombreLower.includes('ventas')) originKey = 'ventas';

    this.opcionesVariantes = todasLasVariantes.filter(v => {
      // 1) Nunca mostrar la variante que coincide con el filtro actual (si no es "todos")
      if (filtroLower !== 'todos' && v.clave === filtroLower) {
        return false;
      }

      // 2) Ocultar la variante de origen cuando:
      //    - estoy en "Todos" (no permitir reasignar a la variante origen desde la vista global), OR
      //    - o estoy abriendo el modal desde la misma variante origen (no reasignar a sí misma)
      if (originKey && v.clave === originKey && (filtroLower === 'todos' || filtroLower === originKey)) {
        return false;
      }

      // 3) En cualquier otro caso permitir la variante (ej. abrir desde Cobranza y origen es Ventas -> permitir Ventas)
      return true;
    });
  }

  detectarOrigen(nombre: string): string {
    const lower = nombre.toLowerCase();
    if (lower.includes('cobranza')) return 'cobranza';
    if (lower.includes('funeraria')) return 'funeraria';
    if (lower.includes('sala') || lower.includes('ventas')) return 'ventas';
    return 'otros';
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
        filtroSegmento: this.filtroSegmento,
        originKey: this.detectarOrigen(this.nombreSegmento)
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
