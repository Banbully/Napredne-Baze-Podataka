CREATE KEYSPACE IF NOT EXISTS carmetrics
WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': 1
};

USE carmetrics;

CREATE TABLE IF NOT EXISTS gps_by_device_day (
    deviceid text,
    dan text,
    timestamp timestamp,
    latitude double,
    longitude double,
    zone text,
    accuracy double,
    PRIMARY KEY ((deviceid, dan), timestamp)
) WITH CLUSTERING ORDER BY (timestamp DESC);

CREATE TABLE IF NOT EXISTS upozorenja (
    upozorenjeid text,
    deviceid text,
    dan text,
    timestamp text,
    code text,
    severity text,
    message text,
    reseno boolean,
    PRIMARY KEY ((deviceid, dan), upozorenjeid)
) WITH CLUSTERING ORDER BY (upozorenjeid DESC);

CREATE TABLE IF NOT EXISTS vozila (
  deviceId text PRIMARY KEY,
  marka text,
  model text,
  gorivo text,
  godina int,
  boja text,
  registracija text
);

CREATE TABLE IF NOT EXISTS service_book (
    deviceId text,
    datum date,
    imeMajstora text,
    tipServisa text,
    odometar text,
    opis text,
    cena text,
    sledeciServis date,
    PRIMARY KEY (deviceId, datum)
) WITH CLUSTERING ORDER BY (datum DESC);

CREATE TABLE IF NOT EXISTS healthscore (
    deviceid TEXT,
    timestamp TIMESTAMP,
    dan DATE,
    score DOUBLE,
    level TEXT,
    PRIMARY KEY (deviceid, timestamp)
) WITH CLUSTERING ORDER BY (timestamp DESC);

CREATE TABLE IF NOT EXISTS maintenance_predictor (
  deviceId text,
  ts timestamp,
  nivo_opasnosti text,
  risk_score int,
  poruka text,
  PRIMARY KEY (deviceId, ts)
) WITH CLUSTERING ORDER BY (ts DESC);

CREATE TABLE IF NOT EXISTS telemetry_by_device_day (
  deviceId text,
  dan text,
  ts timestamp,
  speed double,
  enginerpm double,
  fuellevel double,
  enginetemp double,
  odometer double,
  PRIMARY KEY ((deviceId, dan), ts)
) WITH CLUSTERING ORDER BY (ts DESC);
