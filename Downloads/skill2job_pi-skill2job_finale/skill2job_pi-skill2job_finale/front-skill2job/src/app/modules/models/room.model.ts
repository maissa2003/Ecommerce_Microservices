export interface Room {
  id: number;
  roomCode: string;
  meetingLink: string;
  startAt: string;
  endAt: string;

  session?: {
    id: number;
    name: string;
    type: string;
    startAt: string;
    endAt: string;
    capacity: number;
    participants?: { id: number; username: string }[];

    user?: {
      id: number;
      username: string;
    };
  };
}
