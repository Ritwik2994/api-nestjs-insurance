import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

import { MulterFile } from '../interfaces/multer-file.interface';

@Injectable()
export class ParseFilePipeBuilder {
  private fileTypeValidators: { fileType: string }[] = [];
  private fileSizeLimit: number = 1024 * 1024 * 1; // 1MB by default
  private fileIsRequired = true;

  addFileTypeValidator(validator: { fileType: string }): ParseFilePipeBuilder {
    this.fileTypeValidators.push(validator);
    return this;
  }

  setFileSizeLimit(limit: number): ParseFilePipeBuilder {
    this.fileSizeLimit = limit;
    return this;
  }

  build(options: { fileIsRequired: boolean }): PipeTransform {
    this.fileIsRequired = options.fileIsRequired;
    return new ParseFilePipe(this.fileTypeValidators, this.fileSizeLimit, this.fileIsRequired);
  }
}

class ParseFilePipe implements PipeTransform {
  constructor(
    private readonly fileTypeValidators: { fileType: string }[],
    private readonly fileSizeLimit: number,
    private readonly fileIsRequired: boolean
  ) {}

  transform(value: any): MulterFile {
    if (this.fileIsRequired && !value) {
      throw new BadRequestException('File is required');
    }

    if (value) {
      const file: MulterFile = value;

      if (file.size > this.fileSizeLimit) {
        throw new BadRequestException(`File size exceeds the limit of ${this.fileSizeLimit} bytes`);
      }

      if (this.fileTypeValidators.length > 0) {
        const fileExtension = file.originalname.split('.').pop();
        const validExtensions = this.fileTypeValidators.map((validator) => validator.fileType);

        if (!validExtensions.includes(fileExtension)) {
          throw new BadRequestException(`Invalid file type. Allowed types: ${validExtensions.join(', ')}`);
        }
      }

      return file;
    }

    return null;
  }
}
