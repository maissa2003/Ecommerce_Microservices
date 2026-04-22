import { Salle } from './salle.model';

export interface Bloc {
  id?: number;
  nom: string;
  location: string;
  salles?: Salle[];
}
