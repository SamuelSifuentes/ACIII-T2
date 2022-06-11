import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TelaComponent } from './tela/tela.component';

const routes: Routes = [
  {path:'tela',component:TelaComponent},
  {path:'**',redirectTo:'tela'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
