import { Injectable } from "@nestjs/common";
import { timestamp } from "rxjs";
import { CassandraService } from "src/infrastructure/cassandra/cassandra.service";
import { RedisService } from "src/infrastructure/redis/redis.service";
import { telemetryDTO } from "../telemtrija/telemtrics.dto";
import { json } from "stream/consumers";
import { sensorDTO } from "../analitika/analytics.dto";

@Injectable()
export class OdrzavanjeService
{
    //note ovde koristi sensordto iz analitike 
    constructor(private readonly redis: RedisService,
        private readonly cass: CassandraService
    )
    {

    }
    async evaluate(deviceId:string, telemetry: sensorDTO)
    {
        
        const prediktor= await this.predict(telemetry);

        await this.redis.setJson(`maintenance:${deviceId}:prediction`,
            prediktor,
            60,
            ); 

        await this.cass.execute(
            `INSERT INTO maintenance_predictor
            (deviceid, ts, nivo_opasnosti, risk_score, poruka)
            VALUES(?,?,?,?,?)`,
            [
                deviceId, prediktor.timestamp, prediktor.level, prediktor.score, prediktor.poruka 
            ]
        )

        Promise.all([
            await this.redis.setJson(`maintenance:${deviceId}:predictor`, JSON.stringify(telemetry),86400),
            await this.redis.sadd(`maintenance_predictor:${deviceId}`, JSON.stringify(telemetry))
        ])
        
    }


    async predict(telemtry: sensorDTO)
    {
        let score=0;
        if(telemtry.engineTemp>95) 
            score+=20;
        if(telemtry.engineTemp>95) 
            score+=10;
        if(telemtry.odometar>50000) 
            score+=5;
        if(telemtry.odometar>100000) 
            score+=10;
        if(telemtry.odometar>150000) 
            score+=15;
        if(telemtry.fuelLevel<20) 
            score+=10;
        if(telemtry.fuelLevel<10) 
            score+=20;
        if(telemtry.dtcCode) 
            score+=100;

        const level= score>60? 'HIGH':
        score>30? 'MED':'LOW'
       
        return{  
            level,
            score: String(score),
            poruka: await this.vratiPoruku(level),
            timestamp: new Date().toISOString()
        }
    }


    async healthScoreZaVozilo(telemtry: sensorDTO, deviceId: string)
    {
        let healthCheck=100;
        if(telemtry.engineTemp>95) 
            healthCheck-=0.1;
        if(telemtry.engineTemp>110) 
            healthCheck-=0.2;
        if(telemtry.odometar>50000) 
            healthCheck-=0.1;
        if(telemtry.odometar>100000) 
            healthCheck-=0.3;
        if(telemtry.odometar>150000) 
            healthCheck-=0.1;
        if(telemtry.fuelLevel<20) 
            healthCheck-=0.1;
        if(telemtry.fuelLevel<10) 
            healthCheck-=0.3;
        if(telemtry.dtcCode) 
            healthCheck-=100;


         const level= healthCheck>90? 'Odlican':
        healthCheck>60? 'Zadovoljavajuc':'Los'

        await this.redis.set(`health:${deviceId}:latest`, String(healthCheck));
        await this.redis.zAdd(`leaderboard:healthScore`, healthCheck, deviceId)

        await this.cass.execute(`INSERT INTO healthscore (deviceid, timestamp, dan, score, level) VALUES(?,?,?,?,?)`,[
            deviceId,
            new Date().toISOString(),
            new Date().toISOString().slice(0,10),
            healthCheck,
            level
        ])
        return{
            level,
            score: healthCheck,
            timestamp: new Date().toISOString()
        }

    }

    async vratiHealthScore(deviceId:string)
    {
        const rediscache= await this.redis.get(`health:${deviceId}:latest`)
        if(rediscache)
        {
            return JSON.parse(rediscache)
        }
        await this.redis.setJson(`health:${deviceId}:latest`,0, 86400);
    }

    async vratiHealthScoreIzCassZaDan(deviceId:string, dan:string, timestamp: string)
    {
        
        const res= await this.cass.execute(`SELECT score FROM healthscore WHERE deviceid=? AND dan=? AND timestamp=?`,[deviceId, dan, timestamp])
        return res.rows[0]
    }
    async vratiPoruku(level: string)
    {
        if(level=="HIGH")
        {
            return "HITNO PROVERITE VASA KOLA"
        }
        else if(level=="MEDIUM")
        {
            return "UPOZORENJE! MOGUCA DETEKCIJA KVARA NIVO SREDNJI"
        }
        else 
        {
            return "UPOZORENJE! DOSLO JE DO MALIH PROMENA KOD AUTOMOBILA"
        }
    }

    async vratiZadnjuPredikciju(deviceId: string, ts:string)
    {
        const rediscache= await this.redis.get(`maintenance:${deviceId}:prediction`)
        if(rediscache)
        {
            return JSON.parse(rediscache)
        }
        else{
            const cassRez= await this.cass.execute(`SELECT * FROM maintenance_predictor WHERE deviceid=? and ts=? LIMIT 1`,[deviceId,ts])
            return cassRez.rows[0]
        }
    }

    async obrisiZadnjuPredikciju(deviceId:string,  timestamp:string)
    {
       
        await this.cass.execute(`DELETE FROM maintenance_predictor WHERE deviceid=? and ts=?`,
            [deviceId, timestamp]
        )
        await this.redis.del(`maintenance:${deviceId}:prediction`)
        return {ok:true}
    }

    
    async obrisiHealthscore(deviceId:string, timestamp:string, dan:string)
    {
       
        await this.cass.execute(`DELETE FROM healthscore WHERE deviceid=? and timestamp=? and dan=? `,
            [deviceId, timestamp, dan]
        )
        console.log(timestamp)
        console.log(deviceId)
        console.log(dan)
        return {ok:true}
    }


    async resetPrediktorURedis(deviceId: string)
    {
         const rediscache= await this.redis.get(`maintenance:${deviceId}:prediction`)
        if(!rediscache)
        {
            console.log("prazan cache")
        }
        await this.redis.setJson(`maintenance:${deviceId}:prediction`,0, 86400);
        return {ok:true}
    }

    
    async resetHealthscoreURedis(deviceId: string)
    {
         const rediscache= await this.redis.get(`health:${deviceId}:latest`)
        if(!rediscache)
        {
            console.log('prazan cache')
        }
        await this.redis.setJson(`health:${deviceId}:latest`,0, 86400);
        return {ok:true}
    }

}