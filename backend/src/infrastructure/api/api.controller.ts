import { Controller, Get } from '@nestjs/common';
import { ApiService } from './api.service';

@Controller('api-test')
export class ApiController {

  constructor(private api: ApiService) {}

  @Get()
  async test() {
    const test=await  this.api.fetchFromAPi();
    const podaciApi= test[0]
    const podaci=await this.api.mapirajApiUPodaci(podaciApi)
    const podaci2=await this.api.mapirajAlerts(podaciApi);
    console.log(test)
    console.log(podaci)
    console.log(podaci2)
    return podaci;
  }
}
