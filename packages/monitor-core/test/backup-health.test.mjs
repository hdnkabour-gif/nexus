import test from 'node:test';
import assert from 'node:assert/strict';
import {assessBackupEvidence} from '../src/backup-health.mjs';
const now = new Date('2026-11-17T12:00:00Z');
const good = {
 last_run_state:'succeeded',
 last_success_at:'2026-11-17T10:00:00Z',
 offsite_copy:'verified', archive_integrity:'verified',
 covers_database:true, covers_files:true,
 restore_test_state:'passed',
 last_isolated_restore_test_at:'2026-11-15T09:00:00Z'
};
test('complete evidence is healthy, never grants production restore',()=>{
 const r=assessBackupEvidence(good,{},now);
 assert.equal(r.state,'healthy');assert.equal(r.safe_to_restore_production,false);assert.equal(r.findings.length,0);
});
test('nothing reported remains unknown',()=>assert.equal(assessBackupEvidence({}, {}, now).state,'unknown'));
test('failed backup overrides previous successful run',()=>{
 const r=assessBackupEvidence({...good,last_run_state:'failed'},{},now);
 assert.equal(r.state,'critical');assert.ok(r.findings.some(x=>x.code==='BACKUP_RUN_FAILED'));
});
test('missing offsite is critical',()=>assert.equal(assessBackupEvidence({...good,offsite_copy:'missing'},{},now).state,'critical'));
test('unverified offsite can never be healthy',()=>assert.equal(assessBackupEvidence({...good,offsite_copy:'unknown'},{},now).state,'unknown'));
test('failed archive integrity is critical',()=>assert.equal(assessBackupEvidence({...good,archive_integrity:'failed'},{},now).state,'critical'));
test('missing attachment coverage is critical',()=>assert.equal(assessBackupEvidence({...good,covers_files:false},{},now).state,'critical'));
test('missing database coverage is critical',()=>assert.equal(assessBackupEvidence({...good,covers_database:false},{},now).state,'critical'));
test('old backup is critical even if an earlier backup succeeded',()=>assert.equal(assessBackupEvidence({...good,last_success_at:'2026-11-12T00:00:00Z'},{},now).state,'critical'));
test('stale isolated restore test is warning',()=>{
 const r=assessBackupEvidence({...good,last_isolated_restore_test_at:'2026-09-01T00:00:00Z'},{},now);
 assert.equal(r.state,'warning');assert.ok(r.findings.some(x=>x.code==='RESTORE_TEST_TOO_OLD'));
});
test('failed restore is critical',()=>assert.equal(assessBackupEvidence({...good,restore_test_state:'failed'},{},now).state,'critical'));
test('future timestamp must not count as evidence',()=>assert.equal(assessBackupEvidence({...good,last_success_at:'2026-11-20T00:00:00Z'},{},now).state,'unknown'));
test('caller cannot set invalid age policy to hide stale backup',()=>{
 const r=assessBackupEvidence({...good,last_success_at:'2026-10-01T00:00:00Z'},{max_backup_age_hours:Infinity},now);
 assert.equal(r.state,'critical');
});
test('malformed clocks fail rather than passing',()=>assert.throws(()=>assessBackupEvidence(good,{},new Date('bad'))));
