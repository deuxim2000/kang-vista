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
// NCP SENS Signature
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
// NCP SENS API 호출
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


  // GET은 body를 보내지 않음
  if (method !== "GET") {

    options.body =
      JSON.stringify(body);

  }


  const response =
    await fetch(
      url,
      options
    );


  const responseText =
    await response.text();


  let result;

  try {

    result =
      JSON.parse(
        responseText
      );

  } catch {

    result = {
      raw:
        responseText
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
// 메인 함수
// =========================================================

exports.handler = async function (event) {

  try {

    // =======================================================
    // 1. POST만 허용
    // =======================================================

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


    // =======================================================
    // 2. 환경변수
    // =======================================================

    const serviceId =
      process.env.NCP_BIZ_SERVICE_ID;

    const accessKey =
      process.env.NCP_ACCESS_KEY;

    const secretKey =
      process.env.NCP_SECRET_KEY;

    const plusFriendId =
      process.env.NCP_PLUS_FRIEND_ID;

    // 템플릿 코드는 dPdir1
    const templateCode =
      "dPdir1";

    const adminPhone =
      process.env.ADMIN_PHONE;


    // =======================================================
    // 3. 환경변수 확인
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


    // =======================================================
    // 4. 요청 JSON 파싱
    // =======================================================

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


    // =======================================================
    // 5. 입력값
    // =======================================================

    const {
      name,
      phone,
      consultDate,
      consultTime
    } = data;


    // =======================================================
    // 6. 필수값
    // =======================================================

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


    // =======================================================
    // 7. 데이터 정리
    // =======================================================

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


    // =======================================================
    // 8. 이름 검증
    // =======================================================

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


    // =======================================================
    // 9. 고객 전화번호 검증
    // =======================================================

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


    // =======================================================
    // 10. 날짜 검증
    // =======================================================

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


    // =======================================================
    // 11. 실제 존재하는 날짜인지 확인
    // =======================================================

    const [
      year,
      month,
      day
    ] =
      cleanDate
        .split("-")
        .map(Number);


    const checkDate =
      new Date(
        year,
        month - 1,
        day
      );


    if (
      checkDate.getFullYear() !== year ||
      checkDate.getMonth() !== month - 1 ||
      checkDate.getDate() !== day
    ) {

      return jsonResponse(
        400,
        {
          success: false,
          error:
            "존재하지 않는 날짜입니다."
        }
      );

    }


    // =======================================================
    // 12. 방문시간
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


    // =======================================================
    // 13. 관리자 전화번호
    // =======================================================

    if (
      !/^01[016789]\d{7,8}$/
        .test(cleanAdminPhone)
    ) {

      console.error(
        "ADMIN_PHONE 형식 오류"
      );

      return jsonResponse(
        500,
        {
          success: false,
          error:
            "관리자 전화번호 설정이 올바르지 않습니다."
        }
      );

    }


    // =======================================================
    // 14. ★ NCP 템플릿 조회
    //
    // dPdir1의 실제 승인 템플릿을 NCP에서 가져옵니다.
    // =======================================================

    const templateUri =
      `/alimtalk/v2/services/${serviceId}/templates` +
      `?channelId=${encodeURIComponent(plusFriendId)}` +
      `&templateCode=${encodeURIComponent(templateCode)}`;


    console.log(
      "NCP 템플릿 조회 시작:",
      {
        templateCode,
        channelId:
          plusFriendId
      }
    );


    const templateResponse =
      await ncpRequest({

        method:
          "GET",

        uri:
          templateUri,

        accessKey,

        secretKey

      });


    // =======================================================
    // 15. 템플릿 조회 API 오류
    // =======================================================

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


    // =======================================================
    // 16. ★ 중요
    //
    // NCP 템플릿 조회 응답은 배열입니다.
    // =======================================================

    const templateList =
      Array.isArray(
        templateResponse.data
      )
        ? templateResponse.data
        : [];


    console.log(
      "NCP 템플릿 조회 결과:",
      JSON.stringify(
        templateList,
        null,
        2
      )
    );


    // =======================================================
    // 17. dPdir1 찾기
    // =======================================================

    const templateData =
      templateList.find(
        item =>
          String(
            item.templateCode
          ) === templateCode
      );


    if (!templateData) {

      console.error(
        "dPdir1 템플릿을 찾지 못했습니다.",
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
            `알림톡 템플릿 ${templateCode}을(를) 찾을 수 없습니다.`,
          detail:
            templateList
        }
      );

    }


    // =======================================================
    // 18. 템플릿 정보
    // =======================================================

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


    // =======================================================
    // 19. 템플릿 상태 확인
    // =======================================================

    if (
      templateData.templateStatus &&
      templateData.templateStatus !==
        "ACTIVE"
    ) {

      console.error(
        "템플릿이 ACTIVE 상태가 아닙니다:",
        templateData.templateStatus
      );

      return jsonResponse(
        500,
        {
          success: false,
          error:
            "알림톡 템플릿이 활성 상태가 아닙니다.",
          templateStatus:
            templateData.templateStatus,
          templateInspectionStatus:
            templateData.templateInspectionStatus
        }
      );

    }


    // =======================================================
    // 20. 템플릿 본문
    // =======================================================

    const registeredContent =
      String(
        templateData.content || ""
      );


    if (!registeredContent) {

      console.error(
        "템플릿 content가 없습니다."
      );

      return jsonResponse(
        500,
        {
          success: false,
          error:
            "NCP 템플릿 본문을 가져오지 못했습니다."
        }
      );

    }


    // =======================================================
    // 21. ★ 템플릿 변수 치환
    // =======================================================

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


    // =======================================================
    // 22. 치환 확인
    // =======================================================

    const remainingVariables =
      sendContent.match(
        /#\{[^}]+\}/g
      );


    if (
      remainingVariables &&
      remainingVariables.length
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
            "알림톡 템플릿의 변수를 모두 치환하지 못했습니다.",
          variables:
            remainingVariables
        }
      );

    }


    // =======================================================
    // 23. ★ 최종 알림톡 내용
    // =======================================================

    console.log(
      "알림톡 최종 content:",
      sendContent
    );


    // =======================================================
    // 24. ★ SMS 대체발송 내용
    //
    // 알림톡 실패 시에도 실제 고객 정보가 들어가도록
    // 동일한 sendContent를 사용합니다.
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
            sendContent,

          useSmsFailover:
            true

        }

      ]

    };


    // =======================================================
    // 25. 알림톡 발송 요청
    // =======================================================

    const sendUri =
      `/alimtalk/v2/services/${serviceId}/messages`;


    console.log(
      "NCP 알림톡 발송 시작:",
      {
        templateCode,
        to:
          cleanAdminPhone
      }
    );


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


    // =======================================================
    // 26. HTTP 오류
    // =======================================================

    if (
      !sendResponse.ok
    ) {

      console.error(
        "NCP 알림톡 HTTP 오류:",
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


    // =======================================================
    // 27. NCP 발송 결과
    // =======================================================

    console.log(
      "NCP 알림톡 발송 결과:",
      JSON.stringify(
        sendResponse.data,
        null,
        2
      )
    );


    // =======================================================
    // 28. 메시지 결과 확인
    // =======================================================

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


    // =======================================================
    // 29. 요청 자체 실패
    // =======================================================

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

          requestStatusName:
            firstMessage.requestStatusName,

          messageId:
            firstMessage.messageId ||
            null

        }
      );

    }


    // =======================================================
    // 30. 성공
    // =======================================================

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

    // =======================================================
    // 31. 서버 오류
    // =======================================================

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