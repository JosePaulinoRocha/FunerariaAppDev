import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ReconciliacionesHistorialComponent } from './reconciliaciones-historial.component';

describe('ReconciliacionesHistorialComponent', () => {
  let component: ReconciliacionesHistorialComponent;
  let fixture: ComponentFixture<ReconciliacionesHistorialComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReconciliacionesHistorialComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ReconciliacionesHistorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
