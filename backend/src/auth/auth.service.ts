import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // 1️⃣ التسجيل مع توليد رمز OTP
  async register(dto: RegisterDto) {
    const existingEmail = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingEmail) throw new BadRequestException('البريد الإلكتروني مستخدم بالفعل!');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

const user = await this.prisma.user.create({
  data: {
    fullName: dto.fullName,
    email: dto.email,
    phone: dto.phone,
    password: hashedPassword,
    role: 'ADMIN' as any, 
  },
});

    if (dto.otpChannel === 'WHATSAPP') {
      console.log(`📱 [WhatsApp OTP] إرسال الرمز ${otpCode} إلى الرقم: ${dto.phone}`);
    } else {
      console.log(`📧 [Email OTP] إرسال الرمز ${otpCode} إلى البريد: ${dto.email}`);
    }

    return {
      message: `تم إنشاء الحساب بنجاح! تم إرسال رمز التأكيد إلى ${dto.otpChannel === 'WHATSAPP' ? 'الواتساب' : 'البريد الإلكتروني'}`,
      userId: user.id,
      otpCode,
    };
  }

  // 2️⃣ تسجيل الدخول بالإيميل أو برقم الموبايل
  async login(loginIdentifier: string, pass: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: loginIdentifier.toLowerCase() },
          { phone: loginIdentifier },
        ],
      },
    });

    if (!user) throw new UnauthorizedException('بيانات الدخول غير صحيحة!');

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new UnauthorizedException('بيانات الدخول غير صحيحة!');

    const payload = { sub: user.id, email: user.email, role: user.role, officeId: user.officeId };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        officeId: user.officeId || user.id,
      },
    };
  }
}