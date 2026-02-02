import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CassandraService } from "src/infrastructure/cassandra/cassandra.service";
import { RedisService } from "src/infrastructure/redis/redis.service";
import { NotificationService } from "../notifikacije/notifications.service";

import { alertsDTO, alertsInsertDTO, alertsUpdateDTO } from "./alerts.dto";
import { sensorDTO, telemetryDTO } from "../telemtrija/telemtrics.dto";
import { Decipher, randomUUID } from "crypto";
import { json } from "stream/consumers";
import { telemetryService } from "../telemtrija/telemetrics.service";
import { time } from "console";
import { timestamp } from "rxjs";

@Injectable()
export class AlertsService{
    constructor(private readonly cass: CassandraService,
        private readonly red: RedisService,
        private readonly not: NotificationService
    )
    {}
    async ProceniUpozorenje(deviceId: string, telemtrija: any)
    {
        const Upozorenja: alertsDTO[]=[];
        if(telemtrija.batteryLevel<10)
        {
            Upozorenja.push({
               deviceId:deviceId,code: "SlabaBaterija", severity:"Visoka opasnost", message:"Nivo baterije je slab proverite bateriju",reseno:false})
        }

        if(telemtrija.engineTemp>95)
        {
            Upozorenja.push({
               deviceId:deviceId,code: "Velika Temperatura motora", severity:"Visoka opasnost", message:"Velika Temperatura Motora proverite!!",reseno:false});
        }

        if(telemtrija.dtcCode)
        {
            Upozorenja.push({
               deviceId:deviceId,code: "TEHNICKIPROBLEM", severity:"Visoka opasnost", message:"Hitno proverite vasa kola",reseno:false})
        }
        if(telemtrija.engineRPM>15000)
        {
             Upozorenja.push({
               deviceId:deviceId,code: "Veliki broj obrtaja", severity:"Visoka opasnost", message:"Smanjite broj obrtaja",reseno:false})
        }
        if(telemtrija.speed>130)
        {
             Upozorenja.push({
               deviceId: deviceId,code: "Prebrza voznja", severity:"Visoka opasnost", message:"Smanjite brzinu",reseno:false})
        }

        for (const upozorenje of Upozorenja)
        {
            await this.sacuvajUpozorenja(deviceId, upozorenje)
        };

        return Upozorenja
    }  
    
    async izmeniUpozorenje(deviceId: string,dan: string, upozorenjeId:string,a: alertsUpdateDTO)
    {

        await this.cass.execute(`UPDATE upozorenja SET code=?, severity=?, message=?, reseno=?  WHERE deviceid=? AND dan=? AND upozorenjeid=?`,
            [
                a.code,
                a.severity,
                a.message,
                a.reseno,
                deviceId,
                dan,
                upozorenjeId
            ],
        )

        await this.red.del(`alerts:${deviceId}`)
    }

    async proveriOdometar(deviceId: string, start: string, kraj:string)
    {
        const odometar1 = await this.cass.execute("SELECT odometer FROM telemetry_by_device_day WHERE deviceid=? and dan=? LIMIT 1",[deviceId, start])
        const odometar2= await this.cass.execute("SELECT odometer FROM telemetry_by_device_day WHERE deviceid=? and dan=? LIMIT 1",[deviceId, kraj])
         if (odometar1.rows.length > 0 && odometar2.rows.length > 0) {
            const startKm = odometar1.rows[0].odometer;
            const endKm = odometar2.rows[0].odometer;
            console.log("start", startKm)
            console.log('kraj', endKm)
            let predjenoKm = endKm - startKm;
            predjenoKm=Math.abs(predjenoKm)
            //mock je mnogoooooooooo los pa generise nasumicno odometr pa samo vrati apsolutnu
            if (predjenoKm > 50000) {
                const upozorenje: alertsDTO = {
                    deviceId,
                    code: "Predjeno 50",
                    severity: "SREDNJA_OPASNOST",
                    message: `Predjeno je dosta kilometra: Reminder napravi mali servis !`,
                    reseno: false
                };
            
                await this.sacuvajUpozorenja(deviceId, upozorenje);
                
            }

            else if (predjenoKm > 100000) {
                const upozorenje: alertsDTO = {
                    deviceId,
                    code: "Predjeno 100",
                    severity: "SREDNJA_OPASNOST",
                    message: `Predjeno je dosta kilometra: Reminder napravi veliki servis !`,
                    reseno: false
                };
            
                await this.sacuvajUpozorenja(deviceId, upozorenje);
               
            }
            return predjenoKm;
        }
    }

