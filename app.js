"use strict";

const INVESTMENTS={30:30,300:300,3000:3000,30000:30000};
const TOTAL_INVESTMENT=33330,MAX_RATE=2,STORAGE_KEY="diamondCounterData_v4";
const DEFAULT_PASSWORD="free_member",PASSWORD_KEY="diamond_password_hash",EXPIRES_KEY="diamond_password_expires",AUTH_KEY="diamond_authenticated";
const CHANGE_PASSWORD_AUTH="oafy7044";
const $=id=>document.getElementById(id);

async function sha256(text){const data=new TextEncoder().encode(text),hash=await crypto.subtle.digest("SHA-256",data);return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,"0")).join("")}
async function getPasswordHash(){let h=localStorage.getItem(PASSWORD_KEY);if(!h){h=await sha256(DEFAULT_PASSWORD);localStorage.setItem(PASSWORD_KEY,h)}return h}
function getExpiry(){return Number(localStorage.getItem(EXPIRES_KEY)||0)}
function isPasswordExpired(){const e=getExpiry();return e>0&&Date.now()>=e}
async function checkPassword(p){return p.length>0&&(await sha256(p))===await getPasswordHash()}
async function unlock(p){if(isPasswordExpired()){$("passwordError").textContent="パスワードの有効期限が切れています。管理者画面から更新してください。";return false}if(await checkPassword(p)){sessionStorage.setItem(AUTH_KEY,"1");showApp();return true}$('passwordError').textContent="パスワードが正しくありません。";return false}
function showApp(){$("lockScreen").classList.add("hidden");$("adminScreen").classList.add("hidden");$("appContent").classList.remove("hidden");calculate()}
function lock(){sessionStorage.removeItem(AUTH_KEY);$("appContent").classList.add("hidden");$("adminScreen").classList.add("hidden");$("lockScreen").classList.remove("hidden");$("passwordInput").value="";$("passwordInput").focus()}
function showAdmin(){$("lockScreen").classList.add("hidden");$("appContent").classList.add("hidden");$("adminScreen").classList.remove("hidden");$("changeAuth").classList.remove("hidden");$("adminPanel").classList.add("hidden");$("changeAuthPassword").value="";$("changeAuthError").textContent="";$("newPassword").value="";$("newPasswordConfirm").value="";$("adminError").textContent="";$("changeAuthPassword").focus()}
function closeAdmin(){$("adminScreen").classList.add("hidden");if(sessionStorage.getItem(AUTH_KEY)==="1"&&!isPasswordExpired())$("appContent").classList.remove("hidden");else{$("lockScreen").classList.remove("hidden");$("passwordInput").focus()}}
async function authorizeChange(){const key=$("changeAuthPassword").value;if(key!==CHANGE_PASSWORD_AUTH){$("changeAuthError").textContent="パスワード変更用パスワードが正しくありません。";$("changeAuthPassword").value="";$("changeAuthPassword").focus();return}$("changeAuth").classList.add("hidden");$("adminPanel").classList.remove("hidden");$("changeAuthError").textContent="";renderExpiry();$("newPassword").focus()}
function renderExpiry(){const e=getExpiry();$("expiryStatus").textContent=e?new Date(e).toLocaleString("ja-JP")+" まで":"無期限"}
async function changePassword(){const p=$("newPassword").value,c=$("newPasswordConfirm").value,days=Math.max(0,Number($("passwordDays").value)||0);if(p.length<4){$("adminError").textContent="新しいパスワードは4文字以上にしてください。";return}if(p!==c){$("adminError").textContent="新しいパスワードが一致しません。";return}localStorage.setItem(PASSWORD_KEY,await sha256(p));if(days)localStorage.setItem(EXPIRES_KEY,String(Date.now()+days*86400000));else localStorage.removeItem(EXPIRES_KEY);sessionStorage.removeItem(AUTH_KEY);$("adminError").textContent="パスワードを変更しました。新しいパスワードで再ログインしてください。";setTimeout(lock,900)}

