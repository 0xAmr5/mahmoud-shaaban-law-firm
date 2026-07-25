import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateLawyerDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  phone: string;

  @MinLength(6)
  password: string;

  @IsNotEmpty()
  officeId: string;
}