import pako from "pako";

export function compress(obj: any): string {
  const minified = JSON.stringify(obj);
  const compressed = pako.deflate(minified);
  return btoa(String.fromCharCode(...compressed));
}

export function decompress(compressed: string): any {
  const binaryString = atob(compressed);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const decompressed = pako.inflate(bytes);
  return JSON.parse(new TextDecoder().decode(decompressed));
}
