import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CassandraService } from "src/infrastructure/cassandra/cassandra.service";
import { RedisService } from "src/infrastructure/redis/redis.service";
import { NotificationService } from "../notifikacije/notifications.service";

import { alertsDTO, alertsInsertDTO, alertsUpdateDTO } from "./alerts.dto";
import { telemetryDTO } from "../telemtrija/telemtrics.dto";
import { Decipher, randomUUID } from "crypto";
import { json } from "stream/consumers";
import { telemetryService } from "../telemtrija/telemetrics.service";

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
               deviceId:deviceId,code: "SlabaBaterija", severity:"Visoka opasnost", message:"Nivo baterije je slab proverite bateriju",timestamp: new Date().toISOString(),reseno:false})
        }

        if(telemtrija.sensors?.engineTemp>95)
        {
            Upozorenja.push({
               deviceId:deviceId,code: "Velika Temperatura motora", severity:"Visoka opasnost", message:"Velika Temperatura Motora proverite!!",timestamp: new Date().toISOString(),reseno:false});
        }

        if(telemtrija.sensors?.dtcCode)
        {
            Upozorenja.push({
               deviceId:deviceId,code: "TEHNICKIPROBLEM", severity:"Visoka opasnost", message:"Hitno proverite vasa kola",timestamp: new Date().toISOString(),reseno:false})
        }
        if(telemtrija.sensors?.engineRPM>15000)
        {
             Upozorenja.push({
               deviceId:deviceId,code: "Veliki broj obrtaja", severity:"Visoka opasnost", message:"Smanjite broj obrtaja",timestamp: new Date().toISOString(),reseno:false})
        }
        if(telemtrija.sensors?.speed>130)
        {
             Upozorenja.push({
               deviceId: deviceId,code: "Prebrza voznja", severity:"Visoka opasnost", message:"Smanjite brzinu",timestamp: new Date().toISOString(),reseno:false})
        }

        for (const upozorenje of Upozorenja)
        {
            await this.sacuvajUpozorenja(deviceId, upozorenje)
        };

        return Upozorenja
    }  
    
    async izmeniUpozorenje(upozorenjeId: string, a: alertsUpdateDTO)
    {
        await this.cass.execute(`UPDATE upozorenje SET timestamp=?, code=?, severity=?, message=?  WHERE deviceId=?`,
            [
                a.timestamp,
                a.code,
                a.severity,
                a.message,
                a.reseno
            ],
        )

        await this.red.del(`alerts:${upozorenjeId}`)

    }

    async proveriOdometar(deviceId: string, start: string, kraj:string)
    {
        const odometar1 = await this.cass.execute("SELECT odometar FROM telemetry_by_device_day WHERE deviceId=? and pocetak=?",[deviceId, start])
        const odometar2= await this.cass.execute("SELECT odometar FROM telemetry_by_device_day WHERE deviceId=? and dan=?",[deviceId, kraj])

         if (odometar1.rows.length > 0 && odometar2.rows.length > 0) {
            const startKm = odometar1.rows[0].odometar;
            const endKm = odometar2.rows[0].odometar;
            const predjenoKm = endKm - startKm;


            if (predjenoKm > 50) {
                const upozorenje: alertsDTO = {
                    deviceId,
                    code: "Predjeno 50",
                    severity: "SREDNJA_OPASNOST",
                    message: `Predjeno je dosta kilometra: Reminder napravi mali servis !`,
                    timestamp: new Date().toISOString(),
                    reseno: false
                };
            
                await this.sacuvajUpozorenja(deviceId, upozorenje);
                return predjenoKm;
            }
        }
    }

    private async sacuvajUpozorenja(deviceId: string, a: alertsDTO)
    {
        const allowed= await this.upozorenjaRateLimit(deviceId)
        if(!allowed)
        {
            return; // ako je vise od 5 upozorenja
        }
        const upozorenjeId= `alert:${randomUUID()}`
        const dan = new Date().toISOString()
        await this.cass.execute
        (
            `INSERT INTO upozorenja
            (upozorenjeid,deviceid, timestamp, dan, code, severity, message, reseno)
            VALUES(?,?,?,?,?,?,?,?)`
            ,
            [
                upozorenjeId,
                deviceId,
                a.timestamp,
                dan,
                a.code,
                a.severity,
                a.message,
                a.reseno
            ]
        );

        const alert={
            upozorenjeId,
            deviceId,
            timestamp:a.timestamp,
            dan,
            code:a.code||null,
            severity:a.severity||null,
            message:a.message, 
            reseno:a.reseno
        }

        await Promise.all([
            await this.red.setJson(`alert:${upozorenjeId}`, alert, 86400),
            await this.red.lPush(`alert:${upozorenjeId}:aktivno`,JSON.stringify(alert)),
            await this.red.lPush(`alert:${deviceId}:list`, JSON.stringify(alert)),
            await this.red.lPush(`alert:queue`, JSON.stringify(alert))

        ])
        

    }

  
    async vratiUpozorenjaPoId(upozorenjeId: string)
    {
        try{
            const cached = await this.red.getJSON(`alert:${upozorenjeId}`)
            if(cached)
                return cached

            const res= await this.cass.execute('SELECT * FROM upozorenja WHERE upozorenjeId=? ', [upozorenjeId])
            if(res.rowLength===0)
            {
                return null
            }

            await this.red.setJson(`alert:${upozorenjeId}`, res.rows[0], 86400)

            return res.rows[0]
        }
        catch(err)
        {
            throw new HttpException("Greska pri vracanju upozorena", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

   
    async vratiUpozorenjaOdDana(deviceId: string, dan: string)
    {
        try
        {
            const res= await this.cass.execute(`SELECT * FROM upozorenja WHERE deviceId=? and dan=?`, [deviceId, dan])
            return res.rows;
        }
        catch(err){
            throw new Error("Zao nam je doslo je do greske")
        }
    }

    async vratiSvaResenaUpozorenja(deviceId: string, dan:string)
    {
        try{
        const res= await this.cass.execute(`SELECT * FROM upozorenja WHERE deviceId=? AND dan=? reseno=true`, [deviceId, dan])
        return res.rows;
        }
        catch(err){
            throw new Error("Zao nam je doslo je do greske")
        }
    }

    async vratiSvaUpozorenjaZaUredjaj(deviceId:string, dan:string)
    {
        try{
        const cached= await this.red.getInrange(`alert:${deviceId}:list`, 0 , 50)
        if(cached)
        {
            return cached
        }
        const res= await this.cass.execute("SELECT * upozorenja WHERE deviceId=? AND dan=?", [deviceId,dan])
        return res.rows;
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
            return cached
        }
        const res= await this.cass.execute(`SELECT * FROM upozorenja WHERE deviceId=? and reseno==false`,[deviceId]);
        if(res.rows && res.rowLength>0)
        {
        }
        return res.rows

    }

    async upozorenjaRateLimit(deviceId:string, limit=5, ttl=60)
    {
        const count= await this.red.incr(`alert:ratelimiter:${deviceId}`);
        if(count===1)
        {
            await this.red.expire(`alert:ratelimiter:${deviceId}`, ttl)
        }

        return count<limit;
    }
    async resiUpozorenje(upozorenjeId:string)
    {
        await this.cass.execute(`UPDATE upozorenja SET reseno=true WHERE upozorenjeid=?`,[upozorenjeId])
        await this.red.del(`akerts:${upozorenjeId}`);
        return {ok:true}
    }

    async sacuvajSvaUpozorenja(deviceId: string, upozorenja:alertsDTO[])
    {
        for(const upozorenje of upozorenja)
        {
            await this.sacuvajUpozorenja(deviceId, upozorenje)
        }
    }

    async obrisiUpozorenja(upozorenjeId:string)
    {
        try{
        
        const upozorenje= await this.vratiUpozorenjaPoId(upozorenjeId)
        if (!upozorenje) {
            return { ok: false, message: "Upozorenje nije pronađeno" };
        }
        await this.cass.execute(
        `DELETE FROM upozorenja WHERE upozorenjeId=?`,
        [
            upozorenjeId
        ]
        );

        await Promise.all([
            await this.red.del(`alert:${upozorenjeId}`),
            await this.red.hDel(`alert:active`, upozorenjeId)
        ])
        return {ok: true}; 
    }
    catch(error)
    {
        console.log(error)
    }
    }


     


}