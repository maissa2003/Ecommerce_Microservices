import { Bloc } from './blocs.model';

export interface Salle {
  id?: number;
  name: string;
  capacity: number;
  status: string;
  bloc?: Bloc;
}
