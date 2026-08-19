-- Seed the 4 real locations with their exact weekly schedules and run the
-- test matrix from the brief (section 52) directly against Postgres.

INSERT INTO "Location" (id, slug, name) VALUES
  ('loc_mokattam', 'mokattam', 'Mokattam'),
  ('loc_zayed', 'zayed', 'Zayed'),
  ('loc_kafr', 'kafr-el-zayat', 'Kafr El-Zayat'),
  ('loc_tanta', 'tanta', 'Tanta');

-- weekday: 0=Sunday 1=Monday 2=Tuesday 3=Wednesday 4=Thursday 5=Friday 6=Saturday
INSERT INTO "WeeklyAvailability" (id, "locationId", weekday, "isAvailable") VALUES
  ('wa1','loc_mokattam',0,true),('wa2','loc_mokattam',1,true),('wa3','loc_mokattam',2,true),
  ('wa4','loc_mokattam',3,true),('wa5','loc_mokattam',4,false),('wa6','loc_mokattam',5,true),('wa7','loc_mokattam',6,true),
  ('wa8','loc_zayed',0,true),('wa9','loc_zayed',1,true),('wa10','loc_zayed',2,true),
  ('wa11','loc_zayed',3,true),('wa12','loc_zayed',4,false),('wa13','loc_zayed',5,true),('wa14','loc_zayed',6,true),
  ('wa15','loc_kafr',0,false),('wa16','loc_kafr',1,false),('wa17','loc_kafr',2,false),
  ('wa18','loc_kafr',3,true),('wa19','loc_kafr',4,true),('wa20','loc_kafr',5,false),('wa21','loc_kafr',6,false),
  ('wa22','loc_tanta',0,false),('wa23','loc_tanta',1,false),('wa24','loc_tanta',2,false),
  ('wa25','loc_tanta',3,true),('wa26','loc_tanta',4,true),('wa27','loc_tanta',5,false),('wa28','loc_tanta',6,false);

INSERT INTO "Service" (id, slug, name) VALUES ('svc_ortho','orthodontics','Orthodontics');
INSERT INTO "Patient" (id, "fullName", age, gender, phone) VALUES ('pat_1','Test Patient A',30,'MALE','01000000001');
INSERT INTO "Patient" (id, "fullName", age, gender, phone) VALUES ('pat_2','Test Patient B',28,'FEMALE','01000000002');

\echo '--- TEST MATRIX: Mokattam & Zayed open every day except Thursday ---'
SELECT l.name, wa.weekday,
  CASE wa.weekday WHEN 0 THEN 'Sunday' WHEN 1 THEN 'Monday' WHEN 2 THEN 'Tuesday'
    WHEN 3 THEN 'Wednesday' WHEN 4 THEN 'Thursday' WHEN 5 THEN 'Friday' WHEN 6 THEN 'Saturday' END AS day_name,
  wa."isAvailable"
FROM "WeeklyAvailability" wa JOIN "Location" l ON l.id = wa."locationId"
WHERE l.slug IN ('mokattam','zayed')
ORDER BY l.name, wa.weekday;

\echo '--- TEST MATRIX: Kafr El-Zayat & Tanta open ONLY Wednesday + Thursday ---'
SELECT l.name, wa.weekday,
  CASE wa.weekday WHEN 0 THEN 'Sunday' WHEN 1 THEN 'Monday' WHEN 2 THEN 'Tuesday'
    WHEN 3 THEN 'Wednesday' WHEN 4 THEN 'Thursday' WHEN 5 THEN 'Friday' WHEN 6 THEN 'Saturday' END AS day_name,
  wa."isAvailable"
FROM "WeeklyAvailability" wa JOIN "Location" l ON l.id = wa."locationId"
WHERE l.slug IN ('kafr-el-zayat','tanta')
ORDER BY l.name, wa.weekday;

\echo '--- DOUBLE BOOKING TEST: first booking should succeed ---'
INSERT INTO "Appointment" (id, "patientId", "locationId", "serviceId", "appointmentDate", "appointmentTime", status)
VALUES ('appt_1', 'pat_1', 'loc_mokattam', 'svc_ortho', '2026-08-22', '11:00', 'PENDING');

\echo '--- DOUBLE BOOKING TEST: identical location+date+time should be REJECTED by the unique constraint ---'
INSERT INTO "Appointment" (id, "patientId", "locationId", "serviceId", "appointmentDate", "appointmentTime", status)
VALUES ('appt_2', 'pat_2', 'loc_mokattam', 'svc_ortho', '2026-08-22', '11:00', 'PENDING');
