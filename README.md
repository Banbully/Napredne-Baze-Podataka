# Napredne-Baze-Podataka
Projekat iz Naprednih-Baza-Podataka TrailMetrics

Pre pokretabha projekta

Za projekat su korisceni image za cassandru 3.11 i redis 3.2.12

Orvorite folder OPENME koji sadrzi sve komande za kreiranje tabela u Cassandri 

docker run -d  --name redis-3-2 -p 6379:6379 redis:3.2.12

docker run -d --name cassandra3.11 -p 9042:9042 -p 7000:7000 cassandra:3.11

uci u cassandru docker docker exec -it cassandra3.11 cqlsh

dodavati tabele i keyspace po redu navedenom u schema.cql

Pre pokretanja iskoristiti cd app za ulazak u projekat 
Projekat se pokrece komandom npm run start 

Frontend aplikacije se nalazi na linku  http://localhost:3000/ 

Backend API se nalazi na linku http://localhost:3000/api
