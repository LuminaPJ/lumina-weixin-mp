export const formatTime = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return ([year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':'))
}

const formatNumber = (n: number) => {
    const s = n.toString()
    return s[1] ? s : '0' + s
}

// rpx to px
export const rpx2px = (rpx: number): number => {
    return Math.round(rpx / 750 * wx.getWindowInfo().windowWidth)
}

// px to rpx
export const px2rpx = (px: number): number => {
    return Math.round(px / wx.getWindowInfo().windowWidth * 750)
}

export const getHeightPx = (): number => {
    const windowInfo = wx.getWindowInfo()
    const safeAreaHeight = windowInfo.safeArea.height
    if (safeAreaHeight === 0 && safeAreaHeight === undefined) return windowInfo.windowHeight
    return safeAreaHeight
}

export const getSafeAreaBottomPx = (): number => {
    const windowInfo = wx.getWindowInfo()
    const safeAreaBottom = windowInfo.screenHeight - windowInfo.safeArea.bottom
    if (safeAreaBottom === 0 && safeAreaBottom === undefined) return 0
    return safeAreaBottom
}

export const isNullOrEmptyOrUndefined=(value: any): boolean => {
    return value === null || value === undefined || value === ''
}


