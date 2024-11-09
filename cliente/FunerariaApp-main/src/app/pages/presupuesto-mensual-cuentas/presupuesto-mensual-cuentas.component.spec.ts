import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PresupuestoMensualCuentasComponent } from './presupuesto-mensual-cuentas.component';

describe('PresupuestoMensualCuentasComponent', () => {
  let component: PresupuestoMensualCuentasComponent;
  let fixture: ComponentFixture<PresupuestoMensualCuentasComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PresupuestoMensualCuentasComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PresupuestoMensualCuentasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
