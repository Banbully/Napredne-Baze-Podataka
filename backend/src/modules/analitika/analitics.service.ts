import { Injectable, Res } from "@nestjs/common";
import { CassandraService } from "src/infrastructure/cassandra/cassandra.service";
import { RedisService } from "src/infrastructure/redis/redis.service";
import { sensorDTO } from "./analytics.dto";
import { metrics } from "cassandra-driver";




export enum SensorData{
   speed= "speed",
   engineRPM= "engineRPM",
   fuelLevel= "fuelLevel",
   engineTemp= "engineTemp",
   odometar= "odometar",
   dtcCode= "dtcCode"
}
@Injectable()
export class AnalyticsService
{
    constructor(private readonly red: RedisService, private readonly cass: CassandraService)
    {
        
    }

    async vratiBRzinuOdDoZaGraf(deviceId: string, od:string, doo:string)
    {

        const startDan= new Date(od)
        const krajDan= new Date(doo)
        let dani: string[]=[]
        let rezultat: { x: string, y: number }[] = [];
        const cached= await this.red.getJSON(`analitika:${deviceId}:speed:${od}:${doo}`)
        
        while(startDan<=krajDan)
        {
            dani.push(startDan.toISOString().slice(0,10))
            startDan.setDate(startDan.getDate()+1)
        }
        if(cached)
        {
            return cached
        }
        for(const dan of dani){
            const res= await this.cass.execute(`SELECT ts,speed FROM telemetry_by_device_day WHERE deviceid=? AND dan=?`,[deviceId, dan])

            const rez=res.rows.map(r=>({x: r.ts,y:r.speed}))
            rezultat=rezultat.concat(rez)
        }
        await this.red.set(`analitika:${deviceId}:speed:${od}:${doo}`, JSON.stringify(rezultat))
        return rezultat;
    }


    async vratiOdometarOdDOZaGraf(deviceId:string, od:string, doo:string)
    {
        const startDan= new Date(od)
        const krajDan= new Date(doo)
        let dani: string[]=[]
        let rezultat:  { x: string, y: number }[] = [];
        const cached= await this.red.getJSON(`analitika:${deviceId}:odometar:${od}:${doo}`)
        if(cached)
        {
            return cached
        }

        while(startDan<=krajDan)
        {
            dani.push(startDan.toISOString().slice(0,10))
            startDan.setDate(startDan.getDate()+1)
        }
        for(const dan of dani){
            const res= await this.cass.execute(`SELECT ts,odometer FROM telemetry_by_device_day WHERE deviceid=? AND dan=?`,[deviceId, dan])

             //gledaj obrnutu logiku msm ima da izgleda ko da vracamo kilometre thanks api
            const rez= res.rows.map(r => ({x:r.ts,y: r.odometer}));

            rezultat=rezultat.concat(rez)
        }

        await this.red.set(`analitika:${deviceId}:odometar:${od}:${doo}`, JSON.stringify(rezultat))
        return rezultat;
    }


    async vratiTemperaturuOdDo(deviceId:string, od:string, doo:string)
    {
         
        const startDan= new Date(od)
        const krajDan= new Date(doo)
        let dani: string[]=[]
        let rezultat: { x: string, y: number }[] = [];
         const cached= await this.red.get(`analitika:${deviceId}:engineTemp:${od}:${doo}`)
        if(cached)
        {
            return JSON.parse(cached)
        }
        while(startDan<=krajDan)
        {
            dani.push(startDan.toISOString().slice(0,10))
            startDan.setDate(startDan.getDate()+1)
        }
        for(const dan of dani){
            const res= await this.cass.execute(`SELECT ts,enginetemp FROM telemetry_by_device_day WHERE deviceid=? AND dan=?`,[deviceId, dan])

            rezultat=rezultat.concat(res.rows.map(r=>({x:r.ts, y:r.enginetemp})))
        }
        if(rezultat.length==0)
        {
            return 0
        }

        await this.red.set(`analitika:${deviceId}:temp:${od}:${doo}`, JSON.stringify(rezultat))
        return rezultat;
    }

