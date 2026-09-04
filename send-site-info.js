"use strict";
const crypto = require("crypto");
const TEMPLATE_CODE = "landinglinkv1";
const SITE_NAME = "더파크 비스타동원";
const CONTACT_NUMBER = "1551-9708";
const SITE_URL = "intoindesign.co.kr/1551-9708";
const TEMPLATE_VALUES = {
  siteName: SITE_NAME,
  contactNumber: CONTACT_NUMBER,
  siteUrl: SITE_URL
};
function replaceTemplateVariables(value) {
  return String(value || "").replace(
    /#\{(siteName|contactNumber|siteUrl)\}/g,
    (_, key) => TEMPLATE_VALUES[key]
  );
}
function jsonResponse(statusCode, data) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(data)
  };
}
function makeSignature(method, uri, timestamp, accessKey, secretKey) {
  return crypto
    .createHmac("sha256", secretKey)
    .update(`${method} ${uri}\n${timestamp}\n${accessKey}`)
    .digest("base64");
}
async function ncpRequest({ method, uri, accessKey, secretKey, body }) {
  const timestamp = Date.now().toString();
  const response = await fetch(`https://sens.apigw.ntruss.com${uri}`, {
    method,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "x-ncp-apigw-timestamp": timestamp,
      "x-ncp-iam-access-key": accessKey,
      "x-ncp-apigw-signature-v2": makeSignature(
        method,
        uri,
        timestamp,
        accessKey,
        secretKey
      )
    },
    ...(method === "GET" ? {} : { body: JSON.stringify(body) })
  });
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  return { ok: response.ok, status: response.status, data };
}
exports.handler = async function (event) {
  try {
    if (event.httpMethod !== "POST") {
      return jsonResponse(405, { success: false, error: "Method Not Allowed" });
    }
    const serviceId = process.env.NCP_BIZ_SERVICE_ID;
    const accessKey = process.env.NCP_ACCESS_KEY;
    const secretKey = process.env.NCP_SECRET_KEY;
    const plusFriendId = process.env.NCP_PLUS_FRIEND_ID;
    if (!serviceId || !accessKey || !secretKey || !plusFriendId) {
      return jsonResponse(500, {
        success: false,
        error: "서버 환경설정이 완료되지 않았습니다."
      });
    }
    let requestData;
    try {
      requestData = JSON.parse(event.body || "{}");
    } catch {
      return jsonResponse(400, {
        success: false,
        error: "잘못된 요청 형식입니다."
      });
    }
    const cleanPhone = String(requestData.phone || "").replace(/\D/g, "");
    if (!/^01[016789]\d{7,8}$/.test(cleanPhone)) {
      return jsonResponse(400, {
        success: false,
        error: "올바른 휴대폰 번호가 아닙니다."
      });
    }
    const templateUri =
      `/alimtalk/v2/services/${serviceId}/templates` +
      `?channelId=${encodeURIComponent(plusFriendId)}` +
      `&templateCode=${encodeURIComponent(TEMPLATE_CODE)}`;
    const templateResponse = await ncpRequest({
      method: "GET",
      uri: templateUri,
      accessKey,
      secretKey
    });
    if (!templateResponse.ok) {
      console.error("찜하기 템플릿 조회 오류:", templateResponse.data);
      return jsonResponse(500, {
        success: false,
        error: "알림톡 템플릿 조회에 실패했습니다."
      });
    }
    const templateList = Array.isArray(templateResponse.data)
      ? templateResponse.data
      : [];
    const templateData = templateList.find(
      item => String(item.templateCode) === TEMPLATE_CODE
    );
    if (!templateData) {
      return jsonResponse(500, {
        success: false,
        error: `알림톡 템플릿 ${TEMPLATE_CODE}을(를) 찾을 수 없습니다.`
      });
    }
    if (
      templateData.templateInspectionStatus &&
      templateData.templateInspectionStatus !== "COMPLETE"
    ) {
      return jsonResponse(500, {
        success: false,
        error: "카톡 찜하기 템플릿이 아직 승인되지 않았습니다.",
        templateInspectionStatus: templateData.templateInspectionStatus
      });
    }
    const registeredContent = String(templateData.content || "").trim();
    if (!registeredContent) {
      return jsonResponse(500, {
        success: false,
        error: "알림톡 템플릿 본문이 없습니다."
      });
    }
    const messageContent = replaceTemplateVariables(registeredContent);
    if (/#\{[^}]+\}/.test(messageContent)) {
      return jsonResponse(500, {
        success: false,
        error: "알림톡 템플릿에 지원하지 않는 변수가 있습니다."
      });
    }
    const registeredButtons = Array.isArray(templateData.buttons)
      ? templateData.buttons
      : [];
    const messageButtons = registeredButtons.map(button => {
      const result = {
        type: button.type,
        name: replaceTemplateVariables(button.name).trim()
      };
      ["linkMobile", "linkPc", "schemeIos", "schemeAndroid"].forEach(key => {
        if (button[key]) result[key] = replaceTemplateVariables(button[key]).trim();
      });
      return result;
    });
    if (messageButtons.some(button =>
      Object.values(button).some(value => /#\{[^}]+\}/.test(String(value)))
    )) {
      return jsonResponse(500, {
        success: false,
        error: "알림톡 버튼에 치환되지 않은 변수가 있습니다."
      });
    }
    const sendUri = `/alimtalk/v2/services/${serviceId}/messages`;
    const sendResponse = await ncpRequest({
      method: "POST",
      uri: sendUri,
      accessKey,
      secretKey,
      body: {
        plusFriendId,
        templateCode: TEMPLATE_CODE,
        messages: [
          {
            countryCode: "82",
            to: cleanPhone,
            content: messageContent,
            ...(messageButtons.length ? { buttons: messageButtons } : {}),
            useSmsFailover: false
          }
        ]
      }
    });
    if (!sendResponse.ok) {
      console.error("찜하기 알림톡 발송 HTTP 오류:", {
        status: sendResponse.status,
        data: sendResponse.data
      });
      return jsonResponse(500, {
        success: false,
        error: "카톡 찜하기 전송에 실패했습니다."
      });
    }
    const result = sendResponse.data || {};
    const firstMessage = Array.isArray(result.messages)
      ? result.messages[0] || null
      : null;
    if (
      !firstMessage ||
      !firstMessage.messageId ||
      firstMessage.requestStatusCode !== "A000"
    ) {
      console.error("찜하기 알림톡 요청 실패:", result);
      return jsonResponse(500, {
        success: false,
        error:
          firstMessage?.requestStatusDesc ||
          "카톡 찜하기 발송 접수 결과를 확인하지 못했습니다.",
        requestStatusCode: firstMessage?.requestStatusCode || null,
        messageId: firstMessage?.messageId || null
      });
    }
    console.log("카톡 찜하기 발송 성공:", {
      requestId: result.requestId || null,
      messageId: firstMessage.messageId,
      requestStatusCode: firstMessage.requestStatusCode
    });
    return jsonResponse(200, {
      success: true,
      message: "홈페이지 링크를 카카오톡으로 보내드렸습니다.",
      requestId: result.requestId || null,
      messageId: firstMessage.messageId,
      requestStatusCode: firstMessage.requestStatusCode
    });
  } catch (error) {
    console.error("send-site-info 서버 오류:", error);
    return jsonResponse(500, {
      success: false,
      error: error.message || "서버 오류가 발생했습니다."
    });
  }
};
