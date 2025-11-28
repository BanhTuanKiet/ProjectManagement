import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export async function startTrashTour(): Promise<boolean> {
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
                    element: "#featureTrash",
                    popover: {
                        title: "Feature Trash",
                        description: "This section provides functions for filtering and restored task.",
                        side: "bottom",
                        align: "start",
                    }
                },
                {
                    element: "#tableTrash",
                    popover: {
                        title: "Deleted Task Details",
                        description: "This section displays details about the deleted project tasks.",
                        side: "bottom",
                        align: "start",
                    }
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