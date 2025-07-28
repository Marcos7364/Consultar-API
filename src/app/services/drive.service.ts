import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DriveService {
  private readonly FOLDER_ID = '1FJRAoKK4IjSeXVkE5Hfz1QwuGLukIL3k';
  
  constructor(private http: HttpClient) {}

  getDownloadUrl(fileId: string): string {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  getViewUrl(fileId: string): string {
    return `https://drive.google.com/file/d/${fileId}/view`;
  }
}