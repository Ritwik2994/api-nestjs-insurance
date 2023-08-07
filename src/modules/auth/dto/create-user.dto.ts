import { ApiProperty } from '@nestjs/swagger';
import { IsBase64, IsEmail, IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ required: true, description: 'Email of user' })
  @IsNotEmpty()
  @IsString({ message: 'Email can not be only numbers' })
  @IsEmail()
  email: string;

  @ApiProperty({ nullable: false, description: "enter the user's password" })
  @IsString()
  @IsNotEmpty()
  @IsBase64()
  readonly password: string;

  role: string;
}

export class CreateUserDto extends LoginDto {
  @ApiProperty({ required: true, description: 'Email of user' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?!.*?\ \ )[A-Za-z ]+$/, {
    message: 'Invalid first name format'
  })
  @MaxLength(50, { message: 'First Name must not be greater than 50' })
  name: string;
}
