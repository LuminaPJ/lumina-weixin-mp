// index.ts

// @ts-ignore
import ActionSheet, {ActionSheetTheme} from 'tdesign-miniprogram/action-sheet/index';
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {store} from "../../utils/MobX";
import {EMPTY_JWT, isLogin, loginStoreUtil} from "../../utils/store-utils/LoginStoreUtil"
import {getErrorMessage} from "../../utils/CommonUtil";
import {taskStoreUtil} from "../../utils/store-utils/TaskStoreUtil";

const util = require('../../utils/CommonUtil');

interface IData {
    EMPTY_JWT: string
    scrollHeightPx: number
    safeMarginBottomPx: number
    isRefreshing: boolean
}

Page<IData, WechatMiniprogram.App.TrivialInstance>({
    data: {
        EMPTY_JWT: EMPTY_JWT, isRefreshing: true
    }, async onLoad() {
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: ["isHideMore7DayEnabled", ...loginStoreUtil.storeBinding.fields, ...taskStoreUtil.storeBinding.fields],
            actions: ["setIsHideMore7DayEnabled", "getIsHideMore7DayEnabled", ...loginStoreUtil.storeBinding.actions, ...taskStoreUtil.storeBinding.actions]
        });
        this.getTabBar().init();
        this.setIsHideMore7DayEnabled(wx.getStorageSync('isHideMore7DayEnabled') ?? false)
        const scrollHeightPx = util.getHeightPx()
        this.setData({
            scrollHeightPx: scrollHeightPx - util.rpx2px(80),
            safeMarginBottomPx: util.getSafeAreaBottomPx(),
            isRefreshing: true
        })
        this.setIsHideMore7DayEnabled(wx.getStorageSync('isHideMore7DayEnabled') ?? false)
        try {
            await loginStoreUtil.initLoginStore(this)
            if (isLogin(this.getJWT())) {
                await taskStoreUtil.checkTaskStatus(this)
            }
        } catch (e: any) {
            console.error(e)
            this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            })
        } finally {
            this.setData({
                isRefreshing: false
            })
        }
    }, onUnload() {
        this.storeBindings.destroyStoreBindings()
    }, onResize() {
        this.setData({
            safeMarginBottomPx: util.getSafeAreaBottomPx()
        })
    }, errorVisibleChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            errorVisible: e.detail.visible
        })
    }, handleFabTaskClick() {
        ActionSheet.show({
            theme: ActionSheetTheme.Grid, selector: '#t-action-sheet', context: this, items: fabTaskGrid,
        });
    }, login() {
        wx.navigateTo({
            url: '/pages/login/login',
        })
    }, async onRefresh() {
        this.setData({
            isRefreshing: true
        });
        try {
            await loginStoreUtil.initLoginStore(this)
            if (isLogin(this.getJWT())) {
                await taskStoreUtil.checkTaskStatus(this)
            }
        } catch (e: any) {
            this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            })
        } finally {
            this.setData({
                isRefreshing: false
            })
        }
    }, handleFabSelected(e: WechatMiniprogram.CustomEvent) {
        switch (e.detail.selected.label) {
            case '加入团体':
                wx.navigateTo({
                    url: '/pages/subpages/join-group/join-group',
                })
                break;
            case '新建任务':
                wx.navigateTo({
                    url: '/pages/subpages/create-task/create-task',
                })
                break;
            case '刷新':
                this.onRefresh()
                break;
            default:
                break;
        }
    }
})

/**
 * 点击首页浮动按钮的弹出菜单
 */
const fabTaskGrid = [{
    label: '加入团体', icon: 'usergroup-add',
}, {
    label: '新建任务', icon: 'task-add',
}, {
    label: '刷新', icon: 'refresh',
},];