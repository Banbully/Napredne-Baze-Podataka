import { Injectable } from "@nestjs/common";
import { CassandraService } from "src/infrastructure/cassandra/cassandra.service";
import { RedisService } from "src/infrastructure/redis/redis.service";
import { VehicleService } from "../vehicles/vehicles.service";
import { servisDTO, servisUpdateDTO } from "./servis.dto";
import { randomUUID } from "crypto";

@Injectable()
export class ServisService
{
    constructor(private readonly cass: CassandraService, private readonly red: RedisService, private readonly veh: VehicleService)
    {
    }

    async CreateServis(servisDTO: servisDTO)
    {
        const servisId= `servis:${randomUUID()}`
        const timestamp= new Date().toISOString()
        try{
        const vozilo= await this.veh.VratiVoziloPoId(servisDTO.deviceId);
        }
        catch(err)
        {
            throw new Error("Zao nam je doslo je do greske")
        }
        this.cass.execute(
            `
            INSERT INTO service_book 
            (deviceId, datum, imeMajstora, tipServisa, odometar, opis, cena, sledeciServis)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                servisDTO.deviceId,
                servisDTO.datum,         
                servisDTO.imeMajstora,
                servisDTO.tipServisa,
                servisDTO.odometar,
                servisDTO.opis,
                servisDTO.cena,
                servisDTO.sledeciServis ?? null
            ]
        );

        await this.red.setJson(`servis${servisId}`, servisDTO)
        await this.red.setJson(`servis${servisDTO.deviceId}:latest`, servisDTO);
    }
    
    async Update(servisDTO: servisUpdateDTO, servisID: string)
    {
        const servisId= this.getServisPoId(servisID)
        if(!servisId)
        {
            return "Zao nam je servis ne postoji"
        }
        const timestamp= new Date().toISOString()
        this.cass.execute(`UPDATE service_book SET majstor=? tipServisa=? ,odometar=?, odradjen=?, WHERE servisId=?`,
            [
                servisDTO.imeMajstora,
                servisDTO.tipServisa,
                servisDTO.odometar,
                timestamp,
                servisId
            ]
        )
        await this.red.del(`servis:${servisId}`);
    }

    async getServisPoId(deviceId: string)
    {
        const cached= await this.red.getJSON(`servis:${deviceId}`);
        if(cached)
            return cached
        const res= await this.cass.execute(`SELECT * from service_book WHERE deviceId=?`, [deviceId])
        return res.rows;
    }
    
    async getSviServisi()
    {
        const res= await this.cass.execute(`SELECT * from service_book LIMIT 50`)
        return res.rows;
    }

    async getServiciPoVozilu(deviceId:string)
    {
        const cached = await this.red.getJSON(`servis:vozilo:${deviceId}`);
        if (cached) return cached;
        const res= await this.cass.execute(`SELECT * from service_book WHERE deviceId=? LIMIT 50`,[deviceId])
        return res.rows;   
    }

    async obrisiServisIzKnjige(servisId:string)
    {
        const servis= await this.getServisPoId(servisId)
        if(!servis)
        {
            return false;
        }

        await this.cass.execute(`DELETE FROM service_book WHERE servisId=?`,[servisId])

        await Promise.all([
            this.red.del(`servis:${servisId}`),
        ]);
    }

    async vratiServiseOdDatuma(dan: string)
    {
        const pretvoriUDan= new Date(dan).toISOString();
        const res= await this.cass.execute(`SELECT * FROM service_book WHERE timestamp<=?`,[pretvoriUDan])
        if(res.rowLength===0)
        {
            return"Zao nam je doslo je do greske"
        }
        return res.rows;
    }

    async vratiServisPoMajstoru(imeMajstora:string)
    {
        const res= await this.cass.execute(`SELECT * FROM service_book WHERE majstor=?`,[imeMajstora])
        if(res.rowLength===0)
        {
            return"Zao nam je doslo je do greske"
        }
        return res.rows;
    }
 
}
