import { Injectable } from "@nestjs/common";
import { CassandraService } from "src/infrastructure/cassandra/cassandra.service";
import { RedisService } from "src/infrastructure/redis/redis.service";

function pretvoriUDan(timestamps:string)
{
    return timestamps.slice(0,10)
}

@Injectable()
export class GPSService
{
    constructor(public readonly cass:CassandraService, public readonly red:RedisService){

    }

    async Ruta(deviceId:string, day:string)
    //ne znam kolko ovo lepo vraca rutu za mnogo poziva 
    {
        const res= await this.cass.execute() 
    }

    async predjeniPut(deviceId:string, dan:string)
    {
        const tacke= await this.Ruta(deviceId,dan)

        let put=0
        for(let i=1; i< tacke.l;i++)
        {
            put+= this.haversine()
        }
    }
}
