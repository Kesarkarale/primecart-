"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, Check, ChevronDown, GitCompare, Heart,
  Loader2, RefreshCw, Search, ShoppingBag, ShoppingCart, Sparkles,
  Star, Target, X, Zap
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Product = {
  id:string; category_id:string|null; name:string; slug?:string|null;
  short_description?:string|null; description?:string|null; price:number;
  original_price?:number|null; stock?:number|null; image_url?:string|null;
  brand?:string|null; rating?:number|null; reviews_count?:number|null;
  is_featured?:boolean|null; is_flash_sale?:boolean|null; is_active?:boolean|null;
};
type Category={id:string;name:string;slug:string};
type Match=Product & {
  categoryName:string; score:number; reasons:string[];
  breakdown:{budget:number;category:number;purpose:number;priority:number;rating:number;brand:number;stock:number};
};

const CART="primecart-cart", SAVED="primecart-prime-match-saved", HISTORY="primecart-prime-match-history";
const PURPOSES=[
  ["everyday","Everyday","Daily essentials","✦"],["work","Work & Study","Productivity","◫"],
  ["entertainment","Entertainment","Audio & gaming","▶"],["fitness","Fitness","Active lifestyle","⌁"],
  ["style","Style","Fashion & looks","◇"],["home","Home","Home essentials","⌂"]
] as const;
const BUDGETS=[
  ["under-1000","Under ₹1K",0,1000],["1000-5000","₹1K – ₹5K",1000,5000],
  ["5000-15000","₹5K – ₹15K",5000,15000],["15000-30000","₹15K – ₹30K",15000,30000],
  ["30000-plus","₹30K+",30000,Infinity]
] as const;
const PRIORITIES=[["price","Best Price","₹"],["rating","Rating","★"],["performance","Performance","⚡"],["quality","Quality","◆"],["style","Style","◇"],["features","Features","✦"],["brand","Brand","B"],["availability","Availability","✓"]] as const;
const PURPOSE_WORDS:Record<string,string[]>={
 everyday:["mobile","phone","watch","bag","bottle","headphone","shirt","home","kitchen","wallet","beauty"],
 work:["laptop","keyboard","mouse","monitor","office","book","study","desk","work","notebook","electronics"],
 entertainment:["gaming","speaker","headphone","headset","earbuds","bluetooth","game","console","tv","music","electronics"],
 fitness:["fitness","gym","yoga","running","sports","shoe","dumbbell","workout","bottle","footwear"],
 style:["fashion","shirt","tshirt","hoodie","jacket","denim","watch","bag","wallet","shoe","eyewear","sunglass","beauty"],
 home:["home","living","kitchen","coffee","cookware","appliance","air fryer","kettle","decor","mixer","oven","furniture"]
};
const CATEGORY_WORDS:Record<string,string[]>={
 mobile:["mobile","phone","smartphone","iphone","android"], fashion:["fashion","shirt","tshirt","hoodie","jacket","denim"],
 footwear:["shoe","sneaker","footwear","running","sandals","slipper"], watch:["watch","smartwatch"], bag:["bag","backpack","luggage","wallet"],
 gaming:["gaming","game","keyboard","mouse","controller","headset"], automotive:["car","automotive","bike","vehicle"],
 appliance:["appliance","air fryer","kettle","coffee","oven","mixer"], "toy-baby":["toy","baby","kids","children"],
 "home-living":["home","living","kitchen","cookware","decor","coffee","furniture"],
 eyewear:["eyewear","glasses","sunglasses","spectacles","frames"], books:["book","books","fiction","novel","education","reading"],
 beauty:["beauty","skincare","makeup","cosmetics","haircare","fragrance"], electronics:["electronics","gadgets","audio","speaker","headphones","tech"]
};
const QUESTIONS:Record<string,{title:string;options:string[]}>={
 mobile:{title:"What matters most in your phone?",options:["Camera","Gaming","Battery","Performance","Display","Balanced"]},
 footwear:{title:"What will you use it for?",options:["Running","Walking","Sports","Casual","Comfort","Style"]},
 books:{title:"What kind of reading are you after?",options:["Fiction","Education","Self Help","Business","Technology","General"]},
 beauty:{title:"What is your main beauty need?",options:["Skincare","Makeup","Haircare","Fragrance","Personal Care","General"]},
 eyewear:{title:"What are you looking for?",options:["Sunglasses","Eyeglasses","Blue Light","Fashion","Outdoor","Everyday"]},
 electronics:{title:"What type of tech do you need?",options:["Audio","Accessories","Smart Devices","Computer","Gaming","Everyday Tech"]},
 gaming:{title:"What is your gaming priority?",options:["Performance","Keyboard","Mouse","Audio","Display","Accessories"]}
};

