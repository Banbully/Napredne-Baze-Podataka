import { Body, Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";
import { AlertsService } from "./alerts.service";
import { telemetryDTO } from "../telemtrija/telemtrics.dto";
import { alertsDTO, alertsUpdateDTO } from "./alerts.dto";


@Controller("upozorenja")
export class AlertsController{
    constructor(private readonly upozorenja: AlertsService)
    {}


    @Post(`:deviceId`)
    async proceni(@Param('deviceId')deviceId:string,@Body() telemetryDTO:telemetryDTO)
    {
//         {
//   "batteryLevel": 5,
//   "engineTemp": 110,
//   "dtcCode": "P0420",
//   "engineRPM": 16000,
//   "speed": 160
// }
        return await this.upozorenja.ProceniUpozorenje(deviceId, telemetryDTO)
    }

    @Post(`:deviceId/izmeni`)
    async izmeniUpozorenje(@Param(`deviceId`) deviceId:string,@Query(`dan`) dan: string ,@Query(`upozorenjeId`) upozorenjeId: string,@Body() a: alertsUpdateDTO)
    {
        return await this.upozorenja.izmeniUpozorenje(deviceId,dan,upozorenjeId,a)
    }

    @Get(`:deviceId/proveriOdometar`)
    async proveriOdometar(@Param('deviceId') deviceId: string, @Query('startniDan') start:string, @Query('krajnjiDan') kraj:string)
    {
        return await this.upozorenja.proveriOdometar(deviceId, start, kraj)
    }

    @Post(`:deviceId/sacuvaj`)
    async sacuvajUpozorenje(@Param(`deviceId`)deviceId: string, @Body() a:alertsDTO)
    {
        return await this.upozorenja.sacuvajUpozorenja(deviceId, a)
    }

    @Get(`:deviceId/vratiPoslednjezaDan`)
    async vratiPoId(@Param(`deviceId`) deviceId: string, @Query(`dan`) dan:string)
    {
        return await this.upozorenja.vratiPoslednjeUpozorenjeZaDan(deviceId,dan);
    }

    @Get(`:deviceId/vratiPoDanOdDo`)
    async vratiPoDan(@Param(`deviceId`) deviceId: string, @Query(`od`) od:string, @Query(`do`) doo:string)
    {
        return await this.upozorenja.vratiSvaUpozorenjaZaUredjajOdDo(deviceId, od, doo);
    }

    @Post(`:deviceId/ResiUpozorenje`)
    async resiUpozorenje(@Param(`deviceId`) deviceId: string,@Query(`dan`) dan:string,@Query(`upozorenjeId`) upozorenjeId:string)
    {
        return await this.upozorenja.resiUpozorenje(deviceId, dan, upozorenjeId)
    }

    @Get(`:deviceId/aktivnaPoDan`)
    async vratiZaUredjaj(@Param(`deviceId`) deviceId: string)
    {
        return await this.upozorenja.getAktivna(deviceId);
    }

    @Get(`:deviceId/svaResenaDan`)
    async vratiSvaAktivnq(@Param(`deviceId`) deviceId: string,@Query(`dan`) dan: string)
    {
        return await this.upozorenja.vratiSvaResenaUpozorenja(deviceId, dan);
    }

    @Delete(":deviceId/Obrisi")
    async obrisiUpozorenja(@Param(`deviceId`) deviceId: string,@Query(`dan`) dan:string, @Query(`upozorenjeId`) upozorenjeId:string )
    {
        return await this.upozorenja.obrisiUpozorenja(deviceId,dan,upozorenjeId)
    }
    
    @Delete(":deviceId/ObrisiZaDan")
    async obrisiUpozorenjaZaDan(@Param(`deviceId`) deviceId: string,@Query(`dan`) dan:string)
    {
        return await this.upozorenja.obrisiUpozorenjaZaDan(deviceId,dan)
    }
}
