import { IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateSessionDto {
  @IsDateString({}, { message: 'صيغة تاريخ الجلسة غير صحيحة' })
  @IsNotEmpty({ message: 'تاريخ الجلسة مطلوب' })
  sessionDate: string;

  @IsString()
  @IsOptional()
  courtBranch?: string;

  @IsString()
  @IsOptional()
  requirements?: string;

  @IsString()
  @IsOptional()
  decision?: string;

  @IsString()
  @IsNotEmpty({ message: 'معرف القضية caseId مطلوب' })
  caseId: string;
}