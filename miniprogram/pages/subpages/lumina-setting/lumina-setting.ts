// pages/lumina-setting/lumina-setting.ts
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {store} from "../../../utils/MobX";
import Message from 'tdesign-miniprogram/message/index';
import {
    EMPTY_JWT,
    getIsUserSoterEnabled,
    isLogin,
    loginStoreUtil,
    luminaLogout
} from "../../../utils/store-utils/LoginStoreUtil";
import {ErrorResponse, getErrorMessage, getHeightPx, getSafeAreaBottomPx} from '../../../utils/CommonUtil';
import {groupStoreUtil} from "../../../utils/store-utils/GroupStoreUtil";
import {userInfoStoreUtil} from "../../../utils/store-utils/UserInfoUtil";
import {checkIsSoterEnrolledInDevice, checkIsSupportSoter, luminaStartSoter} from "../../../utils/security/SoterUtil";
import {LUMINA_SERVER_HOST} from "../../../env";

interface IData {
    EMPTY_JWT: string
    scrollHeightPx: number
    isLoading: boolean
    isSoterLoading: boolean
    soterHelpPopupVisible: boolean
}

Page<IData, WechatMiniprogram.App.TrivialInstance>({
    data: {
        EMPTY_JWT: EMPTY_JWT, isLoading: true, isSoterLoading: false, soterHelpPopupVisible: false,
    }, async onLoad() {
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: [...loginStoreUtil.storeBinding.fields, ...groupStoreUtil.storeBinding.fields, ...userInfoStoreUtil.storeBinding.fields],
            actions: [...loginStoreUtil.storeBinding.actions, ...groupStoreUtil.storeBinding.actions, ...userInfoStoreUtil.storeBinding.actions]
        });
        this.setData({
            scrollHeightPx: getHeightPx(), safeAreaBottomPx: getSafeAreaBottomPx(), isLoading: true
        })
        try {
            await loginStoreUtil.initLoginStore(this)
            if (isLogin(this.getJWT())) {
                await userInfoStoreUtil.checkUserInfoStatus(this)
                await groupStoreUtil.checkGroupStatus(this)
            }
            if (this.getGroupInfo().length > 0) await getIsUserSoterEnabled(this)
        } catch (e: any) {
            this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            })
        } finally {
            this.setData({
                isLoading: false,
            })
        }
    }, onUnload() {
        this.storeBindings.destroyStoreBindings();
    }, async logout() {
        await luminaLogout(this)
        wx.navigateBack()
    }, errorVisibleChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            errorVisible: e.detail.visible
        })
    }, soterHelpPopupVisibleChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            soterHelpPopupVisible: e.detail.visible
        })
    }, closeSoterHelpPopup() {
        this.setData({
            soterHelpPopupVisible: false
        })
    }, async switchSoter(e: WechatMiniprogram.CustomEvent) {
        try {
            const supportMode = await checkIsSoterEnrolledInDevice(await checkIsSupportSoter())
            if (supportMode.length > 0) {
                if (e.detail.value) this.setData({
                    soterHelpPopupVisible: true
                }); else startSwitchSoter(this, e.detail.value)
            } else this.setData({
                errorMessage: "此设备不支持 SOTER 生物认证，或用户未在设备中录入任何生物特征", errorVisible: true
            });
        } catch (e: any) {
            this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            });
        }
    }, async continueSoter() {
        this.closeSoterHelpPopup()
        setTimeout(async () => {
            await startSwitchSoter(this, true)
        }, 300)
    }
})

async function startSwitchSoter(that: WechatMiniprogram.App.TrivialInstance, actionBoolean: boolean) {
    that.setData({
        isSoterLoading: true
    })
    try {
        const soterResult = await luminaStartSoter(actionBoolean ? "开启 SOTER" : "关闭 SOTER")
        if (soterResult === null) that.setData({
            errorMessage: "此设备不支持 SOTER 生物认证，或用户未在设备中录入任何生物特征", errorVisible: true
        }); else {
            const switchSoterResult = await switchSoterRequest(that.getJWT(), actionBoolean, soterResult)
            if (switchSoterResult.statusCode === 200) that.setIsSoterEnabled(actionBoolean)
        }
    } catch (e: any) {
        const errMsg = getErrorMessage(e)
        if (errMsg === "用户手动取消 SOTER 生物认证") Message.success({
            context: that,
            offset: [90, 32],
            duration: 3000,
            icon: false,
            single: false,
            content: errMsg,
            align: 'center'
        }); else that.setData({
            errorMessage: getErrorMessage(e), errorVisible: true
        });
    } finally {
        that.setData({
            isSoterLoading: false,
        });
    }
}

async function switchSoterRequest(jwt: string, action: boolean, soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult): Promise<WechatMiniprogram.RequestSuccessCallbackResult> {
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'https://' + LUMINA_SERVER_HOST + '/soter/action', header: {
                Authorization: 'Bearer ' + jwt
            }, method: 'POST', data: JSON.stringify({
                action: action ? 'enable' : 'disable', soterInfo: {
                    json_string: soterResult.resultJSON, json_signature: soterResult.resultJSONSignature,
                }
            }), success: function (res) {
                if (res.statusCode === 200) resolve(res); else {
                    const resData = res.data as ErrorResponse;
                    reject(new Error(resData.message))
                }
            }, fail: reject
        })
    })
}

