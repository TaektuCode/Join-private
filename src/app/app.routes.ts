import { Routes } from '@angular/router';
import { MaincontentComponent } from './maincontent/maincontent.component';
import { PolicyComponent } from './policy/policy.component';
import { ImprintComponent } from './imprint/imprint.component';
import { SummaryComponent } from './maincontent/summary/summary.component';
import { AddtaskComponent } from './maincontent/addtask/addtask.component';
import { BoardComponent } from './maincontent/board/board.component';
import { ContactsComponent } from './maincontent/contacts/contacts.component';

export const routes: Routes = [
    { path: '', component: MaincontentComponent },
    { path: 'policy', component: PolicyComponent },
    { path: 'imprint', component: ImprintComponent },
    { path: 'summary', component: SummaryComponent },
    { path: 'addtask', component: AddtaskComponent },
    { path: 'board', component: BoardComponent },
    { path: 'contacts', component: ContactsComponent }
];
