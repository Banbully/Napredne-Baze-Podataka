import { Body, Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";
import { OdrzavanjeService } from "./maintenance.service";
import { sensorDTO } from "../analitika/analytics.dto";
import { time } from "console";
import { timestamp } from "rxjs";

@Controller()
export class OdrzavanjeController{
    constructor(private readonly service: OdrzavanjeService)
    {

    }

    @Post("predikcija")
    async get(@Query('deviceId') deviceId: string,@Body() telemetry: any)
    {
        return await  this.service.evaluate(deviceId, telemetry)
    }

    @Post('getPredikciju')
    async getPredikciju(@Body() telemtrija: sensorDTO)
    {
        return await this.service.predict(telemtrija)
    }

    @Post(`:deviceId/healthScore`)
    async healthScore(@Param('deviceId')deviceId: string, @Body() telemetrija:sensorDTO){
        return await this.service.healthScoreZaVozilo(telemetrija, deviceId)
    }
    
    @Get(`:deviceId/vratiCacheHScore`)
    async getHealthHash(@Param('deviceId') deviceId:string)
    {
        return await this.service.vratiHealthScore(deviceId)
    }

    @Get(`:deviceId/vratiCassScore`)
    async getHealthCass(@Param('deviceId') deviceId:string, @Query(`timestamp`) timestamp: string, @Query(`dan`) dan:string)
    {
        return await this.service.vratiHealthScoreIzCassZaDan(deviceId, dan,timestamp)
    }

    @Get(':deviceId/vratiZadnjuPredikciju')
    async vratiZadnju(@Param(`deviceId`) deviceId: string, @Query(`timestamp`) timestamp:string)
    {
        return await this.service.vratiZadnjuPredikciju(deviceId, timestamp)
    }

    @Delete(`:deviceId/obrisiPredikciju`)
    async obrisiPredikciju(@Param('deviceId') deviceId: string, @Query(`timestamp`) timestamp: string)
    {
        return await this.service.obrisiZadnjuPredikciju(deviceId, timestamp)
    }

    @Delete(':deviceId/ObrisiHealth')
    async obrisiZadnjiHealth(@Param('deviceId') deviceId: string, @Query(`timestamp`) timestamp: string, @Query(`dan`) dan:string)
    {
        return await this.service.obrisiHealthscore(deviceId, timestamp, dan)
    }

    @Post(`:deviceId/resetPredict`)
    async obrisiPredikcijuCache(@Param('deviceId') deviceId: string)
    {
        return await this.service.resetPrediktorURedis(deviceId)
    }

    @Post(':deviceId/resetHealth')
    async obrisiZadnjiHealthCache(@Param('deviceId') deviceId: string)
    {
        return await this.service.resetHealthscoreURedis(deviceId)
    }

}

