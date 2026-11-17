/** Evidence-first read-only backup classification. No restore commands. */
const MAX_BACKUP_AGE_HOURS = 26;
const MAX_RESTORE_AGE_DAYS = 31;
const ALLOWED_RUN_STATES = new Set(['succeeded','failed','running','unknown']);
const ALLOWED_OFFSITE = new Set(['verified','missing','unknown']);
const ALLOWED_INTEGRITY = new Set(['verified','failed','unknown']);
const ALLOWED_RESTORE = new Set(['passed','failed','unknown']);

function instant(value, nowMs) {
  if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\dT/.test(value) || !/(?:Z|[+-]\d\d:\d\d)$/.test(value)) return null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) && ms <= nowMs + 60_000 ? ms : null;
}
function bounds(value, fallback, max) {
  return Number.isFinite(value) && value > 0 && value <= max ? value : fallback;
}

/**
 * @param {object} evidence - approved app-side status metadata only
 * @param {object} policy - RPO-style freshness limits, never input from the browser
 * @param {Date} now
 * @returns {{state:string,findings:Array<{code:string,severity:string}>,checked_at:string,safe_to_restore_production:false}}
 */
export function assessBackupEvidence(evidence = {}, policy = {}, now = new Date()) {
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) throw new TypeError('invalid clock');
  if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence)) evidence = {};
  const ms = now.getTime();
  const backupHours = bounds(policy.max_backup_age_hours, MAX_BACKUP_AGE_HOURS, 24 * 90);
  const restoreDays = bounds(policy.max_restore_test_age_days, MAX_RESTORE_AGE_DAYS, 365);
  const findings = [];
  const note = (code, severity) => findings.push({code,severity});
  const run = ALLOWED_RUN_STATES.has(evidence.last_run_state) ? evidence.last_run_state : 'unknown';
  if (run === 'failed') note('BACKUP_RUN_FAILED','critical');
  else if (run === 'running') note('BACKUP_STILL_RUNNING','unknown');
  else if (run !== 'succeeded') note('BACKUP_RUN_UNCONFIRMED','unknown');

  const backupMs = instant(evidence.last_success_at, ms);
  if (backupMs === null) note('BACKUP_SUCCESS_TIME_MISSING_OR_INVALID','unknown');
  else if ((ms-backupMs) / 3_600_000 > backupHours) note('BACKUP_TOO_OLD','critical');

  const offsite = ALLOWED_OFFSITE.has(evidence.offsite_copy) ? evidence.offsite_copy : 'unknown';
  if (offsite === 'missing') note('OFFSITE_COPY_MISSING','critical');
  else if (offsite !== 'verified') note('OFFSITE_COPY_UNVERIFIED','unknown');

  const integrity = ALLOWED_INTEGRITY.has(evidence.archive_integrity) ? evidence.archive_integrity : 'unknown';
  if (integrity === 'failed') note('ARCHIVE_INTEGRITY_FAILED','critical');
  else if (integrity !== 'verified') note('ARCHIVE_INTEGRITY_UNVERIFIED','unknown');

  if (evidence.covers_database === false) note('DATABASE_NOT_COVERED','critical');
  else if (evidence.covers_database !== true) note('DATABASE_COVERAGE_UNKNOWN','unknown');

  if (evidence.covers_files === false) note('FILES_NOT_COVERED','critical');
  else if (evidence.covers_files !== true) note('FILES_COVERAGE_UNKNOWN','unknown');

  const restore = ALLOWED_RESTORE.has(evidence.restore_test_state) ? evidence.restore_test_state : 'unknown';
  if (restore === 'failed') note('RESTORE_TEST_FAILED','critical');
  else if (restore !== 'passed') note('RESTORE_TEST_UNCONFIRMED','unknown');

  const restoreMs = instant(evidence.last_isolated_restore_test_at, ms);
  if (restoreMs === null) note('RESTORE_TEST_DATE_MISSING_OR_INVALID','unknown');
  else if ((ms-restoreMs) / 86_400_000 > restoreDays) note('RESTORE_TEST_TOO_OLD','warning');

  const state = findings.some(x=>x.severity==='critical') ? 'critical'
    : findings.some(x=>x.severity==='unknown') ? 'unknown'
    : findings.some(x=>x.severity==='warning') ? 'warning'
    : 'healthy';
  return Object.freeze({state,findings,checked_at:now.toISOString(),safe_to_restore_production:false});
}
