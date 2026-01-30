import { Controller, Get } from '@nestjs/common';
import { ApiService } from './api.service';

@Controller('api-test')
export class ApiController {

  constructor(private api: ApiService) {}

  @Get()
  async test() {
    return this.api.fetchFromAPi();
  }
}
