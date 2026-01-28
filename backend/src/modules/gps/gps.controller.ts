import { Body, Controller,  Delete,  Get,   Put,   Query } from "@nestjs/common";
import { GPSService } from "./gps.service";
import { GpsDTO } from "./gps.dto";

@Controller("gps")
export class GPSController{
    constructor(private readonly service: GPSService)
    {
        
    }

    @Get('zadnjaLokacija')
    vratiZadnjuLokaciju(@Query(`deviceId`)deviceId: string,){
        return this.service.vratiZadnjuLokaciju(deviceId)
    }

    @Get('ruta')
    vratiRutu(@Query('deviceId')deviceId: string,
                @Query('dan')dan: string)
    {
        return this.service.getRutuZaVozilo(deviceId, dan)
    }

    @Put('savePut')
    sacuvajPut(@Body()body:{deviceId:string, GPSDTO: GpsDTO, timestamp: string}){
        return this.service.sacuvajTacku(body.deviceId, body.GPSDTO, body.timestamp)
    }

    @Delete('ObrisiZaDan')
    obrisiZaDan(@Query('deviceId')deviceId:string, @Query('dan')dan:string)
    {
        return this.service.deleteGpsRutuZaDan(deviceId, dan)
    }
}