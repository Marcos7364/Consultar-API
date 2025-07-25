import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LibrosRoutingModule } from './libros-routing.module';
import { Libros } from './libros';


@NgModule({
  declarations: [
    Libros
  ],
  imports: [
    CommonModule,
    LibrosRoutingModule
  ]
})
export class LibrosModule { }
