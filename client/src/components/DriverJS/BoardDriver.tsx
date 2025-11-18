import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export async function startBoardTour(): Promise<boolean> {
    return new Promise((resolve) => {

        const driverObj = driver({
            allowClose: true,
            showProgress: true,
            animate: true,
            nextBtnText: "Next",
            prevBtnText: "Previous",
            doneBtnText: "Done",
            overlayOpacity: 0.7,
            steps: [
                // BoardView Tour Steps
                {
                    element: "#searchTask",
                    popover: {
                        title: "Search Task",
                        description: "You can type the task name to filter quickly.",
                        side: "bottom",
                        align: "start",
                    },
                },
                {
                    element: "#column-Todo",
                    popover: {
                        title: "Todo Column",
                        description: "Tasks that are newly created or not started will be here.",
                        side: "right",
                        align: "start",
                    },
                },
                {
                    element: "#column-In Progress",
                    popover: {
                        title: "In Progress Column",
                        description: "Drag tasks here when you are working on them.",
                        side: "top",
                        align: "center",
                    },
                },
                {
                    element: "#column-Done",
                    popover: {
                        title: "Done Column",
                        description: "Tasks that are completed will be displayed here.",
                        side: "top",
                        align: "center",
                    },
                },
                {
                    element: "#create-Todo",
                    popover: {
                        title: "Create New Task",
                        description: "Click this button to add a new task to the project.",
                        side: "bottom",
                        align: "start",
                    },
                },
                {
                    element: "#boardArea",
                    popover: {
                        title: "Drag & Drop",
                        description: "You can drag tasks between columns to change their status.",
                        side: "top",
                        align: "center",
                    },
                },
            ],
            onDestroyed: () => {
                resolve(true);
            },
            onCloseClick: () => {
                driverObj.destroy(); // cần gọi để kích hoạt onDestroyed
                resolve(false); // Người dùng bỏ qua
            },
        });
        driverObj.drive();
    });
}