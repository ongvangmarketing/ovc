import { Zalo } from "zca-js";

const zalo = new Zalo({ logging: false }, { checkUpdate: false });
zalo.loginQR({}, (event: any) => {
    if (event.type === 0) {
        console.log("QR GENERATED");
        console.log("Type of image:", typeof event.data.image);
        if (typeof event.data.image === "string") {
            console.log("Image length:", event.data.image.length);
            console.log("Image starts with:", event.data.image.substring(0, 50));
        } else if (Buffer.isBuffer(event.data.image)) {
            console.log("Image is buffer");
        } else {
            console.log("Image is something else", event.data.image);
        }
        process.exit(0);
    }
});
