import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    description: 'The user’s email address',
    example: 'hossam@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The user’s password',
    example: '123456789aA$',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}
