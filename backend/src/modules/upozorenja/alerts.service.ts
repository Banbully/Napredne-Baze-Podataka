import { Injectable } from "@nestjs/common";
import { CassandraService } from "src/infrastructure/cassandra/cassandra.service";
import { RedisService } from "src/infrastructure/redis/redis.service";
import { NotificationService } from "../notifikacije/notifications.service";
import { timestamp } from "rxjs";
import { alertsDTO } from "./alerts.dto";

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
               code: "SlabaBaterija", severity:"Visoka opasnost", message:"Nivo baterije je slab proverite bateriju",timestamp: new Date().toISOString()})
        }

        if(telemtrija.sensors?.engineTemp>95)
        {
            Upozorenja.push({
               code: "Velika Temperatura motora", severity:"Visoka opasnost", message:"Velika Temperatura Motora proverite!!",timestamp: new Date().toISOString()});
        }

        if(telemtrija.sensors?.dtcCode)
        {
            Upozorenja.push({
               code: "TEHNICKIPROBLEM", severity:"Visoka opasnost", message:"Hitno proverite vasa kola",timestamp: new Date().toISOString()})
        }
        if(telemtrija.sensors?.engineRPM>15000)
        {
             Upozorenja.push({
               code: "Veliki broj obrtaja", severity:"Visoka opasnost", message:"Smanjite broj obrtaja",timestamp: new Date().toISOString()})
        }
        if(telemtrija.sensors?.speed>130)
        {
             Upozorenja.push({
               code: "Prebrza voznja", severity:"Visoka opasnost", message:"Smanjite brzinu",timestamp: new Date().toISOString()})
        }

    }  
    

    private async sacuvajUpozorenja(deviceId: string, a: any)
    {
        await this.cass.execute
        (
            `INSERT INTO upozorenja
            (deviceId, timestamp, code, severity, message)
            VALUES(?,?,?,?,?)`
            ,
            [
                deviceId,
                a.timestamp,
                a.code.
                a.severity,
                a.message
            ]
        );

        await this.red.lPush(
            `alerts:${deviceId}`, a
        )
    }

    getAktivna(deviceId: string)
    {
        return this.red.getInrange(`alerts:${deviceId}`,0,50)
    }

    obrisiUpozorenja(deviceId:string)
    {
        this.cass.execute(
        `DELETE FROM upozorenja WHERE deviceID=?`,
        [
            deviceId
        ]
        );
        return {ok: true}; 
    }

}