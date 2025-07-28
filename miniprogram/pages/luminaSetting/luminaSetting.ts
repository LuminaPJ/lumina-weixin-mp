// pages/luminaSetting/luminaSetting.ts
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {store} from "../../utils/MobX";
import {EMPTY_JWT, loginStoreUtil, luminaLogout} from "../../utils/LoginStoreUtil";

const util = require('../../utils/CommonUtil');

interface IData {
    EMPTY_JWT: string
    scrollHeightPx: number
}

Page<IData, WechatMiniprogram.App.TrivialInstance>({
    data: {
        EMPTY_JWT: EMPTY_JWT
    }, async onLoad() {
        this.storeBindings = createStoreBindings(this, {
            store, fields: [...loginStoreUtil.storeBinding.fields], actions: [...loginStoreUtil.storeBinding.actions]
        });
        this.setData({
            scrollHeightPx: util.getHeightPx(),
            safeAreaBottomPx: util.getSafeAreaBottomPx(),
        })
        await loginStoreUtil.initLoginStore(this)
    }, onUnload() {
        this.storeBindings.destroyStoreBindings();
    }, async logout() {
        await luminaLogout(this)
        wx.navigateBack()
    }
})

