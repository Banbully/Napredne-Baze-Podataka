import { Controller, Delete, Get, Query } from "@nestjs/common";
import { AlertsService } from "./alerts.service";

@Controller("upozorenja")
export class AlertsController{
    constructor(private readonly upozorenja: AlertsService)
    {}

    @Get()
    get(@Query('deviceId')deviceId: string)
    {
        return this.upozorenja.getAktivna(deviceId);
    }



    @Delete()
    obrisiUpozorenja(@Query('deviceId')deviceId: string)
    {
        return this.upozorenja.obrisiUpozorenja(deviceId)
    }
    
}
