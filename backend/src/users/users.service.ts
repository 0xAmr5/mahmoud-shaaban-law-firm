import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLawyerDto } from './dto/create-lawyer.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // جلب المحامين المربوطين بالمكتب
  async findLawyersByOffice(officeId: string) {
    return this.prisma.user.findMany({
      where: { officeId },
      select: {
        id: true,
        fullName: true, // 👈 تعديل: استخدام fullName بدلاً من name
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
  }

  // إنشاء حساب محامي جديد
  async createLawyer(dto: CreateLawyerDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('هذا البريد الإلكتروني مستخدم بالفعل!');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        fullName: dto.name, // 👈 تعديل: إسناد name القادم من DTO لـ fullName
        email: dto.email,
        phone: dto.phone,
        password: hashedPassword,
        role: 'LAWYER',
        officeId: dto.officeId,
      },
      select: {
        id: true,
        fullName: true, // 👈 تعديل
        email: true,
        phone: true,
        role: true,
      },
    });
  }
}