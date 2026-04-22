import { Component, output } from '@angular/core';

@Component({
  selector: 'app-logout-modal',
  standalone: true,
  templateUrl: './logout-modal.component.html',
  styleUrl: './logout-modal.component.scss'
})
export class LogoutModalComponent {
  confirm = output<void>();
  cancel = output<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
