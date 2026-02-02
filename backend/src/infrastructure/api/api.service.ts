import { Injectable } from "@nestjs/common";
import { timestamp } from "rxjs";
import { GpsDTO } from "src/modules/gps/gps.dto";
import { alertsDTO } from "src/modules/upozorenja/alerts.dto";


@Injectable()
export class ApiService
{
    async fetchFromAPi()
    {
        try{
        const API="https://api.datamock.dev/v1/iot-telemetry?quantity=1&deviceType=vehicle_telematics_unit&status=online&exclude=deviceId,sessionId,deviceType,firmwareVersion,ipAddress,macAddress,signalStrength,networkType,cpuUsage,memoryUsage,sensors.gpsLat,sensors.gpsLon"
        // const ApiURL=process.env.;
        const res= await fetch("https://api.datamock.dev/v1/iot-telemetry?quantity=1&deviceType=vehicle_telematics_unit&status=online&exclude=deviceId,sessionId,deviceType,firmwareVersion,ipAddress,macAddress,signalStrength,networkType,cpuUsage,memoryUsage,sensors.gpsLat,sensors.gpsLon")

        const json= await res.json()
        if (!json.data || !Array.isArray(json.data) || json.data.length === 0) 
        {
            console.log("API je vratio prazan niz podataka");
        
            return this.generisiFallbackPodatke();
        }

            console.log("API RESPONSE:", json.data[0]);
            return json.data[0];
        }
        catch (err) {
            return this.generisiFallbackPodatke();
        }
    
    }
    //ako nam padne api da ne pada cela app
    private generisiFallbackPodatke() 
    {
        const now = new Date().toISOString();
        return {
            lastSync: now,
            sensors: {
            speed: Math.floor(Math.random() * 120) + 30, // 30-150 km/h
            engineTemp: Math.floor(Math.random() * 40) + 80, // 80-120°C
            engineRpm: Math.floor(Math.random() * 3000) + 1500, // 1500-4500 RPM
            fuelLevel: Math.floor(Math.random() * 60) + 20, // 20-80%
            odometer: Math.floor(Math.random() * 100000) + 5000, // 5000-105000 km
            gpsLat: 44.7866 + (Math.random() * 0.1 - 0.05), // Beograd okolina
            gpsLon: 20.4489 + (Math.random() * 0.1 - 0.05)
        },
      location: {
            lat: 44.7866 + (Math.random() * 0.1 - 0.05),
            lng: 20.4489 + (Math.random() * 0.1 - 0.05),
            zone: "urban",
            accuracy: 5 + Math.random() * 10
      },
      alerts: []
    };
  }

    mapirajApi(apiPodaci: any, deviceId:string) 
    {
    return {
        deviceId,
        ts: apiPodaci?.lastSync|| new Date().toISOString,
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

     mapirajAlerts(apiPodaci: any)
    {
      if(!Array.isArray(apiPodaci.alerts)) return [];

         return apiPodaci.alerts
         .filter(a => a.code && a.message && a.severity)
         .map(a => ({
            code: a.code,
            message: a.message,
            severity: a.severity,
            timestamp: new Date().toISOString(),
            reseno: false
     }));
    }



}