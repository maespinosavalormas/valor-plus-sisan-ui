import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { checkAuth } from './features/auth/data-access/store/auth.actions';

@Component({
  selector: 'app-root',
  template: ` <router-outlet></router-outlet> `,
  standalone: true,
  imports: [RouterModule],
})
export class AppComponent implements OnInit {
  title = 'sisan-app';

  constructor(private store: Store) {}

  ngOnInit() {
    console.log('AppComponent: ngOnInit - despachando checkAuth');
    // Verificar autenticación al iniciar la aplicación
    this.store.dispatch(checkAuth());
  }
}
