"use strict";

document.addEventListener("DOMContentLoaded", function () {

  /* =====================================================
     기본 요소
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
     VR 요소
  ===================================================== */

  const vrModal =
    document.getElementById("vrModal");

  const vrFrame =
    document.getElementById("vrFrame");

  const vrModalClose =
    document.getElementById("vrModalClose");

  const vrModalTitle =
    document.getElementById("vrModalTitle");

  /*
   * VR 모달을 열기 전 스크롤 위치
   */
  let savedScrollY = 0;


  /* =====================================================
     BODY LOCK
  ===================================================== */

  function updateBodyLock() {

    const isOpen = Boolean(

      (popup &&
        popup.classList.contains("show"))

      ||

      (privacyModal &&
        privacyModal.classList.contains("show"))

      ||

      (vrModal &&
        vrModal.classList.contains("show"))

    );

    document.body.classList.toggle(
      "modal-open",
      isOpen
    );

  }


  /* =====================================================
     SECTION MOVE
  ===================================================== */

  function moveToSection(targetId) {

    if (mainMenu) {

      mainMenu.classList.remove(
        "active"
      );

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
      (header
        ? header.offsetHeight
        : 80) - 15;

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
     DATA TARGET
  ===================================================== */

  document
    .querySelectorAll("[data-target]")
    .forEach(function (button) {

      button.addEventListener(
        "click",
        function (event) {

          event.preventDefault();

          const targetId =
            this.getAttribute(
              "data-target"
            );

          if (targetId) {

            moveToSection(
              targetId
            );

          }

        }
      );

    });


  /* =====================================================
     MOBILE MENU
  ===================================================== */

  if (menuToggle) {

    menuToggle.addEventListener(
      "click",
      function (event) {

        event.preventDefault();

        if (!mainMenu) {
          return;
        }

        const isOpen =
          mainMenu.classList.toggle(
            "active"
          );

        menuToggle.textContent =
          isOpen
            ? "✕"
            : "☰";

        menuToggle.setAttribute(
          "aria-expanded",
          isOpen
            ? "true"
            : "false"
        );

      }
    );

  }


  /* =====================================================
     HEADER
  ===================================================== */

  window.addEventListener(
    "scroll",
    function () {

      if (header) {

        header.classList.toggle(
          "scrolled",
          window.scrollY > 40
        );

      }

    },
    {
      passive: true
    }
  );


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

    popup.classList.add(
      "show"
    );

    updateBodyLock();


    popup.addEventListener(
      "click",
      function (event) {

        /*
         * 닫기 버튼을 누른 경우
         */
        if (
          event.target.closest(
            ".popupCloseBtn"
          )
        ) {

          popup.classList.remove(
            "show"
          );

          updateBodyLock();

          return;
        }


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

          } else if (
            popupBox2 &&
            popupBox2.classList.contains(
              "active-mobile"
            )
          ) {

            popup.classList.remove(
              "show"
            );

            updateBodyLock();

          }

        } else {

          /*
           * PC에서는 바깥 또는 팝업 클릭 시 닫기
           */
          popup.classList.remove(
            "show"
          );

          updateBodyLock();

        }

      }
    );

  }


  /* =====================================================
     VR MODAL
  ===================================================== */

  function openVrModal(
    url,
    title
  ) {

    if (!vrModal || !vrFrame) {
      return;
    }


    /*
     * 현재 위치 저장
     *
     * 예:
     * 단지안내 70% 위치에서 VR 클릭
     * ↓
     * 현재 위치 저장
     * ↓
     * VR 열림
     */

    savedScrollY =
      window.scrollY;


    /*
     * 현재 페이지를 그 위치에 고정
     */
    document.body.style.position =
      "fixed";

    document.body.style.top =
      "-" + savedScrollY + "px";

    document.body.style.left =
      "0";

    document.body.style.right =
      "0";

    document.body.style.width =
      "100%";


    /*
     * 제목
     */

    if (
      vrModalTitle &&
      title
    ) {

      vrModalTitle.textContent =
        title;

    }


    /*
     * VR 주소 연결
     */

    vrFrame.src =
      url;


    /*
     * 모달 표시
     */

    vrModal.classList.add(
      "show"
    );

    updateBodyLock();

  }


  function closeVrModal() {

    if (!vrModal) {
      return;
    }


    /*
     * 모달 닫기
     */

    vrModal.classList.remove(
      "show"
    );


    /*
     * VR 종료
     *
     * iframe을 비워서 VR이
     * 백그라운드에서 계속 실행되지 않게 함
     */

    if (vrFrame) {

      vrFrame.src =
        "about:blank";

    }


    /*
     * BODY 고정 해제
     */

    document.body.style.position =
      "";

    document.body.style.top =
      "";

    document.body.style.left =
      "";

    document.body.style.right =
      "";

    document.body.style.width =
      "";


    /*
     * ★ 핵심
     *
     * VR을 닫아도 원래 보던 위치로 돌아감
     */

    window.scrollTo(
      0,
      savedScrollY
    );


    updateBodyLock();

  }


  /*
   * 84A / 84C VR 버튼
   */

  document
    .querySelectorAll(".vr-open")
    .forEach(function (button) {

      button.addEventListener(
        "click",
        function (event) {

          event.preventDefault();

          const url =
            this.getAttribute(
              "data-vr"
            );

          const title =
            this.getAttribute(
              "data-title"
            ) ||
            "360° VR 모델하우스";


          if (!url) {

            alert(
              "VR 주소를 찾을 수 없습니다."
            );

            return;
          }


          openVrModal(
            url,
            title
          );

        }
      );

    });


  /*
   * VR 닫기 버튼
   */

  if (vrModalClose) {

    vrModalClose.addEventListener(
      "click",
      function (event) {

        event.preventDefault();

        closeVrModal();

      }
    );

  }


  /*
   * VR 바깥 영역 클릭
   */

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


  /*
   * ESC 키
   */

  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Escape" &&
        vrModal &&
        vrModal.classList.contains(
          "show"
        )
      ) {

        closeVrModal();

      }

    }
  );


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


  function openPrivacyModal(
    event
  ) {

    if (event) {
      event.preventDefault();
    }

    if (privacyModal) {

      privacyModal.classList.add(
        "show"
      );

      updateBodyLock();

    }

  }


  function closePrivacyModal() {

    if (privacyModal) {

      privacyModal.classList.remove(
        "show"
      );

      updateBodyLock();

    }

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


        if (
          websiteInput &&
          websiteInput.value
        ) {

          return;

        }


        if (
          !nameInput.value.trim()
        ) {

          alert(
            "이름을 입력해주세요."
          );

          nameInput.focus();

          return;

        }


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


        if (
          !consultDateInput.value
        ) {

          alert(
            "방문 희망일을 선택해주세요."
          );

          consultDateInput.focus();

          return;

        }


        if (
          !consultTimeInput.value
        ) {

          alert(
            "방문 희망시간을 선택해주세요."
          );

          consultTimeInput.focus();

          return;

        }


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

          } catch (
            jsonError
          ) {

            result = {};

          }


          if (
            response.ok
          ) {

            formMessage.textContent =
              "방문예약이 성공적으로 접수되었습니다. 곧 연락드리겠습니다!";

            formMessage.className =
              "message show success";

            leadForm.reset();

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