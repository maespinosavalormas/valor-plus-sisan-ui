import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/** Redirects legacy `/casos/:casoId/expediente` to case detail tamizajes tab. */
@Component({
  standalone: true,
  template: '',
})
export class ExpedienteRedirectComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const casoId = this.route.snapshot.paramMap.get('casoId');
    void this.router.navigate(['/cases', casoId], {
      queryParams: { tab: 'tamizajes' },
      replaceUrl: true,
    });
  }
}
