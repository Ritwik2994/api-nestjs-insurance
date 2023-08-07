import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Dashboard')
export class AppController {
  /**
   * @description This is to check health of app
   * @returns Httpstatus 200 OK response
   * @author Ritwik Rohitashwa
   */
  @Get()
  @ApiOkResponse({ description: 'checks health of app' })
  healthCheck() {
    return HttpStatus.OK ? { status: HttpStatus.OK } : { status: HttpStatus.SERVICE_UNAVAILABLE };
  }
}
