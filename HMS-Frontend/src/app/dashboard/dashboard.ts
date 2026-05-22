import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { Employee } from '../models/employee.model';
import { Activity } from '../models/activity.model';
import { Request } from '../models/request.model';
import { Toast } from '../models/toast.model';
import { NewEmployee } from '../models/newEmployee.model';

import { EmployeeTablesComponent } from '../employee-tables/employee-tables.component';

import {
  getAvatarColor,
  getRoleStyle,
  getRoleDotColor,
  makeAvatar
} from '../utils/dashboard.util';

@Component({
  selector: 'app-dash',
  standalone: true,
  imports: [CommonModule, FormsModule, EmployeeTablesComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {

  // ── Constants ─────────────────────────────────────────────
  roles = [
    'Doctor',
    'Cashier',
    'Receptionist',
    'Nurse',
    'Lab Technician',
    'Pharmacist'
  ];

  departments = [
    'Cardiology',
    'General',
    'Pediatrics',
    'Emergency',
    'Radiology',
    'Pharmacy',
    'Finance',
    'Front Desk'
  ];

  navItems = [
    { id: 'overview', label: 'Overview', icon: '⊞' },
    { id: 'employees', label: 'Employees', icon: '👥' },
    { id: 'activity', label: 'Activity', icon: '📋' },
    { id: 'requests', label: 'Requests', icon: '🔔' },
  ];

  // ── State ─────────────────────────────────────────────────
  activeSection = 'overview';
  searchTerm = '';
  roleFilter = 'All';

  showAddModal = false;
  showDeleteConfirm: Employee | null = null;

  toast: Toast | null = null;

  newEmp: NewEmployee = {
    name: '',
    role: 'Doctor',
    dept: 'General',
    email: '',
    designation: '',
    status: 'Active'
  };

  // ── Dummy Employees ───────────────────────────────────────
  employees: Employee[] = [
    {
      _id: 1,
      name: 'Dr. Arjun Mehta',
      roles: 'Doctor',
      department: 'Cardiology',
      email: 'arjun@hospital.com',
      designation: 'Senior Doctor',
      status: 'Active',
      avatar: 'AM',
      joiningDate: '2025-01-10'
    },
    {
      _id: 2,
      name: 'Priya Sharma',
      roles: 'Receptionist',
      department: 'Front Desk',
      email: 'priya@hospital.com',
      designation: 'Receptionist',
      status: 'Active',
      avatar: 'PS',
      joiningDate: '2025-02-15'
    }
  ];

  // ── Activities ────────────────────────────────────────────
  activities: Activity[] = [
    {
      _id: 1,
      actor: 'Priya Sharma',
      actorRole: 'Receptionist',
      action: 'added employee',
      target: 'Kavya Nair (Nurse)',
      time: '2 mins ago',
      icon: '➕'
    },
    {
      _id: 2,
      actor: 'Dr. Arjun Mehta',
      actorRole: 'Doctor',
      action: 'updated profile of',
      target: 'Amit Joshi',
      time: '18 mins ago',
      icon: '✏️'
    }
  ];

  // ── Requests ──────────────────────────────────────────────
  requests: Request[] = [];

  constructor(private router: Router,
    private authService:AuthService
  ) {}

  ngOnInit(): void {
    this.loadPendingRequests();
  } 
  loadPendingRequests(): void {

  this.authService
    .getPendingUsers()
    .subscribe({

      next: (res: any) => {

        this.requests = res.users.map((u: any) => ({

          _id: u.employeeId,

          name: u.employee?.name || 'Unknown',

          role: u.role,

          designation: u.role,

          department:
            u.employee?.department || 'N/A',

          email: u.email,

          avatar: makeAvatar(
            u.employee?.name || 'U'
          ),

          requestedBy: 'Self Registration',

          requestorRole: 'Employee',

          time: 'Recently'
        }));
      },

      error: (err) => {

        console.log(err);

        this.showToast(
          'Failed to load requests',
          'error'
        );
      }
    });
}

  // ── Utility Methods ───────────────────────────────────────
  getAvatarColor(name: string): string {
    return getAvatarColor(name);
  }

  getRoleDotColor(role: string): string {
    return getRoleDotColor(role);
  }

  getRoleStyle(role: string): { [key: string]: string } {
    return getRoleStyle(role);
  }

  // ── Computed ──────────────────────────────────────────────
  get stats() {
    return {
      total: this.employees.length,
      doctors: this.employees.filter(e => e.roles === 'Doctor').length,
      active: this.employees.filter(e => e.status === 'Active').length,
      pending: this.requests.length,
    };
  }

  get statsCards() {
    return [
      {
        label: 'Total Employees',
        value: this.stats.total,
        icon: '👥',
        color: '#6366f1',
        bg: '#ede9fe'
      },
      {
        label: 'Doctors',
        value: this.stats.doctors,
        icon: '🩺',
        color: '#0ea5e9',
        bg: '#e0f2fe'
      },
      {
        label: 'Active Staff',
        value: this.stats.active,
        icon: '✅',
        color: '#10b981',
        bg: '#d1fae5'
      },
      {
        label: 'Pending Requests',
        value: this.stats.pending,
        icon: '🔔',
        color: '#f59e0b',
        bg: '#fef3c7'
      },
    ];
  }

  get recentActivities(): Activity[] {
    return this.activities.slice(0, 4);
  }

  get requestsBadge(): number {
    return this.requests.length;
  }

  get todayDate(): string {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  get pageTitle(): string {
    const map: Record<string, string> = {
      overview: 'Dashboard Overview',
      employees: 'Employees',
      activity: 'Recent Activity',
      requests: 'Pending Requests',
    };

    return map[this.activeSection] || '';
  }

  get showAddButton(): boolean {
    return (
      this.activeSection === 'overview' ||
      this.activeSection === 'employees'
    );
  }

  get recentEmployees(): Employee[] {
    return this.employees.slice(0, 5);
  }

  // ── Actions ───────────────────────────────────────────────
  setSection(id: string): void {
    this.activeSection = id;
  }

  showToast(
    msg: string,
    type: 'success' | 'error' = 'success'
  ): void {
    this.toast = { msg, type };

    setTimeout(() => {
      this.toast = null;
    }, 3000);
  }

  addEmployee(): void {

    if (!this.newEmp.name || !this.newEmp.email) {
      this.showToast('Fill all required fields', 'error');
      return;
    }

    const emp: Employee = {
      _id: Date.now(),
      name: this.newEmp.name,
      roles: this.newEmp.role,
      department: this.newEmp.dept,
      email: this.newEmp.email,
      designation: this.newEmp.designation,
      status: this.newEmp.status,
      avatar: makeAvatar(this.newEmp.name),
      joiningDate: new Date().toISOString().split('T')[0]
    };

    this.employees = [emp, ...this.employees];

    this.activities = [
      {
        _id: Date.now(),
        actor: 'Admin',
        actorRole: 'Admin',
        action: 'added employee',
        target: `${emp.name} (${emp.roles})`,
        time: 'Just now',
        icon: '➕'
      },
      ...this.activities
    ];

    this.showAddModal = false;

    this.newEmp = {
      name: '',
      role: 'Doctor',
      dept: 'General',
      email: '',
      designation: '',
      status: 'Active'
    };

    this.showToast(`${emp.name} added successfully`);
  }

  confirmDelete(emp: Employee): void {
    this.showDeleteConfirm = emp;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = null;
  }

  deleteEmployee(emp: Employee): void {

    this.employees = this.employees.filter(
      e => e._id !== emp._id
    );

    this.activities = [
      {
        _id: Date.now(),
        actor: 'Admin',
        actorRole: 'Admin',
        action: 'removed employee',
        target: emp.name,
        time: 'Just now',
        icon: '🗑️'
      },
      ...this.activities
    ];

    this.showDeleteConfirm = null;

    this.showToast(`${emp.name} removed`, 'error');
  }

 approveRequest(req: Request): void {

  this.authService
    .approveUser(String(req._id))
    .subscribe({

      next: () => {

        // remove request card from UI
        this.requests = this.requests.filter(
          r => r._id !== req._id
        );

        // success toast
        this.showToast(
          `${req.name} approved successfully`
        );
      },

      error: (err) => {

        console.log(err);

        this.showToast(
          'Approval failed',
          'error'
        );
      }
    });
}

  rejectRequest(req: Request): void {

  this.authService
    .rejectUser(String(req._id))
    .subscribe({

      next: () => {

        // remove request from UI
        this.requests = this.requests.filter(
          r => r._id !== req._id
        );

        // show toast
        this.showToast(
          `${req.name} rejected`,
          'error'
        );
      },

      error: (err) => {

        console.log(err);

        this.showToast(
          'Reject failed',
          'error'
        );
      }
    });
}

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }
}