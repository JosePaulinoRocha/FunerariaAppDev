import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PresupuestoMensualFrecuenciaComponent } from './presupuesto-mensual-frecuencia.component';

describe('PresupuestoMensualFrecuenciaComponent', () => {
  let component: PresupuestoMensualFrecuenciaComponent;
  let fixture: ComponentFixture<PresupuestoMensualFrecuenciaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PresupuestoMensualFrecuenciaComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PresupuestoMensualFrecuenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
