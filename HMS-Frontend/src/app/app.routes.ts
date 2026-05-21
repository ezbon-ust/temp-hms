import { Routes } from '@angular/router';
import {Login} from "./login/login";

import { User } from './user/user';
import { Dashboard } from './dashboard/dashboard';
import { Home} from './home/home';
import { Register } from './register/register';

export const routes: Routes = [
  { path: '', component:Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard }
]; 




