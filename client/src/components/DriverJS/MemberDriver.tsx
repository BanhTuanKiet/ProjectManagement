import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export async function startMemberTour(): Promise<boolean> {
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
                    element: "#featureMember",
                    popover: {
                        title: "Feature Member",
                        description: "This section provides functions for filtering, inviting members, creating teams, changing leaders, and deleting members.",
                        side: "bottom",
                        align: "center",
                    },
                },
                {
                    element: "#tableMember",
                    popover: {
                        title: "Table Member",
                        description: "This section shows the members of the project and has three vertical dots to perform actions.",
                        side: "left",
                        align: "start",
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