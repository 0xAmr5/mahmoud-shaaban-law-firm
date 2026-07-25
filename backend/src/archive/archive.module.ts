import { Module } from '@nestjs/common';
import { ArchiveController } from './archive.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  controllers: [ArchiveController],
})
export class ArchiveModule {}