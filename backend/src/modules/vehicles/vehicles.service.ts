import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { ApiService } from "src/infrastructure/api/api.service";
import { CassandraService } from "src/infrastructure/cassandra/cassandra.service";
import { telemetryService } from "../telemtrija/telemetrics.service";
import { VehicleUpdateDTO } from "./vehicles.dto";
import { RedisService } from "src/infrastructure/redis/redis.service";


@Injectable()
export class VehicleService
{
    constructor(private readonly cass: CassandraService, private readonly red: RedisService,  private readonly api: ApiService, private readonly telemtry: telemetryService){}

    private timer: Record<string, NodeJS.Timeout>;

    async Create(dto: any)
    {
        const deviceId= `vozilo_${randomUUID()}`;

        await this.cass.execute(
            `INSERT INTO vozila(deviceId, marka, model, gorivo, godina)VALUES(?,?,?,?,?,?)`,
            [deviceId, dto.name, dto.marka, dto.model, dto.gorivo, dto.godina],
        )
 
        
    }

    async UpdateVozilo(deviceId: string, dto: VehicleUpdateDTO)
    {
        await this.cass.execute(
            `Update vozila
            SET ime=?, marka=? , model=?, gorivo=?, godina=?
            WHERE deviceId=?`
        ,
        [
            dto.marka,
            dto.model,
            dto.gorivo,
            dto.godinaProizvodnje
        ])
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

        return {ok: true}
    }
    
    async VratiSvaVozila()
    {
        const res=await this.cass.execute(
            `SELECT * from vozila
            LIMIT=50`
        )
        return res.rows;
    }

    async StartujGenerisanje(deviceId:string, isStated: boolean)
    {
        if(isStated)
        {
            if(this.timer[deviceId]){
                return;
            }
            this.timer[deviceId]=setInterval(async()=>{
            const povuciApi= this.api.fetchFromAPi();

            const pretvori= this.api.mapirajApi(povuciApi, deviceId);

            await this.telemtry.ingest(pretvori);},5000)

            await this.red.set(`vozila:${deviceId}:status`, "aktivan")
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

    async vratiStatus(deviceId: string)
    {
        await this.red.get(`vozila:${deviceId}:status`)
    }
}