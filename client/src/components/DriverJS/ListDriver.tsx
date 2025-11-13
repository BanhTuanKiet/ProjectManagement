import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export async function startListTour(): Promise<boolean> {
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
                    element: "#toolsList",
                    popover: {
                        title: "Tools Section",
                        description: "This section contains various tools to find your tasks quickly.",
                        side: "top",
                        align: "center",
                    },
                },
                {
                    element: "#descriptTaskList",
                    popover: {
                        title: "Task description",
                        description: "Detailed task description.",
                        side: "top",
                        align: "center",
                    },
                },
                {
                    element: "#createTaskList",
                    popover: {
                        title: "Create Task",
                        description: "You can create more tasks for your project here.",
                        side: "top",
                        align: "center",
                    },
                },
                {
                    element: "#ClickTaskDeatailModal",
                    popover: {
                        title: "Open Task Detail Dialog",
                        description: "Clicking on the task key opens the Task Detail Modal.",
                        side: "top",
                        align: "center",
                    }
                },
                {
                    element: "#EditList",
                    popover: {
                        title: "Edit List",
                        description: "You can edit the task by clicking on any cell in the table.",
                        side: "top",
                        align: "center",
                    }
                },
                {
                    element: "#TaskDetail Modal",
                    popover: {
                        title: "Task Detail Modal",
                        description: "This modal shows detailed information about a task.",
                        side: "top",
                        align: "center",
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