import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { AuthService } from '../services/auth';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {

  registerForm: FormGroup;

  selectedDesignation = '';

  departments = [
    'OPD',
    'IPD',
    'LAB',
    'PHARMACY',
    'ADMIN'
  ];

  designations = [
    'OWNER',
    'DOCTOR',
    'NURSE',
    'RECEPTIONIST',
    'CASHIER',
    'LAB_TECH',
    'PHARMACIST',
    'ADMIN'
  ];

  constructor(private fb: FormBuilder,private authService:AuthService,private router: Router) {

    this.registerForm = this.fb.group(
      {

        name: ['', Validators.required],

        phone: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[0-9]{10}$/)
          ]
        ],

        email: [
          '',
          [
            Validators.required,
            Validators.email
          ]
        ],

        department: ['', Validators.required],

        designation: ['', Validators.required],

        joiningDate: ['', Validators.required],

        medicalRegistrationNumber: [''],

        specialisation: [''],

        qualification: [''],

        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6)
          ]
        ],

        confirmPassword: [
          '',
          Validators.required
        ]

      },
      {
        validators: this.passwordMatchValidator
      }
    );
  }

  passwordMatchValidator(form: FormGroup) {

    const password =
      form.get('password')?.value;

    const confirmPassword =
      form.get('confirmPassword')?.value;

    if (password !== confirmPassword) {

      return {
        passwordMismatch: true
      };
    }

    return null;
  }

  onDesignationChange(): void {

    this.selectedDesignation =
      this.registerForm.get('designation')?.value;
  }

  get showQualification(): boolean {

    return [
      'DOCTOR',
      'NURSE',
      'PHARMACIST',
      'LAB_TECH',
      'RECEPTIONIST',
      'CASHIER',
      'ADMIN'
    ].includes(this.selectedDesignation);
  }

  get showMedicalFields(): boolean {

    return [
      'DOCTOR',
      'NURSE',
      'PHARMACIST'
    ].includes(this.selectedDesignation);
  }

  get showSpecialisation(): boolean {

    return this.selectedDesignation === 'DOCTOR';
  }

  onSubmit(): void {

  if (this.registerForm.invalid) {

    this.registerForm.markAllAsTouched();

    return;
  }

  const formData = {
    ...this.registerForm.value
  };

  // confirmPassword not needed in backend
  delete formData.confirmPassword;

  this.authService
    .register(formData)
    .subscribe({

      next: (res: any) => {

        console.log(res);

       
 
        this.registerForm.reset();
         this.router.navigate(['/verify-email']);
      },

      error: (err) => {

        console.log(err);

        alert(
          err.error.message ||
          'Registration failed'
        );
      }
    });
}
}