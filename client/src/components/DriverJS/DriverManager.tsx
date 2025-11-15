'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { startMainMenuTour } from "@/components/DriverJS/MainMenuDriver";
import { startBoardTour } from "@/components/DriverJS/BoardDriver";
import { startSummaryTour } from "@/components/DriverJS/SummaryDriver";
import { startCalendarTour } from "@/components/DriverJS/CalendarDriver";
import { startListTour } from "@/components/DriverJS/ListDriver";
import { startBackLogTour } from "@/components/DriverJS/BackLogDriver";

export default function DriverManager() {
    const router = useRouter();

    useEffect(() => {
        const runToursSequentially = async () => {
            const tours = [
                {
                    key: "hasSeenMainMenu",
                    fn: startMainMenuTour,
                    hash: "/1",
                    time: 500
                },
                {
                    key: "hasSeenSummaryTour",
                    fn: startSummaryTour,
                    hash: "",
                    time: 1500
                },
                {
                    key: "hasSeenBackLogTour",
                    fn: startBackLogTour,
                    hash: "#backlog",
                    time: 1000
                },
                {
                    key: "hasSeenBoardTour",
                    fn: startBoardTour,
                    hash: "#board",
                    time: 500
                },
                {
                    key: "hasSeenCalendarTour",
                    fn: startCalendarTour,
                    hash: "#calendar",
                    time: 1000
                },
                {
                    key: "hasSeenListTour",
                    fn: startListTour,
                    hash: "#list",
                    time: 11000
                }
            ];
            router.push("http://localhost:3000/project/1");

            for (const tour of tours) {
                if (localStorage.getItem(tour.key)) continue;

                // Điều hướng đến route
                // router.push(tour.route);

                // Đợi một chút để trang render xong
                // await new Promise(resolve => setTimeout(resolve, 500));
                if (tour.hash) {
                    window.location.hash = tour.hash;
                    await new Promise(resolve => setTimeout(resolve, tour.time));
                }

                const tourCompleted = await tour.fn();
                if (!tourCompleted) break;

                localStorage.setItem(tour.key, "true");
            }
        };

        runToursSequentially();
    }, [router]);

    return null;
}