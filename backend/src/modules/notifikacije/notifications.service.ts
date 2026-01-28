import { Injectable } from "@nestjs/common";
import { CassandraService } from "src/infrastructure/cassandra/cassandra.service";
import { RedisService } from "src/infrastructure/redis/redis.service";

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

        await this.red.lPush(`notifications:${deviceId}`, notifikacija,);
        return notifikacija
    }

    get(deviceId:string)
    {
        return this.red.getInrange(`notifications:${deviceId}`, 0 ,100);
    }

    obrisi(deviceId:string)
    {
        // return this.red.hDel(`notifications:${deviceId}`, )
    }

}