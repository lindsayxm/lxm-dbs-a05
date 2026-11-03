-- Supabase Cron -> the score-taps worker, every 10 seconds.
-- Applied to project esp32c3-pn532-nfc (mvzxhimadnjebnnkciet) on 2026-11-02 through the CLI
-- (supabase db query --remote). Keep it for a new project or to re-run after cron.unschedule. Safe to re-run.
-- Seconds-level schedules need Postgres 15.1.1.61 or later (Project Settings -> Infrastructure).
--
-- The job sends whatever Vault holds under 'worker_key' in the apikey header. The function accepts
-- either the project's secret / service_role key or a WORKER_SECRET token set on the function with
-- `npx supabase secrets set WORKER_SECRET=<token>`. Until 'worker_key' exists the job gets 401s.

-- 0. Extensions (the dashboard does this too: Integrations -> Cron -> Enable; Database -> Extensions -> pg_net).
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net  with schema extensions;

-- 1. The schedule. Re-running with the same job name replaces the job.
select cron.schedule(
  'score-taps-every-10s',
  '10 seconds',
  $$
  select net.http_post(
    url := 'https://mvzxhimadnjebnnkciet.supabase.co/functions/v1/score-taps',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', coalesce((select decrypted_secret from vault.decrypted_secrets where name = 'worker_key'), '')
    ),
    body := jsonb_build_object('time', now()),
    timeout_milliseconds := 8000
  ) as request_id;
  $$
);

-- 2. The credential, once, by a human (Project Settings -> API Keys -> secret key, or your WORKER_SECRET):
--   select vault.create_secret('YOUR-SECRET-KEY', 'worker_key', 'key the score-taps cron job sends');
-- To rotate it later:
--   select vault.update_secret((select id from vault.secrets where name = 'worker_key'), 'NEW-KEY');

-- Check it is running:
--   select jobid, jobname, schedule, active from cron.job;
--   select status, return_message, start_time from cron.job_run_details order by start_time desc limit 10;
--   select id, status_code, content::text from net._http_response order by id desc limit 10;
--   select * from public.worker_state;
-- Stop it:
--   select cron.unschedule('score-taps-every-10s');
