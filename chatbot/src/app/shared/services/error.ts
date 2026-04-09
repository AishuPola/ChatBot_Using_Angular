import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  // The radio station that broadcasts the error message
  private errorSubject = new Subject<string>();

  // The channel components tune into to listen for errors
  public error$ = this.errorSubject.asObservable();

  /**
   * Call this from anywhere to show a red error popup
   * @param message The error text to display
   */
  public showError(message: string): void {
    this.errorSubject.next(message);
  }

  /**
   * Manually hides the error early
   */
  public clearError(): void {
    this.errorSubject.next('');
  }
}
