// pages/login/login.ts

// @ts-ignore
import {loginStoreUtil, luminaLogin} from "../../utils/LoginStoreUtil";
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {store} from "../../utils/MobX";
import {ICP_NUMBER, PRIVACY_POLICY_URL, USER_AGREEMENT_URL} from "../../env";
import {checkIsSupportSoter} from "../../utils/SoterUtil";

const util = require("../../utils/CommonUtil");

interface IData {
    safeMarginBottomPx: number;
    scrollHeightPx: number;
    safeAreaBottomPx: number;
    theme: string;
    icpInfo: string;
    footerLink: {
        name: string; url: string; openType: string;
    }[];
    isLogining: boolean;
    soterHelpPopupVisible: boolean;
}

Page<IData, WechatMiniprogram.App.TrivialInstance>({
    // @ts-ignore
    data: {
        footerLink: [{
            name: '用户协议', url: USER_AGREEMENT_URL, openType: '',
        }, {
            name: '隐私政策', url: PRIVACY_POLICY_URL, openType: '',
        }], isLogining: false, soterHelpPopupVisible: false,
    }, async onLoad() {
        this.storeBindings = createStoreBindings(this, {
            store, fields: [...loginStoreUtil.storeBinding.fields], actions: [...loginStoreUtil.storeBinding.actions]
        });
        this.setData({
            safeMarginBottomPx: util.getSafeAreaBottomPx(),
            scrollHeightPx: util.getHeightPx(),
            safeAreaBottomPx: util.getSafeAreaBottomPx(),
            theme: wx.getAppBaseInfo().theme || 'light',
            icpInfo: ICP_NUMBER,
            isSupportSoter: (await checkIsSupportSoter()).length > 0,
        })
        await loginStoreUtil.initLoginStore(this)
    }, onUnload() {
        this.storeBindings.destroyStoreBindings();
    }, async login() {
        try {
            this.setData({
                isLogining: true,
            })
            await luminaLogin(this);
            // TODO: Soter、名称团体等信息获取的处理
            wx.navigateBack()
        } catch (e) {
            // TODO: 等待公共报错组件完成
            console.log(e)
        } finally {
            this.setData({
                isLogining: false,
            })
        }
    }, openSoterHelpPopup() {
        this.setData({
            soterHelpPopupVisible: true,
        })
    }, closeSoterHelpPopup() {
        this.setData({
            soterHelpPopupVisible: false,
        })
    }, soterHelpPopupVisibleChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            soterHelpPopupVisible: e.detail.visible,
        })
    }
})