function money(n:number){return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Number(n)||0)}
function norm(s:string){return s.toLowerCase().replace(/[^a-z0-9]+/g," ").trim()}
function img(v?:string|null){if(!v?.trim())return "";const x=v.trim();if(/^(https?:|data:|\/)/i.test(x))return x;if(x.startsWith("products/"))return "/"+x;if(x.startsWith("public/products/"))return "/"+x.replace("public/","");return "/products/"+x}
function off(p:Product){const a=Number(p.original_price||0),b=Number(p.price||0);return a>b?Math.round((a-b)/a*100):0}
function parse<T>(v:string|null,f:T):T{try{return v?JSON.parse(v):f}catch{return f}}

function score(p:Product,cats:Category[],purpose:string,budget:string,cat:string,brand:string,priorities:string[],detail:string):Match{
 const c=cats.find(x=>x.id===p.category_id), text=norm([p.name,p.brand,p.short_description,p.description,c?.name,c?.slug].filter(Boolean).join(" "));
 const b=BUDGETS.find(x=>x[0]===budget)||BUDGETS[1], price=Number(p.price||0), rating=Number(p.rating||0), stock=Number(p.stock||0);
 const budgetScore=price>=b[2]&&price<=b[3]?100:(Math.abs(price-(price<b[2]?b[2]:b[3]))<=1000?82:Math.abs(price-(price<b[2]?b[2]:b[3]))<=3000?65:30);
 const selected=cats.find(x=>x.id===cat);
 const words=selected?(CATEGORY_WORDS[selected.slug]||norm(selected.name).split(" ")):[""];
 let categoryScore=cat==="all"?78:p.category_id===cat?100:(words.some(w=>text.includes(norm(w)))?70:18);
 const pw=PURPOSE_WORDS[purpose]||[], purposeScore=pw.length?(pw.filter(w=>text.includes(norm(w))).length>=2?100:pw.some(w=>text.includes(norm(w)))?82:52):70;
 const detailScore=detail?(text.includes(norm(detail))?100:55):75;
 const brandScore=brand==="Any Brand"?82:(p.brand||"").toLowerCase()===brand.toLowerCase()?100:20;
 const ratingScore=Math.max(40,Math.min(100,Math.round(rating/5*100)));
 const vals:Record<string,number>={price:off(p)>=20?100:off(p)>=10?88:72,rating:ratingScore,performance:/pro|max|ultra|gaming|performance|power|speed/.test(text)?96:65,quality:rating>=4.5?96:rating>=4?86:68,style:/fashion|style|premium|beauty|eyewear|watch/.test(text)?94:68,features:/smart|wireless|bluetooth|camera|display|audio|feature/.test(text)?92:70,brand:p.brand?88:62,availability:stock>10?100:stock>0?82:10};
 const priorityScore=Math.round((priorities.length?priorities.reduce((a,x)=>a+(vals[x]??70),0)/priorities.length:70)*.75+detailScore*.25);
 const stockScore=stock>10?100:stock>0?82:10;
 let total=Math.round(budgetScore*.24+categoryScore*.22+purposeScore*.16+priorityScore*.16+ratingScore*.10+brandScore*.07+stockScore*.05);
 if(p.is_featured)total+=2;if(p.is_flash_sale)total+=2;if(stock<=0)total-=20;total=Math.max(15,Math.min(99,total));
 const reasons:string[]=[];if(budgetScore>=95)reasons.push("Fits your budget");else if(budgetScore>=75)reasons.push("Close to your budget");
 if(categoryScore>=95)reasons.push("Exact category match");if(purposeScore>=90)reasons.push("Fits your purpose");
 if(priorityScore>=90)reasons.push("Matches your priorities");if(brandScore>=95)reasons.push("Preferred brand");if(ratingScore>=90)reasons.push("Highly rated");if(p.is_flash_sale)reasons.push("Special deal");
 return {...p,categoryName:c?.name||"PrimeCart",score:total,reasons:(reasons.length?reasons:["Good overall match"]).slice(0,3),
 breakdown:{budget:budgetScore,category:categoryScore,purpose:purposeScore,priority:priorityScore,rating:ratingScore,brand:brandScore,stock:stockScore}};
}

