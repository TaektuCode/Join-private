import { Routes } from '@angular/router';
import { MaincontentComponent } from './maincontent/maincontent.component';
import { PolicyComponent } from './policy/policy.component';
import { ImprintComponent } from './imprint/imprint.component';
import { SummaryComponent } from './maincontent/summary/summary.component';
import { AddtaskComponent } from './maincontent/addtask/addtask.component';
import { BoardComponent } from './maincontent/board/board.component';
import { ContactsComponent } from './maincontent/contacts/contacts.component';
import { HelpComponent } from './help/help.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './login/signup/signup.component';
import { authGuard } from './auth-functional.guard/auth-functional.guard.component';
import { alreadyLoggedInGuard } from './auth-functional.guard/already-logged-in.guard.';

/**
 * Defines the routes for the application.
 */
export const routes: Routes = [
  {
    path: '',
    component: MaincontentComponent,
    canActivate: [authGuard],
  },
  { path: 'policy', component: PolicyComponent },
  { path: 'imprint', component: ImprintComponent },
  { path: 'summary', component: SummaryComponent, canActivate: [authGuard] },
  { path: 'addtask', component: AddtaskComponent, canActivate: [authGuard] },
  { path: 'board', component: BoardComponent, canActivate: [authGuard] },
  { path: 'contacts', component: ContactsComponent, canActivate: [authGuard] },
  { path: 'help', component: HelpComponent },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [alreadyLoggedInGuard],
  },
  { path: 'signup', component: SignupComponent },
];