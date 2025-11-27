import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export async function startBackLogTour(): Promise<boolean> {
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
                    element: "#inforSprint",
                    popover: {
                        title: "Sprint Information",
                        description: "View details about the current sprint, including sprint name, start date, end date, and overall team progress.",
                        side: "bottom",
                        align: "start",
                    }
                },
                {
                    element: "#numberStatusTask",
                    popover: {
                        title: "Task Status Overview",
                        description: "Track the number of tasks in each status such as To Do, In Progress and Done to grasp work progress.",
                        side: "bottom",
                        align: "start",
                    }
                },
                {
                    element: "#backlogSection",
                    popover: {
                        title: "Backlog Section",
                        description: "List of all tasks that are not assigned to a sprint. You can drag and drop tasks into a sprint to start working on them.",
                        side: "bottom",
                        align: "start",
                    }
                }

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