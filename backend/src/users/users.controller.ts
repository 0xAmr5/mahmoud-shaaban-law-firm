import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateLawyerDto } from './dto/create-lawyer.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 1️⃣ جلب جميع المحامين والموظفين التابعين لمكتب معين
  @Get('lawyers')
  async getLawyers(@Query('officeId') officeId: string) {
    return this.usersService.findLawyersByOffice(officeId);
  }

  // 2️⃣ إنشاء وتسجيل محامي جديد تحت إدارة المكتب
  @UseGuards(AuthGuard)
  @Post('lawyer')
  async createLawyer(@Body() dto: CreateLawyerDto) {
    return this.usersService.createLawyer(dto);
  }
}