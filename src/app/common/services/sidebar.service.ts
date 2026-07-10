import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private sidenav: MatSidenav | null = null;

  setSidenav(sidenav: MatSidenav) {
    this.sidenav = sidenav;
  }

  close() {
    if (this.sidenav) {
      this.sidenav.close();
    }
  }

  open() {
    if (this.sidenav) {
      this.sidenav.open();
    }
  }

  toggle() {
    if (this.sidenav) {
      this.sidenav.toggle();
    }
  }

  isOpen(): boolean {
    return this.sidenav ? this.sidenav.opened : false;
  }
}
