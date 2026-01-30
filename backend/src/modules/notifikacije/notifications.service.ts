import { Injectable } from "@nestjs/common";
import { CassandraService } from "src/infrastructure/cassandra/cassandra.service";
import { RedisService } from "src/infrastructure/redis/redis.service";
import { json } from "stream/consumers";

@Injectable()
export class NotificationService
{
    constructor(private readonly red: RedisService,
    )
    {
    }

    async push(deviceId: string, alert:any)
    {
        const notifikacija={
            deviceId,
            ...alert,
            read: false,
        };
        const jsonNotf= JSON.stringify(notifikacija)
        await this.red.lPush(`notifications:${deviceId}`, jsonNotf,);
        await this.red.set(`notifications${deviceId}:latest`, notifikacija)
        await this.red.incr(`notifications${deviceId}:aktivne`)
        await this.red.incr(`notifications${deviceId}:neprocitane`)
        return notifikacija
    }

    async get(deviceId:string)
    {
        const data=await  this.red.getInrange(`notifications:${deviceId}`, 0 ,100);
        return data.map(x => JSON.parse(x));
    }

    async getNeprocitane(deviceId:string)
    {
        await this.red.get(`notifications${deviceId}:neprocitane`)
    }

    async obrisiNeprocitane(deviceId:string)
    {
        return this.red.del(`notifications${deviceId}:neprocitane`);
    }
    async obrisiHashnotifikacije(deviceId:string)
    {
        return this.red.hDel(`notifications:${deviceId}`, deviceId)
    }

    async vratiZadnju(deviceId:string)
    {
        const data = await this.red.get(`notifications:${deviceId}:latest`);

        if (!data) return null;

        return JSON.parse(data);
    }

}