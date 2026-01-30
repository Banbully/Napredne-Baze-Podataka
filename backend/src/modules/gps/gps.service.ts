import { Injectable } from "@nestjs/common";
import { RedisService } from "src/infrastructure/redis/redis.service";
import { CassandraService } from "../../infrastructure/cassandra/cassandra.service";
import { GpsDTO } from "./gps.dto";

function pretvoriUDan(timestamps:string)
{
    return timestamps.slice(0,10)
}

@Injectable()
export class GPSService
{
    constructor(public readonly cass:CassandraService, public readonly red:RedisService){
        
    }

    async sacuvajTacku(deviceId:string, GpsDTO: GpsDTO)
    {
        if(!GpsDTO || GpsDTO.latitude || GpsDTO.longitude)
        {
            return "Zao nam je doslo je do greske "
        }
        const timestamp= new Date().toISOString();
        const dan= pretvoriUDan(timestamp)


        await this.cass.execute(
            `INSERT INTO gps_by_device_day
            (deviceId, dan, timestamp,latitude, longitude, zone, accuracy)
            VALUES(?,?,?,?,?,?,?)`
            ,
            [
                deviceId,
                dan,
                timestamp,
                GpsDTO.longitude,
                GpsDTO.longitude,
                GpsDTO.zone,
                GpsDTO.accuracy,
            ]
        )

        await this.red.setJson(
            `gps:${deviceId}:latest`,
            {
                GpsDTO,
                timestamp,
                deviceId
            },
            60
        )

    }

    async vratiZadnjuLokaciju(deviceId: string)
    {
        try{
            const cached =await this.red.getJSON(`gps:${deviceId}:latest`);
            
            if(cached)
            {
                return cached
            }

            const res= await this.cass.execute(`SELECT latitude,longidute FROM gps_by_device_day WHERE deviceId=? ORDER BY timestamp DESC`,[deviceId],)
            await this.red.setJson(`gps:${deviceId}:latest`,res.rows)
            return res.rows

        }
        catch(err)
        {
            throw new Error("Zao nam je doslo je do greske ")
        }
    }

    async vratiLokacijeUredjaja()
    {
        try{
            const res=await this.cass.execute(`SELECT DISTINCT deviceId FROM gps_by_device_day LIMIT 100`)
            return res.rows
        }
        catch(err)
        {
            return [];
        }
    }
    async getRutuZaVozilo(deviceId:string, dan: string)
    {
        try{
        const rez= await this.cass.execute(
            `SELECT timestamp, latitude, longitude FROM gps_by_device_day
            WHERE deviceId=? AND dan=?`,
            [
                deviceId, dan
            ],
        )
        return rez.rows;
        }
        catch(err)
        {
            return [];
        }
    }

    async vratiRutuZaPeriod(deviceId: string, start: string, kraj: string)
    {
        const rez= await this.cass.execute(`SELECT FROM gps_by_device_day WHERE deviceId=? AND dan>= ? AND dan<=? ORDER BY timestamp desc`,
            [
                deviceId, 
                start, 
                kraj
            ])
        return rez.rows;
    }
    async deleteGpsRutuZaDan(deviceId: string, dan: string)
    {
         const rez= await this.cass.execute(
            `DELETE FROM gps_by_device_day
            WHERE deviceId=? AND dan=?`,
            [
                deviceId, dan
            ],
        )
        return rez.rows;
    }

    async izbrisiGPS(deviceId: string)
    {   
        const cached= await this.red.del(`gps:${deviceId}:latest`)
        await this.cass.execute(`DELETE FROM gps_by_device_day WHERE deviceId=?`,[deviceId])
        return{ok:true}
    }

    
} 
