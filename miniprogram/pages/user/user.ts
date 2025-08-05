// pages/user/user.ts
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {store} from "../../utils/MobX";
import {EMPTY_JWT, loginStoreUtil} from "../../utils/store-utils/LoginStoreUtil";

const util = require('../../utils/CommonUtil');

interface IData {
    EMPTY_JWT: string
    scrollHeightPx: number
    isRefreshing: boolean
}

Page<IData, WechatMiniprogram.App.TrivialInstance>({
    data: {
        EMPTY_JWT: EMPTY_JWT, isRefreshing: true
    }, async onLoad() {
        this.storeBindings = createStoreBindings(this, {
            store, fields: [...loginStoreUtil.storeBinding.fields], actions: [...loginStoreUtil.storeBinding.actions]
        });
        this.getTabBar().init();
        const scrollHeightPx = util.getHeightPx()
        this.setData({
            scrollHeightPx: scrollHeightPx - util.rpx2px(80), isRefreshing: true
        })
        try {
            await loginStoreUtil.initLoginStore(this)
        } catch (e) {
            this.setData({
                errorMessage: e.message, errorVisible: true
            })
        } finally {
            this.setData({
                isRefreshing: false
            })
        }
    }, onUnload() {
        this.storeBindings.destroyStoreBindings();
    },errorVisibleChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            errorVisible: e.detail.visible
        })
    }, clickAbout() {
        wx.navigateTo({
            url: '/pages/about/about'
        })
    }, clickSetting() {
        wx.navigateTo({
            url: '/pages/subpages/lumina-setting/lumina-setting',
        })
    }, login() {
        wx.navigateTo({
            url: '/pages/login/login',
        })
    }, async onRefresh() {
        this.setData({
            isRefreshing: true
        });
        // TODO: 用户信息和团体列表刷新
        this.setData({
            isRefreshing: false
        });
    },
})

