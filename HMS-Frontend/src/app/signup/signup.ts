

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../services/auth';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  signupForm: FormGroup;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.signupForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.minLength(10)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  passwordsDoNotMatch(): boolean {
    const p = this.signupForm.get('password')?.value;
    const cp = this.signupForm.get('confirmPassword')?.value;
    if (!cp) return false;
    return p !== cp;
  }

  onSignup() {
    if (this.signupForm.invalid || this.passwordsDoNotMatch()) {
      this.signupForm.markAllAsTouched();
      return;
    }

    const v = this.signupForm.value;

    const payload = {
      name: v.fullName,
      email: v.email,
      password: v.password,
      phone: v.phone || undefined,
      designation: 'ADMIN',   // hardcoded — admin-only signup
    };

    this.authService.signup(payload).subscribe({
      next: () => {
        this.snackBar.open('Signup successful!', 'Close', {
          duration: 10000,
          panelClass: ['opaque-snackbar'],
        });
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Signup failed. Try again.';
      },
    });
  }
}