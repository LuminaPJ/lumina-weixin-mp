// index.ts

// @ts-ignore
import ActionSheet, {ActionSheetTheme} from 'tdesign-miniprogram/action-sheet/index';
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {store} from "../../utils/MobX";
import {EMPTY_JWT, loginStoreUtil} from "../../utils/store-utils/LoginStoreUtil"
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
            fields: [...loginStoreUtil.storeBinding.fields, ...taskStoreUtil.storeBinding.fields],
            actions: [...loginStoreUtil.storeBinding.actions, ...taskStoreUtil.storeBinding.actions]
        });
        this.getTabBar().init();
        const scrollHeightPx = util.getHeightPx()
        this.setData({
            scrollHeightPx: scrollHeightPx - util.rpx2px(80),
            safeMarginBottomPx: util.getSafeAreaBottomPx(),
            isRefreshing: true
        })
        try {
            await loginStoreUtil.initLoginStore(this)
        } catch (e: any) {
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
        // TODO: 任务列表刷新
        this.setData({
            isRefreshing: false
        });
    }, handleFabSelected(e: WechatMiniprogram.CustomEvent) {
        switch (e.detail.selected.label) {
            case '加入团体':
                wx.navigateTo({
                    url: '/pages/subpages/join-group/join-group',
                })
                break;
            case '新建日程':
                // TODO: 新建日程
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
    label: '新建日程', icon: 'task-add',
}, {
    label: '刷新', icon: 'refresh',
},];