function Bar({label,value}:{label:string;value:number}){return <div><div className="mb-1 flex justify-between text-[10px] font-bold"><span className="text-gray-500">{label}</span><span className="text-[#9b762b]">{value}%</span></div><div className="h-1.5 rounded-full bg-[#eee8dc]"><div className="h-full rounded-full bg-[#c9a24d]" style={{width:`${value}%`}}/></div></div>}
function Card({p,rank,wished,added,compared,onWish,onCart,onCompare}:{p:Match;rank:number;wished:boolean;added:boolean;compared:boolean;onWish:()=>void;onCart:()=>void;onCompare:()=>void}){
 return <article className="group overflow-hidden rounded-[24px] border border-[#e8dfcf] bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#d9bf7b] hover:shadow-xl">
  <div className="relative aspect-square bg-[#faf7f0]">{img(p.image_url)?<Image src={img(p.image_url)} alt={p.name} fill sizes="(max-width:640px) 90vw,(max-width:1024px) 45vw,300px" className="object-contain p-6 transition group-hover:scale-105"/>:<div className="flex h-full items-center justify-center text-[#b8aa93]"><ShoppingBag size={40}/></div>}
   <span className="absolute left-3 top-3 rounded-full bg-[#292219] px-3 py-1.5 text-[9px] font-black text-white">#{rank}</span>
   <span className="absolute left-3 top-12 rounded-full border border-[#eadfca] bg-white/95 px-3 py-1.5 text-[9px] font-black text-[#9b762b]"><Sparkles className="mr-1 inline" size={10}/>{p.score}% Match</span>
   <button onClick={onWish} className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border bg-white/95 ${wished?"text-red-500 border-red-200":"text-gray-500 border-[#e5dccb]"}`}><Heart size={16} fill={wished?"currentColor":"none"}/></button>
   <div className="absolute bottom-3 left-3 flex gap-1.5">{off(p)>0&&<span className="rounded-full bg-[#c9a24d] px-2.5 py-1 text-[9px] font-black text-white">{off(p)}% OFF</span>}{p.is_flash_sale&&<span className="rounded-full bg-[#33291f] px-2.5 py-1 text-[9px] font-black text-white"><Zap className="mr-1 inline" size={9}/>FLASH</span>}</div>
  </div>
  <div className="p-4">
   <div className="flex justify-between gap-2"><span className="truncate text-[9px] font-black uppercase tracking-wider text-[#a17b2f]">{p.categoryName}</span>{p.is_featured&&<span className="text-[9px] font-black text-[#a17b2f]">FEATURED</span>}</div>
   <Link href={`/dashboard/products/${p.id}`}><h3 className="mt-2 line-clamp-2 min-h-[44px] text-[14px] font-black leading-5 group-hover:text-[#a17b2f]">{p.name}</h3></Link>
   {p.brand&&<p className="mt-1 text-[10px] text-gray-400">{p.brand}</p>}
   <div className="mt-3 min-h-[38px] space-y-1">{p.reasons.map(x=><p key={x} className="flex items-center gap-1 text-[9px] font-bold text-emerald-600"><Check size={10}/>{x}</p>)}</div>
   <div className="mt-2 flex items-center gap-2"><span className="rounded-lg bg-[#fff4d8] px-2 py-1 text-[10px] font-black text-[#956f27]"><Star className="mr-1 inline" size={10} fill="currentColor"/>{Number(p.rating||0).toFixed(1)}</span><span className="text-[10px] text-gray-400">{Number(p.reviews_count||0).toLocaleString("en-IN")} reviews</span></div>
   <div className="mt-3"><span className="text-lg font-black">{money(Number(p.price))}</span>{p.original_price&&Number(p.original_price)>Number(p.price)&&<span className="ml-2 text-[10px] text-gray-400 line-through">{money(Number(p.original_price))}</span>}</div>
   <p className={`mt-1 text-[9px] font-bold ${Number(p.stock||0)>0?"text-emerald-600":"text-red-500"}`}>{Number(p.stock||0)>0?(Number(p.stock)<=5?`Only ${p.stock} left`:"In stock"):"Out of stock"}</p>
   <div className="mt-3 flex gap-2"><button onClick={onCompare} className={`flex h-10 w-10 items-center justify-center rounded-xl border ${compared?"border-[#c9a24d] bg-[#fff8e9] text-[#9b762b]":"border-[#e5dccb] text-gray-500"}`}><GitCompare size={14}/></button><button disabled={!p.stock} onClick={onCart} className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-[10px] font-black text-white ${added?"bg-emerald-600":"bg-[#c9a24d] hover:bg-[#b58d3f]"} disabled:bg-gray-100 disabled:text-gray-400`}>{added?<><Check size={13}/>Added</>:<><ShoppingCart size={13}/>Add to Cart</>}</button><Link href={`/dashboard/products/${p.id}`} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5dccb]"><ArrowRight size={14}/></Link></div>
  </div>
 </article>
}

