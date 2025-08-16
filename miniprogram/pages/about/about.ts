// pages/about/about.ts

// @ts-ignore
import {copyUtil} from "../../utils/CommonUtil";
import {ICP_ID, MINI_PROGRAM_NAME, ORGANIZATION_NAME, PRIVACY_POLICY_URL, USER_AGREEMENT_URL} from '../../env';
import Message from 'tdesign-miniprogram/message/index';

const app = getApp();
const util = require("../../utils/CommonUtil");


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
            icpInfo: ICP_ID,
            orgName: ORGANIZATION_NAME,
            mpName: MINI_PROGRAM_NAME
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
    }, closeFeedbackPopup() {
        this.setData({
            feedbackPopupVisible: false
        })
    }, ossLicense() {
        wx.navigateTo({
            url: '/pages/oss-licenses/menu/oss-licenses-menu',
        })
    }, dataStatementPopupVisibleChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            dataStatementPopupVisible: e.detail.visible
        })
    }, closeDataStatementPopup() {
        this.setData({
            dataStatementPopupVisible: false
        })
    }, openDataStatementPopup() {
        this.setData({
            dataStatementPopupVisible: true
        })
    }, luminaOpenSource() {
        copyUtil('https://github.com/LuminaPJ/lumina-weixin-mp', Message, this)
    }
})