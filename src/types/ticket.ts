export interface TicketMessage {
  id: string;
  sender: 'Admin' | 'Dev';
  text: string;
  image: string | null;
  date: string;
  devName?: string;
}

export interface TicketData {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'Abierto' | 'Resuelto';
  image: string | null;
  imageName: string | null;
  messages?: TicketMessage[];
  adminAgreedToClose?: boolean;
  devAgreedToClose?: boolean;
}
