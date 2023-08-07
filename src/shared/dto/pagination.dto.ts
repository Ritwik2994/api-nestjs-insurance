import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

import { SortEnum } from '../enums/sort.enum';

export class PaginationDto {
  @ApiProperty({ required: false, description: 'enter the page' })
  @IsOptional()
  nextPageToken?: string;

  @ApiProperty({ required: false, description: 'enter the limit for a page', example: 10, default: 10 })
  @Min(1, { message: 'Limit must not be less than 1' })
  @Max(100, { message: 'Limit must not be greater than 100' })
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  limit?: number;

  @ApiProperty({ required: false, description: 'enter the searching term' })
  @IsString()
  @Transform(({ value }) => value.toLowerCase())
  @IsOptional()
  search?: string;

  @ApiProperty({ required: false, description: 'enter the sortType option', default: SortEnum.DESC })
  @IsOptional()
  @IsEnum(SortEnum, { message: `sort order must be from [${Object.values(SortEnum).join(', ')}]` })
  sortOrder?: SortEnum;

  @ApiProperty({ required: false, description: 'enter the sortField option', default: 'createdAt' })
  @IsOptional()
  sortField?: string;
}
