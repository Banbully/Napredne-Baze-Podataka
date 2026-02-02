import { Body, Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";
import { NotificationService } from "./notifications.service";
import { alertsDTO } from "../upozorenja/alerts.dto";

@Controller()
export class NotificationController{

    constructor(private readonly notifikacijeService: NotificationService)
    {

    }

    @Get('vratisve')
    async get(@Query('deviceId') deviceId: string)
    {
        return await this.notifikacijeService.get(deviceId);
    }

    @Post(`:deviceId`)
    async create(@Param(`deviceId`) deviceId: string,@Body() dto: alertsDTO) {
       return await this.notifikacijeService.push(deviceId, dto);
    }
   
    
    @Get(':deviceId/latestnotdf')
    async latest(@Query('deviceId') deviceId: string)
    {
        return await this.notifikacijeService.vratiZadnju(deviceId);
    }

    
    @Get(':deviceId/neprocitane')
    async neprocitane(@Query('deviceId') deviceId: string)
    {
        return await this.notifikacijeService.getNeprocitane(deviceId);
    }

    
    @Delete(`obrisiHash`)
    async getHash(@Query('deviceId') deviceId: string)
    {
        return await this.notifikacijeService.obrisiHashnotifikacije(deviceId);
    }

     
    @Delete(`Neprocitane`)
    async obrisiNeporictane(@Query('deviceId') deviceId: string)
    {
        return await this.notifikacijeService.obrisiNeprocitane(deviceId);
    }

    
     
    @Delete(`ObrisiSve`)
    async deleteAll(@Query('deviceId') deviceId: string)
    {
        return await this.notifikacijeService.obrisiSve(deviceId);
    }

    
    


}