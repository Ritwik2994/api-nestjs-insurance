import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

import { PaginationDto } from '../../../shared/dto/pagination.dto';

export class FindAllPolicyDto extends PaginationDto {
  @ApiProperty({ required: false, description: 'enter the company name' })
  @IsOptional()
  @IsString()
  companyName?: string;
}