    async potrosnjaGoriva(deviceId:string, od:string, do0:string)
    {
        
        const startDan= new Date(od)
        const krajDan= new Date(do0)
        let dani: string[]=[]
        let rezultat: number[]=[]

        while(startDan<=krajDan)
        {
            dani.push(startDan.toISOString().slice(0,10))
            startDan.setDate(startDan.getDate()+1)
        }

        for(const dan of dani){
            const res= await this.cass.execute(`SELECT fuellevel FROM telemetry_by_device_day WHERE deviceid=? AND dan=? `,[deviceId, dan])
            rezultat= rezultat.concat(res.rows.map(r=> r.fuellevel))
          
        }
        if(rezultat.length<1)
        {
            return 0
        }
        let potrosnja= rezultat[0]- rezultat[rezultat.length-1]

        if(potrosnja<0)
        {
            potrosnja=0;
        }
        await this.red.set(`analitika:${deviceId}:potrosnja`, JSON.stringify(potrosnja))

        return potrosnja
    }


    async minMaxIProsecnaBrzina(deviceId:string, od:string, doo:string)
    {
        const startDan= new Date(od)
        const krajDan= new Date(doo)
        let dani: string[]=[]
        let rezultat: number[]=[]

        const cached=await this.red.getJSON(`analitika:${deviceId}:speed:od${od}:do${doo}`)
        if(cached) 
            return cached

        while(startDan<=krajDan)
        {
            dani.push(startDan.toISOString().slice(0,10))
            startDan.setDate(startDan.getDate()+1)
        }
        for(const dan of dani){
            const res= await this.cass.execute(`SELECT speed from telemetry_by_device_day 
                WHERE deviceid=? AND dan=? `,
                [deviceId, dan]
            )

            rezultat=rezultat.concat(res.rows.map(r=>r.speed))
        }   
        if(rezultat.length==0)
        {
            return {min:0, max:0, prosek:0}
        }
        const rez={
            min: Math.min(...rezultat),
            max: Math.max(...rezultat),
            prosek: Math.round(rezultat.reduce((a,b)=>a+b,0) / rezultat.length)
        }

        await this.red.set(`analitika:${deviceId}:minmaxbrzina:od${od}:do${doo}`,JSON.stringify(rez))
        return rez
    }

    async vratiRpmZaGraf(deviceId:string, od:string, doo:string)
    {
        const startDan= new Date(od)
        const krajDan= new Date(doo)
        let dani: string[]=[]
        let rezultat: any[]=[]

        const cached=await this.red.getJSON(`analitika:${deviceId}:engineRpm:od${od}:do${doo}`)
        if(cached) 
            return cached


        while(startDan<=krajDan)
        {
            dani.push(startDan.toISOString().slice(0,10))
            startDan.setDate(startDan.getDate()+1)
        }

        for(const dan of dani){
                const res= await this.cass.execute(`SELECT engineRpm from telemetry_by_device_day 
                WHERE deviceid=? AND dan=? ORDER BY ts DESC`,
                [deviceId, dan]
            )   
            rezultat= rezultat.concat(res.rows)
        }

        await this.red.set(`analitika:${deviceId}:engineRpm:od${od}:do${doo}`,JSON.stringify(rezultat))
        return rezultat
    }



    async dailyAnalitika(deviceId: string, dan:string)
    {
        const cached=await this.red.getJSON(`analitika:dnevna:${deviceId}:${dan}`)
        if(cached)
        {
            return cached
        }

        const res= await this.cass.execute(`SELECT * from telemetry_by_device_day WHERE deviceid=? AND dan=?`, [deviceId,dan])

        if(res.rows.length==0)
            return;

        console.log(res.rows[0]);
        const brzine=res.rows.map(r=>r.speed);
        const temp=res.rows.map(r=>r.enginetemp);
        const odometar=res.rows.map(r=>r.odometer);
        const gorivo=res.rows.map(r=>r.fuellevel);
        const obrtaji=res.rows.map(r=>r.enginerpm);

        console.log(brzine)
        console.log(temp)
        console.log(odometar)
        console.log(gorivo)
        console.log(obrtaji)
        const predjeno=odometar[odometar.length-1]-odometar[0]
        const analitika={
            deviceId,
            dan, 
            AvgSpeed: Math.round(brzine.reduce((a,b)=>a+b,0) / brzine.length),
            MaxSpeed: Math.max(...brzine),
            MinSpeed: Math.min(...brzine),
            Potrosnja: gorivo[0]- gorivo[gorivo.length-1],
            Predjeno:Math.abs(Number(predjeno)),//mockuj da nemamo negativne 
            MaxObrtaji: Math.max(...obrtaji),
            MaxTempMotora:  Math.max(...temp),
            ProsecnaTemp: Math.round(temp.reduce((a,b)=>a+b,0)/ temp.length)
        }

        await this.red.setJson(`analitika:dnevna:${deviceId}:${dan}`, analitika, 60*60*24)
        return analitika
    }
}