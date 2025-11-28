import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export async function startTimeLineTour(): Promise<boolean> {
    return new Promise((resolve) => {
        const driverjs = driver({
            allowClose: true,
            showProgress: true,
            animate: true,
            doneBtnText: 'Done',
            nextBtnText: 'Next',
            prevBtnText: 'Previous',
            steps: [
                {
                    element: "#ProjectTimeline",
                    popover: {
                        title: "Project Timeline",
                        description: "View project time by day, week, month",
                        side: "bottom",
                        align: "center",
                    },
                },
                {
                    element: "#TableTimeline",
                    popover: {
                        title: "Task Timeline",
                        description: "View task execution times visually.",
                        side: "top",
                        align: "center",
                    },
                },
            ],
            onDestroyed: () => {
                resolve(true);
            },
            onCloseClick: () => {
                driverjs.destroy();
                resolve(false);
            }
        });
        driverjs.drive();
    });
}