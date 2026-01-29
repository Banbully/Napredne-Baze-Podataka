import { Injectable } from "@nestjs/common";
import { CassandraService } from "src/infrastructure/cassandra/cassandra.service";
import { RedisService } from "src/infrastructure/redis/redis.service";
import { NotificationService } from "../notifikacije/notifications.service";

import { alertsDTO, alertsInsertDTO, alertsUpdateDTO } from "./alerts.dto";
import { telemetryDTO } from "../telemtrija/telemtrics.dto";
import { Decipher, randomUUID } from "crypto";

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
               deviceId:telemtrija.deviceId,code: "SlabaBaterija", severity:"Visoka opasnost", message:"Nivo baterije je slab proverite bateriju",timestamp: new Date().toISOString(),reseno:false})
        }

        if(telemtrija.sensors?.engineTemp>95)
        {
            Upozorenja.push({
               deviceId:telemtrija.deviceId,code: "Velika Temperatura motora", severity:"Visoka opasnost", message:"Velika Temperatura Motora proverite!!",timestamp: new Date().toISOString(),reseno:false});
        }

        if(telemtrija.sensors?.dtcCode)
        {
            Upozorenja.push({
               deviceId:telemtrija.deviceId,code: "TEHNICKIPROBLEM", severity:"Visoka opasnost", message:"Hitno proverite vasa kola",timestamp: new Date().toISOString(),reseno:false})
        }
        if(telemtrija.sensors?.engineRPM>15000)
        {
             Upozorenja.push({
               deviceId:telemtrija.deviceId,code: "Veliki broj obrtaja", severity:"Visoka opasnost", message:"Smanjite broj obrtaja",timestamp: new Date().toISOString(),reseno:false})
        }
        if(telemtrija.sensors?.speed>130)
        {
             Upozorenja.push({
               deviceId: telemtrija.deviceId,code: "Prebrza voznja", severity:"Visoka opasnost", message:"Smanjite brzinu",timestamp: new Date().toISOString(),reseno:false})
        }

        return Upozorenja;
    }  
    
    async izmeniUpozorenje(upozorenjeId: string, a: alertsUpdateDTO)
    {
        await this.cass.execute(`UPDATE timestamp, code, severity, message FROM upozorenja SET timestamp, code, severity, message WHERE deviceId=?`,
            [
                a.timestamp,
                a.code,
                a.severity,
                a.message,
                a.reseno
            ],
        )

        await this.red.del(`alerts:`)

    }

    async proveriOdometar(deviceId: string, start: string, kraj:string)
    {
        const odometar1 = await this.cass.execute("SELECT odometar FROM telemetry_by_device_day WHERE deviceId=? and pocetak=?",[deviceId, start])
        const odometar2= await this.cass.execute("SELECT odometar FROM telemetry_by_device_day WHERE deviceId=? and dan=?",[deviceId, kraj])

         if (odometar1.rows.length > 0 && odometar2.rows.length > 0) {
            const startKm = odometar1.rows[0].odometar;
            const endKm = odometar2.rows[0].odometar;
            const predjenoKm = endKm - startKm;


            if (predjenoKm > 1000) {
                const upozorenje: alertsDTO = {
                    deviceId,
                    code: "VELIKA_DAVNA_KILOMETRAZA",
                    severity: "SREDNJA_OPASNOST",
                    message: `Pređeno ${predjenoKm}km u jednom danu. Obratite pažnju na zamor vozača!`,
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
        const upozorenjeId= `alert:${randomUUID()}`
        await this.cass.execute
        (
            `INSERT INTO upozorenja
            (upozorenjeId,deviceId, timestamp, code, severity, message)
            VALUES(?,?,?,?,?,?)`
            ,
            [
                upozorenjeId,
                deviceId,
                a.timestamp,
                a.code,
                a.severity,
                a.message
            ]
        );

        await this.red.setJson(`alert:${upozorenjeId}`, alert, 86400);

    }

    async vratiUpozorenjaPosleDana(deviceId: string, dan: string)
    {
        const pretvoriUTS= new Date(dan).toISOString()
         try{
        const res= await this.cass.execute(`SELECT * upozorenja WHERE deviceId=? and timestamp<=?`, [deviceId, pretvoriUTS])
        return res.rows;
        }
        catch(err){
            throw new Error("Zao nam je doslo je do greske")
        }
    }

    async vratiSvaResenaUpozorenja(deviceId: string, reseno:boolean)
    {
        try{
        const res= await this.cass.execute(`SELECT * upozorenja WHERE deviceId=? and reseno=?`, [deviceId, reseno])
        return res.rows;
        }
        catch(err){
            throw new Error("Zao nam je doslo je do greske")
        }
    }

    async vratiSvaUpozorenjaZaUredjaj(deviceId:string)
    {
        try{
        const res= await this.cass.execute("SELECT * upozorenja WHERE deviceId=?", [deviceId])
        return res.rows;
        }
        catch(err){
            throw new Error("Zao nam je doslo je do greske")
        }
    }

    async getAktivna(deviceId: string)
    {
        const cached=await this.red.getInrange(`alerts:${deviceId}`,0,50)
        if(cached)
        {
            return cached
        }
        const res= await this.cass.execute(`SELECT * FROM upozorenja WHERE timestamp>=? AND deviceId=?`,[new Date().toISOString(),deviceId]);
        if(res.rows && res.rowLength>0)
        {
        }
        return res.rows

    }


    async sacuvajSvaUpozorenja(deviceId: string, upozorenja:alertsDTO[])
    {
        for(const upozorenje of upozorenja)
        {
            await this.sacuvajUpozorenja(deviceId, upozorenje)
        }
    }
    async obrisiUpozorenja(alertId:string)
    {
        await this.cass.execute(
        `DELETE FROM upozorenja WHERE alertId=?`,
        [
            alertId
        ]
        );
        return {ok: true}; 
    }

    async vratiUpozorenjaPoId(upozorenjeId: string){
        const res= await this.cass.execute(`SELECT * FROM upozorenja WHERE upozorenjeId=?`,[upozorenjeId])
        if(res.rowLength===0)
        {
            return null;
        }

        return res.rows
    }
}