import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { VehicleService } from "./vehicles.service";
import { VehicleDTO } from "./vehicles.dto";

@Controller("Vozila")
export class VehicleController
{
    constructor(private readonly service: VehicleService)
    {

    }

    @Post()
    CreateVozilo(@Body() dto: VehicleDTO)
    {
        return this.service.Create(dto)
    }

    @Put(':id')
    updateVozilo(@Param('id')id: string, @Body() dto: any,)
    {
        return this.service.UpdateVozilo(id, dto);
    }
    
    @Delete(':id')
    ObrisiVozilo(@Param('id')id: string)
    {
        return this.service.ObrisiVozilo(id)
    }

    @Get("GetAll")
    vratisva()
    {
        return this.service.VratiSvaVozila()
    }

    @Post("Generisi")
    generisi(@Query() deviceId: string)
    {
        return this.service.StartujGenerisanje(deviceId, true)
    }

    @Post("PrekiniGenerisanje")
    PrekiniGenerisanje(@Query() deviceId: string)
    {
        return this.service.StartujGenerisanje(deviceId, false)
    }
    
    @Get("id:Status")
    vratiStatus(@Query() deviceId: string)
    {
        return this.service.vratiStatus(deviceId)
    }

    @Get(":id")
    vratiVoziloPoId(@Param('id') deviceId: string)
    {
        return this.service.VratiVoziloPoId(deviceId)
    }

}