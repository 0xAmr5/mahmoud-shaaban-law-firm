import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCaseDto } from './dto/create-case.dto';

@Injectable()
export class CasesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCaseDto) {
    try {
      // 1. التأكد من وجود الموكل أولاً
      const client = await this.prisma.client.findUnique({
        where: { id: dto.clientId },
      });

      if (!client) {
        throw new NotFoundException(`الموكل برقم (ID: ${dto.clientId}) غير موجود في القاعدة`);
      }

      // 2. إنشاء القضية
      return await this.prisma.case.create({
        data: {
          caseNumber: dto.caseNumber,
          title: dto.title,
          type: dto.type || undefined,
          court: dto.court || undefined,
          notes: dto.notes || undefined,
          clientId: dto.clientId,
          officeId: dto.officeId,
        },
        include: {
          client: true,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('❌ Error creating case:', error);
      throw new BadRequestException(
        `خطأ في البيانات المبعوثة أو صيغة الـ ID: ${error.message || 'تأكد من صحة الـ clientId والـ officeId'}`
      );
    }
  }

  async findAll(officeId: string) {
    if (!officeId) {
      throw new BadRequestException('معرف المكتب officeId مطلوب في الـ Query Params');
    }

    return this.prisma.case.findMany({
      where: { officeId },
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const legalCase = await this.prisma.case.findUnique({
      where: { id },
      include: { client: true },
    });
    if (!legalCase) throw new NotFoundException('القضية غير موجودة');
    return legalCase;
  }
}