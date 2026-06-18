import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Las credenciales se leen automáticamente de tu archivo .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configurar el almacén para los Vouchers (Comprobantes)
const storageVouchers = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ipc-web/vouchers',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  } as any,
});

// Configurar el almacén para los Tickets de Soporte
const storageTickets = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ipc-web/tickets',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  } as any,
});

// Middlewares listos para exportar y usar en tus rutas
export const uploadVoucher = multer({ storage: storageVouchers });
export const uploadTicket = multer({ storage: storageTickets });
export { cloudinary };