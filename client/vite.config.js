import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: [["babel-plugin-react-compiler"]],
            },
        }),
        tailwindcss(),
        {
            name: 'startup-log',
            configureServer(server) {
                if (process.env.NODE_ENV === 'development') {
                    server.httpServer?.once("listening", () => {
                        console.log("Site url: http://www.127.0.0.1.sslip.io:5173/")
                    })
                }
            }
        }
    ],
    server: {
        host: "0.0.0.0",
        port: 5173,
        allowedHosts: ["www.127.0.0.1.sslip.io", "www.192.168.1.119.sslip.io"],
    },
    resolve: {
        alias: {
            "@src": path.resolve(__dirname, "./src"),
            "@assets": path.resolve(__dirname, "./src/assets"),
            "@icons": path.resolve(__dirname, "./src/assets/icons"),
            "@features": path.resolve(__dirname, "./src/features"),
            "@lib": path.resolve(__dirname, "./src/lib"),
            "@api": path.resolve(__dirname, "./src/lib/api"),
        },
    },
});
