// pages/login/login.ts

// @ts-ignore
import {loginStoreUtil, luminaLogin} from "../../utils/store-utils/LoginStoreUtil";
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {store} from "../../utils/MobX";
import {ICP_NUMBER, PRIVACY_POLICY_URL, USER_AGREEMENT_URL} from "../../env";
import {checkIsSupportSoter} from "../../utils/security/SoterUtil";
import {getErrorMessage} from "../../utils/CommonUtil";

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
            wx.navigateBack()
        } catch (e: any) {
            this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            })
        } finally {
            this.setData({
                isLogining: false,
            })
        }
    }, errorVisibleChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            errorVisible: e.detail.visible
        })
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