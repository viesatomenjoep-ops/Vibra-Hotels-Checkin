import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadSignature(base64Image: string, hotelId: string): Promise<string> {
  try {
    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
      folder: `viesa/signatures/${hotelId}`,
      format: 'png',
      quality: 'auto',
      fetch_format: 'auto',
    });
    return uploadResponse.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw new Error('Uploaden van handtekening mislukt');
  }
}

export async function uploadIdPhoto(base64Image: string, hotelId: string): Promise<string> {
  try {
    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
      folder: `viesa/id_photos/${hotelId}`,
      format: 'jpg',
      quality: 'auto',
      fetch_format: 'auto',
    });
    return uploadResponse.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error (ID Photo):', error);
    throw new Error('Uploaden van ID bewijs mislukt');
  }
}
