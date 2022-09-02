export interface Database {
  checksum(): ArrayBuffer;
}

export interface DatabaseRecord {
  checksum(): ArrayBuffer;
}

export interface DatabaseLookup<P extends { [key: string]: string }> {
  find(params: P): AsyncIterator<DatabaseRecord>;
  pick(params: P, records: DatabaseRecord[]): Promise<DatabaseRecord>;
}

export interface DatabaseNotifier {
  addListener(listener: () => void): void;
  removeListener(listener: () => void): void;
}
