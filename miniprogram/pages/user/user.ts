/**
 * Copyright (c) 2025 LuminaPJ
 * SM2 Key Generator is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {store, StoreInstance} from "../../utils/MobX";
import {EMPTY_JWT, isLogin, loginStoreUtil} from "../../utils/store-utils/LoginStoreUtil";
import {userInfoStoreUtil} from "../../utils/store-utils/UserInfoUtil";
import {groupStoreUtil} from "../../utils/store-utils/GroupStoreUtil";
import {getErrorMessage} from "../../utils/CommonUtil";
import {agreementBadgeStoreUtil} from "../../utils/store-utils/AgreementBadgeStoreUtil";

const util = require('../../utils/CommonUtil');

interface IData {
    EMPTY_JWT: string
    scrollHeightPx: number
    isRefreshing: boolean
}

Page<IData, StoreInstance>({
    data: {
        EMPTY_JWT: EMPTY_JWT, isRefreshing: true
    }, async onLoad() {
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: [...loginStoreUtil.storeBinding.fields, ...userInfoStoreUtil.storeBinding.fields, ...groupStoreUtil.storeBinding.fields, ...agreementBadgeStoreUtil.storeBinding.fields],
            actions: [...loginStoreUtil.storeBinding.actions, ...userInfoStoreUtil.storeBinding.actions, ...groupStoreUtil.storeBinding.actions, ...agreementBadgeStoreUtil.storeBinding.actions]
        });
        this.getTabBar().init();
        const scrollHeightPx = util.getHeightPx()
        this.setData({
            scrollHeightPx: scrollHeightPx - util.rpx2px(80), isRefreshing: true
        })
        try {
            await loginStoreUtil.initLoginStore(this)
            if (isLogin(this.getJWT())) {
                await userInfoStoreUtil.checkUserInfoStatus(this)
                await groupStoreUtil.checkGroupStatus(this)
                await agreementBadgeStoreUtil.checkAgreementBadgeStatus(this)
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
    }, onReady() {
        const scrollHeightPx = util.getHeightPx()
        this.setData({
            scrollHeightPx: scrollHeightPx - util.rpx2px(80)
        })
    }, onResize() {
        const scrollHeightPx = util.getHeightPx()
        this.setData({
            scrollHeightPx: scrollHeightPx - util.rpx2px(80)
        })
    }, onUnload() {
        if (this.storeBindings) this.storeBindings.destroyStoreBindings();
    }, async onShow(){
        await this.onRefresh()
    }, errorVisibleChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            errorVisible: e.detail.visible
        })
    }, clickGroupManagement() {
        wx.navigateTo({
            url: '/pages/subpages/group-management/group-management',
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
        try {
            await loginStoreUtil.initLoginStore(this)
            if (isLogin(this.getJWT())) {
                await userInfoStoreUtil.checkUserInfoStatus(this)
                await groupStoreUtil.checkGroupStatus(this)
                await agreementBadgeStoreUtil.checkAgreementBadgeStatus(this)
            }
        } catch (e: any) {
            this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            })
        } finally {
            this.setData({
                isRefreshing: false
            });
        }
    },
})

