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
            reseno: false,
            procitano:false
        };
        const jsonNotf= JSON.stringify(notifikacija)
        await this.red.lPush(`notifications:${deviceId}`, jsonNotf,);
        await this.red.set(`notifications${deviceId}:latest`, jsonNotf)
        await this.red.incr(`notifications${deviceId}:aktivne`)
        await this.red.incr(`notifications${deviceId}:neprocitane`)
        await this.red.incr(`notifications${deviceId}:total`)
        return notifikacija
    }

    async get(deviceId:string)
    {
        const data=await  this.red.getInrange(`notifications:${deviceId}`, 0 ,100);
        return data.map(x => JSON.parse(x));
    }

    async getNeprocitane(deviceId:string)
    {
        const count=await this.red.get(`notifications${deviceId}:neprocitane`)
        return count||0;
    }

    async obrisiNeprocitane(deviceId:string)
    {
        await this.red.del(`notifications${deviceId}:neprocitane`);
        return {ok:true}
    }
    async obrisiHashnotifikacije(deviceId:string)
    {
        await this.red.del(`notifications:${deviceId}`)
        return {ok:true}
    }

    async vratiZadnju(deviceId:string)
    {
        const data = await this.red.get(`notifications${deviceId}:latest`);

        if (!data) return null;
        console.log(data[0])
        return data
        
    }


    async obrisiSve(deviceId:string)
    {
        await Promise.all([await this.red.del(`notifications:${deviceId}`),
            await this.red.del(`notifications${deviceId}:latest`),
            await this.red.del(`notifications${deviceId}:total`),
            await this.red.del(`notifications${deviceId}:neprocitane`)
        ])

        return {ok:true}
    }
}