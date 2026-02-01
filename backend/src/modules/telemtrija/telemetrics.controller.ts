import { Body, Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";
import { telemetryDTO } from "./telemtrics.dto";
import { telemetryService } from "./telemetrics.service";
@Controller('telemetry')
export class telemtryController{

    constructor(private readonly telemtry: telemetryService)
    {

    }

    @Post('ingestion')
    ingest(@Body() telemtry: any)
    {
        return this.telemtry.ingest(telemtry);
    }

    @Get(`:deviceId/latest`)
    latest(@Param(`deviceId`) id:string, @Query('dan')dan:string)
    {
        return this.telemtry.vratiSveParametar(id,dan)
    }

    @Get(`:deviceId/latestparametar`)
    latestParametar(@Param(`deviceId`) id:string,@Query('parametar') parametar:string,  @Query('dan')dan:string)
    {
        return this.telemtry.vratiParametar(parametar,id,dan)
    }


    @Delete()
    obrisiZaDan(@Query('deviceId')deviceId: string, @Query()dan:string)
    {
        return this.telemtry.DeleteZaDan(deviceId, dan)
    }
}
