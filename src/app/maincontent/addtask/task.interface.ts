export interface Subtask {
  title: string;
  completed: boolean;
  isEditing?: boolean;
}

export interface TaskInterface {
  id?: string; // Optional, von Firebase generiert
  assignedTo?: string[];
  category: string | null; // Nicht optional
  created?: Date;
  date: string; // Nicht optional
  description?: string;
  edited?: Date;
  priority?: 'urgent' | 'medium' | 'low';
  subtask?: Subtask[]; // Oder Subtask-Objekt-Array mit status erledigt oder nicht
  title: string; // Nicht optional
  status: 'Todo' | 'In Progress' | 'Await Feedback' | 'Done';
}
