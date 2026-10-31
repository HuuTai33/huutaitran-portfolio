import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoaderComponent } from '../../components/loader/loader.component';

@Component({
  selector: 'app-web-development',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  templateUrl: './web-development.component.html',
  styleUrl: './web-development.component.scss'
})
export class WebDevelopmentComponent {}
