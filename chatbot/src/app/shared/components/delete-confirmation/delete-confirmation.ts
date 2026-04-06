import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-delete-confirmation',
  imports: [CommonModule],
  templateUrl: './delete-confirmation.html',
  styleUrl: './delete-confirmation.scss',
})
export class DeleteConfirmation {
  //We use @Input() because the data is created in the
  //  parent, but needed in the child UI.

  //   @Input is used to:

  // Pass data from parent → child
  // Make component reusable
  // Control UI dynamically
  @Input() visible: boolean = false;
  @Input() message: string = 'Are you sure you want to delete this item?';
  @Input() errorMessage: string = '';
  @Input() isDeleting: boolean = false;
  //I will notify parent when:
  // - user clicks Confirm
  // - user clicks Cancel"
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
