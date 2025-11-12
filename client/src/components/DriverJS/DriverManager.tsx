'use client';
import { useEffect } from "react";
import { startMainMenuTour } from "@/components/DriverJS/MainMenuDriver";
import { startBoardTour } from "@/components/DriverJS/BoardDriver";

export default function DriverManager() {
    useEffect(() => {
        const runToursSequentially = async () => {
            const tours = [
                { key: "hasSeenMainMenu", fn: startMainMenuTour },
                { key: "hasSeenBoardTour", fn: startBoardTour },
            ];

            for (const { key, fn } of tours) {
                if (!localStorage.getItem(key)) {
                    await fn();
                    localStorage.setItem(key, "true");
                }
            }
        };

        runToursSequentially();
    }, []);

    return null;
}
