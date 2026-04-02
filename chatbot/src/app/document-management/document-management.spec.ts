import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentManagement } from './document-management';

describe('DocumentManagement', () => {
  let component: DocumentManagement;
  let fixture: ComponentFixture<DocumentManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentManagement],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
