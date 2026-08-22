"use strict";

document.addEventListener("DOMContentLoaded", function () {

  /* =========================================
     ELEMENTS
  ========================================= */

  const header = document.getElementById("header");
  const mainMenu = document.getElementById("mainMenu");
  const menuToggle = document.getElementById("menuToggle");

  const popup = document.getElementById("popup01");
  const popupBox1 = document.getElementById("popupBox1");
  const popupBox2 = document.getElementById("popupBox2");

  const privacyModal = document.getElementById("privacyModal");
  const policyOpen = document.getElementById("policyOpen");
  const policyOpen2 = document.getElementById("policyOpen2");
  const policyClose = document.getElementById("policyClose");

  const vrModal = document.getElementById("vrModal");
  const vrIframe = document.getElementById("vrIframe");
  const vrClose = document.getElementById("vrClose");

  const leadForm = document.getElementById("leadForm");
  const formMessage = document.getElementById("formMessage");
  const submitButton = document.getElementById("submitButton");

  const nameInput = document.getElementById("name");
  const phoneInput = document.getElementById("phone");
  const consultDateInput = document.getElementById("consultDate");
  const consultTimeInput = document.getElementById("consultTime");
  const privacyCheckbox = document.getElementById("privacy");
  const websiteInput = document.getElementById("website");


  /* =========================================
     MODAL BODY LOCK
  ========================================= */

  function updateBodyLock() {

    const isOpen =
      (popup && popup.classList.contains("show")) ||
      (privacyModal && privacyModal.classList.contains("show")) ||
      (vrModal && vrModal.classList.contains("show"));

    document.body.classList.toggle(
      "modal-open",
      Boolean(isOpen)
    );

  }


  /* =========================================
     SECTION SCROLL
  ========================================= */

  function moveToSection(targetId) {

    if (mainMenu) {
      mainMenu.classList.remove("active");
    }

    if (menuToggle) {
      menuToggle.textContent = "☰";
      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );
    }


    if (targetId === "top") {

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

      return;
    }


    const target =
      document.getElementById(targetId);

    if (!target) {
      return;
    }


    function scrollTarget() {

      const headerHeight =
        header
          ? header.offsetHeight
          : 80;

      const targetPosition =
        target.getBoundingClientRect().top +
        window.pageYOffset -
        headerHeight +
        15;


      window.scrollTo({
        top: targetPosition,
        behavior: "smooth"
      });

    }


    scrollTarget();

    /*
      이미지 lazy-loading이나
      모바일 레이아웃 변경으로 위치가
      변하는 경우를 대비해서 재계산
    */

    setTimeout(scrollTarget, 400);
    setTimeout(scrollTarget, 900);

  }


  /* =========================================
     DATA-TARGET BUTTONS
  ========================================= */

  document
    .querySelectorAll("[data-target]")
    .forEach(function (button) {

      button.addEventListener(
        "click",
        function (event) {

          event.preventDefault();

          const targetId =
            this.getAttribute("data-target");

          if (targetId) {
            moveToSection(targetId);
          }

        }
      );

    });


  /* =========================================
     MOBILE MENU
  ========================================= */

  if (menuToggle && mainMenu) {

    menuToggle.addEventListener(
      "click",
      function (event) {

        event.preventDefault();

        const isOpen =
          mainMenu.classList.toggle("active");


        menuToggle.textContent =
          isOpen ? "✕" : "☰";


        menuToggle.setAttribute(
          "aria-expanded",
          isOpen ? "true" : "false"
        );

      }
    );

  }


  /* =========================================
     HEADER SCROLL EFFECT
  ========================================= */

  window.addEventListener(
    "scroll",
    function () {

      if (!header) {
        return;
      }

      header.classList.toggle(
        "scrolled",
        window.scrollY > 40
      );

    },
    {
      passive: true
    }
  );


  /* =========================================
     POPUP
  ========================================= */

  if (popup) {

    const isMobile =
      window.innerWidth <= 900;


    if (isMobile) {

      if (popupBox1) {
        popupBox1.classList.add(
          "active-mobile"
        );
      }

      if (popupBox2) {
        popupBox2.classList.remove(
          "active-mobile"
        );
      }

    } else {

      if (popupBox1) {
        popupBox1.classList.add(
          "active-mobile"
        );
      }

      if (popupBox2) {
        popupBox2.classList.add(
          "active-mobile"
        );
      }

    }


    popup.classList.add("show");

    updateBodyLock();


    popup.addEventListener(
      "click",
      function (event) {

        /*
          닫기 버튼을 눌렀을 때도
          기존 팝업 로직이 실행되도록 유지
        */

        const isMobileNow =
          window.innerWidth <= 900;


        if (isMobileNow) {

          if (
            popupBox1 &&
            popupBox1.classList.contains(
              "active-mobile"
            )
          ) {

            popupBox1.classList.remove(
              "active-mobile"
            );


            if (popupBox2) {

              popupBox2.classList.add(
                "active-mobile"
              );

            }

            return;
          }


          if (
            popupBox2 &&
            popupBox2.classList.contains(
              "active-mobile"
            )
          ) {

            popup.classList.remove(
              "show"
            );

            updateBodyLock();

            return;
          }

        }


        popup.classList.remove(
          "show"
        );

        updateBodyLock();

      }
    );

  }


  /* =========================================
     PRIVACY MODAL
  ========================================= */

  function openPrivacyModal(event) {

    if (event) {
      event.preventDefault();
    }


    if (!privacyModal) {
      return;
    }


    privacyModal.classList.add(
      "show"
    );

    updateBodyLock();

  }


  function closePrivacyModal() {

    if (!privacyModal) {
      return;
    }


    privacyModal.classList.remove(
      "show"
    );

    updateBodyLock();

  }


  if (policyOpen) {

    policyOpen.addEventListener(
      "click",
      openPrivacyModal
    );

  }


  if (policyOpen2) {

    policyOpen2.addEventListener(
      "click",
      openPrivacyModal
    );

  }


  if (policyClose) {

    policyClose.addEventListener(
      "click",
      closePrivacyModal
    );

  }


  if (privacyModal) {

    privacyModal.addEventListener(
      "click",
      function (event) {

        if (
          event.target === privacyModal
        ) {

          closePrivacyModal();

        }

      }
    );

  }


  /* =========================================
     VR MODAL
  ========================================= */

  let scrollPosition = 0;


  document
    .querySelectorAll(".unit-vr-link")
    .forEach(function (link) {

      link.addEventListener(
        "click",
        function (event) {

          event.preventDefault();


          scrollPosition =
            window.pageYOffset ||
            document.documentElement.scrollTop ||
            0;


          const vrUrl =
            this.getAttribute(
              "data-vr-url"
            );


          if (
            !vrUrl ||
            !vrModal ||
            !vrIframe
          ) {
            return;
          }


          vrIframe.src = vrUrl;

          vrModal.classList.add(
            "show"
          );

          updateBodyLock();

        }
      );

    });


  function closeVrModal() {

    if (vrModal) {
      vrModal.classList.remove(
        "show"
      );
    }


    if (vrIframe) {
      vrIframe.src = "";
    }


    updateBodyLock();


    window.scrollTo({
      top: scrollPosition,
      behavior: "auto"
    });

  }


  if (vrClose) {

    vrClose.addEventListener(
      "click",
      closeVrModal
    );

  }


  if (vrModal) {

    vrModal.addEventListener(
      "click",
      function (event) {

        if (
          event.target === vrModal
        ) {

          closeVrModal();

        }

      }
    );

  }


  /* =========================================
     ESC KEY
  ========================================= */

  document.addEventListener(
    "keydown",
    function (event) {

      if (event.key !== "Escape") {
        return;
      }


      if (
        vrModal &&
        vrModal.classList.contains("show")
      ) {

        closeVrModal();

        return;

      }


      if (
        privacyModal &&
        privacyModal.classList.contains("show")
      ) {

        closePrivacyModal();

        return;

      }


      if (
        popup &&
        popup.classList.contains("show")
      ) {

        popup.classList.remove(
          "show"
        );

        updateBodyLock();

      }

    }
  );


  /* =========================================
     PHONE AUTO FORMAT
  ========================================= */

  if (phoneInput) {

    phoneInput.addEventListener(
      "input",
      function () {

        let value =
          this.value.replace(
            /\D/g,
            ""
          );


        /*
          대한민국 휴대폰 최대 11자리
        */

        value =
          value.substring(0, 11);


        if (value.length <= 3) {

          this.value = value;

        } else if (value.length <= 7) {

          this.value =
            value.substring(0, 3) +
            "-" +
            value.substring(3);

        } else {

          this.value =
            value.substring(0, 3) +
            "-" +
            value.substring(3, 7) +
            "-" +
            value.substring(7, 11);

        }

      }
    );

  }


  /* =========================================
     DATE MINIMUM = TODAY
  ========================================= */

  if (consultDateInput) {

    const today =
      new Date();


    const yyyy =
      today.getFullYear();


    const mm =
      String(
        today.getMonth() + 1
      ).padStart(2, "0");


    const dd =
      String(
        today.getDate()
      ).padStart(2, "0");


    consultDateInput.min =
      `${yyyy}-${mm}-${dd}`;

  }


  /* =========================================
     RESERVATION FORM
  ========================================= */

  if (leadForm) {

    leadForm.addEventListener(
      "submit",
      async function (event) {

        event.preventDefault();


        /* ---------------------------------
           ELEMENT CHECK
        --------------------------------- */

        if (
          !nameInput ||
          !phoneInput ||
          !consultDateInput ||
          !consultTimeInput ||
          !privacyCheckbox ||
          !submitButton ||
          !formMessage
        ) {

          console.error(
            "예약 폼 필수 요소를 찾을 수 없습니다."
          );

          return;

        }


        /* ---------------------------------
           HONEYPOT
        --------------------------------- */

        if (
          websiteInput &&
          websiteInput.value.trim()
        ) {

          return;

        }


        /* ---------------------------------
           NAME
        --------------------------------- */

        const name =
          nameInput.value.trim();


        if (!name) {

          alert(
            "이름을 입력해주세요."
          );

          nameInput.focus();

          return;

        }


        if (name.length > 50) {

          alert(
            "이름은 50자 이내로 입력해주세요."
          );

          nameInput.focus();

          return;

        }


        /* ---------------------------------
           PHONE
        --------------------------------- */

        const phone =
          phoneInput.value.replace(
            /\D/g,
            ""
          );


        if (!phone) {

          alert(
            "휴대폰 번호를 입력해주세요."
          );

          phoneInput.focus();

          return;

        }


        if (
          !/^01[016789]\d{7,8}$/.test(
            phone
          )
        ) {

          alert(
            "휴대폰 번호를 정확하게 입력해주세요."
          );

          phoneInput.focus();

          return;

        }


        /* ---------------------------------
           DATE
        --------------------------------- */

        const consultDate =
          consultDateInput.value;


        if (!consultDate) {

          alert(
            "방문 희망일을 선택해주세요."
          );

          consultDateInput.focus();

          return;

        }


        /* ---------------------------------
           TIME
        --------------------------------- */

        const consultTime =
          consultTimeInput.value;


        if (!consultTime) {

          alert(
            "방문 희망시간을 선택해주세요."
          );

          consultTimeInput.focus();

          return;

        }


        /* ---------------------------------
           PRIVACY
        --------------------------------- */

        if (!privacyCheckbox.checked) {

          alert(
            "개인정보 수집 및 이용에 동의해주세요."
          );

          privacyCheckbox.focus();

          return;

        }


        /* ---------------------------------
           BUTTON LOCK
        --------------------------------- */

        submitButton.disabled = true;


        formMessage.textContent =
          "방문예약 접수 및 알림톡 발송 중입니다...";


        formMessage.className =
          "message show";


        try {

          /* ---------------------------------
             NETLIFY FUNCTION
          --------------------------------- */

          const response =
            await fetch(
              "/.netlify/functions/send-alimtalk",
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json"
                },

                body: JSON.stringify({

                  name: name,

                  phone: phone,

                  consultDate:
                    consultDate,

                  consultTime:
                    consultTime

                })

              }
            );


          /* ---------------------------------
             RESPONSE JSON
          --------------------------------- */

          let result = {};


          try {

            result =
              await response.json();

          } catch (jsonError) {

            console.error(
              "JSON 응답 파싱 실패:",
              jsonError
            );

            result = {};

          }


          /* ---------------------------------
             SUCCESS
          --------------------------------- */

          if (
            response.ok &&
            result.success === true
          ) {

            formMessage.textContent =
              "방문예약이 성공적으로 접수되었습니다. 곧 연락드리겠습니다!";


            formMessage.className =
              "message show success";


            leadForm.reset();


            /*
              날짜 최소값은 reset 이후에도
              다시 유지
            */

            if (consultDateInput) {

              const today =
                new Date();


              const yyyy =
                today.getFullYear();


              const mm =
                String(
                  today.getMonth() + 1
                ).padStart(2, "0");


              const dd =
                String(
                  today.getDate()
                ).padStart(2, "0");


              consultDateInput.min =
                `${yyyy}-${mm}-${dd}`;

            }


            return;

          }


          /* ---------------------------------
             SERVER ERROR
          --------------------------------- */

          throw new Error(
            result.error ||
            `예약 접수 실패 (${response.status})`
          );


        } catch (error) {

          console.error(
            "예약 전송 오류:",
            error
          );


          formMessage.textContent =
            "예약 접수 중 오류가 발생했습니다. 유선(1551-9708)으로 문의해 주세요.";


          formMessage.className =
            "message show error";


        } finally {

          submitButton.disabled = false;

        }

      }
    );

  }

});