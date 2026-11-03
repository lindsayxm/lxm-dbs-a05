-- Seed data for public.users: the 20 cards in supabase/seed.sql, with a username and avatar each.
-- Run: Supabase dashboard -> SQL Editor -> paste -> Run. Needs the table from migrations/20261102000001_users.sql.
-- Safe to re-run: existing rows are updated in place.

begin;

insert into public.users (uid, user_nm, avatar) values
  ('21:C1:51:3E',          'SchrodingerNancy', 'qubit'),
  ('04:D4:16:67:CF:EF:62', 'QubitBryce',       'cat'),
  ('5F:D0:E2:A5',          'HeisenbergDavid',  'chip'),
  ('04:66:1C:2C:34:25:01', 'EntangledRahaf',   'atom'),
  ('0A:E9:B7:23',          'DecoherenceDon',   'wave'),
  ('04:DC:3D:72:32:96:DF', 'SpinUpJaz',        'entangle'),
  ('3F:92:51:8A',          'BlochRahaf',       'dice'),
  ('04:A4:3D:F5:0B:FB:53', 'TunnelingTony',    'chips'),
  ('B2:AF:DE:46',          'SuperposLindsay',  'spade'),
  ('04:CF:2C:75:E2:D6:8B', 'WaveFuncAustin',   'lattice'),
  ('87:01:89:99',          'PauliJackpot',     'orbital'),
  ('04:2F:53:86:4B:83:EA', 'HadamardHarry',    'tunnel'),
  ('FE:FE:20:2F',          'PlanckGabrielle',  'qubit'),
  ('04:35:47:72:5D:5A:AB', 'BraKetBrian',      'cat'),
  ('5F:52:E2:C3',          'FermiSunanda',     'chip'),
  ('04:17:BE:AA:42:96:D4', 'CollapseCasey',    'atom'),
  ('92:F0:DD:B2',          'QuarkQuinn',       'wave'),
  ('04:DD:F8:E0:EB:13:18', 'PhotonPhoebe',     'entangle'),
  ('86:CD:20:27',          'BosonBella',       'dice'),
  ('04:08:F2:64:9E:AC:C3', 'GluonGus',         'chips')
on conflict (uid) do update
  set user_nm = excluded.user_nm,
      avatar  = excluded.avatar;

commit;

-- To remove exactly these rows again, run:
-- delete from public.users where uid in (
--   '21:C1:51:3E', '04:D4:16:67:CF:EF:62', '5F:D0:E2:A5', '04:66:1C:2C:34:25:01',
--   '0A:E9:B7:23', '04:DC:3D:72:32:96:DF', '3F:92:51:8A', '04:A4:3D:F5:0B:FB:53',
--   'B2:AF:DE:46', '04:CF:2C:75:E2:D6:8B', '87:01:89:99', '04:2F:53:86:4B:83:EA',
--   'FE:FE:20:2F', '04:35:47:72:5D:5A:AB', '5F:52:E2:C3', '04:17:BE:AA:42:96:D4',
--   '92:F0:DD:B2', '04:DD:F8:E0:EB:13:18', '86:CD:20:27', '04:08:F2:64:9E:AC:C3');
