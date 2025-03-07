import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ResumenPresupuestoCategoriasComponent } from './resumen-presupuesto-categorias.component';

describe('ResumenPresupuestoCategoriasComponent', () => {
  let component: ResumenPresupuestoCategoriasComponent;
  let fixture: ComponentFixture<ResumenPresupuestoCategoriasComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ResumenPresupuestoCategoriasComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ResumenPresupuestoCategoriasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
