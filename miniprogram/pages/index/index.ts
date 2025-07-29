// index.ts

// @ts-ignore
import ActionSheet, {ActionSheetTheme} from 'tdesign-miniprogram/action-sheet/index';
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {store} from "../../utils/MobX";
import {EMPTY_JWT, loginStoreUtil} from "../../utils/LoginStoreUtil"

const util = require('../../utils/CommonUtil');

// 获取应用实例
const app = getApp()

interface IData {
    EMPTY_JWT: string
    scrollHeightPx: number
    safeMarginBottomPx: number
}

Page<IData, WechatMiniprogram.App.TrivialInstance>({
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
        this.storeBindings.destroyStoreBindings()
    }, onResize() {
        this.setData({
            safeMarginBottomPx: util.getSafeAreaBottomPx()
        })
    }, handleAddTaskClick() {
        ActionSheet.show({
            theme: ActionSheetTheme.Grid, selector: '#t-action-sheet', context: this, items: addTaskGrid,
        });
    }, login() {
        wx.navigateTo({
            url: '/pages/login/login',
        })
    }
})

/**
 * 点击首页浮动按钮的弹出菜单
 */
const addTaskGrid = [{
    label: '加入新团体', icon: 'usergroup-add',
}, {
    label: '新建日程', icon: 'task-add',
}, {
    label: '刷新', icon: 'refresh',
},];