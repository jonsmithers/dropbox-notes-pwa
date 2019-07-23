export interface File {
  name: string;
}
export interface PersistenceService {

  getAllFiles(): Promise<File[]>;

  updateFile(file: File): Promise<void>;
  addFile(file: File): Promise<void>;
}