export default function PrimeMatchPage(){
 const supabase=useMemo(()=>createClient(),[]);
 const [products,setProducts]=useState<Product[]>([]),[cats,setCats]=useState<Category[]>([]),[brands,setBrands]=useState<string[]>([]),[wishlist,setWishlist]=useState<string[]>([]),[cartIds,setCartIds]=useState<string[]>([]);
 const [loading,setLoading]=useState(true),[matching,setMatching]=useState(false),[matched,setMatched]=useState(false),[error,setError]=useState("");
 const [purpose,setPurpose]=useState("everyday"),[budget,setBudget]=useState("1000-5000"),[category,setCategory]=useState("all"),[brand,setBrand]=useState("Any Brand"),[search,setSearch]=useState(""),[detail,setDetail]=useState(""),[priorities,setPriorities]=useState<string[]>(["price","rating","quality"]);
 const [rSearch,setRSearch]=useState(""),[min,setMin]=useState(""),[max,setMax]=useState(""),[rating,setRating]=useState("0"),[sort,setSort]=useState("match"),[compare,setCompare]=useState<string[]>([]);
 const [toast,setToast]=useState("");

 useEffect(()=>{(async()=>{try{const {data:a}=await supabase.auth.getUser();if(!a.user){location.href="/auth/login";return}const [p,c,w]=await Promise.all([supabase.from("products").select("id,category_id,name,slug,short_description,description,price,original_price,stock,image_url,brand,rating,reviews_count,is_featured,is_flash_sale,is_active").eq("is_active",true),supabase.from("categories").select("id,name,slug").order("name"),supabase.from("wishlist").select("product_id").eq("user_id",a.user.id)]);if(p.error)throw p.error;if(c.error)throw c.error;if(w.error)throw w.error;const ps=(p.data||[]) as Product[];setProducts(ps);setCats((c.data||[]) as Category[]);setWishlist((w.data||[]).map(x=>x.product_id));setBrands(Array.from(new Set(ps.map(x=>x.brand?.trim()).filter((x):x is string=>!!x))).sort((a,b)=>a.localeCompare(b)));setCartIds(parse<any[]>(localStorage.getItem(CART),[]).map(x=>x.product_id||x.id).filter(Boolean))}catch(e){console.error(e);setError("Something went wrong while loading PrimeMatch.")}finally{setLoading(false)}})()},[supabase]);

 const results=useMemo(()=>{let d=products.map(p=>score(p,cats,purpose,budget,category,brand,priorities,detail));const q=norm(rSearch||search);if(q)d=d.filter(p=>norm(`${p.name} ${p.brand||""} ${p.categoryName} ${p.short_description||""}`).includes(q));if(min)d=d.filter(p=>Number(p.price)>=Number(min));if(max)d=d.filter(p=>Number(p.price)<=Number(max));if(rating!=="0")d=d.filter(p=>Number(p.rating||0)>=Number(rating));d.sort((a,b)=>sort==="price-low"?Number(a.price)-Number(b.price):sort==="price-high"?Number(b.price)-Number(a.price):sort==="rating"?Number(b.rating||0)-Number(a.rating||0):sort==="discount"?off(b)-off(a):b.score-a.score);return d},[products,cats,purpose,budget,category,brand,priorities,detail,rSearch,search,min,max,rating,sort]);
 const top=results[0], active=cats.find(c=>c.id===category), question=active?QUESTIONS[active.slug]:null;

 function toastMsg(s:string){setToast(s);setTimeout(()=>setToast(""),2200)}
 async function run(){if(!products.length){toastMsg("No active products found.");return}setMatching(true);setMatched(false);await new Promise(r=>setTimeout(r,750));setMatched(true);setMatching(false);setTimeout(()=>document.getElementById("results")?.scrollIntoView({behavior:"smooth"}),100)}
 function reset(){setPurpose("everyday");setBudget("1000-5000");setCategory("all");setBrand("Any Brand");setSearch("");setDetail("");setPriorities(["price","rating","quality"]);setMatched(false);setRSearch("");setMin("");setMax("");setRating("0");setSort("match")}
 async function wish(id:string){const {data:a}=await supabase.auth.getUser();if(!a.user){location.href="/auth/login";return}if(wishlist.includes(id)){await supabase.from("wishlist").delete().eq("user_id",a.user.id).eq("product_id",id);setWishlist(x=>x.filter(i=>i!==id));toastMsg("Removed from wishlist")}else{const {error:e}=await supabase.from("wishlist").insert({user_id:a.user.id,product_id:id});if(e&&!e.message.toLowerCase().includes("duplicate")){toastMsg("Wishlist update failed");return}setWishlist(x=>[...x,id]);toastMsg("Added to wishlist")}}
 function cart(p:Product){if(!p.stock){toastMsg("Product is out of stock");return}const a=parse<any[]>(localStorage.getItem(CART),[]),i=a.findIndex(x=>x.product_id===p.id||x.id===p.id);if(i>=0)a[i].quantity=Math.min(Number(p.stock),Number(a[i].quantity||0)+1);else a.push({id:p.id,product_id:p.id,name:p.name,price:Number(p.price),quantity:1,image_url:p.image_url,stock:p.stock});localStorage.setItem(CART,JSON.stringify(a));setCartIds(a.map(x=>x.product_id||x.id));toastMsg("Added to cart")}
 function toggleCompare(id:string){setCompare(x=>x.includes(id)?x.filter(i=>i!==id):x.length>=3?(toastMsg("Compare up to 3 products"),x):[...x,id])}

 return <div className="min-h-screen bg-[#faf8f3] text-[#3f3428]">
  <header className="sticky top-0 z-50 border-b border-[#e8deca] bg-white/95 backdrop-blur-xl"><div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
   <div className="flex items-center gap-3"><Link href="/dashboard" className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5dccb]"><ArrowLeft size={17}/></Link><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9a24d] text-white"><Target size={18}/></div><div><h1 className="text-base font-black">PrimeMatch</h1><p className="hidden text-[10px] text-gray-400 sm:block">Personalized shopping intelligence</p></div></div>
   <div className="flex items-center gap-2"><Link href="/dashboard/wishlist" className="hidden h-10 w-10 items-center justify-center rounded-xl border sm:flex"><Heart size={17}/></Link><Link href="/dashboard/cart" className="relative flex h-10 w-10 items-center justify-center rounded-xl border"><ShoppingCart size={17}/>{cartIds.length>0&&<span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-[#b9975b] px-1 text-center text-[9px] font-black text-white">{cartIds.length}</span>}</Link><Link href="/dashboard/products" className="hidden items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-black sm:flex"><ShoppingBag size={14}/>Browse Products</Link></div>
  </div></header>

  <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
   <section className="relative overflow-hidden rounded-[32px] border border-[#eadfca] bg-white shadow-sm"><div className="absolute -right-32 -top-40 h-[480px] w-[480px] rounded-full bg-[#f5e7c5] blur-3xl"/><div className="relative grid items-center gap-10 px-6 py-10 lg:grid-cols-[1.1fr_.9fr] lg:px-14 lg:py-14">
    <div><div className="inline-flex items-center gap-2 rounded-full border border-[#e9ddc2] bg-[#fffaf0] px-4 py-2 text-[10px] font-black uppercase tracking-wider text-[#9b762b]"><Sparkles size={13}/>PrimeCart Intelligence</div><h2 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">Shopping,<br/><span className="text-[#b58a32]">personalized.</span></h2><p className="mt-5 max-w-xl text-sm leading-7 text-gray-500 sm:text-base">Tell PrimeMatch what you need, set your budget and priorities, and find explainable matches from real PrimeCart products.</p><div className="mt-5 flex flex-wrap gap-2">{["Smart matching","Real products","Explainable results"].map(x=><span key={x} className="rounded-xl border bg-[#fffdf9] px-3 py-2 text-[10px] font-bold"><Check className="mr-1 inline text-[#b58a32]" size={12}/>{x}</span>)}</div></div>
    <div className="hidden items-center justify-center lg:flex"><div className="flex h-64 w-64 items-center justify-center rounded-full border border-[#eadfca]"><div className="flex h-36 w-36 flex-col items-center justify-center rounded-[34px] bg-[#c9a24d] text-white shadow-2xl"><Sparkles size={25}/><b className="mt-2 text-2xl">MATCH</b><span className="text-[8px] font-black tracking-widest">ENGINE</span></div></div></div>
   </div></section>

   {error&&<div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-600">{error}<button onClick={()=>location.reload()} className="ml-4 rounded-lg bg-red-600 px-3 py-2 text-white">Retry</button></div>}

   <section className="mt-8 rounded-[28px] border border-[#eadfca] bg-white p-5 shadow-sm sm:p-7"><div className="mb-7 flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-wider text-[#a17b2f]">Build your match</p><h3 className="mt-1 text-2xl font-black">Tell us what you need</h3></div><button onClick={reset} className="flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-black"><RefreshCw size={14}/>Reset</button></div>
    <div className="space-y-7">
     <div><p className="mb-3 text-[11px] font-black uppercase tracking-wider text-gray-500">1. Purpose</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{PURPOSES.map(([id,t,s,icon])=><button key={id} onClick={()=>setPurpose(id)} className={`rounded-2xl border p-4 text-left ${purpose===id?"border-[#c9a24d] bg-[#fff9eb]":"border-[#eee5d8]"}`}><span className="text-xl">{icon}</span><p className="mt-2 text-xs font-black">{t}</p><p className="mt-1 text-[9px] text-gray-400">{s}</p></button>)}</div></div>
     <div><p className="mb-3 text-[11px] font-black uppercase tracking-wider text-gray-500">2. Category</p><div className="relative"><select value={category} onChange={e=>{setCategory(e.target.value);setDetail("")}} className="h-12 w-full appearance-none rounded-xl border bg-[#fffdf9] px-4 text-sm font-bold"><option value="all">All Categories</option>{cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" size={16}/></div></div>
     {question&&<div className="rounded-2xl border border-[#eadfca] bg-[#fffaf0] p-4"><p className="text-[10px] font-black uppercase tracking-wider text-[#9b762b]">Category preference</p><p className="mt-2 text-sm font-black">{question.title}</p><div className="mt-3 flex flex-wrap gap-2">{question.options.map(o=><button key={o} onClick={()=>setDetail(o)} className={`rounded-xl border px-3 py-2 text-[10px] font-black ${detail===o?"border-[#c9a24d] bg-[#c9a24d] text-white":"bg-white"}`}>{o}</button>)}</div></div>}
     <div><p className="mb-3 text-[11px] font-black uppercase tracking-wider text-gray-500">3. Budget</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{BUDGETS.map(([id,l])=><button key={id} onClick={()=>setBudget(id)} className={`rounded-xl border px-3 py-3 text-[10px] font-black ${budget===id?"border-[#c9a24d] bg-[#fff5dd] text-[#9b762b]":""}`}>{l}</button>)}</div></div>
     <div><div className="mb-3 flex justify-between"><p className="text-[11px] font-black uppercase tracking-wider text-gray-500">4. Priorities</p><span className="text-[9px] text-gray-400">{priorities.length}/5</span></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{PRIORITIES.map(([id,l,ic])=><button key={id} onClick={()=>setPriorities(x=>x.includes(id)?x.filter(y=>y!==id):x.length<5?[...x,id]:x)} className={`rounded-xl border px-3 py-3 text-left text-[10px] font-black ${priorities.includes(id)?"border-[#c9a24d] bg-[#fff5dd] text-[#9b762b]":""}`}><span className="mr-2">{ic}</span>{l}</button>)}</div></div>
     <div className="grid gap-4 sm:grid-cols-2"><div><p className="mb-3 text-[11px] font-black uppercase tracking-wider text-gray-500">5. Brand</p><select value={brand} onChange={e=>setBrand(e.target.value)} className="h-12 w-full rounded-xl border bg-white px-4 text-sm font-bold"><option>Any Brand</option>{brands.map(b=><option key={b}>{b}</option>)}</select></div><div><p className="mb-3 text-[11px] font-black uppercase tracking-wider text-gray-500">6. Specific need</p><div className="relative"><Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="camera, running, skincare..." className="h-12 w-full rounded-xl border bg-[#fffdf9] pl-10 pr-4 text-sm outline-none"/></div></div></div>
     <div className="flex justify-end border-t pt-6"><button disabled={loading||matching} onClick={run} className="flex h-12 items-center gap-2 rounded-xl bg-[#c9a24d] px-7 text-sm font-black text-white disabled:opacity-60">{matching?<><Loader2 className="animate-spin" size={17}/>Finding Matches...</>:<><Sparkles size={17}/>Find My Prime Match<ArrowRight size={17}/></>}</button></div>
    </div>
   </section>

   {matched&&top&&<section id="results" className="mt-8 scroll-mt-24">
    <div className="rounded-[30px] border border-[#eadfca] bg-gradient-to-br from-[#fffaf0] via-white to-[#f8efdc] p-5 sm:p-7"><div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"><div><p className="text-[10px] font-black uppercase tracking-wider text-[#a17b2f]"><Sparkles className="mr-1 inline" size={13}/>Your PrimeMatch</p><h3 className="mt-2 text-2xl font-black">We found matches for you.</h3><p className="mt-2 max-w-2xl text-sm text-gray-500">Your result considers budget, category, purpose, priorities, rating, brand and stock.</p><div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full bg-white px-3 py-1 text-[9px] font-black">{BUDGETS.find(x=>x[0]===budget)?.[1]}</span><span className="rounded-full bg-white px-3 py-1 text-[9px] font-black">{active?.name||"All Categories"}</span></div></div><div className="text-center"><div className="text-5xl font-black text-[#9b762b]">{top.score}%</div><p className="text-[9px] font-black uppercase tracking-wider text-gray-400">Prime Match</p></div></div>
     <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Bar label="Budget fit" value={top.breakdown.budget}/><Bar label="Category fit" value={top.breakdown.category}/><Bar label="Priority fit" value={top.breakdown.priority}/><Bar label="Rating" value={top.breakdown.rating}/></div>
    </div>

    <div className="mt-5 rounded-2xl border bg-white p-4"><div className="grid gap-2 md:grid-cols-[1fr_110px_110px_140px_150px]"><div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={rSearch} onChange={e=>setRSearch(e.target.value)} placeholder="Refine results..." className="h-10 w-full rounded-xl border pl-9 text-xs"/></div><input value={min} onChange={e=>setMin(e.target.value)} placeholder="Min ₹" type="number" className="h-10 rounded-xl border px-3 text-xs"/><input value={max} onChange={e=>setMax(e.target.value)} placeholder="Max ₹" type="number" className="h-10 rounded-xl border px-3 text-xs"/><select value={rating} onChange={e=>setRating(e.target.value)} className="h-10 rounded-xl border px-3 text-xs"><option value="0">Any Rating</option><option value="4">4★+</option><option value="4.5">4.5★+</option></select><select value={sort} onChange={e=>setSort(e.target.value)} className="h-10 rounded-xl border px-3 text-xs"><option value="match">Best Match</option><option value="rating">Top Rated</option><option value="discount">Best Discount</option><option value="price-low">Price Low</option><option value="price-high">Price High</option></select></div><p className="mt-3 text-[9px] font-bold text-gray-400">{results.length} matching products</p></div>

    {results.length?<div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{results.map((p,i)=><Card key={p.id} p={p} rank={i+1} wished={wishlist.includes(p.id)} added={cartIds.includes(p.id)} compared={compare.includes(p.id)} onWish={()=>wish(p.id)} onCart={()=>cart(p)} onCompare={()=>toggleCompare(p.id)}/>)}</div>:<div className="mt-6 rounded-2xl border border-dashed bg-white p-12 text-center"><Target className="mx-auto text-[#c9a24d]" size={34}/><h3 className="mt-3 font-black">No exact match found</h3><p className="mt-2 text-xs text-gray-400">Try widening your price range or removing one filter.</p><button onClick={()=>{setMin("");setMax("");setRating("0");setRSearch("")}} className="mt-4 rounded-xl bg-[#c9a24d] px-5 py-2.5 text-xs font-black text-white">Show Closest Matches</button></div>}
   </section>}

   {!matched&&!loading&&<section className="mt-8 grid gap-4 md:grid-cols-3">{[["01","Tell us your needs","Choose purpose, category, budget and preferences."],["02","Set your priorities","Tell PrimeMatch what matters most to you."],["03","Get explainable matches","See products and exactly why they fit."]].map(x=><div key={x[0]} className="rounded-2xl border bg-white p-6"><span className="rounded-lg bg-[#fff4d8] px-2.5 py-2 text-[9px] font-black text-[#9b762b]">{x[0]}</span><h3 className="mt-5 font-black">{x[1]}</h3><p className="mt-2 text-xs leading-5 text-gray-400">{x[2]}</p></div>)}</section>}

   {compare.length>0&&<section className="mt-8 overflow-x-auto rounded-2xl border bg-white p-5"><div className="flex justify-between"><h3 className="font-black">Compare selected products</h3><button onClick={()=>setCompare([])} className="text-xs font-bold text-gray-400">Clear</button></div><table className="mt-4 min-w-[650px] w-full text-left text-xs"><tbody>{[["Product",(p:Match)=>p.name],["Match",(p:Match)=>`${p.score}%`],["Price",(p:Match)=>money(Number(p.price))],["Rating",(p:Match)=>`${Number(p.rating||0).toFixed(1)}★`],["Brand",(p:Match)=>p.brand||"—"],["Stock",(p:Match)=>Number(p.stock||0)>0?"Available":"Out of stock"]].map(([l,f])=><tr key={l as string} className="border-b"><td className="p-3 font-bold text-gray-400">{l as string}</td>{compare.map(id=>{const p=results.find(x=>x.id===id);return p?<td key={id} className="p-3 font-black">{(f as any)(p)}</td>:null})}</tr>)}</tbody></table></section>}

   <footer className="py-10 text-center"><p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">© {new Date().getFullYear()} PrimeCart · Shop Smarter</p></footer>
  </main>
  {toast&&<div className="fixed bottom-5 left-1/2 z-[100] -translate-x-1/2 rounded-xl bg-[#33291f] px-5 py-3 text-xs font-black text-white shadow-2xl">{toast}</div>}
 </div>
}
