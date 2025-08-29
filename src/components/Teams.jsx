import { useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import toast from "react-hot-toast";
import { InfoIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { showOverlayLoadingAtom } from "@/config/state";
import apiClient from "@/lib/apiClient";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/shadcn";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import useAuth from "@/hooks/useAuth";

function Teams() {
  const { currentUser, updateUser } = useAuth();

  const setOverlayLoading = useSetAtom(showOverlayLoadingAtom);

  const [sendLoading, setSendLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTeamAdmin, setIsTeamAdmin] = useState(false);

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    setLoading(true);

    const { data, ok } = await apiClient.get("/teams");
    setLoading(false);

    if (!ok)
      return toast.error(
        data || "An error occured while fetching the team members"
      );

    let newTeamMembers = [...data.members];

    console.log(currentUser);
    setIsTeamAdmin(
      data.members.find((member) => member.isAdmin)?.userId == currentUser.id
    );
    setTeamMembers(newTeamMembers);
  };

  const invite = async () => {
    setSendLoading(true);

    const { data, ok } = await apiClient.post("/teams/invite", {
      email: inviteEmail,
    });
    setSendLoading(false);

    if (!ok)
      return toast.error(data || "An error occured while inviting the user");

    let newTeamMembers = [...teamMembers];
    if (
      newTeamMembers.find(
        (member) => member.userId == data.newTeamMember.userId
      )
    )
      newTeamMembers = newTeamMembers.map((member) =>
        member.userId == data.newTeamMember.userId ? data.newTeamMember : member
      );
    else newTeamMembers.push(data.newTeamMember);

    setTeamMembers(newTeamMembers);
    setInviteEmail("");
    toast.success("User has been successfully invited");
  };

  const remove = async (userId) => {
    setOverlayLoading(true);

    const { data, ok } = await apiClient.post("/teams/remove", {
      teamId: teamMembers[0]?.teamId,
      userId,
    });
    setOverlayLoading(false);

    if (!ok) return toast.error(data || "An error occured.");

    let newTeamMembers = [...teamMembers];

    if (!isTeamAdmin) {
      newTeamMembers = [
        {
          id: currentUser.id,
          status: "accepted",
          teamId: currentUser.id,
          userId: currentUser.id,
          user: {
            email: currentUser.email,
          },
          isAdmin: true,
        },
      ];
    } else {
      newTeamMembers = newTeamMembers.filter(
        (member) => member.userId != userId
      );
    }

    setTeamMembers(newTeamMembers);

    // update the user profile if he leaves a team
    if (userId == currentUser.id) updateUser();
  };

  const saveTeamUsage = async () => {
    setOverlayLoading(true);

    const { data, ok } = await apiClient.post("/team/update-usage", {
      teamMembers: teamMembers.filter((member) => !member.isAdmin),
    });
    setOverlayLoading(false);

    if (!ok) return toast.error(data?.message || "Something went wrong");

    toast.success("Team usage has been successfully updated");
  };

  return (
    <div className="flex flex-col gap-6">
      {!currentUser?.team && (
        <section className="rounded-lg border border-slate-6">
          <div className="border-b border-slate-6 p-4">
            <h1 className="text-base text-slate-12 font-bold">Invite member</h1>
          </div>

          <div>
            <div className="mb-2 flex max-w-md flex-col gap-2 p-4">
              <label htmlFor="email" className="text-sm text-slate-11">
                Email address
              </label>

              <Input
                name="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>

            <div className="flex border-t border-slate-6 px-4 py-3">
              <Button
                className="text-sm h-8 pl-3 pr-3 rounded-md gap-1 font-semibold bg-primary-blue text-white border-slate-6 hover:bg-black/90 focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:outline-none focus-visible:bg-black/90 disabled:hover:bg-black inline-flex items-center border justify-center disabled:cursor-not-allowed disabled:opacity-70 transition ease-in-out duration-200 cursor-pointer"
                data-state="disabled"
                type="submit"
                isLoading={sendLoading}
                text="Invite"
                onClick={() => invite()}
              ></Button>
            </div>
          </div>
        </section>
      )}

      <section>
        <div>
          {loading ? (
            <div className="flex justify-center p-10 rounded-lg border border-slate-6">
              <Loading className="text-black" />
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-slate-6 overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr>
                      <th className="p-4 text-sm text-start border-b border-b-gray-200 dark:border-b-gray-800">
                        Email
                      </th>
                      <th className="p-4 text-sm text-start border-b border-b-gray-200 dark:border-b-gray-800">
                        Role
                      </th>
                      <th className="p-4 text-sm text-start border-b border-b-gray-200 dark:border-b-gray-800">
                        Status
                      </th>
                      {isTeamAdmin && (
                        <>
                          <th className="p-4 text-sm text-start border-b border-b-gray-200 dark:border-b-gray-800">
                            Usage
                          </th>

                          <th className="p-4 text-sm text-start border-b border-b-gray-200 dark:border-b-gray-800 flex items-center gap-2">
                            Limit
                            {/* trigger the popover on hover */}
                            <HoverCard openDelay={100}>
                              <HoverCardTrigger className="cursor-pointer">
                                <InfoIcon size={15} className="text-gray-500" />
                              </HoverCardTrigger>
                              <HoverCardContent>
                                <p className="font-normal">
                                  The limit is the maximum number of queries
                                  that a user can make per month.
                                </p>

                                <p className="font-normal mt-2">
                                  <span className="font-bold">Note:</span>
                                  <span className="ml-1">
                                    0 means unlimited.
                                  </span>
                                </p>
                              </HoverCardContent>
                            </HoverCard>
                          </th>
                        </>
                      )}
                      <th className="p-4 text-sm text-start border-b border-b-gray-200 dark:border-b-gray-800">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="pt-5">
                    {teamMembers.map((member, idx) => (
                      <tr key={idx}>
                        <td
                          className={cn(
                            "text-sm text-slate-12 font-semibold px-4 py-2"
                          )}
                        >
                          {member.user.email}
                        </td>
                        <td className="capitalize text-xs font-medium px-4 py-2">
                          {member.teamId == member.userId ? "admin" : "member"}
                        </td>
                        <td className="capitalize px-4 py-2">
                          {!member.isAdmin ? (
                            <Badge
                              variant={
                                member.status == "pending"
                                  ? "secondary"
                                  : member.status == "accepted"
                                  ? "green"
                                  : "red"
                              }
                            >
                              {member.status}
                            </Badge>
                          ) : (
                            <p>-</p>
                          )}
                        </td>
                        {isTeamAdmin && (
                          <>
                            <td className="capitalize text-xs font-medium px-4 py-2">
                              {member?.proQueriesCount}
                            </td>

                            {member.isAdmin ? (
                              <td> </td>
                            ) : (
                              <td className="capitalize text-xs font-medium px-4 py-2">
                                <Input
                                  type="number"
                                  value={member?.proQueriesLimit || "0"}
                                  onChange={(e) => {
                                    let newTeamMembers = [...teamMembers];
                                    newTeamMembers[idx].proQueriesLimit =
                                      parseInt(e.target.value);
                                    setTeamMembers(newTeamMembers);
                                  }}
                                  className="!w-20"
                                />
                              </td>
                            )}
                          </>
                        )}
                        <td className="px-4 py-2">
                          {currentUser.id == member.userId &&
                          !member.isAdmin ? (
                            <Button
                              className="text-sm h-8 pl-3 pr-3 rounded-md gap-1 font-semibold bg-red-600 text-white border-slate-6 hover:bg-black/90 focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:outline-none focus-visible:bg-black/90 disabled:hover:bg-black inline-flex items-center border justify-center disabled:cursor-not-allowed disabled:opacity-70 transition ease-in-out duration-200 cursor-pointer"
                              text="Leave"
                              onClick={() => remove(member.userId)}
                            ></Button>
                          ) : isTeamAdmin && !member.isAdmin ? (
                            <Button
                              className="text-sm h-8 pl-3 pr-3 rounded-md gap-1 font-semibold bg-red-600 text-white border-slate-6 hover:bg-black/90 focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:outline-none focus-visible:bg-black/90 disabled:hover:bg-black inline-flex items-center border justify-center disabled:cursor-not-allowed disabled:opacity-70 transition ease-in-out duration-200 cursor-pointer"
                              text="Remove"
                              onClick={() => remove(member.userId)}
                            ></Button>
                          ) : (
                            <p>-</p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {isTeamAdmin && teamMembers.length > 1 && (
                <div className="flex justify-end">
                  <Button
                    text="Save Usage"
                    className="mt-5 bg-primary-blue text-white !rounded-md"
                    onClick={() => saveTeamUsage()}
                  ></Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default Teams;
