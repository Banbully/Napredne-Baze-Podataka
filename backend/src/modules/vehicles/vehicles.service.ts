import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { ApiService } from "src/infrastructure/api/api.service";
import { CassandraService } from "src/infrastructure/cassandra/cassandra.service";
import { telemetryService } from "../telemtrija/telemetrics.service";
import { VehicleDTO, VehicleUpdateDTO } from "./vehicles.dto";
import { RedisService } from "src/infrastructure/redis/redis.service";
import { escape } from "querystring";
import { GPSService } from "../gps/gps.service";
import { AlertsService } from "../upozorenja/alerts.service";
import { alertsDTO } from "../upozorenja/alerts.dto";


@Injectable()
export class VehicleService
{
    constructor(private readonly cass: CassandraService,private readonly upozorenja: AlertsService,private readonly alert: AlertsService,  private readonly red: RedisService,  private readonly api: ApiService, private readonly telemtry: telemetryService, private readonly gpsServicw:GPSService){}

    private timer: Record<string, NodeJS.Timeout>={};
    private aktivno: Record<string, boolean> = {};
    


    async Create(dto: VehicleDTO)
    {
        const deviceId= `vozilo_${randomUUID()}`;

        await this.cass.execute(
            `INSERT INTO vozila(deviceId, marka, model, gorivo, godina, boja, registracija)VALUES(?,?,?,?,?,?,?)`,
            [deviceId, dto.marka, dto.model, dto.gorivo, dto.godinaProizvodnje,dto.boja, dto.registracija],
        )

        const podaci={
            deviceId,
            marka:dto.marka,
            model: dto.model,
            gorivo: dto.gorivo,
            godinaProizvodnje: dto.godinaProizvodnje,
            boja: dto.boja,
            reg: dto.registracija
        }
        await this.red.setJson(`vehicles:${deviceId}:info`, podaci);

        await this.red.sadd(`vozila:list`, deviceId);

    }

    async UpdateVozilo(deviceId: string, dto: VehicleUpdateDTO)
    {
        await this.cass.execute(
            `UPDATE vozila
            SET marka=? , model=?, gorivo=?, godina=?, boja=?, registracija=?
            WHERE deviceid=?`
        ,
        [
            dto.marka,
            dto.model,
            dto.gorivo,
            dto.godinaProizvodnje,
            dto.boja,
            dto.registracija,
            deviceId
        ])
         const podaci={
            deviceId,
            marka:dto.marka,
            model: dto.model,
            gorivo: dto.gorivo,
            godinaProizvodnje: dto.godinaProizvodnje,
            boja: dto.boja,
            reg: dto.registracija
        }
        await this.red.setJson(`vehicles:${deviceId}:info`, podaci)
    }

    
    async ObrisiVozilo(id:string)
    {
        await this.cass.execute(
            `DELETE FROM vozila
            WHERE deviceId=?`
        ,
        [
            id
        ],)

        await Promise.all([
            this.red.del(`vehicles:${id}:info`),
            this.red.del(`vozila:${id}:status`),
            this.red.sRem(`vehicles:list`, id)
        ]);

        return {ok: true}
        
    }
    
    async VratiSvaVozila()
    {
        const res=await this.cass.execute(
            `SELECT * from vozila
            LIMIT 50`
        )
        return res.rows;
    }

    async VratiVoziloPoId(deviceId: string) 
    { 
        const kesiran = await this.red.getJSON(`vehicles:${deviceId}:info`);
        if (kesiran) {
            console.log(kesiran)
            return kesiran;
        } 
        const res = await this.cass.execute(`SELECT * FROM vozila WHERE deviceid=?`, [deviceId]);
        if (res.rowLength === 0) {
            throw Error("Zao nam je vozila ne postoji");
        }
        return res.rows[0]; 
    }
    
    async StartujGenerisanje(deviceId:string, isStated: boolean)
    {
        if(isStated===true)
        {
            if(this.timer[deviceId]){
                return;
            }
            this.timer[deviceId]=setInterval(async()=>{
            const povuciApi= await this.api.fetchFromAPi();

            const pretvori= this.api.mapirajApi(povuciApi, deviceId);
           
            const pretvoriGps= this.api.mapirajLokaciju(povuciApi)
            const alerts= this.api.mapirajAlerts(povuciApi)
            console.log(alerts)
            await this.upozorenja.sacuvajUpozorenja(deviceId, alerts)
            console.log(pretvori)
            console.log(pretvoriGps)
            await this.alert.ProceniUpozorenje(deviceId, pretvori)
            await this.red.set(`vozila:${deviceId}:status`, "aktivan")
            await this.gpsServicw.sacuvajTacku(deviceId, pretvoriGps)
            await this.telemtry.ingest(pretvori);},5000)
        }
        else {
            const timer = this.timer[deviceId];

            if (timer) {
                clearInterval(timer);
                delete this.timer[deviceId];
            }
            await this.red.set(`vozila:${deviceId}:status`, "neaktivan")
        }
    }



    async vratiVozilaPoMarci(marka:string)
    {
        const res= await this.cass.execute(`SELECT * FROM vozila WHERE marka=?` ,[marka],)
        return res.rows;
    }

    async vratiVozilaPoModelu(marka:string, model:string)
    {
        const res= await this.cass.execute(`SELECT * FROM vozila WHERE marka=? and model=?` ,[model],)
        return res.rows;
    }

    async vratiNovijaVozilaOd(godina:string)
    {
        const res= await this.cass.execute(`SELECT * FROM vozila WHERE godina>=?` ,[godina],)
        return res.rows;
    }

    async vratiVozilaSaRegOd(datum:string)
    {
        const res= await this.cass.execute(`SELECT FROM vozila WHERE registracija>=?`,[datum])
        return res.rows;
    }
    async vratiStatus(deviceId: string)
    {
        const status=await  this.red.get(`vozila:${deviceId}:status`)
        return {status}
    }


}