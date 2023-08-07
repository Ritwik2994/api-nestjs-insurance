import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { PaginationDto } from '../../../shared/dto/pagination.dto';
import { StatusEnum } from '../../../shared/enums/status.enum';

export class FindAllClientDto extends PaginationDto {
  @ApiProperty({ required: false, description: 'enter the status option' })
  @IsOptional()
  @IsEnum(StatusEnum, { message: `status order must be from [${Object.values(StatusEnum).join(', ')}]` })
  status?: StatusEnum;
}
