import { Equipment } from './equipment.model';

export interface SessionEquipment {
  id?: number;
  equipment: Equipment;
  quantityUsed: number;
}

export interface EquipmentReservation {
  id: number;
  quantityUsed: number;
  session: {
    id: number;
    name: string;
    startAt: string;
    endAt: string;
    salle?: {
      id: number;
      name: string;
    };
  };
}
