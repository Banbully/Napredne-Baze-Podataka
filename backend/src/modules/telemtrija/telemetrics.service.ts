import { Injectable } from "@nestjs/common";
import { RedisService } from "src/infrastructure/redis/redis.service";
import { CassandraService } from "src/infrastructure/cassandra/cassandra.service";

import { AlertsService } from "../upozorenja/alerts.service";
import { GPSService } from "../gps/gps.service";
import { OdrzavanjeService } from "../odrzavanje/maintenance.service";


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
            await this.red.hset(
                `telemetry:${payload.deviceId}:latest`,
                {
                    speed: payload.sensors.speed?.toString(),
                    engineRpm: payload.sensors.engineRpm?.toString(),
                    temp: payload.sensors.temp?.toString(),
                    fuelLevel: payload.sensors.fuelLevel?.toString(),
                    odometar: payload.sensors.odometar?.toString(),
                    timestamp: new Date().toISOString()
                }
            );
            await this.red.zAdd(`leaderboard:speed`, payload.speed, payload.deviceId)
            await this.red.zAdd(`leaderboard:engineRpm`, payload.engineRpm, payload.deviceId)
            await this.red.zAdd(`leaderboard:temp`, payload.engineTemp, payload.deviceId)
            await this.red.zAdd(`leaderboard:fuel`, payload.fuelLevel, payload.deviceId)
            await this.red.zAdd(`leaderboard:odometar`, payload.odometer, payload.deviceId)

            await this.red.zAdd(`leaderboard:speed:${dan}`, payload.speed, payload.deviceId)
            await this.red.zAdd(`leaderboard:engineRpm:${dan}`, payload.engineRpm, payload.deviceId)
            await this.red.zAdd(`leaderboard:temp:${dan}`, payload.engineTemp, payload.deviceId)
            await this.red.zAdd(`leaderboard:fuel:${dan}`, payload.fuelLevel, payload.deviceId)
            await this.red.zAdd(`leaderboard:odometar:${dan}`, payload.odometer, payload.deviceId)
            // await this.gps.sacuvajTacku(payload.device_id, payload)
            await this.upozorenje.ProceniUpozorenje(payload.deviceId, payload)
            await this.odrzavanje.evaluate(payload.deviceId, payload)
            
            return{ok : true}
        

        
        
    }

    async vratiVozilo(deviceId: string)
    {
        try{
        const cached= await this.red.getJSON(`telemtry:${deviceId}:latest`)
        if(cached)
        {
            return cached
        }
        
        const res=await this.cass.execute(`SELECT * FROM telemetry_by_device_day WHERE deviceId=?`, [deviceId],)
        await this.red.setJson(`telemtry:${deviceId}:latest`,res.rows[0], 86400)
        return res.rows[0];
        }
        catch(err)
        {
            console.log(err)
        }
    }


    async DeleteZaDan(deviceId: string, dan:string)
    {
        this.cass.execute(
        `DELETE FROM telemetry_by_device_day WHERE deviceID=? and dan=?`,
        [
            deviceId, dan
        ]
        );
        return {ok: true};        
    }


    async vratiParametar(parametar:string, deviceId:string)
    {
        const cached= await this.red.get(`telemtry:${deviceId}:latest:${parametar}`)
        if(cached)
        {
            return cached
        }
        
        const res= await this.cass.execute(`SELECT ${parametar} FROM telemetry_by_device_day WHERE deviceId=?`,[deviceId]);
        await this.red.set(`telemtry:${deviceId}:latest:${parametar}`, JSON.stringify(res.rows[0]));
        return res.rows[0]
    }

     async vratiSveParametar(deviceId:string)
    {
        const cached= await this.red.get(`telemtry:${deviceId}:latest`)
        if(cached)
        {
            return cached
        }
        
        const res= await this.cass.execute(`SELECT * FROM telemetry_by_device_day WHERE deviceId=?`,[deviceId]);
        await this.red.set(`telemtry:${deviceId}:latest`, JSON.stringify(res.rows[0]));
        return res.rows[0]
    }
    
}
