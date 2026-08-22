"use strict";

const crypto = require("crypto");


// =========================================================
// 공통 JSON 응답
// =========================================================

function jsonResponse(statusCode, data) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(data)
  };
}


// =========================================================
// NCP Signature 생성
// =========================================================

function makeSignature(
  method,
  uri,
  timestamp,
  accessKey,
  secretKey
) {
  return crypto
    .createHmac("sha256", secretKey)
    .update(
      `${method} ${uri}\n${timestamp}\n${accessKey}`
    )
    .digest("base64");
}


// =========================================================
// NCP API 호출
// =========================================================

async function ncpRequest({
  method,
  uri,
  accessKey,
  secretKey,
  body
}) {

  const timestamp =
    Date.now().toString();

  const signature =
    makeSignature(
      method,
      uri,
      timestamp,
      accessKey,
      secretKey
    );

  const url =
    `https://sens.apigw.ntruss.com${uri}`;

  const response =
    await fetch(url, {

      method,

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
        method === "GET"
          ? undefined
          : JSON.stringify(body)

    });

  const text =
    await response.text();

  let result;

  try {
    result =
      JSON.parse(text);
  } catch {
    result = {
      raw: text
    };
  }

  return {
    ok:
      response.ok,

    status:
      response.status,

    data:
      result
  };
}


// =========================================================
// 메인
// =========================================================

