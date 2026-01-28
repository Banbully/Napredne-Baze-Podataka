import { Type } from "class-transformer";
import { IsArray, IsDateString, isDateString, IsNotEmpty, isNotEmpty, isNumber, IsNumber, IsOptional, isString, IsString, ValidateNested } from "class-validator";

// {
//   "meta": {
//     "status": "OK",
//     "code": 200,
//     "type": "ok",
//     "locale": "en_US",
//     "requestId": "44ba9a45-ac19-4b42-b3a4-5f663f220281",
//     "generatedAt": "2026-01-23T11:26:00.122Z",
//     "total": 1,
//     "seed": "i4p4lQ.34pFmDvEpjGK_hDiwt-RxAk4H9KR1ZgkjJWkc6VHQkDvKp71UPVzvnu_EmEW2R34ZSuMzS9Zo-v5uh0FqKYfObhmPK8Oo2e8ew",
//     "isTest": true,
//     "message": "SUCCESS"
//   },
//   "data": [
//     {
//       "deviceId": "dev_baltic_synap_5b814a78cab4",
//       "sessionId": "sess_baltic_mkqsoq0k_43a8",
//       "deviceType": "vehicle_telematics_unit",
//       "firmwareVersion": "v2.7.19",
//       "ipAddress": "21.70.174.116",
//       "macAddress": "8C:AB:43:C8:84:3A",
//       "signalStrength": -56,
//       "networkType": "wifi_2_4ghz",
//       "location": {
//         "lat": 40.7668,
//         "lng": -73.7753,
//         "zone": "zone-c",
//         "accuracy": 16.1
//       },
//       "status": "low_battery",
//       "batteryLevel": 1,
//       "uptimeSeconds": 648672,
//       "lastSync": "2026-01-22T16:03:56.906Z",
//       "temperatureInternal": 75.9,
//       "memoryUsage": 22.9,
//       "cpuUsage": 50.8,
//       "sensors": {
//         "speed": 45,
//         "engineRpm": 1642,
//         "fuelLevel": 92,
//         "engineTemp": 62.28,
//         "gpsLat": null,
//         "gpsLon": null,
//         "odometer": 152530,
//         "dtcCode": null
//       },
//  
//       ]
//     }
//   ]
// }
export class locationDTO
{
    @IsOptional() @IsNumber() latitude?: number;
    @IsOptional() @IsNumber() longitude?: number;
    @IsOptional() @IsString() zone?: string;
    @IsOptional() @IsNumber() accuracy?: number;
}

export class sensorDTO
{
    @IsOptional() @IsNumber() speed?: number;
    @IsOptional() @IsNumber() engineRPM?: number;
    @IsOptional() @IsNumber() fuelLevel?: number;
    @IsOptional() @IsNumber() engineTemp?: number;
    @IsOptional() @IsNumber() odometar?: number;
    @IsOptional() @IsNumber() dtcCode?: string | null;
}

export class telemetryDTO
{
    @IsString() @IsNotEmpty() deviceId: string;
    @IsDateString() lastsync: string;
    @IsOptional() @IsNumber() batteryLevel?: string;
    @ValidateNested()
    @Type(()=> sensorDTO)
    sensors!:sensorDTO;
}

