import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export async function startCalendarTour(): Promise<boolean> {
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
                    element: "#ToolsCalendar",
                    popover: {
                        title: "Calendar Tools",
                        description: "Use these tools to navigate and manage your calendar view.",
                        side: "bottom",
                        align: "center",
                    },
                },
                {
                    element: "#CalendarDays",
                    popover: {
                        title: "Calendar Days",
                        description: "These are the days of the month. Click on a day to view or add tasks.",
                        side: "top",
                        align: "center",
                    },
                },
                {
                    element: "#AddTaskButton",
                    popover: {
                        title: "Add Task",
                        description: "Click here to add a new task on the selected date.",
                        side: "top",
                        align: "center",
                    },
                },
                {
                    element: "#TaskCard",
                    popover: {
                        title: "Task Card",
                        description: "This card represents a task scheduled for the day. You can click to view details.",
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