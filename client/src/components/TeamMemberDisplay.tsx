
import { TeamMembers } from "@/utils/IUser";
import { UsersRound } from "lucide-react";
import { useMemo } from "react";
import ColoredAvatar from "./ColoredAvatar";
import { getRoleBadge } from "@/utils/statusUtils";
import { formatDate } from '@/utils/dateUtils'

interface TeamMembersDisplayProps {
    allMember: TeamMembers[];
    searchTeam: string;
    setSearchTeam: (search: string) => void;
}

const TeamMembersDisplay: React.FC<TeamMembersDisplayProps> = ({ allMember, searchTeam, setSearchTeam }) => {
    const grouped = useMemo(() => {
        const groups: Record<string, TeamMembers[]> = {}
        allMember.forEach(m => {
            const name = m.teamName || "No Team"
            if (!groups[name]) groups[name] = []
            groups[name].push(m)
        })
        return groups
    }, [allMember])

    const filteredGroup = Object.entries(grouped).filter(([teamName]) =>
        teamName.toLowerCase().includes(searchTeam.toLowerCase())
    )

    if (!allMember.length) {
        return (
            <div className="bg-white p-6 rounded-lg border text-center shadow-sm">
                <p className="text-gray-400">You do not have a team yet</p>
            </div>
        )
    }

    if (!filteredGroup.length && searchTeam) {
        return (
            <div className="bg-white p-6 rounded-lg border text-center shadow-sm">
                <p className="text-gray-400">No teams found with that name.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700">All Teams ({Object.keys(grouped).length})</h3>
                <input
                    type="text"
                    placeholder="Search team name..."
                    value={searchTeam}
                    onChange={e => setSearchTeam(e.target.value)}
                    className="border px-3 py-2 text-sm rounded-lg w-60 shadow-inner focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                />
            </div>

            <div className="space-y-6">
                {filteredGroup.map(([teamName, list]) => (
                    <div key={teamName} className="bg-white rounded-xl border shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl">

                        <div className="px-6 py-4 border-b bg-blue-50/70 border-blue-200">
                            <h2 className="text-xl font-bold text-blue-800 flex items-center">
                                <UsersRound className='text-2xl text-green-600' /> <span className="ml-2">{teamName}</span>
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">{list.length} members in this team.</p>
                        </div>

                        <ul className="divide-y divide-gray-100">
                            {list.map(m => (
                                <li key={m.userId} className="p-4 sm:px-6 flex items-center justify-between transition-colors duration-200 hover:bg-gray-50">
                                    <a href={`http://localhost:3000/test?email=${m.email}`} target="_blank" rel="noopener noreferrer">
                                        <div className="flex items-center space-x-4">
                                            <ColoredAvatar
                                                src={m.avatar || ""}
                                                id={m.userId}
                                                name={m.name}
                                                size="lg"
                                            />
                                            <div>
                                                <p className="font-semibold text-base text-gray-900 flex items-center">
                                                    {m.name}
                                                    {m.role && (
                                                        <span className={`${getRoleBadge(m.role)} text-xs font-bold px-3 py-1 rounded-full gap-2 ml-2`}>
                                                            Role: {m.role}
                                                        </span>
                                                    )}
                                                    {m.isOwner && (
                                                        <span className="ml-2 text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full shadow-sm">
                                                            Leader
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right flex flex-col items-end">
                                            {/* {m.role && (
                                                <span className={`${getRoleBadge(m.role)} text-xs font-bold px-3 py-1 rounded-full`}>
                                                    Role: {m.role}
                                                </span>
                                            )} */}
                                            {/* <p className="text-xs text-gray-400 mt-1">
                                                Joined: {m.joinedAt ? formatDate(m.joinedAt) : 'N/A'}
                                            </p> */}
                                        </div>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TeamMembersDisplay;