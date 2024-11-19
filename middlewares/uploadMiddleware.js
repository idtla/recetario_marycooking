const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;

// Asegurarse de que el directorio de uploads existe
const uploadsDir = path.join(__dirname, '../public/uploads/recipes');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes'));
        }
    }
});

const processImage = async (buffer, options = {}) => {
    const {
        width = 800,
        height = null,
        quality = 80
    } = options;

    return sharp(buffer)
        .resize(width, height, {
            fit: 'inside',
            withoutEnlargement: true
        })
        .jpeg({ quality })
        .toBuffer();
};

const uploadMiddleware = {
    fields: upload.fields([
        { name: 'imagenDestacada', maxCount: 1 },
        { name: 'imagenesAdicionales', maxCount: 5 }
    ]),

    processAndSave: async (req, res, next) => {
        try {
            const images = {
                destacada: null,
                adicionales: []
            };

            // Procesar imagen destacada
            if (req.files.imagenDestacada) {
                const file = req.files.imagenDestacada[0];
                const processedImage = await processImage(file.buffer, { width: 1200 });
                const filename = `destacada-${uuidv4()}.jpg`;
                await sharp(processedImage)
                    .toFile(path.join(uploadsDir, filename));
                images.destacada = `/uploads/recipes/${filename}`;
            }

            // Procesar imágenes adicionales
            if (req.files.imagenesAdicionales) {
                for (const file of req.files.imagenesAdicionales) {
                    const processedImage = await processImage(file.buffer, { width: 800 });
                    const filename = `adicional-${uuidv4()}.jpg`;
                    await sharp(processedImage)
                        .toFile(path.join(uploadsDir, filename));
                    images.adicionales.push(`/uploads/recipes/${filename}`);
                }
            }

            req.processedImages = images;
            next();
        } catch (error) {
            next(error);
        }
    }
};

module.exports = uploadMiddleware; 