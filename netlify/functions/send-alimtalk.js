"use strict";

const crypto = require("crypto");

exports.handler = async function (event) {

  // =========================================================
  // 1. POST 요청만 허용
  // =========================================================

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        success: false,
        error: "Method Not Allowed"
      })
    };
  }

  try {

    // =======================================================
    // 2. 요청 데이터 확인
    // =======================================================

    let data = {};

    try {
      data = JSON.parse(event.body || "{}");
    } catch (error) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify({
          success: false,
          error: "잘못된 요청 형식입니다."
        })
      };
    }

    const {
      name,
      phone,
      consultDate,
      consultTime
    } = data;


    // =======================================================
    // 3. 필수값 검증
    // =======================================================

    if (
      !name ||
      !phone ||
      !consultDate ||
      !consultTime
    ) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify({
          success: false,
          error: "필수 입력값이 누락되었습니다."
        })
      };
    }


    // =======================================================
    // 4. 데이터 정리
    // =======================================================

    const cleanName =
      String(name).trim();

    const cleanPhone =
      String(phone).replace(/\D/g, "");

    const cleanDate =
      String(consultDate).trim();

    const cleanTime =
      String(consultTime).trim();


    // =======================================================
    // 5. 이름 검증
    // =======================================================

    if (!cleanName) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type":
            "application/json; charset=utf-8"
        },
        body: JSON.stringify({
          success: false,
          error: "이름을 입력해주세요."
        })
      };
    }


    // =======================================================
    // 6. 휴대폰 번호 검증
    // =======================================================

    if (!/^01[016789]\d{7,8}$/.test(cleanPhone)) {

      return {
        statusCode: 400,
        headers: {
          "Content-Type":
            "application/json; charset=utf-8"
        },
        body: JSON.stringify({
          success: false,
          error: "올바른 휴대폰 번호가 아닙니다."
        })
      };

    }


    // =======================================================
    // 7. 날짜 형식 검증
    // =======================================================

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)
    ) {

      return {
        statusCode: 400,
        headers: {
          "Content-Type":
            "application/json; charset=utf-8"
        },
        body: JSON.stringify({
          success: false,
          error: "방문 희망일 형식이 올바르지 않습니다."
        })
      };

    }


    // =======================================================
    // 8. 방문시간 허용값 검증
    // =======================================================

    const allowedTimes = [
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00"
    ];

    if (!allowedTimes.includes(cleanTime)) {

      return {
        statusCode: 400,
        headers: {
          "Content-Type":
            "application/json; charset=utf-8"
        },
        body: JSON.stringify({
          success: false,
          error: "방문 희망시간이 올바르지 않습니다."
        })
      };

    }


    // =======================================================
    // 9. Netlify 환경변수
    // =======================================================

    const serviceId =
      process.env.NCP_BIZ_SERVICE_ID;

    const accessKey =
      process.env.NCP_ACCESS_KEY;

    const secretKey =
      process.env.NCP_SECRET_KEY;

    const plusFriendId =
      process.env.NCP_PLUS_FRIEND_ID;

    const templateCode =
      process.env.NCP_TEMPLATE_CODE;

    const adminPhone =
      process.env.ADMIN_PHONE;


    // =======================================================
    // 10. 환경변수 상태 확인
    // =======================================================

    console.log(
      "NCP 환경변수 상태:",
      {
        NCP_BIZ_SERVICE_ID:
          !!serviceId,

        NCP_ACCESS_KEY:
          !!accessKey,

        NCP_SECRET_KEY:
          !!secretKey,

        NCP_PLUS_FRIEND_ID:
          !!plusFriendId,

        NCP_TEMPLATE_CODE:
          !!templateCode,

        ADMIN_PHONE:
          !!adminPhone
      }
    );


    // =======================================================
    // 11. 환경변수 누락 확인
    // =======================================================

    if (
      !serviceId ||
      !accessKey ||
      !secretKey ||
      !plusFriendId ||
      !templateCode ||
      !adminPhone
    ) {

      console.error(
        "NCP 환경변수 누락"
      );

      return {
        statusCode: 500,

        headers: {
          "Content-Type":
            "application/json; charset=utf-8"
        },

        body:
          JSON.stringify({
            success: false,
            error:
              "서버 환경설정이 완료되지 않았습니다."
          })
      };

    }


    // =======================================================
    // 12. 관리자 전화번호 정리
    // =======================================================

    const cleanAdminPhone =
      String(adminPhone).replace(/\D/g, "");


    // =======================================================
    // 13. 관리자 전화번호 검증
    // =======================================================

    if (
      !/^01[016789]\d{7,8}$/.test(
        cleanAdminPhone
      )
    ) {

      console.error(
        "ADMIN_PHONE 형식 오류"
      );

      return {
        statusCode: 500,

        headers: {
          "Content-Type":
            "application/json; charset=utf-8"
        },

        body:
          JSON.stringify({
            success: false,
            error:
              "관리자 전화번호 설정이 올바르지 않습니다."
          })
      };

    }


    // =======================================================
    // 14. NCP SENS API URL
    // =======================================================

    const timestamp =
      Date.now().toString();

    const method =
      "POST";

    const uri =
      `/alimtalk/v2/services/${serviceId}/messages`;

    const hostName =
      "https://sens.apigw.ntruss.com";

    const url =
      `${hostName}${uri}`;


    // =======================================================
    // 15. NCP API Signature 생성
    // =======================================================

    const space =
      " ";

    const newLine =
      "\n";

    const hmac =
      crypto.createHmac(
        "sha256",
        secretKey
      );

    hmac.update(
      method
    );

    hmac.update(
      space
    );

    hmac.update(
      uri
    );

    hmac.update(
      newLine
    );

    hmac.update(
      timestamp
    );

    hmac.update(
      newLine
    );

    hmac.update(
      accessKey
    );

    const signature =
      hmac.digest("base64");


    // =======================================================
    // 16. 알림톡 템플릿 변수 (templateParameters에 #{ } 적용 완료)
    // =======================================================

    const bodyData = {

      plusFriendId:
        plusFriendId,

      templateCode:
        templateCode,

      messages: [

        {
          countryCode:
            "82",

          to:
            cleanAdminPhone,

          content: 
            `[더파크 비스타동원]

신규 방문예약이 접수되었습니다.

고객명: #{고객명}
휴대폰: #{휴대폰}
방문희망일: #{방문희망일}
방문시간: #{방문시간}

예약 내용을 확인 후 고객에게 연락해주세요.`,

          templateParameters: {

            "#{고객명}":
              cleanName,

            "#{휴대폰}":
              cleanPhone,

            "#{방문희망일}":
              cleanDate,

            "#{방문시간}":
              cleanTime

          }

        }

      ]

    };


    // =======================================================
    // 17. NCP SENS 알림톡 발송
    // =======================================================

    const response =
      await fetch(
        url,
        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "application/json; charset=utf-8",

            "x-ncp-apigw-timestamp":
              timestamp,

            "x-ncp-iam-access-key":
              accessKey,

            "x-ncp-apigw-signature-v2":
              signature

          },

          body:
            JSON.stringify(bodyData)

        }
      );


    // =======================================================
    // 18. NCP 응답 확인
    // =======================================================

    const responseText =
      await response.text();

    let result = {};

    try {

      result =
        JSON.parse(responseText);

    } catch (error) {

      result = {
        raw: responseText
      };

    }


    // =======================================================
    // 19. NCP API 오류
    // =======================================================

    if (!response.ok) {

      console.error(
        "NCP SENS 발송 오류:",
        result
      );

      return {
        statusCode: 500,

        headers: {
          "Content-Type":
            "application/json; charset=utf-8"
        },

        body:
          JSON.stringify({

            success: false,

            error:
              "알림톡 발송에 실패했습니다.",

            detail:
              result

          })
      };

    }


    // =======================================================
    // 20. 성공
    // =======================================================

    console.log(
      "NCP SENS 발송 요청 성공:",
      result
    );


    return {

      statusCode: 200,

      headers: {
        "Content-Type":
          "application/json; charset=utf-8"
      },

      body:
        JSON.stringify({

          success: true,

          message:
            "방문예약이 접수되었습니다.",

          requestId:
            result.requestId || null

        })

    };


  } catch (error) {

    // =======================================================
    // 21. 서버 예외
    // =======================================================

    console.error(
      "send-alimtalk 서버 오류:",
      error
    );

    return {

      statusCode: 500,

      headers: {
        "Content-Type":
          "application/json; charset=utf-8"
      },

      body:
        JSON.stringify({

          success: false,

          error:
            error.message ||
            "서버 오류가 발생했습니다."

        })

      };

  }

};