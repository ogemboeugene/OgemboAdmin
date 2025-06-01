import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadBytesResumable,
  getMetadata
} from 'firebase/storage';
import { storage } from './firebaseConfig';
// import authService from './authService'; // Temporarily disabled

/**
 * Firebase Storage Service for handling image uploads
 */
class FirebaseStorageService {
  
  /**
   * Upload an image file to Firebase Storage
   * @param {File} file - The image file to upload
   * @param {string} folder - The folder path in storage (e.g., 'projects', 'profiles')
   * @param {string} fileName - Optional custom filename (will generate if not provided)
   * @param {function} onProgress - Optional progress callback function
   * @returns {Promise<string>} - Returns the download URL with access token
   */  async uploadImage(file, folder = 'projects', fileName = null, onProgress = null) {
    try {
      // TODO: Add authentication back when ready
      // For now, proceed without authentication check
      console.log('Starting upload without authentication (temporary)');

      // Validate file type
      if (!this.isValidImageType(file)) {
        throw new Error('Invalid file type. Please upload an image file (JPEG, PNG, GIF, WebP).');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size too large. Please upload an image smaller than 5MB.');
      }

      // Generate unique filename if not provided
      const finalFileName = fileName || this.generateFileName(file.name);
      
      // Create storage reference
      const storageRef = ref(storage, `${folder}/${finalFileName}`);
      
      console.log('Uploading to Firebase Storage:', `${folder}/${finalFileName}`);
      console.log('Storage bucket:', storage.app.options.storageBucket);
      
      // Upload file with progress tracking if callback provided
      let uploadTask;
      if (onProgress) {
        uploadTask = uploadBytesResumable(storageRef, file);
        
        return new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              // Calculate progress percentage
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress(progress);
            },
            (error) => {
              console.error('Upload failed:', error);
              reject(this.handleUploadError(error));
            },
            async () => {
              try {
                // Upload completed successfully, get download URL
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                console.log('Upload successful, download URL:', downloadURL);
                resolve(downloadURL);
              } catch (error) {
                reject(new Error('Failed to get download URL: ' + error.message));
              }
            }
          );
        });
      } else {
        // Simple upload without progress tracking
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log('Upload successful, download URL:', downloadURL);
        return downloadURL;
      }
      
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  /**
   * Delete an image from Firebase Storage using its URL
   * @param {string} imageUrl - The full Firebase Storage URL
   * @returns {Promise<void>}
   */
  async deleteImage(imageUrl) {
    try {
      if (!imageUrl || !imageUrl.includes('firebase')) {
        throw new Error('Invalid Firebase Storage URL');
      }

      // Extract the file path from the URL
      const filePath = this.extractFilePathFromUrl(imageUrl);
      const storageRef = ref(storage, filePath);
      
      await deleteObject(storageRef);
      console.log('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error('Failed to delete image: ' + error.message);
    }
  }

  /**
   * Get image metadata (size, type, etc.)
   * @param {string} imageUrl - The Firebase Storage URL
   * @returns {Promise<object>} - Image metadata
   */
  async getImageMetadata(imageUrl) {
    try {
      const filePath = this.extractFilePathFromUrl(imageUrl);
      const storageRef = ref(storage, filePath);
      const metadata = await getMetadata(storageRef);
      
      return {
        size: metadata.size,
        contentType: metadata.contentType,
        timeCreated: metadata.timeCreated,
        updated: metadata.updated,
        downloadTokens: metadata.downloadTokens
      };
    } catch (error) {
      console.error('Error getting image metadata:', error);
      throw new Error('Failed to get image metadata: ' + error.message);
    }
  }

  /**
   * Generate a unique filename with timestamp and random string
   * @param {string} originalName - Original filename
   * @returns {string} - Unique filename
   */
  generateFileName(originalName) {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop().toLowerCase();
    return `${timestamp}_${randomString}.${extension}`;
  }

  /**
   * Validate if the file is a valid image type
   * @param {File} file - File to validate
   * @returns {boolean}
   */
  isValidImageType(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return allowedTypes.includes(file.type);
  }

  /**
   * Extract file path from Firebase Storage URL
   * @param {string} url - Firebase Storage URL
   * @returns {string} - File path
   */
  extractFilePathFromUrl(url) {
    try {
      // Firebase URLs format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
      const decodedUrl = decodeURIComponent(url);
      const pathMatch = decodedUrl.match(/\/o\/(.+?)\?/);
      return pathMatch ? pathMatch[1] : '';
    } catch (error) {
      throw new Error('Invalid Firebase Storage URL format');
    }
  }

  /**
   * Handle upload errors with user-friendly messages
   * @param {Error} error - Firebase error
   * @returns {Error} - User-friendly error
   */
  handleUploadError(error) {
    switch (error.code) {
      case 'storage/unauthorized':
        return new Error('You do not have permission to upload images.');
      case 'storage/canceled':
        return new Error('Upload was cancelled.');
      case 'storage/quota-exceeded':
        return new Error('Storage quota exceeded. Please try again later.');
      case 'storage/invalid-format':
        return new Error('Invalid file format. Please upload a valid image.');
      case 'storage/server-file-wrong-size':
        return new Error('File size mismatch. Please try uploading again.');
      default:
        return new Error(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Resize image before upload (using Canvas API)
   * @param {File} file - Original image file
   * @param {number} maxWidth - Maximum width
   * @param {number} maxHeight - Maximum height
   * @param {number} quality - Image quality (0-1)
   * @returns {Promise<File>} - Resized image file
   */
  async resizeImage(file, maxWidth = 1200, maxHeight = 800, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Failed to resize image'));
          }
        }, file.type, quality);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
}

// Export a singleton instance
const firebaseStorageService = new FirebaseStorageService();
export default firebaseStorageService;
