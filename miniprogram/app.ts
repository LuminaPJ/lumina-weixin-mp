// app.ts

interface IAppOption {
    globalData: {
        LUMINA_VERSION?: string;
    };
}

App<IAppOption>({
    globalData: {
        LUMINA_VERSION: "0.0.1"
    }, onLaunch() {
    },
})