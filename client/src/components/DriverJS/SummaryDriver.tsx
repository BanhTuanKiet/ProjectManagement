import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export async function startSummaryTour(): Promise<boolean> {
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
                    element: "#projectOverview",
                    popover: {
                        title: "Project Overview",
                        description: "This section provides an overview of the project's progress.",
                        side: "top",
                        align: "center",
                    },
                },
                {
                    element: "#taskStatistics",
                    popover: {
                        title: "Task Statistics",
                        description: "This section shows the statistics of tasks by priority.",
                        side: "top",
                        align: "center",
                    },
                },
                {
                    element: "#taskSummary",
                    popover: {
                        title: "Task Summary",
                        description: "This section provides a summary of tasks by status.",
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