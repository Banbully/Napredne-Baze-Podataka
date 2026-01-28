import { Injectable } from "@nestjs/common";
import { timestamp } from "rxjs";
import { CassandraService } from "src/infrastructure/cassandra/cassandra.service";
import { RedisService } from "src/infrastructure/redis/redis.service";

@Injectable()
export class OdrzavanjeService
{
    constructor(private readonly redis: RedisService,
        private readonly cass: CassandraService
    )
    {

    }

    
    async evaluate(deviceId:string, telemetry: any)
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
            VALUES(?,?,?,?,?)`
        )
        
    }

    private predict(telemtry: any)
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

}