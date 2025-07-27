export interface RegisterResponse {
  usuario: {
    id: number;
    nombre: string;
    email: string;
    rol: string;

  };
  token: string;
  emailSent: boolean;
  message?: string;
}