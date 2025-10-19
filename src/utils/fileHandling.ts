/**
 * Validates file size
 * @param file File to validate
 * @param maxSizeMB Maximum size in MB
 * @returns True if valid, false otherwise
 */
export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Validates image file type
 * @param file File to validate
 * @returns True if valid, false otherwise
 */
export const validateImageType = (file: File): boolean => {
  const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return validImageTypes.includes(file.type);
};

/**
 * Validates audio file type
 * @param file File to validate
 * @returns True if valid, false otherwise
 */
export const validateAudioType = (file: File): boolean => {
  const validAudioTypes = [
    'audio/mpeg', 'audio/mp3', 'audio/wav', 
    'audio/x-wav', 'audio/aiff', 'audio/x-aiff'
  ];
  return validAudioTypes.includes(file.type);
};

/**
 * Creates and revokes object URL safely
 * @param file File to create URL for
 * @param previousUrl Previous URL to revoke (if any)
 * @returns New object URL
 */
export const createObjectURL = (file: File, previousUrl: string | null = null): string => {
  if (previousUrl) {
    URL.revokeObjectURL(previousUrl);
  }
  return URL.createObjectURL(file);
}; 