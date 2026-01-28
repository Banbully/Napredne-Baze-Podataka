import { Controller, Get, Query } from "@nestjs/common";
import { OdrzavanjeService } from "./maintenance.service";

@Controller()
export class OdrzavanjeController{
    constructor(private readonly service: OdrzavanjeService)
    {

    }

    @Get("predikcija")
    get(@Query('deviceId') deviceId: string, telemetry: any)
    {
        return this.service.evaluate(deviceId, telemetry)
    }
    
}