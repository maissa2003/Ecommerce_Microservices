import { SessionEquipment } from './session-equipment.model';
import { Salle } from './salle.model';
import { User } from './user.model';

export type SessionType = 'ONLINE' | 'ONSITE';

export interface Session {
  id?: number;
  name: string;
  type: SessionType;
  startAt: string;
  endAt: string;
  capacity: number;
  room?: {
    id: number;
    roomCode?: string;
  };
  salle?: Salle;
  user?: User;
  participants?: User[];
  sessionEquipments?: SessionEquipment[];
}
