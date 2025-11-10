import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VendorFormsService } from '../../service/vendor-forms.service';
import { VendorCustomerService } from '../../service/vendor-customer.service';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/service/api.service';
import { EmailDialogComponent } from '../email-dialog/email-dialog.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-note-dialog',
  templateUrl: './note-dialog.component.html',
  styleUrls: ['./note-dialog.component.scss'],
})
export class NoteDialogComponent implements OnInit {
  noteForm = this.vendorFormService.noteForm();
  imgUrl = environment.imgUrl;
  constructor(
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public vendorFormService: VendorFormsService,
    public vendorCustomerService: VendorCustomerService,
    public toastr: ToastrService,
    public apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.initiateNote();
  }

  initiateNote() {
    this.noteForm.reset();
    if (this.data.relationStatusId) {
      this.noteForm
        .get('relationStatusId')
        .patchValue(this.data.relationStatusId);
    }
    this.noteForm.get('sortOrder').patchValue(this.data.notes.controls.length);
    this.noteForm
      .get('businessCategory')
      .patchValue(this.data.businessCategory);
  }

  addNote() {
    this.addNotes(this.data.id, this.noteForm.value);
  }

  async addNotes(id, notedata) {
    if (this.noteForm.invalid) {
      this.noteForm.markAllAsTouched();
      return;
    }
    try {
      const data = await this.vendorCustomerService
        .addNotes(id, notedata)
        .toPromise();
      const noteForm = this.vendorFormService.noteForm();
      noteForm.patchValue(data);
      this.data.notes.controls.unshift(noteForm);
      this.data.notes.updateValueAndValidity();
      this.initiateNote();
    } catch (err: any) {
      console.log(err);
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  getStatusName(id: any) {
    const item = this.apiService.allRelationStatuses.find((it) => it.id == id);
    return item.description;
  }

  deleteNote(i: any) {
    this.data.notes.removeAt(i);
  }

  close() {
    this.dialog.closeAll();
  }

  suggestEmail() {
    this.vendorCustomerService.suggestEmail(this.data.id).subscribe((res) => {
      this.openEmailDialog(res);
    });
  }

  saveNoteByImage(file) {
    this.vendorCustomerService
      .saveNoteByImage(this.data.id, file)
      .subscribe((res) => {
        this.toastr.success('Image uploaded and note saved successfully');
        this.close();
      });
  }

  uploadNote(event: any) {
    this.saveNoteByImage(event.target.files[0]);
  }

  openEmailDialog(data: any) {
    this.dialog
      .open(EmailDialogComponent, {
        width: '60%',
        data: { emailData: data, id: this.data.id },
        id: 'email-dialog',
      })
      .afterClosed()
      .subscribe((res) => {});
  }

  viewImage(fileName: any) {
    const url = this.imgUrl + fileName;
    window.open(url, '_blank');
  }

  formatText(text: string): string {
    // Replace **bold** with <strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Replace - bullets with <li>
    text = text.replace(/^-\s(.*)$/gm, '<li>$1</li>');

    // Wrap <li> items in a <ul>
    text = text.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

    // Replace newlines with <br> for spacing
    text = text.replace(/\n{2,}/g, '</p><p>');
    text = `<p>${text}</p>`; // Wrap in paragraph initially
    return text;
  }
}
