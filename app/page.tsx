 "use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

import {
  ShoppingBag,
  Menu,
  X,
  Search,
  Heart,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";


export default function HomePage() {

  const [openMenu, setOpenMenu] = useState(false);


  return (
    <main className="min-h-screen bg-[#faf8f3] overflow-hidden">


{/* ================= NAVBAR ================= */}

<nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-[#ece7db]">

<div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">


{/* LOGO */}

<Link href="/" className="flex items-center gap-3">

<Image
src="/logo.png"
alt="PrimeCart Logo"
width={55}
height={55}
className="object-contain"
/>


<div>

<h1 className="text-2xl font-bold text-black">
Prime<span className="text-[#D4AF37]">Cart</span>
</h1>


<p className="text-xs text-gray-500">
Premium Shopping
</p>


</div>

</Link>



{/* DESKTOP MENU */}

<div className="hidden lg:flex items-center gap-10 font-medium text-gray-700">


<Link
href="/login"
className="hover:text-[#D4AF37] transition"
>
Home
</Link>


<Link
href="/login"
className="hover:text-[#D4AF37] transition"
>
Shop
</Link>


<Link
href="/login"
className="hover:text-[#D4AF37] transition"
>
Categories
</Link>


<Link
href="/login"
className="hover:text-[#D4AF37] transition"
>
Deals
</Link>


<Link
href="/login"
className="hover:text-[#D4AF37] transition"
>
Contact
</Link>


</div>





{/* RIGHT SIDE */}

<div className="flex items-center gap-4">


<Link
href="/login"
className="hidden md:flex w-11 h-11 rounded-xl bg-[#f5f2ea] items-center justify-center hover:bg-[#ece4d0] transition"
>

<Search size={20}/>

</Link>



<Link
href="/login"
className="hidden md:flex w-11 h-11 rounded-xl bg-[#f5f2ea] items-center justify-center hover:bg-[#ece4d0] transition"
>

<Heart size={20}/>

</Link>



<Link
href="/login"
className="hidden md:flex w-11 h-11 rounded-xl bg-[#f5f2ea] items-center justify-center hover:bg-[#ece4d0] transition"
>

<ShoppingCart size={20}/>

</Link>





<Link
href="/login"
className="hidden md:block px-6 py-3 rounded-xl border border-gray-300 hover:border-[#D4AF37] transition"
>
Login
</Link>



<Link
href="/register"
className="hidden md:block px-6 py-3 rounded-xl bg-[#D4AF37] text-white font-semibold hover:scale-105 transition"
>
Register
</Link>




<button
onClick={()=>setOpenMenu(!openMenu)}
className="lg:hidden"
>

{
openMenu ?
<X/>
:
<Menu/>
}

</button>


</div>


</div>



{/* MOBILE MENU */}

{
openMenu && (

<div className="lg:hidden bg-white border-t border-[#ece7db] px-6 py-6">


<div className="flex flex-col gap-5 font-medium text-gray-700">


<Link href="login" onClick={()=>setOpenMenu(false)}>
Home
</Link>


<Link href="/login" onClick={()=>setOpenMenu(false)}>
Shop
</Link>


<Link href="/login" onClick={()=>setOpenMenu(false)}>
Categories
</Link>


<Link href="/login" onClick={()=>setOpenMenu(false)}>
Deals
</Link>


<Link href="/login" onClick={()=>setOpenMenu(false)}>
Contact
</Link>



<Link
href="/login"
onClick={()=>setOpenMenu(false)}
className="border px-5 py-3 rounded-xl text-center"
>
Login
</Link>



<Link
href="/register"
onClick={()=>setOpenMenu(false)}
className="bg-[#D4AF37] text-white px-5 py-3 rounded-xl text-center"
>
Register
</Link>


</div>


</div>

)

}


</nav>





{/* ================= HERO ================= */}


<section className="max-w-7xl mx-auto px-6 py-10">


<div
className="
bg-white
rounded-[40px]
border
border-[#ece7db]
shadow-lg
overflow-hidden
"
>


<div className="grid lg:grid-cols-2 gap-10 items-center p-8 lg:p-14">



{/* LEFT */}

<div>


<div
className="
inline-flex
items-center
gap-2
px-5
py-2
rounded-full
border
border-[#D4AF37]/30
text-[#D4AF37]
font-medium
"
>

🔥 Super Sale is Live!

</div>



<h1
className="
mt-8
text-[60px]
lg:text-[85px]
leading-[0.95]
font-bold
font-serif
text-black
"
>

Shop More.

<br/>

<span className="text-[#D4AF37]">
Pay Less.
</span>


</h1>



<p className="mt-6 text-xl text-gray-600 max-w-xl">

Discover the best products at unbeatable prices.
Your one-stop destination for all your needs.

</p>




<div className="flex flex-wrap gap-4 mt-8">



<Link
href="/login"
className="
bg-[#D4AF37]
text-white
px-8
py-4
rounded-2xl
font-semibold
inline-flex
items-center
gap-2
"
>

Shop Now

<ArrowRight size={18}/>

</Link>




<Link
href="/login"
className="
bg-white
border
border-gray-300
px-8
py-4
rounded-2xl
"
>

Explore Deals

</Link>



</div>



<div className="flex items-center gap-4 mt-10">


<div className="flex -space-x-3">

<div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white"/>

<div className="w-10 h-10 rounded-full bg-gray-400 border-2 border-white"/>

<div className="w-10 h-10 rounded-full bg-gray-500 border-2 border-white"/>


</div>



<p className="text-gray-600">

Join 
<span className="text-[#D4AF37] font-bold">
10,000+
</span>
 Happy Customers

</p>


</div>


</div>





{/* RIGHT IMAGE */}


<div className="flex justify-center">


<Image

src="/hero-product.png"

alt="PrimeCart Hero"

width={900}

height={900}

className="
w-full
max-w-[1100px]
object-contain
scale-125
"

/>


</div>



</div>


</div>


</section>
      {/* ================= FEATURES BAR ================= */}

<section className="max-w-7xl mx-auto px-6 py-8">

<div className="
bg-white
rounded-[30px]
border
border-[#ece7db]
shadow-sm
grid
md:grid-cols-4
overflow-hidden
">


<div className="p-8 flex gap-4 items-center border-r border-[#ece7db]">

<div className="text-4xl">
🚚
</div>

<div>

<h3 className="font-semibold">
Free Delivery
</h3>

<p className="text-gray-500 text-sm">
On orders above ₹499
</p>

</div>

</div>




<div className="p-8 flex gap-4 items-center border-r border-[#ece7db]">

<div className="text-4xl">
🛡️
</div>


<div>

<h3 className="font-semibold">
Secure Payment
</h3>


<p className="text-gray-500 text-sm">
100% secure payment
</p>


</div>

</div>





<div className="p-8 flex gap-4 items-center border-r border-[#ece7db]">


<div className="text-4xl">
🏆
</div>


<div>

<h3 className="font-semibold">
Best Quality
</h3>


<p className="text-gray-500 text-sm">
Top quality products
</p>


</div>


</div>





<div className="p-8 flex gap-4 items-center">


<div className="text-4xl">
🎧
</div>


<div>

<h3 className="font-semibold">
24/7 Support
</h3>


<p className="text-gray-500 text-sm">
Dedicated support
</p>


</div>


</div>



</div>

</section>







{/* ================= CATEGORIES ================= */}


<section className="max-w-7xl mx-auto px-6 py-16">



<div className="text-center mb-10">


<h2 className="
text-5xl
font-bold
text-black
">

Shop By Categories

</h2>


<div
className="
w-16
h-1
bg-[#D4AF37]
mx-auto
mt-3
rounded-full
"
/>


</div>





<div className="
grid
grid-cols-2
md:grid-cols-3
lg:grid-cols-6
gap-5
">



{[
{
name:"Electronics",
products:"2500+ Products",
image:"/products/electronics.png"
},

{
name:"Fashion",
products:"1800+ Products",
image:"/products/fashion.png"
},

{
name:"Watches",
products:"1200+ Products",
image:"/products/watch.png"
},

{
name:"Beauty",
products:"800+ Products",
image:"/products/perfume23.png"
},

{
name:"Home & Living",
products:"1500+ Products",
image:"/products/home.png"
},

{
name:"Gaming",
products:"950+ Products",
image:"/products/gaming.png"
}

].map((category)=>(
  

<Link

key={category.name}

href={`/categories/${category.name
.toLowerCase()
.replace(/\s+/g,"-")
.replace("&","and")
}`}

className="
bg-white
rounded-3xl
border
border-[#eee]
overflow-hidden
shadow-sm
hover:shadow-xl
hover:-translate-y-1
transition-all
duration-300
"


>



<div className="
h-40
bg-[#faf8f3]
flex
items-center
justify-center
">


<img

src={category.image}

alt={category.name}

className="
w-full
h-full
object-contain
p-4
"

/>


</div>




<div className="p-4">


<h3 className="
font-semibold
text-lg
text-black
">

{category.name}

</h3>


<p className="
text-gray-500
text-sm
mt-1
">

{category.products}

</p>



</div>



</Link>


))}



</div>





<div className="flex justify-center mt-10">


<Link

href="/login"

className="
bg-[#D4AF37]
text-white
px-10
py-4
rounded-2xl
font-medium
hover:bg-[#c69f2f]
transition
"

>

View All Categories →

</Link>


</div>




</section>
                {/* ================= FOOTER ================= */}
     
<footer className="
mt-20
bg-[#faf8f3]
text-gray-900
border-t
border-[#ece7db]
">


<div className="
max-w-7xl
mx-auto
px-6
py-16
grid
gap-10
lg:grid-cols-4
">



{/* BRAND */}

<div>


<Link
href="/"
className="flex items-center gap-3 mb-5"
>


<Image

src="/logo.png"

alt="PrimeCart Logo"

width={55}

height={55}

className="object-contain"

/>



<div>

<h2 className="text-2xl font-bold text-black">

Prime<span className="text-[#D4AF37]">
Cart
</span>

</h2>


<p className="text-gray-600 text-sm">
Premium Shopping Store
</p>


</div>


</Link>





<p className="
text-gray-600
leading-relaxed
">

Your one-stop destination for premium
products at unbeatable prices.

</p>


</div>







{/* QUICK LINKS */}


<div>


<h3 className="
text-lg
font-semibold
mb-5
text-black
">

Quick Links

</h3>




<div className="
flex
flex-col
gap-3
text-gray-600
">



<Link
href="/"
className="hover:text-[#D4AF37] transition"
>
Home
</Link>



<Link
href="/login"
className="hover:text-[#D4AF37] transition"
>
Shop
</Link>



<Link
href="/login"
className="hover:text-[#D4AF37] transition"
>
Categories
</Link>



<Link
href="/login"
className="hover:text-[#D4AF37] transition"
>
Deals
</Link>



</div>


</div>








{/* CUSTOMER */}


<div>


<h3 className="
text-lg
font-semibold
mb-5
text-black
">

Customer Service

</h3>




<div className="
flex
flex-col
gap-3
text-gray-600
">



<Link
href="/login"
className="hover:text-[#D4AF37] transition"
>
Contact Us
</Link>




<Link
href="/login"
className="hover:text-[#D4AF37] transition"
>
Shipping Policy
</Link>




<Link
href="/login"
className="hover:text-[#D4AF37] transition"
>
Returns
</Link>




<Link
href="/login"
className="hover:text-[#D4AF37] transition"
>
Privacy Policy
</Link>



</div>


</div>









{/* NEWSLETTER */}


<div>


<h3 className="
text-lg
font-semibold
mb-5
text-black
">

Stay Updated

</h3>




<p className="
text-gray-600
mb-4
">

Subscribe for latest offers and deals.

</p>






<div className="
flex
gap-2
">



<input

type="email"

placeholder="Your email"

className="
w-full
px-4
py-3
rounded-xl
bg-white
border
border-[#ece7db]
text-black
outline-none
"

/>





<button

className="
bg-[#D4AF37]
px-5
rounded-xl
font-semibold
text-white
hover:bg-[#c69f2f]
transition
"

>

→

</button>




</div>



</div>





</div>









{/* BOTTOM */}


<div className="
border-t
border-[#ece7db]
py-6
text-center
text-gray-600
text-sm
">


© 2026 PrimeCart. All Rights Reserved.


</div>



</footer>
     </main>
);
}
