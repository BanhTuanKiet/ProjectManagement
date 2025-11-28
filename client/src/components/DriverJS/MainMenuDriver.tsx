import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export async function startMainMenuTour(): Promise<boolean> {
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
                    element: "#dashboard",
                    popover: {
                        title: "Dashboard",
                        description: "This is your main dashboard where you can overview your projects.",
                        side: "top",
                        align: "start"
                    }
                },
                // {
                //     element: "#plans",
                //     popover: {
                //         title: "Plans",
                //         description: "Here you can manage your project plans and timelines.",
                //         side: "top",
                //         align: "start"
                //     }
                // },
                {
                    element: "#project",
                    popover: {
                        title: "Project",
                        description: "This is your project workspace where you can manage projects.",
                        side: "right",
                        align: "center"
                    }
                },
                // {
                //     element: "#teams",
                //     popover: {
                //         title: "Teams",
                //         description: "Manage your project teams and their permissions.",
                //         side: "right",
                //         align: "center"
                //     }
                // },
                {
                    element: "#create-project",
                    popover: {
                        title: "Create YourProject",
                        description: "Click here to start your project here.",
                        side: "bottom",
                        align: "center"
                    }
                },
                {
                    element: "#premium-trial",
                    popover: {
                        title: "Start Premium Trial",
                        description: "Try the premium version to experience the great features.",
                        side: "bottom",
                        align: "center"
                    }
                },
                {
                    element: "#notification",
                    popover: {
                        title: "Notifications",
                        description: "View your notifications here.",
                        side: "bottom",
                        align: "center"
                    }
                },
                {
                    element: "#user",
                    popover: {
                        title: "User Menu",
                        description: "Access your profile and settings here.",
                        side: "bottom",
                        align: "center"
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