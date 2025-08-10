import {LUMINA_SERVER_HOST} from "../../env";
import {isLogin} from "./LoginStoreUtil";

export const approvalStoreUtil = {
    checkApprovalStatus: async function (that: WechatMiniprogram.App.TrivialInstance) {
        const jwt = that.getJWT();
        if (isLogin(jwt)) await getApprovalInfo(that, that.getJWT())
    }, storeBinding: {
        fields: ['approvalInfo', 'selfApprovalInfo'],
        actions: ['setApprovalInfo', 'getApprovalInfo', 'setSelfApprovalInfo', 'getSelfApprovalInfo']
    }
}

export const getApprovalInfo = async (that: WechatMiniprogram.App.TrivialInstance, jwt: string): Promise<void> => {
    const approvalInfo = await getApprovalInfoPromise(jwt);
    const selfApprovalInfo = await getSelfApprovalInfoPromise(jwt);
    that.setApprovalInfo(approvalInfo);
    that.setSelfApprovalInfo(selfApprovalInfo);
}

export interface ApprovalInfo {
    approvalId: number,
    createdAt: string,
    approvalType: string,
    status: string,
    comment: string | null,
    reviewer: string | null,
    reviewerName: string | null,
    reviewedAt: string | null,
}

async function getApprovalInfoPromise(jwt: string): Promise<ApprovalInfo[]> {
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'https://' + LUMINA_SERVER_HOST + '/approval/admin', header: {
                Authorization: 'Bearer ' + jwt
            }, success: (res) => {
                resolve(res.data as ApprovalInfo[]);
            }, fail: reject
        })
    })
}

async function getSelfApprovalInfoPromise(jwt: string): Promise<ApprovalInfo[]> {
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'https://' + LUMINA_SERVER_HOST + '/approval/self', header: {
                Authorization: 'Bearer ' + jwt
            }, success: (res) => {
                resolve(res.data as ApprovalInfo[]);
            }, fail: reject
        })
    })
}