exports.handler = async function (event) {

  // =======================================================
  // 1. POST만 허용
  // =======================================================

  if (event.httpMethod !== "POST") {

    return jsonResponse(
      405,
      {
        success: false,
        error: "Method Not Allowed"
      }
    );

  }


  try {

    // =====================================================
    // 2. 환경변수
    // =====================================================

    const serviceId =
      process.env.NCP_BIZ_SERVICE_ID;

    const accessKey =
      process.env.NCP_ACCESS_KEY;

    const secretKey =
      process.env.NCP_SECRET_KEY;

    const plusFriendId =
      process.env.NCP_PLUS_FRIEND_ID;

    const templateCode =
      process.env.NCP_TEMPLATE_CODE ||
      "dPdir1";

    const adminPhone =
      process.env.ADMIN_PHONE;


    // =====================================================
    // 3. 환경변수 확인
    // =====================================================

    if (
      !serviceId ||
      !accessKey ||
      !secretKey ||
      !plusFriendId ||
      !adminPhone
    ) {

      console.error(
        "NCP 환경변수 누락"
      );

      return jsonResponse(
        500,
        {
          success: false,
          error:
            "서버 환경설정이 완료되지 않았습니다."
        }
      );

    }


    // =====================================================
    // 4. 요청 데이터
    // =====================================================

    let data = {};

    try {

      data =
        JSON.parse(
          event.body || "{}"
        );

    } catch {

      return jsonResponse(
        400,
        {
          success: false,
          error:
            "잘못된 요청 형식입니다."
        }
      );

    }


    const {
      name,
      phone,
      consultDate,
      consultTime
    } = data;


    // =====================================================
    // 5. 필수값
    // =====================================================

    if (
      !name ||
      !phone ||
      !consultDate ||
      !consultTime
    ) {

      return jsonResponse(
        400,
        {
          success: false,
          error:
            "필수 입력값이 누락되었습니다."
        }
      );

    }


    // =====================================================
    // 6. 데이터 정리
    // =====================================================

    const cleanName =
      String(name).trim();

    const cleanPhone =
      String(phone)
        .replace(/\D/g, "");

    const cleanDate =
      String(consultDate).trim();

    const cleanTime =
      String(consultTime).trim();

    const cleanAdminPhone =
      String(adminPhone)
        .replace(/\D/g, "");


    // =====================================================
    // 7. 입력값 검증
    // =====================================================

    if (!cleanName) {

      return jsonResponse(
        400,
        {
          success: false,
          error:
            "이름을 입력해주세요."
        }
      );

    }


    if (
      !/^01[016789]\d{7,8}$/
        .test(cleanPhone)
    ) {

      return jsonResponse(
        400,
        {
          success: false,
          error:
            "올바른 휴대폰 번호가 아닙니다."
        }
      );

    }


    if (
      !/^\d{4}-\d{2}-\d{2}$/
        .test(cleanDate)
    ) {

      return jsonResponse(
        400,
        {
          success: false,
          error:
            "방문 희망일 형식이 올바르지 않습니다."
        }
      );

    }


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


    if (
      !allowedTimes.includes(cleanTime)
    ) {

      return jsonResponse(
        400,
        {
          success: false,
          error:
            "방문 희망시간이 올바르지 않습니다."
        }
      );

    }


    if (
      !/^01[016789]\d{7,8}$/
        .test(cleanAdminPhone)
    ) {

      return jsonResponse(
        500,
        {
          success: false,
          error:
            "관리자 전화번호 설정이 올바르지 않습니다."
        }
      );

    }


    // =====================================================
    // 8. ★ dPdir1 템플릿 조회
    //
    // NCP 공식 API:
    //
    // GET
    // /alimtalk/v2/services/{serviceId}/templates
    //
    // channelId 필수
    // templateCode=dPdir1
    // =====================================================

    const templateUri =
      `/alimtalk/v2/services/${serviceId}/templates` +
      `?channelId=${encodeURIComponent(plusFriendId)}` +
      `&templateCode=${encodeURIComponent(templateCode)}`;


    const templateResponse =
      await ncpRequest({

        method: "GET",

        uri: templateUri,

        accessKey,

        secretKey

      });


    // =====================================================
    // 9. 템플릿 조회 실패
    // =====================================================

    if (
      !templateResponse.ok
    ) {

      console.error(
        "NCP 템플릿 조회 실패:",
        templateResponse.data
      );

      return jsonResponse(
        500,
        {
          success: false,
          error:
            "NCP 알림톡 템플릿 조회에 실패했습니다.",
          detail:
            templateResponse.data
        }
      );

    }


    // =====================================================
    // 10. 템플릿 정보 추출
    // =====================================================

    const templateData =
      templateResponse.data;


    console.log(
      "NCP 템플릿 확인:",
      {
        templateCode:
          templateData.templateCode,

        templateName:
          templateData.templateName,

        templateStatus:
          templateData.templateStatus,

        templateInspectionStatus:
          templateData.templateInspectionStatus
      }
    );


    // =====================================================
    // 11. 템플릿 정상 여부
    // =====================================================

    if (
      templateData.templateCode !==
      templateCode
    ) {

      return jsonResponse(
        500,
        {
          success: false,
          error:
            "요청한 알림톡 템플릿을 찾을 수 없습니다."
        }
      );

    }


    if (
      templateData.templateStatus &&
      templateData.templateStatus !==
        "ACTIVE"
    ) {

      console.error(
        "템플릿 상태:",
        templateData.templateStatus
      );

      return jsonResponse(
        500,
        {
          success: false,
          error:
            "알림톡 템플릿이 활성 상태가 아닙니다.",
          templateStatus:
            templateData.templateStatus
        }
      );

    }


    // =====================================================
    // 12. 승인된 템플릿 본문
    // =====================================================

    const registeredContent =
      String(
        templateData.content || ""
      );


    if (!registeredContent) {

      return jsonResponse(
        500,
        {
          success: false,
          error:
            "NCP 템플릿 본문을 가져오지 못했습니다."
        }
      );

    }


    // =====================================================
    // 13. ★ 템플릿 변수 직접 치환
    //
    // 예:
    //
    // #{고객명}
    //       ↓
    // 홍길동
    //
    // #{휴대폰}
    //       ↓
    // 01012345678
    // =====================================================

    let sendContent =
      registeredContent;


    sendContent =
      sendContent.replace(
        /#\{고객명\}/g,
        cleanName
      );


    sendContent =
      sendContent.replace(
        /#\{휴대폰\}/g,
        cleanPhone
      );


    sendContent =
      sendContent.replace(
        /#\{방문희망일\}/g,
        cleanDate
      );


    sendContent =
      sendContent.replace(
        /#\{방문시간\}/g,
        cleanTime
      );


    // =====================================================
    // 14. 치환되지 않은 변수가 남아있는지 확인
    // =====================================================

    const remainingVariables =
      sendContent.match(
        /#\{[^}]+\}/g
      );


    if (
      remainingVariables &&
      remainingVariables.length > 0
    ) {

      console.error(
        "치환되지 않은 템플릿 변수:",
        remainingVariables
      );

      return jsonResponse(
        500,
        {
          success: false,
          error:
            "치환되지 않은 알림톡 템플릿 변수가 있습니다.",
          variables:
            remainingVariables
        }
      );

    }


    // =====================================================
    // 15. ★ NCP 알림톡 발송 데이터
    //
    // templateParameters 사용하지 않음
    // =====================================================

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
            sendContent

        }

      ]

    };


    // =====================================================
    // 16. 발송 데이터 로그
    // =====================================================

    console.log(
      "알림톡 발송 내용:",
      {
        templateCode,
        content:
          sendContent
      }
    );


    // =====================================================
    // 17. ★ 알림톡 발송
    // =====================================================

    const sendUri =
      `/alimtalk/v2/services/${serviceId}/messages`;


    const sendResponse =
      await ncpRequest({

        method: "POST",

        uri: sendUri,

        accessKey,

        secretKey,

        body:
          bodyData

      });


    // =====================================================
    // 18. NCP 발송 API 오류
    // =====================================================

    if (
      !sendResponse.ok
    ) {

      console.error(
        "NCP 알림톡 발송 오류:",
        sendResponse.data
      );

      return jsonResponse(
        500,
        {
          success: false,
          error:
            "알림톡 발송에 실패했습니다.",
          detail:
            sendResponse.data
        }
      );

    }


    // =====================================================
    // 19. 결과
    // =====================================================

    console.log(
      "NCP 알림톡 발송 성공:",
      sendResponse.data
    );


    // NCP는 현재 발송 요청 성공 시
    // HTTP 202를 반환합니다.
    //
    // 실제 messageId는 messages 안에 있을 수 있습니다.

    const result =
      sendResponse.data;


    const messageInfo =
      Array.isArray(result.messages)
        ? result.messages[0]
        : null;


    // =====================================================
    // 20. 최종 성공
    // =====================================================

    return jsonResponse(
      200,
      {

        success:
          true,

        message:
          "방문예약이 접수되었습니다.",

        requestId:
          result.requestId ||
          null,

        messageId:
          messageInfo?.messageId ||
          null

      }
    );


  } catch (error) {

    // =====================================================
    // 서버 예외
    // =====================================================

    console.error(
      "send-alimtalk 서버 오류:",
      error
    );


    return jsonResponse(
      500,
      {
        success: false,
        error:
          error.message ||
          "서버 오류가 발생했습니다."
      }
    );

  }

};