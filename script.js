<script>
"use strict";

document.addEventListener("DOMContentLoaded", function () {

  /* =====================================================
     ELEMENTS
  ===================================================== */

  const header =
    document.getElementById("header");

  const mainMenu =
    document.getElementById("mainMenu");

  const menuToggle =
    document.getElementById("menuToggle");

  const popup =
    document.getElementById("popup01");

  const popupBox1 =
    document.getElementById("popupBox1");

  const popupBox2 =
    document.getElementById("popupBox2");

  const privacyModal =
    document.getElementById("privacyModal");

  const leadForm =
    document.getElementById("leadForm");

  const formMessage =
    document.getElementById("formMessage");

  const submitButton =
    document.getElementById("submitButton");


  /* =====================================================
     SECTION MOVE
  ===================================================== */

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


    const headerHeight =
      header
        ? header.offsetHeight
        : 80;


    const targetPosition =
      target.getBoundingClientRect().top +
      window.pageYOffset -
      headerHeight;


    window.scrollTo({
      top: targetPosition,
      behavior: "smooth"
    });

  }


  /* =====================================================
     NAVIGATION
  ===================================================== */

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


  /* =====================================================
     MOBILE MENU
  ===================================================== */

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


  /* =====================================================
     HEADER SCROLL
  ===================================================== */

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


  /* =====================================================
     VR POPUP
     
     PC:
       window.open() 팝업창

     MOBILE:
       브라우저 정책에 따라 새 탭/새 화면

     중요:
       VR 페이지 자체에 닫기 버튼을 만들지 않습니다.
       모바일은 브라우저 뒤로가기를 사용합니다.
  ===================================================== */


  let vrWindow = null;


  /*
   * PC용 팝업 크기
   */
  function getVRPopupFeatures() {

    const screenWidth =
      window.screen.availWidth || 1200;

    const screenHeight =
      window.screen.availHeight || 800;


    const popupWidth =
      Math.min(
        1200,
        Math.max(
          900,
          screenWidth - 40
        )
      );


    const popupHeight =
      Math.min(
        850,
        Math.max(
          650,
          screenHeight - 80
        )
      );


    const left =
      Math.max(
        0,
        (screenWidth - popupWidth) / 2
      );


    const top =
      Math.max(
        0,
        (screenHeight - popupHeight) / 2
      );


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


  /*
   * VR 열기
   */
  function openVR(url, title) {

    if (!url) {
      return;
    }


    /*
     * 이미 열려 있는 VR 창이 있으면 재사용
     */
    if (
      vrWindow &&
      !vrWindow.closed
    ) {

      try {

        vrWindow.location.href =
          url;

        vrWindow.focus();

        return;

      } catch (error) {

        vrWindow = null;

      }

    }


    /*
     * window.open()
     *
     * 이 함수는 반드시 사용자의
     * 버튼 클릭 이벤트에서 직접 실행됩니다.
     */
    vrWindow =
      window.open(
        url,
        "TheParkVistaVR",
        getVRPopupFeatures()
      );


    /*
     * 팝업 차단
     */
    if (!vrWindow) {

      alert(
        "VR 창이 차단되었습니다.\n\n" +
        "브라우저의 팝업 차단을 해제한 후 " +
        "다시 눌러주세요."
      );

      return;
    }


    /*
     * 창 포커스
     */
    try {

      vrWindow.focus();

    } catch (error) {}


    /*
     * 제목 변경
     *
     * 외부 도메인의 경우 브라우저 보안정책 때문에
     * 변경되지 않을 수 있습니다.
     */
    try {

      if (title) {

        vrWindow.document.title =
          title;

      }

    } catch (error) {}

  }


  /*
   * 84A / 84C VR 버튼 연결
   */
  document
    .querySelectorAll(".unit-vr-link")
    .forEach(function (button) {

      button.addEventListener(
        "click",
        function (event) {

          event.preventDefault();
          event.stopPropagation();


          const url =
            this.getAttribute(
              "data-vr"
            );


          const title =
            this.getAttribute(
              "data-vr-title"
            );


          if (!url) {
            return;
          }


          openVR(
            url,
            title
          );

        }
      );

    });


  /* =====================================================
     HERO VR BUTTON
     
     현재 HERO 버튼은
     unitSection으로 이동하도록 유지합니다.
  ===================================================== */

  const heroVRButton =
    document.querySelector(
      ".hero-vr-btn"
    );


  if (heroVRButton) {

    heroVRButton.addEventListener(
      "click",
      function (event) {

        event.preventDefault();

        moveToSection(
          "unitSection"
        );

      }
    );

  }


  /* =====================================================
     POPUP
  ===================================================== */

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


    /*
     * 팝업 닫기
     */
    document
      .querySelectorAll(".popupCloseBtn")
      .forEach(function (button) {

        button.addEventListener(
          "click",
          function (event) {

            event.preventDefault();
            event.stopPropagation();

            popup.classList.remove(
              "show"
            );

          }
        );

      });


    /*
     * 팝업 클릭
     */
    popup.addEventListener(
      "click",
      function (event) {

        if (
          event.target.closest(
            ".popupCloseBtn"
          )
        ) {
          return;
        }


        /*
         * 검은색 바깥 영역
         */
        if (
          event.target === popup
        ) {

          popup.classList.remove(
            "show"
          );

          return;
        }


        /*
         * 모바일
         *
         * 1번 팝업 → 2번 팝업
         * 2번 팝업 → 닫기
         */
        if (
          window.innerWidth <= 900
        ) {

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

            return;
          }

        } else {

          /*
           * PC는 팝업 클릭 시 닫기
           */
          popup.classList.remove(
            "show"
          );

        }

      }
    );

  }


  /* =====================================================
     PRIVACY MODAL
  ===================================================== */

  const policyOpen =
    document.getElementById(
      "policyOpen"
    );

  const policyOpen2 =
    document.getElementById(
      "policyOpen2"
    );

  const policyClose =
    document.getElementById(
      "policyClose"
    );


  let savedScrollY = 0;


  function openPrivacyModal(event) {

    if (event) {
      event.preventDefault();
    }


    if (!privacyModal) {
      return;
    }


    savedScrollY =
      window.scrollY ||
      window.pageYOffset ||
      0;


    privacyModal.classList.add(
      "show"
    );


    document.body.classList.add(
      "modal-open"
    );

  }


  function closePrivacyModal() {

    if (!privacyModal) {
      return;
    }


    privacyModal.classList.remove(
      "show"
    );


    document.body.classList.remove(
      "modal-open"
    );


    window.scrollTo({
      top: savedScrollY,
      left: 0,
      behavior: "auto"
    });

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
          event.target ===
          privacyModal
        ) {

          closePrivacyModal();

        }

      }
    );

  }


  /* =====================================================
     ESC
  ===================================================== */

  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Escape"
      ) {

        if (
          privacyModal &&
          privacyModal.classList.contains(
            "show"
          )
        ) {

          closePrivacyModal();

        }

      }

    }
  );


  /* =====================================================
     DATE
  ===================================================== */

  const consultDate =
    document.getElementById(
      "consultDate"
    );

  const dateField =
    document.getElementById(
      "dateField"
    );


  function getLocalDateString() {

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


    return (
      yyyy +
      "-" +
      mm +
      "-" +
      dd
    );

  }


  if (consultDate) {

    consultDate.min =
      getLocalDateString();

  }


  function openDatePicker() {

    if (!consultDate) {
      return;
    }


    try {

      if (
        typeof consultDate.showPicker ===
        "function"
      ) {

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

    dateField.addEventListener(
      "click",
      function (event) {

        if (
          event.target ===
          consultDate
        ) {
          return;
        }


        openDatePicker();

      }
    );


    dateField.addEventListener(
      "keydown",
      function (event) {

        if (
          event.key === "Enter" ||
          event.key === " "
        ) {

          event.preventDefault();

          openDatePicker();

        }

      }
    );

  }


  /* =====================================================
     PHONE AUTO FORMAT
  ===================================================== */

  const phoneInput =
    document.getElementById(
      "phone"
    );


  if (phoneInput) {

    phoneInput.addEventListener(
      "input",
      function () {

        let value =
          this.value.replace(
            /\D/g,
            ""
          );


        if (
          value.length <= 3
        ) {

          this.value =
            value;

        } else if (
          value.length <= 7
        ) {

          this.value =
            value.slice(0, 3) +
            "-" +
            value.slice(3);

        } else {

          this.value =
            value.slice(0, 3) +
            "-" +
            value.slice(3, 7) +
            "-" +
            value.slice(7, 11);

        }

      }
    );

  }


  /* =====================================================
     RESERVATION
  ===================================================== */

  if (leadForm) {

    leadForm.addEventListener(
      "submit",
      async function (event) {

        event.preventDefault();


        const nameInput =
          document.getElementById(
            "name"
          );


        const phoneInput =
          document.getElementById(
            "phone"
          );


        const consultDateInput =
          document.getElementById(
            "consultDate"
          );


        const consultTimeInput =
          document.getElementById(
            "consultTime"
          );


        const privacyCheckbox =
          document.getElementById(
            "privacy"
          );


        const websiteInput =
          document.getElementById(
            "website"
          );


        /*
         * 봇 방지
         */
        if (
          websiteInput &&
          websiteInput.value
        ) {

          return;

        }


        /*
         * 이름
         */
        if (
          !nameInput.value.trim()
        ) {

          alert(
            "이름을 입력해주세요."
          );

          nameInput.focus();

          return;

        }


        /*
         * 전화번호
         */
        if (
          !phoneInput.value.trim()
        ) {

          alert(
            "휴대폰 번호를 입력해주세요."
          );

          phoneInput.focus();

          return;

        }


        const phone =
          phoneInput.value.replace(
            /\D/g,
            ""
          );


        if (
          phone.length < 10 ||
          phone.length > 11
        ) {

          alert(
            "휴대폰 번호를 정확하게 입력해주세요."
          );

          phoneInput.focus();

          return;

        }


        /*
         * 방문일
         */
        if (
          !consultDateInput.value
        ) {

          alert(
            "방문 희망일을 선택해주세요."
          );

          consultDateInput.focus();

          return;

        }


        /*
         * 방문시간
         */
        if (
          !consultTimeInput.value
        ) {

          alert(
            "방문 희망시간을 선택해주세요."
          );

          consultTimeInput.focus();

          return;

        }


        /*
         * 개인정보
         */
        if (
          !privacyCheckbox.checked
        ) {

          alert(
            "개인정보 수집 및 이용에 동의해주세요."
          );

          privacyCheckbox.focus();

          return;

        }


        submitButton.disabled =
          true;


        formMessage.textContent =
          "방문예약 접수 및 알림톡 발송 중입니다...";


        formMessage.className =
          "message show";


        try {

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

                  name:
                    nameInput.value.trim(),

                  phone:
                    phoneInput.value.trim(),

                  consultDate:
                    consultDateInput.value,

                  consultTime:
                    consultTimeInput.value

                })

              }
            );


          let result = {};


          try {

            result =
              await response.json();

          } catch (jsonError) {

            result = {};

          }


          if (response.ok) {

            formMessage.textContent =
              "방문예약이 성공적으로 접수되었습니다. 곧 연락드리겠습니다!";


            formMessage.className =
              "message show success";


            leadForm.reset();


            if (consultDate) {

              consultDate.min =
                getLocalDateString();

            }

          } else {

            throw new Error(
              result.error ||
              "서버 전송 실패"
            );

          }


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

          submitButton.disabled =
            false;

        }

      }
    );

  }

});
</script>