import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const inventory=JSON.parse(readFileSync(new URL('../../../registry/portfolio-discovery.v1.json',import.meta.url),'utf8'));
test('portfolio is explicitly disconnected snapshot',()=>{
 assert.equal(inventory.schema_version,'1.0.0');
 assert.equal(inventory.connection_status,'discovery_only');
 assert.equal(inventory.data_classification,'operational_metadata_only');
 assert.equal(inventory.apps.length,6);
});
test('every app has unique identity, pinned main SHA and no claimed live adapter',()=>{
 const seen=new Set();
 for(const x of inventory.apps){
   assert.match(x.app_id,/^[a-z][a-z0-9-]+$/);
   assert.equal(seen.has(x.app_id),false);
   seen.add(x.app_id);
   assert.match(x.repository,/^hdnkabour-gif\/[A-Za-z0-9_-]+$/);
   assert.match(x.main_sha,/^[a-f0-9]{40}$/);
   assert.equal(x.adapter_connected,false);
   assert.equal(x.environment_mapping_verified,false);
 }
});
test('no plaintext secret-bearing payload in discovery inventory',()=>{
 const serialized=JSON.stringify(inventory);
 assert.doesNotMatch(serialized,/"(secret|api_token|password|token_value|private_key)"\s*:/i);
});
