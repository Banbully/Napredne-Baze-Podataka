import { Injectable } from "@nestjs/common";
import { RedisService } from "src/infrastructure/redis/redis.service";
import { CassandraService } from "../../infrastructure/cassandra/cassandra.service";
import { GpsDTO } from "./gps.dto";
import { ApiExcludeController } from "@nestjs/swagger";

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
        if(!GpsDTO || !GpsDTO.latitude || !GpsDTO.longitude)
        {
            return "Zao nam je doslo je do greske "
        }

        const timestamp= new Date().toISOString();
        const dan= pretvoriUDan(timestamp)


        await this.cass.execute(
            `INSERT INTO gps_by_device_day
            (deviceid, dan, timestamp,latitude, longitude, zone, accuracy)
            VALUES(?,?,?,?,?,?,?)`
            ,
            [
                deviceId,
                dan,
                timestamp,
                GpsDTO.latitude || null,
                GpsDTO.longitude || null,
                GpsDTO.zone,
                GpsDTO.accuracy,
            ]
        )
   await Promise.all([
    this.red.setJson(
        `gps:${deviceId}:latest`,
        {
            latitude: GpsDTO.latitude,
            longitude:GpsDTO.longitude,
            zone: GpsDTO.zone,
            accuracy: GpsDTO.accuracy,
            timestamp,
        },
        60
    ),

    this.red.geoAdd(
        `gps:${deviceId}:locations`,
        GpsDTO.longitude,
        GpsDTO.latitude,
        deviceId
    ),

    this.red.geoAdd( `gps:locations`,
        GpsDTO.longitude,
        GpsDTO.latitude,
        deviceId),

    this.red.lPush(
        `gps:history`,
        JSON.stringify({
        longitude: GpsDTO.longitude,
        latitude: GpsDTO.latitude,
        deviceId
     })
    )]);
    }

    
    async vratiZadnjuLokaciju(deviceId: string)
    {
        const dan= new Date().toISOString().slice(0,10);
        try{
            const cached =await this.red.getJSON(`gps:${deviceId}:latest`);
            
            if(cached)
            {
                console.log("cacheHit")
                return cached
            }

            const res= await this.cass.execute(`SELECT latitude,longitude FROM gps_by_device_day WHERE deviceId=? AND dan=? ORDER BY timestamp DESC Limit 1`,[deviceId,dan],)
            if(res.rows.length===0)
            {
                return null
            }
            
            await this.red.setJson(`gps:${deviceId}:latest`,res.rows[0])
            
            return res.rows[0]
        }
        catch(err)
        {
             console.error("vratiZadnjuLokaciju ERROR:", err);
            throw err;   // pusti pravu grešku
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

    async vratiURadijusu( longitude:number, latitude:number, radius: number)
    {
        const res=await this.red.geoRadius(`gps:locations`, longitude, latitude, radius);
        return res.map(r => ({
            r
        }));
    }
    async vratiRutuZaPeriod(deviceId: string, start: string, kraj: string)
    {
        const startDan= new Date(start)
        const krajDan= new Date(kraj)
        let dani: string[]=[]
        let ruta:any[]=[]
        while(startDan<=krajDan)
        {
            dani.push(startDan.toISOString().slice(0,10))
            startDan.setDate(startDan.getDate()+1)
        }
        for(const dan of dani)
        {
            const rez= await this.cass.execute(`SELECT * FROM gps_by_device_day WHERE deviceId=? AND dan=? ORDER BY timestamp DESC`,
                [
                    deviceId, 
                    dan
                ])
            ruta=ruta.concat(rez.rows)
        }
        return ruta
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
        await this.red.del(`gps:${deviceId}:latest`)
        return {ok:true}
    }

    async izbrisiGPS(deviceId: string)
    {   
        await Promise.all([
            await this.red.del(`gps:${deviceId}:latest`),
            await this.cass.execute(`DELETE FROM gps_by_device_day WHERE deviceId=?`,[deviceId]),
            await this.red.del(`gps:${deviceId}:latest`)
        
        ]);

        const rez= await this.cass.execute(
            `DELETE FROM gps_by_device_day
            WHERE deviceId=? `,
            [
                deviceId
            ],
        )
    }

    
} 
