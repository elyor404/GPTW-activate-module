import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  avatar: string;
  company: string;
  role: 'GPTW Admin' | 'Consultant';
  selected: boolean;
}

@Component({
  selector: 'app-team-members-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './team-members-page.component.html',
  styleUrl: './team-members-page.component.scss'
})
export class TeamMembersPageComponent {
  searchQuery = signal('');
  currentPage = signal(1);
  totalPages = 6;

  teamMembers: TeamMember[] = [
    {
      id: 1,
      name: 'Penelope Morozchenko',
      email: 'john.doe@google.com',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      company: 'Globex International',
      role: 'GPTW Admin',
      selected: false
    },
    {
      id: 2,
      name: 'Hermelinda Gumkowski',
      email: 'hermelinda.gumkowski@yahoo.com',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      company: 'Volkman - Nicolas',
      role: 'GPTW Admin',
      selected: false
    },
    {
      id: 3,
      name: 'Krysta Leschke',
      email: 'krysta.leschke@gmail.com',
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
      company: 'Schmeler, Corkery and Winthei...',
      role: 'GPTW Admin',
      selected: false
    },
    {
      id: 4,
      name: 'Yoshito Thoreau',
      email: 'yoshito.thoreau@aol.com',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      company: 'Luettgen, Crona and Jast',
      role: 'GPTW Admin',
      selected: false
    },
    {
      id: 5,
      name: 'Clarabelle Blumenkrantz',
      email: 'clara.blumenkrantz@gmail.com',
      avatar: 'https://randomuser.me/api/portraits/women/42.jpg',
      company: 'Ankunding, Farrell and Quitzon',
      role: 'Consultant',
      selected: false
    },
    {
      id: 6,
      name: 'Eusebio Crona',
      email: 'eusebio.crona@gmail.com',
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
      company: 'Bernhard - Leschke',
      role: 'Consultant',
      selected: false
    }
  ];

  selectAll = false;

  toggleSelectAll(): void {
    this.selectAll = !this.selectAll;
    this.teamMembers.forEach(member => member.selected = this.selectAll);
    this.updateSelectedCount();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage.set(page);
    }
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  selectedCountSignal = signal(0);

  get selectedCount(): number {
    return this.teamMembers.filter(m => m.selected).length;
  }

  updateSelectedCount(): void {
    this.selectedCountSignal.set(this.teamMembers.filter(m => m.selected).length);
  }

  onCheckboxChange(): void {
    this.updateSelectedCount();
    this.selectAll = this.teamMembers.every(m => m.selected);
  }

  clearSelection(): void {
    this.selectAll = false;
    this.teamMembers.forEach(member => member.selected = false);
    this.updateSelectedCount();
  }

  onAssignCompany(): void {
    // Placeholder for assign company action
  }

  onDeleteSelected(): void {
    // Placeholder for delete action
  }

  onEditSelected(): void {
    // Placeholder for edit action
  }
}
