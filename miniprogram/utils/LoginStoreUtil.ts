import {getWeixinStorageSyncWithDefault, getWeixinStorageWithDefault} from './WeixinStorageUtil';
import {isNullOrEmptyOrUndefined} from "./CommonUtil";

const env = require("../envInfo");

export const EMPTY_JWT = 'Empty JSON Web Token'

export const loginStoreUtil = {
    initLoginStore: async function (that: WechatMiniprogram.App.TrivialInstance) {
        await this.checkLoginStatus(that);
    }, checkLoginStatus: async function (that: WechatMiniprogram.App.TrivialInstance) {
        if (!that.getIsLoginStateChecked()) {
            const isCancellationStateFromWeixinStorage: boolean = getWeixinStorageSyncWithDefault<boolean>('isCancellationState', true)
            that.setIsCancellationState(isCancellationStateFromWeixinStorage)
            if (isCancellationStateFromWeixinStorage) that.setIsLoginStateChecked(true); else {
                const jwtFromWeixinStorage: string = await getWeixinStorageWithDefault<string>('JWT', EMPTY_JWT, true);
                const isSoterEnabledFromWeixinStorage: boolean = getWeixinStorageSyncWithDefault<boolean>('isSoterEnabled', false)
                try {
                    if (jwtFromWeixinStorage !== EMPTY_JWT) {
                        await validateJwtPromise(jwtFromWeixinStorage);
                        that.setJWT(jwtFromWeixinStorage)
                        that.setIsSoterEnabled(isSoterEnabledFromWeixinStorage)
                    } else await luminaLogin(that);
                } catch (_) {
                    try {
                        await luminaLogin(that);
                    } catch (e) {
                        // TODO: 等待公共报错组件完成
                    }
                }
            }
        }
    }, storeBinding: {
        fields: ['isLoginStateChecked', 'jwt', 'isCancellationState', 'isSoterEnabled'],
        actions: ['setIsLoginStateChecked', 'getIsLoginStateChecked', 'setJWT', 'getJWT', 'setIsCancellationState', 'getIsCancellationState', 'setIsSoterEnabled', 'getIsSoterEnabled']
    }
}

export const luminaLogin = async (that: WechatMiniprogram.App.TrivialInstance): Promise<void> => {
    const jwt = await luminaLoginRequestPromise();
    if (!isNullOrEmptyOrUndefined(jwt)) {
        that.setJWT(jwt);
        await wx.setStorage({key: 'JWT', data: jwt, encrypt: true})
        await wx.setStorage({key: 'isCancellationState', data: false})
    }
}

export const luminaLogout = async (that: WechatMiniprogram.App.TrivialInstance): Promise<void> => {
    await wx.setStorage({key: 'JWT', data: EMPTY_JWT, encrypt: true})
    await wx.setStorage({key: 'isCancellationState', data: true})
    that.setJWT(EMPTY_JWT);
    that.setIsCancellationState(true);
}

/**
 * 获取微信小程序登录 code
 */
async function weixinLoginPromise(): Promise<string> {
    return new Promise((resolve, reject) => {
        wx.login({
            success: (res) => {
                if (res.code) resolve(res.code); else reject(new Error('获取登录 code 失败'));
            }, fail: (err) => {
                reject(err);
            }
        });
    });
}

/**
 * 与服务端通信获取 JWT
 */
async function luminaLoginRequestPromise(): Promise<string> {
    const weixinLoginCode = await weixinLoginPromise();
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'https://' + env.LUMINA_SERVER_HOST + '/weixin/login',
            method: 'POST',
            data: JSON.stringify({code: weixinLoginCode}),
            success: (res) => {
                if (typeof res.data === 'string') {
                    const responseData = JSON.parse(res.data);
                    if (responseData && typeof responseData === 'object' && 'jwt' in responseData) {
                        resolve(responseData.jwt);
                    } else reject(new Error('服务端未返回 JWT'));
                } else if ('jwt' in res.data) resolve(res.data.jwt); else reject(new Error('服务端未返回 JWT'));
            },
            fail: (err) => {
                reject(err);
            }
        })
    })
}

/**
 * 验证 JWT 有效性
 */
async function validateJwtPromise(jwt: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'https://' + env.LUMINA_SERVER_HOST + '/weixin/validate', header: {
                Authorization: 'Bearer ' + jwt
            }, success: (res) => {
                if (res.statusCode === 200) resolve(true); else resolve(false);
            }, fail: (err) => {
                reject(err);
            }
        })
    })
}
