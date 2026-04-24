declare module 'unzipper' {
  import { Readable } from 'stream';
  
  export interface File {
    path: string;
    type: string;
    stream(): Readable;
  }
  
  export interface ExtractOptions {
    path: string;
  }
  
  export function extract(
    source: string | Readable,
    destination: string | ExtractOptions
  ): {
    on(event: 'close' | 'error', listener: () => void): this;
  };
  
  export function parse(
    source: string | Readable
  ): {
    on(event: 'entry' | 'close' | 'error', listener: (entry: File) => void): this;
  };
}