import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ResumenPresupuestoSegmentosComponent } from './resumen-presupuesto-segmentos.component';

describe('ResumenPresupuestoSegmentosComponent', () => {
  let component: ResumenPresupuestoSegmentosComponent;
  let fixture: ComponentFixture<ResumenPresupuestoSegmentosComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ResumenPresupuestoSegmentosComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ResumenPresupuestoSegmentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
