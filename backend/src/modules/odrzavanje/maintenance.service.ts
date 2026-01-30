import { Injectable } from "@nestjs/common";
import { timestamp } from "rxjs";
import { CassandraService } from "src/infrastructure/cassandra/cassandra.service";
import { RedisService } from "src/infrastructure/redis/redis.service";
import { telemetryDTO } from "../telemtrija/telemtrics.dto";
import { json } from "stream/consumers";

@Injectable()
export class OdrzavanjeService
{
    constructor(private readonly redis: RedisService,
        private readonly cass: CassandraService
    )
    {

    }

    
    async evaluate(deviceId:string, telemetry: telemetryDTO)
    {
        const Obavestenje=[]
        
        const prediktor= this.predict(telemetry);

        await this.redis.setJson(`maintenance:${deviceId}:prediction`,
            prediktor,
            60,
            ); 

        await this.cass.execute(
            `INSERT INTO maintenance_predictor
            (deviceId, ts, nivo_opasnosti, risk_score, poruka)
            VALUES(?,?,?,?,?)`,
            [
                telemetry.deviceId, prediktor.timestamp, prediktor.level, prediktor.level, prediktor.poruka 
            ]
        )

        Promise.all([
            
        ])
        

    }

    private  predict(telemtry: any)
    {
        let score=0;
        if(telemtry.sensors?.engineTemp>95) 
            score+=20;
        if(telemtry.sensors?.engineTemp>95) 
            score+=10;
        if(telemtry.sensors?.batteryLevel<30) 
            score+=10;
        if(telemtry.sensors?.batteryLevel<15) 
            score+=20;
        if(telemtry.sensors?.odometar>50000) 
            score+=5;
        if(telemtry.sensors?.odometar>100000) 
            score+=10;
        if(telemtry.sensors?.odometar>150000) 
            score+=15;
        if(telemtry.sensors?.fuelLevel<20) 
            score+=10;
        if(telemtry.sensors?.fuelLevel<10) 
            score+=20;
        if(telemtry.sensors?.dtcCode) 
            score+=100;

        const level= score>60? 'HIGH':
        score>30? 'MED':'LOW'
       
        return{  
            level,
            score: score,
            poruka: this.vratiPoruku(level),
            timestamp: new Date().toISOString()
        }
    }



    async healthScoreZaVozilo(telemtry: any)
    {
        let healthCheck=100;
        if(telemtry.sensors?.engineTemp>95) 
            healthCheck-=0.1;
        if(telemtry.sensors?.engineTemp>95) 
            healthCheck-=0.2;
        if(telemtry.sensors?.batteryLevel<30) 
            healthCheck-=0.1;
        if(telemtry.sensors?.batteryLevel<15) 
            healthCheck-=0.1;
        if(telemtry.sensors?.odometar>50000) 
            healthCheck-=0.1;
        if(telemtry.sensors?.odometar>100000) 
            healthCheck-=0.1;
        if(telemtry.sensors?.odometar>150000) 
            healthCheck-=0.1;
        if(telemtry.sensors?.fuelLevel<20) 
            healthCheck+=0.1;
        if(telemtry.sensors?.fuelLevel<10) 
            healthCheck+=0.1;
        if(telemtry.sensors?.dtcCode) 
            healthCheck+=0.1;

        const score= healthCheck>60? 'HIGH':
        healthCheck>30? 'MED':'LOW'
        await this.redis.setJson(`HEALTH_SCORE`, healthCheck, 86400);

        return{
            score: healthCheck,
        }
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

    async vratiZadnjuPredikciju(deviceId: string)
    {
        const rediscache= await this.redis.get(`maintenance:${deviceId}:prediction`)
        if(rediscache)
        {
            return JSON.parse(rediscache)
        }
        else{
            const cassRez= await this.cass.execute(`SELECT * FROM maintenance_predictor WHERE deviceId=? LIMIT 1`,[deviceId])
            return cassRez.rows[0]
        }
    }

    async obrisiZadnjuPredikciju(deviceId:string)
    {
        await this.cass.execute(`DELETE FROM maintenance WHERE deviceId=?`,
            [deviceId]
        )
        await this.redis.del(`maintenance:${deviceId}:prediction`)
    }
}