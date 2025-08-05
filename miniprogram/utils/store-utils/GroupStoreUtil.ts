import {LUMINA_SERVER_HOST} from "../../env";
import {isLogin} from "./LoginStoreUtil";

export const groupStoreUtil = {
    checkGroupStatus: async function (that: WechatMiniprogram.App.TrivialInstance) {
        const jwt = that.getJWT();
        if (isLogin(jwt)) await getGroupList(that, that.getJWT())
    }, storeBinding: {
        fields: ['groupInfo'],
        actions: ['setGroupInfo', 'getGroupInfo']
    }
}

export interface GroupInfo {
    groupId: string,
    groupName: string | null,
    permission: string
}

export async function getGroupList(that: WechatMiniprogram.App.TrivialInstance, jwt: string): Promise<void> {
    let groupList = await getGroupListPromise(jwt);
    that.setGroupInfo(groupList)
}

export const isJoinedAnyGroup = (that: WechatMiniprogram.App.TrivialInstance): boolean =>{
    return that.getGroupInfo().length > 0;
}

async function getGroupListPromise(jwt: string): Promise<GroupInfo[]> {
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'https://' + LUMINA_SERVER_HOST + '/group', header: {
                Authorization: 'Bearer ' + jwt
            }, success: (res) => {
                resolve(res.data as GroupInfo[]);
            }, fail: reject
        })
    })
}