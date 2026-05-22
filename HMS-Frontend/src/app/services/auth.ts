import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService { 

   private apiUrl =
    'https://project-mfjb2.vercel.app/api/auth';
  constructor(private http: HttpClient) {}

  login(data: any) {
    return this.http.post(
      `${this.apiUrl}/login`,
      data
    ); 
  }

  register(data:any) {
    return this.http.post(
      `${this.apiUrl}/register`,
      data
    )
  } 
  getPendingUsers() {

  return this.http.get(
    'https://project-mfjb2.vercel.app/api/admin/pending-users'
  );
}

approveUser(employeeId: string) {

  return this.http.patch(
    `https://project-mfjb2.vercel.app/api/admin/approve/${employeeId}`,
    {}
  );
}

rejectUser(employeeId: string) {

  return this.http.patch(
    `https://project-mfjb2.vercel.app/api/admin/reject/${employeeId}`,
    {}
  );
}

  getToken(){
    return localStorage.getItem('token')
  } 

  // SAVE TOKEN
  saveToken(token: string) {

    localStorage.setItem('token', token);
  }

  // LOGOUT
  logout() {

    localStorage.removeItem('token');
  }


}
