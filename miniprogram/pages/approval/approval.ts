// pages/approval/approval.ts

// @ts-ignore
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {store} from "../../utils/MobX";
import {EMPTY_JWT, loginStoreUtil} from "../../utils/LoginStoreUtil";
import TrivialInstance = WechatMiniprogram.App.TrivialInstance;

const util = require('../../utils/CommonUtil');

interface IData {
    EMPTY_JWT: string
    scrollHeightPx: number
    safeMarginBottomPx: number
}

Page<IData, TrivialInstance>({
    data: {
        EMPTY_JWT: EMPTY_JWT
    }, async onLoad() {
        this.storeBindings = createStoreBindings(this, {
            store, fields: [...loginStoreUtil.storeBinding.fields], actions: [...loginStoreUtil.storeBinding.actions]
        });
        this.getTabBar().init();
        const scrollHeightPx = util.getHeightPx()
        this.setData({
            scrollHeightPx: scrollHeightPx - util.rpx2px(80), safeMarginBottomPx: util.getSafeAreaBottomPx()
        })
        await loginStoreUtil.initLoginStore(this)
    }, onUnload() {
        this.storeBindings.destoryLoginStore(this)
    }, login() {
        wx.navigateTo({
            url: '/pages/login/login',
        })
    }
})