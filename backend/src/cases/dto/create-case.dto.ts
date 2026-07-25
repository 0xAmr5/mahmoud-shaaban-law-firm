import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCaseDto {
  @IsString()
  @IsNotEmpty({ message: 'رقم القضية مطلوب' })
  caseNumber: string;

  @IsString()
  @IsNotEmpty({ message: 'عنوان القضية مطلوب' })
  title: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  court?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsNotEmpty({ message: 'معرف الموكل مطلوب' })
  clientId: string;

  @IsString()
  @IsNotEmpty({ message: 'معرف المكتب مطلوب' })
  officeId: string;

  @IsString()
  @IsOptional()
  assignedToId?: string;
}