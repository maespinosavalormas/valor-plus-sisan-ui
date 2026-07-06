import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-elsa-list-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <section class="elsa-list-page" data-testid="elsa-list-page">
      <h1>Formularios ELSA</h1>
      <p class="muted">Listado de cuestionarios ELSA creados por el usuario.</p>
      <button mat-raised-button color="primary" (click)="router.navigate(['/estilos-vida', 'nuevo'])" data-testid="elsa-new-button">
        Nuevo cuestionario ELSA
      </button>
    </section>
  `,
  styles: [
    `
      .elsa-list-page {
        padding: 1rem;
      }
      .muted {
        color: #757575;
        margin-bottom: 1.5rem;
      }
    `,
  ],
})
export class ElsaListPageComponent {
  constructor(public router: Router) {}
}