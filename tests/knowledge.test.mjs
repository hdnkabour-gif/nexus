import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {knowledge,validateKnowledge,filterKnowledge} from '../lib/knowledge.js';
const fixture=JSON.parse(readFileSync(new URL('../registry/knowledge-index.v1.json',import.meta.url),'utf8'));
test('existing ids unique and historical sources immutable',()=>{
 assert.ok(knowledge.length>=20);
 assert.equal(new Set(knowledge.map(r=>r.identity)).size,knowledge.length);
 assert.ok(knowledge.every(r=>r.evidence==='HISTORICAL'&&r.source_url.includes(r.source_revision)));
});
test('filters combine project, type, state and case-insensitive search',()=>{
 assert.deepEqual(filterKnowledge(knowledge,{app:'rent-car',q:'ocr'}).map(x=>x.id).sort(),['F-011','TE-RC-05']);
 assert.deepEqual(filterKnowledge(knowledge,{app:'rent-car',q:'OCR',kind:'feature'}).map(x=>x.id),['F-011']);
 assert.deepEqual(filterKnowledge(knowledge,{app:'rent-car',q:'ocr',kind:'evidence'}).map(x=>x.id),['TE-RC-05']);
 assert.ok(filterKnowledge(knowledge,{kind:'idea',status:'IDEA'}).every(x=>x.kind==='idea'&&x.status==='IDEA'));
 assert.equal(filterKnowledge(knowledge,{app:'unknown'}).length,0);
 assert.deepEqual(filterKnowledge(knowledge,{q:['bad']}),knowledge);
});
test('rejects duplicate records, unknown application, and non-allowlisted fields',()=>{
 for(const patch of [{app_id:'tech-platform'},{secret:'not allowed'},{status:'VERIFIED'},{source_path:'../../private'},{observed_on:'2026-02-30'}]){
  const d=structuredClone(fixture);Object.assign(d.records[0],patch);assert.throws(()=>validateKnowledge(d));
 }
 const d=structuredClone(fixture);d.records.push(d.records[0]);assert.throws(()=>validateKnowledge(d),/duplicate/);
});
test('rejects unsafe references and incorrect evidence promotion',()=>{
 for(const patch of [{source_revision:'main'},{title:'<script>'},{evidence:'NAMED_TEST'},{source_url:'https://example.org'}]){
  const d=structuredClone(fixture);Object.assign(d.records[0],patch);assert.throws(()=>validateKnowledge(d));
 }
});
test('knowledge route checks session independently of layout',()=>{
 const src=readFileSync(new URL('../app/console/knowledge/page.jsx',import.meta.url),'utf8');
 assert.match(src,/await getSession\(\)/);assert.match(src,/if\(!session\)redirect\('\/login'\)/);
 assert.match(src,/session\.must_change_password/);assert.match(src,/force-dynamic/);
});
