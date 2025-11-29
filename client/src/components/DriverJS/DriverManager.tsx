'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { startMainMenuTour } from "@/components/DriverJS/MainMenuDriver";
import { startBoardTour } from "@/components/DriverJS/BoardDriver";
import { startSummaryTour } from "@/components/DriverJS/SummaryDriver";
import { startCalendarTour } from "@/components/DriverJS/CalendarDriver";
import { startListTour } from "@/components/DriverJS/ListDriver";
import { startBackLogTour } from "@/components/DriverJS/BackLogDriver";
import { startMemberTour } from "./MemberDriver";
import { startTimeLineTour } from "./TimeLineDriver";
import { startTrashTour } from "./TrashDriver";
import { useProject } from "@/app/(context)/ProjectContext";

export default function DriverManager() {
    const router = useRouter();
    const { projectRole, projects } = useProject()


    useEffect(() => {

        if (!projects || projects.length === 0) {
            console.log("Projects not ready yet...");
            return;
        }
        const projectId = projects[0]?.projectId;
        console.log("/ProjectID: ", projectId)

        if (!projectId) {
            console.log("Project NULL");
            return;
        }

        const runToursSequentially = async () => {
            const tours = [
                {
                    key: "hasSeenMainMenu",
                    fn: startMainMenuTour,
                    hash: "",
                    time: 1000
                },
                {
                    key: "hasSeenSummaryTour",
                    fn: startSummaryTour,
                    hash: "",
                    time: 1500
                },
                {
                    key: "hasSeenMemberTour",
                    fn: startMemberTour,
                    hash: "#member",
                    time: 1000
                },
                {
                    key: "hasSeenTimeLineTour",
                    fn: startTimeLineTour,
                    hash: "#timeline",
                    time: 1000
                },
                {
                    key: "hasSeenBackLogTour",
                    fn: startBackLogTour,
                    hash: "#backlog",
                    time: 1000
                },
                {
                    key: "hasSeenBoardTour",
                    fn: startBoardTour,
                    hash: "#board",
                    time: 1000
                },
                {
                    key: "hasSeenCalendarTour",
                    fn: startCalendarTour,
                    hash: "#calendar",
                    time: 1000
                },
                {
                    key: "hasSeenListTour",
                    fn: startListTour,
                    hash: "#list",
                    time: 1500
                },
                {
                    key: "hasSeenTrashTour",
                    fn: startTrashTour,
                    hash: "#trash",
                    time: 1000
                }
            ];
            // router.push(`http://localhost:3000/project/${projects[0]?.projectId}`);

            for (const tour of tours) {
                if (Number.isNaN(projectId)) break
                // if (tour.key == "hasSeenMainMenu")
                // router.push(`http://localhost:3000/project/${projects[0]?.projectId}`)
                if (localStorage.getItem(tour.key)) continue;
                if (projectRole?.trim().toLowerCase() === "member" && tour.key == "hasSeenMemberTour")
                    continue

                if (tour.hash) {
                    window.location.hash = tour.hash;
                    await new Promise(resolve => setTimeout(resolve, tour.time));
                }

                const tourCompleted = await tour.fn();
                if (!tourCompleted) break;

                localStorage.setItem(tour.key, "true");
            }
        };

        runToursSequentially();
    }, [router, projects]);

    return null;
}