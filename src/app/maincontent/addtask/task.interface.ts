export interface TaskInterface {
  id?: number | string; // Optional, von Firebase generiert
  assignedTo?: string[];
  category: string; // Nicht optional
  created?: Date;
  date: string; // Nicht optional
  description?: string;
  edited?: Date;
  priority?: 'urgent' | 'medium' | 'low';
  subtask?: { title: string; completed: boolean }[]; // Oder Subtask-Objekt-Array mit status erledigt oder nicht
  title: string; // Nicht optional
}
