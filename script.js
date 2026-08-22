<script>
"use strict";

document.addEventListener("DOMContentLoaded", function () {

  /* =====================================================
     ELEMENTS
  ===================================================== */
  const header = document.getElementById("header");
  const mainMenu = document.getElementById("mainMenu");
  const menuToggle = document.getElementById("menuToggle");
  const leadForm = document.getElementById("leadForm");
  const formMessage = document.getElementById("formMessage");
  const submitButton = document.getElementById("submitButton");


  /* =====================================================
     SECTION MOVE
  ===================================================== */
  function moveToSection(targetId) {
    if (mainMenu) {
      mainMenu.classList.remove("active");
    }

    if (menuToggle) {
      menuToggle.textContent = "☰";
      menuToggle.setAttribute("aria-expanded", "false");
    }

    if (targetId === "top") {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
      return;
    }

    const target = document.getElementById(targetId);
    if (!target) return;

    const headerHeight = header ? header.offsetHeight : 80;
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth"
    });
  }


  /* =====================================================
     NAVIGATION
  ===================================================== */
  document.querySelectorAll("[data-target]").forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      const targetId = this.getAttribute("data-target");
      if (targetId) {
        moveToSection(targetId);
      }
    });
  });


  /* =====================================================
     MOBILE MENU
  ===================================================== */
  if (menuToggle && mainMenu) {
    menuToggle.addEventListener("click", function (event) {
      event.preventDefault();
      const isOpen = mainMenu.classList.toggle("active");

      menuToggle.textContent = isOpen ? "✕" : "☰";
      menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }


  /* =====================================================
     HEADER SCROLL
  ===================================================== */
  window.addEventListener("scroll", function () {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 40);
  }, {
    passive: true
  });


  /* =====================================================
     VR WINDOW SIZE & OPEN
  ===================================================== */
  let vrWindow = null;

  function getVRPopupFeatures() {
    const screenWidth = window.screen.availWidth || 1200;
    const screenHeight = window.screen.availHeight || 800;

    const popupWidth = Math.min(1200, Math.max(900, screenWidth - 40));
    const popupHeight = Math.min(850, Math.max(650, screenHeight - 80));

    const left = Math.max(0, (screenWidth - popupWidth) / 2);
    const top = Math.max(0, (screenHeight - popupHeight) / 2);

    return [
      "width=" + popupWidth,
      "height=" + popupHeight,
      "left=" + left,
      "top=" + top,
      "resizable=yes",
      "scrollbars=yes",
      "toolbar=yes",
      "menubar=no",
      "location=yes",
      "status=no"
    ].join(",");
  }

  function openVR(url, title) {
    if (!url) return;

    const isMobile = window.matchMedia("(max-width: 900px)").matches;

    if (isMobile) {
      const newTab = window.open(url, "_blank");
      if (!newTab) {
        alert("VR 화면이 차단되었습니다.\n\n브라우저의 팝업 차단을 해제한 후 다시 눌러주세요.");
      }
      return;
    }

    if (vrWindow && !vrWindow.closed) {
      try {
        vrWindow.location.href = url;
        vrWindow.focus();
        return;
      } catch (error) {
        vrWindow = null;
      }
    }

    vrWindow = window.open(url, "TheParkVistaVR", getVRPopupFeatures());

    if (!vrWindow) {
      alert("VR 창이 차단되었습니다.\n\n브라우저의 팝업 차단을 해제한 후 다시 눌러주세요.");
      return;
    }

    try { vrWindow.focus(); } catch (error) {}
    try { if (title && vrWindow.document) vrWindow.document.title = title; } catch (error) {}
  }


  /* =====================================================
     UNIT VR BUTTONS (관람 시작 시 큼직한 안내 메시지 출력)
  ===================================================== */
  document.querySelectorAll(".unit-vr-link").forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      const url = this.getAttribute("data-vr");
      const title = this.getAttribute("data-vr-title");

      if (!url) {
        alert("VR 주소가 설정되지 않았습니다.");
        return;
      }

      openVR(url, title);

      // 🔥 VR 관람 버튼 클릭 시 화면에 큼직하고 직관적으로 뜨는 안내 멘트
      if (formMessage) {
        formMessage.innerHTML = "✨ VR 관람창이 실행되었습니다!<br><span style='font-size: 1.05rem; font-weight: 500; color: #222;'>관람을 마치신 후, 아래에서 편리하게 방문예약을 진행해 보세요.</span>";
        formMessage.className = "message show success";
      }
    });
  });


  /* =====================================================
     DATE PICKER
  ===================================================== */
  const consultDate = document.getElementById("consultDate");
  const dateField = document.querySelector(".date-field");

  function getLocalDateString() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return yyyy + "-" + mm + "-" + dd;
  }

  if (consultDate) {
    consultDate.min = getLocalDateString();
  }

  function openDatePicker() {
    if (!consultDate) return;
    try {
      if (typeof consultDate.showPicker === "function") {
        consultDate.showPicker();
      } else {
        consultDate.focus();
        consultDate.click();
      }
    } catch (error) {
      consultDate.focus();
    }
  }

  if (dateField) {
    dateField.addEventListener("click", function (event) {
      if (event.target === consultDate) return;
      openDatePicker();
    });
  }


  /* =====================================================
     PHONE AUTO FORMAT
  ===================================================== */
  const phoneInput = document.getElementById("phone");

  if (phoneInput) {
    phoneInput.addEventListener("input", function () {
      let value = this.value.replace(/\D/g, "");

      if (value.length <= 3) {
        this.value = value;
      } else if (value.length <= 7) {
        this.value = value.slice(0, 3) + "-" + value.slice(3);
      } else {
        this.value = value.slice(0, 3) + "-" + value.slice(3, 7) + "-" + value.slice(7, 11);
      }
    });
  }


  /* =====================================================
     RESERVATION SUBMIT (예약 성공/실패 시 대형 폰트 메시지 출력)
  ===================================================== */
  if (leadForm) {
    leadForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const nameInput = document.getElementById("name");
      const consultDateInput = document.getElementById("consultDate");
      const consultTimeInput = document.getElementById("consultTime");
      const privacyCheckbox = document.getElementById("privacy");
      const websiteInput = document.getElementById("website");

      if (websiteInput && websiteInput.value) {
        return;
      }

      if (!nameInput.value.trim()) {
        alert("이름을 입력해주세요.");
        nameInput.focus();
        return;
      }

      if (!phoneInput || !phoneInput.value.trim()) {
        alert("휴대폰 번호를 입력해주세요.");
        if (phoneInput) phoneInput.focus();
        return;
      }

      const cleanPhone = phoneInput.value.replace(/\D/g, "");
      if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        alert("휴대폰 번호를 정확하게 입력해주세요.");
        phoneInput.focus();
        return;
      }

      if (!consultDateInput.value) {
        alert("방문 희망일을 선택해주세요.");
        consultDateInput.focus();
        return;
      }

      if (!consultTimeInput.value) {
        alert("방문 희망시간을 선택해주세요.");
        consultTimeInput.focus();
        return;
      }

      if (!privacyCheckbox.checked) {
        alert("개인정보 수집 및 이용에 동의해주세요.");
        privacyCheckbox.focus();
        return;
      }

      submitButton.disabled = true;
      formMessage.innerHTML = "⏳ 방문예약 접수 및 알림톡 발송 중입니다...";
      formMessage.className = "message show";

      try {
        const response = await fetch("/.netlify/functions/send-alimtalk", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: nameInput.value.trim(),
            phone: phoneInput.value.trim(),
            consultDate: consultDateInput.value,
            consultTime: consultTimeInput.value
          })
        });

        let result = {};
        try {
          result = await response.json();
        } catch (jsonError) {
          result = {};
        }

        if (response.ok) {
          // 🔥 예약 성공 시 대형 폰트와 직관적인 완료 문구
          formMessage.innerHTML = "🎉 방문예약이 성공적으로 접수되었습니다!<br><span style='font-size: 1.05rem; font-weight: 500;'>빠른 시일 내에 안내 연락을 드리겠습니다.</span>";
          formMessage.className = "message show success";
          leadForm.reset();

          if (consultDate) {
            consultDate.min = getLocalDateString();
          }
        } else {
          throw new Error(result.error || "서버 전송 실패");
        }

      } catch (error) {
        console.error("예약 전송 오류:", error);
        formMessage.innerHTML = "❌ 예약 접수 중 오류가 발생했습니다.<br><span style='font-size: 1.05rem; font-weight: 500;'>유선(1551-9708)으로 문의해 주세요.</span>";
        formMessage.className = "message show error";
      } finally {
        submitButton.disabled = false;
      }
    });
  }

});
</script>