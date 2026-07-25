import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '../auth/auth.guard';
import * as fs from 'fs';

@Controller('archive')
export class ArchiveController {
  @UseGuards(AuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = './uploads/archive';
          // إنشاء المجلد تلقائياً إذا لم يكن موجوداً
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(pdf|doc|docx|xls|xlsx)$/i)) {
          return callback(
            new BadRequestException('عذراً، يُسمح فقط برفع ملفات PDF, Word, Excel!'),
            false,
          );
        }
        callback(null, true);
      },
      limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
    }),
  )
  uploadFile(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('لم يتم اختيار أي ملف!');
    return {
      message: 'تم رفع المستند إلى الأرشيف بنجاح! 📄',
      filename: file.filename,
      originalName: file.originalname,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      url: `/uploads/archive/${file.filename}`,
    };
  }
}