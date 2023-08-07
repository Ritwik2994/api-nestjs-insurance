import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UploadDto {
  @ApiProperty({ required: true, description: 'file name' })
  @IsString()
  name: string;
}
