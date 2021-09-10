import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {AdminComponent} from './admin.component';
import {NgxPermissionsGuard} from 'ngx-permissions';
import {ActionComponent} from './header/action/action.component';
import {ProfileComponent} from './header/profile/profile.component';
import {ErrorPageComponent} from '../content/layout/snippets/error-page/error-page.component';
import { UsersComponent } from './users/users.component';
import { UsersEditComponent } from './users/users-edit/users-edit.component';
import { FundComponent } from './fund/fund.component';
import { FundEditComponent } from './fund/fund-edit/fund-edit.component';
import { ExpenceComponent } from './expence/expence.component';
import { ExpenceEditComponent } from './expence/expence-edit/expence-edit.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
    {
        path: 'admin',
        component: AdminComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['ADMIN', 'USER'],
                except: ['GUEST'],
                redirectTo: '/login'
            }
        },
        children: [
            {
                path: 'dashboard',
                component: DashboardComponent
            },
            {
                path: 'header/actions',
                component: ActionComponent
            },
            {
                path: 'profile',
                component: ProfileComponent
            },
            {
                path: 'users',
                component: UsersComponent
            },
            {
                path: 'users/addedit/:id',
                component: UsersEditComponent
            },
            {
                path: 'users/addedit',
                component: UsersEditComponent
            },
            {
                path: 'fund',
                component: FundComponent
            },
            {
                path: 'fund/addedit',
                component: FundEditComponent
            },
            {
                path: 'fund/addedit/:id',
                component: FundEditComponent
            },
            {
                path: 'expence',
                component: ExpenceComponent
            },
            {
                path: 'expence/addedit',
                component: ExpenceEditComponent
            },
            {
                path: 'expence/addedit/:id',
                component: ExpenceEditComponent
            }
        ]
    },
    {
        path: 'login',
        canActivate: [NgxPermissionsGuard],
        loadChildren: '../auth/auth.module#AuthModule',
        data: {
            permissions: {
                except: 'ADMIN'
            }
        },
    },
    {
        path: '404',
        component: ErrorPageComponent
    },
    {
        path: 'error/:type',
        component: ErrorPageComponent
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AdminRoutingModule {
}
