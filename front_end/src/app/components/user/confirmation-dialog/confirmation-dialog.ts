// src/app/components/user/confirmation-dialog/confirmation-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions, MatDialogTitle, MatDialogContent } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogActions, MatDialogTitle, MatDialogContent], 
   templateUrl: './confirmation-dialog.html',
  styleUrls: ['./confirmation-dialog.css']
})
export class ConfirmationDialog {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string; action: string; phone?: string }
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    this.dialogRef.close('open');
  }
}