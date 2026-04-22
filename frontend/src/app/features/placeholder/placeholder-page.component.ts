import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-placeholder-page',
  standalone: true,
  templateUrl: './placeholder-page.component.html',
  styleUrl: './placeholder-page.component.scss'
})
export class PlaceholderPageComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly title = toSignal(
    this.route.data.pipe(map((d) => (typeof d['title'] === 'string' ? d['title'] : 'PLUS+'))),
    { initialValue: 'PLUS+' }
  );
}