    async sacuvajUpozorenja(deviceId: string, a: alertsDTO)
    {
        if (!a?.code || !a?.message || !a?.severity) {
            console.log("Preskacem nevalidno upozorenje:", a);
             return;
        }       

        const allowed= await this.upozorenjaRateLimit(deviceId)
        if(!allowed)
        {
            return; // ako je vise od 5 upozorenja
        }
        const dan = new Date().toISOString().slice(0,10)
        const timestamp= new Date().toISOString()
        const upozorenjeId=`upozorenje${randomUUID()}`
        await this.cass.execute
        (
            `INSERT INTO upozorenja
            (upozorenjeid,deviceid, dan, timestamp, code, severity, message, reseno)
            VALUES(?,?,?,?,?,?,?,?)`
            ,
            [
                upozorenjeId,
                deviceId,
                dan,
                timestamp,
                a.code,
                a.severity,
                a.message,
                a.reseno
            ]
        );

        const alert={
            deviceId,
            timestamp,
            dan,
            code:a.code||null,
            severity:a.severity||null,
            message:a.message, 
            reseno:a.reseno
        }

        await Promise.all([
            await this.red.setJson(`alert:${deviceId}:item:${upozorenjeId}`, alert, 86400),
            !a.reseno && await this.red.lPush(`alert:${deviceId}:${dan}:aktivna`,JSON.stringify(alert))&& 
            this.red.lPush(`alert:${deviceId}:aktivna`,JSON.stringify(alert)),
            await this.red.lPush(`alert:${deviceId}:list`, JSON.stringify(alert)),
        ])
    }

  
    async vratiPoslednjeUpozorenjeZaDan(deviceId: string, dan:string)
    {
        try{
            const cached = await this.red.getInrange(`alert:${deviceId}:${dan}:aktivna`,0,0)
            if(cached)
                return cached.map(r=> JSON.parse(r))
            
            const res= await this.cass.execute('SELECT * FROM upozorenja WHERE deviceid=? AND dan=? LIMIT 1', [deviceId, dan])
            if(res.rowLength===0)
            {
                return null
            }
            await this.red.lPush(`alert:${deviceId}:list`, JSON.stringify(alert))

            return res.rows[0]
        }
        catch(err)
        {
            throw new HttpException("Greska pri vracanju upozorena", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }


    async vratiSvaResenaUpozorenja(deviceId: string, dan:string)
    {
        try{
             const allowed = await this.upozorenjaReadRateLimit(deviceId);

        if (!allowed) {
            throw new HttpException("Previse zahteva. Pokusajte kasnije.",HttpStatus.TOO_MANY_REQUESTS);
        }
            const cached = await this.red.getInrange(`alert:${deviceId}:${dan}:aktivna`,0,0)
            if(cached)
                return cached.map(r=> JSON.parse(r))   
        }
        catch(err){
            throw new Error("Zao nam je doslo je do greske")
        }
    }

    async vratiSvaUpozorenjaZaUredjajOdDo(deviceId:string, od:string,doo:string)
    {
        const allowed = await this.upozorenjaReadRateLimit(deviceId);

        if (!allowed) {
            throw new HttpException("Previse zahteva. Pokusajte kasnije.",HttpStatus.TOO_MANY_REQUESTS);
        }
        const startDan= new Date(od)
        const krajDan= new Date(doo)
        let dani: string[]=[]
        let rez:any[]=[]
        while(startDan<=krajDan)
        {
            dani.push(startDan.toISOString().slice(0,10))
            startDan.setDate(startDan.getDate()+1)
        }
        try{
        
            const cached= await this.red.getInrange(`alert:${deviceId}:list`, 0 , 50)
            if(cached)
            {
                return cached.map(r=> JSON.parse(r))
            }
            for(const dan of dani){
                const res= await this.cass.execute("SELECT * FROM upozorenja WHERE deviceid=? AND dan=?", [deviceId,dan])
                rez=rez.concat(res.rows)
            }
            return rez;
        }   
        catch(err){
            throw new Error("Zao nam je doslo je do greske")
        }
    }

  
    async getAktivna(deviceId: string)
    {
        const cached=await this.red.getInrange(`alert:${deviceId}:aktivna`,0,50)
        if(cached)
        {
            return cached.map(r=>JSON.parse(r))
        }
        return []

    }

    async upozorenjaRateLimit(deviceId:string, limit=5, ttl=60)
    {
        const count= await this.red.incr(`alert:ratelimiter:${deviceId}`);
        if(count===1)
        {
            await this.red.expire(`alert:ratelimiter:${deviceId}`, ttl)
        }

        if (count>limit)
        {
            return false;
        }

        return true;
    }

     async upozorenjaReadRateLimit(deviceId:string, limit=5, ttl=60)
    {
        const count= await this.red.incr(`alert:read:ratelimiter:${deviceId}`);
        if(count===1)
        {
            await this.red.expire(`alert:read:ratelimiter:${deviceId}`, ttl)
        }

        return count<=limit
       
    }
    async resiUpozorenje(deviceId:string, dan:string, upozorenjeId:string)
    {
        await this.cass.execute(`UPDATE upozorenja SET reseno=true WHERE deviceid=? and dan=? and upozorenjeid=?`,[deviceId, dan, upozorenjeId])
        await this.red.del(`alert:${deviceId}:item:${upozorenjeId}`),
        await this.red.del(`alert:${deviceId}:aktivna`)
        return {ok:true}
    }

    async sacuvajSvaUpozorenja(deviceId: string, upozorenja:alertsDTO[])
    {
        for(const upozorenje of upozorenja)
        {
            await this.sacuvajUpozorenja(deviceId, upozorenje)
        }
    }

    async obrisiUpozorenjaZaDan(deviceId:string, dan:string, )
    {
        try{
        await this.cass.execute(
        `DELETE FROM upozorenja WHERE deviceId=? and dan=?`,
        [
            deviceId,dan
        ]
        );
        await Promise.all([
            await this.red.del(`alert:${deviceId}`),
            await this.red.hDel(`alert:aktivna`, deviceId)
        ])
        return {ok: true}; 
        }
        catch(error)
        {
            console.log(error)
        }
    }
     async obrisiUpozorenja(deviceId:string, dan:string, upozorenjeId:string)
    {
        try{
        await this.cass.execute(
        `DELETE FROM upozorenja WHERE deviceid=? and dan=? AND upozorenjeid=?`,
        [
            deviceId,dan, upozorenjeId
        ]
        );

        await Promise.all([
            await this.red.del(`alert:${deviceId}:item:${upozorenjeId}`),
            await this.red.hDel(`alert:${deviceId}:aktivna`, deviceId)
        ])
        return {ok: true}; 
        }
        catch(error)
        {
            console.log(error)
        }
    }
}