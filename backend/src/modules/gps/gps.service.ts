import { Injectable } from "@nestjs/common";
import { timeStamp } from "console";
import { CassandraService } from "src/infrastructure/cassandra/cassandra.service";
import { RedisService } from "src/infrastructure/redis/redis.service";
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

    async sacuvajTacku(deviceId:string, GpsDTO: GpsDTO, timestamp: string)
    {
        if(!GpsDTO)
        {
            return "Zao nam je doslo je do greske "
        }
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
            GpsDTO,
            60
        )
    }

    vratiZadnjuLokaciju(deviceId: string)
    {
        return this.red.getJSON(`gps:${deviceId}:latest`);
    }

    async getRutuZaVozilo(deviceId:string, dan: string)
    {
        const rez= await this.cass.execute(
            `SELECT timestamp, latitude, longitude FROM gps_by_device_day
            WHERE deviceID=? AND dan=?`,
            [
                deviceId, dan
            ],
        )
        return rez.rows;
    }

    async deleteGpsRutuZaDan(deviceId: string, dan: string)
    {
         const rez= await this.cass.execute(
            `DELETE FROM gps_by_device_day
            WHERE deviceID=? AND dan=?`,
            [
                deviceId, dan
            ],
        )
        return {ok: true};
    }

} 
