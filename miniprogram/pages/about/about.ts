// pages/about/about.ts

// @ts-ignore
const util = require("../../utils/CommonUtil");
import {ICP_NUMBER, PRIVACY_POLICY_URL, USER_AGREEMENT_URL} from '../../envInfo';

const app = getApp()

Page({
    data: {
        footerLink: [{
            name: '用户协议', url: USER_AGREEMENT_URL, openType: '',
        }, {
            name: '隐私政策', url: PRIVACY_POLICY_URL, openType: '',
        }]
    }, onLoad() {
        const accountInfo = wx.getAccountInfoSync();
        this.setData({
            scrollHeightPx: util.getHeightPx(),
            safeAreaBottomPx: util.getSafeAreaBottomPx(),
            theme: wx.getAppBaseInfo().theme || 'light',
            luminaVersion: `${app.globalData.LUMINA_VERSION} (${accountInfo.miniProgram.envVersion})`,
            icpInfo: ICP_NUMBER,
        })
    }, onResize() {
        this.setData({
            scrollHeightPx: util.getHeightPx(), safeAreaBottomPx: util.getSafeAreaBottomPx(),
        })
    }, feedbackPopup() {
        this.setData({
            feedbackPopupVisible: true
        })
    }, onFeedbackPopupVisibleChange(e: any) {
        this.setData({
            feedbackPopupVisible: e.detail.visible
        })
    }, ossLicense() {
        wx.navigateTo({
            url: '/pages/oss-licenses-menu/oss-licenses-menu',
        })
    }
})