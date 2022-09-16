export function getImageFileName(fileName: string | undefined, path: string): string {
  if (fileName) {
    return fileName;
  }
  const pathChunks = path.split('/');
  return pathChunks[pathChunks.length - 1].split('.')[0];
}
