// pages/login/login.ts

// @ts-ignore
import {loginStoreUtil, luminaLogin} from "../../utils/LoginStoreUtil";
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {store} from "../../utils/MobX";

const util = require("../../utils/CommonUtil");
const envInfo = require("../../envInfo");

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
}

Page<IData, WechatMiniprogram.App.TrivialInstance>({
    // @ts-ignore
    data: {
        footerLink: [{
            name: '用户协议', url: envInfo.USER_AGREEMENT_URL, openType: '',
        }, {
            name: '隐私政策', url: envInfo.PRIVACY_POLICY_URL, openType: '',
        }], isLogining: false,
    }, async onLoad() {
        this.storeBindings = createStoreBindings(this, {
            store, fields: [...loginStoreUtil.storeBinding.fields], actions: [...loginStoreUtil.storeBinding.actions]
        });
        this.setData({
            safeMarginBottomPx: util.getSafeAreaBottomPx(),
            scrollHeightPx: util.getHeightPx(),
            safeAreaBottomPx: util.getSafeAreaBottomPx(),
            theme: wx.getAppBaseInfo().theme || 'light',
            icpInfo: envInfo.ICP_NUMBER,
        })
        await loginStoreUtil.initLoginStore(this)
    }, onUnload(){
        this.storeBindings.destroyStoreBindings();
    },async login() {
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
    }
})