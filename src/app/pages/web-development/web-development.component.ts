import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoaderComponent } from '../../components/loader/loader.component';

export interface WebProject {
  title: string;
  image: string;
  url: string;
}

@Component({
  selector: 'app-web-development',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  templateUrl: './web-development.component.html',
  styleUrl: './web-development.component.scss'
})
export class WebDevelopmentComponent {
  readonly projects: readonly WebProject[] = [
    {
      title: 'Marina J Photographie',
      image: '/images/work_dev/converted_webp/marinajphotographie.webp',
      url: 'https://www.marinajphotographie.fr/'
    }
  ];
}
