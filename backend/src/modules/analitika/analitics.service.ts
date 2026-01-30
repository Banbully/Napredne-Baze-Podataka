import { Injectable, Res } from "@nestjs/common";
import { CassandraService } from "src/infrastructure/cassandra/cassandra.service";
import { RedisService } from "src/infrastructure/redis/redis.service";
import { sensorDTO } from "./analytics.dto";
import { metrics } from "cassandra-driver";




export enum SensorData{
   speed= "speed",
   engineRPM= "engineRPM",
   fuelLevel= "fuelLevel",
   engineTemp= "engineTemp",
   odometar= "odometar",
   dtcCode= "dtcCode"
}
@Injectable()
export class AnalyticsService
{
    constructor(private readonly red: RedisService, private readonly cass: CassandraService)
    {
        
    }

    async vratiBRzinuOdDoZaGraf(deviceId: string, od:string, doo:string)
    {
        const cached= await this.red.get(`analitika:${deviceId}:speed:${od}:${doo}`)
        if(cached)
        {
            return JSON.parse(cached)
        }

        const res= await this.cass.execute(`SELECT timestamp, speed FROM telemetry_by_device_day WHERE device_id=? AND dan>=? AND day<=?`,[deviceId, od, doo])

        const rez=res.rows.map(r=>({x: r.timestamp, y:r.speed}))

        await this.red.set(`analitika:${deviceId}:speed:${od}:${doo}`, JSON.stringify(rez))
        return rez;
    }


    async vratiOdometarOdDOZaGraf(deviceId:string, od:string, doo:string)
    {
        const cached= await this.red.get(`analitika:${deviceId}:speed:${od}:${doo}`)
        if(cached)
        {
            return JSON.parse(cached)
        }

        const res= await this.cass.execute(`SELECT timestamp, odometar FROM telemetry_by_device_day WHERE device_id=? AND dan>=? AND day<=?`,[deviceId, od, doo])

        const rows= res.rows.reverse() //gledaj obrnutu logiku msm ima da izgleda ko da vracamo kilometre thanks api
        const rez=res.rows.map(r=>({x: r.timestamp, y:r.speed}))

        await this.red.set(`analitika:${deviceId}:odometar:${od}:${doo}`, JSON.stringify(rez))
        return rez;
    }


    async vratiTemperaturuOdDo(deviceId:string, od:string, doo:string)
    {
         const cached= await this.red.get(`analitika:${deviceId}:engineTemp:${od}:${doo}`)
        if(cached)
        {
            return JSON.parse(cached)
        }

        const res= await this.cass.execute(`SELECT timestamp, engineTemp FROM telemetry_by_device_day WHERE device_id=? AND dan>=? AND day<=?`,[deviceId, od, doo])

        const rez=res.rows.map(r=>r.engineTemp)

        await this.red.set(`analitika:${deviceId}:engineTemp:${od}:${doo}`, JSON.stringify(rez))
        return rez;
    }

    async potrosnjaGoriva(deviceId:string, od:string, do0:string)
    {
        const res= await this.cass.execute(`SELECT fuellevel FROM telemetry_by_device WHERE deviceId=? AND dan>=? AND dan<=?`,[deviceId, od, do0])
        const nivogorivo= res.rows.map(r=> r.fuellevel)

        const potrosnja= nivogorivo[0]- nivogorivo[nivogorivo.length-1]
        return potrosnja
    }


    async minMaxBrzina(deviceId:string, od:string, doo:string)
    {
        const cached=await this.red.getJSON(`analitika:${deviceId}:speed:od${od}:do${doo}`)
        if(cached) 
            return cached

        const res= await this.cass.execute(`SELECT speed from telemetry_by_device_day 
            WHERE deviceId=? AND dan>=? AND dan<=?`,
            [deviceId, od, doo]
        )

        const brzine= res.rows.map(r=>r.speed)

        const rez={
            min: Math.min(...brzine),
            max: Math.max(...brzine)
        }

        await this.red.set(`analitika:${deviceId}:speed:od${od}:do${doo}`,JSON.stringify(rez))
        return rez
    }

    async rpmTrend(deviceId:string, od:string, doo:string)
    {
        const cached=await this.red.getJSON(`analitika:${deviceId}:engineRpm:od${od}:do${doo}`)
        if(cached) 
            return cached

        const res= await this.cass.execute(`SELECT engineRpm from telemetry_by_device_day 
            WHERE deviceId=? AND dan>=? AND dan<=?`,
            [deviceId, od, doo]
        )

        const rez= res.rows.map(r=>r.engineRpm)
        

        await this.red.set(`analitika:${deviceId}:engineRpm:od${od}:do${doo}`,JSON.stringify(rez))
        return rez
    }
}