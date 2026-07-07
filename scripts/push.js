#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..');
const REPO=process.env.GITHUB_REPO||'Jeffreynuez/Proguild';
const BRANCH=process.env.GITHUB_BRANCH||'main';
function token(){ if(process.env.GH_DEPLOY_TOKEN)return process.env.GH_DEPLOY_TOKEN.trim();
  for(const n of ['gh2.txt','gh-token.txt','.deploy-token']){const p=path.join(__dirname,n); if(fs.existsSync(p)){const t=fs.readFileSync(p,'utf8').trim(); if(t)return t;}}
  console.error('No token. Put a fine-grained PAT (Contents R/W on Jeffreynuez/Proguild) in scripts/gh2.txt'); process.exit(1); }
const TOK=token();
const AUTO_GLOBS=['index.html','our-team.html','privacy-policy.html','vercel.json','package.json','.gitignore','README.md',
 'assets/css/main.css','assets/css/theme.css','assets/js/main.js',
 'data/pages.json','data/team.json','data/privacy.json','data/theme.json','data/_schema.json',
 'scripts/build.js','scripts/push.js','scripts/map.svg'];
async function gh(m,p,b){const r=await fetch('https://api.github.com'+p,{method:m,headers:{Authorization:'Bearer '+TOK,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'proguild-push'},body:b?JSON.stringify(b):undefined});return{status:r.status,json:await r.json().catch(()=>({}))};}
async function remote(rel){const r=await gh('GET',`/repos/${REPO}/contents/${rel}?ref=${BRANCH}`);if(r.status===200)return{sha:r.json.sha,b64:(r.json.content||'').replace(/\n/g,'')};if(r.status===404)return{sha:null,b64:null};throw new Error('GET '+rel+' '+r.status);}
async function push(rel,msg){const abs=path.join(ROOT,rel);if(!fs.existsSync(abs)){console.log('skip',rel);return false;}const bytes=fs.readFileSync(abs);if(/\.json$/.test(rel)){try{JSON.parse(bytes.toString('utf8'));}catch(e){throw new Error('invalid JSON '+rel);}}const b64=bytes.toString('base64');const rm=await remote(rel);if(rm.b64!==null&&rm.b64===b64){console.log('unchanged',rel);return false;}const r=await gh('PUT',`/repos/${REPO}/contents/${rel}`,{message:msg,branch:BRANCH,content:b64,...(rm.sha?{sha:rm.sha}:{})});if(r.status!==200&&r.status!==201)throw new Error('PUT '+rel+' '+r.status+' '+(r.json.message||''));console.log('pushed',rel);return true;}
(async()=>{const args=process.argv.slice(2);const msg=(args[0]||'update')+'\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>';let files=args.slice(1);if(files.length===1&&files[0]==='--auto')files=AUTO_GLOBS;if(!files.length)files=AUTO_GLOBS;let n=0;for(const f of files){if(await push(f,msg))n++;}console.log(n?`\n${n} file(s) pushed to ${REPO}@${BRANCH}`:'nothing to push');})().catch(e=>{console.error('FAILED',e.message);process.exit(1);});
