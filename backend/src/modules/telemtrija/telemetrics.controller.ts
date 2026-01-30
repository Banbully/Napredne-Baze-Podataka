import { Body, Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";
import { telemetryDTO } from "./telemtrics.dto";
import { telemetryService } from "./telemetrics.service";
@Controller('telemetry')
export class telemtryController{

    constructor(private readonly telemtry: telemetryService)
    {

    }

    @Post('ingestion')
    ingest(@Body() telemtryDto: telemetryDTO)
    {
        return this.telemtry.ingest(telemetryDTO);
    }

    @Get(`:deviceId/latest`)
    latest(@Param(`deviceId`) id:string)
    {
        // return this.telemtry.vratiHashovano(id)
    }

    @Delete()
    obrisiZaDan(@Query('deviceId')deviceId: string, @Query()dan:string)
    {
        return this.telemtry.DeleteZaDan(deviceId, dan)
    }
}
