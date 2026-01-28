import { Injectable } from "@nestjs/common";
import { timestamp } from "rxjs";


@Injectable()
export class ApiService
{
    async fetchFromAPi()
    {
        const API="https://api.datamock.dev/v1/iot-telemetry?quantity=1&deviceType=vehicle_telematics_unit&status=online&exclude=deviceId,sessionId,deviceType,firmwareVersion,ipAddress,macAddress,signalStrength,networkType,cpuUsage,memoryUsage,sensors.gpsLat,sensors.gpsLon"
        // const ApiURL=process.env.;
        const res= await fetch(API)
        if(res!.ok)
        {
            throw new Error("GRESKA! Zao nam je doslo je do greske prilikom poziva api")
        }

        const json= await res.json()
        return json.data[0]
    }

    mapirajApi(apiPodaci:any, deviceId: string)
    {
          return {
            deviceId,
            ts: apiPodaci.lastSync,
            speed: apiPodaci.sensors.speed,
            engineTemp: apiPodaci.sensors.engineTemp,
            engineRpm: apiPodaci.sensors.engineRpm,
            fuelLevel: apiPodaci.sensors.fuelLevel,
            batteryLevel: apiPodaci.batteryLevel,
            odometer: apiPodaci.sensors.odometer};
    }
}