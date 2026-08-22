"use strict";

const crypto = require("crypto");


// =========================================================
// JSON 응답
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
// NCP Signature
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
// NCP API
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

  const options = {

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

    }

  };

  if (method !== "GET") {
    options.body =
      JSON.stringify(body);
  }

  const response =
    await fetch(
      url,
      options
    );

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

  try {

    // =====================================================
    // 1. POST
    // =====================================================

    if (
      event.httpMethod !== "POST"
    ) {

      return jsonResponse(
        405,
        {
          success: false,
          error:
            "Method Not Allowed"
        }
      );

    }


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

    // ★ 확정된 템플릿 코드
    const templateCode =
      "dPdir1";

    const adminPhone =
      process.env.ADMIN_PHONE;


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


    if (
      !serviceId ||
      !accessKey ||
      !secretKey ||
      !plusFriendId ||
      !adminPhone
    ) {

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
    // 3. 요청 데이터
    // =====================================================

    let data;

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
    // 4. 필수값
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
    // 5. 데이터 정리
    // =====================================================

    const cleanName =
      String(name)
        .trim();

    const cleanPhone =
      String(phone)
        .replace(/\D/g, "");

    const cleanDate =
      String(consultDate)
        .trim();

    const cleanTime =
      String(consultTime)
        .trim();

    const cleanAdminPhone =
      String(adminPhone)
        .replace(/\D/g, "");


    // =====================================================
    // 6. 이름
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


    // =====================================================
    // 7. 전화번호
    // =====================================================

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


    // =====================================================
    // 8. 날짜
    // =====================================================

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


    // =====================================================
    // 9. 시간
    // =====================================================

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
      !allowedTimes.includes(
        cleanTime
      )
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


    // =====================================================
    // 10. 관리자 전화번호
    // =====================================================

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
    // 11. 템플릿 조회
    // =====================================================

    const templateUri =
      `/alimtalk/v2/services/${serviceId}/templates` +
      `?channelId=${encodeURIComponent(
        plusFriendId
      )}` +
      `&templateCode=${encodeURIComponent(
        templateCode
      )}`;


    const templateResponse =
      await ncpRequest({

        method:
          "GET",

        uri:
          templateUri,

        accessKey,

        secretKey

      });


    if (
      !templateResponse.ok
    ) {

      console.error(
        "NCP 템플릿 조회 오류:",
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
    // 12. 배열 처리
    // =====================================================

    const templateList =
      Array.isArray(
        templateResponse.data
      )
        ? templateResponse.data
        : [];


    const templateData =
      templateList.find(
        item =>
          String(
            item.templateCode
          ) === templateCode
      );


    if (!templateData) {

      console.error(
        "템플릿을 찾을 수 없습니다.",
        {
          templateCode,
          templateList
        }
      );

      return jsonResponse(
        500,
        {
          success: false,
          error:
            `알림톡 템플릿 ${templateCode}을(를) 찾을 수 없습니다.`
        }
      );

    }


    // =====================================================
    // 13. 템플릿 상태
    //
    // ★ READY + COMPLETE = 정상
    // ★ 여기서 ACTIVE 검사하지 않음
    // =====================================================

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
          templateData.templateInspectionStatus,

        messageType:
          templateData.messageType
      }
    );


    if (
      templateData.templateInspectionStatus &&
      templateData.templateInspectionStatus !==
        "COMPLETE"
    ) {

      return jsonResponse(
        500,
        {
          success: false,
          error:
            "알림톡 템플릿 검수가 완료되지 않았습니다.",
          templateInspectionStatus:
            templateData.templateInspectionStatus
        }
      );

    }


    // =====================================================
    // 14. 등록된 템플릿 본문
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
            "알림톡 템플릿 본문이 없습니다."
        }
      );

    }


    console.log(
      "NCP 등록 템플릿:",
      registeredContent
    );


    // =====================================================
    // 15. ★ 실제 변수 치환
    // =====================================================

    let sendContent =
      registeredContent;


    sendContent =
      sendContent.replaceAll(
        "#{고객명}",
        cleanName
      );


    sendContent =
      sendContent.replaceAll(
        "#{휴대폰}",
        cleanPhone
      );


    sendContent =
      sendContent.replaceAll(
        "#{방문희망일}",
        cleanDate
      );


    sendContent =
      sendContent.replaceAll(
        "#{방문시간}",
        cleanTime
      );


    // =====================================================
    // 16. 남은 변수 검사
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
        "치환되지 않은 변수:",
        remainingVariables
      );

      return jsonResponse(
        500,
        {
          success: false,
          error:
            "알림톡 템플릿 변수를 모두 치환하지 못했습니다.",
          variables:
            remainingVariables
        }
      );

    }


    // =====================================================
    // 17. ★ 최종 발송 내용
    // =====================================================

    console.log(
      "===================================="
    );

    console.log(
      "알림톡 최종 발송 내용:"
    );

    console.log(
      sendContent
    );

    console.log(
      "===================================="
    );


    // =====================================================
    // 18. 발송 데이터
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
            sendContent,

          useSmsFailover:
            true

        }

      ]

    };


    // =====================================================
    // 19. 알림톡 발송
    // =====================================================

    const sendUri =
      `/alimtalk/v2/services/${serviceId}/messages`;


    const sendResponse =
      await ncpRequest({

        method:
          "POST",

        uri:
          sendUri,

        accessKey,

        secretKey,

        body:
          bodyData

      });


    // =====================================================
    // 20. HTTP 오류
    // =====================================================

    if (
      !sendResponse.ok
    ) {

      console.error(
        "NCP 알림톡 발송 HTTP 오류:",
        {
          status:
            sendResponse.status,

          data:
            sendResponse.data
        }
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
    // 21. NCP 응답
    // =====================================================

    console.log(
      "NCP 알림톡 발송 결과:",
      JSON.stringify(
        sendResponse.data,
        null,
        2
      )
    );


    // =====================================================
    // 22. 메시지 결과
    // =====================================================

    const result =
      sendResponse.data || {};

    const messages =
      Array.isArray(
        result.messages
      )
        ? result.messages
        : [];

    const firstMessage =
      messages[0] || null;


    // =====================================================
    // 23. 요청 상태 확인
    // =====================================================

    if (
      firstMessage &&
      firstMessage.requestStatusCode &&
      firstMessage.requestStatusCode !==
        "A000"
    ) {

      console.error(
        "알림톡 요청 실패:",
        firstMessage
      );

      return jsonResponse(
        500,
        {
          success: false,

          error:
            firstMessage.requestStatusDesc ||
            "알림톡 요청에 실패했습니다.",

          requestStatusCode:
            firstMessage.requestStatusCode,

          messageId:
            firstMessage.messageId ||
            null

        }
      );

    }


    // =====================================================
    // 24. 성공
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
          firstMessage?.messageId ||
          null,

        requestStatusCode:
          firstMessage?.requestStatusCode ||
          null

      }
    );


  } catch (error) {

    console.error(
      "send-alimtalk 서버 오류:",
      error
    );

    return jsonResponse(
      500,
      {

        success:
          false,

        error:
          error.message ||
          "서버 오류가 발생했습니다."

      }
    );

  }

};