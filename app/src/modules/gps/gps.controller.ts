import { Body, Controller,  Delete,  Get,   Param,   Put,   Query } from "@nestjs/common";
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

    @Put('savePut/:deviceId')
    sacuvajPut(@Param('deviceId')deviceId:string, @Body() GPSDTO:GpsDTO ){
        return this.service.sacuvajTacku(deviceId, GPSDTO)
    }

    @Delete('ObrisiZaDan')
    obrisiZaDan(@Query('deviceId')deviceId:string, @Query('dan')dan:string)
    {
        this.service.deleteGpsRutuZaDan(deviceId, dan)
    }

    @Get("radius")
    vratiURadijusu(@Query("lat") latitude: number,@Query("lng") longitude: number,@Query("radius") radius: number) 
    {
         return this.service.vratiURadijusu(Number(latitude),Number(longitude),Number(radius));
    }

    @Get("route-period/:deviceId")
  vratiRutuZaPeriod(@Param("deviceId") deviceId: string,@Query("start") start: string,@Query("end") kraj: string) 
    {
        return this.service.vratiRutuZaPeriod(deviceId, start, kraj);
    }
}