"use strict";
document.addEventListener("DOMContentLoaded",()=>{
  const $=selector=>document.querySelector(selector);
  const $$=selector=>document.querySelectorAll(selector);
  const header=$("#header");
  const heroScrollGuide=$("#heroScrollGuide");
  const menu=$("#mainMenu");
  const toggle=$("#menuToggle");
  const modal=$("#privacyModal");
  const form=$("#leadForm");
  const submit=$("#submitButton");
  const imageZoomModal=$("#imageZoomModal");
  const imageZoomStage=$("#imageZoomStage");
  const imageZoomTarget=$("#imageZoomTarget");
  const imageZoomClose=$("#imageZoomClose");
  const date=$("#consultDate");
  const dateField=$("#dateField");
  const time=$("#consultTime");
  const scheduleUndecided=$("#scheduleUndecided");
  const phone=$("#phone");
  const visitModal=$("#visitModal");
  const visitModalBody=$("#visitModalBody");
  const infoModal=$("#infoModal");
  const infoForm=$("#infoForm");
  const infoPhone=$("#infoPhone");
  const infoPrivacy=$("#infoPrivacy");
  const infoSubmit=$("#infoSubmitButton");
  const infoCompleteModal=$("#infoCompleteModal");
  const infoCompletePhone=$("#infoCompletePhone");
  const infoCompleteCloseBtn=$("#infoCompleteCloseBtn");
  const contactSection=$("#contactSection");
  const saveReminder=$("#saveReminder");
  const alertModal=$("#alertModal");
  const alertIcon=$("#alertIcon");
  const alertTitle=document.querySelector(".alert-title");
  const alertDesc=$("#alertDesc");
  const alertCloseBtn=$("#alertCloseBtn");
  const vrGuideModal=$("#vrGuideModal");
  const vrGuideTitleText=$("#vrGuideTitleText");
  const vrGuideClose=$("#vrGuideClose");
  const vrGuideCancel=$("#vrGuideCancel");
  const vrGuideConfirm=$("#vrGuideConfirm");
  let savedScroll=0;
  let pendingVrUrl="";
  let pendingVrTitle="";
  let infoIsSubmitting=false;
  let saveReminderTimer=0;
  let saveReminderVisibleAt=0;
  let saveReminderHandled=false;
  const safeGtag=(eventName,params={})=>{
    if(typeof window.gtag!=="function")return;
    window.gtag(
      "event",
      eventName,
      {
        ...params,
        transport_type:"beacon"
      }
    );
  };
  const getTrafficAttribution=()=>{
    const params=
      new URLSearchParams(
        window.location.search
      );
    const keys=[
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "n_campaign",
      "n_ad_group",
      "n_ad"
    ];
    const current={};
    keys.forEach(key=>{
      const value=params.get(key);
      if(value)current[key]=value;
    });
    if(Object.keys(current).length){
      try{
        sessionStorage.setItem(
          "landing_attribution",
          JSON.stringify(current)
        );
      }catch(e){}
    }
    try{
      return JSON.parse(
        sessionStorage.getItem(
          "landing_attribution"
        )||"{}"
      );
    }catch(e){
      return current;
    }
  };
  const attribution=
    getTrafficAttribution();
  const withAttribution=params=>({
    ...params,
    ...attribution
  });
  const lockBody=()=>{
    document.body.classList.add("modal-open");
  };
  const unlockBody=()=>{
    document.body.classList.remove("modal-open");
  };
  const hideSaveReminder=()=>{
    if(!saveReminder)return;
    window.clearTimeout(saveReminderTimer);
    saveReminder.classList.remove("show");
  };
  const showSaveReminder=()=>{
    if(!saveReminder || saveReminderHandled || document.querySelector(".action-modal.show"))return;
    try{
      if(sessionStorage.getItem("thepark_save_reminder_seen"))return;
      sessionStorage.setItem("thepark_save_reminder_seen","1");
    }catch(e){}
    saveReminderVisibleAt=Date.now();
    saveReminder.classList.add("show");
    saveReminderTimer=window.setTimeout(hideSaveReminder,3000);
  };
  if(form && visitModalBody){
    visitModalBody.appendChild(form);
  }
  const openActionModal=id=>{
    const target=$("#"+id);
    if(!target)return;
    target.classList.add("show");
    lockBody();
    window.setTimeout(()=>{
      target.querySelector("input:not([type='hidden']), button")?.focus();
    },30);
  };
  const closeActionModal=target=>{
    if(!target)return;
    target.classList.remove("show");
    const hint=target.querySelector(".action-modal-close-hint");
    if(hint)hint.style.display="none";
    if(!document.querySelector(".action-modal.show"))unlockBody();
  };
  $$('[data-open-modal]').forEach(button=>{
    button.addEventListener("click",()=>{
      const modalId=button.dataset.openModal;
      const linkLocation=button.className||"modal_cta";
      if(modalId==="visitModal"){
        safeGtag(
          "click_visit",
          withAttribution({
            link_location:linkLocation,
            action_type:"open_modal"
          })
        );
      }
      if(modalId==="infoModal"){
        saveReminderHandled=true;
        hideSaveReminder();
        safeGtag(
          "open_info_modal",
          withAttribution({
            link_location:linkLocation
          })
        );
      }
      openActionModal(modalId);
    });
  });
  if(contactSection && "IntersectionObserver" in window){
    const saveReminderObserver=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)){
        showSaveReminder();
        saveReminderObserver.disconnect();
      }
    },{threshold:.08});
    saveReminderObserver.observe(contactSection);
  }
  const dismissSaveReminder=()=>{
    if(Date.now()-saveReminderVisibleAt<500)return;
    hideSaveReminder();
  };
  document.addEventListener("wheel",dismissSaveReminder,{passive:true});
  document.addEventListener("touchstart",dismissSaveReminder,{passive:true});
  $$('.action-modal').forEach(actionModal=>{
    actionModal.querySelectorAll('[data-close-modal]').forEach(button=>{
      button.addEventListener("click",()=>closeActionModal(actionModal));
    });
    const closeHint=document.createElement("div");
    closeHint.className="action-modal-close-hint";
    closeHint.textContent="닫기 버튼을 누르시면 닫힙니다";
    actionModal.appendChild(closeHint);
    if(window.matchMedia("(hover: hover) and (pointer: fine)").matches){
      actionModal.addEventListener("pointermove",event=>{
        if(event.target!==actionModal){
          closeHint.style.display="none";
          return;
        }
        closeHint.style.left=`${event.clientX}px`;
        closeHint.style.top=`${event.clientY}px`;
        closeHint.style.display="block";
      });
      actionModal.addEventListener("pointerleave",()=>{
        closeHint.style.display="none";
      });
    }
  });
  const closeImageZoom=()=>{
    if(!imageZoomModal?.classList.contains("show"))return;
    imageZoomModal.classList.remove("show");
    imageZoomTarget.removeAttribute("src");
    imageZoomTarget.alt="";
    unlockBody();
  };
  $$('.full-image img').forEach(image=>{
    if(image.closest("button, a") || image.hasAttribute("data-no-zoom"))return;
    image.addEventListener("click",()=>{
      if(!window.matchMedia("(max-width: 900px)").matches)return;
      imageZoomTarget.src=image.currentSrc||image.src;
      imageZoomTarget.alt=image.alt||"확대 이미지";
      imageZoomModal.classList.add("show");
      lockBody();
      imageZoomTarget.onload=()=>{
        imageZoomStage.scrollTop=0;
        imageZoomStage.scrollLeft=Math.max(0,(imageZoomStage.scrollWidth-imageZoomStage.clientWidth)/2);
      };
      imageZoomClose.focus();
    });
  });
  imageZoomClose?.addEventListener("click",closeImageZoom);
  document.addEventListener("keydown",event=>{
    if(event.key!=="Escape")return;
    closeImageZoom();
    document.querySelectorAll(".action-modal.show").forEach(closeActionModal);
  });
  const formatMobile=value=>{
    const digits=value.replace(/\D/g,"").slice(0,11);
    if(digits.length<4)return digits;
    if(digits.length<8)return digits.replace(/(\d{3})(\d+)/,"$1-$2");
    return digits.replace(/(\d{3})(\d{3,4})(\d{4})/,"$1-$2-$3");
  };
  infoPhone?.addEventListener("input",()=>{
    infoPhone.value=formatMobile(infoPhone.value);
    if(phone && !phone.value)phone.value=infoPhone.value;
  });
  infoForm?.addEventListener("submit",async event=>{
    event.preventDefault();
    if(infoIsSubmitting)return;
    const normalized=(infoPhone?.value||"").replace(/\D/g,"");
    if(!/^01[016789]\d{7,8}$/.test(normalized)){
      showAlert("입력 확인","휴대폰 번호를 정확히 입력해주세요.");
      infoPhone?.focus();
      return;
    }
    if(!infoPrivacy?.checked){
      showAlert("동의 확인","개인정보 수집 및 이용에 동의해주세요.");
      infoPrivacy?.focus();
      return;
    }
    infoIsSubmitting=true;
    infoSubmit.disabled=true;
    infoSubmit.innerHTML='<span class="kakao-talk-icon" aria-hidden="true"></span><span>카톡에 담는 중...</span>';
    try{
      const response=await fetch("/.netlify/functions/send-site-info",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          phone:infoPhone.value.trim()
        })
      });
      const result=await response.json().catch(()=>({}));
      if(!response.ok || result.success!==true)throw new Error(result.error||"전송 실패");
      safeGtag("generate_lead",withAttribution({lead_type:"site_info_alimtalk",form_id:"infoForm"}));
      closeActionModal(infoModal);
      infoForm.reset();
      if(infoCompletePhone){
        infoCompletePhone.textContent=`${normalized.slice(0,3)}-****-${normalized.slice(-4)}`;
      }
      infoCompleteModal?.classList.add("show");
      lockBody();
      requestAnimationFrame(()=>infoCompleteCloseBtn?.focus());
    }catch(error){
      console.error("홈페이지 링크 전송 오류:",error);
      showAlert("전송 실패","카톡에 담지 못했습니다.<br>잠시 후 다시 시도하거나 1551-9708로 문의해 주세요.");
    }finally{
      infoIsSubmitting=false;
      infoSubmit.disabled=false;
      infoSubmit.innerHTML='<span class="kakao-talk-icon" aria-hidden="true"></span><span>카톡으로 링크 받기</span>';
    }
  });
  const move=id=>{
    menu?.classList.remove("active");
    if(toggle){
      toggle.textContent="☰";
      toggle.setAttribute(
        "aria-expanded",
        "false"
      );
    }
    if(id==="top"){
      window.scrollTo({
        top:0,
        behavior:"smooth"
      });
      return;
    }
    const target=$("#"+id);
    if(!target)return;
    const headerHeight=(header?.offsetHeight||80);
    const isMobile=window.matchMedia("(max-width:900px)").matches;
    const offset=(id==="contactSection" && isMobile)
      ? Math.max(48,headerHeight-16)
      : headerHeight-10;
    const top=
      target.getBoundingClientRect().top+
      window.scrollY-
      offset;
    window.scrollTo({
      top,
      behavior:"smooth"
    });
  };
  document.addEventListener(
    "click",
    e=>{
      const tel=
        e.target.closest(
          'a[href^="tel:"]'
        );
      if(tel){
        safeGtag(
          "click_tel",
          withAttribution({
            link_location:
              tel.className||"tel_link"
          })
        );
        return;
      }
      const visit=
        e.target.closest(
          '[data-target="contactSection"]'
        );
      if(visit){
        safeGtag(
          "click_visit",
          withAttribution({
            link_location:
              visit.className||"visit_cta"
          })
        );
      }
    },
    true
  );
  if(form){
    let formStarted=false;
    const trackFormStart=e=>{
      if(formStarted)return;
      if(e.target?.id==="website")return;
      formStarted=true;
      safeGtag(
        "form_start",
        withAttribution({
          form_id:"leadForm",
          form_name:"visit_reservation"
        })
      );
    };
    form.addEventListener(
      "input",
      trackFormStart,
      {passive:true}
    );
    form.addEventListener(
      "change",
      trackFormStart,
      {passive:true}
    );
  }
  $$("[data-target]").forEach(el=>{
    el.addEventListener("click",e=>{
      e.preventDefault();
      move(el.dataset.target);
    });
  });
  toggle?.addEventListener("click",()=>{
    const open=
      menu.classList.toggle("active");
    toggle.textContent=
      open?"✕":"☰";
    toggle.setAttribute(
      "aria-expanded",
      String(open)
    );
  });
  let scrollTick=false;
  window.addEventListener(
    "scroll",
    ()=>{
      if(scrollTick)return;
      scrollTick=true;
      requestAnimationFrame(()=>{
        header?.classList.toggle(
          "scrolled",
          window.scrollY>40
        );
        heroScrollGuide?.classList.toggle(
          "is-hidden",
          window.scrollY>24
        );
        scrollTick=false;
      });
    },
    {passive:true}
  );
  const showAlert=(title,text)=>{
    if(alertIcon){
      alertIcon.textContent=title.includes("완료")?"🎉":title.includes("실패")||title.includes("오류")?"⚠️":"ℹ️";
    }
    if(alertTitle){
      alertTitle.textContent=title;
    }
    if(alertDesc){
      alertDesc.innerHTML=text;
    }
    alertModal?.classList.add("show");
    lockBody();
    requestAnimationFrame(()=>alertCloseBtn?.focus());
  };
  const closeAlert=()=>{
    alertModal?.classList.remove("show");
    unlockBody();
  };
  alertCloseBtn?.addEventListener(
    "click",
    closeAlert
  );
  alertModal?.addEventListener(
    "click",
    e=>{
      if(e.target===alertModal){
        closeAlert();
      }
    }
  );
  const closeInfoComplete=()=>{
    infoCompleteModal?.classList.remove("show");
    unlockBody();
  };
  infoCompleteCloseBtn?.addEventListener("click",closeInfoComplete);
  infoCompleteModal?.addEventListener("click",e=>{
    if(e.target===infoCompleteModal)closeInfoComplete();
  });
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape" && infoCompleteModal?.classList.contains("show")){
      closeInfoComplete();
    }
  });
  const requestVR=(url,title)=>{
    if(!url)return;
    pendingVrUrl=url;
    pendingVrTitle=title||"360_vr";
    if(vrGuideTitleText){
      vrGuideTitleText.textContent=
        title||"360° VR 안내";
    }
    vrGuideModal?.classList.add("show");
    lockBody();
  };
  const closeVrGuide=()=>{
    vrGuideModal?.classList.remove("show");
    unlockBody();
    pendingVrUrl="";
    pendingVrTitle="";
  };
  const launchVR=()=>{
    if(!pendingVrUrl)return;
    safeGtag(
      "launch_vr",
      withAttribution({
        vr_title:pendingVrTitle||"360_vr"
      })
    );
    let url=pendingVrUrl;
    try{
      const u=new URL(url);
      u.searchParams.set(
        "from",
        "main"
      );
      url=u.href;
    }catch(error){
      console.warn(
        "VR URL 처리 오류:",
        error
      );
    }
    const mobile=
      window.innerWidth<=900||
      /Android|iPhone|iPad|iPod/i.test(
        navigator.userAgent
      );
    let win=null;
    try{
      win=mobile
        ?window.open(
            url,
            "_blank",
            "noopener,noreferrer"
          )
        :window.open(
            url,
            "theparkVistaVR",
            "width=1200,height=850,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=yes,status=no"
          );
    }catch(error){
      console.error(
        "VR 실행 오류:",
        error
      );
    }
    if(win){
      try{
        win.focus();
      }catch{}
    }else{
      try{
        window.location.href=url;
      }catch{}
    }
    closeVrGuide();
  };
  vrGuideClose?.addEventListener(
    "click",
    closeVrGuide
  );
  vrGuideCancel?.addEventListener(
    "click",
    closeVrGuide
  );
  vrGuideConfirm?.addEventListener(
    "click",
    launchVR
  );
  vrGuideModal?.addEventListener(
    "click",
    e=>{
      if(e.target===vrGuideModal){
        closeVrGuide();
      }
    }
  );
  $$(".unit-vr-link").forEach(btn=>{
    btn.addEventListener(
      "click",
      ()=>{
        safeGtag(
          "click_vr",
          withAttribution({
            vr_title:
              btn.dataset.vrTitle||
              "360_vr"
          })
        );
        requestVR(
          btn.dataset.vr,
          btn.dataset.vrTitle
        );
      }
    );
  });
  const openModal=e=>{
    e?.preventDefault();
    if(!modal)return;
    savedScroll=window.scrollY;
    modal.classList.add("show");
    lockBody();
  };
  const closeModal=()=>{
    modal?.classList.remove("show");
    unlockBody();
    window.scrollTo(
      0,
      savedScroll
    );
  };
  $("#policyOpen")?.addEventListener(
    "click",
    openModal
  );
  $("#policyOpen2")?.addEventListener(
    "click",
    openModal
  );
  $("#policyClose")?.addEventListener(
    "click",
    closeModal
  );
  modal?.addEventListener(
    "click",
    e=>{
      if(e.target===modal){
        closeModal();
      }
    }
  );
  document.addEventListener(
    "keydown",
    e=>{
      if(e.key!=="Escape")return;
      if(
        modal?.classList.contains(
          "show"
        )
      ){
        closeModal();
      }
      if(
        vrGuideModal?.classList.contains(
          "show"
        )
      ){
        closeVrGuide();
      }
      if(
        alertModal?.classList.contains(
          "show"
        )
      ){
        closeAlert();
      }
    }
  );
  const today=()=>{
    const d=new Date();
    return [
      d.getFullYear(),
      String(
        d.getMonth()+1
      ).padStart(2,"0"),
      String(
        d.getDate()
      ).padStart(2,"0")
    ].join("-");
  };
  if(date){
    date.min=today();
  }
  const showDate=()=>{
    if(!date || date.disabled)return;
    try{
      if(
        typeof date.showPicker==="function"
      ){
        date.showPicker();
      }else{
        date.focus();
        date.click();
      }
    }catch{
      date.focus();
    }
  };
  dateField?.addEventListener(
    "click",
    showDate
  );
  const syncScheduleChoice=()=>{
    const undecided=Boolean(scheduleUndecided?.checked);
    if(date){
      date.disabled=undecided;
      if(undecided)date.value="";
    }
    if(time){
      time.disabled=undecided;
      if(undecided)time.value="";
    }
    dateField?.classList.toggle("schedule-disabled",undecided);
    dateField?.setAttribute("aria-disabled",String(undecided));
  };
  scheduleUndecided?.addEventListener("change",syncScheduleChoice);
  syncScheduleChoice();
  dateField?.addEventListener(
    "keydown",
    e=>{
      if(
        e.key==="Enter"||
        e.key===" "
      ){
        e.preventDefault();
        showDate();
      }
    }
  );
  phone?.addEventListener(
    "input",
    ()=>{
      const v=
        phone.value
          .replace(/\D/g,"")
          .slice(0,11);
      if(v.length<=3){
        phone.value=v;
      }else if(v.length<=7){
        phone.value=
          `${v.slice(0,3)}-${v.slice(3)}`;
      }else{
        phone.value=
          `${v.slice(0,3)}-${v.slice(3,7)}-${v.slice(7)}`;
      }
    }
  );
  form?.addEventListener(
    "submit",
    async e=>{
      e.preventDefault();
      if(submit?.disabled)return;
      const name=$("#name");
      const privacy=$("#privacy");
      const honeypot=$("#website");
      if(honeypot?.value){
        return;
      }
      const fail=(text,el)=>{
        showAlert(
          "입력 확인",
          text
        );
        setTimeout(
          ()=>{
            el?.focus();
          },
          100
        );
      };
      const nameValue=
        name?.value.trim()||"";
      if(!nameValue){
        return fail(
          "이름을 입력해주세요.",
          name
        );
      }
      if(nameValue.length>50){
        return fail(
          "이름은 50자 이내로 입력해주세요.",
          name
        );
      }
      const phoneNumber=
        phone?.value
          .replace(/\D/g,"")||"";
      if(
        !/^01[0-9]\d{7,8}$/.test(
          phoneNumber
        )
      ){
        return fail(
          "휴대폰 번호를 정확하게 입력해주세요.",
          phone
        );
      }
      const scheduleIsUndecided=Boolean(scheduleUndecided?.checked);
      if(!scheduleIsUndecided && !date?.value){
        return fail(
          "방문 희망일을 선택하거나 상담 후 결정을 선택해주세요.",
          date
        );
      }
      if(!scheduleIsUndecided && date.value<today()){
        return fail(
          "오늘 이후의 방문 희망일을 선택해주세요.",
          date
        );
      }
      if(!scheduleIsUndecided && !time?.value){
        return fail(
          "방문 희망시간을 선택하거나 상담 후 결정을 선택해주세요.",
          time
        );
      }
      if(!privacy?.checked){
        return fail(
          "개인정보 수집 및 이용에 동의해주세요.",
          privacy
        );
      }
      submit.disabled=true;
      submit.textContent=
        "접수 중...";
      try{
        const res=
          await fetch(
            "/.netlify/functions/send-alimtalk",
            {
              method:"POST",
              headers:{
                "Content-Type":
                  "application/json"
              },
              body:JSON.stringify({
                name:nameValue,
                phone:
                  phone.value.trim(),
                consultDate:
                  scheduleIsUndecided
                    ?"상담 후 결정"
                    :date.value,
                consultTime:
                  scheduleIsUndecided
                    ?"상담 후 결정"
                    :time.value
              })
            }
          );
        let result={};
        try{
          result=
            await res.json();
        }catch{
          result={};
        }
        if(!res.ok || result.success !== true){
          throw new Error(
            result.error||
            "서버 전송 실패"
          );
        }
        safeGtag(
          "generate_lead",
          withAttribution({
            lead_type:"visit_reservation",
            form_id:"leadForm"
          })
        );
        closeActionModal(visitModal);
        showAlert(
          "방문예약 완료",
          "방문예약이 성공적으로 접수되었습니다.<br>빠른 시일 내로 안내해 드리겠습니다."
        );
        form.reset();
        date.min=today();
        syncScheduleChoice();
      }catch(error){
        console.error(
          "예약 전송 오류:",
          error
        );
        showAlert(
          "접수 실패",
          "예약 접수 중 오류가 발생했습니다.<br>유선(1551-9708)으로 문의해 주세요."
        );
      }finally{
        submit.disabled=false;
        submit.textContent=
          "방문예약 신청하기";
      }
    }
  );
});
