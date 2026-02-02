import { Injectable } from "@nestjs/common";
import { RedisService } from "src/infrastructure/redis/redis.service";
import { CassandraService } from "src/infrastructure/cassandra/cassandra.service";

import { AlertsService } from "../upozorenja/alerts.service";
import { GPSService } from "../gps/gps.service";
import { OdrzavanjeService } from "../odrzavanje/maintenance.service";
import { telemetryDTO } from "./telemtrics.dto";


function pretvoriApiUdan(ts:string):string
{
    return ts.slice(0,10)//prvih 10  jer je yyyy-mm-dd 
}

@Injectable()
export class telemetryService
{
    constructor(private readonly cass: CassandraService, private readonly red: RedisService,
        private readonly odrzavanje: OdrzavanjeService, private readonly gps: GPSService, private readonly upozorenje: AlertsService
    )
    {
    }

    async ingest(payload:any) 
    {
            const dan=pretvoriApiUdan(payload.ts)
            await this.cass.execute(
                `INSERT INTO telemetry_by_device_day
            (deviceid, dan, ts, speed, enginerpm, fuellevel, enginetemp, odometer)
            VALUES(?,?,?,?,?,?,?,?)`
            ,
            [
                payload.deviceId,
                dan,
                payload.ts,
                payload.speed,
                payload.engineRpm,
                payload.engineTemp,
                payload.fuelLevel,
                payload.odometer
            ]
            );

            console.log("HSET DATA:", {
            speed: payload.speed,
            engineTemp: payload.engineTemp,
            engineRpm: payload.engineRpm,
            fuelLevel: payload.fuelLevel,
            odometer: payload.odometer,
            batteryLevel: payload.batteryLevel,
            timestamp: payload.ts
            });


            console.log("ZADD CHECK:", {
            deviceId: payload.deviceId,
            speed: payload.speed,
            engineTemp: payload.engineTemp,
            engineRpm: payload.engineRpm,
            fuelLevel: payload.fuelLevel,
            odometer: payload.odometer
            });


            console.log("ZADD CHECK:", {
            deviceId: payload.deviceId,
            speed: payload.speed,
            engineTemp: payload.engineTemp,
            engineRpm: payload.engineRpm,
            fuelLevel: payload.fuelLevel,
            odometer: payload.odometer
            });

            await this.red.hset(`telemetry:${payload.deviceId}:latest`,"speed", String(payload.speed))
            await this.red.hset(`telemetry:${payload.deviceId}:latest`,"temp", String(payload.engineTemp))
            await this.red.hset(`telemetry:${payload.deviceId}:latest`,"engineRpm" ,String(payload.engineRpm))
            await this.red.hset(`telemetry:${payload.deviceId}:latest`, "fuel",String(payload.fuelLevel))
            await this.red.hset(`telemetry:${payload.deviceId}:latest`,"odometar", String(payload.odometar))

            await this.red.zAdd(`leaderboard:speed`, payload.speed, payload.deviceId)
            await this.red.zAdd(`leaderboard:engineRpm`, payload.engineRpm, payload.deviceId)
            await this.red.zAdd(`leaderboard:temp`, payload.engineTemp, payload.deviceId)
            await this.red.zAdd(`leaderboard:fuel`, payload.fuelLevel, payload.deviceId)
            await this.red.zAdd(`leaderboard:odometar`, payload.odometer, payload.deviceId)

            //console.log("zadd",t1)
            await this.red.zAdd(`leaderboard:speed:${dan}`, payload.speed, payload.deviceId)
            await this.red.zAdd(`leaderboard:engineRpm:${dan}`, payload.engineRpm, payload.deviceId)
            await this.red.zAdd(`leaderboard:temp:${dan}`, payload.engineTemp, payload.deviceId)
            await this.red.zAdd(`leaderboard:fuel:${dan}`, payload.fuelLevel, payload.deviceId)
            await this.red.zAdd(`leaderboard:odometar:${dan}`, payload.odometer, payload.deviceId)
            await this.upozorenje.ProceniUpozorenje(payload.deviceId, payload)
            await this.odrzavanje.evaluate(payload.deviceId, payload)
            
            return{ok : true}
    
    }


    async DeleteZaDan(deviceId: string, dan:string)
    {
        this.cass.execute(
        `DELETE FROM telemetry_by_device_day WHERE deviceid=? and dan=?`,
        [
            deviceId, dan
        ]
        );
        await this.red.del(`telemtry:${deviceId}:latest`);
        return {ok: true};   
        
    }


    async vratiParametar(parametar:string, deviceId:string, dan:string)
    {
        const cached= await this.red.hGet(`telemetry:${deviceId}:latest`, parametar)
        if(cached)
        {
            return cached
        }
        console.log(cached)
        
        const res= await this.cass.execute(`SELECT ${parametar} FROM telemetry_by_device_day WHERE deviceid=? AND dan=? ORDER BY ts LIMIT 1`,[deviceId, dan]);
        await this.red.hset(`telemtry:${deviceId}:latest`,`${parametar}`, String(res.rows[0]));
        return res.rows[0];
    }

    async vratiSveParametar(deviceId:string, dan:string)
    {
        const cached= await this.red.hGetAllHash(`telemetry:${deviceId}:latest`)
        console.log("cache",cached)
        if(cached && Object.keys(cached).length > 0)
        {
            return cached
        }
       
        const res= await this.cass.execute(`SELECT * FROM telemetry_by_device_day WHERE deviceid=? AND dan=? ORDER BY ts LIMIT 1`,[deviceId,dan]);
        const rez= res.rows[0]
        await this.red.hset(`telemetry:${deviceId}:latest`,"speed", String(rez.speed))
        await this.red.hset(`telemetry:${deviceId}:latest`,"temp", String(rez.engineTemp))
        await this.red.hset(`telemetry:${deviceId}:latest`,"engineRpm" ,String(rez.engineRpm))
        await this.red.hset(`telemetry:${deviceId}:latest`, "fuel",String(rez.fuelLevel))
        await this.red.hset(`telemetry:${deviceId}:latest`,"odometar", String(rez.odometer))
        console.log("rezhit"+rez)
        return rez;
    }
    
}
