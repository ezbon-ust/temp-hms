import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {

  registerForm: FormGroup;

  roles = [
    'DOCTOR',
    'NURSE',
    'LAB_TECH',
    'PHARMACIST',
    'ADMIN'
  ];

  departments = [
    'Cardiology',
    'Neurology',
    'Emergency',
    'Pharmacy',
    'Laboratory'
  ];

  selectedRole: string = '';
  showMedicalFields = false;

  constructor(private fb: FormBuilder) {

    this.registerForm = this.fb.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        department: ['', Validators.required],
        designation: ['', Validators.required],
        roles: ['', Validators.required],

        medicalRegistrationNo: [''],
        specialization: [''],
        consultationFee: [''],

        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required]
      },
      {
        validators: this.passwordMatchValidator
      }
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }

    return null;
  }

  onRoleChange(): void {
    const role = this.registerForm.get('roles')?.value;

    this.selectedRole = role;

    this.showMedicalFields = [
      'DOCTOR',
      'NURSE',
      'LAB_TECH',
      'PHARMACIST'
    ].includes(role);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    console.log(this.registerForm.value);

    alert('Form Submitted Successfully!');
  }
}