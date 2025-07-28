export interface Libro {
  id?: number;
  titulo: string;
  autor: string;
  descripcion: string;
  img_url?: string;
  pdf_url?: string;
  categoria_id?: number;
  created_at?: Date;
  updated_at?: Date;
  driveFileId?: string; // Add this property
  // Añade más propiedades según tu modelo de datos
}