import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmDialogService, ConfirmDialogData } from '../../ui/confirm-dialog/confirm-dialog';

export interface Comment {
  id: string;
  author: string;
  message: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'completed';
  startDate: string;
  endDate?: string;
  assignedDate: string;
  responsible: string;
  effectiveness?: number; // Cambiado de progress a effectiveness
}

export interface AssociateProgramData {
  programs: Program[];
  selectedPrograms: string[];
}

@Component({
  selector: 'app-case-tasks',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule
  ],
  templateUrl: './case-tasks.component.html',
  styleUrl: './case-tasks.component.scss'
})
export class CaseTasksComponent {
  @Input() embedded: boolean = false;

  newComment: string = '';

  comments: Comment[] = [
    {
      id: '1',
      author: 'María García',
      message: 'Se ha iniciado la investigación del caso. Se contactó al cliente para obtener más información sobre el incidente reportado.',
      timestamp: 'Hace 2h'
    },
    {
      id: '2',
      author: 'Sistema',
      message: 'Estado cambiado de \'Abierto\' a \'En Progreso\'',
      timestamp: 'Hace 1h',
      isSystem: true
    },
    {
      id: '3',
      author: 'Carlos López',
      message: 'Se adjuntó evidencia fotográfica del sitio. Las imágenes muestran el estado actual de la situación.',
      timestamp: 'Hace 32 min'
    }
  ];

  addComment() {
    if (this.newComment.trim()) {
      const comment: Comment = {
        id: (this.comments.length + 1).toString(),
        author: 'Usuario Actual', // Hardcoded for now
        message: this.newComment,
        timestamp: 'Ahora'
      };
      this.comments.push(comment);
      this.newComment = '';
    }
  }

  files: File[] = [];

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        this.files.push(input.files[i]);
      }
    }
  }
}
