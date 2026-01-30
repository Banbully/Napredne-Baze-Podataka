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
        for(const data of payload.data){
            const dan= pretvoriApiUdan(data.ts)

            await this.cass.execute(
                `INSERT INTO telemetry_by_device_day
            (deviceId, dan, ts, speed, enginerpm, fuellevel, enginetemp, odometer)
            VALUES(?,?,?,?,?,?,?,?,9)`
            ,
            [
                data.device_id,
                dan,
                data.lastSync,
                data.sensors?.speed,
                data.sensors?.engineRpm,
                data.sensors?.engine_temp,
                data.sensors?.fuelLevel,
                data.sensors?.odometar
            ]
            );
             await this.red.setJson(
            `telemtry:${data.device_id}:latest`,
                data,
                60,
            );
            await this.red.zAdd(`leaderboard:speed`, data.sensors?.speed, data.device_id)
            await this.red.zAdd(`leaderboard:engineRpm`, data.sensors?.engineRpm, data.device_id)
            await this.red.zAdd(`leaderboard:temp`, data.sensors?.engine_temp, data.device_id)
            await this.red.zAdd(`leaderboard:fuel`, data.sensors?.fuellevel, data.device_id)
            await this.red.zAdd(`leaderboard:odometar`, data.sensors?.odometar, data.device_id)
            // await this.gps.sacuvajTacku(data.device_id, data)
            await this.upozorenje.ProceniUpozorenje(data.device_id, data)
            await this.odrzavanje.evaluate(data.device_id, data)
            
            return{ok : true}
        } 

        
        
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
