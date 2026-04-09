import { ChangeDetectorRef, Component } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ErrorService } from '../../services/error';
@Component({
  selector: 'app-error',
  imports: [IonicModule, CommonModule],
  templateUrl: './error.html',
  styleUrl: './error.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Error {
  public errorMessage: string = '';
  private subscription!: Subscription;
  private timeoutId: any;
  constructor(
    private errorService: ErrorService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    // Listen for any errors broadcasted by the service
    this.subscription = this.errorService.error$.subscribe((msg: string) => {
      this.errorMessage = msg;
      this.cdr.detectChanges(); // Force UI to update immediately

      // Clear any existing timers so they don't overlap if multiple errors fire
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }

      // If there is a message, start the 3.5-second countdown to hide it
      if (msg) {
        this.timeoutId = setTimeout(() => {
          this.errorMessage = '';
          this.cdr.detectChanges();
        }, 3500);
      }
    });
  }

  // Allow the user to manually close it by clicking the X
  closeError() {
    this.errorMessage = '';
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    // Prevent memory leaks when the component is destroyed
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}
