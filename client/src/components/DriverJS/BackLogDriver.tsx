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
                        description: "Theo dõi số lượng task ở từng trạng thái như To Do, In Progress và Done để nắm bắt tiến độ làm việc.",
                        side: "bottom",
                        align: "start",
                    }
                },
                {
                    element: "#backlogSection",
                    popover: {
                        title: "Backlog Section",
                        description: "Danh sách tất cả các công việc chưa được gán vào sprint. Bạn có thể kéo thả task vào sprint để bắt đầu thực hiện.",
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