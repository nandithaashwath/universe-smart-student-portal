document.addEventListener("DOMContentLoaded",()=>{
 const modal=document.querySelector("[data-modal]");
 const open=document.querySelector("[data-open-modal]");
 const close=document.querySelector("[data-close-modal]");
 if(open&&modal)open.addEventListener("click",()=>modal.classList.add("show"));
 if(close&&modal)close.addEventListener("click",()=>modal.classList.remove("show"));
 if(modal)modal.addEventListener("click",e=>{if(e.target===modal)modal.classList.remove("show")});
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&modal)modal.classList.remove("show")});
});
