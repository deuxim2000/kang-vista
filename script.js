<script>
"use strict";

document.addEventListener("DOMContentLoaded",function(){

const $=id=>document.getElementById(id);
const $$=s=>document.querySelectorAll(s);

const header=$("header");
const mainMenu=$("mainMenu");
const menuToggle=$("menuToggle");
const popup=$("popup01");
const popupBox1=$("popupBox1");
const popupBox2=$("popupBox2");
const privacyModal=$("privacyModal");
const leadForm=$("leadForm");
const formMessage=$("formMessage");
const submitButton=$("submitButton");

let vrWindow=null;
let savedScrollY=0;

/* 섹션 이동 */
function moveToSection(id){
  mainMenu?.classList.remove("active");
  if(menuToggle){
    menuToggle.textContent="☰";
    menuToggle.setAttribute("aria-expanded","false");
  }

  if(id==="top"){
    window.scrollTo({top:0,behavior:"smooth"});
    return;
  }

  const target=$(id);
  if(!target)return;

  const top=target.getBoundingClientRect().top+
    window.scrollY-(header?.offsetHeight||80);

  window.scrollTo({top,behavior:"smooth"});
}

$$("[data-target]").forEach(el=>{
  el.addEventListener("click",e=>{
    e.preventDefault();
    const id=el.getAttribute("data-target");
    if(id)moveToSection(id);
  });
});

/* 모바일 메뉴 */
menuToggle?.addEventListener("click",e=>{
  e.preventDefault();
  const open=mainMenu.classList.toggle("active");
  menuToggle.textContent=open?"✕":"☰";
  menuToggle.setAttribute("aria-expanded",open);
});

/* 헤더 */
window.addEventListener("scroll",()=>{
  header?.classList.toggle("scrolled",window.scrollY>40);
},{passive:true});

/* VR */
function getVRPopupFeatures(){
  const sw=screen.availWidth||1200;
  const sh=screen.availHeight||800;
  const w=Math.min(1200,Math.max(900,sw-40));
  const h=Math.min(850,Math.max(650,sh-80));
  const left=Math.max(0,(sw-w)/2);
  const top=Math.max(0,(sh-h)/2);

  return [
    `width=${w}`,
    `height=${h}`,
    `left=${left}`,
    `top=${top}`,
    "resizable=yes",
    "scrollbars=yes",
    "toolbar=yes",
    "menubar=no",
    "location=yes",
    "status=no"
  ].join(",");
}

function openVR(url,title){
  if(!url)return;

  if(vrWindow&&!vrWindow.closed){
    try{
      vrWindow.location.href=url;
      vrWindow.focus();
      return;
    }catch(e){
      vrWindow=null;
    }
  }

  vrWindow=window.open(
    url,
    "TheParkVistaVR",
    getVRPopupFeatures()
  );

  if(!vrWindow){
    alert(
      "VR 창이 차단되었습니다.\n\n"+
      "브라우저의 팝업 차단을 해제한 후 다시 눌러주세요."
    );
    return;
  }

  try{
    vrWindow.focus();
    if(title)vrWindow.document.title=title;
  }catch(e){}
}

$$(".unit-vr-link").forEach(button=>{
  button.addEventListener("click",e=>{
    e.preventDefault();
    e.stopPropagation();

    openVR(
      button.getAttribute("data-vr"),
      button.getAttribute("data-vr-title")
    );
  });
});

/* HERO VR */
document.querySelector(".hero-vr-btn")?.addEventListener("click",e=>{
  e.preventDefault();
  moveToSection("unitSection");
});

/* 팝업 */
if(popup){

  const mobile=window.innerWidth<=900;

  popupBox1?.classList.add("active-mobile");
  if(mobile){
    popupBox2?.classList.remove("active-mobile");
  }else{
    popupBox2?.classList.add("active-mobile");
  }

  popup.classList.add("show");

  $$(".popupCloseBtn").forEach(button=>{
    button.addEventListener("click",e=>{
      e.preventDefault();
      e.stopPropagation();
      popup.classList.remove("show");
    });
  });

  popup.addEventListener("click",e=>{
    if(e.target===popup){
      popup.classList.remove("show");
      return;
    }

    if(e.target.closest(".popupCloseBtn"))return;

    if(window.innerWidth>900){
      popup.classList.remove("show");
      return;
    }

    if(popupBox1?.classList.contains("active-mobile")){
      popupBox1.classList.remove("active-mobile");
      popupBox2?.classList.add("active-mobile");
    }else if(popupBox2?.classList.contains("active-mobile")){
      popup.classList.remove("show");
    }
  });
}

/* 개인정보 */
function openPrivacyModal(e){
  e?.preventDefault();
  if(!privacyModal)return;

  savedScrollY=window.scrollY||window.pageYOffset||0;
  privacyModal.classList.add("show");
  document.body.classList.add("modal-open");
}

function closePrivacyModal(){
  if(!privacyModal)return;

  privacyModal.classList.remove("show");
  document.body.classList.remove("modal-open");

  window.scrollTo({
    top:savedScrollY,
    left:0,
    behavior:"auto"
  });
}

$("policyOpen")?.addEventListener("click",openPrivacyModal);
$("policyOpen2")?.addEventListener("click",openPrivacyModal);
$("policyClose")?.addEventListener("click",closePrivacyModal);

privacyModal?.addEventListener("click",e=>{
  if(e.target===privacyModal)closePrivacyModal();
});

document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&privacyModal?.classList.contains("show")){
    closePrivacyModal();
  }
});

