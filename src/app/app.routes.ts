import { Routes } from '@angular/router';
import { MaincontentComponent } from './maincontent/maincontent.component';
import { PolicyComponent } from './policy/policy.component';
import { ImprintComponent } from './imprint/imprint.component';

export const routes: Routes = [
    { path: '', component: MaincontentComponent },
    { path: 'policy', component: PolicyComponent },
    { path: 'imprint', component: ImprintComponent }
];
