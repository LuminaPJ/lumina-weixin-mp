import {LUMINA_SERVER_HOST} from "../../env";
import {JoinGroupApprovalInfo} from "./ApprovalStoreUtil";
import {ErrorResponse} from "../CommonUtil";

export const taskStoreUtil = {
    checkTaskStatus: async function (that: WechatMiniprogram.App.TrivialInstance) {
        await getTaskList(that, that.getJWT());
    }, storeBinding: {
        fields: ['taskInfo'], actions: ['setTaskInfo', 'getTaskInfo']
    }
}

export interface TaskInfo {
    taskId: string,
    groupId: string,
    taskName: string,
    taskType: string,
    description: string | null,
    endTime: string,
    status: string,
    createdAt: string,
    creatorId: string,
    creatorName: string | null
}

export async function getTaskList(that: WechatMiniprogram.App.TrivialInstance, jwt: string): Promise<void> {
    const taskList = await getTaskListPromise(jwt);
    taskList.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    that.setTaskInfo(taskList)
}

async function getTaskListPromise(jwt: string): Promise<TaskInfo[]> {
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'https://' + LUMINA_SERVER_HOST + '/task', header: {
                Authorization: 'Bearer ' + jwt
            }, success: (res) => {
                resolve(res.data as TaskInfo[]);
            }, fail: reject
        })
    })
}

export interface CheckInTaskInfo{
    taskId: string,
    groupId: string,
    groupName: string| null,
    taskName: string,
    checkInType: string,
    description: string | null,
    endTime: string,
    status: string,
    createdAt: string,
    creatorId: string,
    creatorName: string | null
}

export async function getCheckInTaskInfoPromise(jwt: string, taskId: string): Promise<CheckInTaskInfo | null> {
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'https://' + LUMINA_SERVER_HOST + '/task/checkIn/'+taskId, header: {
                Authorization: 'Bearer ' + jwt
            },success: (res) => {
                if (res.statusCode === 200) {
                    const resData = res.data as CheckInTaskInfo
                    resolve(resData);
                } else {
                    const resData = res.data as ErrorResponse;
                    reject(new Error(resData.message))
                }
            }, fail: reject
        })
    })
}

export const CHECK_IN = "CHECK_IN"
export const LOTTERY = "LOTTERY"
export const VOTE = "VOTE"

export const WHITELIST = "WHITELIST"
export const BLACKLIST = "BLACKLIST"

export const TOKEN_CHECK_IN = "TOKEN"
export const ORDINARY_CHECK_IN = "ORDINARY"