/* 날짜 */
const consultDate=$("consultDate");
const dateField=$("dateField");

function getLocalDateString(){
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

if(consultDate)consultDate.min=getLocalDateString();

function openDatePicker(){
  if(!consultDate)return;

  try{
    if(typeof consultDate.showPicker==="function"){
      consultDate.showPicker();
    }else{
      consultDate.focus();
      consultDate.click();
    }
  }catch(e){
    consultDate.focus();
  }
}

dateField?.addEventListener("click",e=>{
  if(e.target!==consultDate)openDatePicker();
});

dateField?.addEventListener("keydown",e=>{
  if(e.key==="Enter"||e.key===" "){
    e.preventDefault();
    openDatePicker();
  }
});

/* 전화번호 */
const phoneInput=$("phone");

phoneInput?.addEventListener("input",function(){
  const v=this.value.replace(/\D/g,"").slice(0,11);

  this.value=v.length<=3?v:
    v.length<=7
      ?`${v.slice(0,3)}-${v.slice(3)}`
      :`${v.slice(0,3)}-${v.slice(3,7)}-${v.slice(7)}`;
});

/* 방문예약 */
leadForm?.addEventListener("submit",async e=>{
  e.preventDefault();

  const nameInput=$("name");
  const consultDateInput=$("consultDate");
  const consultTimeInput=$("consultTime");
  const privacyCheckbox=$("privacy");
  const websiteInput=$("website");

  if(websiteInput?.value)return;

  const fail=(text,el)=>{
    alert(text);
    el?.focus();
  };

  if(!nameInput.value.trim())
    return fail("이름을 입력해주세요.",nameInput);

  const phone=phoneInput.value.replace(/\D/g,"");

  if(!phoneInput.value.trim())
    return fail("휴대폰 번호를 입력해주세요.",phoneInput);

  if(phone.length<10||phone.length>11)
    return fail("휴대폰 번호를 정확하게 입력해주세요.",phoneInput);

  if(!consultDateInput.value)
    return fail("방문 희망일을 선택해주세요.",consultDateInput);

  if(!consultTimeInput.value)
    return fail("방문 희망시간을 선택해주세요.",consultTimeInput);

  if(!privacyCheckbox.checked)
    return fail("개인정보 수집 및 이용에 동의해주세요.",privacyCheckbox);

  submitButton.disabled=true;
  formMessage.textContent="방문예약 접수 및 알림톡 발송 중입니다...";
  formMessage.className="message show";

  try{
    const response=await fetch(
      "/.netlify/functions/send-alimtalk",
      {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          name:nameInput.value.trim(),
          phone:phoneInput.value.trim(),
          consultDate:consultDateInput.value,
          consultTime:consultTimeInput.value
        })
      }
    );

    let result={};
    try{
      result=await response.json();
    }catch(e){}

    if(!response.ok){
      throw new Error(result.error||"서버 전송 실패");
    }

    formMessage.textContent=
      "방문예약이 성공적으로 접수되었습니다. 곧 연락드리겠습니다!";
    formMessage.className="message show success";

    leadForm.reset();
    consultDate.min=getLocalDateString();

  }catch(error){
    console.error("예약 전송 오류:",error);

    formMessage.textContent=
      "예약 접수 중 오류가 발생했습니다. 유선(1551-9708)으로 문의해 주세요.";
    formMessage.className="message show error";

  }finally{
    submitButton.disabled=false;
  }
});

});
</script>