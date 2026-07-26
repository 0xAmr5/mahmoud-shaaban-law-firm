import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف' })
  @IsString()
  email: string; 

  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  @IsString()
  password: string;
}