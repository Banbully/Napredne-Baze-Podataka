// import { Injectable, Res } from "@nestjs/common";
// import { CassandraService } from "src/infrastructure/cassandra/cassandra.service";
// import { RedisService } from "src/infrastructure/redis/redis.service";
// import { sensorDTO } from "./analytics.dto";



// export enum SensorData{
//    speed= "speed",
//    engineRPM= "engineRPM",
//    fuelLevel= "fuelLevel",
//    engineTemp= "engineTemp",
//    odometar= "odometar",
//    dtcCode= "dtcCode"
// }
// @Injectable()
// export class AnalyticsService
// {
//     constructor(private readonly red: RedisService, private readonly cass: CassandraService)
//     {

//     }


//     async grafStatistike(deviceId:string, senzor: SensorData, dan: string)
//     {
//         const rez= await this.cass.execute(
//             `SELECT timestamp, ${sensorDTO},FROM telemtry_by_device_day
//             WHERE deviceId=? and dan=?`,
//             [
//                 deviceId, dan
//             ]            
//         );

//         let min= 99999; let max=-99999; let suma=0; let count=0; let prosecnaVrednost=0;

//         for(const r of rez.rows)
//         {
//             const value= r[senzor];
//             if(value==null){
//                 continue;
//             }
//             else if(value<min){
//                 min=value
//             }
//             else if(value>max) {
//                 max=value;
//             }
//             suma+=value;
//             count++;
//         }
//         prosecnaVrednost=suma/count;
        
//         return{
//             deviceId, dan, senzor,min, max, prosecnaVrednost
//         };
//     }


//     async mesecnaAnalitika(deviceID: string, mesec: string, metrics: string)
//     {
//         const rez= await this.fetchMetriku(deviceId, dan, metrics);
//         let metrika: number[]=[];
//         for(let d=1; d<=30; d++)//ne mogu da nadjem za racunanje za svaki mesec pa stavio 30
//         {
//             const dan = `${mesec}-${String(d).padStart(2,"0")}`;

//             const res= await this.cass.execute(
//                 `SELECT ${metrika} FROM telemetry_by_device_day 
//                 WHERE deviceId=? and dan=?`,
//             [deviceID,dan]
//             )

//             for(const r of res.rows)
//             {
//                 if(r[col]!=null metrika.push(r[col]))
//             }
//         }
//     }

//     async nedeljnaAnalitika(deviceId: string, nedelja: string, metric: string)
//     {
//         let all: number[]=[];
//         for(const d of days)
//         {
//             const vrednosti= await this.fetch
//         }
//     }


//     private async fetchMetriku(deviceId:string, dan:string, metrics:string)
//     {
//         const red= await this.fetch(deviceId, dan, metrics);
//         return red.map(r=> r[this.Metrika[metrics]]);
//     }

//     private async fetchApi(deviceId: string, dan: string, metrika: sensorData)
//     {

//     }
//     async uporediVozila()
// }