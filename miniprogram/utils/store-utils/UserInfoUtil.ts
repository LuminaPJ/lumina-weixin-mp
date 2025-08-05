import {LUMINA_SERVER_HOST} from "../../env";
import {isLogin} from "./LoginStoreUtil";

export const userInfoStoreUtil = {
    checkUserInfoStatus: async function (that: WechatMiniprogram.App.TrivialInstance) {
        const jwt = that.getJWT();
        if (isLogin(jwt)) await getUserInfo(that, that.getJWT())
    }, storeBinding: {
        fields: ['userInfo'],
        actions: ['setUserInfo', 'getUserInfo']
    }
}

export const getUserInfo = async (that: WechatMiniprogram.App.TrivialInstance, jwt: string): Promise<void> => {
    const userInfo:UserInfo = await getUserInfoPromise(jwt);
    that.setUserInfo(userInfo);
}


interface UserInfo {
    userId: string,
    userName: string | null
}

/**
 * 获取用户信息
 * @param jwt JSON Web Token
 */
async function getUserInfoPromise(jwt:string): Promise<UserInfo> {
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'https://' + LUMINA_SERVER_HOST + '/group', header: {
                Authorization: 'Bearer ' + jwt
            }, success: (res) => {
                const resData = res.data as UserInfo;
                resolve(resData);
            }, fail: reject
        })
    })
}
