import { Injectable } from "@nestjs/common";
import { timestamp } from "rxjs";
import { GpsDTO } from "src/modules/gps/gps.dto";
import { alertsDTO } from "src/modules/upozorenja/alerts.dto";


@Injectable()
export class ApiService
{
    async fetchFromAPi()
    {
        const API="https://api.datamock.dev/v1/iot-telemetry?quantity=1&deviceType=vehicle_telematics_unit&status=online&exclude=deviceId,sessionId,deviceType,firmwareVersion,ipAddress,macAddress,signalStrength,networkType,cpuUsage,memoryUsage,sensors.gpsLat,sensors.gpsLon"
        // const ApiURL=process.env.;
        const res= await fetch("https://api.datamock.dev/v1/iot-telemetry?quantity=1&deviceType=vehicle_telematics_unit&status=online&exclude=deviceId,sessionId,deviceType,firmwareVersion,ipAddress,macAddress,signalStrength,networkType,cpuUsage,memoryUsage,sensors.gpsLat,sensors.gpsLon")
        if(!res.ok)
        {
            throw new Error("GRESKA! Zao nam je doslo je do greske prilikom poziva api")
        }

        const json= await res.json()
        console.log("RAW API RESPONSE:", json) // DODAJ OVO!
        console.log("JSON.DATA:", json.data) // DODAJ OVO!
        return json.data[0];
    }

    mapirajApi(apiPodaci: any, deviceId:string) 
    {
    return {
        deviceId,
        ts: apiPodaci.lastSync,
        speed: apiPodaci.sensors?.speed,
        engineTemp: apiPodaci.sensors?.engineTemp,
        engineRpm: apiPodaci.sensors?.engineRpm,
        fuelLevel: apiPodaci.sensors?.fuelLevel,
        odometer: apiPodaci.sensors?.odometer
    };
    }

    mapirajLokaciju(apiPodaci: any)
    {
    const gpsDto = new GpsDTO();
       if (apiPodaci?.location) 
    {
    
        gpsDto.latitude = apiPodaci.location.lat;
        gpsDto.longitude = apiPodaci.location.lng;
        gpsDto.zone = apiPodaci.location.zone;
        gpsDto.accuracy = apiPodaci.location.accuracy;
    }
    
    return gpsDto;
    }

     mapirajAlerts(apiPodaci: any, deviceId:string)
    {
    const alert = new alertsDTO();
       if (apiPodaci?.alerts) 
    {
        alert.deviceId= deviceId;
        alert.code = apiPodaci.alerts?.code;
        alert.message = apiPodaci.alerts?.message;
        alert.severity = apiPodaci.alerts?.severity;
        alert.message = apiPodaci.alerts?.accuracy;
    }
    
    return alert;
    }



}