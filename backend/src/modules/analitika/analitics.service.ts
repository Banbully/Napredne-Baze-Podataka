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


    async grafStatistike(deviceId:string, senzor: SensorData, dan: string)
    {
        const rez= await this.cass.execute(
            `SELECT timestamp, ${sensorDTO},FROM telemtry_by_device_day
            WHERE deviceId=? and dan=?`,
            [
                deviceId, dan
            ]            
        );

        let min= 99999; let max=-99999; let suma=0; let count=0; let prosecnaVrednost=0;

        for(const r of rez.rows)
        {
            const value= r[senzor];
            if(value==null){
                continue;
            }
            else if(value<min){
                min=value
            }
            else if(value>max) {
                max=value;
            }
            suma+=value;
            count++;
        }
        prosecnaVrednost=suma/count;
        
        return{
            deviceId, dan, senzor,min, max, prosecnaVrednost
        };
    }


    

    async getDnevna(deviceId: string, senzor: SensorData, datum: Date)
    {
        const dan = new Date(datum)
        const pocdtakDana= new Date()
    }
}