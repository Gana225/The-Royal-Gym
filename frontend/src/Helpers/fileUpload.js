import imageCompression from 'browser-image-compression';
import axios from 'axios';
import { loadAccessToken } from '../api/auth';
import { server_domain } from './Domain';

/**
 * HIGH-PERFORMANCE SECURE UPLOAD
 * 1. Verifies User Auth
 * 2. Compresses Image (background worker)
 * 3. Fetches Signed Token from Django
 * 4. Uploads to Cloudinary
 */
export const secureSmartUpload = async (file, onProgress = () => {}) => {
  try {
    let fileToUpload = file;

    // 1. COMPRESSION (Performance Boost)
    if (file.type.startsWith('image/')) {
      const compressionOptions = {
        maxSizeMB: 10,           // Cloudinary Limit
        maxWidthOrHeight: 3840,  // Keep 4K Quality
        useWebWorker: true,      // UI won't freeze
        initialQuality: 0.8,
      };
      // Only compress if larger than 2MB to save time
      if (file.size > 2 * 1024 * 1024) {
        fileToUpload = await imageCompression(file, compressionOptions);
      }
    }

    // 2. GET SECURE SIGNATURE FROM DJANGO
    const token = loadAccessToken();
    const sigResponse = await axios.get(`${server_domain}api/cloudinary-signature/`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const { signature, timestamp, api_key, cloud_name, folder } = sigResponse.data;

    // 3. PREPARE SIGNED FORMDATA
    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('api_key', api_key);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('folder', folder);

    // 4. UPLOAD DIRECTLY TO CLOUDINARY (High Speed)
    const uploadRes = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`,
      formData,
      {
        onUploadProgress: (e) => {
          const progress = Math.round((e.loaded * 100) / e.total);
          onProgress(progress);
        }
      }
    );

    return {
      success: true,
      secure_url: uploadRes.data.secure_url,
      public_id: uploadRes.data.public_id
    };

  } catch (error) {
    console.error("Secure Upload Failed:", error);
    return { success: false, error: error.message };
  }
};