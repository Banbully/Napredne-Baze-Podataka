import { Controller, Get, Query } from "@nestjs/common";
import { NotificationService } from "./notifications.service";

@Controller()
export class NotificationController{

    constructor(private readonly notifikacije: NotificationService)
    {

    }

    @Get()
    get(@Query('deviceId') deviceId: string)
    {
        return this.notifikacije.get(deviceId);
    }
}