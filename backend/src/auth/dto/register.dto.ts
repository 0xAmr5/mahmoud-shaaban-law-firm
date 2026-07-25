import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'الاسم بالكامل مطلوب' })
  @IsString()
  fullName: string;

  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
  @IsEmail({}, { message: 'صيغة البريد الإلكتروني غير صحيحة' })
  @Matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, {
    message: 'عذراً، يُسمح فقط بتسجيل الحسابات باستخدام بريد @gmail.com!',
  })
  email: string;

  @IsNotEmpty({ message: 'رقم الهاتف مطلوب' })
  @Matches(/^201[0125][0-9]{8}$/, {
    message: 'يرجى إدخال رقم هاتف مصري صحيح يبدأ بـ 201 (مثال: 201064684164)',
  })
  phone: string;

  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  @MinLength(8, { message: 'يجب أن لا تقل كلمة المرور عن 8 عناصر' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'كلمة المرور ضعيفة! يجب أن تحتوي على حرف كبير (A-Z) وحرف صغير (a-z) ورقم أو رمز خاص (!@#$%^&*)',
  })
  password: string;

  @IsNotEmpty({ message: 'نوع تأكيد الـ OTP مطلوب' })
  otpChannel: 'EMAIL' | 'WHATSAPP';
}