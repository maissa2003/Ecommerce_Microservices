import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RoomService } from '../../../services/room.service';
import { AuthService } from '../../../services/auth.service';
import { Room } from '../../../models/room.model';

@Component({
  selector: 'app-trainer-rooms',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trainer-rooms.component.html',
  styleUrls: ['./trainer-rooms.component.css']
})
export class TrainerRoomsComponent implements OnInit {
  rooms: Room[] = [];
  trainerRooms: Room[] = [];
  loading: boolean = true;
  currentUserId: number | null = null;

  constructor(
    private roomService: RoomService,
    private authService: AuthService,
    private router: Router // ✅ Added Router
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    if (!this.currentUserId) {
      console.warn('Trainer ID not found');
      this.loading = false;
      return;
    }
    this.loadRooms();
  }

  loadRooms(): void {
    this.roomService.getAllRooms().subscribe({
      next: (data: Room[]) => {
        this.rooms = data;
        this.trainerRooms = this.rooms.filter(
          room => room.session?.user?.id === this.currentUserId
        );
        this.loading = false;
      },
      error: err => {
        console.error('Error loading rooms:', err);
        this.loading = false;
      }
    });
  }

  // ✅ Navigate to the live meet room
  enterRoom(room: Room): void {
    if (room.session?.id && room.roomCode) {
      this.router.navigate(['/live', room.session.id, room.roomCode]);
    } else {
      console.warn('Missing session id or roomCode', room);
    }
  }

  getRoomStatus(room: Room): string {
    const now = new Date();
    const start = new Date(room.startAt);
    const end = new Date(room.endAt);
    if (now < start) return 'UPCOMING';
    if (now > end) return 'ENDED';
    return 'ONGOING';
  }
}
