import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { UsersModule } from './features/users/users.module';
import { AuthService } from './core/services/auth.service';

export function initializeApp(authService: AuthService) {
  return () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('currentUser');
    console.log('APP_INITIALIZER: App starting...');
    console.log('APP_INITIALIZER: Token exists:', !!token);
    console.log('APP_INITIALIZER: User exists:', !!user);
    return Promise.resolve();
  };
}

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatSnackBarModule,
    AppRoutingModule,
    CoreModule,
    UsersModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AuthService],
      multi: true
    }
  ],
})
export class AppModule {}
