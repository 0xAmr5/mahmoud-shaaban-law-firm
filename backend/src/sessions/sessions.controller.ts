import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  create(@Body() dto: CreateSessionDto) {
    return this.sessionsService.create(dto);
  }

  @Get('case/:caseId')
  findByCase(@Param('caseId') caseId: string) {
    return this.sessionsService.findByCase(caseId);
  }

  @Get('upcoming')
  findUpcoming(@Query('officeId') officeId: string) {
    return this.sessionsService.findUpcoming(officeId);
  }
}