import { Controller, Get, Param, Query } from "@nestjs/common";
import { AnalyticsService } from "./analitics.service";

@Controller(`analitika`)
export class AnalyticsController{

    constructor(private readonly service: AnalyticsService)
    {}


    @Get(`analitikaBrzina/:deviceId`)
    async vratiBRzinuOdDoZaGraf(@Param('deviceId')deviceId: string, @Query(`od`) od:string,@Query(`do`) doo:string){
        return await this.service.vratiBRzinuOdDoZaGraf(deviceId, od, doo)
    }

    @Get(`analitikaOdometar/:deviceId`)
    async vratiOdometarOdDOZaGraf(@Param('deviceId')deviceId: string, @Query(`od`) od:string,@Query(`do`) doo:string){
        return await this.service.vratiOdometarOdDOZaGraf(deviceId, od, doo)
    }

    @Get(`analitikaTemperatura/:deviceId`)
    async vratiTemperaturuOdDo(@Param('deviceId')deviceId: string, @Query(`od`) od:string,@Query(`do`) doo:string){
        return await this.service.vratiTemperaturuOdDo(deviceId, od, doo)
    }


    @Get(`analitikaPotrosnja/:deviceId`)
    async potrosnjaGoriva(@Param('deviceId')deviceId: string, @Query(`od`) od:string,@Query(`do`) doo:string){
        return await this.service.potrosnjaGoriva(deviceId, od, doo)
    }

    @Get(`Brzine/:deviceId`)
    async minMaxIProsecnaBrzina(@Param('deviceId')deviceId: string, @Query(`od`) od:string,@Query(`do`) doo:string){
        return await this.service.minMaxIProsecnaBrzina(deviceId, od, doo)
    }


    @Get(`analitikaObrtaji/:deviceId`)
    async vratiRpmZaGraf(@Param('deviceId')deviceId: string, @Query(`od`) od:string,@Query(`do`) doo:string){
        return await this.service.vratiRpmZaGraf(deviceId, od, doo)
    }

    @Get(`analitikaDnevna/:deviceId`)
    async dailyAnalitika(@Param('deviceId')deviceId: string, @Query(`dan`) dan:string)
    {
        return await this.service.dailyAnalitika(deviceId, dan)
    }

}