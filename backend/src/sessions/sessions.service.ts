import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSessionDto) {
    try {
      // 1. التأكد من وجود القضية أولاً
      const existingCase = await this.prisma.case.findUnique({
        where: { id: dto.caseId },
      });

      if (!existingCase) {
        throw new NotFoundException(`القضية برقم ID (${dto.caseId}) غير موجودة في قاعدة البيانات`);
      }

      // 2. تحويل التاريخ بأمان
      const parsedDate = new Date(dto.sessionDate);
      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestException('صيغة تاريخ الجلسة غير صحيحة');
      }

      // 3. إنشاء الجلسة
      return await this.prisma.session.create({
        data: {
          sessionDate: parsedDate,
          courtBranch: dto.courtBranch || undefined,
          requirements: dto.requirements || undefined,
          decision: dto.decision || undefined,
          caseId: dto.caseId,
        },
        include: {
          case: {
            include: {
              client: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('❌ Error creating session:', error);
      throw new BadRequestException(
        `خطأ في البيانات أو صيغة الـ caseId: ${error.message || 'تأكد من صحة البيانات المبعوثة'}`
      );
    }
  }

  async findByCase(caseId: string) {
    return this.prisma.session.findMany({
      where: { caseId },
      orderBy: { sessionDate: 'desc' },
    });
  }

  async findUpcoming(officeId: string) {
    if (!officeId) {
      throw new BadRequestException('معرف المكتب officeId مطلوب');
    }

    return this.prisma.session.findMany({
      where: {
        case: {
          officeId: officeId,
        },
        sessionDate: {
          gte: new Date(),
        },
      },
      include: {
        case: {
          include: {
            client: true,
          },
        },
      },
      orderBy: { sessionDate: 'asc' },
    });
  }
}