function value(input){if(!input||input.value.trim()==="")return null;const n=Number(input.value);return Number.isFinite(n)?n:null}
function cappedRate(difference,investment){return Math.min((investment+difference)/investment,MAX_RATE)}
function renderRate(element,rate){element.classList.remove("good","warning","bad","max");if(rate===null||!Number.isFinite(rate)){element.textContent="-";return}element.textContent=`${rate.toFixed(3)}倍`;if(rate>=MAX_RATE)element.classList.add("max");else if(rate>=1.5)element.classList.add("good");else if(rate>=1)element.classList.add("warning");else element.classList.add("bad")}
function updateBaseReferences(){for(let i=1;i<fields.length;i++){const previousAfter=value(fields[i-1].after);fields[i].base.value=previousAfter===null?"":String(previousAfter)}}
function calculate(){updateBaseReferences();for(const field of fields){const base=value(field.base),after=value(field.after);if(base===null||after===null){field.diff.textContent="-";renderRate(field.rate,null);continue}const difference=after-base;field.diff.textContent=difference.toLocaleString("ja-JP");renderRate(field.rate,cappedRate(difference,INVESTMENTS[field.key]))}const firstBase=value(fields[0].base),fourthAfter=value(fields[3].after);if(firstBase===null||fourthAfter===null)renderRate(totalRate,null);else renderRate(totalRate,cappedRate(fourthAfter-firstBase,TOTAL_INVESTMENT));save()}
function save(){try{const data={};fields.forEach(f=>data[f.key]={base:f.base.value,after:f.after.value});localStorage.setItem(STORAGE_KEY,JSON.stringify(data))}catch(e){console.warn("保存できませんでした",e)}}
function load(){try{const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return;const data=JSON.parse(raw);if(data["30"]){fields[0].base.value=data["30"].base??"";fields[0].after.value=data["30"].after??""}for(let i=1;i<fields.length;i++)fields[i].after.value=data[fields[i].key]?.after??""}catch(e){console.warn("保存データを読み込めませんでした",e)}}
function reset(){if(!window.confirm("入力内容をすべてリセットしますか？"))return;fields.forEach(f=>{f.base.value="";f.after.value="";f.diff.textContent="-";renderRate(f.rate,null)});renderRate(totalRate,null);try{localStorage.removeItem(STORAGE_KEY)}catch(e){console.warn("保存データを削除できませんでした",e)}}

const fields=[{key:"30",base:$("base30"),after:$("after30"),diff:$("diff30"),rate:$("rate30")},{key:"300",base:$("base300"),after:$("after300"),diff:$("diff300"),rate:$("rate300")},{key:"3000",base:$("base3000"),after:$("after3000"),diff:$("diff3000"),rate:$("rate3000")},{key:"30000",base:$("base30000"),after:$("after30000"),diff:$("diff30000"),rate:$("rate30000")}];
const totalRate=$("totalRate");

for(let i=1;i<fields.length;i++){fields[i].base.readOnly=true;fields[i].base.setAttribute("aria-readonly","true")}
fields.forEach(f=>{f.after.addEventListener("input",calculate);f.after.addEventListener("change",calculate)});fields[0].base.addEventListener("input",calculate);fields[0].base.addEventListener("change",calculate);$("resetButton").addEventListener("click",reset);
$("passwordForm").addEventListener("submit",e=>{e.preventDefault();unlock($("passwordInput").value)});$("lockButton").addEventListener("click",lock);$("adminButton").addEventListener("click",showAdmin);$("adminAppButton").addEventListener("click",showAdmin);$("adminClose").addEventListener("click",closeAdmin);$("changeAuthButton").addEventListener("click",authorizeChange);$("changePasswordButton").addEventListener("click",changePassword);
load();
if(sessionStorage.getItem(AUTH_KEY)==="1"&&!isPasswordExpired())showApp();
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js",{updateViaCache:"none"}).then(reg=>reg.update()).catch(err=>console.warn("Service Worker登録失敗:",err)));
