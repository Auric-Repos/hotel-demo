CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_dates_valid" CHECK ("check_out" > "check_in");--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_no_overlap" EXCLUDE USING gist
	("room_id" WITH =, daterange("check_in", "check_out", '[)') WITH &&)
	WHERE (status IN ('confirmed','checked_in'));
