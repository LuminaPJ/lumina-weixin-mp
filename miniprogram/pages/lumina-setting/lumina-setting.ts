// pages/lumina-setting/lumina-setting.ts
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {store} from "../../utils/MobX";
import {EMPTY_JWT, loginStoreUtil, luminaLogout} from "../../utils/LoginStoreUtil";
import {getHeightPx, getSafeAreaBottomPx} from '../../utils/CommonUtil';

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
            scrollHeightPx: getHeightPx(), safeAreaBottomPx: getSafeAreaBottomPx(),
        })
        await loginStoreUtil.initLoginStore(this)
    }, onUnload() {
        this.storeBindings.destroyStoreBindings();
    }, async logout() {
        await luminaLogout(this)
        wx.navigateBack()
    },

    /*async soter() {
        console.log(await luminaStartSoter("test"))
    }, errorPopup() {
        this.setData({
            test: this.data.test+1,
            errorTestVisible: true
        })
    },errorVisibleChange(e:WechatMiniprogram.CustomEvent){
        this.setData({
            errorTestVisible: e.detail.visible
        })
    }*/
})

